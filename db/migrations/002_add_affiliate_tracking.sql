-- Affiliate tracking table for UTM parameter tracking
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  affiliate VARCHAR(50) NOT NULL CHECK (affiliate IN ('careerjet', 'jooble')),
  user_id VARCHAR(255),
  utm_source VARCHAR(255) NOT NULL DEFAULT 'jobbrowser',
  utm_medium VARCHAR(255) NOT NULL DEFAULT 'apply',
  utm_campaign VARCHAR(255) NOT NULL DEFAULT 'm1',
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),
  referrer_url VARCHAR(2048),
  user_agent VARCHAR(2048),
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_job_id ON affiliate_clicks(job_id);
CREATE INDEX idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate);
CREATE INDEX idx_affiliate_clicks_created_at ON affiliate_clicks(created_at DESC);
CREATE INDEX idx_affiliate_clicks_user_id ON affiliate_clicks(user_id);
CREATE INDEX idx_affiliate_clicks_utm_campaign ON affiliate_clicks(utm_campaign);
