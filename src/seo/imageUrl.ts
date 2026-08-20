import type { Media, Config } from '../payload-types'

import { absoluteUrl } from './absoluteUrl'
import { SEO_IMAGE } from './constants'

/**
 * The picture that represents a document, as an absolute URL.
 *
 * The `og` size is preferred when Payload has generated it, the original stands
 * in when it has not, and the site's own image is the fallback for a document
 * carrying no picture at all — a social card and a structured-data node both
 * read better with an image than without one.
 */
export const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    if (ogUrl) return absoluteUrl(ogUrl)
    if (image.url) return absoluteUrl(image.url)
  }

  return absoluteUrl(SEO_IMAGE)
}
