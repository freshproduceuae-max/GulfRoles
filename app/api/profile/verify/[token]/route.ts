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
    const profile = await query<{ id: string }>(
      `SELECT id FROM candidate_profiles
       WHERE verification_token = $1 AND verification_token_expires > NOW() AND consent_at IS NOT NULL`,
      [params.token]
    );
    if (!profile.rows[0]) {
      return NextResponse.json({ error: 'This confirmation link is invalid or expired.' }, { status: 400 });
    }
    const profileId = profile.rows[0].id;
    await query(
      `UPDATE candidate_profiles
       SET searchable = true, withdrawn_at = NULL, verification_token = NULL, verification_token_expires = NULL, updated_at = NOW()
       WHERE id = $1`,
      [profileId]
    );
    const sessionToken = randomUUID();
    await query(
      `INSERT INTO candidate_sessions (profile_id, session_token, token_expires) VALUES ($1, $2, $3)`,
      [profileId, sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    );
    const response = sameHostRedirect(request, '/profile');
    response.cookies.set('candidate_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    return serverErrorResponse(error, 'Failed to confirm profile');
  }
}

export const dynamic = 'force-dynamic';
