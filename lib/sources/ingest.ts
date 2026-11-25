import type { FetchLike } from '../ingestion/sources';
import type { Queryable } from '../ingestion/db-types';
import { upsertListings } from '../ingestion/run';
import { enabledFeedIds, fetchOptInBoard, fetchRemoteOk, fetchRemotive, type OptInBoard } from './adapters';

export interface LegalIngestReport {
  boards: Array<{ vendor: string; board: string; count?: number; error?: string }>;
  feeds: Array<{ id: string; count?: number; error?: string; skipped?: string }>;
}

export async function ingestLicensedSources(options: {
  db: Queryable;
  fetchImpl?: FetchLike;
}): Promise<LegalIngestReport> {
  const fetchImpl = options.fetchImpl || fetch;
  const report: LegalIngestReport = { boards: [], feeds: [] };

  let boards: OptInBoard[] = [];
  try {
    const rows = await options.db.query<{
      vendor: string;
      board_token: string;
      company_name: string;
      region: string;
    }>(
      `SELECT vendor, board_token, company_name, region
       FROM ats_boards
       WHERE status = 'active'`
    );
    boards = rows.rows.map((row) => ({
      vendor: row.vendor,
      boardToken: row.board_token,
      companyName: row.company_name,
      region: row.region,
    }));
  } catch (error) {
    report.boards.push({
      vendor: 'ats',
      board: '*',
      error: error instanceof Error ? error.message : 'Could not read opted-in boards',
    });
  }

  for (const board of boards.slice(0, 20)) {
    try {
      const listings = await fetchOptInBoard(board, fetchImpl);
      if (listings.length) await upsertListings(options.db, listings);
      report.boards.push({ vendor: board.vendor, board: board.boardToken, count: listings.length });
    } catch (error) {
      report.boards.push({
        vendor: board.vendor,
        board: board.boardToken,
        error: error instanceof Error ? error.message : 'Board fetch failed',
      });
    }
  }

  for (const feedId of enabledFeedIds()) {
    try {
      const listings = feedId === 'remoteok' ? await fetchRemoteOk(fetchImpl) : await fetchRemotive(fetchImpl);
      if (listings.length) await upsertListings(options.db, listings);
      report.feeds.push({ id: feedId, count: listings.length });
    } catch (error) {
      report.feeds.push({
        id: feedId,
        error: error instanceof Error ? error.message : 'Feed fetch failed',
      });
    }
  }

  return report;
}
