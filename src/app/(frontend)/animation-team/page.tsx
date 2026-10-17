import type { Metadata } from 'next/types'

import { TeamSection } from '@/components/TeamSection/TeamSection'
import { servedAt } from '@/seo/servedAt'
import Link from 'next/link'
import React from 'react'

import { getAnimationTeam } from './getAnimationTeam'

/**
 * Prerendered, then refreshed: the list comes from the adhérents' fiches, so a
 * page baked at build time would keep whatever they held then. An edit to a
 * fiche or to a portrait's file refreshes it straight away, through the hooks
 * that refresh /board and /trombinoscope, and so does the CSV sync, which
 * writes through the same hooks. Nothing else writes there with the hooks
 * turned off but the seed, so there is no timer behind them.
 */
export const dynamic = 'force-static'

export default async function Page() {
  const teamMembers = await getAnimationTeam()

  return (
    <div className="page-shell">
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
