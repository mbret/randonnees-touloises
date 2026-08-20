import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  DYNAMIC_ROUTES,
  STATIC_ROUTES,
  UNINDEXED_ROUTES,
  pagesSitemapEntries,
  postsSitemapEntries,
} from '@/seo/sitemap'
import { NEWS_PAGE_SIZE } from '@/utilities/postPath'

const FRONTEND = join(process.cwd(), 'src', 'app', '(frontend)')
const SITE = 'https://example.test'

/** Every page the frontend serves, as the address a reader would type. */
const servedRoutes = (dir: string = FRONTEND, segments: string[] = []): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      // A route group parenthesises its name and contributes nothing to the URL.
      const nested = entry.name.startsWith('(') ? segments : [...segments, entry.name]

      return servedRoutes(join(dir, entry.name), nested)
    }

    return entry.name === 'page.tsx' ? [`/${segments.join('/')}`] : []
  })

const locs = (entries: { loc: string }[]) => entries.map((entry) => entry.loc)

const post = (slug: string, startDate?: string) => ({
  slug,
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...(startDate ? { schedule: { startDate } } : {}),
})

describe('sitemap route coverage', () => {
  const served = servedRoutes()
  const declared: readonly string[] = [...STATIC_ROUTES, ...UNINDEXED_ROUTES, ...DYNAMIC_ROUTES]

  it('accounts for every page the frontend serves', () => {
    expect(served.filter((route) => !declared.includes(route)).sort()).toEqual([])
  })

  it('claims no route the frontend does not serve', () => {
    expect(declared.filter((route) => !served.includes(route)).sort()).toEqual([])
  })

  it('decides each route once', () => {
    expect(declared).toHaveLength(new Set(declared).size)
  })
})

describe('pagesSitemapEntries', () => {
  it('advertises every page that is a file rather than a document', () => {
    expect(locs(pagesSitemapEntries({ docs: [], siteUrl: SITE }))).toEqual([
      `${SITE}/`,
      `${SITE}/about`,
      `${SITE}/activities`,
      `${SITE}/animation-team`,
      `${SITE}/board`,
      `${SITE}/contact`,
      `${SITE}/news`,
      `${SITE}/privacy`,
      `${SITE}/programs`,
      `${SITE}/search`,
      `${SITE}/terms`,
      `${SITE}/trombinoscope`,
    ])
  })

  it('adds the CMS pages and dates them by the document', () => {
    const entries = pagesSitemapEntries({
      docs: [{ slug: 'histoire', updatedAt: '2026-02-03T00:00:00.000Z' }],
      siteUrl: SITE,
    })

    expect(entries).toContainEqual({
      loc: `${SITE}/histoire`,
      lastmod: '2026-02-03T00:00:00.000Z',
    })
  })

  it('gives the CMS home page the root address', () => {
    const entries = pagesSitemapEntries({ docs: [{ slug: 'home' }], siteUrl: SITE })

    expect(locs(entries).filter((loc) => loc === `${SITE}/`)).toHaveLength(1)
  })

  it('drops a document shadowed by a route file rather than listing it twice', () => {
    const entries = pagesSitemapEntries({
      docs: [{ slug: 'about', updatedAt: '2026-02-03T00:00:00.000Z' }],
      siteUrl: SITE,
    })

    expect(entries.filter((entry) => entry.loc === `${SITE}/about`)).toEqual([
      { loc: `${SITE}/about` },
    ])
  })

  it('no longer advertises the retired /posts archive', () => {
    expect(locs(pagesSitemapEntries({ docs: [], siteUrl: SITE }))).not.toContain(`${SITE}/posts`)
  })
})

describe('postsSitemapEntries', () => {
  it('addresses a post by the section its date puts it in', () => {
    const entries = postsSitemapEntries({
      posts: [post('assemblee-generale'), post('sortie-du-dimanche', '2026-03-01T00:00:00.000Z')],
      siteUrl: SITE,
    })

    expect(locs(entries)).toEqual([
      `${SITE}/news/assemblee-generale`,
      `${SITE}/programs/sortie-du-dimanche`,
    ])
  })

  it('skips a post with no slug to be addressed by', () => {
    expect(locs(postsSitemapEntries({ posts: [{ slug: null }], siteUrl: SITE }))).toEqual([])
  })

  it('leaves the numbered pages out while the listing fits on one', () => {
    const posts = Array.from({ length: NEWS_PAGE_SIZE }, (_, index) => post(`news-${index}`))

    expect(locs(postsSitemapEntries({ posts, siteUrl: SITE }))).not.toContain(`${SITE}/news/page/2`)
  })

  it('advertises the numbered pages from 2, since page 1 is /news', () => {
    const posts = Array.from({ length: NEWS_PAGE_SIZE * 2 + 1 }, (_, index) =>
      post(`news-${index}`),
    )
    const pages = locs(postsSitemapEntries({ posts, siteUrl: SITE })).filter((loc) =>
      loc.includes('/news/page/'),
    )

    expect(pages).toEqual([`${SITE}/news/page/2`, `${SITE}/news/page/3`])
  })

  it('counts only the posts the listing paginates', () => {
    const posts = [
      ...Array.from({ length: NEWS_PAGE_SIZE }, (_, index) => post(`news-${index}`)),
      ...Array.from({ length: NEWS_PAGE_SIZE }, (_, index) =>
        post(`program-${index}`, '2026-03-01T00:00:00.000Z'),
      ),
    ]

    expect(locs(postsSitemapEntries({ posts, siteUrl: SITE }))).not.toContain(`${SITE}/news/page/2`)
  })
})
