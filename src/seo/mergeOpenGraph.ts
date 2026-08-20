import type { Metadata } from 'next'
import { getServerSideURL } from '../utilities/getURL'
import { SEO_DESCRIPTION, SEO_IMAGE, SEO_SITE_NAME } from './constants'

/**
 * No title: Next fills an open graph title left empty from the page's own
 * resolved title, which the root layout has already branded. Naming one here
 * would be a second place the rule lives, and the two would drift.
 */
const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: SEO_DESCRIPTION,
  images: [
    {
      url: `${getServerSideURL()}${SEO_IMAGE}`,
    },
  ],
  siteName: SEO_SITE_NAME,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
