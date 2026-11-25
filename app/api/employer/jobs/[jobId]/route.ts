import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';
import { ownedDirectJob } from '@/lib/employer/jobs';
import { serverErrorResponse } from '@/lib/http';
import { regionFromParam } from '@/lib/regions';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const job = await ownedDirectJob(session.companyId, params.jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    const questions = await query(
      `SELECT id, prompt, answer_type, required, knockout, expected_yes, min_number, position
       FROM screening_questions WHERE job_id = $1 ORDER BY position, created_at`,
      [job.id]
    );
    return NextResponse.json({ job, questions: questions.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load job');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const job = await ownedDirectJob(session.companyId, params.jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    const body = await request.json();
    const action = String(body.action || 'update');

    if (action === 'pause' || action === 'close' || action === 'publish') {
      const status = action === 'publish' ? 'published' : action === 'pause' ? 'paused' : 'closed';
      await query(`UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2`, [status, job.id]);
      return NextResponse.json({ success: true, status });
    }

    if (action === 'duplicate') {
      const copy = await queryOne<{ id: string }>(
        `INSERT INTO jobs (
           title, description, company_id, company_name, location, region, job_type,
           employer_email, employer_verified, salary_min, salary_max, salary_currency,
           source, status, posted_at, expires_at, google_jobs_allowed, cpc_tracked, redistributable
         )
         SELECT title || ' (copy)', description, company_id, company_name, location, region, job_type,
                employer_email, employer_verified, salary_min, salary_max, salary_currency,
                'direct', 'paused', NOW(), NOW() + INTERVAL '30 days', true, false, true
         FROM jobs WHERE id = $1
         RETURNING id`,
        [job.id]
      );
      if (copy?.id) {
        await query(
          `INSERT INTO screening_questions
             (job_id, prompt, answer_type, required, knockout, expected_yes, min_number, position)
           SELECT $2, prompt, answer_type, required, knockout, expected_yes, min_number, position
           FROM screening_questions WHERE job_id = $1`,
          [job.id, copy.id]
        );
      }
      return NextResponse.json({ success: true, job_id: copy?.id }, { status: 201 });
    }

    const region = regionFromParam(String(body.region || job.region));
    if (!region) return NextResponse.json({ error: 'Choose a region' }, { status: 400 });
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const location = String(body.location || '').trim();
    if (title.length < 3 || description.length < 20 || !location) {
      return NextResponse.json({ error: 'Title, location, and a description of at least 20 characters are required' }, { status: 400 });
    }
    await query(
      `UPDATE jobs
       SET title = $1, description = $2, location = $3, region = $4, job_type = $5,
           salary_min = $6, salary_max = $7, salary_currency = $8, company_name = $9, updated_at = NOW()
       WHERE id = $10`,
      [
        title,
        description,
        location,
        region.db,
        String(body.job_type || job.job_type),
        body.salary_min ? Number(body.salary_min) : null,
        body.salary_max ? Number(body.salary_max) : null,
        String(body.salary_currency || job.salary_currency || region.currency),
        String(body.company_name || job.company_name),
        job.id,
      ]
    );

    if (Array.isArray(body.questions)) {
      await query(`DELETE FROM screening_questions WHERE job_id = $1`, [job.id]);
      let position = 0;
      for (const item of body.questions) {
        const prompt = String(item.prompt || '').trim();
        const answerType = String(item.answer_type || item.answerType || '');
        if (!prompt || !['yes_no', 'number', 'text'].includes(answerType)) continue;
        await query(
          `INSERT INTO screening_questions
             (job_id, prompt, answer_type, required, knockout, expected_yes, min_number, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            job.id,
            prompt.slice(0, 500),
            answerType,
            item.required !== false,
            Boolean(item.knockout),
            answerType === 'yes_no' ? item.expected_yes !== false && item.expectedYes !== false : null,
            answerType === 'number' && item.min_number !== '' && item.min_number != null
              ? Number(item.min_number)
              : null,
            position,
          ]
        );
        position += 1;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to update job');
  }
}

export const dynamic = 'force-dynamic';
