'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function HomeSearch({ regionDb, regionLabel }: { regionDb?: string; regionLabel?: string }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState(regionDb || '');
  const [isSearching, setIsSearching] = useState(false);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
    if (country) params.set('region', country);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          {regionLabel ? `Jobs in ${regionLabel}` : 'Find your next job'}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12">
          Real listings from employers and from Careerjet, Jooble, and Adzuna. Applying on a partner site is labeled, and JobBrowser does not sell CVs.
        </p>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            type="text"
            placeholder="Job title or keyword"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="flex-1"
            aria-label="Job title or keyword"
          />
          <Input
            type="text"
            placeholder="City or region"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="flex-1"
            aria-label="Location"
          />
          <label className="sr-only" htmlFor="home-country">Country</label>
          <select
            id="home-country"
            aria-label="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900"
          >
            <option value="">Any country</option>
            <option value="UAE">UAE</option>
            <option value="Saudi">Saudi Arabia</option>
            <option value="India">India</option>
            <option value="Australia">Australia</option>
            <option value="USA">United States</option>
          </select>
          <Button variant="primary" size="md" type="submit" loading={isSearching} className="sm:w-auto">
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
