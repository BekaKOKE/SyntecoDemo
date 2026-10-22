/**
 * Shared API client — used by both web (storefront) and admin apps.
 *
 * Provides JWT auth with automatic token refresh, error handling,
 * and configurable token storage keys so each app uses its own namespace.
 *
 * Usage:
 *   import { createApiClient } from '@synteco/shared-api-client';
 *   const { apiFetch, setTokens, clearTokens, getAccessToken } = createApiClient({
 *     tokenKey: 'synteco_web_token',
 *     refreshKey: 'synteco_web_refresh',
 *   });
 */

/**
 * Generate a v4-like idempotency key for mutation requests.
 * Uses crypto.randomUUID if available, falls back to Math.random.
 */
function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface ApiClientConfig {
  /** localStorage key for the access token */
  tokenKey: string;
  /** localStorage key for the refresh token */
  refreshKey: string;
  /** Override the API base URL (defaults to /api/v1 in browser, http://localhost:3000/api/v1 on server) */
  apiBase?: string;
}

const DEFAULT_API_BASE = typeof window === 'undefined'
  ? 'http://localhost:3000/api/v1'
  : '/api/v1';

export function createApiClient(config: ApiClientConfig) {
  const API_BASE = config.apiBase ?? DEFAULT_API_BASE;
  const TOKEN_KEY = config.tokenKey;
  const REFRESH_KEY = config.refreshKey;

  // SEC-02: the refresh token is now held in an httpOnly cookie set by the API.
  // We keep it in memory only as a fallback for the current tab; it is never
  // written to localStorage. The access token stays in localStorage so a page
  // reload keeps the session until it expires and is refreshed via the cookie.
  let accessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  let refreshToken: string | null = null;
  let refreshPromise: Promise<boolean> | null = null;

  // Purge any legacy plaintext refresh token left over from before SEC-02.
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_KEY);
  }

  function setTokens(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh; // in-memory fallback only
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, access);
      localStorage.removeItem(REFRESH_KEY); // never persist the refresh token
    }
  }

  function clearTokens() {
    accessToken = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  }

  function getAccessToken() {
    return accessToken;
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        // credentials:'include' sends the httpOnly refresh cookie. The body
        // token is only a fallback for the current tab / non-browser clients.
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        });
        if (!res.ok) { clearTokens(); return false; }
        const data = await res.json();
        setTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        clearTokens();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  async function apiFetch<T = any>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    };

    // Auto-generate idempotency key for mutations
    const method = (options.method ?? 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      headers['X-Idempotency-Key'] = generateIdempotencyKey();
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });

    // Auto-refresh on 401. Attempt regardless of in-memory token — the refresh
    // may succeed purely from the httpOnly cookie after a page reload.
    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      // API returns RFC 7807 with "detail" field, NestJS exceptions use "message"
      const message = error.message ?? error.detail ?? 'Request failed';
      throw new ApiError(res.status, message, error);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json();
  }

  return { apiFetch, setTokens, clearTokens, getAccessToken };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
