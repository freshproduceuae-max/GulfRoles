'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Member {
  email: string;
  role: string;
  accepted_at: string | null;
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch('/api/employer/team');
    const data = await response.json();
    setMembers(data.members || []);
    setRole(data.role || '');
  }

  useEffect(() => {
    void load();
  }, []);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/employer/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), role: form.get('role') }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Could not send the invite');
      return;
    }
    setMessage(data.dev_team_link ? `Invite ready: ${data.dev_team_link}` : 'Invite emailed.');
    await load();
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Team</h1>
      <p className="text-gray-700 mb-4">Your role: {role || '…'}. Owners invite people. Recruiters can post and message. Viewers can look, not change.</p>
      {error ? <p className="text-red-800">{error}</p> : null}
      {message ? <p className="break-all mb-3">{message}</p> : null}
      {role === 'owner' ? (
        <form onSubmit={invite} className="bg-white rounded-lg shadow p-4 space-y-3 mb-4">
          <label className="block text-sm">Email
            <input name="email" type="email" aria-label="Teammate email" required className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Role
            <select name="role" aria-label="Teammate role" className="mt-1 w-full border rounded px-3 py-2">
              <option value="recruiter">Recruiter</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded">Invite</button>
        </form>
      ) : null}
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.email} className="bg-white rounded p-3">{member.email} · {member.role} · {member.accepted_at ? 'joined' : 'invited'}</li>
        ))}
      </ul>
    </main>
  );
}
