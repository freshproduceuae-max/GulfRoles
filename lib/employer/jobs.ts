import { query, queryOne } from '@/lib/db';

export interface OwnedJob {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  status: string;
  employer_email: string | null;
}

export async function ownedDirectJob(companyId: string, jobId: string): Promise<OwnedJob | null> {
  return queryOne<OwnedJob>(
    `SELECT id, title, description, company_name, location, region, job_type,
            salary_min, salary_max, salary_currency, status, employer_email
     FROM jobs
     WHERE id = $1 AND company_id = $2 AND source = 'direct' AND deleted_at IS NULL`,
    [jobId, companyId]
  );
}

export async function writeEvent(
  applicationId: string,
  kind: string,
  detail: string,
  actorEmail: string
): Promise<void> {
  await query(
    `INSERT INTO application_events (application_id, kind, detail, actor_email)
     VALUES ($1, $2, $3, $4)`,
    [applicationId, kind, detail, actorEmail]
  );
}
