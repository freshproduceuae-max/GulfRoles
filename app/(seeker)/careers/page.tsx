import type { Metadata } from 'next';
import { PageSection, StaticPage } from '@/components/content/StaticPage';
import { contactEmail } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Careers | JobBrowser',
  description: 'JobBrowser is a small operation and is not hiring through this page.',
};

export default function CareersPage() {
  return (
    <StaticPage title="Careers" lede="There is no hiring page pretending to be a jobs board.">
      <PageSection heading="Open roles">
        <p>
          JobBrowser does not have open roles listed here. If that changes, they will be ordinary listings on the site, not a separate funnel. You can still write to {contactEmail()}.
        </p>
      </PageSection>
    </StaticPage>
  );
}
