import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors/index.js';
import { sendError } from '../common/utils/response.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    return sendError(
      res,
      `Duplicate value entered for ${field}`,
      409,
      'DUPLICATE_KEY',
      (err as any).keyValue
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400, 'VALIDATION_ERROR', err);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid format for resource identifier`, 400, 'INVALID_ID');
  }

  console.error('[UNHANDLED_ERROR]', err);
  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred'
      : err.message || 'Internal Server Error',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}
