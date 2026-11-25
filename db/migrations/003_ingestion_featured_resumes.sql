-- Featured listings, feed dedupe, ingestion cursor, and private resume storage.
-- Safe to run once via scripts/migrate.ts.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_external_id VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dedupe_key VARCHAR(64);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS listing_tier VARCHAR(20) NOT NULL DEFAULT 'free';

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_listing_tier_check;
ALTER TABLE jobs
  ADD CONSTRAINT jobs_listing_tier_check CHECK (listing_tier IN ('free', 'featured'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_dedupe_key
  ON jobs (dedupe_key)
  WHERE dedupe_key IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs (is_featured, featured_until);
CREATE INDEX IF NOT EXISTS idx_jobs_last_seen ON jobs (last_seen_at);
CREATE INDEX IF NOT EXISTS idx_jobs_source_external ON jobs (source, source_external_id);

ALTER TABLE affiliate_clicks DROP CONSTRAINT IF EXISTS affiliate_clicks_affiliate_check;
ALTER TABLE affiliate_clicks
  ADD CONSTRAINT affiliate_clicks_affiliate_check
  CHECK (affiliate IN ('careerjet', 'jooble', 'adzuna'));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_bytes BYTEA;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_content_type VARCHAR(255);

CREATE TABLE IF NOT EXISTS ingestion_cursors (
  id TEXT PRIMARY KEY,
  cursor INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
