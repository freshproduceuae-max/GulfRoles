'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobActions({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function act(action: string) {
    setError('');
    const response = await fetch(`/api/employer/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Could not update the job');
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <a href={`/employer/jobs/${jobId}/edit`} className="px-3 py-1 border rounded text-sm text-gray-900">Edit</a>
      {status !== 'paused' && status !== 'closed' ? (
        <button type="button" className="px-3 py-1 border rounded text-sm" onClick={() => void act('pause')}>Pause</button>
      ) : null}
      {status !== 'published' ? (
        <button type="button" className="px-3 py-1 border rounded text-sm" onClick={() => void act('publish')}>Reopen</button>
      ) : null}
      {status !== 'closed' ? (
        <button type="button" className="px-3 py-1 border rounded text-sm" onClick={() => void act('close')}>Close</button>
      ) : null}
      <button type="button" className="px-3 py-1 border rounded text-sm" onClick={() => void act('duplicate')}>Duplicate</button>
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
    </div>
  );
}
