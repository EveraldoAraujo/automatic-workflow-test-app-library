import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { AppConfig } from './config.js';

const testConfig: AppConfig = {
  port: 0,
  nodeEnv: 'test',
  corsOrigins: ['http://localhost:4200'],
};

describe('Todos API', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp({ config: testConfig });
  });

  it('lists an empty collection', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a todo (201)', async () => {
    const res = await request(app).post('/api/todos').send({ title: '  Comprar leite  ' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Comprar leite', completed: false });
    expect(res.body.id).toBeTruthy();
  });

  it('rejects an invalid create payload with 400', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('updates a todo with PATCH', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Correr' });
    const res = await request(app).patch(`/api/todos/${created.body.id}`).send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('rejects an empty PATCH payload with 400', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Correr' });
    const res = await request(app).patch(`/api/todos/${created.body.id}`).send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 when patching an unknown id', async () => {
    const res = await request(app).patch('/api/todos/missing').send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('deletes a todo (204) and returns 404 the second time', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Temp' });
    const first = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(first.status).toBe(204);

    const second = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(second.status).toBe(404);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });

  it('allows the configured CORS origin', async () => {
    const res = await request(app).get('/api/todos').set('Origin', 'http://localhost:4200');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
  });

  it('does not expose stack traces on errors', async () => {
    const res = await request(app).post('/api/todos').send({ title: 1 });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain('at ');
  });
});
