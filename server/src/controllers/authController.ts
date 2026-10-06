import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment.js';
import { UserModel } from '../models/User.js';
import { findUserByEmail, findUserByEmailWithSecrets, findUserById } from '../services/authService.js';
import { sendVerificationCode } from '../services/emailService.js';

const verificationCodeLifetime = 10 * 60 * 1000;

function hashValue(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function createToken(userId: string, purpose: 'session' | 'email-verification') {
  return jwt.sign({ purpose }, environment.jwtSecret, { subject: userId, expiresIn: purpose === 'session' ? '7d' : '15m' });
}

function publicUser(user: { _id: unknown; name: string; email: string; role: string; location: string }) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, location: user.location };
}

export const getCurrentUser: RequestHandler = (_request, response) => {
  findUserById(response.locals.userId)
    .then((user) => {
      if (!user) {
        response.status(404).json({ message: 'User not found' });
        return;
      }
      response.json({ user: publicUser(user) });
    })
    .catch(() => response.status(500).json({ message: 'Unable to load user' }));
};

export const login: RequestHandler = async (request, response) => {
  const email = String(request.body.email ?? '').trim().toLowerCase();
  const password = String(request.body.password ?? '');
  const user = await findUserByEmailWithSecrets(email);

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  if (!user.emailVerified) {
    response.status(403).json({ message: 'Please verify your email before logging in' });
    return;
  }

  response.json({ token: createToken(String(user._id), 'session'), user: publicUser(user) });
};

export const registerCustomer: RequestHandler = async (request, response) => {
  const name = String(request.body.name ?? '').trim();
  const email = String(request.body.email ?? '').trim().toLowerCase();
  const location = String(request.body.location ?? '').trim();

  if (!name || !email || !location || !/^\S+@\S+\.\S+$/.test(email)) {
    response.status(400).json({ message: 'Name, valid email, and location are required' });
    return;
  }

  const code = createCode();
  const existingUser = await findUserByEmailWithSecrets(email);

  if (existingUser?.emailVerified || existingUser?.passwordHash) {
    response.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  if (existingUser) {
    existingUser.name = name;
    existingUser.location = location;
    existingUser.verificationCodeHash = hashValue(code);
    existingUser.verificationCodeExpiresAt = new Date(Date.now() + verificationCodeLifetime);
    await existingUser.save();
  } else {
    await UserModel.create({
      name,
      email,
      location,
      role: 'customer',
      verificationCodeHash: hashValue(code),
      verificationCodeExpiresAt: new Date(Date.now() + verificationCodeLifetime),
    });
  }
  try {
    await sendVerificationCode(email, code);
  } catch (error) {
    console.error('Verification email could not be sent', error);
    if (process.env.NODE_ENV === 'production') {
      response.status(502).json({ message: 'Could not send the verification email. Check the Gmail SMTP settings.' });
      return;
    }

    console.warn(`Development fallback: verification code for ${email} is ${code}`);
  }

  response.status(201).json({
    message: 'Verification code sent',
    email,
    ...(process.env.NODE_ENV === 'production' ? {} : { developmentCode: code }),
  });
};

export const verifyEmail: RequestHandler = async (request, response) => {
  const email = String(request.body.email ?? '').trim().toLowerCase();
  const code = String(request.body.code ?? '').trim();
  const user = await findUserByEmailWithSecrets(email);

  if (!user || !user.verificationCodeHash || !user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date() || hashValue(code) !== user.verificationCodeHash) {
    response.status(400).json({ message: 'Invalid or expired verification code' });
    return;
  }

  user.emailVerified = true;
  user.verificationCodeHash = undefined;
  user.verificationCodeExpiresAt = undefined;
  await user.save();

  response.json({ verificationToken: createToken(String(user._id), 'email-verification') });
};

export const setPassword: RequestHandler = async (request, response) => {
  const email = String(request.body.email ?? '').trim().toLowerCase();
  const password = String(request.body.password ?? '');
  const verificationToken = String(request.body.verificationToken ?? '');

  if (password.length < 8) {
    response.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(verificationToken, environment.jwtSecret);
  } catch {
    response.status(400).json({ message: 'Invalid or expired verification token' });
    return;
  }

  if (typeof payload === 'string' || payload.purpose !== 'email-verification' || !payload.sub) {
    response.status(400).json({ message: 'Invalid verification token' });
    return;
  }

  const user = await findUserByEmail(email);
  if (!user || String(user._id) !== payload.sub || !user.emailVerified) {
    response.status(400).json({ message: 'Email verification is required first' });
    return;
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  response.json({ token: createToken(String(user._id), 'session'), user: publicUser(user) });
};

export const registerShopOwner: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Shop registration is not implemented yet' });
};
