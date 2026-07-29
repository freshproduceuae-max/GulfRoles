import dotenv from 'dotenv';
import path from 'path';
import { query, closePool } from '@/lib/db';
import { addDays } from 'date-fns';

// Load environment variables from .env.local
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

// Type definitions
interface SeedJob {
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

// Test job data with diverse regions, types, and salary information
const seedJobs: SeedJob[] = [
  // UAE - Full-time roles
  {
    title: 'bsa_UAT_t1_Software Engineer - Backend',
    description: 'Looking for a talented backend engineer to build scalable APIs and services. Experience with Node.js, PostgreSQL, and Redis required.',
    company_name: 'Tech Corp UAT',
    location: 'Dubai',
    region: 'UAE',
    salary_min: 120000,
    salary_max: 180000,
    salary_currency: 'AED',
    salary_normalized_usd: 32658,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Product Manager',
    description: 'Join our product team to shape the future of our SaaS platform. Lead roadmap planning, user research, and cross-functional collaboration.',
    company_name: 'Global Solutions UAT',
    location: 'Dubai',
    region: 'UAE',
    salary_min: 150000,
    salary_max: 220000,
    salary_currency: 'AED',
    salary_normalized_usd: 40877,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Data Scientist',
    description: 'Help us unlock insights from massive datasets. Build ML models for predictive analytics. Python, TensorFlow, and SQL expertise needed.',
    company_name: 'Analytics Pro UAT',
    location: 'Abu Dhabi',
    region: 'UAE',
    salary_min: 140000,
    salary_max: 200000,
    salary_currency: 'AED',
    salary_normalized_usd: 38126,
    job_type: 'full-time',
    employer_verified: false,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_DevOps Engineer',
    description: 'Maintain and improve our cloud infrastructure on AWS. Experience with Kubernetes, Docker, and CI/CD pipelines essential.',
    company_name: 'Cloud Masters UAT',
    location: 'Dubai',
    region: 'UAE',
    salary_min: 110000,
    salary_max: 170000,
    salary_currency: 'AED',
    salary_normalized_usd: 30877,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },

  // Saudi Arabia - Mix of full-time and contract
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
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Business Development Manager',
    description: 'Open new business opportunities across GCC markets. Lead sales strategy and client relationships.',
    company_name: 'Growth Partners UAT',
    location: 'Jeddah',
    region: 'Saudi',
    salary_min: 130000,
    salary_max: 190000,
    salary_currency: 'SAR',
    salary_normalized_usd: 34667,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_QA Automation Specialist',
    description: 'Build robust testing frameworks and automation suites. Selenium, Python, and CI/CD knowledge required.',
    company_name: 'Quality First UAT',
    location: 'Riyadh',
    region: 'Saudi',
    salary_min: 85000,
    salary_max: 130000,
    salary_currency: 'SAR',
    salary_normalized_usd: 22667,
    job_type: 'contract',
    employer_verified: false,
    employer_email: 'test@example.com',
  },

  // India - Mix of all job types
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
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Machine Learning Engineer',
    description: 'Work on cutting-edge ML projects. PyTorch, TensorFlow, and cloud platforms like AWS required.',
    company_name: 'AI Innovations UAT',
    location: 'Bangalore',
    region: 'India',
    salary_min: 1000000,
    salary_max: 1600000,
    salary_currency: 'INR',
    salary_normalized_usd: 13333,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Senior Systems Architect',
    description: 'Design scalable distributed systems for enterprise clients. 8+ years experience mandatory.',
    company_name: 'Enterprise Solutions UAT',
    location: 'Hyderabad',
    region: 'India',
    salary_min: 1500000,
    salary_max: 2200000,
    salary_currency: 'INR',
    salary_normalized_usd: 20000,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Content Writer - Tech',
    description: 'Create engaging technical blog posts and documentation. 2+ years tech writing experience.',
    company_name: 'Content Creators UAT',
    location: 'Bangalore',
    region: 'India',
    salary_min: 400000,
    salary_max: 700000,
    salary_currency: 'INR',
    salary_normalized_usd: 5333,
    job_type: 'part-time',
    employer_verified: false,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Internship - Software Development',
    description: 'Learn from industry experts while contributing to real projects. Great for fresh graduates.',
    company_name: 'Tech Talent Academy UAT',
    location: 'Bangalore',
    region: 'India',
    salary_min: 150000,
    salary_max: 250000,
    salary_currency: 'INR',
    salary_normalized_usd: 2000,
    job_type: 'internship',
    employer_verified: true,
    employer_email: 'test@example.com',
  },

  // Australia - High-paying roles
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
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Cloud Solutions Architect',
    description: 'Design cloud solutions for enterprise clients. AWS/Azure certifications preferred.',
    company_name: 'Cloud Down Under UAT',
    location: 'Sydney',
    region: 'Australia',
    salary_min: 200000,
    salary_max: 280000,
    salary_currency: 'AUD',
    salary_normalized_usd: 172000,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_UX/UI Designer',
    description: 'Create stunning user experiences for our mobile apps. Figma, user research, prototyping skills needed.',
    company_name: 'Design Studio Australia UAT',
    location: 'Melbourne',
    region: 'Australia',
    salary_min: 120000,
    salary_max: 170000,
    salary_currency: 'AUD',
    salary_normalized_usd: 103500,
    job_type: 'full-time',
    employer_verified: false,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Tech Lead - Contract',
    description: 'Lead a technical team on a 6-month contract. Hands-on experience with modern JavaScript frameworks.',
    company_name: 'Contract Specialists UAT',
    location: 'Brisbane',
    region: 'Australia',
    salary_min: 210000,
    salary_max: 290000,
    salary_currency: 'AUD',
    salary_normalized_usd: 186500,
    job_type: 'contract',
    employer_verified: true,
    employer_email: 'test@example.com',
  },

  // USA - Remote and onsite
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
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Product Strategy Manager',
    description: 'Drive product strategy for B2B SaaS platform. Strategic thinking and leadership skills essential.',
    company_name: 'Growth Strategies UAT',
    location: 'San Francisco',
    region: 'USA',
    salary_min: 280000,
    salary_max: 380000,
    salary_currency: 'USD',
    salary_normalized_usd: 330000,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_AI/ML Research Scientist',
    description: 'Publish papers and build state-of-the-art ML models. PhD preferred, exceptional talent considered.',
    company_name: 'AI Research Labs UAT',
    location: 'Boston',
    region: 'USA',
    salary_min: 300000,
    salary_max: 450000,
    salary_currency: 'USD',
    salary_normalized_usd: 375000,
    job_type: 'full-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Software Engineer Intern - Summer 2025',
    description: 'Join our internship program. Learn from experienced engineers. 10 weeks, mentorship included.',
    company_name: 'Tech Academy USA UAT',
    location: 'Seattle',
    region: 'USA',
    salary_min: 25,
    salary_max: 35,
    salary_currency: 'USD',
    salary_normalized_usd: 30,
    job_type: 'internship',
    employer_verified: false,
    employer_email: 'test@example.com',
  },
  {
    title: 'bsa_UAT_t1_Part-time Technical Writer',
    description: 'Create API documentation and guides. 15-20 hours/week. Flexible schedule.',
    company_name: 'Documentation Experts UAT',
    location: 'Remote (USA)',
    region: 'USA',
    salary_min: 35,
    salary_max: 55,
    salary_currency: 'USD',
    salary_normalized_usd: 45,
    job_type: 'part-time',
    employer_verified: true,
    employer_email: 'test@example.com',
  },
];

/**
 * Seed the database with test jobs
 */
async function seed() {
  try {
    console.log('Starting database seed with test jobs...');
    console.log(`Preparing to insert ${seedJobs.length} test jobs...\n`);

    const expiresAt = addDays(new Date(), 30);
    const results = [];

    for (let i = 0; i < seedJobs.length; i++) {
      const job = seedJobs[i];

      try {
        const result = await query(
          `INSERT INTO jobs (
            title,
            description,
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
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14, $15
          ) RETURNING id, title, company_name, location;`,
          [
            job.title,
            job.description,
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
          results.push(result.rows[0]);
          console.log(
            `✓ [${i + 1}/${seedJobs.length}] Created: ${job.title} at ${job.company_name} (${job.location})`
          );
        }
      } catch (error) {
        console.error(`✗ Failed to insert job ${i + 1}:`, error);
        throw error;
      }
    }

    console.log(`\n✓ Successfully seeded ${results.length} test jobs!`);
    console.log('\nSample job IDs created:');
    results.slice(0, 5).forEach((job) => {
      console.log(`  - ${job.title}: ${job.id}`);
    });

    console.log(`\nAll jobs are marked as 'published' and searchable.`);
    console.log(`Expiration date: ${expiresAt.toISOString()}`);
    console.log('\nYou can test the search by running:');
    console.log('  curl "http://localhost:3001/api/jobs?q=&page=1&limit=10"');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the seed
seed();
