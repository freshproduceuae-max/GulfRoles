import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Providers } from './providers'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://jobbrowser.app'),
  title: 'GulfRoles - GCC and India jobs',
  description: 'Free employer posts plus licensed ATS and feed jobs. No Indeed, Glassdoor, LinkedIn, or GulfTalent scraping.',
  keywords: ['jobs', 'careers', 'job search', 'employment', 'UAE jobs', 'Saudi jobs'],
  authors: [{ name: 'GulfRoles' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'GulfRoles',
  },
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
