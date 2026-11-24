import dotenv from 'dotenv';
import path from 'path';
import { query, closePool } from '@/lib/db';
import { addDays } from 'date-fns';
import bcryptjs from 'bcryptjs';

// Load environment variables from .env.local or .env.production
dotenv.config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'),
});

/**
 * Production Database Seeding Script
 *
 * This script initializes production database with:
 * 1. Test employer accounts (with UAT prefix)
 * 2. Test admin users
 * 3. Sample job listings (with UAT prefix for easy cleanup)
 *
 * UAT Data Cleanup:
 * - All test jobs prefixed with "bsa_UAT_t1_" for easy identification
 * - All test jobs can be deleted with:
 *   DELETE FROM jobs WHERE title LIKE 'bsa_UAT_t1_%';
 * - All test companies can be deleted with:
 *   DELETE FROM companies WHERE name LIKE '%UAT%';
 */

interface TestJob {
  title: string;
  description: string;
  company_name: string;
  location: string;
  region: 'UAE' | 'Saudi' | 'India' | 'Australia' | 'USA';
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_normalized_usd?: number;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  employer_verified: boolean;
  employer_email: string;
}

interface TestAdmin {
  email: string;
  password: string;
  role: 'moderator' | 'admin' | 'superadmin';
}

interface TestCompany {
  name: string;
  website?: string;
  logo_url?: string;
  description?: string;
  region: 'UAE' | 'Saudi' | 'India' | 'Australia' | 'USA';
  verified: boolean;
  email: string;
}

// Test companies to seed
const testCompanies: TestCompany[] = [
  {
    name: 'Tech Corp UAT',
    website: 'https://techcorp.example.com',
    description: 'UAT Testing Company - Technology Services',
    region: 'UAE',
    verified: true,
    email: 'employer-uae@test.jobbrowser.app',
  },
  {
    name: 'Global Solutions UAT',
    website: 'https://globalsolutions.example.com',
    description: 'UAT Testing Company - Global IT Solutions',
    region: 'UAE',
    verified: true,
    email: 'employer-uae2@test.jobbrowser.app',
  },
  {
    name: 'Saudi Tech Hub UAT',
    website: 'https://sauditechhub.example.com',
    description: 'UAT Testing Company - Saudi Arabia Tech',
    region: 'Saudi',
    verified: true,
    email: 'employer-sa@test.jobbrowser.app',
  },
  {
    name: 'India Tech Leaders UAT',
    website: 'https://indiatechleaders.example.com',
    description: 'UAT Testing Company - India Tech Solutions',
    region: 'India',
    verified: true,
    email: 'employer-in@test.jobbrowser.app',
  },
  {
    name: 'Aussie FinTech UAT',
    website: 'https://aussiefintech.example.com',
    description: 'UAT Testing Company - Australia FinTech',
    region: 'Australia',
    verified: true,
    email: 'employer-au@test.jobbrowser.app',
  },
  {
    name: 'Tech Giants USA UAT',
    website: 'https://techgiants.example.com',
    description: 'UAT Testing Company - USA Tech Giants',
    region: 'USA',
    verified: true,
    email: 'employer-us@test.jobbrowser.app',
  },
];

// Sample test jobs with UAT prefix
const testJobs: TestJob[] = [
  // UAE Jobs
  {
    title: 'bsa_UAT_t1_Senior Software Engineer',
    description: 'Looking for a talented backend engineer to build scalable APIs. Experience with Node.js, PostgreSQL required.',
    company_name: 'Tech Corp UAT',
    location: 'Dubai',
    region: 'UAE',
    salary_min: 120000,
    salary_max: 180000,
    salary_currency: 'AED',
    salary_normalized_usd: 32658,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'employer-uae@test.jobbrowser.app',
  },
  {
    title: 'bsa_UAT_t1_Product Manager',
    description: 'Join our product team to shape the future. Lead roadmap planning and cross-functional collaboration.',
    company_name: 'Global Solutions UAT',
    location: 'Dubai',
    region: 'UAE',
    salary_min: 150000,
    salary_max: 220000,
    salary_currency: 'AED',
    salary_normalized_usd: 40877,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'employer-uae2@test.jobbrowser.app',
  },

  // Saudi Jobs
  {
    title: 'bsa_UAT_t1_Frontend Developer',
    description: 'Build beautiful UIs with React and TypeScript. Join a startup transforming the Saudi tech landscape.',
    company_name: 'Saudi Tech Hub UAT',
    location: 'Riyadh',
    region: 'Saudi',
    salary_min: 100000,
    salary_max: 160000,
    salary_currency: 'SAR',
    salary_normalized_usd: 26667,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'employer-sa@test.jobbrowser.app',
  },

  // India Jobs
  {
    title: 'bsa_UAT_t1_Full Stack Developer',
    description: 'Build end-to-end web applications. Java/Python backend with React frontend. 3+ years experience needed.',
    company_name: 'India Tech Leaders UAT',
    location: 'Bangalore',
    region: 'India',
    salary_min: 800000,
    salary_max: 1200000,
    salary_currency: 'INR',
    salary_normalized_usd: 10667,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'employer-in@test.jobbrowser.app',
  },

  // Australia Jobs
  {
    title: 'bsa_UAT_t1_Senior Software Engineer',
    description: 'Lead technical initiatives at an innovative fintech startup. 5+ years with modern tech stack.',
    company_name: 'Aussie FinTech UAT',
    location: 'Sydney',
    region: 'Australia',
    salary_min: 180000,
    salary_max: 250000,
    salary_currency: 'AUD',
    salary_normalized_usd: 155000,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'employer-au@test.jobbrowser.app',
  },

  // USA Jobs
  {
    title: 'bsa_UAT_t1_Senior Software Engineer (Remote)',
    description: 'Join our distributed team. Work on backend systems using Go and Python. Remote-first culture.',
    company_name: 'Tech Giants USA UAT',
    location: 'New York (Remote)',
    region: 'USA',
    salary_min: 250000,
    salary_max: 350000,
    salary_currency: 'USD',
    salary_normalized_usd: 300000,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'employer-us@test.jobbrowser.app',
  },
];

// Test admin users
const testAdmins: TestAdmin[] = [
  {
    email: 'admin@test.jobbrowser.app',
    password: '',
    role: 'superadmin',
  },
  {
    email: 'moderator@test.jobbrowser.app',
    password: '',
    role: 'moderator',
  },
];

/**
 * Seed companies into the database
 */
async function seedCompanies(): Promise<Map<string, string>> {
  console.log('\n=== Seeding Test Companies ===');
  const companyMap = new Map<string, string>();

  for (const company of testCompanies) {
    try {
      const result = await query(
        `INSERT INTO companies (name, website, description, region, verified)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
         RETURNING id, name;`,
        [company.name, company.website || null, company.description || null, company.region, company.verified]
      );

      if (result.rows[0]) {
        companyMap.set(company.name, result.rows[0].id);
        console.log(`✓ Company: ${company.name} (${company.region})`);
      }
    } catch (error) {
      console.error(`✗ Failed to seed company ${company.name}:`, error);
    }
  }

  console.log(`✓ Seeded ${companyMap.size} companies`);
  return companyMap;
}

/**
 * Seed test admin users
 */
async function seedAdmins(): Promise<void> {
  console.log('\n=== Seeding Admin Users ===');
  const samplePassword = process.env.SEED_SAMPLE_ADMIN_PASSWORD;
  if (!samplePassword) {
    console.log('Skipped demo admins. Set SEED_SAMPLE_ADMIN_PASSWORD only on a private demo database.');
    return;
  }

  for (const admin of testAdmins) {
    try {
      const passwordHash = await bcryptjs.hash(samplePassword, 10);

      await query(
        `INSERT INTO admin_users (email, password_hash, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET password_hash = $2, role = $3
         RETURNING email, role;`,
        [admin.email, passwordHash, admin.role]
      );

      console.log(`✓ Admin: ${admin.email} (${admin.role})`);
    } catch (error) {
      console.error(`✗ Failed to seed admin ${admin.email}:`, error);
    }
  }

  console.log(`✓ Seeded ${testAdmins.length} admin users`);
}

/**
 * Seed test jobs
 */
async function seedJobs(companyMap: Map<string, string>): Promise<void> {
  console.log('\n=== Seeding Test Jobs ===');
  const expiresAt = addDays(new Date(), 90); // 90 days for production testing
  let successCount = 0;

  for (let i = 0; i < testJobs.length; i++) {
    const job = testJobs[i];

    try {
      const companyId = companyMap.get(job.company_name);

      const result = await query(
        `INSERT INTO jobs (
          title,
          description,
          company_id,
          company_name,
          location,
          region,
          salary_min,
          salary_max,
          salary_currency,
          salary_normalized_usd,
          job_type,
          source,
          employer_email,
          employer_verified,
          posted_at,
          expires_at,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16
        ) RETURNING id, title, company_name;`,
        [
          job.title,
          job.description,
          companyId || null,
          job.company_name,
          job.location,
          job.region,
          job.salary_min || null,
          job.salary_max || null,
          job.salary_currency || 'USD',
          job.salary_normalized_usd || null,
          job.job_type,
          'direct',
          job.employer_email,
          job.employer_verified,
          expiresAt,
          'published',
        ]
      );

      if (result.rows[0]) {
        successCount++;
        console.log(`✓ [${i + 1}/${testJobs.length}] ${job.title} at ${job.company_name}`);
      }
    } catch (error) {
      console.error(`✗ Failed to insert job ${i + 1}:`, error);
    }
  }

  console.log(`✓ Seeded ${successCount}/${testJobs.length} jobs`);
}

/**
 * Verify seeding results
 */
async function verifySeed(): Promise<void> {
  console.log('\n=== Verification ===');

  try {
    const companyCount = await query('SELECT COUNT(*) FROM companies WHERE name LIKE \'%UAT%\';');
    const adminCount = await query('SELECT COUNT(*) FROM admin_users WHERE email LIKE \'%test%\';');
    const jobCount = await query('SELECT COUNT(*) FROM jobs WHERE title LIKE \'bsa_UAT_t1_%\';');

    console.log(`Companies: ${companyCount.rows[0].count}`);
    console.log(`Admins: ${adminCount.rows[0].count}`);
    console.log(`Jobs: ${jobCount.rows[0].count}`);
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

/**
 * Main seed function
 */
async function seedProduction() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set.');
      process.exit(1);
    }

    console.log('JobBrowser database setup');
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const passwordHash = await bcryptjs.hash(process.env.ADMIN_PASSWORD, 10);
      await query(
        `INSERT INTO admin_users (email, password_hash, role)
         VALUES ($1, $2, 'admin')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
        [process.env.ADMIN_EMAIL.toLowerCase(), passwordHash]
      );
      console.log(`Admin row saved for ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('No ADMIN_EMAIL / ADMIN_PASSWORD. Admin sign-in can still use those env vars without a database row.');
    }

    if (process.env.SEED_SAMPLE_JOBS === 'true') {
      console.log('Inserting labeled UAT fixtures. Do not run this against the public database.');
      const companyMap = await seedCompanies();
      await seedJobs(companyMap);
      await seedAdmins();
      await verifySeed();
    } else {
      console.log('Sample listings were not inserted. Use npm run ingest after the affiliate keys are set.');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the seed
if (process.argv[2] === '--confirm') {
  seedProduction();
} else {
  console.log('⚠️  Production seeding script ready.');
  console.log('Run with: npm run seed:production -- --confirm');
  process.exit(0);
}
