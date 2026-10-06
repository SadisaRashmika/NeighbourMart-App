import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment.js';

export const authMiddleware: RequestHandler = (request, response, next) => {
  const token = request.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    response.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, environment.jwtSecret);
    response.locals.userId = typeof payload === 'string' ? payload : payload.sub;
    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired token' });
  }
};
