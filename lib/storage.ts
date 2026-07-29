/**
 * Storage utilities for handling file uploads
 * Currently uses local storage approach, can be adapted for Supabase Storage
 */

import fs from 'fs/promises';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create storage directory:', error);
    throw error;
  }
}

/**
 * Generate a unique filename for uploaded resume
 */
function generateFilename(originalFilename: string, jobId: string): string {
  const timestamp = Date.now();
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext).replace(/[^a-z0-9]/gi, '_');
  return `${jobId}_${name}_${timestamp}${ext}`;
}

/**
 * Upload a resume file
 * @param file - File buffer or base64 string
 * @param originalFilename - Original filename
 * @param jobId - Job ID (for organizing uploads)
 * @returns Object with filename and public URL
 */
export async function uploadResume(
  file: Buffer | string,
  originalFilename: string,
  jobId: string
): Promise<{ filename: string; url: string }> {
  try {
    await ensureStorageDir();

    // Validate file size (max 5MB)
    const buffer = typeof file === 'string' ? Buffer.from(file, 'base64') : file;
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Validate file type
    const ext = path.extname(originalFilename).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    if (!allowedExtensions.includes(ext)) {
      throw new Error('Only PDF, DOC, DOCX, and TXT files are allowed');
    }

    const filename = generateFilename(originalFilename, jobId);
    const filepath = path.join(STORAGE_DIR, filename);

    // Write file to storage
    await fs.writeFile(filepath, buffer);

    // Generate public URL
    const url = `/uploads/resumes/${filename}`;

    return { filename, url };
  } catch (error) {
    console.error('Resume upload failed:', error);
    throw error;
  }
}

/**
 * Get a signed URL for downloading a resume
 * @param filename - Filename to generate URL for
 * @returns Public URL for downloading the file
 */
export function getResumeUrl(filename: string): string {
  return `/uploads/resumes/${filename}`;
}

/**
 * Delete a resume file
 * @param filename - Filename to delete
 */
export async function deleteResume(filename: string): Promise<void> {
  try {
    const filepath = path.join(STORAGE_DIR, filename);
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Failed to delete resume:', error);
    // Don't throw - file might already be deleted
  }
}

/**
 * Check if a file exists
 * @param filename - Filename to check
 */
export async function fileExists(filename: string): Promise<boolean> {
  try {
    const filepath = path.join(STORAGE_DIR, filename);
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}
