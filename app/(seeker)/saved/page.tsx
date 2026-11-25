'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import JobCard from '@/components/job/JobCard';

interface SavedJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  job_type?: string | null;
  posted_at?: string;
  region?: string;
  source?: string;
  description?: string;
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [missing, setMissing] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('savedJobs');
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    if (!Array.isArray(ids) || ids.length === 0) {
      setMessage('You have not saved any jobs in this browser yet.');
      return;
    }

    Promise.all(
      ids.slice(0, 50).map(async (id) => {
        const response = await fetch(`/api/jobs/${id}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.job as SavedJob;
      })
    )
      .then((rows) => {
        const found = rows.filter((job): job is SavedJob => Boolean(job));
        setJobs(found);
        setMissing(ids.length - found.length);
        if (found.length === 0) {
          setMessage('Saved jobs could not be loaded. They may have expired, or the database is not connected.');
        }
      })
      .catch(() => setMessage('Saved jobs could not be loaded.'));
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Saved jobs</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Saved on this device only. No account is required. <Link className="underline" href="/search">Back to search</Link>
      </p>
      {message && <p className="text-gray-700 dark:text-gray-300">{message}</p>}
      {missing > 0 && jobs.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">{missing} saved job{missing === 1 ? '' : 's'} {missing === 1 ? 'is' : 'are'} no longer available.</p>
      )}
      <div className="space-y-4">
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
            source={job.source}
            description={job.description}
          />
        ))}
      </div>
    </div>
  );
}
