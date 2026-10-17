import { describe, expect, it } from 'vitest'

import { getClientSideURL } from '@/utilities/getURL'
import { sitePathOf } from '@/utilities/sitePath'

describe('sitePathOf', () => {
  it('reads a path as written', () => {
    expect(sitePathOf('/search')).toBe('/search')
    expect(sitePathOf('/admin/collections/pages')).toBe('/admin/collections/pages')
  })

  it('drops the query, the fragment and a trailing slash', () => {
    expect(sitePathOf('/search?q=toul#results')).toBe('/search')
    expect(sitePathOf('/search/')).toBe('/search')
    expect(sitePathOf('/')).toBe('/')
  })

  it("reads the site's own full address as a path on it", () => {
    expect(sitePathOf(`${getClientSideURL()}/admin`)).toBe('/admin')
  })

  it('has no path for a link that leaves the site', () => {
    expect(sitePathOf('https://www.ffrandonnee.fr/admin')).toBeNull()
    expect(sitePathOf('mailto:contact@example.net')).toBeNull()
  })
})
