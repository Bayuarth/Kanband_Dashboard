import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentUser, login as loginRequest, type LoginPayload } from '../api/auth';
import { setSessionExpiredHandler } from '../api/client';
import { tokenStorage } from '../api/tokenStorage';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  /** true while restoring the session after a page refresh */
  initializing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.get()?.user ?? null);
  const [initializing, setInitializing] = useState<boolean>(() => tokenStorage.get() !== null);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // When the API layer cannot refresh the token any more, drop the session.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
  }, []);

  // Restore the session on first load: validate token with /auth/me (interceptor refreshes if expired).
  useEffect(() => {
    if (!tokenStorage.get()) {
      setInitializing(false);
      return;
    }
    let cancelled = false;
    getCurrentUser()
      .then((me) => {
        if (cancelled) return;
        tokenStorage.patch({ user: me });
        setUser(me);
      })
      .catch((err: { status?: number }) => {
        if (cancelled) return;
        // Only a rejected session logs the user out; a network failure keeps the cached user.
        if (err?.status === 401 || err?.status === 403) {
          tokenStorage.clear();
          setUser(null);
        }
      })
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { accessToken, refreshToken, ...profile } = await loginRequest(payload);
    tokenStorage.set({ accessToken, refreshToken, user: profile });
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, isAuthenticated: user !== null, login, logout }),
    [user, initializing, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
