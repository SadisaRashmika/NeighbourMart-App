import { UserModel } from '../models/User.js';

export function findUserByEmail(email: string) {
  return UserModel.findOne({ email: email.toLowerCase() });
}

export function findUserByEmailWithSecrets(email: string) {
  return UserModel.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash +verificationCodeHash +verificationCodeExpiresAt +passwordResetCodeHash +passwordResetCodeExpiresAt',
  );
}

export function findUserByIdWithSecrets(userId: string) {
  return UserModel.findById(userId).select('+passwordResetCodeHash +passwordResetCodeExpiresAt');
}

export async function findUserById(userId: string) {
  return UserModel.findById(userId).lean();
}
