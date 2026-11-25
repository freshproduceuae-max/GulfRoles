import { getFeaturedJobs, type PublicJob } from '@/lib/jobs';
import { HomeView, regionMetadata } from '@/components/seeker/HomeView';

export const dynamic = 'force-dynamic';

export const metadata = regionMetadata();

async function loadJobs(): Promise<PublicJob[]> {
  try {
    return await getFeaturedJobs();
  } catch (error) {
    console.error('Featured jobs unavailable', error instanceof Error ? error.message : error);
    return [];
  }
}

export default async function Homepage() {
  const jobs = await loadJobs();
  return <HomeView jobs={jobs} />;
}
