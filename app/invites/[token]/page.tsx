'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const [invite, setInvite] = useState<{ status: string; title: string; company_name: string } | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetch(`/api/invites/${params.token}`).then((response) => response.json()).then((data) => setInvite(data.invite || null));
  }, [params.token]);

  async function answer(decision: 'accepted' | 'declined') {
    const response = await fetch(`/api/invites/${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    const data = await response.json();
    setMessage(response.ok ? (decision === 'accepted' ? 'You accepted. The employer can now see your contact details for this company.' : 'You declined. Your contact details stay hidden.') : data.error);
    if (response.ok && invite) setInvite({ ...invite, status: decision });
  }

  if (!invite) return <main className="p-8">Loading invitation…</main>;
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Invitation</h1>
      <p className="mt-2 text-gray-800">{invite.company_name} invited you to apply for {invite.title}.</p>
      <p className="mt-2">Status: {invite.status}</p>
      {message ? <p className="mt-3">{message}</p> : null}
      {invite.status === 'sent' ? (
        <div className="mt-4 flex gap-3">
          <button type="button" className="px-4 py-2 bg-primary-500 text-white rounded" onClick={() => void answer('accepted')}>Accept</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={() => void answer('declined')}>Decline</button>
        </div>
      ) : null}
    </main>
  );
}
