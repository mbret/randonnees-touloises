import type { Page, Post } from '@/payload-types'
import type { JsonLdNode } from './serialize'

import { absoluteUrl } from '../absoluteUrl'
import { HOME_SLUG, pagePath } from '@/utilities/pagePath'
import { isProgramEntry, NEWS_BASE, postPath, PROGRAMS_BASE } from '@/utilities/postPath'

/** One step of a trail: what the site calls it, and where it lives. */
export type Crumb = { name: string; path: string }

/**
 * The sections a document can sit under, named as the pages themselves name
 * them — a crumb reading « Actualités » that leads to a page titled anything
 * else is worse than no crumb at all.
 */
const HOME: Crumb = { name: 'Accueil', path: '/' }
const PROGRAMS: Crumb = { name: 'Programme hebdomadaire', path: PROGRAMS_BASE }
const NEWS: Crumb = { name: 'Actualités', path: NEWS_BASE }

/**
 * The trail to a post: the section it is addressed under, which is the same
 * decision `postPath` makes, so the crumbs and the URL can never disagree.
 */
export const postTrail = (post: Pick<Post, 'slug' | 'title' | 'schedule'>): Crumb[] => [
  HOME,
  isProgramEntry(post) ? PROGRAMS : NEWS,
  { name: post.title, path: postPath(post) },
]

/**
 * The trail to a page. Pages are flat — every one of them is a child of the
 * root — and the home page is the root, so it has no trail of its own.
 */
export const pageTrail = (page: Pick<Page, 'slug' | 'title'>): Crumb[] =>
  page.slug === HOME_SLUG ? [HOME] : [HOME, { name: page.title, path: pagePath(page) }]

/**
 * A trail as a `BreadcrumbList`, or nothing when there is no trail to show: a
 * single crumb is the page saying it is itself, which Google rejects and no
 * reader would have learnt anything from.
 */
export const breadcrumbJsonLd = (trail: Crumb[]): JsonLdNode | null => {
  if (trail.length < 2) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}
