import type { Metadata } from 'next';
import { PageSection, StaticPage, InPageLink } from '@/components/content/StaticPage';

export const metadata: Metadata = {
  title: 'Help | JobBrowser',
  description: 'How to search, apply, set an alert, and post a job on JobBrowser.',
};

export default function HelpPage() {
  return (
    <StaticPage title="Help" lede="Short answers for the things the site can do today.">
      <PageSection heading="Search">
        <p>
          Use the search box for a title and a city. Open a country page (<InPageLink href="/ae">UAE</InPageLink>, <InPageLink href="/sa">Saudi Arabia</InPageLink>, <InPageLink href="/in">India</InPageLink>, <InPageLink href="/au">Australia</InPageLink>, <InPageLink href="/us">United States</InPageLink>) to start inside that region.
        </p>
      </PageSection>
      <PageSection heading="Apply">
        <p>
          Employer posts open an application form on JobBrowser. Partner posts send you to Careerjet, Jooble, or Adzuna after a short notice. If a partner link is missing, the feed for that partner is not connected yet.
        </p>
      </PageSection>
      <PageSection heading="Alerts">
        <p>Add your email on the homepage. You get at most one digest a week. Use the unsubscribe link in the email to stop it.</p>
      </PageSection>
      <PageSection heading="Post a job">
        <p>
          Choose Post a Job, enter your work email, and open the link we send. The post is free. Spam-like wording is held for review instead of going live.
        </p>
      </PageSection>
    </StaticPage>
  );
}
