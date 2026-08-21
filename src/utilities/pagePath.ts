import type { Page } from '@/payload-types'

/**
 * Where a page lives: at its slug, always.
 *
 * The site root is a route file rather than a document, so no slug is special.
 * A page slugged `home` is served from `/home` like any other — the CMS cannot
 * take over `/`, and pretending one slug could was how a document ended up
 * claiming an address it never answers at.
 */
export const pagePath = (page: Pick<Page, 'slug'>) => `/${page.slug}`
