import { z } from 'zod';

/**
 * Runtime schema for a Todo item.
 * Title is trimmed and must be 1..200 chars.
 */
export const todoSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof todoSchema>;

/** Payload accepted when creating a todo. */
export const createTodoSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200, 'title is too long'),
});

export type CreateTodo = z.infer<typeof createTodoSchema>;

/** Payload accepted when updating a todo. At least one field required. */
export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1, 'title is required').max(200, 'title is too long').optional(),
    completed: z.boolean().optional(),
  })
  .refine((value) => value.title !== undefined || value.completed !== undefined, {
    message: 'at least one of title or completed is required',
  });

export type UpdateTodo = z.infer<typeof updateTodoSchema>;
