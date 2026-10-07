import type { RequestHandler } from 'express';
import { UserModel } from '../models/User.js';

export const listUsers: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'User listing is not implemented yet' });
};

export const updateCurrentUser: RequestHandler = async (request, response) => {
  const name = String(request.body.name ?? '').trim();
  const location = String(request.body.location ?? '').trim();
  const avatarUrl = String(request.body.avatarUrl ?? '').trim();

  if (!name || !location) {
    response.status(400).json({ message: 'Name and location are required' });
    return;
  }

  const user = await UserModel.findByIdAndUpdate(
    response.locals.userId,
    { name, location, avatarUrl },
    { new: true, runValidators: true },
  ).lean();

  if (!user) {
    response.status(404).json({ message: 'User not found' });
    return;
  }

  response.json({ user: { id: String(user._id), name: user.name, email: user.email, location: user.location, role: user.role, avatarUrl: user.avatarUrl } });
};
