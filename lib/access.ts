import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { queryOne } from './db';

export interface EmployerSession {
  companyId: string;
  email: string;
  companyName: string;
  region: string;
  verified: boolean;
}

export async function getEmployerSession(request: NextRequest): Promise<EmployerSession | null> {
  const token = request.cookies.get('employer_session')?.value;
  if (!token) return null;

  const row = await queryOne<{
    company_id: string;
    email: string;
    name: string;
    region: string;
    verified: boolean;
  }>(
    `SELECT es.company_id, es.email, c.name, c.region, c.verified
     FROM employer_sessions es
     JOIN companies c ON c.id = es.company_id
     WHERE es.session_token = $1 AND es.token_expires > NOW()`,
    [token]
  );

  if (!row?.email) return null;
  return {
    companyId: row.company_id,
    email: row.email,
    companyName: row.name,
    region: row.region,
    verified: row.verified,
  };
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role;
  return role === 'admin' || role === 'moderator' || role === 'superadmin';
}

export async function canAccessJob(request: NextRequest, jobId: string): Promise<boolean> {
  if (await isAdminRequest(request)) return true;
  const token = request.cookies.get('employer_session')?.value;
  if (!token) return false;
  const row = await queryOne<{ id: string }>(
    `SELECT es.id
     FROM employer_sessions es
     JOIN jobs j ON j.company_id = es.company_id
     WHERE es.session_token = $1
       AND es.token_expires > NOW()
       AND j.id = $2`,
    [token, jobId]
  );
  return Boolean(row);
}
