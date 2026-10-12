import { randomUUID } from 'node:crypto';
import {
  Router,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import type { ZodType } from 'zod';
import { createTodoSchema, updateTodoSchema } from '@mono/shared';
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
function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw badRequest('Invalid request payload', result.error.flatten());
  }
  return result.data;
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
      res.json(repository.list());
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
      res.status(201).json(todo);
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
      res.json(todo);
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
