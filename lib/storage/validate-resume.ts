import path from 'path';

export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

const PDF_MAGIC = Buffer.from('%PDF-');
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

export interface ValidResume {
  filename: string;
  contentType: string;
  extension: '.pdf' | '.docx';
}

/**
 * Accept a CV only when the extension and the file bytes agree.
 * PDF files with active content, and Word files with macros, are rejected.
 * This is not a full antivirus product. It stops the common ways a resume
 * is used to smuggle a program, and the file is only ever downloaded, never executed.
 */
export function validateResume(file: Buffer, originalFilename: string): ValidResume {
  if (!file || file.length === 0) {
    throw new Error('The CV file is empty');
  }
  if (file.length > MAX_RESUME_BYTES) {
    throw new Error('CV must be 4MB or smaller');
  }

  const ext = path.extname(originalFilename).toLowerCase();
  if (ext !== '.pdf' && ext !== '.docx') {
    throw new Error('Only PDF and DOCX files are allowed');
  }

  if (ext === '.pdf') {
    assertPdf(file);
    return {
      filename: safeFilename(originalFilename, '.pdf'),
      contentType: 'application/pdf',
      extension: '.pdf',
    };
  }

  assertDocx(file);
  return {
    filename: safeFilename(originalFilename, '.docx'),
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
  };
}

function safeFilename(originalFilename: string, extension: '.pdf' | '.docx'): string {
  const base = path.basename(originalFilename, path.extname(originalFilename));
  const cleaned = base.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 80);
  return `${cleaned || 'cv'}${extension}`;
}

function assertPdf(file: Buffer): void {
  const start = file.subarray(0, 1024);
  const marker = start.indexOf(PDF_MAGIC);
  if (marker < 0 || marker > 8) {
    throw new Error('This PDF is not a valid PDF file');
  }
  if (file.subarray(0, 2).equals(Buffer.from('MZ')) || file.subarray(0, 4).equals(ZIP_MAGIC)) {
    throw new Error('This PDF is not a valid PDF file');
  }
  const text = file.toString('latin1');
  if (/\/JavaScript|\/JS[\s(/]|\/Launch|\/EmbeddedFile|\/RichMedia|\/OpenAction/.test(text)) {
    throw new Error('This PDF contains active content and cannot be uploaded');
  }
}

function assertDocx(file: Buffer): void {
  if (!file.subarray(0, 4).equals(ZIP_MAGIC)) {
    throw new Error('This DOCX is not a valid Word file');
  }
  const text = file.toString('latin1');
  if (!text.includes('word/document.xml')) {
    throw new Error('This DOCX is not a valid Word file');
  }
  if (text.includes('vbaProject.bin') || text.includes('word/vbaData.xml')) {
    throw new Error('Word files with macros cannot be uploaded');
  }
}
