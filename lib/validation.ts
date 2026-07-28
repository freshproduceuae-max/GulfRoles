import { z } from 'zod';

// Job schema for type safety and validation
export const JobSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Job title is required').max(255),
  description: z.string().min(1, 'Job description is required'),
  company_id: z.string().uuid(),
  company_name: z.string().min(1, 'Company name is required').max(255),
  location: z.string().min(1, 'Location is required').max(255),
  region: z.string().min(1, 'Region is required').max(100),
  salary_min: z.number().int().nonnegative().nullable(),
  salary_max: z.number().int().nonnegative().nullable(),
  salary_currency: z.string().length(3).toUpperCase().optional().nullable(),
  job_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP']),
  source: z.string().min(1).max(255),
  employer_verified: z.boolean().default(false),
  posted_at: z.date(),
  expires_at: z.date().nullable(),
  status: z.enum(['ACTIVE', 'FILLED', 'EXPIRED', 'ARCHIVED']).default('ACTIVE'),
  application_count: z.number().int().nonnegative().default(0),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Job = z.infer<typeof JobSchema>;

// Alert subscription schema for saved searches
export const AlertSubscriptionSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY']).default('DAILY'),
  keywords: z.array(z.string().min(1).max(100)).min(1, 'At least one keyword is required'),
  locations: z.array(z.string().min(1).max(255)),
  salary_min: z.number().int().nonnegative().nullable().optional(),
  active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type AlertSubscription = z.infer<typeof AlertSubscriptionSchema>;

// Partial Job schema for updates
export const JobUpdateSchema = JobSchema.partial();
export type JobUpdate = z.infer<typeof JobUpdateSchema>;

// Schema for search filters
export const JobSearchFiltersSchema = z.object({
  keywords: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  job_types: z.array(z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'])).optional(),
  salary_min: z.number().int().nonnegative().optional(),
  salary_max: z.number().int().nonnegative().optional(),
  sort_by: z.enum(['POSTED_DATE', 'SALARY', 'RELEVANCE']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type JobSearchFilters = z.infer<typeof JobSearchFiltersSchema>;
