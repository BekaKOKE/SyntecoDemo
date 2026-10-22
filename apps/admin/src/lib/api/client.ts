/**
 * Admin panel API client — re-exports from shared package
 * with admin-specific token keys.
 */
export { ApiError } from '@synteco/shared-api-client';
import { createApiClient } from '@synteco/shared-api-client';

const client = createApiClient({
  tokenKey: 'synteco_admin_token',
  refreshKey: 'synteco_admin_refresh',
});

export const { apiFetch, setTokens, clearTokens, getAccessToken } = client;
