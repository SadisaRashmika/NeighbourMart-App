import { createContext, useState, type PropsWithChildren } from 'react';
import type { AuthUser } from '@/features/auth/authTypes';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
  setUser: () => undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);

  return <AuthContext.Provider value={{ user, isLoading: false, setUser }}>{children}</AuthContext.Provider>;
}
