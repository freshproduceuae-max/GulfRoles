import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { query } from '@/lib/db';
import { validateResume, resumeStorageFromEnv } from '@/lib/storage';
import { ApplicationCreateSchema } from '@/lib/validation';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';
import {
  sendEmail,
  generateApplicationEmail,
  generateCandidateConfirmationEmail,
} from '@/lib/email';
import { appBaseUrl } from '@/lib/site';
import { evaluateScreening, type ScreeningQuestion } from '@/lib/employer/screening';
import { extractResumeText } from '@/lib/resume-text';
import { writeEvent } from '@/lib/employer/jobs';

const APPLICATION_COLUMNS = `
  id, job_id, applicant_name, applicant_email, applicant_phone,
  resume_url, resume_filename, cover_letter, status, created_at, updated_at
`;

/**
 * GET /api/applications?job_id=
 * Employer or admin only. Resume bytes are not included.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    if (!jobId) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }
    if (!(await canAccessJob(request, jobId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereConditions = ['job_id = $1'];
    const params: unknown[] = [jobId];
    if (status) {
      whereConditions.push(`status = $2`);
      params.push(status);
    }
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    const offset = (page - 1) * limit;

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM applications ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await query(
      `SELECT ${APPLICATION_COLUMNS} FROM applications ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      applications: result.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to fetch applications');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let applicationId: string | null = null;
  try {
    const formData = await request.formData();
    const jobId = String(formData.get('job_id') || '');
    const applicantName = String(formData.get('applicant_name') || '');
    const applicantEmail = String(formData.get('applicant_email') || '');
    const applicantPhone = formData.get('applicant_phone');
    const coverLetter = formData.get('cover_letter');
    const resumeFile = formData.get('resume');

    if (!jobId || !applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: job_id, applicant_name, applicant_email' },
        { status: 400 }
      );
    }
    if (!(resumeFile instanceof File)) {
      return NextResponse.json({ error: 'A PDF or DOCX CV is required' }, { status: 400 });
    }

    const validationData = ApplicationCreateSchema.parse({
      job_id: jobId,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: typeof applicantPhone === 'string' && applicantPhone ? applicantPhone : undefined,
      cover_letter: typeof coverLetter === 'string' && coverLetter ? coverLetter : undefined,
    });

    const jobResult = await query<{
      id: string;
      employer_email: string | null;
      title: string;
      company_name: string;
      source: string;
    }>(
      'SELECT id, employer_email, title, company_name, source FROM jobs WHERE id = $1 AND status = $2 AND deleted_at IS NULL',
      [jobId, 'published']
    );

    if (jobResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found or is not accepting applications' }, { status: 404 });
    }

    const job = jobResult.rows[0];
    if (job.source !== 'direct') {
      return NextResponse.json(
        { error: 'This listing is hosted by a partner. Use the apply link on the job page.' },
        { status: 400 }
      );
    }

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    let resumeMeta: { filename: string; contentType: string; extension: '.pdf' | '.docx' };
    try {
      resumeMeta = validateResume(resumeBuffer, resumeFile.name);
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload resume';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const questionRows = await query<{
      id: string;
      prompt: string;
      answer_type: 'yes_no' | 'number' | 'text';
      required: boolean;
      knockout: boolean;
      expected_yes: boolean | null;
      min_number: number | null;
    }>(
      `SELECT id, prompt, answer_type, required, knockout, expected_yes, min_number
       FROM screening_questions WHERE job_id = $1 ORDER BY position`,
      [jobId]
    );
    let answerMap: Record<string, string> = {};
    const answersRaw = formData.get('answers');
    if (typeof answersRaw === 'string' && answersRaw) {
      try {
        const parsed = JSON.parse(answersRaw) as Record<string, string>;
        answerMap = parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        return NextResponse.json({ error: 'Screening answers were not readable' }, { status: 400 });
      }
    }
    const questions: ScreeningQuestion[] = questionRows.rows.map((row) => ({
      id: row.id,
      prompt: row.prompt,
      answerType: row.answer_type,
      required: row.required,
      knockout: row.knockout,
      expectedYes: row.expected_yes,
      minNumber: row.min_number,
    }));
    let screening: { results: { questionId: string; prompt: string; answerText: string; knockedOut: boolean }[]; knockout: boolean };
    try {
      screening = evaluateScreening(questions, answerMap);
    } catch (screenError) {
      const message = screenError instanceof Error ? screenError.message : 'Answer the screening questions';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const resumeText = extractResumeText(resumeBuffer, resumeMeta.extension);
    const location = String(formData.get('applicant_location') || '').trim().slice(0, 255) || null;
    const experienceRaw = String(formData.get('experience_years') || '').trim();
    const experience = experienceRaw ? Number(experienceRaw) : null;
    const skills = String(formData.get('skills') || '').trim().slice(0, 500) || null;

    const statusToken = randomUUID();
    const applicationResult = await query<{ id: string }>(
      `INSERT INTO applications (
        job_id, applicant_name, applicant_email, applicant_phone,
        resume_filename, resume_content_type, cover_letter,
        status, status_token, applicant_location, experience_years, skills,
        resume_text, knockout, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING id`,
      [
        jobId,
        validationData.applicant_name,
        validationData.applicant_email,
        validationData.applicant_phone || null,
        resumeMeta.filename,
        resumeMeta.contentType,
        validationData.cover_letter || null,
        statusToken,
        location,
        Number.isFinite(experience) ? experience : null,
        skills,
        resumeText || null,
        screening.knockout,
      ]
    );

    applicationId = applicationResult.rows[0]?.id || null;
    if (!applicationId) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    for (const result of screening.results) {
      if (!result.answerText) continue;
      await query(
        `INSERT INTO screening_answers (application_id, question_id, prompt, answer_text, knocked_out)
         VALUES ($1, $2, $3, $4, $5)`,
        [applicationId, result.questionId, result.prompt, result.answerText, result.knockedOut]
      );
    }
    await writeEvent(
      applicationId,
      'applied',
      screening.knockout ? 'Applied. A screening answer missed a must-have.' : 'Applied',
      validationData.applicant_email
    );

    const storage = resumeStorageFromEnv();
    await storage.put({
      applicationId,
      bytes: resumeBuffer,
      filename: resumeMeta.filename,
      contentType: resumeMeta.contentType,
    });

    const statusPath = `/application-status/${statusToken}`;
    const statusUrl = `${appBaseUrl()}${statusPath}`;
    const inboxUrl = `${appBaseUrl()}/employer/inbox/${jobId}`;

    if (job.employer_email) {
      const email = generateApplicationEmail({
        jobTitle: job.title,
        companyName: job.company_name,
        applicantName: validationData.applicant_name,
        applicantEmail: validationData.applicant_email,
        applicantPhone: validationData.applicant_phone,
        coverLetter: validationData.cover_letter,
        inboxUrl,
      });
      const sent = await sendEmail({
        to: job.employer_email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      if (!sent.success) {
        console.error('Application saved but employer email was not sent:', sent.error);
      }
    }

    const confirmation = generateCandidateConfirmationEmail({
      applicantName: validationData.applicant_name,
      jobTitle: job.title,
      companyName: job.company_name,
      statusUrl,
    });
    const candidateMail = await sendEmail({
      to: validationData.applicant_email,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    });
    if (!candidateMail.success) {
      console.error('Application saved but candidate email was not sent:', candidateMail.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted. A confirmation is emailed when mail is configured.',
        application_id: applicationId,
        status_path: statusPath,
      },
      { status: 201 }
    );
  } catch (error) {
    if (applicationId) {
      await query('DELETE FROM applications WHERE id = $1', [applicationId]).catch(() => undefined);
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid application' }, { status: 400 });
    }
    console.error('Application submission error:', error instanceof Error ? error.message : error);
    return serverErrorResponse(error, 'Failed to submit application');
  }
}

export const dynamic = 'force-dynamic';
