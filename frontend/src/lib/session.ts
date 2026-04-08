import type { AuthUser } from '@/lib/types';

export type StoredSession = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
};

const SESSION_STORAGE_KEY = 'belavia.self-service.session';

export function loadStoredSession(): StoredSession | null {
  const value = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const session = JSON.parse(value) as StoredSession;

    if (!session.accessToken || !session.user?.id || !session.user?.email) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: StoredSession) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
