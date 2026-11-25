import { query } from './db';

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  job_type: string | null;
  source: string;
  source_url: string | null;
  apply_url: string | null;
  attribution: string | null;
  google_jobs_allowed: boolean | null;
  cpc_tracked: boolean;
  employer_verified: boolean;
  posted_at: string;
  expires_at: string | null;
  benefits: Record<string, unknown> | null;
  culture_notes: string | null;
  status: string;
  is_featured: boolean;
  listing_tier: string;
}

interface JobRecord {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  job_type: string | null;
  source: string;
  source_url: string | null;
  apply_url?: string | null;
  attribution?: string | null;
  google_jobs_allowed?: boolean | null;
  cpc_tracked?: boolean;
  employer_verified: boolean;
  posted_at: string | Date;
  expires_at: string | Date | null;
  benefits: Record<string, unknown> | null;
  culture_notes: string | null;
  status: string;
  is_featured?: boolean;
  listing_tier?: string;
}

const COLUMNS = `
  id, title, description, company_name, location, region,
  salary_min, salary_max, salary_currency, job_type, source, source_url, apply_url,
  attribution, google_jobs_allowed, cpc_tracked,
  employer_verified, posted_at, expires_at, benefits, culture_notes, status,
  is_featured, listing_tier
`;

function toIso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toPublicJob(row: JobRecord): PublicJob {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    company_name: row.company_name,
    location: row.location,
    region: row.region,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    salary_currency: row.salary_currency,
    job_type: row.job_type,
    source: row.source,
    source_url: row.source_url,
    apply_url: row.apply_url || null,
    attribution: row.attribution || null,
    google_jobs_allowed: row.google_jobs_allowed ?? null,
    cpc_tracked: Boolean(row.cpc_tracked),
    employer_verified: row.employer_verified,
    posted_at: toIso(row.posted_at) || new Date().toISOString(),
    expires_at: toIso(row.expires_at),
    benefits: row.benefits,
    culture_notes: row.culture_notes,
    status: row.status,
    is_featured: Boolean(row.is_featured),
    listing_tier: row.listing_tier || 'free',
  };
}

export async function getFeaturedJobs(region?: string | null): Promise<PublicJob[]> {
  const result = await query<JobRecord>(
    `SELECT ${COLUMNS}
     FROM jobs
     WHERE status = 'published'
       AND deleted_at IS NULL
       AND (expires_at IS NULL OR expires_at > NOW())
       AND ($1::text IS NULL OR region = $1)
     ORDER BY (
       CASE
         WHEN is_featured = TRUE AND (featured_until IS NULL OR featured_until > NOW()) THEN 1
         ELSE 0
       END
     ) DESC, posted_at DESC
     LIMIT 6`,
    [region || null]
  );
  return result.rows.map(toPublicJob);
}

export async function getJobById(id: string): Promise<PublicJob | null> {
  const result = await query<JobRecord>(
    `SELECT ${COLUMNS}
     FROM jobs
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  const row = result.rows[0];
  return row ? toPublicJob(row) : null;
}

export function isPublicListing(job: PublicJob): boolean {
  if (job.status !== 'published') return false;
  if (!job.expires_at) return true;
  return new Date(job.expires_at).getTime() > Date.now();
}
