import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Todo } from '@mono/shared';
import { TodoService } from '../../services/todo.service';

type TodoFilter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList {
  private readonly todoService = inject(TodoService);

  protected readonly filters: { label: string; value: TodoFilter }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Ativas', value: 'active' },
    { label: 'Concluídas', value: 'completed' },
  ];

  protected readonly newTodo = signal('');
  protected readonly filter = signal<TodoFilter>('all');

  protected readonly todos = this.todoService.todos;
  protected readonly pendingCount = this.todoService.pendingCount;
  protected readonly loading = this.todoService.loading;
  protected readonly error = this.todoService.error;
  protected readonly visibleTodos = computed<Todo[]>(() => {
    const todos = this.todos();
    switch (this.filter()) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  });

  onInput(value: string): void {
    this.newTodo.set(value);
  }

  async addTodo(): Promise<void> {
    const title = this.newTodo().trim();
    if (!title) {
      return;
    }
    this.newTodo.set('');
    await this.todoService.add(title);
  }

  async toggleTodo(id: string): Promise<void> {
    await this.todoService.toggle(id);
  }

  async removeTodo(id: string): Promise<void> {
    await this.todoService.remove(id);
  }

  setFilter(filter: TodoFilter): void {
    this.filter.set(filter);
  }

  dismissError(): void {
    this.todoService.clearError();
  }
}
