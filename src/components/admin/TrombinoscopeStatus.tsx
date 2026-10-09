import type { BeforeListTableServerProps, Where } from 'payload'

import { Button } from '@payloadcms/ui'
import React from 'react'

import { filteredListHref, TROMBINOSCOPE_FILTERS } from './trombinoscopeFilters'

/**
 * Who is on the trombinoscope, above the list of adhérents, and who is not and
 * why: each count opens the list filtered to those fiches, which is where a
 * portrait is added or « Portrait » ticked.
 */
export const TrombinoscopeStatus = async ({ payload, user }: BeforeListTableServerProps) => {
  const count = async (conditions: Where[]) =>
    (
      await payload.count({
        collection: 'adherents',
        overrideAccess: false,
        user,
        where: { and: conditions },
      })
    ).totalDocs

  const [shown, withoutPortrait, withoutConsent] = await Promise.all([
    count(TROMBINOSCOPE_FILTERS.shown),
    count(TROMBINOSCOPE_FILTERS.withoutPortrait),
    count(TROMBINOSCOPE_FILTERS.withoutConsent),
  ])

  const href = (conditions: Where[]) => filteredListHref(payload.config.routes.admin, conditions)

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '.5rem',
        marginBottom: '1rem',
      }}
    >
      <span>Trombinoscope :</span>
      <Button
        buttonStyle="pill"
        el="link"
        size="small"
        to={href(TROMBINOSCOPE_FILTERS.shown)}
        tooltip="Un portrait sur la fiche et « Portrait » coché dans l’onglet Publication."
      >
        {shown} {shown > 1 ? 'visibles' : 'visible'}
      </Button>
      <Button
        buttonStyle="pill"
        el="link"
        size="small"
        to={href(TROMBINOSCOPE_FILTERS.withoutPortrait)}
        tooltip="Aucun portrait sur la fiche."
      >
        {withoutPortrait} sans portrait
      </Button>
      <Button
        buttonStyle="pill"
        el="link"
        size="small"
        to={href(TROMBINOSCOPE_FILTERS.withoutConsent)}
        tooltip="Un portrait, mais « Portrait » n’est pas coché dans l’onglet Publication."
      >
        {withoutConsent} sans autorisation
      </Button>
    </div>
  )
}
