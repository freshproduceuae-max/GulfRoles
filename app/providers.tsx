'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize Sentry on client side
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        beforeSend(event) {
          // Filter out certain errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error('[Sentry]', event);
          }
          return event;
        },
      });
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
