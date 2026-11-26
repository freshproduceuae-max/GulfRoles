import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { queryOne } from '@/lib/db';

export interface CandidateSession {
  profileId: string;
  email: string;
}

async function load(token: string): Promise<CandidateSession | null> {
  const row = await queryOne<{ profile_id: string; email: string }>(
    `SELECT s.profile_id, p.email
     FROM candidate_sessions s
     JOIN candidate_profiles p ON p.id = s.profile_id
     WHERE s.session_token = $1 AND s.token_expires > NOW()`,
    [token]
  );
  if (!row) return null;
  return { profileId: row.profile_id, email: row.email };
}

export async function getCandidateSession(request: NextRequest): Promise<CandidateSession | null> {
  const token = request.cookies.get('candidate_session')?.value;
  if (!token) return null;
  return load(token);
}

export async function readCandidateSession(): Promise<CandidateSession | null> {
  const token = (await cookies()).get('candidate_session')?.value;
  if (!token) return null;
  return load(token);
}
