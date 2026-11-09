import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_EXPIRES_MINS } from '../utils/constants';
import type { RefreshResponse } from '../types';
import { toApiError } from './apiError';
import { tokenStorage } from './tokenStorage';

/** Centralised Axios instance used for every HTTP request in the app. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ---------- hooks the UI layer can subscribe to (keeps this file UI-agnostic) ---------- */
type Listener = (message: string, status?: number) => void;
let onGlobalError: Listener = () => {};
let onSessionExpired: () => void = () => {};

export const setGlobalErrorHandler = (fn: Listener) => (onGlobalError = fn);
export const setSessionExpiredHandler = (fn: () => void) => (onSessionExpired = fn);

/* ---------- request interceptor: attach Bearer token ---------- */
api.interceptors.request.use((config) => {
  const session = tokenStorage.get();
  if (session?.accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

/* ---------- response interceptor: refresh token on 401, normalise errors ---------- */
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean; skipAuthRefresh?: boolean; silent?: boolean };

let refreshPromise: Promise<string> | null = null;

/** Exchanges the refresh token for a new access token. Concurrent calls share one request. */
export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const session = tokenStorage.get();
  if (!session?.refreshToken) return Promise.reject(new Error('No refresh token'));

  refreshPromise = axios
    .post<RefreshResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: session.refreshToken, expiresInMins: TOKEN_EXPIRES_MINS },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
    )
    .then((res) => {
      tokenStorage.patch({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
      return res.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    // 401 on a protected call → try to refresh once, then replay the request
    if (status === 401 && original && !original._retry && !original.skipAuthRefresh && tokenStorage.get()) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStorage.clear();
        onSessionExpired();
        throw toApiError(error);
      }
    }

    const apiError = toApiError(error);
    if (!original?.silent && (status === 403 || (status !== undefined && status >= 500) || status === undefined)) {
      onGlobalError(apiError.message, status);
    }
    throw apiError;
  },
);

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Do not try to refresh the token when this request returns 401. */
    skipAuthRefresh?: boolean;
    /** Do not show the global error toast for this request. */
    silent?: boolean;
  }
}
