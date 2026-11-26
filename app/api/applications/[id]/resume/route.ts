import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';
import { resumeStorageFromEnv, type ResumeStoreName } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const row = await queryOne<{
      job_id: string;
      resume_store: ResumeStoreName | null;
      resume_key: string | null;
      resume_filename: string | null;
      resume_content_type: string | null;
    }>(
      `SELECT job_id, resume_store, resume_key, resume_filename, resume_content_type
       FROM applications WHERE id = $1`,
      [params.id]
    );

    if (!row) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    if (!(await canAccessJob(request, row.job_id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = row.resume_store === 'blob' || row.resume_store === 'r2' ? row.resume_store : 'neon';
    const storage = resumeStorageFromEnv({ ...process.env, RESUME_STORE: store });
    const file = await storage.get({
      store,
      key: store === 'neon' ? params.id : row.resume_key || '',
    });

    if (!file) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const filename = (file.filename || row.resume_filename || 'cv').replace(/["\r\n]/g, '');
    const inline = request.nextUrl.searchParams.get('inline') === '1' && file.contentType === 'application/pdf';
    return new NextResponse(new Uint8Array(file.bytes), {
      status: 200,
      headers: {
        'Content-Type': file.contentType || row.resume_content_type || 'application/octet-stream',
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to download resume');
  }
}

export const dynamic = 'force-dynamic';
