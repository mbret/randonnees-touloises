import type { Metadata } from 'next/types'

import { HomeAgenda } from '@/components/agenda/HomeAgenda'
import { HomeHero } from '@/components/home/HomeHero'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import { SEO_DESCRIPTION, SEO_TITLE } from '@/seo/constants'
import React from 'react'

/**
 * The agenda drops outings once their day has passed, so the page has to be
 * re-rendered on a clock rather than pinned to the last build.
 */
export const revalidate = 3600

export default function Page() {
  return (
    <>
      <HomeHero />
      <HomeAgenda />
    </>
  )
}

export const metadata: Metadata = {
  description: SEO_DESCRIPTION,
  openGraph: mergeOpenGraph({
    url: '/',
  }),
  title: SEO_TITLE,
}
