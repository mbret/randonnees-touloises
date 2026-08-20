import type { Post } from '@/payload-types'

/**
 * Where a post lives.
 *
 * One collection, two namespaces: a post carrying a date is a programme entry
 * and belongs under `/programs`, a post without one is news and belongs under
 * `/news`. The same `schedule.startDate` that decides which section lists it
 * decides which URL is its own, so a reader who arrives from the programme stays
 * in the programme, and every document still has exactly one address.
 *
 * The other namespace redirects rather than rendering, so an entry that gains or
 * loses a date keeps its old links working.
 */
export const NEWS_BASE = '/news'
export const PROGRAMS_BASE = '/programs'

type Addressable = Pick<Post, 'slug'> & Partial<Pick<Post, 'schedule'>>

export const isProgramEntry = (post: Partial<Pick<Post, 'schedule'>>) =>
  Boolean(post.schedule?.startDate)

export const postPath = (post: Addressable) =>
  `${isProgramEntry(post) ? PROGRAMS_BASE : NEWS_BASE}/${post.slug}`

/**
 * How many posts a page of the Actualités listing holds.
 *
 * The listing, its numbered pages and the sitemap each have to divide the posts
 * the same way or they disagree about how many pages exist — which is how the
 * sitemap ends up advertising a page the listing never fills.
 */
export const NEWS_PAGE_SIZE = 12

/** Where a page of the Actualités listing lives. Page 1 is `/news` itself. */
export const newsPagePath = (pageNumber: number) =>
  pageNumber > 1 ? `${NEWS_BASE}/page/${pageNumber}` : NEWS_BASE
