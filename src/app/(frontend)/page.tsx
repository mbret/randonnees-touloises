import type { Metadata } from 'next/types'

import { HomeAgenda } from '@/components/agenda/HomeAgenda'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeKeyFigures } from '@/components/home/HomeKeyFigures'
import { HomePrograms } from '@/components/programs/HomePrograms'
import { servedAt } from '@/seo/servedAt'
import { SEO_DESCRIPTION } from '@/seo/constants'
import React from 'react'

/**
 * The agenda drops events once their day has passed, and the programme drops
 * entries once theirs has. That is the daily refresh's job, in
 * `app/(frontend)/next/daily-refresh`, rather than a timer's: the date changes
 * once a day, and every edit that reaches the page already refreshes it through
 * the hooks on events, locations, outing categories, posts and their uploads.
 */

export default function Page() {
  return (
    <>
      <HomeHero />
      <HomeKeyFigures />
      <HomeAgenda />
      <HomePrograms />
    </>
  )
}

export const metadata: Metadata = {
  description: SEO_DESCRIPTION,
  ...servedAt('/'),
  // No title: the root layout's default is the site name, which is what the
  // home page wants, and repeating it here would only invite a second suffix.
}
