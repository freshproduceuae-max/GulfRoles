import type { Metadata } from 'next';
import { PageSection, StaticPage } from '@/components/content/StaticPage';

export const metadata: Metadata = {
  title: 'Salary notes | JobBrowser',
  description: 'How JobBrowser shows salary figures.',
};

export default function SalaryGuidePage() {
  return (
    <StaticPage
      title="Salary notes"
      lede="JobBrowser does not publish its own salary survey. A figure appears only when the listing included one."
    >
      <PageSection heading="What you will see">
        <p>
          If Careerjet, Jooble, Adzuna, or an employer provides a range, the job page shows that range and its currency. If they do not, the page says the salary was not specified. We do not fill the gap with an estimate presented as fact.
        </p>
      </PageSection>
      <PageSection heading="Sorting">
        <p>
          Search can sort by a rough US-dollar equivalent so roles in different currencies can be compared. Those conversions are approximate and are not an offer.
        </p>
      </PageSection>
    </StaticPage>
  );
}
