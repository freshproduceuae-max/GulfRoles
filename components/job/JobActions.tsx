'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import type { Job } from '@/lib/validation';

interface JobActionsProps {
  job: Job;
  onApplyClick?: () => void;
  affiliate?: 'careerjet' | 'jooble';
}

const JobActions: React.FC<JobActionsProps> = ({ job, onApplyClick, affiliate = 'careerjet' }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('savedJobs');
    if (savedJobs) {
      try {
        const saved = JSON.parse(savedJobs) as string[];
        setIsSaved(saved.includes(job.id));
      } catch {
        console.error('Failed to parse saved jobs from localStorage');
      }
    }
  }, [job.id]);

  // Handle save/bookmark
  const handleSaveClick = () => {
    try {
      const savedJobs = localStorage.getItem('savedJobs');
      let saved: string[] = [];

      if (savedJobs) {
        saved = JSON.parse(savedJobs);
      }

      if (isSaved) {
        // Remove from saved
        saved = saved.filter((id) => id !== job.id);
      } else {
        // Add to saved
        saved.push(job.id);
      }

      localStorage.setItem('savedJobs', JSON.stringify(saved));
      setIsSaved(!isSaved);
    } catch {
      console.error('Failed to save job');
    }
  };

  // Handle share click
  const handleShareClick = () => {
    setIsShareOpen(!isShareOpen);
  };

  // Handle share to clipboard
  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/jobs/${job.id}`;
      await navigator.clipboard.writeText(url);
      setIsShareOpen(false);
      // Could show a toast notification here in a real app
    } catch {
      console.error('Failed to copy link');
    }
  };

  // Handle share via email (simulated)
  const handleShareEmail = () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    const subject = `Check out this job: ${job.title}`;
    const body = `I found this job listing that might interest you:\n\n${job.title} at ${job.company_name}\n\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Handle apply click - redirects through affiliate tracking
  const handleApplyClick = async () => {
    // Call the parent callback if provided
    if (onApplyClick) {
      onApplyClick();
    }

    // Track click and redirect to affiliate URL
    try {
      const affiliateUrl = `/api/affiliate/click?job=${job.id}&network=${affiliate}&title=${encodeURIComponent(
        job.title
      )}`;
      window.location.href = affiliateUrl;
    } catch (error) {
      console.error('Failed to redirect to affiliate click tracker:', error);
      // Fallback: just call the callback
      if (onApplyClick) {
        onApplyClick();
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          variant="primary"
          size="md"
          onClick={handleApplyClick}
          className="flex-1"
          aria-label={`Apply for ${job.title} position`}
        >
          Apply Now
        </Button>

        {/* Save/Bookmark Button */}
        <button
          onClick={handleSaveClick}
          className={`
            flex items-center justify-center gap-2 px-4 py-2 rounded-lg
            font-medium transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500
            ${
              isSaved
                ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-100'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
          aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
          aria-pressed={isSaved}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isSaved ? 'scale-125' : ''}`}
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={handleShareClick}
            className="
              flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              font-medium transition-colors duration-200
              bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            "
            aria-label="Share job"
            aria-expanded={isShareOpen}
            aria-haspopup="menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Share Dropdown Menu */}
          {isShareOpen && (
            <div
              className="
                absolute right-0 top-full mt-2 bg-white dark:bg-gray-800
                rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                min-w-max z-10
              "
              role="menu"
            >
              <button
                onClick={handleCopyLink}
                className="
                  w-full text-left px-4 py-2 text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors duration-200
                  first:rounded-t-lg
                "
                role="menuitem"
              >
                Copy link
              </button>
              <button
                onClick={handleShareEmail}
                className="
                  w-full text-left px-4 py-2 text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors duration-200
                  last:rounded-b-lg
                "
                role="menuitem"
              >
                Share via email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobActions;
