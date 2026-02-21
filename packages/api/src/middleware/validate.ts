import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from './error.js';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      throw new AppError(400, 'Validation failed', errors);
    }
    req[source] = result.data;
    next();
  };
}
