-- Remote listings are their own region. A multi-country Remotive location
-- was matching Saudi first, and some titles had the place glued on
-- ("Developerusa").

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_region_check;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_region_check;

ALTER TABLE jobs
  ADD CONSTRAINT jobs_region_check
  CHECK (region IN ('UAE', 'Saudi', 'India', 'Australia', 'USA', 'Remote'));

ALTER TABLE companies
  ADD CONSTRAINT companies_region_check
  CHECK (region IN ('UAE', 'Saudi', 'India', 'Australia', 'USA', 'Remote'));

UPDATE jobs
SET title = regexp_replace(title, '(usa|uae|uk|india|saudi|australia)$', '', 'i'),
    updated_at = NOW()
WHERE source IN ('remotive', 'remoteok')
  AND title ~* '[A-Za-z](usa|uae|uk|india|saudi|australia)$';

-- One launch country stays that country. Remote wording, or more than one
-- launch country in the location, is Remote.
UPDATE jobs
SET region = 'Remote',
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND source IN ('remotive', 'remoteok')
  AND (
    location ~* '\y(remote|worldwide|anywhere|wfh)\y'
    OR location ~* 'work from home'
    OR (
      (location ~* '\y(saudi|riyadh|jeddah|dammam|khobar)\y')::int
      + (location ~* '\y(india|bengaluru|bangalore|hyderabad|mumbai|delhi|chennai|pune|gurugram|gurgaon|noida)\y')::int
      + (location ~* '\y(australia|sydney|melbourne|brisbane|perth)\y')::int
      + ((location ~* '\y(usa|united states)\y') OR (location ~* '\y(new york|san francisco|seattle|austin|chicago|boston)\y'))::int
      + ((location ~* '\y(uae|dubai|sharjah|ajman)\y') OR (location ~* 'abu dhabi') OR (location ~* 'ras al khaimah'))::int
    ) > 1
  );

-- Keep the dedupe key aligned with lib/ingestion/normalize.ts so the next
-- ingest updates this row instead of inserting a second copy.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE jobs
SET dedupe_key = substring(
  encode(
    sha256(
      convert_to(
        trim(both from regexp_replace(lower(title), '[^a-z0-9]+', ' ', 'g')) || '|' ||
        trim(both from regexp_replace(lower(company_name), '[^a-z0-9]+', ' ', 'g')) || '|' ||
        trim(both from regexp_replace(lower(location), '[^a-z0-9]+', ' ', 'g')) || '|' ||
        trim(both from regexp_replace(lower(region), '[^a-z0-9]+', ' ', 'g')),
        'UTF8'
      )
    ),
    'hex'
  ),
  1,
  40
)
WHERE source IN ('remotive', 'remoteok')
  AND deleted_at IS NULL;
