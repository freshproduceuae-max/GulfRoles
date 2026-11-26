import { createHash } from 'crypto';

export const CONTACT_TOPICS = [
  { id: 'employer', label: 'Employer' },
  { id: 'job-seeker', label: 'Job seeker' },
  { id: 'partnership', label: 'Partnership' },
  { id: 'report-a-job', label: 'Report a job' },
  { id: 'legal-privacy', label: 'Legal or privacy request' },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['id'];

const TOPIC_IDS = new Set<string>(CONTACT_TOPICS.map((topic) => topic.id));

export interface ContactInput {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
  website?: unknown;
}

export type ContactValidation =
  | { ok: true; honeypot: true }
  | {
      ok: true;
      honeypot: false;
      value: { name: string; email: string; topic: ContactTopic; message: string };
    }
  | { ok: false; error: string };

export function isContactTopic(value: string): value is ContactTopic {
  return TOPIC_IDS.has(value);
}

export function validateContactSubmission(input: ContactInput): ContactValidation {
  if (typeof input.website === 'string' && input.website.trim()) {
    return { ok: true, honeypot: true };
  }
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 200) : '';
  const email = typeof input.email === 'string' ? input.email.trim().slice(0, 320) : '';
  const topic = typeof input.topic === 'string' ? input.topic.trim() : '';
  const message = typeof input.message === 'string' ? input.message.trim().slice(0, 5000) : '';
  if (!name) return { ok: false, error: 'Name is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'A valid email is required.' };
  if (!isContactTopic(topic)) return { ok: false, error: 'Choose a topic.' };
  if (message.length < 10) return { ok: false, error: 'Message must be at least 10 characters.' };
  return { ok: true, honeypot: false, value: { name, email, topic, message } };
}

export function hashClientAddress(ip: string): string {
  const salt = process.env.NEXTAUTH_SECRET || 'jobbrowser-contact';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export function clientAddress(headers: Headers): string {
  const forwarded = headers.get('cf-connecting-ip') || headers.get('x-forwarded-for') || '';
  return forwarded.split(',')[0]?.trim() || 'unknown';
}

export const CONTACT_RATE_LIMIT = 5;
