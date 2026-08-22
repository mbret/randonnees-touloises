import { HeaderClient } from './Header.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCachedPageNavItems } from './pageNavItems'
import { withStaticNavItems } from './staticNavItems'

export async function Header() {
  /* Merged on the server so the two nav components render a list rather than
   * each rebuilding the same one, and so the Header global stays off the wire. */
  const [headerData, pageNavItems] = await Promise.all([
    getCachedGlobal('header', 1),
    getCachedPageNavItems(),
  ])

  return <HeaderClient navItems={withStaticNavItems(headerData?.navItems, pageNavItems)} />
}
