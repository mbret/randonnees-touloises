import type { Where } from 'payload'

import { shownOnTrombinoscope } from '@/blocks/Trombinoscope/toPortraits'

/**
 * Where each adhérent stands with the trombinoscope, as three filters that
 * share the roster between them: every fiche falls in exactly one.
 *
 * « Sans autorisation » takes a box never saved along with an unticked one,
 * since Payload reads `not_equals: true` as anything else, null included.
 */
export const TROMBINOSCOPE_FILTERS: Record<
  'shown' | 'withoutConsent' | 'withoutPortrait',
  Where[]
> = {
  shown: shownOnTrombinoscope.and,
  withoutConsent: [
    { photo: { exists: true } },
    { 'publicationConsent.photo': { not_equals: true } },
  ],
  withoutPortrait: [{ photo: { exists: false } }],
}

/**
 * The adhérents list with those conditions applied, in the shape the list's own
 * filter bar writes to the address — `where[or][0][and][i][field][operator]` —
 * so the filter shows there, to be changed or cleared like any other.
 */
export const filteredListHref = (adminRoute: string, conditions: Where[]) => {
  const params = new URLSearchParams()

  conditions.forEach((condition, index) => {
    for (const [field, operation] of Object.entries(condition)) {
      for (const [operator, value] of Object.entries(operation as Record<string, unknown>)) {
        params.append(`where[or][0][and][${index}][${field}][${operator}]`, String(value))
      }
    }
  })

  return `${adminRoute}/collections/adherents?${params}`
}
