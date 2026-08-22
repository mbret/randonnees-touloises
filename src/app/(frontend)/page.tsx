import type { Metadata } from 'next/types'

import { HomeAgenda } from '@/components/agenda/HomeAgenda'
import { HomeHero } from '@/components/home/HomeHero'
import { HomePrograms } from '@/components/programs/HomePrograms'
import { servedAt } from '@/seo/servedAt'
import { SEO_DESCRIPTION } from '@/seo/constants'
import React from 'react'

export default function Page() {
  return (
    <>
      <HomeHero />
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
