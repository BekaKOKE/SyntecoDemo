import { apiFetch, setTokens, clearTokens, getAccessToken } from './client';
import { getSessionIdHeader } from './cart';

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
  const headers: Record<string, string> = { 'X-Session-Id': getSessionIdHeader() };
  const data = await apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function register(firstName: string, lastName: string, email: string, password: string, phone?: string, consent = false, marketingConsent = false): Promise<TokenResponse> {
  const headers: Record<string, string> = { 'X-Session-Id': getSessionIdHeader() };
  const data = await apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    headers,
    body: JSON.stringify({ firstName, lastName, email, password, phone, consent, marketingConsent }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* best-effort — clear tokens regardless */ }
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
