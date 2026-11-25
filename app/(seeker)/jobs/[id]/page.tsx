import { notFound } from 'next/navigation';
import { getJobById } from '@/lib/search';
import { buildJobPostingJsonLd } from '@/lib/jsonld';
import JobDetailClient, { type JobView } from './job-detail-client';

export const dynamic = 'force-dynamic';

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  let job;
  try {
    job = await getJobById(params.id);
  } catch {
    notFound();
  }

  if (!job) {
    notFound();
  }

  const origin = process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://gulfroles.com';
  const pageUrl = `${origin}/jobs/${job.id}`;
  const jsonLd = buildJobPostingJsonLd(
    {
      ...job,
      posted_at: job.posted_at,
      expires_at: job.expires_at,
    },
    pageUrl
  );

  const view: JobView = {
    id: job.id,
    title: job.title,
    company_name: job.company_name,
    location: job.location,
    region: job.region,
    description: job.description,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency,
    job_type: job.job_type,
    employer_verified: job.employer_verified,
    posted_at: job.posted_at instanceof Date ? job.posted_at.toISOString() : String(job.posted_at),
    expires_at: job.expires_at
      ? job.expires_at instanceof Date
        ? job.expires_at.toISOString()
        : String(job.expires_at)
      : null,
    source: job.source,
    attribution: job.attribution ?? null,
    benefits: job.benefits,
    culture_notes: job.culture_notes,
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JobDetailClient job={view} />
    </>
  );
}
