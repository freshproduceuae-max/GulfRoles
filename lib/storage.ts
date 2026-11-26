/**
 * Resume files go through the storage adapter in lib/storage/resume-store.ts.
 * The default store is Postgres. Set RESUME_STORE=r2 for Cloudflare R2, or blob for the old Vercel Blob store.
 * Local disk uploads were removed: a public uploads folder would expose CVs,
 * and Vercel does not keep files written during a request.
 */

export { MAX_RESUME_BYTES, validateResume } from './storage/validate-resume';
export type { ValidResume } from './storage/validate-resume';
export {
  createBlobResumeStorage,
  createNeonResumeStorage,
  createR2ResumeStorage,
  resumeStorageFromEnv,
} from './storage/resume-store';
export type { ResumeFile, ResumePointer, ResumeStorage, ResumeStoreName } from './storage/resume-store';
