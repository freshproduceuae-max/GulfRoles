'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import ApplyModal from '@/components/seeker/ApplyModal';

interface JobDetail {
  id: string;
  title: string;
  company_name: string;
  location: string;
  region: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  job_type?: string;
  employer_verified: boolean;
  posted_at: string;
  expires_at?: string;
  benefits?: Record<string, any>;
  culture_notes?: string;
}

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/jobs?q=&page=1&limit=1`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // For MVP, fetch all jobs and filter by ID
        // This is a workaround since there's no dedicated GET /api/jobs/:id endpoint
        // In production, create a dedicated endpoint
        const jobList = await fetch(`/api/jobs?page=1&limit=100`).then(r => r.json());
        const foundJob = jobList.jobs?.find((j: any) => j.id === jobId);

        if (!foundJob) {
          throw new Error('Job not found');
        }

        setJob(foundJob);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load job details';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const formatSalary = (): string => {
    if (!job) return '';
    if (!job.salary_min && !job.salary_max) {
      return 'Salary not specified';
    }

    const currency = job.salary_currency || 'AED';
    const min = job.salary_min ? job.salary_min.toLocaleString() : '';
    const max = job.salary_max ? job.salary_max.toLocaleString() : '';

    if (job.salary_min && job.salary_max) {
      return `${currency} ${min} - ${max}`;
    }

    if (job.salary_min) {
      return `From ${currency} ${min}`;
    }

    return `Up to ${currency} ${max}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Loading count={3} />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Job not found'}
          </h1>
          <Button
            variant="primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <article className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {job.company_name}
                </p>
              </div>
              {job.employer_verified && (
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm font-medium rounded-full">
                  Verified
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {job.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{job.location}</span>
                </div>
              )}

              {job.job_type && (
                <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full">
                  {job.job_type.replace(/_/g, ' ')}
                </span>
              )}

              {job.region && (
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                  {job.region}
                </span>
              )}
            </div>

            {/* Salary and Posted Date */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Salary Range</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatSalary()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Posted Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(job.posted_at)}
                </p>
              </div>
            </div>

            {/* Apply Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowApplyModal(true)}
              className="w-full sm:w-auto"
            >
              Apply Now
            </Button>
          </div>

          {/* Divider */}
          <hr className="my-8 border-gray-200 dark:border-gray-800" />

          {/* Description */}
          {job.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Job Description
              </h2>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>
          )}

          {/* Culture Notes */}
          {job.culture_notes && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Company Culture
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {job.culture_notes}
              </p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && Object.keys(job.benefits).length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Benefits
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(job.benefits).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      {typeof value === 'string' && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Interested in this position?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Apply now and let the employer know why you&apos;re a great fit for this role.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowApplyModal(true)}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
}
