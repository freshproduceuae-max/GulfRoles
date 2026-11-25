import JobPostingWizard from '@/components/employer/JobPostingWizard';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Post a Job free | GulfRoles',
  description: 'Post GCC and India jobs on GulfRoles at no charge. No recruitment seats.',
};

export default function PostJobPage() {
  const cookieStore = cookies();
  const employerId = cookieStore.get('employer_id')?.value || 'public';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Post a Job — free</h1>
          <p className="text-gray-600 mt-1">
            Employers post at no charge. There are no paid recruitment seats. Optional featured
            listings may come later as pay-per-job, not user licenses.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">
        <JobPostingWizard employerId={employerId} />
      </div>
      <Footer />
    </div>
  );
}
