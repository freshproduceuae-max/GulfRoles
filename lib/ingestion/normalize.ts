import { createHash } from 'crypto';
import type { DbRegion, RegionInfo } from '../regions';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type SalaryPeriod = 'YEAR' | 'MONTH';

/** Approximate rates for cross-region sort only. Not a quote. */
const USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  AED: 0.2723,
  SAR: 0.2666,
  INR: 0.012,
  AUD: 0.65,
  EUR: 1.08,
  GBP: 1.27,
};

export interface ParsedSalary {
  min: number | null;
  max: number | null;
  currency: string;
  period: SalaryPeriod | null;
}

export interface NormalizedListing {
  source: string;
  externalId: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  region: DbRegion;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryNormalizedUsd: number | null;
  salaryPeriod: SalaryPeriod | null;
  jobType: JobType;
  sourceUrl: string;
  postedAt: Date | null;
  applyUrl?: string | null;
  attribution?: string | null;
}

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function dedupeKey(title: string, company: string, location: string, region: string): string {
  const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const raw = [norm(title), norm(company), norm(location), norm(region)].join('|');
  return createHash('sha256').update(raw).digest('hex').slice(0, 40);
}

export function normalizeJobType(value: string | null | undefined): JobType {
  const text = (value || '').toLowerCase();
  if (text.includes('intern')) return 'internship';
  if (text.includes('part')) return 'part-time';
  if (text.includes('contract') || text.includes('temp') || text.includes('freelance')) return 'contract';
  return 'full-time';
}

export function parseSalary(input: string | number | null | undefined, fallbackCurrency: string): ParsedSalary {
  const empty: ParsedSalary = { min: null, max: null, currency: fallbackCurrency, period: null };
  if (input === null || input === undefined || input === '') return empty;
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input <= 0) return empty;
    return { min: Math.round(input), max: null, currency: fallbackCurrency, period: null };
  }

  const text = input.trim();
  if (!text) return empty;

  let currency = fallbackCurrency;
  const code = text.match(/\b(USD|AED|SAR|INR|AUD|EUR|GBP)\b/i);
  if (code) currency = code[1].toUpperCase();
  else if (/A\$|AUD/.test(text)) currency = 'AUD';
  else if (text.includes('£')) currency = 'GBP';
  else if (text.includes('€')) currency = 'EUR';
  else if (text.includes('₹')) currency = 'INR';
  else if (text.includes('$')) currency = fallbackCurrency === 'AUD' ? 'AUD' : 'USD';

  const numbers = Array.from(text.matchAll(/(\d[\d,]*(?:\.\d+)?)/g))
    .map((match) => Number(match[1].replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (numbers.length === 0) return { ...empty, currency };

  const min = Math.round(numbers[0]);
  const second = numbers.length > 1 ? Math.round(numbers[1]) : null;
  const max = second === null ? null : Math.max(min, second);
  const low = second === null ? min : Math.min(min, second);

  let period: SalaryPeriod | null = null;
  if (/per month|monthly|\/month|a month/i.test(text)) period = 'MONTH';
  else if (/per annum|per year|annual|yearly|\/year|a year|p\.a/i.test(text)) period = 'YEAR';

  return { min: low, max, currency, period };
}

export function toUsd(
  min: number | null,
  max: number | null,
  currency: string,
  period: SalaryPeriod | null
): number | null {
  const amount = max ?? min;
  if (!amount) return null;
  const rate = USD_PER_UNIT[currency.toUpperCase()];
  if (!rate) return null;
  const annual = period === 'MONTH' ? amount * 12 : amount;
  return Math.round(annual * rate);
}

export function externalId(source: string, explicit: string | number | undefined, url: string): string {
  if (explicit !== undefined && explicit !== null && String(explicit).trim()) {
    return clip(`${source}:${explicit}`, 255);
  }
  return clip(`${source}:${createHash('sha256').update(url).digest('hex').slice(0, 24)}`, 255);
}

export function finalizeListing(
  partial: Omit<NormalizedListing, 'salaryNormalizedUsd' | 'description' | 'title' | 'companyName' | 'location'> & {
    title: string;
    description: string;
    companyName: string;
    location: string;
  }
): NormalizedListing | null {
  const title = clip(stripHtml(partial.title), 255);
  const sourceUrl = partial.sourceUrl.trim();
  if (!title || !sourceUrl) return null;

  const description = clip(stripHtml(partial.description) || title, 20000);
  const companyName = clip(stripHtml(partial.companyName) || 'Company not listed', 255);
  const location = clip(stripHtml(partial.location) || partial.region, 255);

  return {
    ...partial,
    title,
    description,
    companyName,
    location,
    sourceUrl,
    salaryNormalizedUsd: toUsd(partial.salaryMin, partial.salaryMax, partial.salaryCurrency, partial.salaryPeriod),
  };
}

export function shouldExpire(input: {
  source: string;
  lastSeenAt: Date | null;
  expiresAt: Date | null;
  now: Date;
  staleDays?: number;
}): boolean {
  const staleDays = input.staleDays ?? 30;
  if (input.expiresAt && input.expiresAt.getTime() < input.now.getTime()) return true;
  if (input.source === 'direct' || !input.lastSeenAt) return false;
  const ageMs = input.now.getTime() - input.lastSeenAt.getTime();
  return ageMs > staleDays * 24 * 60 * 60 * 1000;
}

export function regionCurrency(region: RegionInfo): string {
  return region.currency;
}
