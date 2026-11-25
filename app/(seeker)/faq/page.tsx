import type { Metadata } from 'next';
import { PageSection, StaticPage } from '@/components/content/StaticPage';

export const metadata: Metadata = {
  title: 'FAQ | JobBrowser',
  description: 'Common questions about JobBrowser listings, alerts, and applications.',
};

export default function FaqPage() {
  return (
    <StaticPage title="FAQ" lede="The questions that come up before someone trusts a job site.">
      <PageSection heading="Are these real jobs?">
        <p>
          Employer posts are submitted by the company. Partner posts are copied from Careerjet, Jooble, or Adzuna, which publish third-party listings. A listing can close before you apply. We drop partner jobs that disappear from the feed.
        </p>
      </PageSection>
      <PageSection heading="Do I need an account?">
        <p>No. Alerts use your email. Saved jobs stay in this browser. Employers use an email link, not a password.</p>
      </PageSection>
      <PageSection heading="Do you sell my CV?">
        <p>No. A resume sent through JobBrowser is for that employer. We do not sell it.</p>
      </PageSection>
      <PageSection heading="Why would a job send me to another site?">
        <p>
          That listing belongs to a partner. The job page names the partner and says JobBrowser may earn a commission. The partner does not receive your JobBrowser email from us.
        </p>
      </PageSection>
      <PageSection heading="Can I pay to feature a job?">
        <p>Not yet. Posts are free. Featured placement is reserved for a later paid option and is not billed here.</p>
      </PageSection>
    </StaticPage>
  );
}
