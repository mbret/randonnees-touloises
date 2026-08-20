import type { Metadata } from 'next/types'

import { getPrograms } from '@/components/programs/getPrograms'
import { ProgramList } from '@/components/programs/ProgramList'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import React from 'react'

/**
 * Entries drop off the day after they end, so the page has to be re-rendered on
 * a clock rather than pinned to the last build.
 */
export const revalidate = 3600

const TITLE = 'Programme hebdomadaire'
const DESCRIPTION =
  'Les sorties à la journée, les week-ends et les séjours des Randonnées Touloises ouverts aux inscriptions.'

export default async function Page() {
  const entries = await getPrograms()

  return (
    <div className="container pt-24 pb-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{DESCRIPTION}</p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <ProgramList entries={entries} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: DESCRIPTION,
  openGraph: mergeOpenGraph({
    description: DESCRIPTION,
    url: '/programs',
  }),
  title: TITLE,
}
