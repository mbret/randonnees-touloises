import type { Metadata } from 'next'

import type { Page, Post } from '../payload-types'

import { absoluteUrl } from './absoluteUrl'
import { getImageURL } from './imageUrl'
import { mergeOpenGraph } from './mergeOpenGraph'
import { pagePath } from '../utilities/pagePath'
import { postPath } from '../utilities/postPath'
import { SEO_TITLE } from './constants'

/**
 * The document a page's metadata describes, tagged with the collection it came
 * from. The tag is what makes the address derivable: posts and pages live under
 * different namespaces, and nothing on the document itself says which is which.
 */
type MetaSource =
  | { collection: 'pages'; doc: Partial<Page> | null }
  | { collection: 'posts'; doc: Partial<Post> | null }

/**
 * The document's own address. A document without a slug has no address of its
 * own yet — a draft being previewed, or the static home fallback — so it falls
 * back to the site root.
 */
const getDocumentURL = ({ collection, doc }: MetaSource) => {
  if (!doc?.slug) return absoluteUrl('/')

  const path =
    collection === 'posts'
      ? postPath({ schedule: doc.schedule, slug: doc.slug })
      : pagePath({ slug: doc.slug })

  return absoluteUrl(path)
}

export const generateMeta = async (args: MetaSource): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | ' + SEO_TITLE : SEO_TITLE

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: getDocumentURL(args),
    }),
    title,
  }
}
