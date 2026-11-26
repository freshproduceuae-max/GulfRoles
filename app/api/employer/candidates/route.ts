import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query } from '@/lib/db';
import { toPublicCandidate } from '@/lib/candidates/privacy';
import { serverErrorResponse } from '@/lib/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const params = request.nextUrl.searchParams;
    const where = ['p.searchable = true', 'p.withdrawn_at IS NULL'];
    const values: unknown[] = [];
    const skills = params.get('skills');
    if (skills) {
      values.push(`%${skills}%`);
      where.push(`COALESCE(p.skills, '') ILIKE $${values.length}`);
    }
    const location = params.get('location');
    if (location) {
      values.push(`%${location}%`);
      where.push(`COALESCE(p.location, '') ILIKE $${values.length}`);
    }
    const experience = params.get('experience');
    if (experience) {
      values.push(Number(experience));
      where.push(`p.experience_years >= $${values.length}`);
    }
    const keyword = params.get('q');
    if (keyword) {
      values.push(`%${keyword}%`);
      where.push(`(COALESCE(p.resume_text, '') ILIKE $${values.length} OR COALESCE(p.headline, '') ILIKE $${values.length} OR COALESCE(p.skills, '') ILIKE $${values.length})`);
    }
    const rows = await query<{
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      headline: string;
      location: string | null;
      experience_years: number | null;
      skills: string | null;
      resume_text: string | null;
    }>(
      `SELECT p.id, p.full_name, p.email, p.phone, p.headline, p.location, p.experience_years, p.skills, p.resume_text
       FROM candidate_profiles p
       WHERE ${where.join(' AND ')}
       ORDER BY p.updated_at DESC
       LIMIT 50`,
      values
    );
    const accepted = await query<{ profile_id: string }>(
      `SELECT profile_id FROM candidate_invites WHERE company_id = $1 AND status = 'accepted'`,
      [session.companyId]
    );
    const visible = new Set(accepted.rows.map((row) => row.profile_id));
    return NextResponse.json({
      candidates: rows.rows.map((row) => toPublicCandidate(row, visible.has(row.id))),
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to search candidates');
  }
}

export const dynamic = 'force-dynamic';
