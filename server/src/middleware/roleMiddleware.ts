import type { RequestHandler } from 'express';

export function requireRole(..._roles: Array<'customer' | 'shop'>): RequestHandler {
  return (_request, response) => {
    response.status(501).json({ message: 'Role authorization is not implemented yet' });
  };
}
