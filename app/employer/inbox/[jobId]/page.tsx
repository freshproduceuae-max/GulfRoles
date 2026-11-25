import { notFound, redirect } from 'next/navigation';
import InboxClient from '@/components/employer/InboxClient';
import { readEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ApplicationRow {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  resume_url: string | null;
  resume_filename: string | null;
  cover_letter: string | null;
  knockout: boolean;
  rating: number | null;
  applicant_location: string | null;
  experience_years: number | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected';
  created_at: string;
  updated_at: string;
}

export default async function InboxPage({ params }: { params: { jobId: string } }) {
  const session = await readEmployerSession();
  if (!session) redirect('/employer/login');

  const job = await queryOne<{
    id: string;
    title: string;
    company_name: string;
    location: string;
    status: string;
  }>(
    `SELECT id, title, company_name, location, status
     FROM jobs
     WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
    [params.jobId, session.companyId]
  );
  if (!job) notFound();

  const applications = await query<ApplicationRow>(
    `SELECT id, applicant_name, applicant_email, applicant_phone,
            resume_url, resume_filename, cover_letter, status, knockout, rating,
            applicant_location, experience_years, created_at, updated_at
     FROM applications
     WHERE job_id = $1
     ORDER BY created_at DESC`,
    [job.id]
  );

  return (
    <InboxClient
      job={job}
      initialApplications={applications.rows.map((row) => ({
        ...row,
        applicant_phone: row.applicant_phone || undefined,
        resume_url: row.resume_url || `/api/applications/${row.id}/resume`,
        resume_filename: row.resume_filename || undefined,
        cover_letter: row.cover_letter || undefined,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }))}
    />
  );
}
