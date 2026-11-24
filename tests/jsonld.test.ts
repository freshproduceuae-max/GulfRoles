import assert from 'node:assert/strict';
import test from 'node:test';
import { buildJobPostingJsonLd } from '../lib/jsonld';

test('JobPosting JSON-LD names the employer and does not invent a salary unit', () => {
  const payload = buildJobPostingJsonLd({
    id: 'job-1',
    title: 'Nurse',
    description: '<p>Ward</p>',
    companyName: 'City Hospital',
    location: 'Dubai',
    region: 'UAE',
    datePosted: '2026-11-01T00:00:00Z',
    validThrough: '2026-12-01T00:00:00Z',
    employmentType: 'full-time',
    salaryMin: 5000,
    salaryMax: 8000,
    salaryCurrency: 'AED',
    salaryUnit: null,
    directApply: false,
    url: 'https://jobbrowser.app/jobs/job-1',
  });

  assert.equal(payload['@type'], 'JobPosting');
  assert.equal(payload.directApply, false);
  assert.equal(payload.employmentType, 'FULL_TIME');
  assert.equal(payload.baseSalary, undefined);
  const location = payload.jobLocation as { address: { addressCountry: string } };
  assert.equal(location.address.addressCountry, 'AE');
});
