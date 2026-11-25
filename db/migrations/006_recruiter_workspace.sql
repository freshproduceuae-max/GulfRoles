-- Recruiter workspace: job controls, pipeline stages, screening, notes, and messages.

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs
  ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('draft', 'flagged', 'published', 'rejected', 'expired', 'paused', 'closed'));

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
UPDATE applications SET status = 'new' WHERE status = 'submitted';
UPDATE applications SET status = 'reviewed' WHERE status = 'viewed';
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('new', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'));

ALTER TABLE applications ADD COLUMN IF NOT EXISTS rating SMALLINT;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_rating_check;
ALTER TABLE applications
  ADD CONSTRAINT applications_rating_check
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_location VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_text TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS knockout BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(120);

CREATE TABLE IF NOT EXISTS screening_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  answer_type VARCHAR(20) NOT NULL CHECK (answer_type IN ('yes_no', 'number', 'text')),
  required BOOLEAN NOT NULL DEFAULT TRUE,
  knockout BOOLEAN NOT NULL DEFAULT FALSE,
  expected_yes BOOLEAN,
  min_number INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_questions_job ON screening_questions (job_id, position);

CREATE TABLE IF NOT EXISTS screening_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES screening_questions(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  knocked_out BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_answers_application ON screening_answers (application_id);

CREATE TABLE IF NOT EXISTS application_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  author_email VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_notes_application ON application_notes (application_id, created_at);

CREATE TABLE IF NOT EXISTS application_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  kind VARCHAR(40) NOT NULL,
  detail TEXT,
  actor_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_events_application ON application_events (application_id, created_at);

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_company ON message_templates (company_id);

CREATE TABLE IF NOT EXISTS candidate_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_messages_application ON candidate_messages (application_id, created_at);
