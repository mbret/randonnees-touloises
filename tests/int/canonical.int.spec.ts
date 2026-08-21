import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

import type { Page, Post } from '@/payload-types'

import { generateMeta } from '@/seo/generateMeta'
import { servedAt } from '@/seo/servedAt'
import { NEWS_BASE, newsPagePath } from '@/utilities/postPath'

// The helpers read the server URL at call time, so pin it before anything asks
// for an absolute URL.
const SERVER_URL = 'https://abonnes.randonnees-touloises.net'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = SERVER_URL
})

const FRONTEND = join(process.cwd(), 'src', 'app', '(frontend)')

/** Every page the frontend serves, as the route file that answers for it. */
const pageFiles = (dir: string = FRONTEND): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return pageFiles(join(dir, entry.name))

    return entry.name === 'page.tsx' ? [join(dir, entry.name)] : []
  })

describe('servedAt', () => {
  it('points the canonical at the page itself', () => {
    expect(servedAt('/about').alternates).toEqual({ canonical: '/about' })
  })

  it('names the same address in og:url, so the two cannot disagree', () => {
    const meta = servedAt('/about')

    expect(meta.openGraph?.url).toBe(meta.alternates?.canonical)
  })

  it('keeps the open graph defaults the site already sets', () => {
    const openGraph = servedAt('/about').openGraph

    expect(openGraph?.siteName).toBeTruthy()
    expect(openGraph?.images).toBeTruthy()
  })

  it("carries the caller's own open graph fields through", () => {
    const openGraph = servedAt('/news', { description: 'Les actualités.' }).openGraph

    expect(openGraph?.description).toBe('Les actualités.')
    expect(openGraph?.url).toBe('/news')
  })

  it('passes an absolute URL through, which is what the CMS documents hand in', () => {
    expect(servedAt(`${SERVER_URL}/news/marche-breathwalk`).alternates).toEqual({
      canonical: `${SERVER_URL}/news/marche-breathwalk`,
    })
  })
})

describe('canonical coverage', () => {
  /**
   * A page that names no canonical is a page search engines are free to index
   * under whichever address they reached it at. Every route file has to derive
   * its metadata from one of the two helpers that emit one — `servedAt` for a
   * page written as a file, `generateMeta` for one rendered from a document.
   */
  it('leaves no page without a canonical', () => {
    const missing = pageFiles().filter((file) => {
      const source = readFileSync(file, 'utf8')

      return !source.includes('servedAt(') && !source.includes('generateMeta(')
    })

    expect(missing).toEqual([])
  })
})

describe('generateMeta canonical', () => {
  const canonicalOf = async (...args: Parameters<typeof generateMeta>) =>
    (await generateMeta(...args)).alternates?.canonical

  const post = (overrides: Partial<Post>): Partial<Post> => ({
    slug: 'marche-breathwalk',
    meta: { title: 'Marche Breathwalk', description: 'Une sortie.' },
    ...overrides,
  })

  it('points a news post at its own address', async () => {
    expect(await canonicalOf({ collection: 'posts', doc: post({}) })).toBe(
      `${SERVER_URL}/news/marche-breathwalk`,
    )
  })

  it('points a dated post at its programme address', async () => {
    const doc = post({ schedule: { startDate: '2026-09-12T08:00:00.000Z' } })

    expect(await canonicalOf({ collection: 'posts', doc })).toBe(
      `${SERVER_URL}/programs/marche-breathwalk`,
    )
  })

  it('points a page at its own address', async () => {
    const doc: Partial<Page> = { slug: 'qui-sommes-nous' }

    expect(await canonicalOf({ collection: 'pages', doc })).toBe(`${SERVER_URL}/qui-sommes-nous`)
  })

  it('addresses a page slugged home at /home, since the root is a route file', async () => {
    expect(await canonicalOf({ collection: 'pages', doc: { slug: 'home' } })).toBe(
      `${SERVER_URL}/home`,
    )
  })

  it('says the same thing in the canonical and in og:url', async () => {
    const meta = await generateMeta({ collection: 'posts', doc: post({}) })

    expect(meta.alternates?.canonical).toBe(meta.openGraph?.url)
  })

  /**
   * A slug no document answers to renders the 404, and `not-found.tsx` names no
   * metadata of its own, so whatever this returns is what lands in that page's
   * head. A canonical on the site root there would tell a crawler that every
   * address the site does not serve is the home page under another name.
   */
  it('claims no canonical for a document that has no address', async () => {
    expect(await generateMeta({ collection: 'pages', doc: null })).not.toHaveProperty(
      'alternates.canonical',
    )
    expect(
      await generateMeta({ collection: 'posts', doc: { slug: undefined } }),
    ).not.toHaveProperty('alternates.canonical')
  })

  // The share card still needs somewhere to resolve to, so this fallback stays.
  it('keeps the site root as og:url for a document with no address', async () => {
    const meta = await generateMeta({ collection: 'pages', doc: null })

    expect(meta.openGraph?.url).toBe(`${SERVER_URL}/`)
  })
})

describe('the numbered Actualités listing', () => {
  /**
   * `/news/page/1` renders exactly what `/news` renders, so it canonicalises to
   * `/news` rather than competing with it. `newsPagePath` is the one place that
   * rule lives; the route reads its canonical from it.
   */
  it('canonicalises page one onto /news', () => {
    expect(servedAt(newsPagePath(1)).alternates).toEqual({ canonical: NEWS_BASE })
  })

  it('leaves every later page pointing at itself', () => {
    expect(servedAt(newsPagePath(2)).alternates).toEqual({ canonical: '/news/page/2' })
  })

  it('reads that address from the shared helper rather than building its own', () => {
    const route = readFileSync(join(FRONTEND, 'news', 'page', '[pageNumber]', 'page.tsx'), 'utf8')

    expect(route).toContain('newsPagePath(')
    expect(route).not.toContain('`/news/page/${')
  })
})
