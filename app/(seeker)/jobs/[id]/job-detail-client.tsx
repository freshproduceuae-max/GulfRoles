'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import ApplyModal from '@/components/seeker/ApplyModal';
import { applyPathForJob, parseSource, sourceLabel } from '@/lib/job-source';

export interface JobView {
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
  source?: string | null;
  attribution?: string | null;
  benefits?: Record<string, unknown> | null;
  culture_notes?: string | null;
}

function formatSalary(job: JobView): string {
  if (!job.salary_min && !job.salary_max) return 'Salary not specified';
  const currency = job.salary_currency || 'AED';
  const min = job.salary_min ? job.salary_min.toLocaleString() : '';
  const max = job.salary_max ? job.salary_max.toLocaleString() : '';
  if (job.salary_min && job.salary_max) return `${currency} ${min} - ${max}`;
  if (job.salary_min) return `From ${currency} ${min}`;
  return `Up to ${currency} ${max}`;
}

export default function JobDetailClient({ job }: { job: JobView }) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { kind } = parseSource(job.source);
  const onSiteApply = kind === 'employer';

  const handleApply = () => {
    if (onSiteApply) {
      setShowApplyModal(true);
      return;
    }
    window.location.href = applyPathForJob(job.id);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <article className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{job.company_name}</p>
              </div>
              {job.employer_verified && (
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm font-medium rounded-full">
                  Verified
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{sourceLabel(job.source)}</p>
            {job.attribution && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Source:{' '}
                {job.source === 'feed:remoteok' ? (
                  <a className="underline" href="https://remoteok.com/" rel="nofollow noopener">
                    {job.attribution}
                  </a>
                ) : job.source === 'feed:remotive' ? (
                  <a className="underline" href="https://remotive.com/" rel="nofollow noopener">
                    {job.attribution}
                  </a>
                ) : (
                  job.attribution
                )}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {job.location && (
                <span className="text-gray-600 dark:text-gray-400">{job.location}</span>
              )}
              {job.job_type && (
                <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-full">
                  {job.job_type.replace(/_/g, ' ')}
                </span>
              )}
              {job.region && (
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                  {job.region}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Salary Range</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatSalary(job)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Posted Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(job.posted_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Kolkata',
                  })}
                </p>
              </div>
            </div>

            <Button variant="primary" size="lg" onClick={handleApply} className="w-full sm:w-auto">
              {onSiteApply ? 'Apply Now' : 'Apply on original site'}
            </Button>
          </div>

          <hr className="my-8 border-gray-200 dark:border-gray-800" />

          {job.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>
          )}

          {job.culture_notes && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Company Culture</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{job.culture_notes}</p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Interested in this position?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {onSiteApply
                  ? 'Apply now. Posting this role on GulfRoles is free for employers — no recruitment seats.'
                  : 'We send you to the employer or licensed feed apply page. Your click is tracked for CPC partners later.'}
              </p>
              <Button variant="primary" size="lg" onClick={handleApply}>
                {onSiteApply ? 'Apply Now' : 'Apply on original site'}
              </Button>
            </div>
          </div>
        </div>
      </article>

      {showApplyModal && (
        <ApplyModal jobId={job.id} jobTitle={job.title} onClose={() => setShowApplyModal(false)} />
      )}
    </div>
  );
}
