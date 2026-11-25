'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ApplicantsList from '@/components/employer/ApplicantsList';

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  resume_filename?: string;
  cover_letter?: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected' | 'submitted' | 'viewed';
  knockout?: boolean;
  rating?: number | null;
  applicant_location?: string | null;
  experience_years?: number | null;
  created_at: string;
  updated_at: string;
}

interface JobInfo {
  id: string;
  title: string;
  company_name: string;
  location: string;
  status: string;
}

const STAGES = ['new', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'] as const;
const STAGE_LABEL: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export default function InboxClient({ job, initialApplications }: { job: JobInfo; initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [stage, setStage] = useState('');
  const [rating, setRating] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [keyword, setKeyword] = useState('');
  const [since, setSince] = useState('');
  const [sort, setSort] = useState('newest');
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [templateId, setTemplateId] = useState('');

  const visible = useMemo(() => {
    return applications.filter((app) => {
      if (stage && app.status !== stage) return false;
      if (rating && (app.rating || 0) < Number(rating)) return false;
      if (location && !(app.applicant_location || '').toLowerCase().includes(location.toLowerCase())) return false;
      if (experience && (app.experience_years || 0) < Number(experience)) return false;
      return true;
    });
  }, [applications, stage, rating, location, experience]);

  async function reload() {
    const params = new URLSearchParams({ job_id: job.id, sort: sort === 'rating' ? 'rating' : sort === 'oldest' ? 'oldest' : 'newest' });
    if (stage) params.set('stage', stage);
    if (rating) params.set('rating', rating);
    if (location) params.set('location', location);
    if (experience) params.set('experience', experience);
    if (keyword) params.set('q', keyword);
    if (since) params.set('since', since);
    const response = await fetch(`/api/employer/pipeline?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Could not filter applicants');
      return;
    }
    setApplications(
      (data.applications || []).map((row: Application) => ({
        ...row,
        resume_url: row.resume_url || `/api/applications/${row.id}/resume`,
      }))
    );
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setError(null);
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      setError('The status was not saved. Try again.');
      return;
    }
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus as Application['status'] } : app))
    );
  };

  async function bulk(action: 'stage' | 'reject', nextStage?: string) {
    if (selected.length === 0) {
      setError('Select at least one applicant.');
      return;
    }
    if (templates.length === 0 && action === 'reject') {
      const loaded = await fetch('/api/employer/templates');
      const data = await loaded.json();
      setTemplates(data.templates || []);
    }
    const response = await fetch('/api/employer/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: job.id,
        application_ids: selected,
        action,
        stage: nextStage,
        template_id: templateId || undefined,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'The bulk action failed.');
      return;
    }
    setSelected([]);
    await reload();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm mb-2">
                <Link href="/employer/jobs" className="text-primary-700 underline">Your jobs</Link>
                {' · '}
                <Link href={`/employer/jobs/${job.id}/edit`} className="text-primary-700 underline">Edit job</Link>
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-700">{job.company_name} · {job.location} · {job.status}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{visible.length}</p>
              <p className="text-sm text-gray-700">{visible.length === 1 ? 'applicant' : 'applicants'}</p>
            </div>
          </div>

          <form
            className="bg-white rounded-lg shadow p-4 mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6"
            onSubmit={(event) => {
              event.preventDefault();
              void reload();
            }}
          >
            <label className="text-sm text-gray-800">Stage
              <select aria-label="Filter by stage" value={stage} onChange={(event) => setStage(event.target.value)} className="mt-1 w-full border rounded px-2 py-1">
                <option value="">Any</option>
                {STAGES.map((item) => <option key={item} value={item}>{STAGE_LABEL[item]}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-800">Minimum rating
              <select aria-label="Filter by rating" value={rating} onChange={(event) => setRating(event.target.value)} className="mt-1 w-full border rounded px-2 py-1">
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}+</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-800">Location
              <input aria-label="Filter by location" value={location} onChange={(event) => setLocation(event.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="text-sm text-gray-800">Min years
              <input aria-label="Filter by experience" value={experience} onChange={(event) => setExperience(event.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="text-sm text-gray-800">CV keyword
              <input aria-label="Search CV text" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="text-sm text-gray-800">Applied
              <select aria-label="Filter by date applied" value={since} onChange={(event) => setSince(event.target.value)} className="mt-1 w-full border rounded px-2 py-1">
                <option value="">Any time</option>
                <option value="1">Last day</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </label>
            <label className="text-sm text-gray-800">Sort
              <select aria-label="Sort applicants" value={sort} onChange={(event) => setSort(event.target.value)} className="mt-1 w-full border rounded px-2 py-1">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rating">Highest rating</option>
              </select>
            </label>
            <button type="submit" className="self-end px-3 py-2 bg-primary-500 text-white rounded-lg">Apply filters</button>
            <a className="self-end text-primary-700 underline" href={`/api/employer/pipeline?job_id=${job.id}&format=csv`}>Export CSV</a>
          </form>

          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <button type="button" className="px-3 py-2 border rounded-lg" onClick={() => setView('list')}>List</button>
            <button type="button" className="px-3 py-2 border rounded-lg" onClick={() => setView('kanban')}>Kanban</button>
            <button type="button" className="px-3 py-2 border rounded-lg" onClick={() => setSelected(visible.map((app) => app.id))}>Select shown</button>
            <label className="text-sm">Move selected
              <select aria-label="Move selected to stage" className="ml-2 border rounded px-2 py-1" defaultValue="" onChange={(event) => { if (event.target.value) void bulk('stage', event.target.value); }}>
                <option value="">Choose stage</option>
                {STAGES.map((item) => <option key={item} value={item}>{STAGE_LABEL[item]}</option>)}
              </select>
            </label>
            <label className="text-sm">Reject template
              <select aria-label="Rejection template" className="ml-2 border rounded px-2 py-1" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
                <option value="">Standard rejection</option>
                {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <button type="button" className="px-3 py-2 bg-red-800 text-white rounded-lg" onClick={() => void bulk('reject')}>Reject selected</button>
          </div>

          {error && <p className="mb-4 text-red-800">{error}</p>}

          {view === 'kanban' ? (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {STAGES.map((item) => (
                <section key={item} className="min-w-[220px] bg-white rounded-lg shadow p-3">
                  <h2 className="font-semibold text-gray-900 mb-2">{STAGE_LABEL[item]}</h2>
                  <ul className="space-y-2">
                    {visible.filter((app) => app.status === item).map((app) => (
                      <li key={app.id} data-status={app.status} className="border rounded p-2">
                        <label className="flex gap-2 items-start">
                          <input type="checkbox" aria-label={`Select ${app.applicant_name}`} checked={selected.includes(app.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, app.id] : current.filter((id) => id !== app.id))} />
                          <span>
                            <Link href={`/employer/applicants/${app.id}`} className="font-medium text-gray-900 underline">{app.applicant_name}</Link>
                            <span className="block text-xs text-gray-700">{app.knockout ? 'Must-have missed' : app.applicant_location || 'Location not given'}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : applications.length > 0 ? (
            <div>
              <ul className="mb-3 space-y-1">
                {visible.map((app) => (
                  <li key={app.id}>
                    <label className="text-sm text-gray-800">
                      <input className="mr-2" type="checkbox" aria-label={`Select ${app.applicant_name}`} checked={selected.includes(app.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, app.id] : current.filter((id) => id !== app.id))} />
                      {app.applicant_name}
                    </label>
                  </li>
                ))}
              </ul>
              <ApplicantsList applications={visible} onStatusChange={handleStatusChange} />
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h2>
              <p className="text-gray-700">Applications appear here when someone applies on JobBrowser.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
