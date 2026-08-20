import { describe, it, expect, beforeAll } from 'vitest'

import type { Page, Post } from '@/payload-types'
import { generateMeta } from '@/seo/generateMeta'

// generateMeta reads the server URL at call time, so pin it before importing
// anything that captures it.
const SERVER_URL = 'https://abonnes.randonnees-touloises.net'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = SERVER_URL
})

const ogUrl = async (...args: Parameters<typeof generateMeta>) => {
  const meta = await generateMeta(...args)

  return meta.openGraph?.url
}

const post = (overrides: Partial<Post>): Partial<Post> => ({
  slug: 'marche-breathwalk',
  meta: { title: 'Marche Breathwalk', description: 'Une sortie.' },
  ...overrides,
})

describe('generateMeta og:url', () => {
  it('points a news post at its own address', async () => {
    expect(await ogUrl({ collection: 'posts', doc: post({}) })).toBe(
      `${SERVER_URL}/news/marche-breathwalk`,
    )
  })

  it('points a dated post at its programme address', async () => {
    const doc = post({ schedule: { startDate: '2026-09-12T08:00:00.000Z' } })

    expect(await ogUrl({ collection: 'posts', doc })).toBe(
      `${SERVER_URL}/programs/marche-breathwalk`,
    )
  })

  it('points a page at its own address', async () => {
    const doc: Partial<Page> = { slug: 'qui-sommes-nous' }

    expect(await ogUrl({ collection: 'pages', doc })).toBe(`${SERVER_URL}/qui-sommes-nous`)
  })

  it('keeps the home page on the site root rather than /home', async () => {
    const doc: Partial<Page> = { slug: 'home' }

    expect(await ogUrl({ collection: 'pages', doc })).toBe(`${SERVER_URL}/`)
  })

  it('falls back to the site root for a document with no slug', async () => {
    expect(await ogUrl({ collection: 'pages', doc: null })).toBe(`${SERVER_URL}/`)
    expect(await ogUrl({ collection: 'posts', doc: { slug: undefined } })).toBe(`${SERVER_URL}/`)
  })
})

describe('generateMeta title', () => {
  const titleOf = async (...args: Parameters<typeof generateMeta>) =>
    (await generateMeta(...args)).title

  it("leaves the document's own title bare for the layout template to brand", async () => {
    expect(await titleOf({ collection: 'posts', doc: post({}) })).toBe('Marche Breathwalk')
  })

  // Next reads an explicit `title: undefined` as an empty title tag, so the key
  // has to be absent for the layout's default to apply.
  it('leaves the key out when the document has no title, so the layout default applies', async () => {
    expect(
      await generateMeta({ collection: 'pages', doc: { slug: 'qui-sommes-nous' } }),
    ).not.toHaveProperty('title')
    expect(await generateMeta({ collection: 'posts', doc: null })).not.toHaveProperty('title')
  })

  it('names no open graph title, so it inherits the branded one', async () => {
    const meta = await generateMeta({ collection: 'posts', doc: post({}) })

    expect(meta.openGraph).not.toHaveProperty('title')
  })
})
