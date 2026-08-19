import type { Metadata } from 'next/types'

import { Media } from '@/components/Media'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

/**
 * The portraits are the media imported by scripts/import-trombinoscope.ts, found
 * by their filename prefix: the gallery collection has no album field yet, so
 * there is nothing else to group them by. Swap this query for a relationship
 * once the CMS can express "this media belongs to the trombinoscope".
 */
const PORTRAIT_PREFIX = 'trombinoscope-'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    pagination: false,
    sort: 'alt',
    where: { filename: { like: PORTRAIT_PREFIX } },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mb-12">
          <h1>Trombinoscope</h1>
          <p className="lead">
            {docs.length > 0
              ? `Les visages de l’association : ${docs.length} portraits d’adhérentes et d’adhérents.`
              : 'Les portraits des adhérentes et adhérents seront publiés ici prochainement.'}
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {docs.map((doc) => (
            <li className="text-center" key={doc.id}>
              <div className="bg-muted aspect-square overflow-hidden rounded-full">
                <Media
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover object-center"
                  quality={70}
                  resource={doc}
                  // Without this the shared `sizes` default asks for ~1080px wide
                  // files for a thumbnail that never renders above ~190px.
                  size="(min-width: 1024px) 192px, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              </div>
              <p className="mt-3 font-medium">{doc.alt}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Le trombinoscope des Randonnées Touloises : les visages des adhérentes et adhérents de l’association.',
  openGraph: mergeOpenGraph({
    title: 'Trombinoscope',
    url: '/trombinoscope',
  }),
  title: 'Trombinoscope',
}
