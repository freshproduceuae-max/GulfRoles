import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'
import { isSitePublic } from '@/lib/site'
import { Providers } from './providers'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  await headers()
  const sitePublic = isSitePublic()
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://jobbrowser.app'),
    title: 'JobBrowser - Find Your Next Opportunity',
    description: 'Search jobs in the UAE, Saudi Arabia, India, Australia, and the United States.',
    keywords: ['jobs', 'careers', 'job search', 'employment', 'UAE jobs', 'Saudi jobs'],
    authors: [{ name: 'JobBrowser' }],
    robots: sitePublic
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        }
      : { index: false, follow: false },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      siteName: 'JobBrowser',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
