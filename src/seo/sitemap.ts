import type { MetadataRoute } from 'next'

import type { Post } from '@/payload-types'

import { isProgramEntry, NEWS_PAGE_SIZE, newsPagePath, postPath } from '@/utilities/postPath'

/** The address `app/sitemap.ts` serves, and so the one to invalidate. */
export const SITEMAP_PATH = '/sitemap.xml'

/**
 * The pages this site serves from a file rather than from a document.
 *
 * Nothing enumerates these for us. next-sitemap reads the build manifest, so it
 * finds only what Next chose to prerender — it misses `/search` for reading
 * searchParams and every post for rendering on demand, while offering `/logout`
 * and `/news/page/1`. Which pages are indexable is not a rendering-strategy
 * question, so the list is written down, and `tests/int/sitemap.int.spec.ts`
 * reads the route files back so a page added later cannot quietly go
 * unadvertised.
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
 * `/[slug]` is enumerated from the `pages` collection and the rest from `posts`;
 * they are named only so the route audit can tell a covered dynamic segment from
 * one nobody has thought about.
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

type SitemapEntry = MetadataRoute.Sitemap[number]

/** A document is only addressable once it has a slug to be addressed by. */
const addressable = <T extends Documented>(doc: T): doc is T & { slug: string } => Boolean(doc.slug)

/** Whoever claims an address first keeps it, so nothing is advertised twice. */
const unique = (entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap => {
  const byUrl = new Map<string, SitemapEntry>()

  for (const entry of entries) if (!byUrl.has(entry.url)) byUrl.set(entry.url, entry)

  return [...byUrl.values()]
}

/**
 * An address that belongs to a route file rather than to a document, so there is
 * nothing to date it by. `lastModified` is omitted rather than stamped with the
 * time of the request: a sitemap that reports a dozen pages as freshly modified
 * on every crawl teaches the crawler to disregard the field for the pages where
 * it is true.
 */
const fileEntry = (siteUrl: string, route: string): SitemapEntry => ({ url: `${siteUrl}${route}` })

const documentEntry = (siteUrl: string, path: string, doc: Documented): SitemapEntry => ({
  url: `${siteUrl}${path}`,
  ...(doc.updatedAt ? { lastModified: doc.updatedAt } : {}),
})

/** Where a `pages` document lives. The home page answers at the root, not at `/home`. */
const pagePath = (page: { slug: string }) => (page.slug === 'home' ? '/' : `/${page.slug}`)

/**
 * Every address this site wants indexed, exactly once.
 *
 * A `pages` document sharing a slug with a route file never renders — Next
 * serves the more specific file — so the files come first and win a collision.
 * Where that file is one we keep out of the index, the document is dropped
 * rather than deduplicated: advertising `/login` because someone happened to
 * slug a page `login` would put a `noindex` page in the sitemap.
 *
 * The Actualités listing paginates the posts without a date, so how many
 * numbered pages it has is a fact about the posts rather than a separate count.
 * Page 1 is `/news`, which is already in the routes above, so the numbering
 * starts at 2 and no address is claimed twice.
 */
export const sitemapEntries = ({
  pages,
  posts,
  siteUrl,
}: {
  pages: Documented[]
  posts: (Documented & Partial<Pick<Post, 'schedule'>>)[]
  siteUrl: string
}): MetadataRoute.Sitemap => {
  const published = posts.filter(addressable)
  const newsPages = Math.ceil(
    published.filter((post) => !isProgramEntry(post)).length / NEWS_PAGE_SIZE,
  )
  const unindexed = new Set<string>(UNINDEXED_ROUTES)

  return unique([
    ...STATIC_ROUTES.map((route) => fileEntry(siteUrl, route)),
    ...pages
      .filter(addressable)
      .filter((page) => !unindexed.has(pagePath(page)))
      .map((page) => documentEntry(siteUrl, pagePath(page), page)),
    ...published.map((post) => documentEntry(siteUrl, postPath(post), post)),
    ...Array.from({ length: Math.max(newsPages - 1, 0) }, (_, index) =>
      fileEntry(siteUrl, newsPagePath(index + 2)),
    ),
  ])
}
