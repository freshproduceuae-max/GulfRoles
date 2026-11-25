import { query } from '@/lib/db';
import { getAffiliateEarnings } from '@/lib/affiliate';
import { policyFor } from '@/lib/sources/policy';

export const dynamic = 'force-dynamic';

interface SourceRow {
  source: string;
  clicks: string;
  jobs: string;
}

export default async function RevenuePage() {
  let rows: SourceRow[] = [];
  let boards: Array<{ vendor: string; board_token: string; company_name: string; region: string; status: string }> = [];
  let unavailable = false;

  try {
    const result = await query<SourceRow>(
      `SELECT j.source,
              COUNT(c.id)::text AS clicks,
              COUNT(DISTINCT j.id)::text AS jobs
       FROM jobs j
       LEFT JOIN affiliate_clicks c ON c.job_id = j.id
       WHERE j.deleted_at IS NULL
       GROUP BY j.source
       ORDER BY COUNT(c.id) DESC, j.source`
    );
    rows = result.rows;
    const boardResult = await query<{
      vendor: string;
      board_token: string;
      company_name: string;
      region: string;
      status: string;
    }>(
      `SELECT vendor, board_token, company_name, region, status
       FROM ats_boards ORDER BY created_at DESC LIMIT 100`
    );
    boards = boardResult.rows;
  } catch (error) {
    console.error('Revenue view unavailable', error instanceof Error ? error.message : error);
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clicks by source</h1>
        <p className="mt-2 text-gray-600">
          CPC figures are planning estimates for Careerjet, Jooble, and Adzuna only. Other sources are tracked so you can see traffic. They are not a payout.
        </p>
      </div>
      {unavailable ? (
        <p className="text-gray-600">The database is not connected, so this report is empty.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Source</th>
              <th>Kind</th>
              <th>Jobs</th>
              <th>Clicks</th>
              <th>Est. CPC</th>
              <th>Google Jobs</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="py-3" colSpan={6}>No listings yet.</td>
              </tr>
            )}
            {rows.map((row) => {
              const policy = policyFor(row.source);
              const clicks = Number(row.clicks) || 0;
              const estimate =
                row.source === 'careerjet' || row.source === 'jooble' || row.source === 'adzuna'
                  ? getAffiliateEarnings(row.source, clicks)
                  : 0;
              return (
                <tr key={row.source} className="border-b">
                  <td className="py-2">{policy.label}</td>
                  <td>{policy.kind}</td>
                  <td>{row.jobs}</td>
                  <td>{clicks}</td>
                  <td>{policy.cpcTracked ? `$${estimate.toFixed(2)}` : '—'}</td>
                  <td>{policy.googleJobs ? 'Yes' : 'No'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Employer career boards</h2>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          {boards.length === 0 && <li>No employer has connected a board yet.</li>}
          {boards.map((board) => (
            <li key={`${board.vendor}-${board.board_token}`}>
              {board.company_name} · {board.vendor}/{board.board_token} · {board.region} · {board.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
