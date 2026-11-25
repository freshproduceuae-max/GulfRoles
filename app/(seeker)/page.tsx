import type { Metadata } from 'next';
import Link from 'next/link';
import HomeSearch from '@/components/seeker/HomeSearch';
import AlertSignup from '@/components/seeker/AlertSignup';
import AdSlot from '@/components/monetization/AdSlot';
import JobCard from '@/components/job/JobCard';
import { getFeaturedJobs, type PublicJob } from '@/lib/jobs';
import { REGION_LIST, type RegionInfo } from '@/lib/regions';
import { appBaseUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

async function loadJobs(region?: string): Promise<PublicJob[]> {
  try {
    return await getFeaturedJobs(region);
  } catch (error) {
    console.error('Featured jobs unavailable', error instanceof Error ? error.message : error);
    return [];
  }
}

export function regionMetadata(region?: RegionInfo): Metadata {
  const base = appBaseUrl();
  const title = region ? `Jobs in ${region.name} | JobBrowser` : 'JobBrowser — Find your next job';
  const description = region
    ? `Search jobs in ${region.name}. Listings come from employers and from Careerjet, Jooble, and Adzuna.`
    : 'Search jobs in the UAE, Saudi Arabia, India, Australia, and the United States.';
  const path = region ? `/${region.slug}` : '/';
  return {
    title,
    description,
    alternates: { canonical: `${base}${path}` },
    openGraph: { title, description, url: `${base}${path}`, siteName: 'JobBrowser', type: 'website' },
  };
}

export function HomeView({ region, jobs }: { region?: RegionInfo; jobs: PublicJob[] }) {
  return (
    <div className="bg-white dark:bg-gray-950">
      <div className={region ? `bg-gradient-to-b ${region.accent} text-white` : ''}>
        <div className={region ? 'bg-white/95 dark:bg-gray-950/95' : ''}>
          <HomeSearch regionDb={region?.db} regionLabel={region?.name} />
        </div>
      </div>

      <nav aria-label="Regions" className="px-4 sm:px-6 lg:px-8 pb-8">
        <ul className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
          {REGION_LIST.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/${item.slug}`}
                className={`px-3 py-1 rounded-full text-sm border ${
                  region?.slug === item.slug
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-gray-300 text-gray-700 dark:text-gray-200'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} />

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {region ? `Latest jobs in ${region.name}` : 'Latest jobs'}
          </h2>
          {jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                No listings yet. They appear after the job feeds are connected, or when an employer posts one.
              </p>
              <Link href={region ? `/search?region=${region.db}` : '/search'} className="text-primary-600 underline">
                Search anyway
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company_name={job.company_name}
                  location={job.location}
                  salary_min={job.salary_min}
                  salary_max={job.salary_max}
                  salary_currency={job.salary_currency || undefined}
                  job_type={job.job_type || undefined}
                  posted_at={job.posted_at}
                  region={job.region}
                  description={job.description}
                  employer_verified={job.employer_verified}
                  featured={job.is_featured}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="job-alerts" className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Weekly email alerts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            One digest a week. The address is used for that email only. Unsubscribe from any message.
          </p>
          <AlertSignup location={region?.location} />
        </div>
      </section>
    </div>
  );
}

export default async function Homepage() {
  const jobs = await loadJobs();
  return <HomeView jobs={jobs} />;
}

export const metadata = regionMetadata();
