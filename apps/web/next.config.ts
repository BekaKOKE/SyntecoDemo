import type { NextConfig } from 'next';
import path from 'path';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  // pnpm monorepo: resolve packages (incl. `next`) from the workspace root
  turbopack: { root: path.join(__dirname, '..', '..') },
  async redirects() {
    return [
      // MSA больше не официальный бренд — старая страница бренда ведёт на список брендов.
      { source: '/brands/msa', destination: '/brands', permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
