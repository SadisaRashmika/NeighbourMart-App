import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment.js';
import { UserModel } from '../models/User.js';

export const authMiddleware: RequestHandler = async (request, response, next) => {
  const token = request.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    response.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, environment.jwtSecret);
    if (typeof payload === 'string' || payload.purpose !== 'session' || !payload.sub) {
      response.status(401).json({ message: 'Invalid session token' });
      return;
    }
    const user = await UserModel.findById(payload.sub).select('role').lean();
    if (!user) {
      response.status(401).json({ message: 'This account no longer exists' });
      return;
    }
    response.locals.userId = String(user._id);
    response.locals.userRole = user.role;
    (request as typeof request & { userId?: string }).userId = String(user._id);
    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired token' });
  }
};
