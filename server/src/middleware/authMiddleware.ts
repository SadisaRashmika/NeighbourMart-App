import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export const authMiddleware: RequestHandler = async (request, response, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) { response.status(503).json({ message: 'JWT_SECRET is not configured' }); return; }
  try {
    const token = request.headers.authorization?.replace(/^Bearer /, '');
    if (!token) throw new Error('Missing token');
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || !decoded.sub) throw new Error('Invalid token');
    const user = await UserModel.findById(decoded.sub);
    if (!user) throw new Error('Account not found');
    response.locals.user = user;
    next();
  } catch { response.status(401).json({ message: 'Please sign in again' }); }
};
