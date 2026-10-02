import type { RequestHandler } from 'express';

export const getShopReport: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Reporting is not implemented yet' });
};
