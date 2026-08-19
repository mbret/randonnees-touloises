import type { Metadata } from 'next/types'

import { Media } from '@/components/Media'
import { trombinoscope } from '@/data/trombinoscope'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import { getInitials } from '@/utilities/getInitials'
import { getMediaByFilenames } from '@/utilities/getMediaByFilenames'
import React from 'react'

export default async function Page() {
  const portraits = await getMediaByFilenames(trombinoscope.map(({ photo }) => photo))

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mb-12">
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
                      quality={70}
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
  openGraph: mergeOpenGraph({
    title: 'Trombinoscope',
    url: '/trombinoscope',
  }),
  title: 'Trombinoscope',
}
