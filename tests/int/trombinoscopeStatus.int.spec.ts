import { describe, expect, it } from 'vitest'

import { shownOnTrombinoscope } from '@/blocks/Trombinoscope/toPortraits'
import { filteredListHref, TROMBINOSCOPE_FILTERS } from '@/components/admin/trombinoscopeFilters'

const paramsOf = (href: string) => [...new URL(href, 'https://example.org').searchParams.entries()]

describe('the trombinoscope counts above the adhérents list', () => {
  /** Counted with the block's own rule, so the number is the one the page shows. */
  it('counts as visible exactly what the block reads', () => {
    expect(TROMBINOSCOPE_FILTERS.shown).toBe(shownOnTrombinoscope.and)
  })

  it('opens the list with the filter in the shape its filter bar writes', () => {
    const href = filteredListHref('/admin', TROMBINOSCOPE_FILTERS.withoutConsent)

    expect(href.startsWith('/admin/collections/adherents?')).toBe(true)
    expect(paramsOf(href)).toEqual([
      ['where[or][0][and][0][photo][exists]', 'true'],
      ['where[or][0][and][1][publicationConsent.photo][not_equals]', 'true'],
    ])
  })

  it('follows the admin route the config sets', () => {
    expect(filteredListHref('/gestion', TROMBINOSCOPE_FILTERS.withoutPortrait)).toMatch(
      /^\/gestion\/collections\/adherents\?/,
    )
  })
})
