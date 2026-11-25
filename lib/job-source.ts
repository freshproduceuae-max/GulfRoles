/**
 * Inventory source tags and Google Jobs / apply policy.
 * employer | ats:{vendor} | partner:{name} | feed:{name}
 */

export type SourceKind = 'employer' | 'ats' | 'partner' | 'feed' | 'unknown';

export const BLOCKED_INGEST_HOSTS = [
  'indeed.com',
  'www.indeed.com',
  'glassdoor.com',
  'www.glassdoor.com',
  'linkedin.com',
  'www.linkedin.com',
  'gulftalent.com',
  'www.gulftalent.com',
];

/** Partners whose terms forbid submitting listings to Google for Jobs unless an IO says otherwise. */
const NO_GOOGLE_JOBS_PREFIXES = [
  'feed:remotive',
  'partner:whatjobs',
  'partner:careerjet',
  'partner:jooble',
  'partner:adzuna',
  'partner:talent',
  'partner:jobg8',
  'partner:jobtome',
  'partner:jobrapido',
  'partner:gulftalent',
];

const GOOGLE_JOBS_ALLOWED_PREFIXES = [
  'employer',
  'direct',
  'ats:greenhouse',
  'ats:lever',
  'ats:ashby',
  'ats:workable',
  'feed:remoteok',
];

export function parseSource(source: string | null | undefined): {
  kind: SourceKind;
  vendor: string;
  tag: string;
} {
  const tag = (source || 'employer').trim().toLowerCase();
  if (tag === 'employer' || tag === 'direct') {
    return { kind: 'employer', vendor: 'gulfroles', tag: 'employer' };
  }
  const [kindRaw, vendor = ''] = tag.split(':', 2);
  if (kindRaw === 'ats' || kindRaw === 'partner' || kindRaw === 'feed') {
    return { kind: kindRaw, vendor, tag };
  }
  return { kind: 'unknown', vendor: tag, tag };
}

export function allowsGoogleJobs(source: string | null | undefined, override?: boolean | null): boolean {
  if (override === false) return false;
  if (override === true) return true;
  const { tag } = parseSource(source);
  if (NO_GOOGLE_JOBS_PREFIXES.some((p) => tag === p || tag.startsWith(p))) {
    return false;
  }
  return GOOGLE_JOBS_ALLOWED_PREFIXES.some((p) => tag === p || tag.startsWith(p));
}

export function isBlockedIngestUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BLOCKED_INGEST_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
  } catch {
    return true;
  }
}

export function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function applyPathForJob(jobId: string): string {
  return `/api/apply/click?job=${encodeURIComponent(jobId)}`;
}

export function sourceLabel(source: string | null | undefined): string {
  const { kind, vendor, tag } = parseSource(source);
  if (kind === 'employer') return 'Posted on GulfRoles';
  if (kind === 'ats') return `Company careers (${vendor})`;
  if (kind === 'feed') return vendor === 'remotive' ? 'Remotive' : vendor === 'remoteok' ? 'Remote OK' : tag;
  if (kind === 'partner') return `Partner: ${vendor}`;
  return tag;
}
