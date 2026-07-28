import { NextResponse } from 'next/server';
import { health } from '@/lib/db';

export async function GET() {
  try {
    const result = await health();

    // Return appropriate HTTP status code
    const statusCode = result.status === 'ok' ? 200 : 503;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: errorMessage,
      },
      { status: 503 }
    );
  }
}

// Export route config for Vercel
export const dynamic = 'force-dynamic';
