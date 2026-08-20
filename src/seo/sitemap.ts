import type { Post } from '@/payload-types'

import { isProgramEntry, NEWS_PAGE_SIZE, newsPagePath, postPath } from '@/utilities/postPath'

/** One `<url>` of a sitemap, in the shape next-sitemap serialises. */
export type SitemapEntry = {
  loc: string
  lastmod?: string
}

/**
 * The pages this site serves from a file rather than from a document.
 *
 * `pages-sitemap.xml` used to be built from the Payload `pages` collection
 * alone, which left a page living in `src/app/(frontend)` invisible to it — and
 * that is nearly every page here. Listing them is what makes the sitemap
 * describe the actual site; `tests/int/sitemap.int.spec.ts` reads the route
 * files back, so a page added later cannot quietly go unadvertised.
 */
export const STATIC_ROUTES = [
  '/',
  '/about',
  '/activities',
  '/animation-team',
  '/board',
  '/contact',
  '/news',
  '/privacy',
  '/programs',
  '/search',
  '/terms',
  '/trombinoscope',
] as const

/**
 * Pages deliberately left out: the members' area and the forms that lead into it
 * have nothing a crawler can reach, and `/logout` is an action rather than a
 * page.
 */
export const UNINDEXED_ROUTES = ['/account', '/create-account', '/login', '/logout'] as const

/**
 * Pages whose addresses come from a document, so no list here can name them.
 * `/[slug]` is enumerated by the `pages` query below and the rest by the posts
 * query; they are named only so the route audit can tell a covered dynamic
 * segment from one nobody has thought about.
 */
export const DYNAMIC_ROUTES = [
  '/[slug]',
  '/news/[slug]',
  '/news/page/[pageNumber]',
  '/programs/[slug]',
] as const

type Documented = {
  slug?: string | null
  updatedAt?: string | null
}

/** A document is only addressable once it has a slug to be addressed by. */
const addressable = <T extends Documented>(doc: T): doc is T & { slug: string } => Boolean(doc.slug)

/** Whoever claims an address first keeps it, so nothing is advertised twice. */
const unique = (entries: SitemapEntry[]): SitemapEntry[] => {
  const byLoc = new Map<string, SitemapEntry>()

  for (const entry of entries) if (!byLoc.has(entry.loc)) byLoc.set(entry.loc, entry)

  return [...byLoc.values()]
}

/**
 * An address that belongs to a route file rather than to a document, so there is
 * nothing to date it by. `lastmod` is omitted rather than stamped with the time
 * of the request: a sitemap that reports a dozen pages as freshly modified on
 * every crawl teaches the crawler to disregard the field for the pages where it
 * is true.
 */
const fileEntry = (siteUrl: string, route: string): SitemapEntry => ({ loc: `${siteUrl}${route}` })

const documentEntry = (siteUrl: string, path: string, doc: Documented): SitemapEntry => ({
  loc: `${siteUrl}${path}`,
  ...(doc.updatedAt ? { lastmod: doc.updatedAt } : {}),
})

/**
 * Every page of the site that is not a post: the routes above and the CMS
 * documents behind `/[slug]`.
 *
 * The files come first and so win a collision. A `pages` document sharing a slug
 * with one of them never renders — Next serves the more specific file — so the
 * address belongs to the file, and the document is the entry to drop.
 */
export const pagesSitemapEntries = ({
  docs,
  siteUrl,
}: {
  docs: Documented[]
  siteUrl: string
}): SitemapEntry[] =>
  unique([
    ...STATIC_ROUTES.map((route) => fileEntry(siteUrl, route)),
    ...docs
      .filter(addressable)
      .map((doc) => documentEntry(siteUrl, doc.slug === 'home' ? '/' : `/${doc.slug}`, doc)),
  ])

/**
 * Every address the `posts` collection owns: one per post, plus the numbered
 * pages of the Actualités listing.
 *
 * The listing paginates the posts without a date, so its length is a fact about
 * this same query rather than a separate count. Page 1 is `/news`, a route file
 * carried by the pages sitemap, so the numbering starts at 2 and neither sitemap
 * repeats the other.
 */
export const postsSitemapEntries = ({
  posts,
  siteUrl,
}: {
  posts: (Documented & Partial<Pick<Post, 'schedule'>>)[]
  siteUrl: string
}): SitemapEntry[] => {
  const published = posts.filter(addressable)
  const newsPages = Math.ceil(
    published.filter((post) => !isProgramEntry(post)).length / NEWS_PAGE_SIZE,
  )

  return unique([
    ...published.map((post) => documentEntry(siteUrl, postPath(post), post)),
    ...Array.from({ length: Math.max(newsPages - 1, 0) }, (_, index) =>
      fileEntry(siteUrl, newsPagePath(index + 2)),
    ),
  ])
}
