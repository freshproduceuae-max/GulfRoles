'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function CompanyPage() {
  const [form, setForm] = useState({ name: '', website: '', description: '', address: '', region: 'UAE', industry: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch('/api/employer/company')
      .then((response) => response.json())
      .then((data) => {
        if (data.company) {
          setForm({
            name: data.company.name || '',
            website: data.company.website || '',
            description: data.company.description || '',
            address: data.company.address || '',
            region: data.company.region || 'UAE',
            industry: data.company.industry || '',
          });
        }
      });
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/employer/company', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Could not save the company');
      return;
    }
    setMessage('Company profile saved.');
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Company profile</h1>
      <form onSubmit={save} className="bg-white rounded-lg shadow p-6 space-y-4">
        {error ? <p className="text-red-800">{error}</p> : null}
        {message ? <p className="text-green-900">{message}</p> : null}
        <label className="block text-sm text-gray-900">Company name
          <input aria-label="Profile company name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" required />
        </label>
        <label className="block text-sm text-gray-900">Website
          <input aria-label="Company website" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block text-sm text-gray-900">Industry
          <input aria-label="Industry" value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block text-sm text-gray-900">Address
          <input aria-label="Company address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block text-sm text-gray-900">Region
          <select aria-label="Company region" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} className="mt-1 w-full border rounded px-3 py-2">
            {['UAE', 'Saudi', 'India', 'Australia', 'USA'].map((region) => <option key={region}>{region}</option>)}
          </select>
        </label>
        <label className="block text-sm text-gray-900">About
          <textarea aria-label="Company description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg">Save profile</button>
      </form>
    </main>
  );
}
