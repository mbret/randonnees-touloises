import type { Metadata } from 'next'

import { cn } from '@/components/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/navigation/Header/Header'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { getServerSideURL } from '@/utilities/getURL'
import './globals.css'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { ClubJsonLd } from '@/seo/ClubJsonLd'
import { Favicon } from '@/metadata/Favicon'
import { MediaProvider } from '@/metadata/MediaProvider'
import { getCachedMedias } from '@/metadata/getMedias'

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
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
