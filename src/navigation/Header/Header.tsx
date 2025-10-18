import { HeaderClient } from './Header.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import React from 'react'

import type { Header } from '@/payload-types'
import { getPayload } from 'payload'

export async function Header() {
  // const payload = await getPayload({ config: configPromise })
  const headerData: Header = await getCachedGlobal('header', 1)()
  // const { docs } = await payload.find({
  //   collection: 'media',
  //   where: {
  //     filename: {
  //       equals: 'logo.webp',
  //     },
  //   },
  // })
  // const logo = docs[0]

  return <HeaderClient data={headerData} />
}
