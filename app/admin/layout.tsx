import type { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: 'Admin Dashboard - JobBrowser',
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">JobBrowser Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden sm:flex space-x-6">
              <Link href="/admin/moderation" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Moderation
              </Link>
              <Link href="/admin/revenue" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Clicks
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">
            © 2026 JobBrowser. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Admin Dashboard v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
