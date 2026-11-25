-- Applicant status links and portable resume storage.
-- Safe to run once. Existing rows keep working.

ALTER TABLE applications ADD COLUMN IF NOT EXISTS status_token UUID;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_store VARCHAR(20) NOT NULL DEFAULT 'neon';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_key TEXT;

UPDATE applications
SET status_token = uuid_generate_v4()
WHERE status_token IS NULL;

ALTER TABLE applications ALTER COLUMN status_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_status_token
  ON applications (status_token);

ALTER TABLE applications ALTER COLUMN applicant_phone TYPE VARCHAR(40);

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_resume_store_check;
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_store_check
  CHECK (resume_store IN ('neon', 'blob'));
