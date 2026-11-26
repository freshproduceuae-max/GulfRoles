-- Live listings filter on status and deleted_at, then sort by posted_at.
-- NOW() cannot appear in an index predicate, so expiry stays a residual filter.
-- Region pages use the second index.

CREATE INDEX IF NOT EXISTS idx_jobs_live_posted_at
  ON jobs (posted_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_live_region_posted_at
  ON jobs (region, posted_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;
