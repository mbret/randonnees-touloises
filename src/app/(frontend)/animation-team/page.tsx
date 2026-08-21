import type { Metadata } from 'next/types'

import { TeamSection } from '@/components/TeamSection/TeamSection'
import { animationTeam } from '@/data/teams'
import { resolveTeamPhotos } from '@/utilities/resolveTeamPhotos'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import React from 'react'

/**
 * Prerendered, then refreshed on a schedule: the portraits come from the media
 * collection, so a page baked at build time keeps whatever the collection held
 * then — an empty one renders every member as initials until the next deploy.
 * Ten minutes, matching the posts and events listings.
 */
export const dynamic = 'force-static'

export const revalidate = 600

export default async function Page() {
  const teamMembers = await resolveTeamPhotos(animationTeam)

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none mb-12">
          <h1>Équipe d’animation</h1>
          <p className="lead">
            Les animateurs et animatrices diplômés qui encadrent nos sorties. Contactez-les pour
            toute question sur une randonnée.
          </p>
        </div>

        <TeamSection teamMembers={teamMembers} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Les animateurs et animatrices diplômés qui encadrent les sorties des Randonnées Touloises.',
  openGraph: mergeOpenGraph({
    url: '/animation-team',
  }),
  title: 'Équipe d’animation',
}
