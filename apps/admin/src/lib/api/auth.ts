import { apiFetch, setTokens, clearTokens, getAccessToken } from './client';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const data = await apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  clearTokens();
}

export async function getMe(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return await apiFetch<User>('/auth/me', { method: 'POST' });
  } catch {
    clearTokens();
    return null;
  }
}

export { getAccessToken as getToken, clearTokens as clearAuth };
