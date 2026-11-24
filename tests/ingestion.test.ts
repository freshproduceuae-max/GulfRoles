import assert from 'node:assert/strict';
import test from 'node:test';
import { REGION_LIST } from '../lib/regions';
import {
  dedupeKey,
  parseSalary,
  shouldExpire,
  stripHtml,
  toUsd,
} from '../lib/ingestion/normalize';
import { planSlot } from '../lib/ingestion/queries';
import { fetchAdzuna, mapAdzunaJob, mapCareerjetJob, mapJoobleJob } from '../lib/ingestion/sources';
import { upsertListings, type ListingFlag } from '../lib/ingestion/run';
import type { Queryable } from '../lib/ingestion/db-types';
import { screenListingContent } from '../lib/moderation';

const uae = REGION_LIST[0];
const india = REGION_LIST[2];

test('salary strings keep currency and period', () => {
  const monthly = parseSalary('AED 5,000 - 8,000 per month', 'USD');
  assert.equal(monthly.currency, 'AED');
  assert.equal(monthly.min, 5000);
  assert.equal(monthly.max, 8000);
  assert.equal(monthly.period, 'MONTH');
  assert.equal(toUsd(monthly.min, monthly.max, monthly.currency, monthly.period), Math.round(8000 * 12 * 0.2723));

  const annual = parseSalary('$80,000 - $120,000 a year', 'AED');
  assert.equal(annual.currency, 'USD');
  assert.equal(annual.min, 80000);
  assert.equal(annual.max, 120000);
  assert.equal(annual.period, 'YEAR');

  assert.equal(parseSalary('Competitive', 'AED').min, null);
});

test('dedupe key ignores case and punctuation', () => {
  const left = dedupeKey('Staff Nurse', 'City Hospital', 'Dubai', 'UAE');
  const right = dedupeKey('staff   nurse!', 'city hospital', 'dubai', 'uae');
  assert.equal(left, right);
});

test('html is stripped before a listing is stored', () => {
  assert.equal(stripHtml('<p>Hello <b>there</b></p>'), 'Hello there');
  assert.equal(stripHtml('<script>alert(1)</script>Nurse'), 'Nurse');
});

test('partner jobs expire after 30 days unseen, direct jobs wait for expires_at', () => {
  const now = new Date('2026-11-24T00:00:00Z');
  const old = new Date('2026-10-01T00:00:00Z');
  assert.equal(shouldExpire({ source: 'jooble', lastSeenAt: old, expiresAt: null, now }), true);
  assert.equal(
    shouldExpire({ source: 'direct', lastSeenAt: old, expiresAt: new Date('2026-12-01T00:00:00Z'), now }),
    false
  );
  assert.equal(
    shouldExpire({ source: 'direct', lastSeenAt: null, expiresAt: new Date('2026-11-01T00:00:00Z'), now }),
    true
  );
});

test('mappers drop listings that have no apply URL', () => {
  assert.equal(mapAdzunaJob({ title: 'Nurse', description: 'Ward work' }, uae), null);
  const job = mapJoobleJob(
    {
      id: 9,
      title: 'Accountant',
      company: 'North Books',
      location: 'Dubai',
      snippet: '<p>Month-end close</p>',
      link: 'https://jooble.org/desc/9',
      salary: 'AED 10000 per month',
      type: 'full-time',
    },
    uae
  );
  assert.ok(job);
  assert.equal(job?.source, 'jooble');
  assert.equal(job?.description, 'Month-end close');
  assert.equal(job?.salaryPeriod, 'MONTH');
});

test('Adzuna is skipped for the Gulf and mapped for India', () => {
  const mapped = mapAdzunaJob(
    {
      id: 'abc',
      title: 'Data Analyst',
      description: 'SQL and sheets',
      redirect_url: 'https://www.adzuna.in/land/ad/abc',
      company: { display_name: 'Example Labs' },
      location: { display_name: 'Bengaluru' },
      salary_min: 800000,
      salary_max: 1200000,
      contract_time: 'full_time',
    },
    india
  );
  assert.equal(mapped?.region, 'India');
  assert.equal(mapped?.salaryPeriod, 'YEAR');
  assert.equal(mapped?.sourceUrl.includes('adzuna.in'), true);
});

test('Careerjet mapper keeps the partner URL', () => {
  const mapped = mapCareerjetJob(
    {
      title: 'Chef',
      company: 'Harbor Kitchen',
      locations: 'Dubai',
      description: 'Line cook',
      url: 'https://www.careerjet.ae/job/chef-1',
      salary: 'AED 4000 per month',
    },
    uae
  );
  assert.equal(mapped?.sourceUrl, 'https://www.careerjet.ae/job/chef-1');
});

test('spam phrases are flagged and normal listings are not', () => {
  const spam = screenListingContent({
    title: 'Work from home no experience',
    description: 'Guaranteed income',
    company_name: 'Fast Cash',
    employer_verified: true,
  });
  assert.equal(spam?.rule, 'keyword_blocklist');
  const clean = screenListingContent({
    title: 'Staff nurse',
    description: 'Hospital ward, rotating shifts',
    company_name: 'City Hospital',
    employer_verified: true,
    source_url: 'https://www.careerjet.ae/job/1',
  });
  assert.equal(clean, null);
});

test('upsert stores a partner listing once and flags spam', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db: Queryable = {
    async query<T extends Record<string, unknown>>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('INSERT INTO companies')) return { rows: [{ id: 'company-1' } as unknown as T] };
      if (sql.includes('INSERT INTO jobs')) return { rows: [{ id: 'job-1', inserted: true } as unknown as T] };
      return { rows: [] as T[] };
    },
  };

  const listing = mapJoobleJob(
    {
      title: 'Teacher',
      company: 'Al Noor School',
      location: 'Dubai',
      snippet: 'Primary classroom',
      link: 'https://jooble.org/j/teacher',
    },
    uae
  );
  assert.ok(listing);

  const saved = await upsertListings(db, [listing], () => null);
  assert.equal(saved.inserted, 1);
  assert.match(calls.map((call) => call.sql).join('\n'), /ON CONFLICT \(dedupe_key\)/);

  const flagged = await upsertListings(db, [listing], () => ({ rule: 'keyword_blocklist', confidence: 0.9, reason: 'spam' } satisfies ListingFlag));
  assert.equal(flagged.flagged, 1);
  const jobInserts = calls.filter((call) => call.sql.includes('INSERT INTO jobs'));
  assert.equal(jobInserts.at(-1)?.params?.includes('flagged'), true);
});

test('feed clients do not call the network when keys are missing', async () => {
  const previousId = process.env.ADZUNA_APP_ID;
  const previousKey = process.env.ADZUNA_APP_KEY;
  delete process.env.ADZUNA_APP_ID;
  delete process.env.ADZUNA_APP_KEY;

  const fetchImpl = async () => {
    throw new Error('network should not be called');
  };
  const gulf = await fetchAdzuna(uae, 'nurse', fetchImpl);
  assert.equal(gulf.listings.length, 0);
  assert.match(gulf.skippedReason || '', /no UAE feed|does not publish/i);

  const missingKeys = await fetchAdzuna(india, 'nurse', fetchImpl);
  assert.equal(missingKeys.configured, false);
  assert.match(missingKeys.skippedReason || '', /ADZUNA_APP_ID/);

  if (previousId) process.env.ADZUNA_APP_ID = previousId;
  if (previousKey) process.env.ADZUNA_APP_KEY = previousKey;
});

test('ingest slots rotate keyword and region', () => {
  const first = planSlot(0);
  const later = planSlot(15);
  assert.equal(first.keyword, 'accountant');
  assert.equal(first.region.slug, 'ae');
  assert.equal(later.region.slug, 'sa');
  assert.equal(later.nextCursor, 16);
});
