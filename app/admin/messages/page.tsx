import { query } from '@/lib/db';
import { CONTACT_TOPICS } from '@/lib/contact';

export const dynamic = 'force-dynamic';

interface Submission {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at: string;
}

function topicLabel(id: string): string {
  return CONTACT_TOPICS.find((topic) => topic.id === id)?.label || id;
}

export default async function AdminMessagesPage() {
  let rows: Submission[] = [];
  let unavailable = false;
  try {
    const result = await query<Submission>(
      `SELECT id, name, email, topic, message, created_at
       FROM contact_submissions
       ORDER BY created_at DESC
       LIMIT 100`
    );
    rows = result.rows;
  } catch {
    unavailable = true;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact messages</h1>
      {unavailable ? (
        <p className="text-gray-700">Messages are unavailable until the database migration has been applied.</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-700">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {topicLabel(row.topic)} · {new Date(row.created_at).toLocaleString('en-GB')}
              </p>
              <p className="font-medium text-gray-900">{row.name}</p>
              <p className="text-sm text-gray-800">{row.email}</p>
              <p className="mt-2 whitespace-pre-wrap text-gray-800">{row.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
