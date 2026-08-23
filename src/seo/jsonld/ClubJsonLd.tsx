import React from 'react'

import { absoluteUrl } from '../absoluteUrl'
import { clubJsonLd } from './club'
import { getCachedMedias } from '@/metadata/getMedias'
import { JsonLd } from './JsonLd'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * The club, on every page of the site.
 *
 * Sitewide because the publisher of a page is the same whichever page a crawler
 * lands on, and because that is the one node a search engine can use to answer
 * "what is this organisation" without having read the whole site.
 *
 * The logo comes from the same media document the header renders, so the club's
 * mark in the knowledge panel is the mark on the site rather than a second copy
 * to keep in step.
 */
export const ClubJsonLd = async () => {
  const medias = await getCachedMedias()
  const logo = medias.find((media) => media.filename === 'logo.webp')

  return (
    <JsonLd
      data={clubJsonLd({
        logo: logo?.url ? absoluteUrl(getMediaUrl(logo.url, logo.updatedAt)) : undefined,
      })}
    />
  )
}
