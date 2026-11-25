'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Candidate {
  id: string;
  headline: string;
  location: string | null;
  experience_years: number | null;
  skills: string | null;
  excerpt: string;
  contact_visible: boolean;
  full_name?: string;
  email?: string;
  phone?: string | null;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: { skills?: string; location?: string; experience?: string; q?: string };
}

export default function CandidatesPage() {
  const [filters, setFilters] = useState({ skills: '', location: '', experience: '', q: '' });
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [jobId, setJobId] = useState('');
  const [message, setMessage] = useState('');

  async function search(next = filters) {
    const params = new URLSearchParams();
    if (next.skills) params.set('skills', next.skills);
    if (next.location) params.set('location', next.location);
    if (next.experience) params.set('experience', next.experience);
    if (next.q) params.set('q', next.q);
    const response = await fetch(`/api/employer/candidates?${params.toString()}`);
    const data = await response.json();
    setCandidates(data.candidates || []);
  }

  useEffect(() => {
    void fetch('/api/employer/saved-searches').then((response) => response.json()).then((data) => setSaved(data.searches || []));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = (event.currentTarget.elements.namedItem('search_name') as HTMLInputElement).value;
    await fetch('/api/employer/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ...filters }),
    });
    const data = await fetch('/api/employer/saved-searches').then((response) => response.json());
    setSaved(data.searches || []);
  }

  async function invite(profileId: string) {
    const response = await fetch('/api/employer/candidates/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, job_id: jobId }),
    });
    const data = await response.json();
    setMessage(response.ok ? (data.dev_invite_link ? `Invitation ready: ${data.dev_invite_link}` : 'Invitation emailed.') : data.error);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates</h1>
      <p className="text-gray-700 mb-4">Only people who opted in appear here. Email and phone stay hidden until they accept an invitation.</p>
      <form className="grid gap-3 sm:grid-cols-2 mb-4" onSubmit={(event) => { event.preventDefault(); void search(); }}>
        <label className="text-sm">Skills
          <input aria-label="Search skills" value={filters.skills} onChange={(event) => setFilters({ ...filters, skills: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="text-sm">Location
          <input aria-label="Search location" value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="text-sm">Minimum years
          <input aria-label="Search experience" value={filters.experience} onChange={(event) => setFilters({ ...filters, experience: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="text-sm">CV keyword
          <input aria-label="Search CV keyword" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded">Search</button>
      </form>
      <form onSubmit={save} className="flex gap-2 mb-4">
        <input name="search_name" aria-label="Saved search name" placeholder="Name this search" className="border rounded px-3 py-2" />
        <button type="submit" className="px-3 py-2 border rounded">Save search</button>
      </form>
      {saved.length > 0 ? (
        <ul className="mb-4 flex flex-wrap gap-2">
          {saved.map((item) => (
            <li key={item.id}>
              <button type="button" className="px-3 py-1 border rounded" onClick={() => { setFilters({ skills: item.filters.skills || '', location: item.filters.location || '', experience: item.filters.experience || '', q: item.filters.q || '' }); void search({ skills: item.filters.skills || '', location: item.filters.location || '', experience: item.filters.experience || '', q: item.filters.q || '' }); }}>{item.name}</button>
            </li>
          ))}
        </ul>
      ) : null}
      <label className="block text-sm mb-4">Job id for invitations
        <input aria-label="Invite job id" value={jobId} onChange={(event) => setJobId(event.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
      </label>
      {message ? <p className="mb-4 break-all">{message}</p> : null}
      <ul className="space-y-3">
        {candidates.map((candidate) => (
          <li key={candidate.id} className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-900">{candidate.contact_visible ? candidate.full_name : candidate.headline}</h2>
            <p className="text-sm text-gray-700">{candidate.location || 'Location not given'} · {candidate.experience_years ?? '—'} years</p>
            <p className="text-sm">{candidate.skills}</p>
            <p className="text-sm text-gray-800 mt-2">{candidate.excerpt}</p>
            {candidate.contact_visible ? <p className="mt-2">{candidate.email} {candidate.phone || ''}</p> : <p className="mt-2 text-sm">Contact details hidden</p>}
            <button type="button" className="mt-3 px-3 py-2 bg-primary-500 text-white rounded" onClick={() => void invite(candidate.id)}>Invite to apply</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
