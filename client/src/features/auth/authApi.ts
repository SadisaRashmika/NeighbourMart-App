import { apiRequest } from '@/services/api';
import type { AuthUser, LoginInput } from './authTypes';

export function getCurrentUser() {
  return apiRequest<AuthUser>('/api/auth/me');
}

export function login(input: LoginInput) {
  return apiRequest<AuthUser>('/api/auth/login', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}
