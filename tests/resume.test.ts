import assert from 'node:assert/strict';
import test from 'node:test';
import { validateResume } from '../lib/storage/validate-resume';
import {
  createBlobResumeStorage,
  createNeonResumeStorage,
  resumeStorageFromEnv,
} from '../lib/storage/resume-store';
import { generateApplicationEmail, generateCandidateConfirmationEmail } from '../lib/email';

const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');

function docx(extra = ''): Buffer {
  return Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from('word/document.xml'),
    Buffer.from(extra),
  ]);
}

test('a plain PDF and DOCX pass the CV check', () => {
  assert.equal(validateResume(pdf, 'Jane CV.pdf').contentType, 'application/pdf');
  assert.equal(validateResume(docx(), 'jane.docx').extension, '.docx');
});

test('active PDFs, macros, and renamed programs are rejected', () => {
  assert.throws(() => validateResume(Buffer.from('%PDF-1.4\n/JavaScript (alert(1))'), 'cv.pdf'), /active content/);
  assert.throws(() => validateResume(docx('vbaProject.bin'), 'cv.docx'), /macros/);
  assert.throws(() => validateResume(Buffer.from('MZ program'), 'cv.pdf'), /not a valid PDF/);
  assert.throws(() => validateResume(pdf, 'cv.pdf.exe'), /PDF and DOCX/);
  assert.throws(() => validateResume(pdf, 'notes.txt'), /PDF and DOCX/);
  assert.throws(() => validateResume(Buffer.alloc(4 * 1024 * 1024 + 1, 0x25), 'cv.pdf'), /4MB/);
});

test('the default resume store is Postgres and blob requires a token', () => {
  assert.equal(resumeStorageFromEnv({}).name, 'neon');
  assert.throws(() => resumeStorageFromEnv({ RESUME_STORE: 'blob' }), /BLOB_READ_WRITE_TOKEN/);
  assert.equal(resumeStorageFromEnv({ RESUME_STORE: 'blob', BLOB_READ_WRITE_TOKEN: 'token' }).name, 'blob');
});

test('Postgres storage writes and reads the CV bytes for one application', async () => {
  const rows = new Map<string, { bytes: Buffer; filename: string; contentType: string }>();
  const storage = createNeonResumeStorage({
    async query(text, values) {
      const id = String(values?.[3] || values?.[0]);
      if (text.includes('UPDATE') && text.includes('resume_bytes = $1')) {
        rows.set(String(values?.[3]), {
          bytes: values?.[0] as Buffer,
          contentType: String(values?.[1]),
          filename: String(values?.[2]),
        });
      }
      if (text.includes('resume_bytes = NULL')) rows.delete(id);
      return { rows: [] };
    },
    async queryOne(_text, values) {
      const row = rows.get(String(values?.[0]));
      if (!row) return null;
      return {
        resume_bytes: row.bytes,
        resume_filename: row.filename,
        resume_content_type: row.contentType,
      };
    },
  });

  const saved = await storage.put({
    applicationId: 'app-1',
    bytes: pdf,
    filename: 'cv.pdf',
    contentType: 'application/pdf',
  });
  const loaded = await storage.get(saved);
  assert.equal(saved.store, 'neon');
  assert.equal(loaded?.bytes.toString(), pdf.toString());
  await storage.delete(saved);
  assert.equal(await storage.get(saved), null);
});

test('the blob adapter uploads privately and does not keep a public copy in Postgres', async () => {
  let storedBytes: Buffer | null = pdf;
  const updates: unknown[][] = [];
  const storage = createBlobResumeStorage(
    'token',
    {
      async put(pathname, body) {
        assert.equal(pathname, 'resumes/app-1/cv.pdf');
        assert.equal(body.toString(), pdf.toString());
        return { url: 'https://blob.example/private/cv.pdf' };
      },
      async get() {
        return {
          statusCode: 200,
          stream: new Response(new Uint8Array(storedBytes || new Uint8Array())).body,
        };
      },
      async del() {
        storedBytes = null;
      },
    },
    {
      async query(_text, values) {
        updates.push(values || []);
        return { rows: [] };
      },
      async queryOne() {
        return { resume_filename: 'cv.pdf', resume_content_type: 'application/pdf' };
      },
    }
  );

  const saved = await storage.put({
    applicationId: 'app-1',
    bytes: pdf,
    filename: 'cv.pdf',
    contentType: 'application/pdf',
  });
  assert.equal(saved.key, 'https://blob.example/private/cv.pdf');
  assert.equal(updates[0][0], 'app-1');
  assert.equal(updates[0][3], 'https://blob.example/private/cv.pdf');
  const loaded = await storage.get(saved);
  assert.equal(loaded?.bytes.toString(), pdf.toString());
});

test('application emails name the inbox and the candidate status page', () => {
  const employer = generateApplicationEmail({
    jobTitle: 'Nurse',
    companyName: 'Clinic',
    applicantName: 'Jane',
    applicantEmail: 'jane@example.com',
    coverLetter: '<script>',
    inboxUrl: 'https://jobbrowser.app/employer/inbox/1',
  });
  assert.match(employer.text, /employer\/inbox\/1/);
  assert.match(employer.html, /&lt;script&gt;/);
  const candidate = generateCandidateConfirmationEmail({
    applicantName: 'Jane',
    jobTitle: 'Nurse',
    companyName: 'Clinic',
    statusUrl: 'https://jobbrowser.app/application-status/abc',
  });
  assert.match(candidate.text, /12 months/);
  assert.match(candidate.text, /application-status\/abc/);
});
