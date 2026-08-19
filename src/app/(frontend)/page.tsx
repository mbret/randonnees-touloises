import type { Metadata } from 'next/types'

import { HomeHero } from '@/components/home/HomeHero'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import { SEO_DESCRIPTION, SEO_TITLE } from '@/seo/constants'
import React from 'react'

export default function Page() {
  return <HomeHero />
}

export const metadata: Metadata = {
  description: SEO_DESCRIPTION,
  openGraph: mergeOpenGraph({
    url: '/',
  }),
  title: SEO_TITLE,
}
