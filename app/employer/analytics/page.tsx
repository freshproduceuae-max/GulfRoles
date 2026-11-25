'use client';

import { useEffect, useState } from 'react';

interface JobStat {
  id: string;
  title: string;
  status: string;
  source: string;
  view_count: number;
  applies: number;
  conversion: number;
}

interface SourceStat {
  source: string;
  views: number;
  applies: number;
  conversion: number;
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<JobStat[]>([]);
  const [sources, setSources] = useState<SourceStat[]>([]);

  useEffect(() => {
    void fetch('/api/employer/analytics').then((response) => response.json()).then((data) => {
      setJobs(data.jobs || []);
      setSources(data.sources || []);
    });
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
      <h2 className="text-xl font-semibold mb-2">By job</h2>
      <table className="w-full text-sm mb-8">
        <thead><tr className="text-left"><th>Job</th><th>Source</th><th>Views</th><th>Applies</th><th>Conversion</th></tr></thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t">
              <td className="py-2">{job.title}</td>
              <td>{job.source}</td>
              <td>{job.view_count}</td>
              <td>{job.applies}</td>
              <td>{Math.round(job.conversion * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-semibold mb-2">By source</h2>
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th>Source</th><th>Views</th><th>Applies</th><th>Conversion</th></tr></thead>
        <tbody>
          {sources.map((row) => (
            <tr key={row.source} className="border-t">
              <td className="py-2">{row.source}</td>
              <td>{row.views}</td>
              <td>{row.applies}</td>
              <td>{Math.round(row.conversion * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
