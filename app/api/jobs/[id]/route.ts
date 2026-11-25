import { NextRequest, NextResponse } from 'next/server';
import { getJobById } from '@/lib/search';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const job = await getJobById(params.id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to load job', details: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
