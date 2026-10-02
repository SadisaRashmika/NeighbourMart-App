import { UserModel } from '../models/User.js';

export async function findUserById(userId: string) {
  return UserModel.findById(userId).lean();
}
