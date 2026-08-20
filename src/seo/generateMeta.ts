import type { Metadata } from 'next'

import type { Page, Post } from '../payload-types'

import { absoluteUrl } from './absoluteUrl'
import { getImageURL } from './imageUrl'
import { servedAt } from './servedAt'
import { pagePath } from '../utilities/pagePath'
import { postPath } from '../utilities/postPath'

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
  const title = doc?.meta?.title

  return {
    description: doc?.meta?.description,
    // A document is reachable at exactly one address, so the canonical it
    // points at itself with is the same one `og:url` names.
    ...servedAt(getDocumentURL(args), {
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
    }),
    // Bare on purpose: the root layout's title template appends the site name.
    // A document with no title of its own leaves the key out altogether rather
    // than setting it to `undefined`, which Next reads as an empty title tag
    // instead of a fallback to the layout's default.
    ...(title ? { title } : {}),
  }
}
