import type { Metadata } from 'next';
import { PageSection, StaticPage } from '@/components/content/StaticPage';
import ContactForm from '@/components/content/ContactForm';
import { isContactTopic, type ContactTopic } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contact | JobBrowser',
  description: 'Contact the operator of JobBrowser through the site form.',
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const initialTopic: ContactTopic = topic && isContactTopic(topic) ? topic : 'job-seeker';
  return (
    <StaticPage title="Contact" lede="Questions about a listing, your data, or a job you posted.">
      <PageSection heading="Send a message">
        <p>
          Use this form. We reply to the address you enter. Messages are not added to a marketing list.
        </p>
      </PageSection>
      <ContactForm initialTopic={initialTopic} />
    </StaticPage>
  );
}
