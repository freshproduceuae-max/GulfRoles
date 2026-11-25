import { allowsGoogleJobs } from './job-source';
import { buildJobPostingJsonLd } from './jsonld';

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const job = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Engineer',
  description: 'Build things in Dubai',
  company_name: 'Acme',
  location: 'Dubai',
  region: 'UAE',
  job_type: 'full-time',
  posted_at: '2026-11-25T00:00:00.000Z',
};

assert(allowsGoogleJobs('employer') === true, 'employer google jobs');
assert(allowsGoogleJobs('ats:greenhouse') === true, 'ats google jobs');
assert(allowsGoogleJobs('feed:remoteok') === true, 'remoteok google jobs');
assert(allowsGoogleJobs('feed:remotive') === false, 'remotive no google jobs');
assert(allowsGoogleJobs('partner:whatjobs') === false, 'whatjobs no google jobs');
assert(allowsGoogleJobs('partner:careerjet') === false, 'careerjet no google jobs until IO');
assert(buildJobPostingJsonLd({ ...job, source: 'employer' }, 'https://example.com/jobs/1'), 'jsonld employer');
assert(buildJobPostingJsonLd({ ...job, source: 'feed:remotive' }, 'https://example.com/jobs/1') === null, 'skip remotive jsonld');

console.log('jsonld policy ok');
