/**
 * Web storefront API client — re-exports from shared package
 * with web-specific token keys.
 */
export { ApiError } from '@synteco/shared-api-client';
import { createApiClient } from '@synteco/shared-api-client';

const client = createApiClient({
  tokenKey: 'synteco_web_token',
  refreshKey: 'synteco_web_refresh',
});

export const { apiFetch, setTokens, clearTokens, getAccessToken } = client;
