import type { RequestHandler } from 'express';

export const listUsers: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'User listing is not implemented yet' });
};
