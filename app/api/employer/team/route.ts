import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';
import { companyRole } from '@/lib/employer/roles';
import { sendEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/site';
import { serverErrorResponse } from '@/lib/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const role = await companyRole(session.companyId, session.email);
    const members = await query(
      `SELECT email, role, accepted_at FROM company_members WHERE company_id = $1 ORDER BY created_at`,
      [session.companyId]
    );
    return NextResponse.json({ role, members: members.rows, owner_email: session.email });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load the team');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const role = await companyRole(session.companyId, session.email);
    if (role !== 'owner') return NextResponse.json({ error: 'Only an owner can invite teammates.' }, { status: 403 });
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const memberRole = body.role === 'recruiter' || body.role === 'viewer' ? body.role : '';
    if (!email.includes('@') || !memberRole) {
      return NextResponse.json({ error: 'Email and a role of recruiter or viewer are required.' }, { status: 400 });
    }
    const token = randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO company_members (company_id, email, role, invite_token, invite_expires)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (company_id, email)
       DO UPDATE SET role = EXCLUDED.role, invite_token = EXCLUDED.invite_token, invite_expires = EXCLUDED.invite_expires, accepted_at = NULL`,
      [session.companyId, email, memberRole, token, expires]
    );
    const link = `${appBaseUrl()}/api/employer/team/accept/${token}`;
    const company = await queryOne<{ name: string }>(`SELECT name FROM companies WHERE id = $1`, [session.companyId]);
    const mail = await sendEmail({
      to: email,
      subject: `Join ${company?.name || 'a company'} on JobBrowser`,
      text: `You are invited as a ${memberRole}. ${link}`,
      html: `<p>You are invited as a ${memberRole}.</p><p><a href="${link}">Accept invite</a></p>`,
    });
    return NextResponse.json({
      success: true,
      emailed: mail.success,
      ...(process.env.NODE_ENV === 'production' ? {} : { dev_team_link: link }),
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to invite a teammate');
  }
}

export const dynamic = 'force-dynamic';
