import { createContext, useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { getCurrentUser } from '@/features/auth/authApi';
import type { AuthResponse, AuthUser } from '@/features/auth/authTypes';
import { setApiAuthToken, setUnauthorizedHandler } from '@/services/api';
import { clearSessionToken, loadSessionToken, saveSessionToken } from '@/services/sessionStorage';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  establishSession: (result: AuthResponse, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  setUser: () => undefined,
  setToken: () => undefined,
  establishSession: async () => undefined,
  logout: async () => undefined,
  validateSession: async () => undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const setToken = useCallback((value: string | null) => {
    tokenRef.current = value;
    setApiAuthToken(value);
    setTokenState(value);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clearSessionToken();
  }, [setToken]);

  const validateSession = useCallback(async () => {
    const candidate = tokenRef.current ?? await loadSessionToken();
    if (!candidate) { await logout(); return; }
    try {
      setApiAuthToken(candidate);
      const result = await getCurrentUser(candidate);
      setToken(candidate);
      setUser(result.user);
    } catch {
      await logout();
    }
  }, [logout, setToken]);

  const establishSession = useCallback(async (result: AuthResponse, remember = true) => {
    setToken(result.token);
    setUser(result.user);
    await saveSessionToken(result.token, remember);
  }, [setToken]);

  useEffect(() => {
    setUnauthorizedHandler(() => { void logout(); });
    void validateSession().finally(() => setIsLoading(false));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && tokenRef.current) void validateSession();
    });
    return () => { subscription.remove(); setUnauthorizedHandler(null); };
  }, [logout, validateSession]);

  return <AuthContext.Provider value={{ user, token, isLoading, setUser, setToken, establishSession, logout, validateSession }}>{children}</AuthContext.Provider>;
}
