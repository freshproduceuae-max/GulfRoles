import type { Metadata } from 'next';
import { OperatorNotice, PageSection, StaticPage, InPageLink } from '@/components/content/StaticPage';

export const metadata: Metadata = {
  title: 'Terms of Service | JobBrowser',
  description: 'Terms for using JobBrowser to search jobs, apply, and post a listing.',
};

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of service"
      lede="By using JobBrowser you agree to these terms. If you do not agree, do not use the site."
    >
      <OperatorNotice />
      <PageSection heading="What JobBrowser is">
        <p>
          JobBrowser is a listing site. It is not the employer, and it does not decide who is hired. A listing can come from an employer who posted it here, or from Careerjet, Jooble, or Adzuna. Partner listings can expire or change on the partner site without notice.
        </p>
      </PageSection>
      <PageSection heading="Applying">
        <p>
          For a partner listing, the apply button leaves JobBrowser. The page says which partner you are going to, and that JobBrowser may be paid for the referral. For an employer listing, you send your application to that employer through this site. You are responsible for what you submit.
        </p>
      </PageSection>
      <PageSection heading="Posting a job">
        <p>
          Employer posts are free in this version. You must confirm your email, describe a real opening, and review applicants yourself. We may hold a post for review if it matches spam rules, and we may remove a post that is fraudulent, discriminatory, or not a job. Paid featured placement is not offered yet. The site can mark a listing as featured later. That does not create a billing relationship.
        </p>
      </PageSection>
      <PageSection heading="Accounts and alerts">
        <p>
          Job seekers do not need an account. A weekly alert is an email subscription, not a user profile. You can unsubscribe at any time. Do not subscribe someone else.
        </p>
      </PageSection>
      <PageSection heading="Acceptable use">
        <p>
          Do not post fake jobs, scrape the site in a way that degrades it, attempt to break into an account, or upload malware in a resume. We do not sell applicant data. You may not collect CVs from this site for resale.
        </p>
      </PageSection>
      <PageSection heading="Liability">
        <p>
          Listings are provided as received from employers and partners. We do not promise that a job is still open, that a salary is accurate, or that an application will be read. The site is provided as available. To the extent the law allows, the operator is not liable for hiring decisions or for partner sites.
        </p>
        <p>
          The <InPageLink href="/privacy">privacy policy</InPageLink> explains what we store. Legal questions use the <InPageLink href="/contact?topic=legal-privacy">contact form</InPageLink>.
        </p>
      </PageSection>
    </StaticPage>
  );
}
