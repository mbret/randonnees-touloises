import React, { Suspense } from 'react'
import { draftMode } from 'next/headers'

import { AdminBar } from './AdminBar'

/**
 * Whether the reader is in preview mode is request-time information, and the
 * root layout wraps every page — so reading it there would keep every route in
 * the site out of its own static shell.
 *
 * Behind a boundary instead, with nothing for a fallback. That costs no layout
 * shift: the bar renders `null` until the auth provider has found a logged-in
 * user, so for everyone else there was never anything here to wait for.
 */
const DraftModeAdminBar = async () => {
  const { isEnabled } = await draftMode()

  return <AdminBar adminBarProps={{ preview: isEnabled }} />
}

export const PreviewAdminBar = () => (
  <Suspense>
    <DraftModeAdminBar />
  </Suspense>
)
