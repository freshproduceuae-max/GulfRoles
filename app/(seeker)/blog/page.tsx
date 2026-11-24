import type { Metadata } from 'next';
import { PageSection, StaticPage } from '@/components/content/StaticPage';

export const metadata: Metadata = {
  title: 'Blog | JobBrowser',
  description: 'JobBrowser does not publish placeholder articles.',
};

export default function BlogPage() {
  return (
    <StaticPage title="Notes" lede="There are no articles yet.">
      <PageSection heading="Why this page is empty">
        <p>
          A blog full of generated career advice would not help anyone find a job. When there is something worth publishing, it will show up here. The useful pages today are the job listings.
        </p>
      </PageSection>
    </StaticPage>
  );
}
