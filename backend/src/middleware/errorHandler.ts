import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
    this.name = 'AppError';

    Error.captureStackTrace(this, this.constructor);
  }
}

const formatZodError = (error: ZodError) => {
  return {
    message: 'Validation failed',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
};

const getErrorDetails = (err: any) => {
  if (err instanceof ZodError) {
    return { statusCode: 400, ...formatZodError(err) };
  }

  if (err.code === '23505') {
    return {
      statusCode: 409,
      message: 'Resource already exists',
      code: 'DUPLICATE_RESOURCE',
    };
  }

  if (err.code === '23503') {
    return {
      statusCode: 400,
      message: 'Referenced resource not found',
      code: 'FOREIGN_KEY_VIOLATION',
    };
  }

  if (err.code === '23502') {
    return {
      statusCode: 400,
      message: 'Required field missing',
      code: 'NOT_NULL_VIOLATION',
    };
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    details: err.details,
  };
};

export const errorHandler = (
  err: ApiError | ZodError | any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { statusCode, message, code, details } = getErrorDetails(err);
  const isProduction = process.env.NODE_ENV === 'production';

  const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.error('Error occurred:', {
    errorId,
    error: err.message,
    stack: err.stack,
    statusCode,
    code,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  const errorResponse: any = {
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ...(details && { details }),
      ...(statusCode >= 500 && { errorId }),
    },
  };

  if (!isProduction && statusCode >= 500) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};