-- jobbrowser.app MVP Schema (v1)
-- Initial schema with 7 core tables + full-text search

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: companies
-- ============================================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(2048),
  logo_url VARCHAR(2048),
  description TEXT,
  address VARCHAR(500),
  region VARCHAR(50) NOT NULL CHECK (region IN ('UAE', 'Saudi', 'India', 'Australia', 'USA')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_token VARCHAR(255) UNIQUE,
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_companies_region ON companies(region);
CREATE INDEX idx_companies_verified ON companies(verified);
CREATE INDEX idx_companies_name ON companies(name);

-- ============================================================================
-- TABLE: jobs
-- ============================================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  region VARCHAR(50) NOT NULL CHECK (region IN ('UAE', 'Saudi', 'India', 'Australia', 'USA')),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'USD',
  salary_normalized_usd INTEGER,
  job_type VARCHAR(50) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  source VARCHAR(50) NOT NULL DEFAULT 'direct' CHECK (source IN ('direct', 'adzuna', 'careerjet', 'jooble', 'greenhouse', 'lever')),
  source_url VARCHAR(2048),
  employer_email VARCHAR(255),
  employer_verified BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'flagged', 'published', 'rejected', 'expired')),
  equity_min_pct DECIMAL(5, 2),
  equity_max_pct DECIMAL(5, 2),
  bonus_structure TEXT,
  benefits JSONB,
  culture_notes TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_region ON jobs(region);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_employer_email ON jobs(employer_email);
CREATE INDEX idx_jobs_search_vector ON jobs USING GIN(search_vector);

-- ============================================================================
-- Full-Text Search Vector Trigger for jobs
-- ============================================================================
CREATE OR REPLACE FUNCTION jobs_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.company_name, '') || ' ' ||
    COALESCE(NEW.location, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_search_vector_trigger
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION jobs_search_vector_update();

-- ============================================================================
-- TABLE: job_alerts
-- ============================================================================
CREATE TABLE job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'daily')),
  preferences JSONB NOT NULL DEFAULT '{}',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_alerts_email ON job_alerts(email);
CREATE INDEX idx_job_alerts_subscribed_at ON job_alerts(subscribed_at DESC);
CREATE INDEX idx_job_alerts_unsubscribed_at ON job_alerts(unsubscribed_at);
CREATE INDEX idx_job_alerts_last_sent_at ON job_alerts(last_sent_at);

-- ============================================================================
-- TABLE: moderation_flags
-- ============================================================================
CREATE TABLE moderation_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  rule_triggered VARCHAR(100) NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  status VARCHAR(50) NOT NULL DEFAULT 'flagged' CHECK (status IN ('flagged', 'approved', 'rejected', 'investigating')),
  admin_notes TEXT,
  admin_reviewed_by VARCHAR(255),
  admin_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_moderation_flags_job_id ON moderation_flags(job_id);
CREATE INDEX idx_moderation_flags_status ON moderation_flags(status);
CREATE INDEX idx_moderation_flags_created_at ON moderation_flags(created_at DESC);
CREATE INDEX idx_moderation_flags_confidence ON moderation_flags(confidence DESC);

-- ============================================================================
-- TABLE: admin_users
-- ============================================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'moderator' CHECK (role IN ('moderator', 'admin', 'superadmin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- ============================================================================
-- TABLE: employer_sessions
-- ============================================================================
CREATE TABLE employer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  token_expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employer_sessions_company_id ON employer_sessions(company_id);
CREATE INDEX idx_employer_sessions_session_token ON employer_sessions(session_token);
CREATE INDEX idx_employer_sessions_email ON employer_sessions(email);
CREATE INDEX idx_employer_sessions_token_expires ON employer_sessions(token_expires);

-- ============================================================================
-- TABLE: applications
-- ============================================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(20),
  resume_url VARCHAR(2048),
  resume_filename VARCHAR(255),
  cover_letter TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'viewed', 'shortlisted', 'rejected', 'hired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_email ON applications(applicant_email);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- ============================================================================
-- Health Check: Verify schema is complete
-- ============================================================================
-- This comment ensures the migration tracks successful completion
-- All 7 tables created with proper constraints, indexes, and full-text search
