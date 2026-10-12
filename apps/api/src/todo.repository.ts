import type { Todo } from '@mono/shared';

export interface CreateTodoInput {
  id: string;
  title: string;
  completed: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

/**
 * Abstraction over storage so the in-memory implementation can be swapped
 * for a database later without touching the HTTP layer.
 */
export interface TodoRepository {
  list(): Todo[];
  findById(id: string): Todo | undefined;
  create(input: CreateTodoInput): Todo;
  update(id: string, input: UpdateTodoInput): Todo | undefined;
  remove(id: string): boolean;
}

/**
 * VOLATILE in-memory persistence: data is lost on restart.
 * Auth is intentionally absent in this phase (local/dev usage only).
 */
export class InMemoryTodoRepository implements TodoRepository {
  private readonly items = new Map<string, Todo>();

  list(): Todo[] {
    return [...this.items.values()];
  }

  findById(id: string): Todo | undefined {
    return this.items.get(id);
  }

  create(input: CreateTodoInput): Todo {
    const todo: Todo = {
      id: input.id,
      title: input.title,
      completed: input.completed,
    };
    this.items.set(todo.id, todo);
    return todo;
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const current = this.items.get(id);
    if (!current) {
      return undefined;
    }
    const next: Todo = {
      ...current,
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.completed === undefined ? {} : { completed: input.completed }),
    };
    this.items.set(id, next);
    return next;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }
}
