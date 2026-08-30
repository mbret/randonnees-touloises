import * as React from 'react'

const MOBILE_BREAKPOINT = 768

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY)

  mql.addEventListener('change', onStoreChange)

  return () => mql.removeEventListener('change', onStoreChange)
}

/**
 * The media query is an external store, so read it as one. Subscribing by hand
 * meant seeding the answer with a `setState` in the effect body — a second
 * render on every mount, and one render in between where a mobile viewport
 * still claimed not to be one.
 *
 * The server has no viewport to measure and renders the desktop layout, which
 * is what `false` says here; the first client render says the same, so
 * hydration matches, and React re-renders with the real answer immediately
 * after.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  )
}
