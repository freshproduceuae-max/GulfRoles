import { allowsGoogleJobs } from './job-source';

const REGION_COUNTRY: Record<string, string> = {
  UAE: 'AE',
  Saudi: 'SA',
  India: 'IN',
  Australia: 'AU',
  USA: 'US',
};

export interface JobPostingInput {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  job_type?: string | null;
  source?: string | null;
  google_jobs_allowed?: boolean | null;
  posted_at?: string | Date | null;
  expires_at?: string | Date | null;
}

function employmentType(jobType?: string | null): string {
  switch ((jobType || '').toLowerCase().replace('_', '-')) {
    case 'part-time':
      return 'PART_TIME';
    case 'contract':
      return 'CONTRACTOR';
    case 'internship':
      return 'INTERN';
    default:
      return 'FULL_TIME';
  }
}

function iso(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * JobPosting JSON-LD for Google Jobs. Returns null when the source forbids markup.
 */
export function buildJobPostingJsonLd(
  job: JobPostingInput,
  pageUrl: string
): Record<string, unknown> | null {
  if (!allowsGoogleJobs(job.source, job.google_jobs_allowed)) {
    return null;
  }

  const country = REGION_COUNTRY[job.region] || 'AE';
  const datePosted = iso(job.posted_at) || new Date().toISOString();

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: country,
      },
    },
    employmentType: employmentType(job.job_type),
    url: pageUrl,
    identifier: {
      '@type': 'PropertyValue',
      name: 'GulfRoles',
      value: job.id,
    },
  };

  const validThrough = iso(job.expires_at);
  if (validThrough) schema.validThrough = validThrough;

  if (job.salary_min || job.salary_max) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salary_currency || 'AED',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min || job.salary_max,
        maxValue: job.salary_max || job.salary_min,
        unitText: 'MONTH',
      },
    };
  }

  return schema;
}
