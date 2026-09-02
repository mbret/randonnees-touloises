import { Button } from '@payloadcms/ui'
import React from 'react'

/**
 * The way into the CSV comparison, sitting above the list of adhérents it
 * concerns rather than in a menu somewhere else.
 *
 * A link and not a form: everything the comparison needs — the file, the season,
 * the confirmation — belongs on its own screen, where there is room to read the
 * report before deciding anything.
 */
export const AdherentsSyncLink: React.FC = () => (
  <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
    <Button buttonStyle="secondary" el="link" size="small" to="/admin/adherents/sync">
      Comparer avec l’export FFRandonnée…
    </Button>
  </div>
)
