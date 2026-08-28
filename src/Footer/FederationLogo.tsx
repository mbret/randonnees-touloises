import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

/**
 * Where the badge lives. Uploaded to the media library rather than committed
 * here — the club is licensed to display the federation's mark, the repository
 * is not — so swapping it is this one line, whatever the new file is called.
 *
 * The `?v` is the cache tag `getMediaUrl` would otherwise stamp from the
 * document's `updatedAt`, written by hand because nothing here reads the
 * document. Media is served `max-age=86400` with a month of
 * stale-while-revalidate behind it, so a badge replaced under the same
 * filename would otherwise take a day to reach anyone: bump this and it
 * lands at once. A badge uploaded under a new name changes the path instead,
 * and needs no bump.
 */
const FEDERATION_LOGO_URL = '/api/media/file/logo-ffr.svg?v=1'

/** Intrinsic size of that file, so the row does not shift as it loads. */
const FEDERATION_LOGO_SIZE = { width: 340, height: 103 }

/**
 * The federation's badge, decorative: it sits inside the link naming the
 * federation, and the wording beside it is what carries the accessible name.
 *
 * `next/image` skips the optimiser by itself for a `.svg` src — the format is
 * already resizable losslessly, and running arbitrary SVG through the
 * optimiser is what `dangerouslyAllowSVG` guards. So this renders as a direct
 * `img` either way, and the intrinsic size above still reserves the box.
 */
export const FederationLogo = ({ className }: { className?: string }) => (
  <Image
    alt=""
    className={clsx('h-12 w-auto object-contain', className)}
    height={FEDERATION_LOGO_SIZE.height}
    src={FEDERATION_LOGO_URL}
    width={FEDERATION_LOGO_SIZE.width}
  />
)
