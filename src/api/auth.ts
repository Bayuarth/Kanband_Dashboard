import type { AuthUser, LoginResponse } from '../types';
import { TOKEN_EXPIRES_MINS } from '../utils/constants';
import { api } from './client';

export interface LoginPayload {
  username: string;
  password: string;
}

export async function login({ username, password }: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    '/auth/login',
    { username, password, expiresInMins: TOKEN_EXPIRES_MINS },
    { skipAuthRefresh: true, silent: true },
  );
  return data;
}

/** Returns the currently authenticated user (requires Bearer token — added by the interceptor). */
export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}
