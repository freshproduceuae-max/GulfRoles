'use client';

import { FormEvent, useState } from 'react';

export default function AlertSignup({
  keywords,
  location,
  compact = false,
}: {
  keywords?: string[];
  location?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        frequency: 'weekly',
        preferences: {
          keywords: keywords || [],
          locations: location ? [location] : [],
        },
      }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setMessage(data.error || 'Could not save that alert.');
      return;
    }
    setMessage('You are subscribed. One email a week, and you can unsubscribe from any message.');
    setEmail('');
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'w-full sm:w-auto flex flex-col gap-2' : 'space-y-3'}>
      <div className={compact ? 'flex gap-2' : 'flex flex-col sm:flex-row gap-2'}>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email"
          aria-label="Email for weekly job alerts"
          className="flex-1 px-4 py-2 rounded-lg text-sm text-gray-900 bg-white border border-gray-300"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg text-sm disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Subscribe'}
        </button>
      </div>
      {message && <p className={compact ? 'text-sm text-gray-200' : 'text-sm text-gray-600 dark:text-gray-300'}>{message}</p>}
    </form>
  );
}
