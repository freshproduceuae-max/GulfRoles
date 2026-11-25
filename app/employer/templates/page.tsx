'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch('/api/employer/templates');
    const data = await response.json();
    setTemplates(data.templates || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/employer/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Could not save the template');
      return;
    }
    setForm({ name: '', subject: '', body: '' });
    await load();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Email templates</h1>
      <p className="text-gray-700 mb-4">Use {'{{name}}'} and {'{{job}}'} in the message. Mail sends when SendGrid is configured, and every message is stored.</p>
      <form onSubmit={save} className="bg-white rounded-lg shadow p-6 space-y-3 mb-6">
        {error ? <p className="text-red-800">{error}</p> : null}
        <label className="block text-sm">Name
          <input aria-label="Template name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" required />
        </label>
        <label className="block text-sm">Subject
          <input aria-label="Template subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" required />
        </label>
        <label className="block text-sm">Message
          <textarea aria-label="Template body" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows={5} className="mt-1 w-full border rounded px-3 py-2" required />
        </label>
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg">Save template</button>
      </form>
      <ul className="space-y-3">
        {templates.map((template) => (
          <li key={template.id} className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-700">{template.subject}</p>
            <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{template.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
