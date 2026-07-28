import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ReactNode } from 'react';

interface SeekerLayoutProps {
  children: ReactNode;
}

export default function SeekerLayout({ children }: SeekerLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
