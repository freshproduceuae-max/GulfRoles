-- Source policy columns, opted-in ATS boards, and open click tracking.
-- Does not add Indeed, Glassdoor, LinkedIn, or GulfTalent.

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_source_check;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_url VARCHAR(2048);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attribution TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS google_jobs_allowed BOOLEAN;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cpc_tracked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS redistributable BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE affiliate_clicks DROP CONSTRAINT IF EXISTS affiliate_clicks_affiliate_check;

CREATE TABLE IF NOT EXISTS ats_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor VARCHAR(40) NOT NULL,
  board_token VARCHAR(200) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  region VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (vendor, board_token)
);

CREATE INDEX IF NOT EXISTS idx_ats_boards_company ON ats_boards (company_id);
CREATE INDEX IF NOT EXISTS idx_ats_boards_status ON ats_boards (status);
