'use client';

import { FormEvent, useState } from 'react';

export default function ContactForm({ contact }: { contact: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        message: form.get('message'),
      }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setStatus(data.message || data.error || `Email ${contact} directly.`);
      return;
    }
    setStatus('Message sent.');
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-lg">
      <label className="block text-sm font-medium">
        Name
        <input name="name" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
      </label>
      <label className="block text-sm font-medium">
        Message
        <textarea name="message" required minLength={10} rows={5} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white disabled:opacity-60">
        {pending ? 'Sending…' : 'Send'}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
