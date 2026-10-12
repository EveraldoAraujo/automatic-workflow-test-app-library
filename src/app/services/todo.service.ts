import { Injectable, computed, signal } from '@angular/core';
import { Todo } from '../models/todo';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly _todos = signal<Todo[]>([]);

  readonly todos = this._todos.asReadonly();
  readonly pendingCount = computed(
    () => this._todos().filter((todo) => !todo.completed).length,
  );

  add(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    const todo: Todo = {
      id: this.generateId(),
      title: trimmed,
      completed: false,
    };

    this._todos.update((todos) => [...todos, todo]);
  }

  toggle(id: string): void {
    this._todos.update((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  remove(id: string): void {
    this._todos.update((todos) => todos.filter((todo) => todo.id !== id));
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
