import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import Badge from '@/components/ui/Badge';
import type { Job } from '@/lib/validation';

interface JobMetaProps {
  job: Job;
}

const JobMeta: React.FC<JobMetaProps> = ({ job }) => {
  // Determine badge variant based on status
  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'FILLED':
        return 'warning';
      case 'EXPIRED':
        return 'error';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  // Format job type
  const formatJobType = (type: string): string => {
    return type.replace(/_/g, ' ');
  };

  // Format posted date
  const formattedPostedDate = formatDistanceToNow(job.posted_at, { addSuffix: true });
  const tooltipDate = format(job.posted_at, 'MMM d, yyyy');

  return (
    <div className="flex flex-col gap-3">
      {/* Location and Job Type Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location */}
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
          <span>{job.location}</span>
        </div>

        {/* Job Type Badge */}
        <Badge variant="default" size="sm">
          {formatJobType(job.job_type)}
        </Badge>

        {/* Status Badge */}
        <Badge variant={getStatusVariant(job.status)} size="sm">
          {job.status}
        </Badge>
      </div>

      {/* Posted Date and Verified Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Posted Date */}
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
          <span title={tooltipDate}>{formattedPostedDate}</span>
        </div>

        {/* Verified Badge */}
        {job.employer_verified && (
          <div className="flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span className="font-medium">Verified</span>
          </div>
        )}

        {/* Application Count */}
        {job.application_count > 0 && (
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{job.application_count} application{job.application_count !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMeta;
