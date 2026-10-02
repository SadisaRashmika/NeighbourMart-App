import { UserModel } from '../models/User.js';

export function findUserByMobileNumber(mobileNumber: string) {
  return UserModel.findOne({ mobileNumber }).lean();
}
