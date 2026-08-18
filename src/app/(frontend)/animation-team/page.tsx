import type { Metadata } from 'next/types'

import { TeamSection } from '@/components/TeamSection/TeamSection'
import { animationTeam } from '@/data/teams'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import React from 'react'

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mb-12">
          <h1>Équipe d’animation</h1>
          <p className="lead">
            Les animateurs et animatrices diplômés qui encadrent nos sorties. Contactez-les pour
            toute question sur une randonnée.
          </p>
        </div>

        <TeamSection teamMembers={animationTeam} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Les animateurs et animatrices diplômés qui encadrent les sorties des Randonnées Touloises.',
  openGraph: mergeOpenGraph({
    title: 'Équipe d’animation',
    url: '/animation-team',
  }),
  title: 'Équipe d’animation',
}
