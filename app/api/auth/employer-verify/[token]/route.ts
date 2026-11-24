import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const { token } = params;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing verification token' }, { status: 400 });
    }

    const company = await query(
      `SELECT id, contact_email
       FROM companies
       WHERE verification_token = $1
       AND verification_token_expires > NOW()`,
      [token]
    );

    if (!company.rows[0]) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    const companyId = company.rows[0].id;
    const email = company.rows[0].contact_email || '';

    await query(
      `UPDATE companies
       SET verified = true, verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL
       WHERE id = $1`,
      [companyId]
    );

    const sessionToken = randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO employer_sessions (company_id, email, session_token, token_expires)
       VALUES ($1, $2, $3, $4)`,
      [companyId, email, sessionToken, sessionExpiresAt]
    );

    const response = NextResponse.redirect(new URL('/employer/post-job', request.url));
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
    return serverErrorResponse(error, 'Failed to verify email');
  }
}

export const dynamic = 'force-dynamic';
