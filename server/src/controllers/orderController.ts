import type { RequestHandler } from 'express';

export const listOrders: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Order endpoints are not implemented yet' });
};
