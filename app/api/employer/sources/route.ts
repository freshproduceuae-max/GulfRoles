import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';
import { atsVendors, isBlockedIngestUrl } from '@/lib/sources/policy';

const VENDORS = new Set(atsVendors().map((item) => item.id));

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const rows = await query(
      `SELECT id, vendor, board_token, company_name, region, status, created_at
       FROM ats_boards WHERE company_id = $1 ORDER BY created_at DESC`,
      [session.companyId]
    );
    return NextResponse.json({ boards: rows.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Could not load career boards');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const vendor = String(body.vendor || '').toLowerCase();
    const boardToken = String(body.board_token || '').trim();
    const region = String(body.region || session.region || 'UAE');
    if (!VENDORS.has(vendor)) {
      return NextResponse.json({ error: 'Choose Greenhouse, Lever, Ashby, or Workable.' }, { status: 400 });
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,120}$/.test(boardToken)) {
      return NextResponse.json(
        { error: 'Enter the public board name only, not a private API key or a full URL.' },
        { status: 400 }
      );
    }
    if (isBlockedIngestUrl(`https://${boardToken}`)) {
      return NextResponse.json({ error: 'That source is not allowed.' }, { status: 400 });
    }
    const existing = await queryOne<{ company_id: string }>(
      `SELECT company_id FROM ats_boards WHERE vendor = $1 AND board_token = $2`,
      [vendor, boardToken]
    );
    if (existing && existing.company_id !== session.companyId) {
      return NextResponse.json({ error: 'That careers board is already connected to another company.' }, { status: 409 });
    }
    const saved = await query(
      `INSERT INTO ats_boards (company_id, vendor, board_token, company_name, region, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT (vendor, board_token) DO UPDATE SET
         company_name = EXCLUDED.company_name,
         region = EXCLUDED.region,
         status = 'active'
       WHERE ats_boards.company_id = EXCLUDED.company_id
       RETURNING id, vendor, board_token, region, status`,
      [session.companyId, vendor, boardToken, session.companyName, region]
    );
    return NextResponse.json({ board: saved.rows[0] }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error, 'Could not save the career board');
  }
}

export const dynamic = 'force-dynamic';
