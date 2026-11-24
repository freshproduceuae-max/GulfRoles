import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Verifying Email | JobBrowser',
  description: 'Verifying your email for job posting',
};

export default function VerifyPage({ params }: { params: { token: string } }) {
  redirect(`/api/auth/employer-verify/${encodeURIComponent(params.token)}`);
}
