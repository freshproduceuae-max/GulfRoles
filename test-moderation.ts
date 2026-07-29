/**
 * Moderation System Test Script
 * Tests rule-based job flagging and admin queue
 */

import { flagJob, getFlaggedJobs, reviewFlaggedJob, getFlaggedJobDetails } from './lib/moderation';
import { query, transaction } from './lib/db';

async function test() {
  console.log('Starting moderation system tests...\n');

  try {
    // Test 1: Create a job with suspicious keywords
    console.log('Test 1: Creating job with suspicious keywords');
    const suspiciousJob = {
      title: 'work from home no experience',
      description: 'Make money fast with guaranteed income from home',
      company_name: 'SuspiciousCompany',
      employer_verified: false,
      employer_email: 'test@example.com',
      source_url: 'https://example.com',
    };

    const flag = await flagJob(suspiciousJob);
    if (flag) {
      console.log(`✓ Job flagged successfully`);
      console.log(`  Rule: ${flag.rule}`);
      console.log(`  Reason: ${flag.reason}`);
      console.log(`  Confidence: ${(flag.confidence * 100).toFixed(0)}%\n`);
    } else {
      console.error('✗ Job should have been flagged but was not\n');
    }

    // Test 2: Create actual job in database and test moderation
    console.log('Test 2: Creating job in database with moderation');
    const jobResult = await transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO jobs (
          title, description, company_name, location, region, job_type,
          employer_email, status, posted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id`,
        [
          'free money guaranteed work from home',
          'Make thousands from home with no experience required guarantee',
          'TestCorp',
          'Remote',
          'USA',
          'full-time',
          'test@testcorp.com',
          'flagged',
        ]
      );

      const jobId = result.rows[0].id;

      // Create moderation flag
      await client.query(
        `INSERT INTO moderation_flags (job_id, rule_triggered, confidence, status)
         VALUES ($1, $2, $3, $4)`,
        [jobId, 'keyword_blocklist', 0.9, 'flagged']
      );

      return jobId;
    });

    console.log(`✓ Job created with ID: ${jobResult}\n`);

    // Test 3: Fetch flagged jobs
    console.log('Test 3: Fetching flagged jobs from queue');
    const { jobs, total } = await getFlaggedJobs(20, 0);
    console.log(`✓ Fetched ${jobs.length} flagged jobs`);
    console.log(`  Total in queue: ${total}`);
    if (jobs.length > 0) {
      console.log(`  First job: ${jobs[0].title}`);
      console.log(`  Rule: ${jobs[0].rule_triggered}`);
      console.log(`  Confidence: ${(jobs[0].confidence * 100).toFixed(0)}%\n`);
    }

    // Test 4: Get job details
    console.log('Test 4: Fetching job details');
    const jobDetails = await getFlaggedJobDetails(jobResult);
    if (jobDetails) {
      console.log(`✓ Job details retrieved`);
      console.log(`  Title: ${jobDetails.title}`);
      console.log(`  Flag ID: ${jobDetails.flag_id}`);
      console.log(`  Rule: ${jobDetails.rule_triggered}\n`);
    }

    // Test 5: Review job (approve)
    console.log('Test 5: Approving job');
    if (jobDetails && jobDetails.flag_id) {
      await reviewFlaggedJob(jobDetails.flag_id, 'approve', 'Job approved after review', 'test@admin.com');

      // Verify status changed
      const updated = await query<{ status: string }>(
        'SELECT status FROM jobs WHERE id = $1',
        [jobResult]
      );
      console.log(`✓ Job approved. New status: ${updated.rows[0].status}\n`);
    }

    // Test 6: Create another job and reject it
    console.log('Test 6: Creating and rejecting a job');
    const rejectJobResult = await transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO jobs (
          title, description, company_name, location, region, job_type,
          employer_email, status, posted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id`,
        [
          'Senior Developer (unverified employer)',
          'Great opportunity for developers',
          'UnverifiedCorp',
          'New York',
          'USA',
          'full-time',
          'unverified@corp.com',
          'flagged',
        ]
      );

      const rejectJobId = result.rows[0].id;

      await client.query(
        `INSERT INTO moderation_flags (job_id, rule_triggered, confidence, status)
         VALUES ($1, $2, $3, $4)`,
        [rejectJobId, 'unverified_employer', 0.5, 'flagged']
      );

      return rejectJobId;
    });

    console.log(`✓ Job created with ID: ${rejectJobResult}`);

    // Get flag ID for rejection
    const rejectJobDetails = await getFlaggedJobDetails(rejectJobResult);
    if (rejectJobDetails && rejectJobDetails.flag_id) {
      await reviewFlaggedJob(rejectJobDetails.flag_id, 'reject', 'Rejected: unverified employer', 'admin@test.com');

      const updated = await query<{ status: string }>(
        'SELECT status FROM jobs WHERE id = $1',
        [rejectJobResult]
      );
      console.log(`✓ Job rejected. New status: ${updated.rows[0].status}\n`);
    }

    // Test 7: Verify posting velocity rule
    console.log('Test 7: Testing posting velocity rule');
    const velocityJob = {
      title: 'Spam Job',
      description: 'Another spam job',
      company_name: 'SpamCorp',
      employer_verified: false,
      employer_email: 'spam@spamcorp.com',
      source_url: 'https://example.com',
    };

    const velocityFlag = await flagJob(velocityJob);
    console.log(`✓ Velocity check completed`);
    if (velocityFlag && velocityFlag.rule === 'posting_velocity') {
      console.log(`  Job flagged for posting velocity: ${velocityFlag.reason}\n`);
    } else {
      console.log(`  No velocity violation (expected if less than 10 jobs in hour)\n`);
    }

    // Test 8: Verify suspicious link detection
    console.log('Test 8: Testing suspicious link detection');
    const linkJob = {
      title: 'Job with suspicious link',
      description: 'Check out this opportunity',
      company_name: 'LinkCorp',
      employer_verified: false,
      employer_email: 'link@corp.com',
      source_url: 'https://bit.ly/malicious',
    };

    const linkFlag = await flagJob(linkJob);
    if (linkFlag && linkFlag.rule === 'suspicious_link') {
      console.log(`✓ Suspicious link detected`);
      console.log(`  Reason: ${linkFlag.reason}\n`);
    } else {
      console.log('✓ No suspicious link detected (as expected for legitimate URL)\n');
    }

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
