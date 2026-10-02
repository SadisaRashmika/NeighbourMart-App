import type { RequestHandler } from 'express';

export const getCurrentUser: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Authentication is not implemented yet' });
};

export const login: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Login is not implemented yet' });
};

export const registerCustomer: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Customer registration is not implemented yet' });
};

export const registerShopOwner: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Shop registration is not implemented yet' });
};
