import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { uploadResume } from '@/lib/storage';
import { trackAffiliateClick } from '@/lib/affiliate';
import { ApplicationCreateSchema } from '@/lib/validation';

/**
 * GET /api/applications
 * Fetch applications, optionally filtered by job_id
 *
 * Query Parameters:
 * - job_id: UUID (optional) - filter by job
 * - status: string (optional) - filter by status
 * - page: number (optional, default: 1)
 * - limit: number (optional, default: 20)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let whereConditions = [];
    let params: any[] = [];
    let paramCount = 1;

    if (jobId) {
      whereConditions.push(`job_id = $${paramCount}`);
      params.push(jobId);
      paramCount++;
    }

    if (status) {
      whereConditions.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM applications ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const result = await query(
      `SELECT * FROM applications ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Submit a job application with resume upload
 *
 * Request body:
 * {
 *   job_id: string (UUID)
 *   applicant_name: string
 *   applicant_email: string
 *   applicant_phone?: string
 *   cover_letter?: string
 *   resume: File (multipart/form-data)
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   application_id?: string
 *   error?: string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse multipart form data
    const formData = await request.formData();

    // Extract fields
    const jobId = formData.get('job_id') as string;
    const applicantName = formData.get('applicant_name') as string;
    const applicantEmail = formData.get('applicant_email') as string;
    const applicantPhone = formData.get('applicant_phone') as string | null;
    const coverLetter = formData.get('cover_letter') as string | null;
    const resumeFile = formData.get('resume') as File | null;

    // Validate basic fields
    if (!jobId || !applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: job_id, applicant_name, applicant_email' },
        { status: 400 }
      );
    }

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    // Validate using schema
    const validationData = ApplicationCreateSchema.parse({
      job_id: jobId,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: applicantPhone || undefined,
      cover_letter: coverLetter || undefined,
    });

    // Check if job exists
    const jobResult = await query(
      'SELECT id, employer_email, title, company_name FROM jobs WHERE id = $1 AND status = $2',
      [jobId, 'published']
    );

    if (jobResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or is not accepting applications' },
        { status: 404 }
      );
    }

    const job = jobResult.rows[0];
    const employerEmail = job.employer_email;

    // Upload resume
    let resumeUrl: string | null = null;
    let resumeFilename: string | null = null;

    try {
      const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
      const uploadResult = await uploadResume(
        resumeBuffer,
        resumeFile.name,
        jobId
      );
      resumeUrl = uploadResult.url;
      resumeFilename = uploadResult.filename;
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload resume';
      return NextResponse.json(
        { error: `Resume upload failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Create application record
    const applicationResult = await query(
      `INSERT INTO applications (
        job_id,
        applicant_name,
        applicant_email,
        applicant_phone,
        resume_url,
        resume_filename,
        cover_letter,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id`,
      [
        jobId,
        validationData.applicant_name,
        validationData.applicant_email,
        validationData.applicant_phone || null,
        resumeUrl,
        resumeFilename,
        validationData.cover_letter || null,
        'submitted',
      ]
    );

    if (applicationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    const applicationId = applicationResult.rows[0].id;

    // Track affiliate click for analytics (non-blocking)
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

    trackAffiliateClick(jobId, 'careerjet', undefined, userAgent, referrer, ipAddress).catch(
      (error) => {
        console.error('Failed to track affiliate click:', error);
        // Don't fail the request if tracking fails
      }
    );

    // Send email notification to employer (placeholder - implement actual email sending)
    if (employerEmail) {
      try {
        // TODO: Implement actual email sending using nodemailer or similar
        console.log(`[EMAIL] Application notification to ${employerEmail}:
          Job: ${job.title} at ${job.company_name}
          Applicant: ${validationData.applicant_name} (${validationData.applicant_email})
        `);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails - application was already created
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully!',
        application_id: applicationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application submission error:', error);

    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to submit application',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
