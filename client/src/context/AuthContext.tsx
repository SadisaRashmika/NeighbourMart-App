import { createContext, useState, type PropsWithChildren } from 'react';
import type { AuthUser } from '@/features/auth/authTypes';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: false,
  setUser: () => undefined,
  setToken: () => undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  return <AuthContext.Provider value={{ user, token, isLoading: false, setUser, setToken }}>{children}</AuthContext.Provider>;
}
