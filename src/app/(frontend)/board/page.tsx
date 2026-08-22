import type { Metadata } from 'next/types'

import { TeamSection } from '@/components/TeamSection/TeamSection'
import { boardMembers } from '@/data/teams'
import { resolveTeamPhotos } from '@/utilities/resolveTeamPhotos'
import { servedAt } from '@/seo/servedAt'
import React from 'react'

/**
 * Names and order come from `src/data`; only the portraits come from the media
 * collection, and `getMediaByFilenames` caches that lookup — so this page
 * prerenders whole and refreshes on that reader's window rather than on one of
 * its own.
 */
export default async function Page() {
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
