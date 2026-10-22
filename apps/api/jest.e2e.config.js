/** E2E tests: boot the full AppModule against the demo database (docker compose up + pnpm db:demo). */
const base = require('./jest.config');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  testRegex: '.*\.e2e\.spec\.ts$',
  // tests/e2e holds Playwright specs (`pnpm test:playwright`), not Jest
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  testTimeout: 30000,
};
