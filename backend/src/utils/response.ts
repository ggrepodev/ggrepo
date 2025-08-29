import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response, 
  data?: T, 
  message?: string, 
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response, 
  message: string, 
  statusCode: number = 500,
  code?: string,
  details?: any
): Response => {
  const response = {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
  };

  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  return sendSuccess(res, data, message || 'Resource created successfully', 201);
};

export const sendNoContent = (res: Response, message?: string): Response => {
  return res.status(204).json({
    success: true,
    message: message || 'Operation completed successfully',
    timestamp: new Date().toISOString(),
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): Response => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  return sendSuccess(
    res,
    data,
    message || 'Data retrieved successfully',
    200,
    {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    }
  );
};