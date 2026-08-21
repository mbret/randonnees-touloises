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
 * The document's own address, or nothing when it has none: a draft being
 * previewed before it is given a slug, or a slug no document answers to, which
 * is on its way to a 404.
 */
const getDocumentURL = ({ collection, doc }: MetaSource) => {
  if (!doc?.slug) return null

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

  /**
   * A document reachable at an address of its own points both its canonical and
   * its `og:url` at it, so the two cannot name different pages.
   *
   * A document with no address keeps the site root as an `og:url`, so a shared
   * card still resolves somewhere, but claims no canonical at all. A missing
   * slug renders the 404, and a canonical there would tell a crawler that every
   * address the site does not serve is the home page under another name.
   */
  const url = getDocumentURL(args)
  const address = servedAt(url ?? absoluteUrl('/'), {
    description: doc?.meta?.description || '',
    images: ogImage
      ? [
          {
            url: ogImage,
          },
        ]
      : undefined,
  })

  return {
    description: doc?.meta?.description,
    ...(url ? address : { openGraph: address.openGraph }),
    // Bare on purpose: the root layout's title template appends the site name.
    // A document with no title of its own leaves the key out altogether rather
    // than setting it to `undefined`, which Next reads as an empty title tag
    // instead of a fallback to the layout's default.
    ...(title ? { title } : {}),
  }
}
