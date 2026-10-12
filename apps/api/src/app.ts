import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { loadConfig, type AppConfig } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { InMemoryTodoRepository, type TodoRepository } from './todo.repository.js';
import { createTodoRouter } from './todo.routes.js';

export interface CreateAppOptions {
  config?: AppConfig;
  repository?: TodoRepository;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const config = options.config ?? loadConfig();
  const repository = options.repository ?? new InMemoryTodoRepository();

  const app = express();
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin / non-browser requests (no Origin header).
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  const apiLimiter = rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/todos', apiLimiter, createTodoRouter(repository));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
