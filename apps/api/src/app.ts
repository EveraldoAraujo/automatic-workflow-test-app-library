import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { loadConfig, type AppConfig } from './config.js';
import { CorsError } from './errors.js';
import { createErrorHandler, notFoundHandler } from './middleware/error-handler.js';
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
        // Reject without echoing the origin; the central handler maps the
        // typed error to a 403 with a standardised body.
        callback(new CorsError(origin));
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
  app.use(createErrorHandler(config));

  return app;
}
