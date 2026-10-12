import { Injectable, computed, inject, signal } from '@angular/core';
import type { Todo } from '@mono/shared';
import { firstValueFrom } from 'rxjs';
import { TodoApiService } from './todo-api.service';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly api = inject(TodoApiService);

  private readonly _todos = signal<Todo[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  /** Monotonic token used to discard stale responses (race conditions). */
  private requestToken = 0;

  readonly todos = this._todos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pendingCount = computed(() => this._todos().filter((todo) => !todo.completed).length);

  /** Loads the collection from the API, discarding any stale in-flight result. */
  async load(): Promise<void> {
    const token = ++this.requestToken;
    this._loading.set(true);
    this._error.set(null);
    try {
      const todos = await firstValueFrom(this.api.list());
      if (token !== this.requestToken) {
        return;
      }
      this._todos.set(todos);
    } catch {
      if (token !== this.requestToken) {
        return;
      }
      this._error.set('Não foi possível carregar as tarefas.');
    } finally {
      if (token === this.requestToken) {
        this._loading.set(false);
      }
    }
  }

  async add(title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    // Optimistic update with a temporary id, rolled back on failure.
    const optimistic: Todo = {
      id: `temp-${this.tempId()}`,
      title: trimmed,
      completed: false,
    };
    this._todos.update((todos) => [...todos, optimistic]);
    this._error.set(null);

    try {
      const created = await firstValueFrom(this.api.create({ title: trimmed }));
      this._todos.update((todos) =>
        todos.map((todo) => (todo.id === optimistic.id ? created : todo)),
      );
    } catch {
      this._todos.update((todos) => todos.filter((todo) => todo.id !== optimistic.id));
      this._error.set('Não foi possível adicionar a tarefa.');
    }
  }

  async toggle(id: string): Promise<void> {
    const current = this._todos().find((todo) => todo.id === id);
    if (!current) {
      return;
    }

    const nextCompleted = !current.completed;
    this._todos.update((todos) =>
      todos.map((todo) => (todo.id === id ? { ...todo, completed: nextCompleted } : todo)),
    );
    this._error.set(null);

    try {
      const updated = await firstValueFrom(this.api.update(id, { completed: nextCompleted }));
      this._todos.update((todos) => todos.map((todo) => (todo.id === id ? updated : todo)));
    } catch {
      // Roll back to the previous state.
      this._todos.update((todos) =>
        todos.map((todo) => (todo.id === id ? { ...todo, completed: current.completed } : todo)),
      );
      this._error.set('Não foi possível atualizar a tarefa.');
    }
  }

  async remove(id: string): Promise<void> {
    const index = this._todos().findIndex((todo) => todo.id === id);
    if (index === -1) {
      return;
    }
    const current = this._todos()[index];

    this._todos.update((todos) => todos.filter((todo) => todo.id !== id));
    this._error.set(null);

    try {
      await firstValueFrom(this.api.remove(id));
    } catch {
      // Restore the removed item at its original position to preserve ordering.
      this._todos.update((todos) => {
        const restored = [...todos];
        restored.splice(Math.min(index, restored.length), 0, current);
        return restored;
      });
      this._error.set('Não foi possível remover a tarefa.');
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  private tempId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
