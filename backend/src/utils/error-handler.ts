import { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';
import { errorResponse } from './response';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error response
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const error = err instanceof Error ? err : new Error(String(err));
  Logger.error('Unhandled error', error);

  if (err instanceof Error) {
    res.status(500).json(
      errorResponse('INTERNAL_ERROR', 'An unexpected error occurred. Please try again.')
    );
  } else {
    res.status(500).json(
      errorResponse('INTERNAL_ERROR', 'An unexpected error occurred. Please try again.')
    );
  }
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(errorResponse('NOT_FOUND', 'Resource not found'));
}
