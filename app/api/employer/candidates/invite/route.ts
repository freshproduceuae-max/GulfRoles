import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';
import { companyRole, canRecruit } from '@/lib/employer/roles';
import { ownedDirectJob } from '@/lib/employer/jobs';
import { sendEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/site';
import { serverErrorResponse } from '@/lib/http';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const role = await companyRole(session.companyId, session.email);
    if (!canRecruit(role)) return NextResponse.json({ error: 'Your role cannot invite candidates.' }, { status: 403 });
    const body = await request.json();
    const job = await ownedDirectJob(session.companyId, String(body.job_id || ''));
    if (!job || job.status !== 'published') {
      return NextResponse.json({ error: 'Choose one of your open jobs.' }, { status: 400 });
    }
    const profile = await queryOne<{ id: string; email: string; full_name: string; searchable: boolean }>(
      `SELECT id, email, full_name, searchable FROM candidate_profiles WHERE id = $1 AND searchable = true AND withdrawn_at IS NULL`,
      [body.profile_id]
    );
    if (!profile) return NextResponse.json({ error: 'That profile is not searchable.' }, { status: 404 });
    const invite = await query<{ token: string }>(
      `INSERT INTO candidate_invites (profile_id, company_id, job_id) VALUES ($1, $2, $3) RETURNING token`,
      [profile.id, session.companyId, job.id]
    );
    const token = invite.rows[0]?.token;
    const link = `${appBaseUrl()}/invites/${token}`;
    const mail = await sendEmail({
      to: profile.email,
      subject: `${session.companyName} invited you to apply for ${job.title}`,
      text: `Hello ${profile.full_name},\n\n${session.companyName} invited you to apply for ${job.title}. They cannot see your email until you accept.\n\n${link}`,
      html: `<p>Hello ${profile.full_name},</p><p>${session.companyName} invited you to apply for ${job.title}. They cannot see your email until you accept.</p><p><a href="${link}">Review invitation</a></p>`,
    });
    return NextResponse.json({
      success: true,
      emailed: mail.success,
      ...(mail.success || process.env.NODE_ENV === 'production' ? {} : { dev_invite_link: link }),
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to send invitation');
  }
}

export const dynamic = 'force-dynamic';
