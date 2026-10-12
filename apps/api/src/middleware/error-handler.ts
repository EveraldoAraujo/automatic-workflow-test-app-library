import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors.js';

/** 404 fallback for unknown routes. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Resource not found' });
}

/**
 * Central error handler. Never leaks stack traces; in production the message
 * of unexpected errors is replaced by a generic one.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) {
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json(err.toBody());
    return;
  }

  // CORS rejections surface as generic errors; map them to 403.
  if (err instanceof Error && /not allowed by CORS/i.test(err.message)) {
    res.status(403).json({ code: 'CORS_FORBIDDEN', message: 'Origin not allowed' });
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.error(err);
  }

  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: isProduction ? 'Internal server error' : message,
  });
}
