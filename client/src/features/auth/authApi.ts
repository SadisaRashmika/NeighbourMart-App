import { apiRequest } from '@/services/api';
import type { AuthResponse, AuthUser, LoginInput, RegistrationResponse, ShopRegistrationInput } from './authTypes';

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
  return apiRequest<RegistrationResponse>('/api/auth/register/customer', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}

export function registerShopOwner(input: ShopRegistrationInput) {
  return apiRequest<RegistrationResponse>('/api/auth/register/shop', {
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

export function updateProfile(token: string, input: { name: string; location: string; avatarUrl?: string; phoneNumber?: string; pickupTime?: string; pickupInstructions?: string; allowCalls?: boolean }) {
  return apiRequest<{ user: AuthUser }>('/api/users/me', {
    body: JSON.stringify(input),
    headers: { Authorization: `Bearer ${token}` },
    method: 'PUT',
  });
}

export function deleteProfile(token: string) {
  return apiRequest<{ message: string }>('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
    method: 'DELETE',
  });
}

export function requestPasswordChangeCode(token: string) {
  return apiRequest<{ email: string; developmentCode?: string }>('/api/auth/request-password-change', {
    headers: { Authorization: `Bearer ${token}` },
    method: 'POST',
  });
}

export function resetPassword(input: { email: string; code: string; password: string }) {
  return apiRequest<{ message: string }>('/api/auth/reset-password', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}
