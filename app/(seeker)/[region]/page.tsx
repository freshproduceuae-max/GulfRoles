import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeView, regionMetadata } from '@/components/seeker/HomeView';
import { getFeaturedJobs } from '@/lib/jobs';
import { regionBySlug } from '@/lib/regions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata({ params }: { params: { region: string } }): Metadata {
  const region = regionBySlug(params.region);
  if (!region) return { title: 'Jobs | JobBrowser' };
  return regionMetadata(region);
}

export default async function RegionPage({ params }: { params: { region: string } }) {
  const region = regionBySlug(params.region);
  if (!region) notFound();
  let jobs: Awaited<ReturnType<typeof getFeaturedJobs>> = [];
  try {
    jobs = await getFeaturedJobs(region.db);
  } catch (error) {
    console.error('Region jobs unavailable', error instanceof Error ? error.message : error);
  }
  return <HomeView region={region} jobs={jobs} />;
}
