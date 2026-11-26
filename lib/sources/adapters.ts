import type { FetchLike } from '../ingestion/sources';
import {
  externalId,
  finalizeListing,
  normalizeJobType,
  stripHtml,
  type NormalizedListing,
} from '../ingestion/normalize';
import type { DbRegion } from '../regions';
import { isBlockedIngestUrl, policyFor } from './policy';

const REGION_HINTS: Record<string, DbRegion> = {
  uae: 'UAE',
  saudi: 'Saudi',
  india: 'India',
  australia: 'Australia',
  usa: 'USA',
};

const PLACE_RULES: Array<{ region: DbRegion; pattern: RegExp }> = [
  { region: 'Saudi', pattern: /\b(?:saudi|riyadh|jeddah|dammam|khobar)\b/ },
  {
    region: 'India',
    pattern: /\b(?:india|bengaluru|bangalore|hyderabad|mumbai|delhi|chennai|pune|gurugram|gurgaon|noida)\b/,
  },
  { region: 'Australia', pattern: /\b(?:australia|sydney|melbourne|brisbane|perth)\b/ },
  {
    region: 'USA',
    pattern: /\b(?:usa|united states|new york|san francisco|seattle|austin|chicago|boston)\b/,
  },
  { region: 'UAE', pattern: /\b(?:uae|dubai|abu dhabi|sharjah|ajman|ras al khaimah)\b/ },
];

const REMOTE_WORD = /\b(?:remote|worldwide|anywhere|wfh|work from home)\b/;

/**
 * Remotive slugs sometimes glue a place onto the title: "Developerusa".
 * A separated "Developer USA" is left alone.
 */
export function detachGluedPlace(title: string): string {
  return title.replace(/([A-Za-z])(usa|uae|uk|india|saudi|australia)$/i, '$1').trim();
}

export function resolveRegion(location: string, hint?: string | null): DbRegion | null {
  const loc = location.toLowerCase();
  if (REMOTE_WORD.test(loc)) return 'Remote';

  const matches = [...new Set(PLACE_RULES.filter((rule) => rule.pattern.test(loc)).map((rule) => rule.region))];
  if (matches.length > 1) return 'Remote';
  if (matches.length === 1) return matches[0];

  const hinted = hint ? REGION_HINTS[hint.trim().toLowerCase()] : null;
  if (!location.trim() && hinted) return hinted;
  return null;
}

function listingFrom(input: {
  source: string;
  externalId: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  regionHint?: string | null;
  applyUrl: string;
  jobType?: string;
  postedAt?: string | null;
}): NormalizedListing | null {
  if (!input.applyUrl || isBlockedIngestUrl(input.applyUrl)) return null;
  const region = resolveRegion(input.location, input.regionHint);
  if (!region) return null;
  const policy = policyFor(input.source);
  const row = finalizeListing({
    source: input.source,
    externalId: externalId(input.source, input.externalId, input.applyUrl),
    title: detachGluedPlace(input.title),
    description: stripHtml(input.description || input.title),
    companyName: input.companyName,
    location: input.location || region,
    region,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: 'USD',
    salaryPeriod: null,
    jobType: normalizeJobType(input.jobType),
    sourceUrl: input.applyUrl,
    postedAt: input.postedAt ? new Date(input.postedAt) : null,
  });
  if (!row || Number.isNaN(row.postedAt?.getTime() ?? 0)) {
    if (row) row.postedAt = null;
  }
  if (!row) return null;
  return {
    ...row,
    applyUrl: input.applyUrl,
    attribution: policy.attribution,
  };
}

export function mapGreenhouseJob(
  raw: Record<string, unknown>,
  company: string,
  regionHint?: string | null
): NormalizedListing | null {
  const location = String((raw.location as { name?: string } | undefined)?.name || '');
  return listingFrom({
    source: 'greenhouse',
    externalId: String(raw.id || ''),
    title: String(raw.title || ''),
    description: String(raw.content || ''),
    companyName: company,
    location,
    regionHint,
    applyUrl: String(raw.absolute_url || ''),
    postedAt: raw.updated_at ? String(raw.updated_at) : null,
  });
}

export function mapLeverJob(
  raw: Record<string, unknown>,
  company: string,
  regionHint?: string | null
): NormalizedListing | null {
  const categories = (raw.categories || {}) as { location?: string; commitment?: string };
  return listingFrom({
    source: 'lever',
    externalId: String(raw.id || ''),
    title: String(raw.text || ''),
    description: String(raw.descriptionPlain || raw.description || ''),
    companyName: company,
    location: String(categories.location || ''),
    regionHint,
    applyUrl: String(raw.hostedUrl || raw.applyUrl || ''),
    jobType: categories.commitment,
  });
}

export function mapAshbyJob(
  raw: Record<string, unknown>,
  company: string,
  regionHint?: string | null
): NormalizedListing | null {
  return listingFrom({
    source: 'ashby',
    externalId: String(raw.id || ''),
    title: String(raw.title || ''),
    description: String(raw.descriptionHtml || raw.descriptionPlain || ''),
    companyName: company,
    location: String(raw.location || raw.locationName || ''),
    regionHint,
    applyUrl: String(raw.applyUrl || raw.jobUrl || ''),
    postedAt: raw.publishedAt ? String(raw.publishedAt) : null,
  });
}

export function mapWorkableJob(
  raw: Record<string, unknown>,
  company: string,
  regionHint?: string | null
): NormalizedListing | null {
  const location = raw.location as { city?: string; country?: string } | string | undefined;
  const place =
    typeof location === 'string'
      ? location
      : [location?.city, location?.country].filter(Boolean).join(', ');
  return listingFrom({
    source: 'workable',
    externalId: String(raw.shortcode || raw.id || ''),
    title: String(raw.title || ''),
    description: String(raw.description || raw.full_description || ''),
    companyName: company,
    location: place,
    regionHint,
    applyUrl: String(raw.url || raw.application_url || ''),
  });
}

export function mapRemoteOkJob(raw: Record<string, unknown>): NormalizedListing | null {
  if (!raw.id || !raw.position) return null;
  return listingFrom({
    source: 'remoteok',
    externalId: String(raw.id),
    title: String(raw.position),
    description: String(raw.description || ''),
    companyName: String(raw.company || 'Remote OK employer'),
    location: String(raw.location || 'Remote'),
    applyUrl: String(raw.url || raw.apply_url || ''),
    postedAt: raw.date ? String(raw.date) : null,
  });
}

export function mapRemotiveJob(raw: Record<string, unknown>): NormalizedListing | null {
  return listingFrom({
    source: 'remotive',
    externalId: String(raw.id || ''),
    title: String(raw.title || ''),
    description: String(raw.description || ''),
    companyName: String(raw.company_name || 'Remotive employer'),
    location: String(raw.candidate_required_location || 'Remote'),
    applyUrl: String(raw.url || ''),
    jobType: String(raw.job_type || ''),
  });
}

const PER_BOARD_CAP = 25;

async function readJson(response: { ok: boolean; status: number; json: () => Promise<unknown> }): Promise<unknown> {
  return response.json();
}

export async function fetchGreenhouseBoard(
  board: string,
  company: string,
  regionHint: string | null,
  fetchImpl: FetchLike
): Promise<NormalizedListing[]> {
  const response = await fetchImpl(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`,
    { headers: { Accept: 'application/json' } }
  );
  if (!response.ok) throw new Error(`Greenhouse ${board} returned HTTP ${response.status}`);
  const body = (await readJson(response)) as { jobs?: Record<string, unknown>[] };
  return (body.jobs || [])
    .map((job) => mapGreenhouseJob(job, company, regionHint))
    .filter((job): job is NormalizedListing => job !== null)
    .slice(0, PER_BOARD_CAP);
}

export async function fetchLeverBoard(
  site: string,
  company: string,
  regionHint: string | null,
  fetchImpl: FetchLike
): Promise<NormalizedListing[]> {
  const response = await fetchImpl(`https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Lever ${site} returned HTTP ${response.status}`);
  const body = (await readJson(response)) as Record<string, unknown>[];
  return (Array.isArray(body) ? body : [])
    .map((job) => mapLeverJob(job, company, regionHint))
    .filter((job): job is NormalizedListing => job !== null)
    .slice(0, PER_BOARD_CAP);
}

export async function fetchAshbyBoard(
  board: string,
  company: string,
  regionHint: string | null,
  fetchImpl: FetchLike
): Promise<NormalizedListing[]> {
  const response = await fetchImpl(
    `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!response.ok) throw new Error(`Ashby ${board} returned HTTP ${response.status}`);
  const body = (await readJson(response)) as { jobs?: Record<string, unknown>[] } | Record<string, unknown>[];
  const jobs = Array.isArray(body) ? body : body.jobs || [];
  return jobs
    .map((job) => mapAshbyJob(job, company, regionHint))
    .filter((job): job is NormalizedListing => job !== null)
    .slice(0, PER_BOARD_CAP);
}

export async function fetchWorkableBoard(
  account: string,
  company: string,
  regionHint: string | null,
  fetchImpl: FetchLike
): Promise<NormalizedListing[]> {
  const response = await fetchImpl(
    `https://www.workable.com/api/accounts/${encodeURIComponent(account)}?details=true`,
    { headers: { Accept: 'application/json' } }
  );
  if (!response.ok) throw new Error(`Workable ${account} returned HTTP ${response.status}`);
  const body = (await readJson(response)) as { jobs?: Record<string, unknown>[] };
  return (body.jobs || [])
    .map((job) => mapWorkableJob(job, company, regionHint))
    .filter((job): job is NormalizedListing => job !== null)
    .slice(0, PER_BOARD_CAP);
}

export async function fetchRemoteOk(fetchImpl: FetchLike): Promise<NormalizedListing[]> {
  const response = await fetchImpl('https://remoteok.com/api', {
    headers: { Accept: 'application/json', 'User-Agent': 'JobBrowser/1.0 (licensed Remote OK feed)' },
  });
  if (!response.ok) throw new Error(`Remote OK returned HTTP ${response.status}`);
  const rows = (await readJson(response)) as Record<string, unknown>[];
  return (Array.isArray(rows) ? rows : [])
    .map(mapRemoteOkJob)
    .filter((job): job is NormalizedListing => job !== null)
    .slice(0, PER_BOARD_CAP);
}

export async function fetchRemotive(fetchImpl: FetchLike): Promise<NormalizedListing[]> {
  const response = await fetchImpl('https://remotive.com/api/remote-jobs', {
    headers: { Accept: 'application/json', 'User-Agent': 'JobBrowser/1.0 (licensed Remotive feed)' },
  });
  if (!response.ok) throw new Error(`Remotive returned HTTP ${response.status}`);
  const body = (await readJson(response)) as { jobs?: Record<string, unknown>[] };
  return (body.jobs || [])
    .map(mapRemotiveJob)
    .filter((job): job is NormalizedListing => job !== null)
    .slice(0, PER_BOARD_CAP);
}

export interface OptInBoard {
  vendor: string;
  boardToken: string;
  companyName: string;
  region: string;
}

export async function fetchOptInBoard(board: OptInBoard, fetchImpl: FetchLike): Promise<NormalizedListing[]> {
  const vendor = board.vendor.toLowerCase();
  if (vendor === 'greenhouse') return fetchGreenhouseBoard(board.boardToken, board.companyName, board.region, fetchImpl);
  if (vendor === 'lever') return fetchLeverBoard(board.boardToken, board.companyName, board.region, fetchImpl);
  if (vendor === 'ashby') return fetchAshbyBoard(board.boardToken, board.companyName, board.region, fetchImpl);
  if (vendor === 'workable') return fetchWorkableBoard(board.boardToken, board.companyName, board.region, fetchImpl);
  return [];
}

export function enabledFeedIds(): string[] {
  const raw = (process.env.LEGAL_FEEDS ?? 'remoteok,remotive').trim().toLowerCase();
  if (!raw || raw === 'none') return [];
  return raw.split(',').map((item) => item.trim()).filter((item) => item === 'remoteok' || item === 'remotive');
}
