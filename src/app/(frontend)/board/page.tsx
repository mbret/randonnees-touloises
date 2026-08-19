import type { Metadata } from 'next/types'

import { TeamSection } from '@/components/TeamSection/TeamSection'
import { boardMembers } from '@/data/teams'
import { resolveTeamPhotos } from '@/utilities/resolveTeamPhotos'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import React from 'react'

export default async function Page() {
  const teamMembers = await resolveTeamPhotos(boardMembers)

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mb-12">
          <h1>Conseil d’administration</h1>
          <p className="lead">L’équipe qui administre l’association.</p>
        </div>

        <TeamSection teamMembers={teamMembers} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Les membres du conseil d’administration de l’association Randonnées Touloises et leurs fonctions.',
  openGraph: mergeOpenGraph({
    title: 'Conseil d’administration',
    url: '/board',
  }),
  title: 'Conseil d’administration',
}
