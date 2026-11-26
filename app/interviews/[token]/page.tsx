'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Slot {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
}

export default function InterviewPage() {
  const params = useParams<{ token: string }>();
  const [title, setTitle] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetch(`/api/interviews/${params.token}`).then((response) => response.json()).then((data) => {
      setTitle(data.request?.title || '');
      setSlots(data.slots || []);
    });
  }, [params.token]);

  async function pick(slotId: string) {
    const response = await fetch(`/api/interviews/${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId }),
    });
    const data = await response.json();
    setMessage(response.ok ? 'Time booked. A calendar invite is emailed when mail is configured.' : data.error);
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Choose an interview time</h1>
      <p className="mt-2 text-gray-800">{title}</p>
      {message ? <p className="mt-3">{message}</p> : null}
      <ul className="mt-4 space-y-2">
        {slots.map((slot) => (
          <li key={slot.id} className="flex items-center justify-between border rounded p-3">
            <span>{new Date(slot.starts_at).toLocaleString()} – {new Date(slot.ends_at).toLocaleTimeString()}</span>
            {slot.status === 'open' ? <button type="button" className="px-3 py-1 bg-primary-500 text-white rounded" onClick={() => void pick(slot.id)}>Pick this time</button> : <span>{slot.status}</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
