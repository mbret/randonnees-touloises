import React, { Suspense } from 'react'
import { draftMode } from 'next/headers'

import { LivePreviewListener } from './index'

/**
 * Mounts the live-preview listener, but only for a reader who is actually
 * previewing.
 *
 * Whether they are is request-time information, and it is the only such thing
 * left on an article page — so it is read here, behind a boundary of its own,
 * rather than in the page body where it would keep the whole article from being
 * prerendered. There is nothing to show while it resolves and nothing to shift:
 * the listener renders no markup either way.
 */
const DraftModeListener = async () => {
  const { isEnabled } = await draftMode()

  return isEnabled ? <LivePreviewListener /> : null
}

export const DraftPreviewListener = () => (
  <Suspense>
    <DraftModeListener />
  </Suspense>
)
