import type { RequestHandler } from 'express';

export const listProducts: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Product endpoints are not implemented yet' });
};
