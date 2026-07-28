import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'JobBrowser - Find Your Next Opportunity',
  description: 'Aggregate and browse job listings from multiple sources in one place.',
  keywords: ['jobs', 'careers', 'job search', 'employment'],
  authors: [{ name: 'JobBrowser Team' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jobbrowser.app',
    siteName: 'JobBrowser',
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
