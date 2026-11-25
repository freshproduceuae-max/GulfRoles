/** True only when the owner has explicitly opened the site to crawlers. */
export function isSitePublic(): boolean {
  return process.env.SITE_PUBLIC === 'true';
}

export interface RobotsPolicy {
  sitePublic: boolean;
  disallow: string[];
  allow?: string;
  sitemap: string;
}

export function robotsPolicy(baseUrl: string, sitePublic = isSitePublic()): RobotsPolicy {
  const sitemap = `${baseUrl.replace(/\/$/, '')}/sitemap.xml`;
  if (!sitePublic) {
    return { sitePublic: false, disallow: ['/'], sitemap };
  }
  return {
    sitePublic: true,
    allow: '/',
    disallow: ['/admin', '/api', '/_next', '/uploads'],
    sitemap,
  };
}

export function appBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    'https://jobbrowser.app';
  return raw.replace(/\/$/, '');
}

export function contactEmail(): string {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.CONTACT_EMAIL ||
    'contact@jobbrowser.app'
  );
}
