import type { AuthUser } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { readJSON, removeKey, writeJSON } from '../utils/storage';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
}

export const tokenStorage = {
  get(): StoredSession | null {
    const s = readJSON<StoredSession | null>(STORAGE_KEYS.auth, null);
    return s && s.accessToken ? s : null;
  },
  set(session: StoredSession): void {
    writeJSON(STORAGE_KEYS.auth, session);
  },
  patch(partial: Partial<StoredSession>): void {
    const current = tokenStorage.get();
    if (current) tokenStorage.set({ ...current, ...partial });
  },
  clear(): void {
    removeKey(STORAGE_KEYS.auth);
  },
};
