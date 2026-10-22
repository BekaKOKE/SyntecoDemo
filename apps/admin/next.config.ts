import type { NextConfig } from 'next';
import path from 'path';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  // pnpm monorepo: resolve packages (incl. `next`) from the workspace root
  turbopack: { root: path.join(__dirname, '..', '..') },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
