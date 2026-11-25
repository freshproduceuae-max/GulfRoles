import type { MetadataRoute } from 'next';
import { appBaseUrl, robotsPolicy } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const policy = robotsPolicy(appBaseUrl());
  return {
    rules: {
      userAgent: '*',
      ...(policy.allow ? { allow: policy.allow } : {}),
      disallow: policy.disallow,
    },
    sitemap: policy.sitemap,
  };
}
