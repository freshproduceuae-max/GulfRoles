import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const row = await queryOne<{
      job_id: string;
      resume_bytes: Buffer | null;
      resume_filename: string | null;
      resume_content_type: string | null;
    }>(
      `SELECT job_id, resume_bytes, resume_filename, resume_content_type
       FROM applications WHERE id = $1`,
      [params.id]
    );

    if (!row || !row.resume_bytes) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    if (!(await canAccessJob(request, row.job_id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filename = (row.resume_filename || 'resume').replace(/["\r\n]/g, '');
    return new NextResponse(new Uint8Array(row.resume_bytes), {
      status: 200,
      headers: {
        'Content-Type': row.resume_content_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to download resume');
  }
}

export const dynamic = 'force-dynamic';
