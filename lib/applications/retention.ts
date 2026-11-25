import { query } from '@/lib/db';
import { createBlobResumeStorage, createNeonResumeStorage, type ResumeStorage } from '@/lib/storage/resume-store';

export const RESUME_RETENTION = '12 months';

interface ExpiredResume {
  id: string;
  resume_store: string | null;
  resume_key: string | null;
}

/**
 * Delete applications, including the CV, 12 months after they were submitted.
 * A blob that cannot be deleted is left in place so the next run can retry.
 */
export async function purgeExpiredApplications(now = new Date()): Promise<{ deleted: number }> {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 12);

  const expired = await query<ExpiredResume>(
    `SELECT id, resume_store, resume_key
     FROM applications
     WHERE created_at < $1`,
    [cutoff]
  );

  const deletedIds: string[] = [];
  for (const row of expired.rows) {
    try {
      if (row.resume_store === 'blob' && row.resume_key) {
        const storage = storageFor('blob');
        await storage.delete({ store: 'blob', key: row.resume_key });
      }
      deletedIds.push(row.id);
    } catch (error) {
      console.error(
        'CV retention could not delete a file',
        row.id,
        error instanceof Error ? error.message : error
      );
    }
  }

  if (deletedIds.length > 0) {
    await query('DELETE FROM applications WHERE id = ANY($1::uuid[])', [deletedIds]);
  }

  return { deleted: deletedIds.length };
}

function storageFor(store: string): ResumeStorage {
  if (store === 'blob') {
    return createBlobResumeStorage(process.env.BLOB_READ_WRITE_TOKEN || '');
  }
  return createNeonResumeStorage();
}
