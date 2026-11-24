import assert from 'node:assert/strict';
import test from 'node:test';
import { generateAffiliateUrl } from '../lib/affiliate';

test('affiliate URL carries the job id and affiliate id', () => {
  const previousUrl = process.env.CAREERJET_AFFILIATE_URL;
  const previousId = process.env.CAREERJET_AFFILIATE_ID;
  process.env.CAREERJET_AFFILIATE_URL = 'https://www.careerjet.ae/search';
  process.env.CAREERJET_AFFILIATE_ID = 'pub-123';

  const url = new URL(generateAffiliateUrl('job-1', 'careerjet', 'nurse'));
  assert.equal(url.searchParams.get('q'), 'nurse');
  assert.equal(url.searchParams.get('utm_content'), 'job-1');
  assert.equal(url.searchParams.get('affid'), 'pub-123');

  if (previousUrl) process.env.CAREERJET_AFFILIATE_URL = previousUrl;
  else delete process.env.CAREERJET_AFFILIATE_URL;
  if (previousId) process.env.CAREERJET_AFFILIATE_ID = previousId;
  else delete process.env.CAREERJET_AFFILIATE_ID;
});

test('unconfigured network does not invent a redirect', () => {
  const previous = process.env.ADZUNA_AFFILIATE_URL;
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  delete process.env.ADZUNA_AFFILIATE_URL;
  delete process.env.ADZUNA_APP_ID;
  delete process.env.ADZUNA_APP_KEY;
  assert.equal(generateAffiliateUrl('job-1', 'adzuna', 'nurse'), '');
  if (previous) process.env.ADZUNA_AFFILIATE_URL = previous;
  if (appId) process.env.ADZUNA_APP_ID = appId;
  if (appKey) process.env.ADZUNA_APP_KEY = appKey;
});
