import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/apiError';
import * as authApi from '../api/auth';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from './LoginPage';

vi.mock('../api/auth');

const setup = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>DASHBOARD</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

describe('LoginPage', () => {
  beforeEach(() => localStorage.clear());

  it('validates required fields', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Please enter your username')).toBeInTheDocument();
    expect(await screen.findByText('Please enter your password')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('shows an error message when authentication fails', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError('Invalid credentials', 400));
    setup();
    await userEvent.type(screen.getByLabelText('Username'), 'wrong');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByTestId('login-error')).toHaveTextContent(/invalid username or password/i);
  });

  it('stores the token and redirects on success', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      id: 1, username: 'emilys', email: 'e@x.com', firstName: 'Emily', lastName: 'Johnson',
      accessToken: 'tok', refreshToken: 'ref',
    });
    setup();
    await userEvent.type(screen.getByLabelText('Username'), 'emilys');
    await userEvent.type(screen.getByLabelText('Password'), 'emilyspass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(screen.getByText('DASHBOARD')).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('taskflow.auth.v1')!).accessToken).toBe('tok');
  });
});
