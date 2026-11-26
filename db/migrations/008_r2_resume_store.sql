-- Allow CVs to live in Cloudflare R2 as well as Postgres or Vercel Blob.

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_resume_store_check;
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_store_check
  CHECK (resume_store IN ('neon', 'blob', 'r2'));
