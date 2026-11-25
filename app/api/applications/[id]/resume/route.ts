import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';
import { resumeStorageFromEnv, type ResumeStoreName } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
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

    const store = row.resume_store === 'blob' ? 'blob' : 'neon';
    const storage = store === 'blob' ? resumeStorageFromEnv({ ...process.env, RESUME_STORE: 'blob' }) : resumeStorageFromEnv({ ...process.env, RESUME_STORE: 'neon' });
    const file = await storage.get({
      store,
      key: store === 'blob' ? row.resume_key || '' : params.id,
    });

    if (!file) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const filename = (file.filename || row.resume_filename || 'cv').replace(/["\r\n]/g, '');
    return new NextResponse(new Uint8Array(file.bytes), {
      status: 200,
      headers: {
        'Content-Type': file.contentType || row.resume_content_type || 'application/octet-stream',
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
