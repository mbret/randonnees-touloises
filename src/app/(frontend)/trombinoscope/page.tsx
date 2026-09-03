import type { Metadata } from 'next/types'

import { Media } from '@/components/Media'
import { trombinoscope } from '@/data/trombinoscope'
import { servedAt } from '@/seo/servedAt'
import { getInitials } from '@/utilities/getInitials'
import { getMediaByFilenames } from '@/utilities/getMediaByFilenames'
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
  const portraits = await getMediaByFilenames(trombinoscope.map(({ photo }) => photo))

  return (
    <div className="page-shell">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none mb-12">
          <h1>Trombinoscope</h1>
          <p className="lead">
            Les visages de l’association : {trombinoscope.length} portraits d’adhérentes et
            d’adhérents.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {trombinoscope.map(({ name, photo }) => {
            const media = portraits.get(photo)

            return (
              <li className="text-center" key={photo}>
                <div className="bg-muted aspect-square overflow-hidden rounded-full">
                  {media ? (
                    <Media
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover object-center"
                      // The portraits render as ~192px circles, so ImageMedia's
                      // default of 100 is wasted bytes. Keep this to a value
                      // `images.qualities` allows: Next coerces an unlisted quality
                      // to the nearest listed one, so the 70 this used to ask for was
                      // already served as 75 — it only added a warning per portrait.
                      quality={75}
                      resource={media}
                      // Without this the shared `sizes` default asks for ~1080px wide
                      // files for a thumbnail that never renders above ~190px.
                      size="(min-width: 1024px) 192px, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground text-3xl font-medium">
                        {getInitials(name)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 font-medium">{name}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Le trombinoscope des Randonnées Touloises : les visages des adhérentes et adhérents de l’association.',
  ...servedAt('/trombinoscope'),
  title: 'Trombinoscope',
}
