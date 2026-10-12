import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AppConfig } from '../config.js';
import { HttpError } from '../errors.js';

/** 404 fallback for unknown routes. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Resource not found' });
};

/** Error raised by express.json when the body is not valid JSON. */
interface BodyParserError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  body?: unknown;
}

function isJsonParseError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) {
    return false;
  }
  const candidate = err as BodyParserError;
  return candidate.status === 400 || 'body' in err;
}

function isCorsError(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  return (
    (err as { code?: string }).code === 'CORS_FORBIDDEN' || /not allowed by CORS/i.test(err.message)
  );
}

function explicitStatus(err: unknown): number | undefined {
  const candidate = err as BodyParserError | undefined;
  const status = candidate?.status ?? candidate?.statusCode;
  return typeof status === 'number' ? status : undefined;
}

/**
 * Creates the central error handler.
 *
 * Configuration (`nodeEnv`) is injected here so handlers never read
 * `process.env` directly, and so tests can pass an explicit config.
 * Never leaks stack traces; in production the message of unexpected errors
 * is replaced by a generic one.
 */
export function createErrorHandler(config: AppConfig) {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (res.headersSent) {
      return;
    }

    if (err instanceof HttpError) {
      res.status(err.status).json(err.toBody());
      return;
    }

    // Malformed JSON body from express.json -> 400, not 500.
    if (isJsonParseError(err)) {
      res.status(400).json({ code: 'INVALID_JSON', message: 'Malformed JSON body' });
      return;
    }

    // CORS rejections surface as generic errors; map them to 403.
    if (isCorsError(err)) {
      res.status(403).json({ code: 'CORS_FORBIDDEN', message: 'Origin not allowed' });
      return;
    }

    // Honour an explicit HTTP status carried by the error (e.g. body-parser).
    const status = explicitStatus(err);
    if (status !== undefined && status >= 400 && status < 500) {
      res.status(status).json({ code: 'BAD_REQUEST', message: 'Bad request' });
      return;
    }

    const isProduction = config.nodeEnv === 'production';
    if (!isProduction) {
      console.error(err);
    }

    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'Internal server error' : message,
    });
  };
}
