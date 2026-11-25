'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import ApplyModal from '@/components/seeker/ApplyModal';
import AdSlot from '@/components/monetization/AdSlot';

function leavesSite(source: string): boolean {
  return source !== 'direct';
}

export interface JobDetailProps {
  id: string;
  title: string;
  company_name: string;
  location: string;
  region: string;
  description: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  job_type?: string | null;
  employer_verified: boolean;
  posted_at: string;
  expires_at?: string | null;
  benefits?: Record<string, unknown> | null;
  culture_notes?: string | null;
  source: string;
  source_url?: string | null;
  attribution?: string | null;
  cpc_tracked?: boolean;
  is_featured?: boolean;
}

const PARTNER_NAMES: Record<string, string> = {
  careerjet: 'Careerjet',
  jooble: 'Jooble',
  adzuna: 'Adzuna',
  greenhouse: 'the company careers page',
  lever: 'the company careers page',
  ashby: 'the company careers page',
  workable: 'the company careers page',
  remoteok: 'Remote OK',
  remotive: 'Remotive',
};

function SaveJobButton({ jobId }: { jobId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('savedJobs');
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setSaved(Array.isArray(ids) && ids.includes(jobId));
    } catch {
      setSaved(false);
    }
  }, [jobId]);

  function toggle() {
    const raw = window.localStorage.getItem('savedJobs');
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    const next = saved ? ids.filter((id) => id !== jobId) : [...ids, jobId];
    window.localStorage.setItem('savedJobs', JSON.stringify(next));
    setSaved(!saved);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-900"
    >
      {saved ? 'Saved' : 'Save job'}
    </button>
  );
}

export default function JobDetailView({ job }: { job: JobDetailProps }) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const partner = leavesSite(job.source);
  const partnerName = PARTNER_NAMES[job.source] || job.source;

  const formatSalary = (): string => {
    if (!job.salary_min && !job.salary_max) return 'Salary not specified';
    const currency = job.salary_currency || 'USD';
    const min = job.salary_min ? job.salary_min.toLocaleString() : '';
    const max = job.salary_max ? job.salary_max.toLocaleString() : '';
    if (job.salary_min && job.salary_max) return `${currency} ${min} - ${max}`;
    if (job.salary_min) return `From ${currency} ${min}`;
    return `Up to ${currency} ${max}`;
  };

  const posted = new Date(job.posted_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <article className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{job.company_name}</p>
              </div>
              {job.employer_verified && (
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm font-medium rounded-full">
                  Verified employer
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-600 dark:text-gray-400">
              <span>{job.location}</span>
              {job.job_type && (
                <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full">
                  {job.job_type}
                </span>
              )}
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                {job.region}
              </span>
              {job.is_featured && (
                <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-900 rounded-full">Featured</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Salary</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatSalary()}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Posted</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{posted}</p>
              </div>
            </div>

            {partner ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-950">
                <p className="font-medium mb-1">You apply on {partnerName}</p>
                <p>{job.attribution || 'This listing is shown with the source’s permission.'}</p>
                {job.cpc_tracked ? (
                  <p className="mt-2">JobBrowser may earn a commission on this click. We do not send your CV or email, and we do not sell resumes.</p>
                ) : (
                  <p className="mt-2">JobBrowser is not paid for this click and does not sell resumes.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This job was posted by the employer. Your application is stored for that employer only. JobBrowser does not sell CVs.
              </p>
            )}

            {partner ? (
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/api/apply/click?job=${encodeURIComponent(job.id)}`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 font-medium text-white hover:bg-primary-600"
                >
                  Apply on {partnerName}
                </a>
                <SaveJobButton jobId={job.id} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="lg" onClick={() => setShowApplyModal(true)}>
                  Apply now
                </Button>
                <SaveJobButton jobId={job.id} />
              </div>
            )}
          </div>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_JOB} />

          <hr className="my-8 border-gray-200 dark:border-gray-800" />

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job description</h2>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{job.description}</div>
          </div>

          {job.culture_notes && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Company culture</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{job.culture_notes}</p>
            </div>
          )}

          {job.benefits && Object.keys(job.benefits).length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
              <ul className="space-y-2">
                {Object.entries(job.benefits).map(([key, value]) => (
                  <li key={key} className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                    {typeof value === 'string' ? `: ${value}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
      {showApplyModal && (
        <ApplyModal jobId={job.id} jobTitle={job.title} onClose={() => setShowApplyModal(false)} />
      )}
    </div>
  );
}
