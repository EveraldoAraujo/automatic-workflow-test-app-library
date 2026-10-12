import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { createTodoSchema, updateTodoSchema } from '@mono/shared';
import { badRequest, notFound } from './errors.js';
import type { TodoRepository } from './todo.repository.js';

type SafeParser<T> = {
  safeParse: (value: unknown) => { success: boolean; data?: T; error?: unknown };
};

/** Validates a payload against a schema, throwing a 400 with field details. */
function parseOrThrow<T>(schema: unknown, value: unknown): T {
  const result = (schema as SafeParser<T>).safeParse(value);
  if (!result.success) {
    throw badRequest(
      'Invalid request payload',
      (result.error as { flatten?: () => unknown })?.flatten?.() ?? result.error,
    );
  }
  return result.data as T;
}

export function createTodoRouter(repository: TodoRepository): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(repository.list());
  });

  router.post('/', (req, res) => {
    const input = parseOrThrow<{ title: string }>(createTodoSchema, req.body);
    const todo = repository.create({
      id: randomUUID(),
      title: input.title,
      completed: false,
    });
    res.status(201).json(todo);
  });

  router.patch('/:id', (req, res) => {
    const input = parseOrThrow<{ title?: string; completed?: boolean }>(updateTodoSchema, req.body);
    const todo = repository.update(req.params.id, input);
    if (!todo) {
      throw notFound();
    }
    res.json(todo);
  });

  router.delete('/:id', (req, res) => {
    const removed = repository.remove(req.params.id);
    if (!removed) {
      throw notFound();
    }
    res.status(204).send();
  });

  return router;
}
