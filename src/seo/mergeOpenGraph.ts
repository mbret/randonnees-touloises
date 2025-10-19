import type { Metadata } from 'next'
import { getServerSideURL } from '../utilities/getURL'
import { SEO_DESCRIPTION, SEO_IMAGE, SEO_SITE_NAME, SEO_TITLE } from './constants'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: SEO_DESCRIPTION,
  images: [
    {
      url: `${getServerSideURL()}${SEO_IMAGE}`,
    },
  ],
  siteName: SEO_SITE_NAME,
  title: SEO_TITLE,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
