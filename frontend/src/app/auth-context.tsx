import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '@/lib/api';
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
  type StoredSession,
} from '@/lib/session';
import type { AuthUser } from '@/lib/types';

type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (session: StoredSession) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    const storedSession = loadStoredSession();

    if (!storedSession) {
      setStatus('anonymous');
      return;
    }

    setAccessToken(storedSession.accessToken);
    setUser(storedSession.user);

    let active = true;

    void api
      .getMe(storedSession.accessToken)
      .then((me) => {
        if (!active) {
          return;
        }

        const nextUser = {
          id: me.id,
          email: me.email,
        };

        saveStoredSession({
          accessToken: storedSession.accessToken,
          expiresAt: storedSession.expiresAt,
          user: nextUser,
        });

        setUser(nextUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) {
          return;
        }

        clearStoredSession();
        setAccessToken(null);
        setUser(null);
        setStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = (session: StoredSession) => {
    saveStoredSession(session);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
  };

  const signOut = async () => {
    const currentToken = accessToken;

    clearStoredSession();
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');

    if (currentToken) {
      try {
        await api.logout(currentToken);
      } catch {
        // Ignore logout errors after local cleanup.
      }
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      status,
      signIn,
      signOut,
    }),
    [accessToken, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
