import { apiRequest } from '@/services/api';
import type { AuthResponse, AuthUser, LoginInput } from './authTypes';

export function getCurrentUser(token: string) {
  return apiRequest<{ user: AuthUser }>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}

export function registerCustomer(input: { name: string; email: string; location: string }) {
  return apiRequest<{ email: string; message: string; developmentCode?: string }>('/api/auth/register/customer', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}

export function verifyEmail(input: { email: string; code: string }) {
  return apiRequest<{ verificationToken: string }>('/api/auth/verify-email', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}

export function setPassword(input: { email: string; password: string; verificationToken: string }) {
  return apiRequest<AuthResponse>('/api/auth/set-password', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}
