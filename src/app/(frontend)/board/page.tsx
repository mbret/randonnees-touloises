import type { Metadata } from 'next/types'

import { TeamSection } from '@/components/TeamSection/TeamSection'
import { boardMembers } from '@/data/teams'
import { resolveTeamPhotos } from '@/utilities/resolveTeamPhotos'
import { servedAt } from '@/seo/servedAt'
import { cacheLife } from 'next/cache'
import React from 'react'

/**
 * Prerendered, then refreshed on a schedule: the portraits come from the media
 * collection, so a page baked at build time keeps whatever the collection held
 * then — an empty one renders every member as initials until the next deploy.
 * Ten minutes, matching the posts and events listings.
 */
export default async function Page() {
  'use cache'
  cacheLife('tenMinutes')

  const teamMembers = await resolveTeamPhotos(boardMembers)

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none mb-12">
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
  ...servedAt('/board'),
  title: 'Conseil d’administration',
}
