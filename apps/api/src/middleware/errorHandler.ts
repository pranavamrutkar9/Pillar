import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../lib/apiResponse.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Global Error Handler:', err);

  if (err instanceof ZodError) {
    const message = (err as any).errors.map((e: any) => e.message).join(', ');
    return errorResponse(res, message, 400);
  }

  if (err.code === 'P2002') {
    return errorResponse(res, 'A record with that value already exists', 409);
  }
  
  if (err.name === 'NotFoundError') {
    return errorResponse(res, err.message || 'Resource not found', 404);
  }
  
  if (err.name === 'UnauthorizedError') {
    return errorResponse(res, err.message || 'Unauthorized', 401);
  }
  
  if (err.name === 'ForbiddenError') {
    return errorResponse(res, err.message || 'Forbidden', 403);
  }

  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  return errorResponse(res, message, 500);
};
