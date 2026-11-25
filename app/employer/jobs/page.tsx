import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readEmployerSession } from '@/lib/access';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your jobs | JobBrowser',
  description: 'Jobs you posted on JobBrowser and the people who applied.',
};

interface EmployerJob {
  id: string;
  title: string;
  location: string;
  status: string;
  posted_at: string;
  applicant_count: number;
}

export default async function EmployerJobsPage() {
  const session = await readEmployerSession();
  if (!session) redirect('/employer/login');

  const result = await query<EmployerJob>(
    `SELECT j.id, j.title, j.location, j.status, j.posted_at,
            COUNT(a.id)::int AS applicant_count
     FROM jobs j
     LEFT JOIN applications a ON a.job_id = j.id
     WHERE j.company_id = $1 AND j.deleted_at IS NULL AND j.source = 'direct'
     GROUP BY j.id
     ORDER BY j.posted_at DESC`,
    [session.companyId]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your jobs</h1>
            <p className="text-gray-700 mt-1">{session.companyName}</p>
          </div>
          <Link href="/employer/post-job" className="text-sm font-medium text-white bg-primary-500 rounded-lg px-4 py-2">
            Post a job free
          </Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {result.rows.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No jobs posted yet</h2>
            <p className="text-gray-700 mt-2">Post a job and applications will show up here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {result.rows.map((job) => {
              const count = Number(job.applicant_count) || 0;
              return (
                <li key={job.id}>
                  <Link
                    href={`/employer/inbox/${job.id}`}
                    className="block bg-white rounded-lg shadow px-5 py-4 hover:ring-2 hover:ring-primary-500"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                        <p className="text-sm text-gray-700 mt-1">
                          {job.location} · {job.status}
                        </p>
                      </div>
                      <p className="text-right text-lg font-bold text-gray-900">
                        {count === 1 ? '1 applicant' : `${count} applicants`}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
