export const CONSENT_VERSION = '2026-11-25';

export const CONSENT_COPY =
  'I agree that employers on JobBrowser may search my headline, skills, location, experience, and CV text. My name, email, and phone stay hidden until I accept an invitation. I can withdraw or delete this profile at any time.';

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;

/** Remove emails and phone numbers before any employer sees profile text. */
export function redactContact(text: string): string {
  return text.replace(EMAIL, '[email hidden]').replace(PHONE, (match) => {
    const digits = match.replace(/\D/g, '');
    return digits.length >= 8 ? '[phone hidden]' : match;
  });
}

export interface PublicCandidate {
  id: string;
  headline: string;
  location: string | null;
  experience_years: number | null;
  skills: string | null;
  excerpt: string;
  contact_visible: boolean;
  full_name?: string;
  email?: string;
  phone?: string | null;
}

export function toPublicCandidate(
  row: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    headline: string;
    location: string | null;
    experience_years: number | null;
    skills: string | null;
    resume_text: string | null;
  },
  contactVisible: boolean
): PublicCandidate {
  const base: PublicCandidate = {
    id: row.id,
    headline: row.headline,
    location: row.location,
    experience_years: row.experience_years,
    skills: redactContact(row.skills || ''),
    excerpt: redactContact((row.resume_text || '').slice(0, 280)),
    contact_visible: contactVisible,
  };
  if (!contactVisible) return base;
  return { ...base, full_name: row.full_name, email: row.email, phone: row.phone };
}
