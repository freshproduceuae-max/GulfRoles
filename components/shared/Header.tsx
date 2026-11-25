'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set('q', title.trim());
    if (location.trim()) params.set('location', location.trim());
    router.push(`/search?${params.toString()}`);
    setIsMenuOpen(false);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Desktop and Mobile Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition"
              aria-label="JobBrowser home"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="hidden sm:inline-block text-xl font-bold text-gray-900 dark:text-white">
                JobBrowser
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar - Centered */}
          <form onSubmit={submitSearch} className="hidden md:flex flex-1 mx-8 max-w-md">
            <div className="w-full flex gap-2">
              <input
                type="text"
                placeholder="Job title"
                aria-label="Job title search"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <input
                type="text"
                placeholder="Location"
                aria-label="Location search"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition"
                aria-label="Search jobs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop Action Buttons */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-3">
            <Link href="/search" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Find jobs
            </Link>
            <Link href="/saved" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Saved
            </Link>
            <Link href="/#job-alerts" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Alerts
            </Link>
            <Link
              href="/employer/post-job"
              className="px-4 py-2 text-sm font-medium text-white bg-secondary-500 rounded-lg hover:bg-secondary-600"
            >
              Post a job free
            </Link>
          </nav>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {/* Mobile Search Bar */}
            <form onSubmit={submitSearch} className="space-y-2">
              <input
                type="text"
                placeholder="Job title"
                aria-label="Job title search"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <input
                type="text"
                placeholder="Location"
                aria-label="Location search"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition"
              >
                Search
              </button>
            </form>

            <div className="space-y-2">
              <Link href="/search" className="block w-full px-4 py-2 text-sm font-medium text-center border rounded-lg">
                Find jobs
              </Link>
              <Link href="/saved" className="block w-full px-4 py-2 text-sm font-medium text-center border rounded-lg">
                Saved
              </Link>
              <Link href="/#job-alerts" className="block w-full px-4 py-2 text-sm font-medium text-center border rounded-lg">
                Alerts
              </Link>
              <Link
                href="/employer/post-job"
                className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-secondary-500 rounded-lg"
              >
                Post a job free
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
