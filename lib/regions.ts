/**
 * Launch regions for jobbrowser.app.
 * URL slugs stay short (/ae). The database stores the names locked in the schema.
 */

export const REGION_LIST = [
  {
    slug: 'ae',
    name: 'United Arab Emirates',
    db: 'UAE',
    country: 'AE',
    currency: 'AED',
    location: 'Dubai',
    accent: 'from-amber-500 to-orange-600',
    adzunaCountry: null,
    careerjetLocale: 'en_AE',
  },
  {
    slug: 'sa',
    name: 'Saudi Arabia',
    db: 'Saudi',
    country: 'SA',
    currency: 'SAR',
    location: 'Riyadh',
    accent: 'from-emerald-600 to-green-700',
    adzunaCountry: null,
    careerjetLocale: 'en_SA',
  },
  {
    slug: 'in',
    name: 'India',
    db: 'India',
    country: 'IN',
    currency: 'INR',
    location: 'Bengaluru',
    accent: 'from-orange-500 to-rose-600',
    adzunaCountry: 'in',
    careerjetLocale: 'en_IN',
  },
  {
    slug: 'au',
    name: 'Australia',
    db: 'Australia',
    country: 'AU',
    currency: 'AUD',
    location: 'Sydney',
    accent: 'from-green-600 to-yellow-500',
    adzunaCountry: 'au',
    careerjetLocale: 'en_AU',
  },
  {
    slug: 'us',
    name: 'United States',
    db: 'USA',
    country: 'US',
    currency: 'USD',
    location: 'New York',
    accent: 'from-sky-600 to-blue-800',
    adzunaCountry: 'us',
    careerjetLocale: 'en_US',
  },
] as const;

export type RegionInfo = (typeof REGION_LIST)[number];
export type RegionSlug = RegionInfo['slug'];
export type DbRegion = RegionInfo['db'] | 'Remote';

const ALIASES: Record<string, RegionSlug> = {
  ae: 'ae',
  uae: 'ae',
  'united arab emirates': 'ae',
  sa: 'sa',
  saudi: 'sa',
  'saudi arabia': 'sa',
  ksa: 'sa',
  in: 'in',
  india: 'in',
  au: 'au',
  australia: 'au',
  us: 'us',
  usa: 'us',
  'united states': 'us',
  'united states of america': 'us',
};

export function regionFromParam(value: string | null | undefined): RegionInfo | null {
  if (!value) return null;
  const slug = ALIASES[value.trim().toLowerCase()];
  if (!slug) return null;
  return REGION_LIST.find((region) => region.slug === slug) || null;
}

export function regionByDb(value: string | null | undefined): RegionInfo | null {
  if (!value) return null;
  return REGION_LIST.find((region) => region.db === value) || regionFromParam(value);
}

export function regionBySlug(slug: string): RegionInfo | null {
  return REGION_LIST.find((region) => region.slug === slug) || null;
}
