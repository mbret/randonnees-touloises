import type { Metadata } from 'next/types'

import { getPrograms } from '@/components/programs/getPrograms'
import { ProgramList } from '@/components/programs/ProgramList'
import { servedAt } from '@/seo/servedAt'
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
    <div className="container page-shell">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{DESCRIPTION}</p>
      </div>

      <div className="mt-12">
        <ProgramList entries={entries} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: DESCRIPTION,
  ...servedAt('/programs', {
    description: DESCRIPTION,
  }),
  title: TITLE,
}
