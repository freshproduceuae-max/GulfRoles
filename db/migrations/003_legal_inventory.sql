-- Source tags, Google Jobs flag, apply URL, and CPC-ready click tracking.
-- Inventory is employer posts + documented ATS/feeds only (no Indeed/Glassdoor/LinkedIn/GulfTalent scrape).

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_source_check;
ALTER TABLE jobs ALTER COLUMN source SET DEFAULT 'employer';

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_job_id VARCHAR(512);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_url VARCHAR(2048);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS google_jobs_allowed BOOLEAN;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attribution TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_source_job_id
  ON jobs(source, source_job_id)
  WHERE source_job_id IS NOT NULL AND deleted_at IS NULL;

UPDATE jobs SET source = 'employer' WHERE source IN ('direct');

ALTER TABLE affiliate_clicks DROP CONSTRAINT IF EXISTS affiliate_clicks_affiliate_check;
ALTER TABLE affiliate_clicks ALTER COLUMN affiliate TYPE VARCHAR(100);
