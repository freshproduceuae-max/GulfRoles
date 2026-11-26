'use client';

import { FormEvent, useState } from 'react';
import { CONTACT_TOPICS, type ContactTopic } from '@/lib/contact';

export default function ContactForm({ initialTopic }: { initialTopic: ContactTopic }) {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

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
        topic: form.get('topic'),
        message: form.get('message'),
        website: form.get('website'),
      }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setStatus(data.error || 'We could not save your message.');
      return;
    }
    setDone(true);
    setStatus('Message received. We will reply to the address you entered.');
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-lg">
      <label className="block text-sm font-medium">
        Name
        <input name="name" required autoComplete="name" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
      </label>
      <label className="block text-sm font-medium">
        Your email
        <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
      </label>
      <label className="block text-sm font-medium">
        Topic
        <select name="topic" defaultValue={initialTopic} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900">
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Message
        <textarea name="message" required minLength={10} rows={5} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
      </label>
      <label className="absolute left-[-9999px]" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" disabled={pending || done} className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white disabled:opacity-60">
        {pending ? 'Sending…' : 'Send'}
      </button>
      {status && <p role="status">{status}</p>}
    </form>
  );
}
