import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Application status | JobBrowser',
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  viewed: 'Viewed by the employer',
  shortlisted: 'Shortlisted',
  rejected: 'Not moving forward',
  hired: 'Hired',
};

export default async function ApplicationStatusPage({ params }: { params: { token: string } }) {
  const row = await queryOne<{
    status: string;
    applicant_name: string;
    created_at: string;
    title: string;
    company_name: string;
  }>(
    `SELECT a.status, a.applicant_name, a.created_at, j.title, j.company_name
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.status_token = $1`,
    [params.token]
  );

  if (!row) notFound();

  const applied = new Date(row.created_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Application status</h1>
      <p className="mt-2 text-gray-700">
        {row.applicant_name}, this is the status of your application. The CV is not shown here.
      </p>
      <dl className="mt-8 bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <dt className="text-sm text-gray-600">Job</dt>
          <dd className="text-lg font-semibold text-gray-900">{row.title}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Employer</dt>
          <dd className="text-gray-900">{row.company_name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Status</dt>
          <dd className="text-lg font-semibold text-gray-900">{STATUS_LABEL[row.status] || row.status}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-600">Applied</dt>
          <dd className="text-gray-900">{applied}</dd>
        </div>
      </dl>
    </div>
  );
}
