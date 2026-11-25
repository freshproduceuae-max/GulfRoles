/**
 * Per-source rules for attribution, Google JobPosting, and CPC tracking.
 * Defaults follow the 25 Nov 2026 source catalog: markup only when we own
 * or license the listing. CPC partners stay unmarked until an insertion order says yes.
 */

export type SourceKind = 'employer' | 'ats' | 'partner' | 'feed';

export interface SourcePolicy {
  id: string;
  kind: SourceKind;
  label: string;
  attribution: string;
  googleJobs: boolean;
  cpcTracked: boolean;
  /** Safe to include in a future outbound feed to Trovit/Jooble/etc. */
  redistributable: boolean;
}

export const BLOCKED_INGEST_HOSTS = [
  'indeed.com',
  'glassdoor.com',
  'linkedin.com',
  'gulftalent.com',
];

const POLICIES: SourcePolicy[] = [
  {
    id: 'direct',
    kind: 'employer',
    label: 'Posted on JobBrowser',
    attribution: 'Posted by the employer on JobBrowser. Applying here does not pay a job-board commission.',
    googleJobs: true,
    cpcTracked: false,
    redistributable: true,
  },
  {
    id: 'greenhouse',
    kind: 'ats',
    label: 'Greenhouse careers board',
    attribution: 'Indexed from the employer’s public Greenhouse board, with their permission. Apply on the company site.',
    googleJobs: true,
    cpcTracked: false,
    redistributable: true,
  },
  {
    id: 'lever',
    kind: 'ats',
    label: 'Lever careers board',
    attribution: 'Indexed from the employer’s public Lever board, with their permission. Apply on the company site.',
    googleJobs: true,
    cpcTracked: false,
    redistributable: true,
  },
  {
    id: 'ashby',
    kind: 'ats',
    label: 'Ashby careers board',
    attribution: 'Indexed from the employer’s public Ashby board, with their permission. Apply on the company site.',
    googleJobs: true,
    cpcTracked: false,
    redistributable: true,
  },
  {
    id: 'workable',
    kind: 'ats',
    label: 'Workable careers board',
    attribution: 'Indexed from the employer’s public Workable board, with their permission. Apply on the company site.',
    googleJobs: true,
    cpcTracked: false,
    redistributable: true,
  },
  {
    id: 'remoteok',
    kind: 'feed',
    label: 'Remote OK',
    attribution: 'Listing from Remote OK. JobBrowser links back to the original posting.',
    googleJobs: true,
    cpcTracked: false,
    redistributable: false,
  },
  {
    id: 'remotive',
    kind: 'feed',
    label: 'Remotive',
    attribution: 'Listing from Remotive. This job is not submitted to Google for Jobs, Jooble, or other boards.',
    googleJobs: false,
    cpcTracked: false,
    redistributable: false,
  },
  {
    id: 'careerjet',
    kind: 'partner',
    label: 'Careerjet',
    attribution: 'Careerjet partner listing. JobBrowser may earn a commission if you continue. Not marked up for Google for Jobs until Careerjet agrees in writing.',
    googleJobs: false,
    cpcTracked: true,
    redistributable: false,
  },
  {
    id: 'jooble',
    kind: 'partner',
    label: 'Jooble',
    attribution: 'Jooble partner listing. JobBrowser may earn a commission if you continue. Not marked up for Google for Jobs until Jooble agrees in writing.',
    googleJobs: false,
    cpcTracked: true,
    redistributable: false,
  },
  {
    id: 'whatjobs',
    kind: 'partner',
    label: 'WhatJobs',
    attribution: 'WhatJobs partner listing. Not marked up for Google for Jobs unless the insertion order allows it.',
    googleJobs: false,
    cpcTracked: true,
    redistributable: false,
  },
  {
    id: 'adzuna',
    kind: 'partner',
    label: 'Adzuna',
    attribution: 'Adzuna partner listing. JobBrowser may earn a commission if you continue. Not marked up for Google for Jobs until Adzuna agrees in writing.',
    googleJobs: false,
    cpcTracked: true,
    redistributable: false,
  },
];

const BY_ID = new Map(POLICIES.map((policy) => [policy.id, policy]));

export function canonicalSourceId(source: string | null | undefined): string {
  let id = (source || 'direct').trim().toLowerCase();
  if (id === 'employer') return 'direct';
  const colon = id.indexOf(':');
  if (colon > 0) id = id.slice(colon + 1);
  return id;
}

export function policyFor(source: string | null | undefined): SourcePolicy {
  const id = canonicalSourceId(source);
  return (
    BY_ID.get(id) || {
      id,
      kind: 'partner',
      label: id,
      attribution: 'Source terms are not confirmed. This listing is not marked up for Google for Jobs.',
      googleJobs: false,
      cpcTracked: false,
      redistributable: false,
    }
  );
}

export function allowsGoogleJobs(
  source: string | null | undefined,
  override?: boolean | null
): boolean {
  if (override === false) return false;
  if (override === true) return true;
  return policyFor(source).googleJobs;
}

export function isBlockedIngestUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const labels = host.split('.');
    return BLOCKED_INGEST_HOSTS.some((blocked) => {
      const brand = blocked.split('.')[0];
      return labels.includes(brand);
    });
  } catch {
    return true;
  }
}

export function atsVendors(): SourcePolicy[] {
  return POLICIES.filter((policy) => policy.kind === 'ats');
}
