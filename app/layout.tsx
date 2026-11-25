import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'GulfRoles - GCC and India jobs',
  description: 'Free employer posts plus licensed ATS and feed jobs. No Indeed, Glassdoor, LinkedIn, or GulfTalent scraping.',
  keywords: ['jobs', 'careers', 'job search', 'employment'],
  authors: [{ name: 'GulfRoles' }],
  viewport: 'width=device-width, initial-scale=1',
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
    canonical: 'https://jobbrowser.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jobbrowser.app',
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
