'use client';

import { useState, useEffect } from 'react';

interface FlaggedJob {
  id: string;
  title: string;
  company_name: string;
  employer_email: string | null;
  rule_triggered: string;
  confidence: number;
  reason: string;
  flag_id: string;
  posted_at: string;
  created_at: string;
}

interface ModerationQueueProps {
  onJobSelect?: (jobId: string) => void;
}

export default function ModerationQueue({ onJobSelect }: ModerationQueueProps) {
  const [jobs, setJobs] = useState<FlaggedJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [filterRule, setFilterRule] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const response = await fetch(`/api/moderation/queue?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch flagged jobs');
        }

        const data = await response.json();
        setJobs(data.jobs);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [page]);

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === jobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(jobs.map(j => j.id)));
    }
  };

  const handleApprove = async (flagId: string) => {
    try {
      const response = await fetch('/api/moderation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_id: flagId,
          decision: 'approve',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve job');
      }

      // Remove from list
      setJobs(jobs.filter(j => j.flag_id !== flagId));
      setTotal(Math.max(0, total - 1));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error approving job');
    }
  };

  const handleReject = async (flagId: string) => {
    try {
      const response = await fetch('/api/moderation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_id: flagId,
          decision: 'reject',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject job');
      }

      // Remove from list
      setJobs(jobs.filter(j => j.flag_id !== flagId));
      setTotal(Math.max(0, total - 1));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error rejecting job');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedJobs.size === 0) return;

    try {
      const flagIds = jobs
        .filter(j => selectedJobs.has(j.id))
        .map(j => j.flag_id);

      for (const flagId of flagIds) {
        await fetch('/api/moderation/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flag_id: flagId,
            decision: 'approve',
          }),
        });
      }

      setJobs(jobs.filter(j => !selectedJobs.has(j.id)));
      setTotal(Math.max(0, total - selectedJobs.size));
      setSelectedJobs(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error approving jobs');
    }
  };

  const handleBatchReject = async () => {
    if (selectedJobs.size === 0) return;

    try {
      const flagIds = jobs
        .filter(j => selectedJobs.has(j.id))
        .map(j => j.flag_id);

      for (const flagId of flagIds) {
        await fetch('/api/moderation/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flag_id: flagId,
            decision: 'reject',
          }),
        });
      }

      setJobs(jobs.filter(j => !selectedJobs.has(j.id)));
      setTotal(Math.max(0, total - selectedJobs.size));
      setSelectedJobs(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error rejecting jobs');
    }
  };

  const filteredJobs = filterRule
    ? jobs.filter(j => j.rule_triggered === filterRule)
    : jobs;

  const pages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          Total flagged jobs: <span className="font-bold text-gray-900">{total}</span>
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterRule(null)}
            className={`px-3 py-1 text-sm rounded ${
              filterRule === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {['keyword_blocklist', 'unverified_employer', 'posting_velocity', 'suspicious_link'].map(rule => (
            <button
              key={rule}
              onClick={() => setFilterRule(rule)}
              className={`px-3 py-1 text-sm rounded whitespace-nowrap ${
                filterRule === rule
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rule.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {selectedJobs.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleBatchApprove}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve ({selectedJobs.size})
            </button>
            <button
              onClick={handleBatchReject}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject ({selectedJobs.size})
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedJobs.size === jobs.length && jobs.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Job Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Company</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Flag Reason</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Confidence</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {filterRule ? 'No jobs with this rule' : 'No flagged jobs'}
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedJobs.has(job.id)}
                        onChange={() => handleSelectJob(job.id)}
                        className="rounded"
                      />
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onJobSelect?.(job.id)}
                    >
                      {job.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{job.company_name}</td>
                    <td className="px-4 py-3 text-gray-600">{job.reason}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              job.confidence >= 0.8
                                ? 'bg-red-600'
                                : job.confidence >= 0.5
                                  ? 'bg-yellow-600'
                                  : 'bg-blue-600'
                            }`}
                            style={{ width: `${job.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {(job.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleApprove(job.flag_id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(job.flag_id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-2 text-sm rounded ${
                  page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
