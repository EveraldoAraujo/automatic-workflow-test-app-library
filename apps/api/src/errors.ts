import type { ApiError } from '@mono/shared';

/** Base class for HTTP-aware errors thrown by handlers. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  toBody(): ApiError {
    return {
      code: this.code,
      message: this.message,
      ...(this.details === undefined ? {} : { details: this.details }),
    };
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, 'VALIDATION_ERROR', message, details);

export const notFound = (message = 'Todo not found') => new HttpError(404, 'NOT_FOUND', message);
