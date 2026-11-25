import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const invite = await queryOne(
      `SELECT i.status, j.title, c.name AS company_name
       FROM candidate_invites i
       JOIN jobs j ON j.id = i.job_id
       JOIN companies c ON c.id = i.company_id
       WHERE i.token = $1`,
      [params.token]
    );
    if (!invite) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    return NextResponse.json({ invite });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load invitation');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const decision = body.decision === 'accepted' ? 'accepted' : body.decision === 'declined' ? 'declined' : '';
    if (!decision) return NextResponse.json({ error: 'Accept or decline the invitation.' }, { status: 400 });
    const updated = await query(
      `UPDATE candidate_invites SET status = $2, responded_at = NOW() WHERE token = $1 AND status = 'sent' RETURNING id`,
      [params.token, decision]
    );
    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'This invitation was already answered.' }, { status: 409 });
    }
    return NextResponse.json({ success: true, status: decision });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to answer invitation');
  }
}

export const dynamic = 'force-dynamic';
