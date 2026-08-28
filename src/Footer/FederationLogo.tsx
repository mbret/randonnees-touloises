import clsx from 'clsx'
import React from 'react'

/**
 * Where the badge lives. Uploaded to the media library rather than committed
 * here — the club is licensed to display the federation's mark, the repository
 * is not — so swapping it is this one line, whatever the new file is called.
 */
const FEDERATION_LOGO_URL = '/api/media/file/logo-ffr.svg'

/** Intrinsic size of that file, so the row does not shift as it loads. */
const FEDERATION_LOGO_SIZE = { width: 340, height: 103 }

/**
 * The federation's badge, decorative: it sits inside the link naming the
 * federation, and the wording beside it is what carries the accessible name.
 */
export const FederationLogo = ({ className }: { className?: string }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img
    alt=""
    className={clsx('h-12 w-auto object-contain', className)}
    decoding="async"
    height={FEDERATION_LOGO_SIZE.height}
    loading="lazy"
    src={FEDERATION_LOGO_URL}
    width={FEDERATION_LOGO_SIZE.width}
  />
)
