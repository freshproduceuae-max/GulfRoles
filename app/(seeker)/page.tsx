'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function Homepage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (location) params.append('location', location);

    router.push(`/search?${params.toString()}`);
  };

  const sampleJobs = [
    {
      id: '1',
      title: 'Senior React Developer',
      company_name: 'TechCorp',
      location: 'Dubai, UAE',
      salary_min: 8000,
      salary_max: 12000,
      salary_currency: 'AED',
      job_type: 'full-time',
      region: 'UAE',
    },
    {
      id: '2',
      title: 'Product Manager',
      company_name: 'InnovateTech',
      location: 'Riyadh, Saudi Arabia',
      salary_min: 150000,
      salary_max: 200000,
      salary_currency: 'SAR',
      job_type: 'full-time',
      region: 'Saudi',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950">
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Find Your Next Opportunity
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12">
            Search across thousands of verified job listings from companies around the world.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
            <Input
              type="text"
              placeholder="Job title or keyword"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={isSearching}
              className="sm:w-auto"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Featured Jobs
          </h2>
          <div className="text-center">
            <Link href="/search">
              <Button variant="primary" size="lg">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
