import type { RequestHandler } from 'express';
import { UserModel } from '../models/User.js';

export const listUsers: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'User listing is not implemented yet' });
};

export const updateCurrentUser: RequestHandler = async (request, response) => {
  const name = String(request.body.name ?? '').trim();
  const location = String(request.body.location ?? '').trim();
  const avatarUrl = String(request.body.avatarUrl ?? '').trim();
  const phoneNumber = String(request.body.phoneNumber ?? '').trim();
  const pickupTime = String(request.body.pickupTime ?? '').trim();
  const pickupInstructions = String(request.body.pickupInstructions ?? '').trim();
  const allowCalls = Boolean(request.body.allowCalls);

  if (!name || !location) {
    response.status(400).json({ message: 'Name and location are required' });
    return;
  }

  const user = await UserModel.findByIdAndUpdate(
    response.locals.userId,
    { name, location, avatarUrl, phoneNumber, pickupTime, pickupInstructions, allowCalls },
    { new: true, runValidators: true },
  ).lean();

  if (!user) {
    response.status(404).json({ message: 'User not found' });
    return;
  }

  response.json({ user: { id: String(user._id), name: user.name, email: user.email, location: user.location, role: user.role, avatarUrl: user.avatarUrl, phoneNumber: user.phoneNumber, pickupTime: user.pickupTime, pickupInstructions: user.pickupInstructions, allowCalls: user.allowCalls } });
};

export const deleteCurrentUser: RequestHandler = async (_request, response) => {
  const result = await UserModel.findByIdAndDelete(response.locals.userId);
  if (!result) {
    response.status(404).json({ message: 'User not found' });
    return;
  }

  response.json({ message: 'Account deleted' });
};
