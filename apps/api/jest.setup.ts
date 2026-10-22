/**
 * Jest global setup — runs before every test suite.
 * Disables Redis/RabbitMQ in test environment to prevent
 * ioredis child-process exceptions after tests complete.
 */

// Force in-memory cache only (no Redis connection attempts)
process.env.REDIS_URL = '';
process.env.RABBITMQ_URL = '';
process.env.NODE_ENV = 'test';

// Suppress ioredis connection errors from polluting test output
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
  if (
    msg.includes('[ioredis]') ||
    msg.includes('NOAUTH') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('connect ECONNREFUSED')
  ) {
    return; // suppress ioredis noise in tests
  }
  originalError.call(console, ...args);
};
