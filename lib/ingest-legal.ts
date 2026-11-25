import { query } from './db';
import { allowsGoogleJobs, isBlockedIngestUrl, isHttpUrl, parseSource } from './job-source';
import boards from '../config/legal-boards.json';

const GCC_INDIA = /uae|dubai|abu dhabi|sharjah|saudi|riyadh|jeddah|doha|qatar|kuwait|bahrain|oman|muscat|india|bengaluru|bangalore|hyderabad|mumbai|delhi|chennai|pune|gurgaon|gurugram|remote/i;

function inferRegion(location: string, hint?: string): string {
  const loc = `${location} ${hint || ''}`.toLowerCase();
  if (/saudi|riyadh|jeddah/.test(loc)) return 'Saudi';
  if (/india|bengaluru|bangalore|hyderabad|mumbai|delhi|chennai|pune/.test(loc)) return 'India';
  if (/australia|sydney|melbourne/.test(loc)) return 'Australia';
  if (/\busa\b|united states|new york|san francisco/.test(loc)) return 'USA';
  return 'UAE';
}

function inferJobType(raw?: string): string {
  const v = (raw || '').toLowerCase();
  if (v.includes('part')) return 'part-time';
  if (v.includes('contract')) return 'contract';
  if (v.includes('intern')) return 'internship';
  return 'full-time';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function upsertJob(row: {
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: string;
  job_type: string;
  source: string;
  source_job_id: string;
  source_url: string;
  apply_url: string;
  attribution?: string;
  posted_at?: string;
}): Promise<'inserted' | 'skipped'> {
  if (isBlockedIngestUrl(row.source_url) || isBlockedIngestUrl(row.apply_url)) {
    return 'skipped';
  }
  if (!isHttpUrl(row.apply_url) || !isHttpUrl(row.source_url)) {
    return 'skipped';
  }

  const existing = await query(
    `SELECT id FROM jobs WHERE source = $1 AND source_job_id = $2 AND deleted_at IS NULL LIMIT 1`,
    [row.source, row.source_job_id]
  );
  if (existing.rows.length > 0) {
    return 'skipped';
  }

  const googleJobs = allowsGoogleJobs(row.source);
  await query(
    `INSERT INTO jobs (
      title, description, company_name, location, region, job_type,
      source, source_job_id, source_url, apply_url, google_jobs_allowed,
      attribution, status, posted_at, employer_verified
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'published', COALESCE($13::timestamptz, NOW()), false)`,
    [
      row.title.slice(0, 255),
      row.description || row.title,
      row.company_name.slice(0, 255),
      row.location.slice(0, 255),
      row.region,
      row.job_type,
      row.source,
      row.source_job_id,
      row.source_url,
      row.apply_url,
      googleJobs,
      row.attribution || null,
      row.posted_at || null,
    ]
  );
  return 'inserted';
}

async function ingestGreenhouse(board: string, company: string, regionHint?: string) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return { inserted: 0, skipped: 0, error: `greenhouse ${board} ${res.status}` };
  const data = (await res.json()) as { jobs?: Array<Record<string, unknown>> };
  let inserted = 0;
  let skipped = 0;
  for (const job of data.jobs || []) {
    const location = String((job.location as { name?: string })?.name || '');
    if (!GCC_INDIA.test(location) && regionHint !== 'UAE' && regionHint !== 'India' && regionHint !== 'Saudi') {
      skipped += 1;
      continue;
    }
    const applyUrl = String(job.absolute_url || '');
    const content = stripHtml(String(job.content || ''));
    const result = await upsertJob({
      title: String(job.title || 'Role'),
      description: content || String(job.title || ''),
      company_name: company,
      location: location || regionHint || 'Remote',
      region: inferRegion(location, regionHint),
      job_type: inferJobType(String(job.employment_type || '')),
      source: 'ats:greenhouse',
      source_job_id: String(job.id),
      source_url: applyUrl,
      apply_url: applyUrl,
      attribution: `${company} via Greenhouse Job Board API`,
      posted_at: job.updated_at ? String(job.updated_at) : undefined,
    });
    if (result === 'inserted') inserted += 1;
    else skipped += 1;
  }
  return { inserted, skipped };
}

async function ingestLever(site: string, company: string, regionHint?: string) {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return { inserted: 0, skipped: 0, error: `lever ${site} ${res.status}` };
  const jobs = (await res.json()) as Array<Record<string, unknown>>;
  let inserted = 0;
  let skipped = 0;
  for (const job of jobs || []) {
    const cats = (job.categories || {}) as { location?: string };
    const location = String(cats.location || '');
    const applyUrl = String(job.hostedUrl || job.applyUrl || '');
    const desc = stripHtml(String(job.descriptionPlain || job.description || ''));
    const result = await upsertJob({
      title: String(job.text || 'Role'),
      description: desc || String(job.text || ''),
      company_name: company,
      location: location || regionHint || 'Remote',
      region: inferRegion(location, regionHint),
      job_type: inferJobType(String((job.categories as { commitment?: string })?.commitment || '')),
      source: 'ats:lever',
      source_job_id: String(job.id),
      source_url: applyUrl,
      apply_url: applyUrl,
      attribution: `${company} via Lever Postings API`,
    });
    if (result === 'inserted') inserted += 1;
    else skipped += 1;
  }
  return { inserted, skipped };
}

async function ingestRemoteOk() {
  const res = await fetch('https://remoteok.com/api', {
    headers: { Accept: 'application/json', 'User-Agent': 'GulfRoles/1.0 (legal feed ingest)' },
  });
  if (!res.ok) return { inserted: 0, skipped: 0, error: `remoteok ${res.status}` };
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  let inserted = 0;
  let skipped = 0;
  for (const job of rows) {
    if (!job.id || !job.position) continue;
    const location = String(job.location || 'Remote');
    if (!GCC_INDIA.test(`${location} ${job.position} ${job.description || ''} remote`)) {
      skipped += 1;
      continue;
    }
    const applyUrl = String(job.url || job.apply_url || '');
    const result = await upsertJob({
      title: String(job.position),
      description: stripHtml(String(job.description || job.position)),
      company_name: String(job.company || 'Remote OK employer'),
      location: location || 'Remote',
      region: inferRegion(location, 'Remote'),
      job_type: 'full-time',
      source: 'feed:remoteok',
      source_job_id: String(job.id),
      source_url: applyUrl,
      apply_url: applyUrl,
      attribution: 'Listing via Remote OK (followed link required)',
      posted_at: job.date ? String(job.date) : undefined,
    });
    if (result === 'inserted') inserted += 1;
    else skipped += 1;
  }
  return { inserted, skipped };
}

async function ingestRemotive() {
  const res = await fetch('https://remotive.com/api/remote-jobs', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return { inserted: 0, skipped: 0, error: `remotive ${res.status}` };
  const data = (await res.json()) as { jobs?: Array<Record<string, unknown>> };
  let inserted = 0;
  let skipped = 0;
  for (const job of data.jobs || []) {
    const location = String(job.candidate_required_location || job.job_type || 'Remote');
    const applyUrl = String(job.url || '');
    const result = await upsertJob({
      title: String(job.title || 'Remote role'),
      description: stripHtml(String(job.description || job.title || '')),
      company_name: String(job.company_name || 'Remotive employer'),
      location: location || 'Remote',
      region: inferRegion(location, 'Remote'),
      job_type: inferJobType(String(job.job_type || '')),
      source: 'feed:remotive',
      source_job_id: String(job.id),
      source_url: applyUrl,
      apply_url: applyUrl,
      attribution: 'Listing via Remotive (do not submit to Google Jobs)',
    });
    if (result === 'inserted') inserted += 1;
    else skipped += 1;
  }
  return { inserted, skipped };
}

export async function ingestLegalInventory(): Promise<Record<string, unknown>> {
  const summary: Record<string, unknown> = {
    blocked: boards.blocked,
    feedsConfigured: boards.feeds.map((f) => f.name),
    note: 'No Indeed/Glassdoor/LinkedIn/GulfTalent ingest. CPC partners are click-tracking only until a signed IO.',
  };

  const atsResults: unknown[] = [];
  for (const board of boards.ats) {
    try {
      if (board.vendor === 'greenhouse') {
        atsResults.push({ board, ...(await ingestGreenhouse(board.board, board.company, board.regionHint)) });
      } else if (board.vendor === 'lever') {
        atsResults.push({ board, ...(await ingestLever(board.board, board.company, board.regionHint)) });
      }
    } catch (error) {
      atsResults.push({ board, error: error instanceof Error ? error.message : 'failed' });
    }
  }

  summary.ats = atsResults;
  summary.remoteok = await ingestRemoteOk().catch((e) => ({ error: String(e) }));
  summary.remotive = await ingestRemotive().catch((e) => ({ error: String(e) }));
  summary.sampleSourceKinds = ['employer', 'ats:greenhouse', parseSource('feed:remotive').tag];
  return summary;
}
