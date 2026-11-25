import { NextResponse } from 'next/server';

export function isDatabaseUnavailable(error: unknown): boolean {
  if (!process.env.DATABASE_URL) return true;
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  const message = error instanceof Error ? error.message : String(error);
  return /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|DATABASE_URL|Connection terminated|timeout expired|getaddrinfo|password authentication failed|no pg_hba|certificate|28P01|3D000|57P01|53300|42P01|42703/i.test(
    `${code} ${message}`
  );
}

export function isSchemaOutOfDate(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /42P01|42703|column .+ does not exist|relation .+ does not exist/i.test(message);
}

export function databaseUnavailableResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'database_unavailable',
      message:
        'Job data is temporarily unavailable. The site stays up, and listings return when the database is connected.',
    },
    { status: 503 }
  );
}

export function serverErrorResponse(error: unknown, publicMessage: string): NextResponse {
  if (!process.env.DATABASE_URL || isDatabaseUnavailable(error)) {
    if (isSchemaOutOfDate(error)) {
      return NextResponse.json(
        {
          error: 'schema_out_of_date',
          message: 'The database schema is behind the app. Apply migrations with npm run migrate.',
        },
        { status: 503 }
      );
    }
    console.error(publicMessage, error instanceof Error ? error.message : error);
    return databaseUnavailableResponse();
  }

  console.error(publicMessage, error instanceof Error ? error.message : error);
  return NextResponse.json({ error: publicMessage }, { status: 500 });
}
