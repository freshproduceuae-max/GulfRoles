import type { Metadata } from 'next';
import { PageSection, StaticPage } from '@/components/content/StaticPage';

export const metadata: Metadata = {
  title: 'Cookies | JobBrowser',
  description: 'Cookies used by JobBrowser.',
};

export default function CookiesPage() {
  return (
    <StaticPage title="Cookies" lede="JobBrowser uses a few cookies to run sign-in. It does not use them to resell your data.">
      <PageSection heading="Required cookies">
        <p>
          Employer sign-in sets `employer_session` so you can post a job and open applicants. Admin sign-in sets a session cookie for the moderation queue. Both are limited to this site.
        </p>
      </PageSection>
      <PageSection heading="What we do not set">
        <p>
          Job seekers are not given an account cookie. Saved jobs use local storage in your browser. Advertising cookies are not set unless an ad publisher id is added later. If that happens, the ad network’s own policy applies to those cookies, and this page will name the network.
        </p>
      </PageSection>
    </StaticPage>
  );
}
