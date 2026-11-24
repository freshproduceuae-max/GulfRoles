import type { RegionInfo } from '../regions';
import {
  externalId,
  finalizeListing,
  normalizeJobType,
  parseSalary,
  type NormalizedListing,
} from './normalize';

export interface SourceFetchResult {
  source: 'adzuna' | 'careerjet' | 'jooble';
  configured: boolean;
  skippedReason?: string;
  error?: string;
  listings: NormalizedListing[];
}

export type FetchLike = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  }
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

interface AdzunaJob {
  id?: string | number;
  title?: string;
  description?: string;
  redirect_url?: string;
  created?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
}

interface CareerjetJob {
  title?: string;
  locations?: string;
  company?: string;
  salary?: string;
  date?: string;
  description?: string;
  url?: string;
}

interface JoobleJob {
  id?: string | number;
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
}

function postedAt(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapAdzunaJob(raw: AdzunaJob, region: RegionInfo): NormalizedListing | null {
  const salaryMin = typeof raw.salary_min === 'number' ? Math.round(raw.salary_min) : null;
  const salaryMax = typeof raw.salary_max === 'number' ? Math.round(raw.salary_max) : null;
  const url = raw.redirect_url || '';
  return finalizeListing({
    source: 'adzuna',
    externalId: externalId('adzuna', raw.id, url),
    title: raw.title || '',
    description: raw.description || '',
    companyName: raw.company?.display_name || '',
    location: raw.location?.display_name || region.location,
    region: region.db,
    salaryMin: salaryMin && salaryMin > 0 ? salaryMin : null,
    salaryMax: salaryMax && salaryMax > 0 ? salaryMax : null,
    salaryCurrency: region.currency,
    salaryPeriod: salaryMin || salaryMax ? 'YEAR' : null,
    jobType: normalizeJobType(raw.contract_time || raw.contract_type),
    sourceUrl: url,
    postedAt: postedAt(raw.created),
  });
}

export function mapCareerjetJob(raw: CareerjetJob, region: RegionInfo): NormalizedListing | null {
  const salary = parseSalary(raw.salary, region.currency);
  const url = raw.url || '';
  return finalizeListing({
    source: 'careerjet',
    externalId: externalId('careerjet', undefined, url),
    title: raw.title || '',
    description: raw.description || '',
    companyName: raw.company || '',
    location: raw.locations || region.location,
    region: region.db,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    salaryPeriod: salary.period,
    jobType: normalizeJobType(raw.title),
    sourceUrl: url,
    postedAt: postedAt(raw.date),
  });
}

export function mapJoobleJob(raw: JoobleJob, region: RegionInfo): NormalizedListing | null {
  const salary = parseSalary(raw.salary, region.currency);
  const url = raw.link || '';
  return finalizeListing({
    source: 'jooble',
    externalId: externalId('jooble', raw.id, url),
    title: raw.title || '',
    description: raw.snippet || '',
    companyName: raw.company || '',
    location: raw.location || region.location,
    region: region.db,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    salaryPeriod: salary.period,
    jobType: normalizeJobType(raw.type),
    sourceUrl: url,
    postedAt: postedAt(raw.updated),
  });
}

async function readJson(response: { ok: boolean; status: number; json: () => Promise<unknown> }): Promise<unknown> {
  return response.json();
}

export async function fetchAdzuna(
  region: RegionInfo,
  keyword: string,
  fetchImpl: FetchLike
): Promise<SourceFetchResult> {
  if (!region.adzunaCountry) {
    return {
      source: 'adzuna',
      configured: false,
      skippedReason: `Adzuna does not publish a ${region.name} feed. Careerjet and Jooble cover this region.`,
      listings: [],
    };
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    return {
      source: 'adzuna',
      configured: false,
      skippedReason: 'ADZUNA_APP_ID and ADZUNA_APP_KEY are not set',
      listings: [],
    };
  }

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${region.adzunaCountry}/search/1`);
  url.searchParams.set('app_id', appId);
  url.searchParams.set('app_key', appKey);
  url.searchParams.set('results_per_page', '20');
  url.searchParams.set('what', keyword);
  url.searchParams.set('where', region.location);
  url.searchParams.set('content-type', 'application/json');

  try {
    const response = await fetchImpl(url.toString(), { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      return { source: 'adzuna', configured: true, listings: [], error: `Adzuna HTTP ${response.status}` };
    }
    const body = (await readJson(response)) as { results?: AdzunaJob[] };
    const listings = (body.results || [])
      .map((job) => mapAdzunaJob(job, region))
      .filter((job): job is NormalizedListing => job !== null);
    return { source: 'adzuna', configured: true, listings };
  } catch (error) {
    return {
      source: 'adzuna',
      configured: true,
      listings: [],
      error: error instanceof Error ? error.message : 'Adzuna request failed',
    };
  }
}

export async function fetchCareerjet(
  region: RegionInfo,
  keyword: string,
  fetchImpl: FetchLike
): Promise<SourceFetchResult> {
  const affid = process.env.CAREERJET_AFFILIATE_ID || process.env.CAREERJET_API_KEY;
  const userIp = process.env.CAREERJET_USER_IP;
  if (!affid || !userIp) {
    return {
      source: 'careerjet',
      configured: false,
      skippedReason: 'Set CAREERJET_AFFILIATE_ID (or CAREERJET_API_KEY) and CAREERJET_USER_IP from your Careerjet publisher account',
      listings: [],
    };
  }

  const url = new URL('https://public.api.careerjet.net/search');
  url.searchParams.set('affid', affid);
  url.searchParams.set('user_ip', userIp);
  url.searchParams.set('user_agent', 'JobBrowser/1.0 (+https://jobbrowser.app)');
  url.searchParams.set('locale_code', region.careerjetLocale);
  url.searchParams.set('keywords', keyword);
  url.searchParams.set('location', region.location);
  url.searchParams.set('page', '1');
  url.searchParams.set('pagesize', '20');

  try {
    const response = await fetchImpl(url.toString(), { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      return { source: 'careerjet', configured: true, listings: [], error: `Careerjet HTTP ${response.status}` };
    }
    const body = (await readJson(response)) as { type?: string; error?: string; jobs?: CareerjetJob[] };
    if (body.type === 'ERROR') {
      return { source: 'careerjet', configured: true, listings: [], error: body.error || 'Careerjet rejected the query' };
    }
    const listings = (body.jobs || [])
      .map((job) => mapCareerjetJob(job, region))
      .filter((job): job is NormalizedListing => job !== null);
    return { source: 'careerjet', configured: true, listings };
  } catch (error) {
    return {
      source: 'careerjet',
      configured: true,
      listings: [],
      error: error instanceof Error ? error.message : 'Careerjet request failed',
    };
  }
}

export async function fetchJooble(
  region: RegionInfo,
  keyword: string,
  fetchImpl: FetchLike
): Promise<SourceFetchResult> {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    return {
      source: 'jooble',
      configured: false,
      skippedReason: 'JOOBLE_API_KEY is not set',
      listings: [],
    };
  }

  try {
    const response = await fetchImpl(`https://jooble.org/api/${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: keyword, location: region.location, page: '1' }),
    });
    if (!response.ok) {
      return { source: 'jooble', configured: true, listings: [], error: `Jooble HTTP ${response.status}` };
    }
    const body = (await readJson(response)) as { jobs?: JoobleJob[] };
    const listings = (body.jobs || [])
      .map((job) => mapJoobleJob(job, region))
      .filter((job): job is NormalizedListing => job !== null);
    return { source: 'jooble', configured: true, listings };
  } catch (error) {
    return {
      source: 'jooble',
      configured: true,
      listings: [],
      error: error instanceof Error ? error.message : 'Jooble request failed',
    };
  }
}
