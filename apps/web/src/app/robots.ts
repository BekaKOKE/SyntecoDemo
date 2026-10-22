import type { MetadataRoute } from 'next';

/**
 * robots.txt — served by Next.js at /robots.txt
 * Allows indexing of all storefront content, blocks internal API + admin.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: 'https://synteco.kz/sitemap.xml',
    host: 'https://synteco.kz',
  };
}
