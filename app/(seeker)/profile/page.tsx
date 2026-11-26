'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CONSENT_COPY } from '@/lib/candidates/privacy';

interface Profile {
  full_name: string;
  email: string;
  headline: string;
  searchable: boolean;
  resume_filename: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch('/api/profile');
    if (!response.ok) return;
    const data = await response.json();
    setProfile(data.profile);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    form.set('consent', (event.currentTarget.elements.namedItem('consent') as HTMLInputElement).checked ? 'true' : 'false');
    const response = await fetch('/api/profile', { method: 'POST', body: form });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Could not save the profile');
      return;
    }
    setMessage(data.message || 'Confirm the link to turn search on.');
    setLink(data.dev_verification_link || '');
  }

  async function withdraw() {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchable: false }),
    });
    if (response.ok) {
      setMessage('Search is off. Employers can no longer find this profile.');
      await load();
    }
  }

  async function remove() {
    const response = await fetch('/api/profile', { method: 'DELETE' });
    if (response.ok) {
      setProfile(null);
      setMessage('Your profile and CV were deleted.');
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your profile</h1>
      <p className="text-gray-700 mb-4">Employers only see a profile you choose to share. Your email and phone stay hidden until you accept an invitation.</p>
      {error ? <p className="text-red-800 mb-3">{error}</p> : null}
      {message ? <p className="text-green-900 mb-3">{message}</p> : null}
      {link ? <p className="mb-4"><a className="text-primary-700 underline" href={link}>Open confirmation link</a></p> : null}
      {profile ? (
        <section className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="text-xl font-semibold">{profile.full_name}</h2>
          <p>{profile.headline}</p>
          <p>{profile.searchable ? 'Search is on.' : 'Search is off.'}</p>
          <p className="text-sm text-gray-700">Signed in as {profile.email}. This address is not shown to employers.</p>
          {profile.searchable ? <button type="button" className="px-3 py-2 border rounded" onClick={() => void withdraw()}>Turn off search</button> : null}
          <button type="button" className="px-3 py-2 bg-red-800 text-white rounded" onClick={() => void remove()}>Delete my data</button>
        </section>
      ) : (
        <form onSubmit={create} className="bg-white border rounded-lg p-4 space-y-3">
          <label className="block text-sm">Full name
            <input name="full_name" aria-label="Full name" required className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Email
            <input name="email" type="email" aria-label="Profile email" required className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Phone
            <input name="phone" aria-label="Profile phone" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Headline
            <input name="headline" aria-label="Headline" required className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Location
            <input name="location" aria-label="Profile location" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Years of experience
            <input name="experience_years" type="number" min="0" aria-label="Profile experience" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Skills
            <input name="skills" aria-label="Profile skills" className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">CV (PDF or DOCX)
            <input name="resume" type="file" accept=".pdf,.docx" aria-label="Profile CV" className="mt-1 w-full" />
          </label>
          <label className="flex gap-2 text-sm text-gray-900">
            <input name="consent" type="checkbox" aria-label="Search consent" />
            <span>{CONSENT_COPY}</span>
          </label>
          <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded">Save profile</button>
        </form>
      )}
    </main>
  );
}
