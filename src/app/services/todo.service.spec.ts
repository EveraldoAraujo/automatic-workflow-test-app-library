import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should be created with an empty list', () => {
    expect(service).toBeTruthy();
    expect(service.todos()).toEqual([]);
  });

  it('should add a todo', () => {
    service.add('Comprar leite');

    const todos = service.todos();
    expect(todos.length).toBe(1);
    expect(todos[0].title).toBe('Comprar leite');
    expect(todos[0].completed).toBe(false);
    expect(todos[0].id).toBeTruthy();
  });

  it('should trim titles and ignore empty input', () => {
    service.add('  Estudar Angular  ');
    service.add('   ');

    const todos = service.todos();
    expect(todos.length).toBe(1);
    expect(todos[0].title).toBe('Estudar Angular');
  });

  it('should toggle a todo completion state', () => {
    service.add('Correr');
    const id = service.todos()[0].id;

    service.toggle(id);
    expect(service.todos()[0].completed).toBe(true);
    expect(service.pendingCount()).toBe(0);

    service.toggle(id);
    expect(service.todos()[0].completed).toBe(false);
    expect(service.pendingCount()).toBe(1);
  });

  it('should remove a todo', () => {
    service.add('Item 1');
    service.add('Item 2');
    const id = service.todos()[0].id;

    service.remove(id);

    const todos = service.todos();
    expect(todos.length).toBe(1);
    expect(todos[0].title).toBe('Item 2');
  });

  it('should compute the pending count', () => {
    service.add('A');
    service.add('B');
    service.add('C');

    expect(service.pendingCount()).toBe(3);

    service.toggle(service.todos()[1].id);
    expect(service.pendingCount()).toBe(2);
  });
});
