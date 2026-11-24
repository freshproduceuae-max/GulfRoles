'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import ModerationQueue from '@/components/admin/ModerationQueue';
import JobPreviewModal from '@/components/admin/JobPreviewModal';

export default function ModerationPage() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
        <p className="text-gray-600 mt-2">Review and approve flagged jobs</p>
      </div>

      {/* Main Content */}
      <Suspense fallback={<div>Loading queue...</div>}>
        <ModerationQueue onJobSelect={setSelectedJobId} />
      </Suspense>

      {/* Job Preview Modal */}
      {selectedJobId && (
        <JobPreviewModal
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}
