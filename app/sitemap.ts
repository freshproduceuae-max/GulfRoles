import type { MetadataRoute } from 'next';
import { appBaseUrl } from '@/lib/site';
import { REGION_LIST } from '@/lib/regions';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const STATIC_PATHS = [
  '',
  '/search',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/help',
  '/faq',
  '/cookies',
  '/salary-guide',
  '/employer/post-job',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appBaseUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => ({
      url: `${base}${path || '/'}`,
      lastModified: now,
      changeFrequency: path === '' || path === '/search' ? 'daily' as const : 'monthly' as const,
      priority: path === '' ? 1 : 0.6,
    })),
    ...REGION_LIST.map((region) => ({
      url: `${base}/${region.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];

  if (!process.env.DATABASE_URL) return entries;

  try {
    const jobs = await query<{ id: string; updated_at: string | Date }>(
      `SELECT id, updated_at
       FROM jobs
       WHERE status = 'published'
         AND deleted_at IS NULL
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY posted_at DESC
       LIMIT 5000`
    );
    for (const job of jobs.rows) {
      entries.push({
        url: `${base}/jobs/${job.id}`,
        lastModified: new Date(job.updated_at),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error('Sitemap job query skipped', error instanceof Error ? error.message : error);
  }

  return entries;
}
