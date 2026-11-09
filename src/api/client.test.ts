import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';
import { tokenStorage } from './tokenStorage';

const ok = (config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse => ({
  data, status, statusText: '', headers: {}, config,
});
const fail = (config: InternalAxiosRequestConfig, status: number, message = 'err') => {
  const res = ok(config, { message }, status);
  return Promise.reject(Object.assign(new axios.AxiosError(message, 'ERR_BAD_REQUEST', config, null, res), { response: res }));
};

describe('axios instance', () => {
  beforeEach(() => {
    localStorage.clear();
    tokenStorage.set({ accessToken: 'old', refreshToken: 'ref', user: null });
  });

  it('adds the Bearer token automatically', async () => {
    let auth: unknown;
    api.defaults.adapter = ((c: InternalAxiosRequestConfig) => {
      auth = c.headers.Authorization;
      return Promise.resolve(ok(c, {}));
    }) as AxiosAdapter;
    await api.get('/auth/me');
    expect(auth).toBe('Bearer old');
  });

  it('refreshes the token on 401 and retries the request', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'new', refreshToken: 'ref2' } });
    const seen: unknown[] = [];
    api.defaults.adapter = ((c: InternalAxiosRequestConfig) => {
      seen.push(c.headers.Authorization);
      return c.headers.Authorization === 'Bearer new' ? Promise.resolve(ok(c, { id: 1 })) : fail(c, 401, 'Token Expired!');
    }) as AxiosAdapter;

    const res = await api.get('/auth/me');
    expect(res.data).toEqual({ id: 1 });
    expect(seen).toEqual(['Bearer old', 'Bearer new']);
    expect(tokenStorage.get()?.accessToken).toBe('new');
    post.mockRestore();
  });

  it('clears the session when refresh fails', async () => {
    const post = vi.spyOn(axios, 'post').mockRejectedValue(new Error('expired'));
    api.defaults.adapter = ((c: InternalAxiosRequestConfig) => fail(c, 401)) as AxiosAdapter;
    await expect(api.get('/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(tokenStorage.get()).toBeNull();
    post.mockRestore();
  });

  it('turns 500 into a friendly ApiError', async () => {
    api.defaults.adapter = ((c: InternalAxiosRequestConfig) => fail(c, 500)) as AxiosAdapter;
    await expect(api.get('/x', { silent: true })).rejects.toMatchObject({ status: 500, message: expect.stringContaining('server') });
  });
});
