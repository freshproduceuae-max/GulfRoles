import { query } from './db';

/**
 * Moderation flag result
 */
export interface ModerationFlag {
  shouldFlag: boolean;
  reason: string;
  confidence: number;
  rule: string;
}

/**
 * Job data for moderation checks
 */
export interface JobToModerate {
  id?: string;
  title: string;
  description: string;
  company_name: string;
  employer_verified: boolean;
  employer_email?: string;
  source_url?: string;
}

/**
 * Keyword blocklist for suspicious content
 * High confidence: 0.9
 */
const KEYWORD_BLOCKLIST = [
  'work from home no experience',
  'free money',
  'make money fast',
  'guaranteed income',
  'no experience required guarantee',
  'earn thousands from home',
  'guaranteed job placement',
];

/**
 * Known phishing domains to check for
 * High confidence: 0.95
 */
const PHISHING_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'short.link',
  'goo.gl',
];

/**
 * Check for suspicious keywords in job content
 */
function checkKeywords(job: JobToModerate): ModerationFlag | null {
  const content = `${job.title} ${job.description}`.toLowerCase();

  for (const keyword of KEYWORD_BLOCKLIST) {
    if (content.includes(keyword.toLowerCase())) {
      return {
        shouldFlag: true,
        reason: `Suspicious keyword detected: "${keyword}"`,
        confidence: 0.9,
        rule: 'keyword_blocklist',
      };
    }
  }

  return null;
}

/**
 * Check for unverified employer
 */
function checkUnverifiedEmployer(job: JobToModerate): ModerationFlag | null {
  if (!job.employer_verified) {
    return {
      shouldFlag: true,
      reason: 'Employer not verified',
      confidence: 0.5,
      rule: 'unverified_employer',
    };
  }

  return null;
}

/**
 * Check for suspicious external links
 */
function checkSuspiciousLinks(job: JobToModerate): ModerationFlag | null {
  if (!job.source_url) return null;

  const url = job.source_url.toLowerCase();

  for (const domain of PHISHING_DOMAINS) {
    if (url.includes(domain)) {
      return {
        shouldFlag: true,
        reason: `Suspicious link domain detected: ${domain}`,
        confidence: 0.85,
        rule: 'suspicious_link',
      };
    }
  }

  return null;
}

/**
 * Check for posting velocity (spam: many jobs from same employer in short time)
 */
async function checkPostingVelocity(job: JobToModerate): Promise<ModerationFlag | null> {
  if (!job.employer_email) return null;

  // Check jobs posted by this employer in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM jobs
     WHERE employer_email = $1
     AND posted_at > $2`,
    [job.employer_email, oneHourAgo.toISOString()]
  );

  const count = parseInt(result.rows[0]?.count || '0', 10);

  if (count >= 10) {
    return {
      shouldFlag: true,
      reason: `Employer posted ${count} jobs in the last hour (spam indicator)`,
      confidence: 0.85,
      rule: 'posting_velocity',
    };
  }

  return null;
}

/**
 * Flag a job for moderation if suspicious patterns detected
 * Returns the highest-confidence flag or null if no issues
 */
export async function flagJob(job: JobToModerate): Promise<ModerationFlag | null> {
  const flags: ModerationFlag[] = [];

  // Run all checks
  const keywordFlag = checkKeywords(job);
  if (keywordFlag) flags.push(keywordFlag);

  const unverifiedFlag = checkUnverifiedEmployer(job);
  if (unverifiedFlag) flags.push(unverifiedFlag);

  const linksFlag = checkSuspiciousLinks(job);
  if (linksFlag) flags.push(linksFlag);

  const velocityFlag = await checkPostingVelocity(job);
  if (velocityFlag) flags.push(velocityFlag);

  // Return the flag with highest confidence
  if (flags.length > 0) {
    return flags.reduce((prev, current) =>
      current.confidence > prev.confidence ? current : prev
    );
  }

  return null;
}

/**
 * Create a moderation flag record in the database
 */
export async function createModerationFlag(
  jobId: string,
  flag: ModerationFlag
): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO moderation_flags (job_id, rule_triggered, confidence, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [jobId, flag.rule, flag.confidence, 'flagged']
  );

  return result.rows[0].id;
}

/**
 * Get flagged jobs for moderation queue
 */
export async function getFlaggedJobs(
  limit: number = 20,
  offset: number = 0
): Promise<{
  jobs: Array<{
    id: string;
    title: string;
    company_name: string;
    employer_email: string | null;
    rule_triggered: string;
    confidence: number;
    reason: string;
    flag_id: string;
    posted_at: Date;
    created_at: Date;
  }>;
  total: number;
}> {
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM moderation_flags
     WHERE status = $1`,
    ['flagged']
  );

  const total = parseInt(countResult.rows[0]?.count || '0', 10);

  // Get flagged jobs with details
  const result = await query<{
    id: string;
    title: string;
    company_name: string;
    employer_email: string | null;
    rule_triggered: string;
    confidence: string;
    flag_id: string;
    posted_at: string;
    flag_created_at: string;
  }>(
    `SELECT
       j.id,
       j.title,
       j.company_name,
       j.employer_email,
       mf.rule_triggered,
       mf.confidence,
       mf.id as flag_id,
       j.posted_at,
       mf.created_at as flag_created_at
     FROM moderation_flags mf
     JOIN jobs j ON mf.job_id = j.id
     WHERE mf.status = $1
     ORDER BY mf.confidence DESC, mf.created_at DESC
     LIMIT $2 OFFSET $3`,
    ['flagged', limit, offset]
  );

  const jobs = result.rows.map(row => ({
    id: row.id,
    title: row.title,
    company_name: row.company_name,
    employer_email: row.employer_email,
    rule_triggered: row.rule_triggered,
    confidence: parseFloat(row.confidence),
    reason: getRuleDescription(row.rule_triggered),
    flag_id: row.flag_id,
    posted_at: new Date(row.posted_at),
    created_at: new Date(row.flag_created_at),
  }));

  return { jobs, total };
}

/**
 * Get human-readable description for a rule
 */
function getRuleDescription(rule: string): string {
  switch (rule) {
    case 'keyword_blocklist':
      return 'Suspicious keywords detected';
    case 'unverified_employer':
      return 'Employer not verified';
    case 'posting_velocity':
      return 'Unusual posting velocity (possible spam)';
    case 'suspicious_link':
      return 'Suspicious external link detected';
    default:
      return 'Unknown flag';
  }
}

/**
 * Review a flagged job (approve or reject)
 */
export async function reviewFlaggedJob(
  flagId: string,
  decision: 'approve' | 'reject',
  adminNotes?: string,
  reviewedBy?: string
): Promise<void> {
  // Get the flag and associated job
  const flagResult = await query<{
    job_id: string;
  }>(
    `SELECT job_id FROM moderation_flags WHERE id = $1`,
    [flagId]
  );

  if (flagResult.rows.length === 0) {
    throw new Error('Flag not found');
  }

  const jobId = flagResult.rows[0].job_id;
  const newJobStatus = decision === 'approve' ? 'published' : 'rejected';
  const newFlagStatus = decision === 'approve' ? 'approved' : 'rejected';

  // Update moderation flag and job status in transaction
  await query(
    `BEGIN`
  );

  try {
    // Update flag
    await query(
      `UPDATE moderation_flags
       SET status = $1, admin_notes = $2, admin_reviewed_by = $3, admin_reviewed_at = NOW()
       WHERE id = $4`,
      [newFlagStatus, adminNotes || null, reviewedBy || null, flagId]
    );

    // Update job status
    await query(
      `UPDATE jobs
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [newJobStatus, jobId]
    );

    await query(`COMMIT`);
  } catch (error) {
    await query(`ROLLBACK`);
    throw error;
  }
}

/**
 * Get a flagged job with full details
 */
export async function getFlaggedJobDetails(jobId: string): Promise<{
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: string;
  employer_email: string | null;
  employer_verified: boolean;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  posted_at: Date;
  flag_id: string;
  rule_triggered: string;
  confidence: number;
  admin_notes: string | null;
} | null> {
  const result = await query<{
    id: string;
    title: string;
    description: string;
    company_name: string;
    location: string;
    region: string;
    employer_email: string | null;
    employer_verified: boolean;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
    posted_at: string;
    flag_id: string;
    rule_triggered: string;
    confidence: string;
    admin_notes: string | null;
  }>(
    `SELECT
       j.id,
       j.title,
       j.description,
       j.company_name,
       j.location,
       j.region,
       j.employer_email,
       j.employer_verified,
       j.job_type,
       j.salary_min,
       j.salary_max,
       j.posted_at,
       mf.id as flag_id,
       mf.rule_triggered,
       mf.confidence,
       mf.admin_notes
     FROM jobs j
     LEFT JOIN moderation_flags mf ON j.id = mf.job_id AND mf.status = $1
     WHERE j.id = $2`,
    ['flagged', jobId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    company_name: row.company_name,
    location: row.location,
    region: row.region,
    employer_email: row.employer_email,
    employer_verified: row.employer_verified,
    job_type: row.job_type,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    posted_at: new Date(row.posted_at),
    flag_id: row.flag_id,
    rule_triggered: row.rule_triggered,
    confidence: parseFloat(row.confidence),
    admin_notes: row.admin_notes,
  };
}
