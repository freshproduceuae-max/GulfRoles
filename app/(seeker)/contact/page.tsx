import type { Metadata } from 'next';
import { PageSection, StaticPage } from '@/components/content/StaticPage';
import ContactForm from '@/components/content/ContactForm';
import { contactEmail } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact | JobBrowser',
  description: 'Contact the operator of JobBrowser.',
};

export default function ContactPage() {
  const email = contactEmail();
  return (
    <StaticPage title="Contact" lede="Questions about a listing, your data, or a job you posted.">
      <PageSection heading="Email">
        <p>
          Write to <a className="underline" href={`mailto:${email}`}>{email}</a>. If outbound email is configured, the form below delivers to the same address. Messages are not added to a marketing list.
        </p>
      </PageSection>
      <ContactForm contact={email} />
    </StaticPage>
  );
}
