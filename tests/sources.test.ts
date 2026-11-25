import assert from 'node:assert/strict';
import test from 'node:test';
import { allowsGoogleJobs, isBlockedIngestUrl, policyFor } from '../lib/sources/policy';
import { mapGreenhouseJob, mapRemotiveJob, resolveRegion } from '../lib/sources/adapters';

test('source policy keeps Google Jobs off for Remotive and CPC partners', () => {
  assert.equal(allowsGoogleJobs('direct'), true);
  assert.equal(allowsGoogleJobs('greenhouse'), true);
  assert.equal(allowsGoogleJobs('remoteok'), true);
  assert.equal(allowsGoogleJobs('remotive'), false);
  assert.equal(allowsGoogleJobs('careerjet'), false);
  assert.equal(allowsGoogleJobs('jooble'), false);
  assert.equal(allowsGoogleJobs('adzuna'), false);
  assert.equal(allowsGoogleJobs('employer'), true);
  assert.equal(allowsGoogleJobs('feed:remotive'), false);
  assert.equal(allowsGoogleJobs('ats:greenhouse'), true);
  assert.equal(allowsGoogleJobs('whatjobs'), false);
  assert.equal(policyFor('remotive').cpcTracked, false);
  assert.equal(policyFor('careerjet').cpcTracked, true);
  assert.equal(policyFor('remotive').redistributable, false);
});

test('blocked catalogs are refused even if a URL is offered', () => {
  assert.equal(isBlockedIngestUrl('https://www.indeed.com/viewjob?jk=1'), true);
  assert.equal(isBlockedIngestUrl('https://ae.linkedin.com/jobs/view/1'), true);
  assert.equal(isBlockedIngestUrl('https://www.glassdoor.com/job/1'), true);
  assert.equal(isBlockedIngestUrl('https://www.gulftalent.com/jobs/1'), true);
  assert.equal(isBlockedIngestUrl('https://boards.greenhouse.io/example/jobs/1'), false);
});

test('ATS and Remotive mappers keep only located, allowed apply links', () => {
  const kept = mapGreenhouseJob(
    {
      id: 10,
      title: 'Operations lead',
      content: '<p>Dubai office</p>',
      absolute_url: 'https://boards.greenhouse.io/example/jobs/10',
      location: { name: 'Dubai, UAE' },
    },
    'Example Co',
    'UAE'
  );
  assert.equal(kept?.source, 'greenhouse');
  assert.equal(kept?.region, 'UAE');
  assert.equal(kept?.description, 'Dubai office');

  const blocked = mapGreenhouseJob(
    {
      id: 11,
      title: 'Role',
      absolute_url: 'https://www.indeed.ae/viewjob?jk=11',
      location: { name: 'Dubai' },
    },
    'Example Co',
    'UAE'
  );
  assert.equal(blocked, null);

  const remotive = mapRemotiveJob({
    id: 5,
    title: 'Support',
    company_name: 'Remote Co',
    candidate_required_location: 'India',
    url: 'https://remotive.com/remote-jobs/support-5',
    description: '<p>India hours</p>',
  });
  assert.equal(remotive?.source, 'remotive');
  assert.equal(remotive?.region, 'India');
  assert.equal(resolveRegion('London', 'UAE'), null);
});
