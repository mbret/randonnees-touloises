import { Button } from '@payloadcms/ui'
import React from 'react'

/**
 * The way into the roster import, sitting above the list of adhérents it
 * concerns rather than in a menu somewhere else.
 *
 * Named for the task and not for this version of it: the button says
 * « Synchroniser » because that is what the person came to do, and the screen
 * itself is where the report insists on being read first.
 */
export const AdherentsSyncLink: React.FC = () => (
  <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
    <Button buttonStyle="secondary" el="link" size="small" to="/admin/adherents/sync">
      Synchroniser avec l’export CSV…
    </Button>
  </div>
)
