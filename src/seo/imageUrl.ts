import type { Media, Config } from '../payload-types'

import { absoluteUrl } from './absoluteUrl'
import { SEO_IMAGE } from './constants'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * The picture that represents a document, as an absolute URL.
 *
 * The `og` size is preferred when Payload has generated it, the original stands
 * in when it has not, and the site's own image is the fallback for a document
 * carrying no picture at all — a social card and a structured-data node both
 * read better with an image than without one.
 *
 * Both sizes carry the document's `updatedAt`, the same cache tag the rendered
 * media does: the sizes are regenerated with the original, so one revision
 * addresses them all, and a crawler that cached the card is looking at a URL
 * that no longer exists once the picture is replaced.
 */
export const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    if (ogUrl) return absoluteUrl(getMediaUrl(ogUrl, image.updatedAt))
    if (image.url) return absoluteUrl(getMediaUrl(image.url, image.updatedAt))
  }

  return absoluteUrl(SEO_IMAGE)
}
