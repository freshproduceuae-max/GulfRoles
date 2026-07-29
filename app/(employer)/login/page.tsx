import EmployerLoginForm from '@/components/employer/EmployerLoginForm';

export const metadata = {
  title: 'Post a Job | JobBrowser',
  description: 'Post job listings on JobBrowser',
};

export default function EmployerLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <EmployerLoginForm />
    </div>
  );
}
