'use client';

import { useState, useEffect } from 'react';

interface JobPreviewModalProps {
  jobId: string;
  onClose: () => void;
}

interface JobDetails {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: string;
  employer_email: string | null;
  employer_verified: boolean;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  posted_at: string;
  flag_id: string;
  rule_triggered: string;
  confidence: number;
  admin_notes: string | null;
}

export default function JobPreviewModal({ jobId, onClose }: JobPreviewModalProps) {
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/moderation/job/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || 'Job not found'}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const flagConfidenceColor =
    job.confidence >= 0.8
      ? 'bg-red-50 border-red-200'
      : job.confidence >= 0.5
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-blue-50 border-blue-200';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{job.company_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Flag Info */}
          <div className={`border rounded-lg p-4 ${flagConfidenceColor}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">Flagged: {job.rule_triggered}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Confidence: {(job.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    job.confidence >= 0.8
                      ? 'bg-red-600'
                      : job.confidence >= 0.5
                        ? 'bg-yellow-600'
                        : 'bg-blue-600'
                  }`}
                  style={{ width: `${job.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
              <p className="text-gray-900">{job.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Region</p>
              <p className="text-gray-900">{job.region}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Job Type</p>
              <p className="text-gray-900">{job.job_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Posted</p>
              <p className="text-gray-900">{new Date(job.posted_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Salary</p>
              <p className="text-gray-900">
                {job.salary_min && job.salary_max
                  ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Employer Email</p>
              <p className="text-gray-900">{job.employer_email || 'Not provided'}</p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Employer Verification</p>
            <p className={`text-sm ${job.employer_verified ? 'text-green-600' : 'text-red-600'}`}>
              {job.employer_verified ? 'Verified' : 'Not verified'}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Job Description</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-48 overflow-y-auto">
              {job.description}
            </div>
          </div>

          {/* Admin Notes */}
          {job.admin_notes && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Admin Notes</p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                {job.admin_notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
