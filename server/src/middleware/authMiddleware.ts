import type { RequestHandler } from 'express';

export const authMiddleware: RequestHandler = (_request, response, next) => {
  response.status(501).json({ message: 'Authentication is not implemented yet' });
};
