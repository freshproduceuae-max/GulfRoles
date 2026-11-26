import JobPostingWizard from '@/components/employer/JobPostingWizard';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Post a Job | JobBrowser',
  description: 'Post job listings on JobBrowser',
};

export default async function PostJobPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('employer_session')?.value;
  const employerId = cookieStore.get('employer_id')?.value;

  if (!sessionToken || !employerId) {
    redirect('/employer/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-600 mt-1">Fill in the details below to post your job listing. Connecting an existing Greenhouse, Lever, Ashby, or Workable board is separate and also free.</p>
          <p className="text-sm mt-2 flex flex-wrap gap-4">
            <Link href="/employer/jobs" className="text-blue-800 underline">Your jobs</Link>
            <Link href="/employer/sources" className="text-blue-800 underline">Connect a careers board</Link>
          </p>
        </div>
      </div>

      {/* Wizard */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <JobPostingWizard employerId={employerId} />
      </div>
    </div>
  );
}
