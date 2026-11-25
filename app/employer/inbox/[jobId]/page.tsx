'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import ApplicantsList from '@/components/employer/ApplicantsList';

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  resume_filename?: string;
  cover_letter?: string;
  status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
  updated_at: string;
}

interface JobInfo {
  id: string;
  title: string;
  company_name: string;
  location: string;
}

export default function InboxPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<JobInfo | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch job details
        const jobResult = await fetch(`/api/jobs?page=1&limit=100`);
        const jobData = await jobResult.json();

        if (jobData.error) {
          throw new Error('Failed to load job');
        }

        const foundJob = jobData.jobs?.find((j: any) => j.id === jobId);
        if (!foundJob) {
          throw new Error('Job not found');
        }

        setJob(foundJob);

        // Fetch applications for this job
        const appResult = await fetch(`/api/applications?job_id=${jobId}`);
        const appData = await appResult.json();

        if (appData.error) {
          throw new Error('Failed to load applications');
        }

        setApplications(appData.applications || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus as any } : app
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <Loading count={3} />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Job not found'}
          </h1>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {job.company_name} • {job.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {applications.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {applications.length === 1 ? 'Application' : 'Applications'}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-800" />
          </div>

          {/* Statistics */}
          {applications.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.filter(a => a.status === 'submitted').length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.filter(a => a.status === 'shortlisted').length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.filter(a => a.status === 'rejected').length}
                </p>
              </div>
            </div>
          )}

          {/* Applicants List */}
          {applications.length > 0 ? (
            <ApplicantsList
              applications={applications}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Applications will appear here as job seekers apply for this position.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
