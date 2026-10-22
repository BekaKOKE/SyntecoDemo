import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: [
    {
      command: 'node dist/main.js',
      port: 3000,
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'cd ../../apps/web && npx next dev --port 3001',
      port: 3001,
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});
