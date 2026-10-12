import { randomUUID } from 'node:crypto';
import {
  Router,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import { z } from 'zod';
import { createTodoSchema, todoSchema, updateTodoSchema } from '@mono/shared';
import { badRequest, notFound } from './errors.js';
import type { TodoRepository } from './todo.repository.js';

/**
 * Wraps a handler so that both synchronous `throw`s and rejected promises are
 * forwarded to the central error handler. This guards against Express 4's
 * inability to catch async rejections and makes the behaviour explicit.
 */
function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => unknown,
): RequestHandler {
  return (req, res, next) => {
    try {
      void Promise.resolve(handler(req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };
}

/** Validates a payload against a schema, throwing a 400 with field details. */
function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw badRequest('Invalid request payload', result.error.flatten());
  }
  return result.data;
}

/** Validates a response body against the shared contract before sending it. */
function sendTodo(res: Response, todo: unknown, status = 200): void {
  res.status(status).json(parseOrThrow(todoSchema, todo));
}

/** Normalises an Express route param (may be an array in some typings). */
function paramId(req: Request): string {
  const value = req.params['id'];
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

export function createTodoRouter(repository: TodoRepository): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler((_req, res) => {
      const todos = parseOrThrow(z.array(todoSchema), repository.list());
      res.json(todos);
    }),
  );

  router.post(
    '/',
    asyncHandler((req, res) => {
      const input = parseOrThrow(createTodoSchema, req.body);
      const todo = repository.create({
        id: randomUUID(),
        title: input.title,
        completed: false,
      });
      sendTodo(res, todo, 201);
    }),
  );

  router.patch(
    '/:id',
    asyncHandler((req, res) => {
      const input = parseOrThrow(updateTodoSchema, req.body);
      const todo = repository.update(paramId(req), input);
      if (!todo) {
        throw notFound();
      }
      sendTodo(res, todo);
    }),
  );

  router.delete(
    '/:id',
    asyncHandler((req, res) => {
      const removed = repository.remove(paramId(req));
      if (!removed) {
        throw notFound();
      }
      res.status(204).send();
    }),
  );

  return router;
}
