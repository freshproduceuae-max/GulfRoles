import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const { token } = params;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing verification token' },
        { status: 400 }
      );
    }

    // Find company with valid token
    const company = await query(
      `SELECT id, name, verified_at
       FROM companies
       WHERE verification_token = $1
       AND verification_token_expires > NOW()`,
      [token]
    );

    if (!company.rows[0]) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const companyId = company.rows[0].id;
    const companyName = company.rows[0].name;

    // Mark company as verified
    await query(
      `UPDATE companies
       SET verified = true, verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL
       WHERE id = $1`,
      [companyId]
    );

    // Create employer session
    const sessionToken = uuidv4();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      `INSERT INTO employer_sessions (company_id, email, session_token, token_expires)
       VALUES ($1, $2, $3, $4)`,
      [
        companyId,
        '', // Email will be set from the company if needed
        sessionToken,
        sessionExpiresAt,
      ]
    );

    // Redirect to job posting page with session cookie
    const response = NextResponse.redirect(
      new URL('/employer/post-job', request.url)
    );

    // Set secure session cookie
    response.cookies.set('employer_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    response.cookies.set('employer_id', companyId, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Email verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to verify email',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
