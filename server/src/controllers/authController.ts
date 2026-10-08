import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export const getCurrentUser: RequestHandler = (_request, response) => {
  const user = response.locals.user;
  response.json({ id: user.id, name: user.name, role: user.role });
};

export const login: RequestHandler = async (request, response) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) { response.status(503).json({ message: 'JWT_SECRET is not configured' }); return; }
  const { mobileNumber, password } = request.body ?? {};
  if (typeof mobileNumber !== 'string' || typeof password !== 'string') {
    response.status(400).json({ message: 'Mobile number and password are required' }); return;
  }
  const user = await UserModel.findOne({ mobileNumber }).select('+passwordHash');
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401).json({ message: 'Incorrect mobile number or password' }); return;
  }
  response.json({ id: user.id, name: user.name, role: user.role,
    token: jwt.sign({}, secret, { subject: user.id, expiresIn: '8h', algorithm: 'HS256' }) });
};

export const registerCustomer: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Customer registration is not implemented yet' });
};

export const registerShopOwner: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Shop registration is not implemented yet' });
};
