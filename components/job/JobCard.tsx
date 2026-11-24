'use client';

import React from 'react';
import Link from 'next/link';
import type { Job } from '@/lib/validation';

// Support both full Job object and partial job data
interface JobCardProps {
  job?: Partial<Job>;
  id?: string;
  title?: string;
  company_name?: string;
  location?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  job_type?: string;
  posted_at?: string | Date;
  region?: string;
  description?: string;
  employer_verified?: boolean;
  status?: string;
  application_count?: number;
  featured?: boolean;
  onApplyClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  id: propsId,
  title: propsTitle,
  company_name: propsCompanyName,
  location: propsLocation,
  salary_min: propsSalaryMin,
  salary_max: propsSalaryMax,
  salary_currency: propsSalaryCurrency,
  job_type: propsJobType,
  posted_at: propsPostedAt,
  region: propsRegion,
  description: propsDescription,
  employer_verified: propsVerified,
  status: propsStatus,
  application_count: propsApplicationCount,
  featured = false,
  onApplyClick,
}) => {
  // Merge job object and individual props (props take precedence)
  const jobData = {
    id: propsId || job?.id || '',
    title: propsTitle || job?.title || '',
    company_name: propsCompanyName || job?.company_name || '',
    location: propsLocation || job?.location || '',
    salary_min: propsSalaryMin !== undefined ? propsSalaryMin : job?.salary_min,
    salary_max: propsSalaryMax !== undefined ? propsSalaryMax : job?.salary_max,
    salary_currency: propsSalaryCurrency || job?.salary_currency || 'AED',
    job_type: propsJobType || job?.job_type || '',
    posted_at: propsPostedAt || job?.posted_at,
    region: propsRegion || job?.region || '',
    description: propsDescription || job?.description || '',
    employer_verified: propsVerified ?? job?.employer_verified ?? false,
    status: propsStatus || job?.status || 'ACTIVE',
    application_count: propsApplicationCount ?? job?.application_count ?? 0,
  };

  // Format salary range
  const formatSalary = (): string => {
    if (!jobData.salary_min && !jobData.salary_max) {
      return 'Salary not specified';
    }

    const currency = jobData.salary_currency || 'AED';
    const min = jobData.salary_min ? jobData.salary_min.toLocaleString() : '';
    const max = jobData.salary_max ? jobData.salary_max.toLocaleString() : '';

    if (jobData.salary_min && jobData.salary_max) {
      return `${currency} ${min} - ${max}`;
    }

    if (jobData.salary_min) {
      return `From ${currency} ${min}`;
    }

    return `Up to ${currency} ${max}`;
  };

  // Format posted date
  const formatPostedDate = (): string => {
    if (!jobData.posted_at) return '';

    const date = typeof jobData.posted_at === 'string'
      ? new Date(jobData.posted_at)
      : jobData.posted_at;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <article
      className="
        flex flex-col bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm hover:shadow-md
        transition-shadow duration-200
        overflow-hidden
      "
    >
      {/* Card Content - Clickable */}
      <Link href={`/jobs/${jobData.id}`} className="flex-1 p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
        <div className="flex flex-col gap-4">
          {/* Header: Company Logo + Title + Company */}
          <div className="flex gap-4">
            {/* Company Logo Placeholder */}
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {jobData.company_name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Title and Company */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {featured && <span className="mr-2 text-xs font-medium text-amber-700">Featured</span>}
                {jobData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {jobData.company_name}
              </p>
            </div>
          </div>

          {/* Salary */}
          <div className="text-base font-semibold text-secondary-600 dark:text-secondary-400">
            {formatSalary()}
          </div>

          {/* Meta Information Row */}
          <div className="flex flex-wrap items-center gap-3">
            {jobData.location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{jobData.location}</span>
              </div>
            )}

            {jobData.job_type && (
              <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                {jobData.job_type.replace(/_/g, ' ')}
              </span>
            )}

            {jobData.posted_at && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatPostedDate()}</span>
              </div>
            )}
          </div>

          {/* Description Preview */}
          {jobData.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {jobData.description}
            </p>
          )}
        </div>
      </Link>

      {/* Actions - Not clickable to navigate */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        {onApplyClick ? (
          <button
            onClick={onApplyClick}
            className="w-full px-4 py-2 rounded-lg font-medium bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Apply Now
          </button>
        ) : (
          <Link
            href={`/jobs/${jobData.id}`}
            className="block w-full px-4 py-2 rounded-lg font-medium text-center bg-primary-500 text-white hover:bg-primary-600"
          >
            View job
          </Link>
        )}
      </div>
    </article>
  );
};

export default JobCard;
