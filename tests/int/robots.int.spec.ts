import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'
import { sitemapEntries } from '@/seo/sitemap'

const SITE = 'https://example.test'

const disallowed = [robots().rules].flat().flatMap(({ disallow }) => [disallow ?? []].flat())

describe('robots.txt', () => {
  it('keeps crawlers off the admin and the search page', () => {
    expect(disallowed).toEqual(expect.arrayContaining(['/admin', '/search']))
  })

  it('disallows nothing the sitemap advertises', () => {
    const entries = sitemapEntries({
      pages: [{ slug: 'histoire' }, { slug: 'search' }],
      posts: [{ slug: 'assemblee-generale' }],
      siteUrl: SITE,
    })

    const blocked = entries
      .map(({ url }) => new URL(url).pathname)
      .filter((path) => disallowed.some((prefix) => path.startsWith(prefix)))

    expect(blocked).toEqual([])
  })
})
