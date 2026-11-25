'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Question {
  prompt: string;
  answer_type: 'yes_no' | 'number' | 'text';
  required: boolean;
  knockout: boolean;
  expected_yes: boolean;
  min_number: string;
}

export default function EditJobPage() {
  const params = useParams<{ jobId: string }>();
  const [form, setForm] = useState({ title: '', description: '', location: '', region: 'UAE', job_type: 'full-time', salary_min: '', salary_max: '', salary_currency: 'AED', company_name: '' });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch(`/api/employer/jobs/${params.jobId}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.job) return;
        setForm({
          title: data.job.title || '',
          description: data.job.description || '',
          location: data.job.location || '',
          region: data.job.region || 'UAE',
          job_type: data.job.job_type || 'full-time',
          salary_min: data.job.salary_min ? String(data.job.salary_min) : '',
          salary_max: data.job.salary_max ? String(data.job.salary_max) : '',
          salary_currency: data.job.salary_currency || 'AED',
          company_name: data.job.company_name || '',
        });
        setQuestions((data.questions || []).map((question: Question & { min_number: number | null }) => ({
          prompt: question.prompt,
          answer_type: question.answer_type,
          required: question.required,
          knockout: question.knockout,
          expected_yes: question.expected_yes !== false,
          min_number: question.min_number == null ? '' : String(question.min_number),
        })));
      });
  }, [params.jobId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch(`/api/employer/jobs/${params.jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, questions }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Could not save the job');
      return;
    }
    setMessage('Job saved.');
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Edit job</h1>
      <form onSubmit={save} className="bg-white rounded-lg shadow p-6 space-y-4">
        {error ? <p className="text-red-800">{error}</p> : null}
        {message ? <p className="text-green-900">{message}</p> : null}
        <label className="block text-sm">Title
          <input aria-label="Edit job title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block text-sm">Location
          <input aria-label="Edit location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block text-sm">Description
          <textarea aria-label="Edit description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={6} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <section>
          <h2 className="font-semibold text-gray-900">Screening questions</h2>
          {questions.map((question, index) => (
            <div key={index} className="border rounded p-3 mt-3 space-y-2">
              <label className="block text-sm">Question
                <input aria-label={`Question ${index + 1}`} value={question.prompt} onChange={(event) => setQuestions(questions.map((item, itemIndex) => itemIndex === index ? { ...item, prompt: event.target.value } : item))} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label className="block text-sm">Type
                <select aria-label={`Question ${index + 1} type`} value={question.answer_type} onChange={(event) => setQuestions(questions.map((item, itemIndex) => itemIndex === index ? { ...item, answer_type: event.target.value as Question['answer_type'] } : item))} className="mt-1 w-full border rounded px-3 py-2">
                  <option value="yes_no">Yes / no</option>
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                </select>
              </label>
              <label className="text-sm mr-4"><input type="checkbox" checked={question.required} onChange={(event) => setQuestions(questions.map((item, itemIndex) => itemIndex === index ? { ...item, required: event.target.checked } : item))} /> Required</label>
              <label className="text-sm"><input type="checkbox" checked={question.knockout} onChange={(event) => setQuestions(questions.map((item, itemIndex) => itemIndex === index ? { ...item, knockout: event.target.checked } : item))} /> Must-have</label>
              {question.answer_type === 'yes_no' ? (
                <label className="block text-sm">Passing answer
                  <select aria-label={`Question ${index + 1} passing answer`} value={question.expected_yes ? 'yes' : 'no'} onChange={(event) => setQuestions(questions.map((item, itemIndex) => itemIndex === index ? { ...item, expected_yes: event.target.value === 'yes' } : item))} className="mt-1 border rounded px-2 py-1">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              ) : null}
              {question.answer_type === 'number' ? (
                <label className="block text-sm">Minimum
                  <input aria-label={`Question ${index + 1} minimum`} value={question.min_number} onChange={(event) => setQuestions(questions.map((item, itemIndex) => itemIndex === index ? { ...item, min_number: event.target.value } : item))} className="mt-1 border rounded px-2 py-1" />
                </label>
              ) : null}
            </div>
          ))}
          <button type="button" className="mt-3 px-3 py-2 border rounded" onClick={() => setQuestions([...questions, { prompt: '', answer_type: 'yes_no', required: true, knockout: false, expected_yes: true, min_number: '' }])}>Add question</button>
        </section>
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg">Save job</button>
      </form>
    </main>
  );
}
