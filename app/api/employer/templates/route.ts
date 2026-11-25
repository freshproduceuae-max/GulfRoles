import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const result = await query(
      `SELECT id, name, subject, body, created_at FROM message_templates WHERE company_id = $1 ORDER BY created_at DESC`,
      [session.companyId]
    );
    return NextResponse.json({ templates: result.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load templates');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    const subject = String(body.subject || '').trim();
    const text = String(body.body || '').trim();
    if (!name || !subject || !text) {
      return NextResponse.json({ error: 'Name, subject, and message are required' }, { status: 400 });
    }
    const result = await query<{ id: string }>(
      `INSERT INTO message_templates (company_id, name, subject, body) VALUES ($1, $2, $3, $4) RETURNING id`,
      [session.companyId, name.slice(0, 120), subject.slice(0, 255), text.slice(0, 8000)]
    );
    return NextResponse.json({ id: result.rows[0]?.id }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to save template');
  }
}

export const dynamic = 'force-dynamic';
