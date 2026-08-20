import type { Page } from '@/payload-types'

/**
 * Where a page lives.
 *
 * One page owns the site root: the `home` slug is served from `/`, not from
 * `/home`, so that address is the one every link, sitemap entry and social tag
 * has to agree on. Every other page is its slug.
 */
export const HOME_SLUG = 'home'

export const pagePath = (page: Pick<Page, 'slug'>) =>
  page.slug === HOME_SLUG ? '/' : `/${page.slug}`
