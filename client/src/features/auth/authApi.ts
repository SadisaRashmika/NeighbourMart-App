import { apiRequest } from '@/services/api';
import type { AuthUser } from './authTypes';

export function getCurrentUser() {
  return apiRequest<AuthUser>('/api/auth/me');
}
