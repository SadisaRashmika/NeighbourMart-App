import type { RequestHandler } from 'express';

export const listShops: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Shop endpoints are not implemented yet' });
};
