import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CreateTodo, Todo, UpdateTodo } from '@mono/shared';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Thin HTTP client for the /api/todos REST API. */
@Injectable({ providedIn: 'root' })
export class TodoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  list(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.baseUrl}/todos`);
  }

  create(payload: CreateTodo): Observable<Todo> {
    return this.http.post<Todo>(`${this.baseUrl}/todos`, payload);
  }

  update(id: string, payload: UpdateTodo): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/todos/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/todos/${id}`);
  }
}
