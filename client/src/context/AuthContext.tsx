import React, { createContext, type PropsWithChildren } from 'react';
import type { AuthUser } from '@/features/auth/authTypes';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: false });

export function AuthProvider({ children }: PropsWithChildren) {
  return <AuthContext.Provider value={{ user: null, isLoading: false }}>{children}</AuthContext.Provider>;
}
