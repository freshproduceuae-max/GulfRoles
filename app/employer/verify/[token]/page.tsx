import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function VerifyPage({ params }: { params: { token: string } }) {
  redirect(`/api/auth/employer-verify/${params.token}`);
}
