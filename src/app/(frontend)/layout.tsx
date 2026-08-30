import type { Metadata } from 'next'

import { cn } from '@/components/ui'
import { Archivo, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/navigation/Header/Header'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import { SEO_TITLE } from '@/seo/constants'
import { draftMode } from 'next/headers'
import { getServerSideURL } from '@/utilities/getURL'
import './globals.css'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { ClubJsonLd } from '@/seo/jsonld/ClubJsonLd'
import { Favicon } from '@/metadata/Favicon'
import { MediaProvider } from '@/metadata/MediaProvider'
import { getCachedMedias } from '@/metadata/getMedias'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

/**
 * Self-hosted by `next/font`, so no request leaves for Google at runtime and
 * the metric-compatible fallback keeps the first paint from reflowing.
 *
 * `subsets: ['latin']` is what the site needs and no more — it covers the
 * accented characters French uses, and asking for anything wider would only
 * make the preloaded file bigger.
 *
 * Archivo is loaded as the variable family rather than as single-weight
 * Archivo Black, because headings on the site are set at several weights; the
 * display face reads as Archivo Black at the top of the range without the
 * browser faking the ones in between. `weight` is deliberately left off — a
 * variable Google font that is asked for one takes a single static cut, and
 * the range syntax `next/font/local` accepts is rejected here.
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

/**
 * Plex Mono has no variable cut, so each weight is a file and the ones asked
 * for here are exactly the ones the mono elements use: 400 for an end time,
 * 500 for a start time, 600 for the day on a programme card. Ask for fewer and
 * the browser fakes the missing weight rather than falling back to a real one.
 */
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const siteAssets = await getCachedMedias()()

  return (
    <html
      className={cn(archivo.variable, instrumentSans.variable, ibmPlexMono.variable)}
      lang="fr"
      suppressHydrationWarning
    >
      <head>
        <Favicon />
        <ClubJsonLd />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MediaProvider media={siteAssets}>
            <Providers>
              <AdminBar
                adminBarProps={{
                  preview: isEnabled,
                }}
              />
              <Header />
              {children}
              <Footer />
            </Providers>
          </MediaProvider>
        </ThemeProvider>
        {/**
         * Vercel's audience measurement and Real Experience Score reporting.
         * Both are cookieless and only report from a Vercel deployment, so they
         * are inert locally beyond a console notice.
         *
         * They live here rather than in `(payload)/layout.tsx` — which Payload
         * regenerates — so the admin panel stays out of the page-view counts
         * and the site's own metrics are not skewed by editing sessions.
         */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  /**
   * The single place the site name is appended. Every other segment sets its
   * own bare title and the template brands it exactly once; a segment with no
   * title of its own falls back to the default. A template does not apply to
   * the `page.tsx` sitting beside this layout, so the home page reads as the
   * site name alone rather than twice.
   */
  title: {
    default: SEO_TITLE,
    template: `%s | ${SEO_TITLE}`,
  },
}
