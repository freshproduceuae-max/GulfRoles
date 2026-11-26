import { query as defaultQuery, queryOne as defaultQueryOne } from '@/lib/db';

export type ResumeStoreName = 'neon' | 'blob' | 'r2';

export interface ResumePointer {
  store: ResumeStoreName;
  key: string;
}

export interface ResumePut {
  applicationId: string;
  bytes: Buffer;
  filename: string;
  contentType: string;
}

export interface ResumeFile {
  bytes: Buffer;
  filename: string;
  contentType: string;
}

export interface ResumeStorage {
  readonly name: ResumeStoreName;
  put(input: ResumePut): Promise<ResumePointer>;
  get(pointer: ResumePointer): Promise<ResumeFile | null>;
  delete(pointer: ResumePointer): Promise<void>;
}

interface ResumeQuery {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
  queryOne(text: string, values?: unknown[]): Promise<Record<string, unknown> | null>;
}

interface BlobPutResult {
  url: string;
}

interface BlobGetResult {
  statusCode: number;
  stream: ReadableStream<Uint8Array> | null;
}

export interface BlobResumeApi {
  put(
    pathname: string,
    body: Buffer,
    options: { access: 'private'; token: string; contentType: string; addRandomSuffix: boolean }
  ): Promise<BlobPutResult>;
  get(url: string, options: { access: 'private'; token: string }): Promise<BlobGetResult | null>;
  del(url: string, options: { token: string }): Promise<void>;
}

const defaultDb: ResumeQuery = {
  query: (text, values) => defaultQuery(text, values as never),
  queryOne: (text, values) => defaultQueryOne(text, values as never),
};

/**
 * Default store. The CV bytes sit in Postgres, which is already on the Vercel
 * project and can move with the database to Cloudflare or anywhere else.
 */
export function createNeonResumeStorage(db: ResumeQuery = defaultDb): ResumeStorage {
  return {
    name: 'neon',
    async put(input) {
      const resumeUrl = `/api/applications/${input.applicationId}/resume`;
      await db.query(
        `UPDATE applications
         SET resume_bytes = $1,
             resume_content_type = $2,
             resume_filename = $3,
             resume_store = 'neon',
             resume_key = $4,
             resume_url = $5,
             updated_at = NOW()
         WHERE id = $4`,
        [input.bytes, input.contentType, input.filename, input.applicationId, resumeUrl]
      );
      return { store: 'neon', key: input.applicationId };
    },
    async get(pointer) {
      if (pointer.store !== 'neon') return null;
      const row = await db.queryOne(
        `SELECT resume_bytes, resume_filename, resume_content_type
         FROM applications
         WHERE id = $1 AND (resume_store IS NULL OR resume_store = 'neon')`,
        [pointer.key]
      );
      const raw = row?.resume_bytes;
      if (!raw) return null;
      const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(raw as Uint8Array);
      return {
        bytes,
        filename: String(row.resume_filename || 'cv.pdf'),
        contentType: String(row.resume_content_type || 'application/octet-stream'),
      };
    },
    async delete(pointer) {
      if (pointer.store !== 'neon') return;
      await db.query(
        `UPDATE applications
         SET resume_bytes = NULL, resume_key = NULL, updated_at = NOW()
         WHERE id = $1`,
        [pointer.key]
      );
    },
  };
}

/**
 * Optional private Vercel Blob store. Selected only when RESUME_STORE=blob.
 * Files stay private and are proxied through the authenticated download route,
 * so a later move off Vercel is a new adapter, not a change to the pages.
 */
export function createBlobResumeStorage(
  token: string,
  api?: BlobResumeApi,
  db: ResumeQuery = defaultDb
): ResumeStorage {
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required when RESUME_STORE=blob');
  }

  async function client(): Promise<BlobResumeApi> {
    if (api) return api;
    const mod = (await import('@vercel/blob')) as unknown as BlobResumeApi;
    return mod;
  }

  return {
    name: 'blob',
    async put(input) {
      const blob = await client();
      const pathname = `resumes/${input.applicationId}/${input.filename}`;
      const saved = await blob.put(pathname, input.bytes, {
        access: 'private',
        token,
        contentType: input.contentType,
        addRandomSuffix: false,
      });
      await db.query(
        `UPDATE applications
         SET resume_bytes = NULL,
             resume_content_type = $2,
             resume_filename = $3,
             resume_store = 'blob',
             resume_key = $4,
             resume_url = $5,
             updated_at = NOW()
         WHERE id = $1`,
        [
          input.applicationId,
          input.contentType,
          input.filename,
          saved.url,
          `/api/applications/${input.applicationId}/resume`,
        ]
      );
      return { store: 'blob', key: saved.url };
    },
    async get(pointer) {
      if (pointer.store !== 'blob' || !pointer.key) return null;
      const blob = await client();
      const result = await blob.get(pointer.key, { access: 'private', token });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      const bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
      const row = await db.queryOne(
        `SELECT resume_filename, resume_content_type FROM applications WHERE resume_key = $1`,
        [pointer.key]
      );
      return {
        bytes,
        filename: String(row?.resume_filename || 'cv.pdf'),
        contentType: String(row?.resume_content_type || 'application/octet-stream'),
      };
    },
    async delete(pointer) {
      if (pointer.store !== 'blob' || !pointer.key) return;
      const blob = await client();
      await blob.del(pointer.key, { token });
    },
  };
}

export function resumeStorageFromEnv(env?: {
  RESUME_STORE?: string;
  BLOB_READ_WRITE_TOKEN?: string;
}): ResumeStorage {
  const store = env ? env.RESUME_STORE : process.env.RESUME_STORE;
  const token = env ? env.BLOB_READ_WRITE_TOKEN : process.env.BLOB_READ_WRITE_TOKEN;
  if (store === 'r2') {
    return createR2ResumeStorage();
  }
  if (store === 'blob') {
    return createBlobResumeStorage(token || '');
  }
  return createNeonResumeStorage();
}

export interface R2ObjectBody {
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface R2BucketLike {
  put(key: string, value: Buffer | Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

export function createR2ResumeStorage(bucket?: R2BucketLike, db: ResumeQuery = defaultDb): ResumeStorage {
  async function store(): Promise<R2BucketLike> {
    if (bucket) return bucket;
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const context = await getCloudflareContext({ async: true });
    const bound = (context.env as { RESUMES?: R2BucketLike }).RESUMES;
    if (!bound) throw new Error('R2 binding RESUMES is not configured');
    return bound;
  }

  return {
    name: 'r2',
    async put(input) {
      const key = `resumes/${input.applicationId}/${input.filename}`;
      await (await store()).put(key, input.bytes, { httpMetadata: { contentType: input.contentType } });
      await db.query(
        `UPDATE applications
         SET resume_bytes = NULL,
             resume_content_type = $2,
             resume_filename = $3,
             resume_store = 'r2',
             resume_key = $4,
             resume_url = $5,
             updated_at = NOW()
         WHERE id = $1`,
        [
          input.applicationId,
          input.contentType,
          input.filename,
          key,
          `/api/applications/${input.applicationId}/resume`,
        ]
      );
      return { store: 'r2', key };
    },
    async get(pointer) {
      if (pointer.store !== 'r2' || !pointer.key) return null;
      const object = await (await store()).get(pointer.key);
      if (!object) return null;
      const bytes = Buffer.from(await object.arrayBuffer());
      const row = await db.queryOne(
        `SELECT resume_filename, resume_content_type FROM applications WHERE resume_key = $1`,
        [pointer.key]
      );
      return {
        bytes,
        filename: String(row?.resume_filename || 'cv.pdf'),
        contentType: String(row?.resume_content_type || 'application/octet-stream'),
      };
    },
    async delete(pointer) {
      if (pointer.store !== 'r2' || !pointer.key) return;
      await (await store()).delete(pointer.key);
    },
  };
}
