import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const result = await query(
      `SELECT id, name, filters, created_at FROM saved_searches WHERE company_id = $1 ORDER BY created_at DESC`,
      [session.companyId]
    );
    return NextResponse.json({ searches: result.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load saved searches');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name the search' }, { status: 400 });
    const filters = {
      skills: String(body.skills || ''),
      location: String(body.location || ''),
      experience: String(body.experience || ''),
      q: String(body.q || ''),
    };
    const result = await query<{ id: string }>(
      `INSERT INTO saved_searches (company_id, name, filters) VALUES ($1, $2, $3) RETURNING id`,
      [session.companyId, name.slice(0, 120), JSON.stringify(filters)]
    );
    return NextResponse.json({ id: result.rows[0]?.id }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to save search');
  }
}

export const dynamic = 'force-dynamic';
