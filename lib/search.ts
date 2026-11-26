import { query } from './db';
import type { QueryResultRow } from 'pg';

/**
 * Job row from database with all fields
 */
export interface JobRow extends QueryResultRow {
  id: string;
  title: string;
  description: string;
  company_id: string | null;
  company_name: string;
  location: string;
  region: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_normalized_usd: number | null;
  job_type: string;
  source: string;
  source_url: string | null;
  employer_email: string | null;
  employer_verified: boolean;
  posted_at: string | Date;
  expires_at: string | Date | null;
  status: string;
  equity_min_pct: number | null;
  equity_max_pct: number | null;
  bonus_structure: string | null;
  benefits: Record<string, unknown> | null;
  culture_notes: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date | null;
}

/**
 * Formatted job result for API response
 */
export interface FormattedJob {
  id: string;
  title: string;
  description: string;
  company_id: string | null;
  company_name: string;
  location: string;
  region: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_normalized_usd: number | null;
  job_type: string;
  source: string;
  source_url: string | null;
  employer_email: string | null;
  employer_verified: boolean;
  posted_at: Date;
  expires_at: Date | null;
  status: string;
  equity_min_pct: number | null;
  equity_max_pct: number | null;
  bonus_structure: string | null;
  benefits: Record<string, unknown> | null;
  culture_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Search filters from query parameters
 */
export interface SearchFilters {
  q?: string;
  location?: string;
  region?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  sort?: 'relevance' | 'salary' | 'posted_date';
  page?: number;
  limit?: number;
  featured?: boolean;
  category?: string;
  posted_within?: number;
  remote?: boolean;
}

/**
 * Search result response
 */
export interface SearchResult {
  jobs: FormattedJob[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Convert database row to formatted job object
 */
export function formatJobResult(row: JobRow): FormattedJob {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    company_id: row.company_id,
    company_name: row.company_name,
    location: row.location,
    region: row.region,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    salary_currency: row.salary_currency,
    salary_normalized_usd: row.salary_normalized_usd,
    job_type: row.job_type,
    source: row.source,
    source_url: row.source_url,
    employer_email: row.employer_email,
    employer_verified: row.employer_verified,
    posted_at: new Date(row.posted_at),
    expires_at: row.expires_at ? new Date(row.expires_at) : null,
    status: row.status,
    equity_min_pct: row.equity_min_pct,
    equity_max_pct: row.equity_max_pct,
    bonus_structure: row.bonus_structure,
    benefits: row.benefits,
    culture_notes: row.culture_notes,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

/**
 * Build WHERE clause and parameters for job search
 * Returns: { whereClause, params, paramCount }
 */
export function buildSearchQuery(filters: SearchFilters): {
  whereClause: string;
  params: unknown[];
  paramCount: number;
  queryParamIndex: number | null;
} {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramCount = 1;

  let queryParamIndex: number | null = null;

  // Always filter for published, current jobs
  conditions.push('jobs.status = $' + paramCount);
  params.push('published');
  paramCount++;
  conditions.push('jobs.deleted_at IS NULL');
  conditions.push('(jobs.expires_at IS NULL OR jobs.expires_at > NOW())');

  // Full-text search on search_vector
  if (filters.q && filters.q.trim().length > 0) {
    queryParamIndex = paramCount;
    conditions.push("jobs.search_vector @@ plainto_tsquery('english', $" + paramCount + ')');
    params.push(filters.q.trim());
    paramCount++;
  }

  // Filter by location
  if (filters.location && filters.location.trim().length > 0) {
    conditions.push('LOWER(jobs.location) LIKE LOWER($' + paramCount + ')');
    params.push('%' + filters.location.trim() + '%');
    paramCount++;
  }

  // Filter by region
  if (filters.region && filters.region.trim().length > 0) {
    conditions.push('jobs.region = $' + paramCount);
    params.push(filters.region.trim());
    paramCount++;
  }

  // Filter by job type
  if (filters.job_type && filters.job_type.trim().length > 0) {
    conditions.push('jobs.job_type = $' + paramCount);
    params.push(filters.job_type.trim());
    paramCount++;
  }

  // Filter by salary range
  if (filters.salary_min !== undefined && filters.salary_min !== null) {
    conditions.push('(jobs.salary_max IS NULL OR jobs.salary_max >= $' + paramCount + ')');
    params.push(filters.salary_min);
    paramCount++;
  }

  if (filters.salary_max !== undefined && filters.salary_max !== null) {
    conditions.push('(jobs.salary_min IS NULL OR jobs.salary_min <= $' + paramCount + ')');
    params.push(filters.salary_max);
    paramCount++;
  }

  if (filters.featured) {
    conditions.push('(jobs.is_featured = TRUE AND (jobs.featured_until IS NULL OR jobs.featured_until > NOW()))');
  }

  if (filters.remote) {
    conditions.push(
      "(jobs.location ILIKE '%remote%' OR jobs.title ILIKE '%remote%' OR jobs.description ILIKE '%remote%')"
    );
  }

  if (filters.category && filters.category.trim()) {
    conditions.push('(jobs.title ILIKE $' + paramCount + ' OR jobs.description ILIKE $' + paramCount + ')');
    params.push('%' + filters.category.trim() + '%');
    paramCount++;
  }

  if (filters.posted_within === 1 || filters.posted_within === 7 || filters.posted_within === 30) {
    conditions.push(`jobs.posted_at >= NOW() - INTERVAL '${filters.posted_within} days'`);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  return { whereClause, params, paramCount, queryParamIndex };
}

/**
 * Build ORDER BY clause based on sort preference
 */
export function buildSortClause(
  sort: 'relevance' | 'salary' | 'posted_date' | undefined,
  queryParamIndex: number | null
): string {
  if (sort === 'salary') {
    return 'ORDER BY jobs.salary_normalized_usd DESC NULLS LAST, jobs.posted_at DESC';
  }

  if (sort === 'posted_date') {
    return 'ORDER BY jobs.posted_at DESC';
  }

  if (queryParamIndex) {
    return `ORDER BY ts_rank(jobs.search_vector, plainto_tsquery('english', $${queryParamIndex})) DESC, jobs.posted_at DESC`;
  }

  return 'ORDER BY jobs.posted_at DESC';
}

/** List cards only show two lines. The job page loads the full description. */
const LISTING_DESCRIPTION_CHARS = 280;
/** Stop counting once the listing is this long. Pagination stays exact below the cap. */
const LISTING_COUNT_CAP = 1000;

/**
 * One round trip: a capped count plus the page.
 * The count stops at 1001 rows so it does not walk the whole live set.
 */
export async function searchJobs(filters: SearchFilters): Promise<SearchResult> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 10));
  const offset = (page - 1) * limit;

  const { whereClause, params, queryParamIndex } = buildSearchQuery(filters);
  const sortClause = buildSortClause(filters.sort, queryParamIndex);
  const limitParam = params.length + 1;
  const offsetParam = params.length + 2;

  const jobsSql = `
    SELECT
      listed.id,
      listed.title,
      listed.description,
      listed.company_id,
      listed.company_name,
      listed.location,
      listed.region,
      listed.salary_min,
      listed.salary_max,
      listed.salary_currency,
      listed.salary_normalized_usd,
      listed.job_type,
      listed.source,
      listed.source_url,
      listed.employer_email,
      listed.employer_verified,
      listed.posted_at,
      listed.expires_at,
      listed.status,
      listed.equity_min_pct,
      listed.equity_max_pct,
      listed.bonus_structure,
      listed.benefits,
      listed.culture_notes,
      listed.created_at,
      listed.updated_at,
      stats.total
    FROM (
      SELECT COUNT(*)::int AS total
      FROM (
        SELECT 1
        FROM jobs
        ${whereClause}
        LIMIT ${LISTING_COUNT_CAP + 1}
      ) capped
    ) stats
    LEFT JOIN LATERAL (
      SELECT
        jobs.id,
        jobs.title,
        LEFT(jobs.description, ${LISTING_DESCRIPTION_CHARS}) AS description,
        jobs.company_id,
        jobs.company_name,
        jobs.location,
        jobs.region,
        jobs.salary_min,
        jobs.salary_max,
        jobs.salary_currency,
        jobs.salary_normalized_usd,
        jobs.job_type,
        jobs.source,
        jobs.source_url,
        jobs.employer_email,
        jobs.employer_verified,
        jobs.posted_at,
        jobs.expires_at,
        jobs.status,
        jobs.equity_min_pct,
        jobs.equity_max_pct,
        jobs.bonus_structure,
        jobs.benefits,
        jobs.culture_notes,
        jobs.created_at,
        jobs.updated_at
      FROM jobs
      ${whereClause}
      ${sortClause}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    ) listed ON TRUE
  `;

  const result = await query<JobRow & { total: number | string }>(jobsSql, [...params, limit, offset]);
  const rawTotal = Number(result.rows[0]?.total || 0);
  const total = rawTotal > LISTING_COUNT_CAP ? LISTING_COUNT_CAP : rawTotal;
  const jobs = result.rows.filter((row) => row.id).map(formatJobResult);

  return {
    jobs,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
