import type { Metadata } from 'next/types'

import { TeamSection } from '@/components/TeamSection/TeamSection'
import { animationTeam } from '@/data/teams'
import { resolveTeamPhotos } from '@/utilities/resolveTeamPhotos'
import { servedAt } from '@/seo/servedAt'
import Link from 'next/link'
import React from 'react'

/**
 * Names and order come from `src/data`; only the portraits come from the media
 * collection, and `getMediaByFilenames` caches that lookup — so this page
 * prerenders whole and refreshes on that reader's window rather than on one of
 * its own.
 */
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
          <p>
            Vous aimeriez en faire partie ? <Link href="/devenir-animateur">Nous recrutons</Link> —
            aucune expérience exigée.
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
  ...servedAt('/animation-team'),
  title: 'Équipe d’animation',
}
