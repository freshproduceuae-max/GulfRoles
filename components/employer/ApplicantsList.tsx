'use client';

import { useState } from 'react';

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  resume_filename?: string;
  cover_letter?: string;
  knockout?: boolean;
  rating?: number | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected' | 'submitted' | 'viewed';
  created_at: string;
  updated_at: string;
}

interface ApplicantsListProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: string) => void;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-950' },
  submitted: { label: 'New', color: 'bg-blue-100 text-blue-950' },
  reviewed: { label: 'Reviewed', color: 'bg-gray-200 text-gray-950' },
  viewed: { label: 'Reviewed', color: 'bg-gray-200 text-gray-950' },
  shortlisted: { label: 'Shortlisted', color: 'bg-green-100 text-green-950' },
  interview: { label: 'Interview', color: 'bg-amber-100 text-amber-950' },
  offer: { label: 'Offer', color: 'bg-indigo-100 text-indigo-950' },
  hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-950' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-950' },
};

export default function ApplicantsList({ applications, onStatusChange }: ApplicantsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (appId: string, newStatus: string) => {
    onStatusChange(appId, newStatus);
  };

  return (
    <div className="space-y-3">
      {applications.map((application) => (
        <div key={application.id} data-status={application.status}>
          {/* Collapsed View */}
          <button
            onClick={() => setExpandedId(expandedId === application.id ? null : application.id)}
            className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {application.applicant_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {application.applicant_email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Applied {formatDate(application.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${(statusConfig[application.status] || statusConfig.new).color}`}>
                  {(statusConfig[application.status] || statusConfig.new).label}
                  {application.knockout ? ' · Must-have missed' : ''}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === application.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </button>

          {/* Expanded View */}
          {expandedId === application.id && (
            <div className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Contact Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {application.applicant_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Email</p>
                    <a
                      href={`mailto:${application.applicant_email}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {application.applicant_email}
                    </a>
                  </div>
                  {application.applicant_phone && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Phone</p>
                      <a
                        href={`tel:${application.applicant_phone}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {application.applicant_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume */}
              {application.resume_url && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Resume
                  </h4>
                  <a
                    href={`/employer/applicants/${application.id}`}
                    className="inline-flex mr-2 items-center gap-2 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg"
                  >
                    Open applicant
                  </a>
                  <a
                    href={`${application.resume_url}${application.resume_url?.includes('?') ? '&' : '?'}inline=1`}
                    className="inline-flex mr-2 items-center gap-2 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg"
                  >
                    View CV
                  </a>
                  <a
                    href={application.resume_url}
                    download={application.resume_filename}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download CV
                  </a>
                </div>
              )}

              {/* Cover Letter */}
              {application.cover_letter && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Cover note
                  </h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-gray-200 dark:border-gray-700">
                    {application.cover_letter}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Update Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['new', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'] as const).map((statusKey) => {
                    const statusData = statusConfig[statusKey];
                    return (
                    <button
                      key={statusKey}
                      onClick={() => handleStatusChange(application.id, statusKey)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        application.status === statusKey
                          ? `${statusData.color} ring-2 ring-offset-2 ring-primary-500`
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {statusData.label}
                    </button>
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Applied on {formatDate(application.created_at)}
                  {application.updated_at !== application.created_at && (
                    <span> • Last updated {formatDate(application.updated_at)}</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
