import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';
import { regionFromParam } from '@/lib/regions';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const company = await queryOne(
      `SELECT id, name, website, description, address, region, industry, contact_email
       FROM companies WHERE id = $1`,
      [session.companyId]
    );
    return NextResponse.json({ company });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load company');
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    const region = regionFromParam(String(body.region || ''));
    if (name.length < 2) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    if (!region) return NextResponse.json({ error: 'Choose a region' }, { status: 400 });
    const website = String(body.website || '').trim().slice(0, 2048) || null;
    const description = String(body.description || '').trim().slice(0, 4000) || null;
    const address = String(body.address || '').trim().slice(0, 500) || null;
    const industry = String(body.industry || '').trim().slice(0, 120) || null;
    try {
      await query(
        `UPDATE companies
         SET name = $1, website = $2, description = $3, address = $4, region = $5,
             industry = $6, updated_at = NOW()
         WHERE id = $7`,
        [name, website, description, address, region.db, industry, session.companyId]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (/unique|duplicate/i.test(message)) {
        return NextResponse.json({ error: 'Another company already uses that name.' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to save company');
  }
}

export const dynamic = 'force-dynamic';
