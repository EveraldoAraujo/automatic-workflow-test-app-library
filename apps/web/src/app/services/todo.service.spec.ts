import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

const API = '/api/todos';

describe('TodoService', () => {
  let service: TodoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TodoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created with an empty list', () => {
    expect(service).toBeTruthy();
    expect(service.todos()).toEqual([]);
  });

  it('should load todos from the API', async () => {
    const promise = service.load();
    http.expectOne(API).flush([{ id: '1', title: 'Comprar leite', completed: false }]);
    await promise;

    expect(service.todos().length).toBe(1);
    expect(service.todos()[0].title).toBe('Comprar leite');
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should expose an error when loading fails', async () => {
    const promise = service.load();
    http.expectOne(API).flush('boom', { status: 500, statusText: 'Server Error' });
    await promise;

    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBe(false);
    expect(service.todos()).toEqual([]);
  });

  it('should add a todo optimistically and reconcile the server response', async () => {
    const promise = service.add('  Comprar leite  ');
    expect(service.todos().length).toBe(1);
    expect(service.todos()[0].title).toBe('Comprar leite');

    const req = http.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Comprar leite' });
    req.flush({ id: 'server-1', title: 'Comprar leite', completed: false });
    await promise;

    expect(service.todos().length).toBe(1);
    expect(service.todos()[0].id).toBe('server-1');
  });

  it('should ignore empty titles', async () => {
    await service.add('   ');
    expect(service.todos()).toEqual([]);
    http.expectNone(API);
  });

  it('should roll back an optimistic add when the request fails', async () => {
    const promise = service.add('Que vai falhar');
    http.expectOne(API).flush('nope', { status: 500, statusText: 'Server Error' });
    await promise;

    expect(service.todos()).toEqual([]);
    expect(service.error()).toBeTruthy();
  });

  it('should toggle a todo completion state', async () => {
    const load = service.load();
    http.expectOne(API).flush([{ id: '1', title: 'Correr', completed: false }]);
    await load;

    const promise = service.toggle('1');
    // Optimistic update is applied immediately.
    expect(service.todos()[0].completed).toBe(true);

    const req = http.expectOne(`${API}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ completed: true });
    req.flush({ id: '1', title: 'Correr', completed: true });
    await promise;

    expect(service.todos()[0].completed).toBe(true);
    expect(service.pendingCount()).toBe(0);
  });

  it('should roll back a toggle when the request fails', async () => {
    const load = service.load();
    http.expectOne(API).flush([{ id: '1', title: 'Correr', completed: false }]);
    await load;

    const promise = service.toggle('1');
    http.expectOne(`${API}/1`).flush('nope', { status: 500, statusText: 'Server Error' });
    await promise;

    expect(service.todos()[0].completed).toBe(false);
    expect(service.error()).toBeTruthy();
  });

  it('should remove a todo and restore it on failure', async () => {
    const load = service.load();
    http.expectOne(API).flush([{ id: '1', title: 'Item 1', completed: false }]);
    await load;

    const promise = service.remove('1');
    expect(service.todos().length).toBe(0);
    const req = http.expectOne(`${API}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 500, statusText: 'Server Error' });
    await promise;

    expect(service.todos().length).toBe(1);
    expect(service.error()).toBeTruthy();
  });

  it('should compute the pending count', async () => {
    const load = service.load();
    http.expectOne(API).flush([
      { id: '1', title: 'A', completed: false },
      { id: '2', title: 'B', completed: false },
    ]);
    await load;

    expect(service.pendingCount()).toBe(2);

    const promise = service.toggle('2');
    http.expectOne(`${API}/2`).flush({ id: '2', title: 'B', completed: true });
    await promise;

    expect(service.pendingCount()).toBe(1);
  });
});
