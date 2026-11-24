import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobDetailView from '@/components/job/JobDetailView';
import { buildJobPostingJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { getJobById, isPublicListing } from '@/lib/jobs';
import { appBaseUrl } from '@/lib/site';
import { regionByDb } from '@/lib/regions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const job = await getJobById(params.id);
    if (!job || !isPublicListing(job)) return { title: 'Job not found | JobBrowser' };
    const description = job.description.slice(0, 160);
    const url = `${appBaseUrl()}/jobs/${job.id}`;
    return {
      title: `${job.title} at ${job.company_name} | JobBrowser`,
      description,
      alternates: { canonical: url },
      openGraph: { title: job.title, description, url, type: 'website' },
    };
  } catch {
    return { title: 'Job | JobBrowser' };
  }
}

export default async function JobPage({ params }: { params: { id: string } }) {
  let job = null;
  let unavailable = false;
  try {
    job = await getJobById(params.id);
  } catch (error) {
    console.error('Job page database error', error instanceof Error ? error.message : error);
    unavailable = true;
  }

  if (unavailable) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Listings are temporarily unavailable</h1>
        <p className="text-gray-600">The page will work again once the database is connected.</p>
      </div>
    );
  }

  if (!job || !isPublicListing(job)) notFound();

  const region = regionByDb(job.region);
  const jsonLd = buildJobPostingJsonLd({
    id: job.id,
    title: job.title,
    description: job.description,
    companyName: job.company_name,
    location: job.location,
    region: job.region,
    datePosted: job.posted_at,
    validThrough: job.expires_at,
    employmentType: job.job_type,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryCurrency: job.salary_currency,
    salaryUnit: null,
    directApply: job.source === 'direct',
    url: `${appBaseUrl()}/jobs/${job.id}`,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <JobDetailView
        job={{
          ...job,
          salary_currency: job.salary_currency || region?.currency || null,
        }}
      />
    </>
  );
}
