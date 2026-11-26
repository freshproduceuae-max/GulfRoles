'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Detail {
  application: {
    id: string;
    job_id: string;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    cover_letter: string | null;
    status: string;
    rating: number | null;
    applicant_location: string | null;
    experience_years: number | null;
    skills: string | null;
    knockout: boolean;
    resume_filename: string | null;
    resume_content_type: string | null;
  };
  answers: { prompt: string; answer_text: string; knocked_out: boolean }[];
  notes: { id: string; author_email: string; body: string; created_at: string }[];
  events: { kind: string; detail: string | null; actor_email: string | null; created_at: string }[];
  messages: { subject: string; body: string; sent: boolean; created_at: string }[];
}

export default function ApplicantPage() {
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState({ subject: '', body: '' });
  const [interviewLink, setInterviewLink] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`/api/employer/applicants/${params.id}`);
    const data = await response.json();
    if (response.ok) setDetail(data);
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function saveNote(event: FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch(`/api/employer/applicants/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    if (!response.ok) {
      setError('The note was not saved.');
      return;
    }
    setNote('');
    await load();
  }

  async function rate(rating: number) {
    await fetch(`/api/employer/applicants/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    await load();
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/employer/applicants/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_subject: message.subject, message_body: message.body }),
    });
    if (!response.ok) {
      setError('The message was not saved.');
      return;
    }
    setMessage({ subject: '', body: '' });
    await load();
  }

  if (!detail) return <main className="p-8">Loading applicant…</main>;
  const app = detail.application;
  const pdf = app.resume_content_type === 'application/pdf';

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <p><Link href={`/employer/inbox/${app.job_id}`} className="text-primary-700 underline">Back to pipeline</Link></p>
      <h1 className="text-3xl font-bold text-gray-900">{app.applicant_name}</h1>
      <p className="text-gray-800">{app.applicant_email}{app.applicant_phone ? ` · ${app.applicant_phone}` : ''}</p>
      <p className="text-gray-800">Stage: {app.status}{app.knockout ? ' · Must-have missed' : ''}{app.applicant_location ? ` · ${app.applicant_location}` : ''}{app.experience_years != null ? ` · ${app.experience_years} years` : ''}</p>
      {app.skills ? <p className="text-gray-800">Skills: {app.skills}</p> : null}
      <div className="flex gap-2" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" aria-label={`Rate ${value}`} className={`px-3 py-1 rounded border ${app.rating === value ? 'bg-primary-500 text-white' : ''}`} onClick={() => void rate(value)}>{value}</button>
        ))}
      </div>
      {error ? <p className="text-red-800">{error}</p> : null}
      {app.cover_letter ? <section className="bg-white rounded-lg shadow p-4"><h2 className="font-semibold mb-2">Cover note</h2><p className="whitespace-pre-wrap">{app.cover_letter}</p></section> : null}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Screening answers</h2>
        {detail.answers.length === 0 ? <p>No screening answers.</p> : (
          <ul className="space-y-2">
            {detail.answers.map((answer) => (
              <li key={answer.prompt}><strong>{answer.prompt}</strong> {answer.answer_text}{answer.knocked_out ? ' (must-have missed)' : ''}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">CV</h2>
        <p className="mb-2"><a className="text-primary-700 underline" href={`/api/applications/${app.id}/resume`}>Download {app.resume_filename || 'CV'}</a></p>
        {pdf ? <iframe title="CV preview" className="w-full h-96 border" src={`/api/applications/${app.id}/resume?inline=1`} /> : <p>Open the downloaded Word file to read it. The text is still searchable in the pipeline.</p>}
      </section>
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Interview times</h2>
        <form className="space-y-2" onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const response = await fetch('/api/employer/interviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              application_id: app.id,
              slots: [{ starts_at: form.get('starts_at'), ends_at: form.get('ends_at') }],
            }),
          });
          const data = await response.json();
          setError(response.ok ? '' : data.error || 'Could not propose times');
          if (response.ok) setInterviewLink(data.dev_interview_link || 'Times emailed to the candidate.');
        }}>
          <label className="block text-sm">Start
            <input type="datetime-local" name="starts_at" aria-label="Slot start" required className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">End
            <input type="datetime-local" name="ends_at" aria-label="Slot end" required className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <button type="submit" className="px-3 py-2 bg-primary-500 text-white rounded">Propose interview</button>
          {interviewLink ? <p className="break-all">{interviewLink}</p> : null}
        </form>
      </section>
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Notes</h2>
        <ul className="mb-3 space-y-2">{detail.notes.map((item) => <li key={item.id}><span className="text-sm text-gray-700">{item.author_email}</span><p>{item.body}</p></li>)}</ul>
        <form onSubmit={saveNote} className="space-y-2">
          <label className="block text-sm">Add a note
            <textarea aria-label="Applicant note" value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full border rounded px-3 py-2" rows={3} />
          </label>
          <button type="submit" className="px-3 py-2 bg-primary-500 text-white rounded">Save note</button>
        </form>
      </section>
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Message the candidate</h2>
        <form onSubmit={send} className="space-y-2">
          <label className="block text-sm">Subject
            <input aria-label="Message subject" value={message.subject} onChange={(event) => setMessage({ ...message, subject: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block text-sm">Message
            <textarea aria-label="Message body" value={message.body} onChange={(event) => setMessage({ ...message, body: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" rows={4} />
          </label>
          <button type="submit" className="px-3 py-2 bg-primary-500 text-white rounded">Send message</button>
        </form>
        <ul className="mt-3 space-y-2">{detail.messages.map((item) => <li key={item.created_at}><strong>{item.subject}</strong> {item.sent ? 'Sent' : 'Saved, email not configured'}<p>{item.body}</p></li>)}</ul>
      </section>
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Activity</h2>
        <ol className="space-y-1">{detail.events.map((event) => <li key={`${event.kind}-${event.created_at}`}>{event.detail} · {event.actor_email}</li>)}</ol>
      </section>
    </main>
  );
}
