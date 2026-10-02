import type { RequestHandler } from 'express';

export const getCurrentUser: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Authentication is not implemented yet' });
};
