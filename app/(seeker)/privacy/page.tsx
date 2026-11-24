import type { Metadata } from 'next';
import { OperatorNotice, PageSection, StaticPage, InPageLink } from '@/components/content/StaticPage';
import { contactEmail } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | JobBrowser',
  description: 'How JobBrowser uses email addresses, applications, and cookies. CVs are not sold.',
};

export default function PrivacyPage() {
  const email = contactEmail();
  return (
    <StaticPage
      title="Privacy policy"
      lede="This policy describes the data JobBrowser collects on jobbrowser.app. It is written for the launch version of the site."
    >
      <OperatorNotice />
      <PageSection heading="Job alerts">
        <p>
          If you subscribe, we store your email address, the keywords and location you gave us, and when the last digest was sent. That address is used to send the weekly digest and to process an unsubscribe. It is not sold, rented, or added to an advertising audience.
        </p>
      </PageSection>
      <PageSection heading="Applications and CVs">
        <p>
          When you apply to a job posted on JobBrowser, we store your name, email, optional phone number, cover note, and resume so that employer can read them. The file is kept in the database and is available only to that employer and to the site operator. JobBrowser does not sell CVs, resumes, or applicant lists. We do not build a resume database for recruiters in this version.
        </p>
        <p>
          Applications to Careerjet, Jooble, or Adzuna happen on those sites. We do not receive the CV you submit there. We record that a click left JobBrowser so we can count affiliate referrals.
        </p>
      </PageSection>
      <PageSection heading="Employer accounts">
        <p>
          Posting a job starts with an email link. We store the company name, contact email, and a session cookie so you can finish the post and open the applicant inbox. The cookie is necessary for that task.
        </p>
      </PageSection>
      <PageSection heading="Cookies and advertising">
        <p>
          The site uses a session cookie for employers and a sign-in cookie for the admin moderation queue. Saved jobs stay in your browser and are not sent to us. If advertising is turned on later, the ad network may set its own cookies. That is described on the <InPageLink href="/cookies">cookie page</InPageLink>. Advertising is off until a publisher id is configured.
        </p>
      </PageSection>
      <PageSection heading="Requests">
        <p>
          To unsubscribe, use the link in a digest. To ask for deletion of an alert, an application, or an employer post, email {email}. We will delete the records we hold, except where we must keep a copy for a legal claim or for security logs.
        </p>
      </PageSection>
    </StaticPage>
  );
}
