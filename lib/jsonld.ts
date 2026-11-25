import { regionByDb, regionFromParam } from './regions';
import { allowsGoogleJobs } from './sources/policy';

export interface JobPostingInput {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  region: string;
  datePosted: string | Date;
  validThrough?: string | Date | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  /** Only set when the source says the figure is annual or monthly. */
  salaryUnit?: 'YEAR' | 'MONTH' | null;
  directApply: boolean;
  url: string;
  source?: string | null;
  googleJobsAllowed?: boolean | null;
}

const EMPLOYMENT: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  internship: 'INTERN',
};

function isoDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

export function buildJobPostingJsonLd(job: JobPostingInput): Record<string, unknown> | null {
  if (!allowsGoogleJobs(job.source, job.googleJobsAllowed)) return null;
  const region = regionByDb(job.region) || regionFromParam(job.region);
  const description = job.description.trim() || job.title;
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description,
    datePosted: isoDate(job.datePosted),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: region?.country || job.region,
      },
    },
    identifier: {
      '@type': 'PropertyValue',
      name: 'JobBrowser',
      value: job.id,
    },
    url: job.url,
    directApply: job.directApply,
  };

  if (job.validThrough) {
    payload.validThrough = isoDate(job.validThrough);
  }

  const employmentType = job.employmentType ? EMPLOYMENT[job.employmentType] : undefined;
  if (employmentType) {
    payload.employmentType = employmentType;
  }

  if ((job.salaryMin || job.salaryMax) && job.salaryUnit) {
    const value: Record<string, unknown> = {
      '@type': 'QuantitativeValue',
      unitText: job.salaryUnit,
    };
    if (job.salaryMin) value.minValue = job.salaryMin;
    if (job.salaryMax) value.maxValue = job.salaryMax;
    if (!job.salaryMin && job.salaryMax) value.value = job.salaryMax;
    if (job.salaryMin && !job.salaryMax) value.value = job.salaryMin;
    payload.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salaryCurrency || region?.currency || 'USD',
      value,
    };
  }

  return payload;
}

/** Safe to drop into a script tag. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
