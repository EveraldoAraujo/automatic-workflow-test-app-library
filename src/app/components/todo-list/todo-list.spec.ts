import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoList } from './todo-list';
import { TodoService } from '../../services/todo.service';

describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let component: TodoList;
  let service: TodoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoList],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
    service = TestBed.inject(TodoService);
    service.todos().forEach((todo) => service.remove(todo.id));
    await fixture.whenStable();
  });

  const setInput = async (value: string) => {
    const input = fixture.nativeElement.querySelector(
      '.todo__input input',
    ) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a todo through the UI', async () => {
    await setInput('Nova tarefa');

    const button = fixture.nativeElement.querySelector(
      '.todo__input button',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(service.todos().length).toBe(1);
    expect(
      fixture.nativeElement.querySelector('.todo__item span')?.textContent,
    ).toContain('Nova tarefa');
  });

  it('should toggle a todo when the checkbox is clicked', async () => {
    service.add('Tarefa');
    await fixture.whenStable();

    const checkbox = fixture.nativeElement.querySelector(
      '.todo__item input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.click();
    await fixture.whenStable();

    expect(service.todos()[0].completed).toBe(true);
  });

  it('should remove a todo when the remove button is clicked', async () => {
    service.add('Tarefa removível');
    await fixture.whenStable();

    const removeButton = fixture.nativeElement.querySelector(
      '.todo__remove',
    ) as HTMLButtonElement;
    removeButton.click();
    await fixture.whenStable();

    expect(service.todos().length).toBe(0);
  });

  it('should filter todos by active/completed', async () => {
    service.add('Ativa');
    service.add('Concluída');
    service.toggle(service.todos()[1].id);
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
