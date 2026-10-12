import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoService } from '../../services/todo.service';
import { TodoList } from './todo-list';

const API = '/api/todos';

describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let component: TodoList;
  let service: TodoService;
  let http: HttpTestingController;

  const flushList = (todos: { id: string; title: string; completed: boolean }[] = []) => {
    const load = service.load();
    http.expectOne(API).flush(todos);
    return load;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TodoService);
    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  const setInput = async (value: string) => {
    const input = fixture.nativeElement.querySelector('.todo__input input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a todo through the UI', async () => {
    await setInput('Nova tarefa');

    const button = fixture.nativeElement.querySelector('.todo__input button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    const req = http.expectOne(API);
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', title: 'Nova tarefa', completed: false });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.todo__item span')?.textContent).toContain(
      'Nova tarefa',
    );
  });

  it('should toggle a todo when the checkbox is clicked', async () => {
    await flushList([{ id: '1', title: 'Tarefa', completed: false }]);
    await fixture.whenStable();

    const checkbox = fixture.nativeElement.querySelector(
      '.todo__item input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.click();
    await fixture.whenStable();

    http.expectOne(`${API}/1`).flush({ id: '1', title: 'Tarefa', completed: true });
    await fixture.whenStable();

    expect(component['visibleTodos']()[0].completed).toBe(true);
  });

  it('should remove a todo when the remove button is clicked', async () => {
    await flushList([{ id: '1', title: 'Tarefa removível', completed: false }]);
    await fixture.whenStable();

    const removeButton = fixture.nativeElement.querySelector('.todo__remove') as HTMLButtonElement;
    removeButton.click();
    await fixture.whenStable();

    http.expectOne(`${API}/1`).flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.todo__item').length).toBe(0);
  });

  it('should surface an error message when a request fails', async () => {
    await flushList([{ id: '1', title: 'Tarefa', completed: false }]);
    await fixture.whenStable();

    const checkbox = fixture.nativeElement.querySelector(
      '.todo__item input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.click();
    await fixture.whenStable();

    http.expectOne(`${API}/1`).flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    await fixture.detectChanges();

    expect(service.error()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.todo__error')).toBeTruthy();
  });

  it('should filter todos by active/completed', async () => {
    await flushList([
      { id: '1', title: 'Ativa', completed: false },
      { id: '2', title: 'Concluída', completed: true },
    ]);
    await fixture.whenStable();

    component['setFilter']('active');
    await fixture.whenStable();
    let items = fixture.nativeElement.querySelectorAll('.todo__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Ativa');

    component['setFilter']('completed');
    await fixture.whenStable();
    items = fixture.nativeElement.querySelectorAll('.todo__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Concluída');
  });
});
