import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

function sameHostRedirect(request: NextRequest, path: string): NextResponse {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '');
  const target = host ? `${proto}://${host}${path}` : new URL(path, request.url).toString();
  return NextResponse.redirect(target);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const member = await query<{ company_id: string; email: string }>(
      `SELECT company_id, email FROM company_members
       WHERE invite_token = $1 AND invite_expires > NOW()`,
      [params.token]
    );
    if (!member.rows[0]) return NextResponse.json({ error: 'This invite is invalid or expired.' }, { status: 400 });
    const { company_id: companyId, email } = member.rows[0];
    await query(
      `UPDATE company_members SET accepted_at = NOW(), invite_token = NULL, invite_expires = NULL WHERE company_id = $1 AND email = $2`,
      [companyId, email]
    );
    const sessionToken = randomUUID();
    await query(
      `INSERT INTO employer_sessions (company_id, email, session_token, token_expires) VALUES ($1, $2, $3, $4)`,
      [companyId, email, sessionToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );
    const response = sameHostRedirect(request, '/employer/jobs');
    response.cookies.set('employer_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    response.cookies.set('employer_id', companyId, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    return serverErrorResponse(error, 'Failed to accept the invite');
  }
}

export const dynamic = 'force-dynamic';
