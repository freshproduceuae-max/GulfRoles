'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  status: string;
}

export default function InboxClient({ job, initialApplications }: { job: JobInfo; initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setError(null);
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      setError('The status was not saved. Try again.');
      return;
    }
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus as Application['status'] } : app))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm mb-2">
                <Link href="/employer/jobs" className="text-primary-700 underline">
                  Your jobs
                </Link>
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-700">
                {job.company_name} · {job.location} · {job.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-sm text-gray-700">{applications.length === 1 ? 'applicant' : 'applicants'}</p>
            </div>
          </div>

          {error && <p className="mb-4 text-red-800">{error}</p>}

          {applications.length > 0 ? (
            <ApplicantsList applications={applications} onStatusChange={handleStatusChange} />
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h2>
              <p className="text-gray-700">Applications appear here when someone applies on JobBrowser.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
