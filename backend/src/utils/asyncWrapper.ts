// src/utils/asyncWrapper.ts
import { RequestHandler } from 'express';

export const asyncWrapper = (fn: RequestHandler) => {
  return (req: any, res: any, next: any): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};