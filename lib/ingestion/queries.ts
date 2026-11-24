import { REGION_LIST, type RegionInfo } from '../regions';

/** Rotating queries. One cron run takes the next pair so a free-tier function stays short. */
export const INGEST_KEYWORDS = [
  'accountant',
  'nurse',
  'software engineer',
  'sales',
  'teacher',
  'customer service',
  'civil engineer',
  'driver',
  'chef',
  'marketing',
  'data analyst',
  'electrician',
  'project manager',
  'pharmacist',
  'warehouse',
];

export function planSlot(cursor: number): { keyword: string; region: RegionInfo; nextCursor: number } {
  const safeCursor = Number.isFinite(cursor) && cursor > 0 ? Math.floor(cursor) : 0;
  const keyword = INGEST_KEYWORDS[safeCursor % INGEST_KEYWORDS.length];
  const region = REGION_LIST[Math.floor(safeCursor / INGEST_KEYWORDS.length) % REGION_LIST.length];
  return { keyword, region, nextCursor: safeCursor + 1 };
}
