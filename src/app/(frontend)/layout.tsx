import type { Metadata } from 'next'

import { cn } from '@/components/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React, { Suspense } from 'react'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const siteAssets = await getCachedMedias()()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="fr" suppressHydrationWarning>
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
              {/*
                Editor-only chrome that reads the current route segments, so it
                streams in rather than holding the rest of the page out of the
                prerendered shell. Anonymous visitors never see it at all.
              */}
              <Suspense fallback={null}>
                <AdminBar
                  adminBarProps={{
                    preview: isEnabled,
                  }}
                />
              </Suspense>
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
