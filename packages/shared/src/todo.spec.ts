import { describe, expect, it } from 'vitest';
import { createTodoSchema, updateTodoSchema } from './todo.js';

describe('createTodoSchema', () => {
  it('accepts and trims a valid title', () => {
    const parsed = createTodoSchema.parse({ title: '  Comprar leite  ' });
    expect(parsed.title).toBe('Comprar leite');
  });

  it('rejects empty titles', () => {
    expect(createTodoSchema.safeParse({ title: '   ' }).success).toBe(false);
  });

  it('rejects titles longer than 200 chars', () => {
    expect(createTodoSchema.safeParse({ title: 'a'.repeat(201) }).success).toBe(false);
  });
});

describe('updateTodoSchema', () => {
  it('accepts a partial update', () => {
    expect(updateTodoSchema.safeParse({ completed: true }).success).toBe(true);
    expect(updateTodoSchema.safeParse({ title: 'ok' }).success).toBe(true);
  });

  it('rejects an empty payload', () => {
    expect(updateTodoSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a blank title', () => {
    expect(updateTodoSchema.safeParse({ title: '  ' }).success).toBe(false);
  });
});
