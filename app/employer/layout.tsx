import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { readEmployerSession } from '@/lib/access';
import { isPublicEmployerPath } from '@/lib/employer/paths';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EmployerLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get('x-pathname') || '';
  const session = await readEmployerSession();
  if (!isPublicEmployerPath(pathname) && !session) {
    redirect('/employer/login');
  }
  return (
    <div>
      {session ? (
        <nav aria-label="Employer" className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap gap-4 text-sm">
          <Link href="/employer/jobs" className="text-gray-900 font-medium">Jobs</Link>
          <Link href="/employer/company" className="text-gray-900 font-medium">Company</Link>
          <Link href="/employer/candidates" className="text-gray-900 font-medium">Candidates</Link>
          <Link href="/employer/analytics" className="text-gray-900 font-medium">Analytics</Link>
          <Link href="/employer/team" className="text-gray-900 font-medium">Team</Link>
          <Link href="/employer/templates" className="text-gray-900 font-medium">Email templates</Link>
          <Link href="/employer/post-job" className="text-gray-900 font-medium">Post a job free</Link>
          <span className="text-gray-700">{session.companyName}</span>
        </nav>
      ) : null}
      {children}
    </div>
  );
}
