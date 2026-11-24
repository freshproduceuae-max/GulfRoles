import type { Metadata } from 'next';
import { OperatorNotice, PageSection, StaticPage, InPageLink } from '@/components/content/StaticPage';

export const metadata: Metadata = {
  title: 'About JobBrowser',
  description: 'JobBrowser is a job aggregator for the UAE, Saudi Arabia, India, Australia, and the United States.',
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About JobBrowser"
      lede="JobBrowser lists real jobs and sends you to a real way to apply. It is not a scrape-and-spam board."
    >
      <OperatorNotice />
      <PageSection heading="What this site does">
        <p>
          Seekers can search, save jobs in the browser, and subscribe to a weekly email. Employers can post a job for free after confirming their email. Listings also come from Careerjet, Jooble, and Adzuna when those publisher keys are connected.
        </p>
      </PageSection>
      <PageSection heading="Where it covers">
        <p>
          The launch regions are the <InPageLink href="/ae">UAE</InPageLink>, <InPageLink href="/sa">Saudi Arabia</InPageLink>, <InPageLink href="/in">India</InPageLink>, <InPageLink href="/au">Australia</InPageLink>, and the <InPageLink href="/us">United States</InPageLink>.
        </p>
      </PageSection>
      <PageSection heading="How it stays honest">
        <p>
          Partner jobs say so before you leave the site, and JobBrowser may earn a commission on those clicks. Employer posts stay on JobBrowser. CVs are not sold. There is no paid placement checkout yet. A featured flag exists for later, and it is not for sale on this version.
        </p>
      </PageSection>
    </StaticPage>
  );
}
