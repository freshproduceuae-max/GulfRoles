import { screenListingContent } from '../moderation';
import type { Queryable } from './db-types';
import { dedupeKey, type NormalizedListing } from './normalize';
import { planSlot } from './queries';
import { fetchAdzuna, fetchCareerjet, fetchJooble, type FetchLike, type SourceFetchResult } from './sources';
import { policyFor } from '../sources/policy';

export interface ListingFlag {
  rule: string;
  confidence: number;
  reason: string;
}

export interface UpsertResult {
  inserted: number;
  updated: number;
  flagged: number;
}

export interface IngestReport {
  slots: number;
  keyword: string;
  region: string;
  fetched: number;
  inserted: number;
  updated: number;
  flagged: number;
  sources: Array<{
    source: string;
    configured: boolean;
    skippedReason?: string;
    error?: string;
    count: number;
  }>;
}

const JOB_UPSERT = `
INSERT INTO jobs (
  title, description, company_id, company_name, location, region,
  salary_min, salary_max, salary_currency, salary_normalized_usd,
  job_type, source, source_url, source_external_id, dedupe_key,
  posted_at, expires_at, last_seen_at, status, employer_verified,
  apply_url, attribution, google_jobs_allowed, cpc_tracked, redistributable
) VALUES (
  $1, $2, $3, $4, $5, $6,
  $7, $8, $9, $10,
  $11, $12, $13, $14, $15,
  COALESCE($16::timestamptz, NOW()), NOW() + INTERVAL '30 days', NOW(), $17, false,
  $18, $19, $20, $21, $22
)
ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL AND deleted_at IS NULL
DO UPDATE SET
  last_seen_at = NOW(),
  updated_at = NOW(),
  description = CASE WHEN jobs.source = 'direct' THEN jobs.description ELSE EXCLUDED.description END,
  source_url = CASE WHEN jobs.source = 'direct' THEN jobs.source_url ELSE EXCLUDED.source_url END,
  apply_url = CASE WHEN jobs.source = 'direct' THEN jobs.apply_url ELSE EXCLUDED.apply_url END,
  attribution = CASE WHEN jobs.source = 'direct' THEN jobs.attribution ELSE EXCLUDED.attribution END,
  google_jobs_allowed = CASE WHEN jobs.source = 'direct' THEN jobs.google_jobs_allowed ELSE EXCLUDED.google_jobs_allowed END,
  cpc_tracked = CASE WHEN jobs.source = 'direct' THEN jobs.cpc_tracked ELSE EXCLUDED.cpc_tracked END,
  redistributable = CASE WHEN jobs.source = 'direct' THEN jobs.redistributable ELSE EXCLUDED.redistributable END,
  expires_at = CASE WHEN jobs.source = 'direct' THEN jobs.expires_at ELSE EXCLUDED.expires_at END,
  status = CASE
    WHEN jobs.status IN ('rejected', 'flagged') THEN jobs.status
    WHEN jobs.source = 'direct' THEN jobs.status
    ELSE EXCLUDED.status
  END
RETURNING id, (xmax = 0) AS inserted
`;

export async function upsertListings(
  db: Queryable,
  listings: NormalizedListing[],
  screen: (listing: NormalizedListing) => ListingFlag | null = (listing) =>
    screenListingContent({
      title: listing.title,
      description: listing.description,
      company_name: listing.companyName,
      employer_verified: true,
      source_url: listing.sourceUrl,
    })
): Promise<UpsertResult> {
  const result: UpsertResult = { inserted: 0, updated: 0, flagged: 0 };

  for (const listing of listings) {
    const flag = screen(listing);
    const status = flag ? 'flagged' : 'published';
    if (flag) result.flagged += 1;

    const company = await db.query<{ id: string }>(
      `INSERT INTO companies (name, region, verified)
       VALUES ($1, $2, false)
       ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [listing.companyName, listing.region]
    );
    const companyId = company.rows[0]?.id;
    if (!companyId) continue;

    const policy = policyFor(listing.source);
    const saved = await db.query<{ id: string; inserted: boolean }>(JOB_UPSERT, [
      listing.title,
      listing.description,
      companyId,
      listing.companyName,
      listing.location,
      listing.region,
      listing.salaryMin,
      listing.salaryMax,
      listing.salaryCurrency,
      listing.salaryNormalizedUsd,
      listing.jobType,
      listing.source,
      listing.sourceUrl,
      listing.externalId,
      dedupeKey(listing.title, listing.companyName, listing.location, listing.region),
      listing.postedAt,
      status,
      listing.applyUrl || listing.sourceUrl,
      listing.attribution || policy.attribution,
      policy.googleJobs,
      policy.cpcTracked,
      policy.redistributable,
    ]);

    const row = saved.rows[0];
    if (!row) continue;
    if (row.inserted) result.inserted += 1;
    else result.updated += 1;

    if (flag && row.inserted) {
      await db.query(
        `INSERT INTO moderation_flags (job_id, rule_triggered, confidence, status)
         VALUES ($1, $2, $3, 'flagged')`,
        [row.id, flag.rule, flag.confidence]
      );
    }
  }

  return result;
}

async function readCursor(db: Queryable): Promise<number> {
  try {
    const existing = await db.query<{ cursor: number }>(
      `SELECT cursor FROM ingestion_cursors WHERE id = 'default'`
    );
    return Number(existing.rows[0]?.cursor || 0);
  } catch (error) {
    console.error('Ingestion cursor unavailable. Apply migrations.', error);
    return 0;
  }
}

async function writeCursor(db: Queryable, cursor: number): Promise<void> {
  try {
    await db.query(
      `INSERT INTO ingestion_cursors (id, cursor, updated_at)
       VALUES ('default', $1, NOW())
       ON CONFLICT (id) DO UPDATE SET cursor = EXCLUDED.cursor, updated_at = NOW()`,
      [cursor]
    );
  } catch (error) {
    console.error('Failed to store ingestion cursor', error);
  }
}

export async function runIngestion(options: {
  db: Queryable;
  fetchImpl?: FetchLike;
  slots?: number;
}): Promise<IngestReport> {
  const fetchImpl = options.fetchImpl || fetch;
  const slots = Math.min(Math.max(options.slots || 1, 1), 40);
  let cursor = await readCursor(options.db);
  const listings: NormalizedListing[] = [];
  const sources: IngestReport['sources'] = [];
  let keyword = '';
  let region = '';

  for (let index = 0; index < slots; index += 1) {
    const slot = planSlot(cursor);
    cursor = slot.nextCursor;
    keyword = slot.keyword;
    region = slot.region.db;
    const batch = await Promise.all([
      fetchAdzuna(slot.region, slot.keyword, fetchImpl),
      fetchCareerjet(slot.region, slot.keyword, fetchImpl),
      fetchJooble(slot.region, slot.keyword, fetchImpl),
    ]);
    batch.forEach((item) => {
      sources.push(summarize(item));
      listings.push(...item.listings);
    });
  }

  await writeCursor(options.db, cursor);
  const saved = listings.length ? await upsertListings(options.db, listings) : { inserted: 0, updated: 0, flagged: 0 };

  return {
    slots,
    keyword,
    region,
    fetched: listings.length,
    inserted: saved.inserted,
    updated: saved.updated,
    flagged: saved.flagged,
    sources,
  };
}

function summarize(result: SourceFetchResult): IngestReport['sources'][number] {
  return {
    source: result.source,
    configured: result.configured,
    skippedReason: result.skippedReason,
    error: result.error,
    count: result.listings.length,
  };
}

export async function expireStaleJobs(db: Queryable): Promise<{ expired: number }> {
  const result = await db.query<{ id: string }>(
    `UPDATE jobs
     SET status = 'expired', updated_at = NOW()
     WHERE status = 'published'
       AND deleted_at IS NULL
       AND (
         (expires_at IS NOT NULL AND expires_at < NOW())
         OR (
           source <> 'direct'
           AND last_seen_at IS NOT NULL
           AND last_seen_at < NOW() - INTERVAL '30 days'
         )
       )
     RETURNING id`
  );
  return { expired: result.rows.length };
}
