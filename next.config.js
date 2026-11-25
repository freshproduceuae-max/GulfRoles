import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  redirects: async () => {
    return [
      { source: '/post-job', destination: '/employer/post-job', permanent: false },
      { source: '/login', destination: '/employer/login', permanent: false },
      { source: '/employer', destination: '/employer/login', permanent: false },
      { source: '/inbox/:jobId', destination: '/employer/inbox/:jobId', permanent: false },
      { source: '/verify/:token', destination: '/employer/verify/:token', permanent: false },
      { source: '/moderation', destination: '/admin/moderation', permanent: false },
    ];
  },
  rewrites: async () => {
    return [];
  },
  headers: async () => {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=43200',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=604800',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60',
          },
        ],
      },
    ];
  },
};

// Source-map upload needs a real Sentry org token. A blank or placeholder
// value must not fail the Vercel build. Runtime reporting still uses SENTRY_DSN.
function sentryTokenIsUsable(token) {
  if (!token || token.includes('your-auth-token') || token.includes('example')) return false;
  const parts = token.split('_');
  return parts[0] === 'sntrys' && parts.length >= 3 && parts[1].length > 16;
}

const sentryConfig = {
  org: process.env.SENTRY_ORG || 'jobbrowser',
  project: process.env.SENTRY_PROJECT || 'jobbrowser',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  skipSourceMapUpload: true,
  releaseHealthSamples: {
    sessionSampleRate: 0.1,
  },
  errorHandler(err) {
    console.warn('Sentry build step skipped:', err && err.message ? err.message : err);
  },
};

export default sentryTokenIsUsable(process.env.SENTRY_AUTH_TOKEN)
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;
