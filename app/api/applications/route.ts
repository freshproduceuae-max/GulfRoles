import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { validateResume } from '@/lib/storage';
import { ApplicationCreateSchema } from '@/lib/validation';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';
import { sendEmail, generateApplicationEmail } from '@/lib/email';

const APPLICATION_COLUMNS = `
  id, job_id, applicant_name, applicant_email, applicant_phone,
  resume_url, resume_filename, cover_letter, status, created_at, updated_at
`;

/**
 * GET /api/applications?job_id=
 * Employer or admin only. Resumes are not included in the JSON.
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
  try {
    const formData = await request.formData();
    const jobId = formData.get('job_id') as string;
    const applicantName = formData.get('applicant_name') as string;
    const applicantEmail = formData.get('applicant_email') as string;
    const applicantPhone = formData.get('applicant_phone') as string | null;
    const coverLetter = formData.get('cover_letter') as string | null;
    const resumeFile = formData.get('resume') as File | null;

    if (!jobId || !applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: job_id, applicant_name, applicant_email' },
        { status: 400 }
      );
    }
    if (!resumeFile) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
    }

    const validationData = ApplicationCreateSchema.parse({
      job_id: jobId,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: applicantPhone || undefined,
      cover_letter: coverLetter || undefined,
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
    let resumeMeta: { filename: string; contentType: string };
    try {
      resumeMeta = validateResume(resumeBuffer, resumeFile.name);
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload resume';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const applicationResult = await query<{ id: string }>(
      `INSERT INTO applications (
        job_id, applicant_name, applicant_email, applicant_phone,
        resume_filename, resume_content_type, resume_bytes, cover_letter,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted', NOW(), NOW())
      RETURNING id`,
      [
        jobId,
        validationData.applicant_name,
        validationData.applicant_email,
        validationData.applicant_phone || null,
        resumeMeta.filename,
        resumeMeta.contentType,
        resumeBuffer,
        validationData.cover_letter || null,
      ]
    );

    const applicationId = applicationResult.rows[0]?.id;
    if (!applicationId) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    const resumeUrl = `/api/applications/${applicationId}/resume`;
    await query('UPDATE applications SET resume_url = $1 WHERE id = $2', [resumeUrl, applicationId]);

    if (job.employer_email) {
      const email = generateApplicationEmail({
        jobTitle: job.title,
        companyName: job.company_name,
        applicantName: validationData.applicant_name,
        applicantEmail: validationData.applicant_email,
        coverLetter: validationData.cover_letter,
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

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully. The employer receives it by email when mail is configured.',
        application_id: applicationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application submission error:', error instanceof Error ? error.message : error);
    return serverErrorResponse(error, 'Failed to submit application');
  }
}

export const dynamic = 'force-dynamic';
