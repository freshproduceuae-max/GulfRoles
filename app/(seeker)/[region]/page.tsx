import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeView, regionMetadata } from '@/components/seeker/HomeView';
import { getFeaturedJobs } from '@/lib/jobs';
import { regionBySlug } from '@/lib/regions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region: slug } = await params;
  const region = regionBySlug(slug);
  if (!region) return { title: 'Jobs | JobBrowser' };
  return regionMetadata(region);
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params;
  const region = regionBySlug(slug);
  if (!region) notFound();
  let jobs: Awaited<ReturnType<typeof getFeaturedJobs>> = [];
  try {
    jobs = await getFeaturedJobs(region.db);
  } catch (error) {
    console.error('Region jobs unavailable', error instanceof Error ? error.message : error);
  }
  return <HomeView region={region} jobs={jobs} />;
}
