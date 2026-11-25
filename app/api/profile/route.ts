import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCandidateSession } from '@/lib/candidates/session';
import { CONSENT_VERSION } from '@/lib/candidates/privacy';
import { validateResume } from '@/lib/storage';
import { extractResumeText } from '@/lib/resume-text';
import { sendEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/site';
import { serverErrorResponse } from '@/lib/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getCandidateSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in with the email link first.' }, { status: 401 });
    const profile = await queryOne(
      `SELECT id, email, full_name, phone, headline, location, experience_years, skills,
              searchable, consent_at, withdrawn_at, resume_filename
       FROM candidate_profiles WHERE id = $1`,
      [session.profileId]
    );
    return NextResponse.json({ profile });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load profile');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const form = await request.formData();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const fullName = String(form.get('full_name') || '').trim();
    const headline = String(form.get('headline') || '').trim();
    const consent = form.get('consent') === 'true' || form.get('consent') === 'on';
    if (!email.includes('@') || fullName.length < 2 || headline.length < 2) {
      return NextResponse.json({ error: 'Name, email, and a headline are required' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: 'Search needs your consent. You can still keep the profile private.' }, { status: 400 });
    }

    const phone = String(form.get('phone') || '').trim().slice(0, 40) || null;
    const location = String(form.get('location') || '').trim().slice(0, 255) || null;
    const skills = String(form.get('skills') || '').trim().slice(0, 500) || null;
    const yearsRaw = String(form.get('experience_years') || '').trim();
    const years = yearsRaw ? Number(yearsRaw) : null;
    const file = form.get('resume');
    let resume: { filename: string; contentType: string; bytes: Buffer; text: string } | null = null;
    if (file instanceof File && file.size > 0) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const meta = validateResume(bytes, file.name);
      resume = { ...meta, bytes, text: extractResumeText(bytes, meta.extension) };
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const existing = await queryOne<{ id: string }>(`SELECT id FROM candidate_profiles WHERE email = $1`, [email]);
    let profileId = existing?.id;
    if (!profileId) {
      const created = await query<{ id: string }>(
        `INSERT INTO candidate_profiles (
           email, full_name, phone, headline, location, experience_years, skills,
           searchable, consent_version, consent_at, verification_token, verification_token_expires
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, NOW(), $9, $10)
         RETURNING id`,
        [email, fullName, phone, headline, location, Number.isFinite(years) ? years : null, skills, CONSENT_VERSION, token, expires]
      );
      profileId = created.rows[0].id;
    } else {
      await query(
        `UPDATE candidate_profiles
         SET full_name = $2, phone = $3, headline = $4, location = $5, experience_years = $6, skills = $7,
             consent_version = $8, consent_at = NOW(), withdrawn_at = NULL,
             verification_token = $9, verification_token_expires = $10, updated_at = NOW()
         WHERE id = $1`,
        [profileId, fullName, phone, headline, location, Number.isFinite(years) ? years : null, skills, CONSENT_VERSION, token, expires]
      );
    }
    if (resume && profileId) {
      await query(
        `UPDATE candidate_profiles
         SET resume_filename = $2, resume_content_type = $3, resume_bytes = $4, resume_text = $5,
             resume_store = 'neon', resume_key = NULL, updated_at = NOW()
         WHERE id = $1`,
        [profileId, resume.filename, resume.contentType, resume.bytes, resume.text]
      );
    }
    await query(
      `INSERT INTO candidate_consent_events (profile_id, action, detail) VALUES ($1, 'opt_in', $2)`,
      [profileId, CONSENT_VERSION]
    );

    const link = `${appBaseUrl()}/api/profile/verify/${token}`;
    const mail = await sendEmail({
      to: email,
      subject: 'Confirm your JobBrowser profile',
      text: `Confirm that employers may search your profile. Your email and phone stay hidden until you accept an invite.\n\n${link}`,
      html: `<p>Confirm that employers may search your profile. Your email and phone stay hidden until you accept an invite.</p><p><a href="${link}">Confirm profile</a></p>`,
    });
    if (!mail.success && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, dev_verification_link: link });
    }
    if (!mail.success) {
      return NextResponse.json({ error: 'Email is not configured.' }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: 'Check your email to confirm the profile.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save profile';
    if (/Only PDF|4MB|valid PDF|macros|active content/.test(message)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return serverErrorResponse(error, 'Failed to save profile');
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getCandidateSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in with the email link first.' }, { status: 401 });
    const body = await request.json();
    if (body.searchable === false) {
      await query(
        `UPDATE candidate_profiles SET searchable = false, withdrawn_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [session.profileId]
      );
      await query(
        `INSERT INTO candidate_consent_events (profile_id, action, detail) VALUES ($1, 'withdraw', 'Candidate turned off search')`,
        [session.profileId]
      );
      return NextResponse.json({ success: true, searchable: false });
    }
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to update profile');
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getCandidateSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in with the email link first.' }, { status: 401 });
    await query(`INSERT INTO privacy_audit (action, detail) VALUES ('profile_deleted', 'A candidate deleted their profile and CV.')`);
    await query(`DELETE FROM candidate_profiles WHERE id = $1`, [session.profileId]);
    const response = NextResponse.json({ success: true });
    response.cookies.set('candidate_session', '', { path: '/', maxAge: 0 });
    return response;
  } catch (error) {
    return serverErrorResponse(error, 'Failed to delete profile');
  }
}

export const dynamic = 'force-dynamic';
