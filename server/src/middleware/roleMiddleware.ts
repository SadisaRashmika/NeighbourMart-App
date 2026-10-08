import type { RequestHandler } from 'express';

export function requireRole(...roles: Array<'customer' | 'shop'>): RequestHandler {
  return (_request, response, next) => {
    if (!roles.includes(response.locals.userRole)) {
      response.status(403).json({ message: 'You do not have permission to access this resource' });
      return;
    }
    next();
  };
}
