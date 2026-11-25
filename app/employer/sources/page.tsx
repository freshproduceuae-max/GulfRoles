'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Board {
  id: string;
  vendor: string;
  board_token: string;
  region: string;
  status: string;
}

export default function EmployerSourcesPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch('/api/employer/sources');
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || data.error || 'Sign in before connecting a careers board.');
      return;
    }
    setBoards(data.boards || []);
  }

  useEffect(() => {
    load().catch(() => setError('Could not load boards.'));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/employer/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor: form.get('vendor'),
        board_token: form.get('board_token'),
        region: form.get('region'),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || data.error || 'Could not save that board.');
      return;
    }
    setMessage('Saved. The next daily ingest will index jobs whose location matches your region.');
    event.currentTarget.reset();
    await load();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Connect a careers board</h1>
        <p className="text-gray-600">
          Job posts on JobBrowser stay free. If you already publish jobs on Greenhouse, Lever, Ashby, or Workable, enter the public board name and we will index those jobs with your permission. Do not paste a private API key. We do not take jobs from Indeed, Glassdoor, LinkedIn, or GulfTalent.
        </p>
        <form onSubmit={onSubmit} className="space-y-3 rounded-lg bg-white p-4 shadow">
          <label className="block text-sm font-medium">
            Board
            <select name="vendor" className="mt-1 w-full rounded border px-3 py-2" required>
              <option value="greenhouse">Greenhouse</option>
              <option value="lever">Lever</option>
              <option value="ashby">Ashby</option>
              <option value="workable">Workable</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Public board name
            <input name="board_token" required placeholder="your-company" className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Region to keep
            <select name="region" className="mt-1 w-full rounded border px-3 py-2">
              <option>UAE</option>
              <option>Saudi</option>
              <option>India</option>
              <option>Australia</option>
              <option>USA</option>
            </select>
          </label>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 font-medium text-white">Save board</button>
        </form>
        {message && <p className="text-green-700">{message}</p>}
        {error && <p className="text-red-700">{error}</p>}
        <ul className="space-y-2">
          {boards.map((board) => (
            <li key={board.id} className="rounded bg-white px-3 py-2 text-sm">
              {board.vendor} / {board.board_token} · {board.region} · {board.status}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
