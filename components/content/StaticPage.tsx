import Link from 'next/link';

export function OperatorNotice() {
  return (
    <p>
      JobBrowser at jobbrowser.app is an independent job aggregator, operated as a sole proprietorship.
      Privacy and legal requests go through the <Link className="underline" href="/contact?topic=legal-privacy">contact form</Link>.
    </p>
  );
}

export function StaticPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <article className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{lede}</p>
        <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>
      </div>
    </article>
  );
}

export function PageSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{heading}</h2>
      {children}
    </section>
  );
}

export function InPageLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="underline">
      {children}
    </Link>
  );
}
