import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { AppConfig } from './config.js';

const testConfig: AppConfig = {
  port: 0,
  nodeEnv: 'test',
  corsOrigins: ['http://localhost:4200'],
};

const productionConfig: AppConfig = {
  port: 0,
  nodeEnv: 'production',
  corsOrigins: ['https://app.example.com'],
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

  // --- Regression coverage for reviewer blockers -------------------------

  it('returns a standardised 400 for malformed JSON bodies (not 500/HTML)', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Content-Type', 'application/json')
      .send('not-json');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code: 'INVALID_JSON', message: 'Malformed JSON body' });
  });

  it('rejects a disallowed CORS origin with a 403 and standardised body', async () => {
    const res = await request(app).get('/api/todos').set('Origin', 'https://evil.example.com');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CORS_FORBIDDEN');
  });
});

describe('Todos API (production)', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp({ config: productionConfig });
  });

  it('keeps 400 responses standardised in production (no stack, no HTML)', async () => {
    const res = await request(app).post('/api/todos').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('at ');
  });

  it('keeps 404 responses standardised in production', async () => {
    const res = await request(app).patch('/api/todos/missing').send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('returns a generic message for unexpected errors in production', async () => {
    const repository = {
      list: () => {
        throw new Error('secret internal detail');
      },
      create: () => {
        throw new Error('x');
      },
      update: () => undefined,
      remove: () => false,
    };
    const prodApp = createApp({ config: productionConfig, repository });
    const res = await request(prodApp).get('/api/todos');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
    expect(JSON.stringify(res.body)).not.toContain('secret internal detail');
  });

  it('rejects malformed JSON in production with a standardised 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Content-Type', 'application/json')
      .send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_JSON');
  });
});
