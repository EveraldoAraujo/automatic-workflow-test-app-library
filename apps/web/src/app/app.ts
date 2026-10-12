import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoList } from './components/todo-list/todo-list';
import { TodoService } from './services/todo.service';

@Component({
  imports: [RouterOutlet, TodoList],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly todoService = inject(TodoService);

  constructor() {
    void this.todoService.load();
  }
}
