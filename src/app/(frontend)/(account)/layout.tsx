import type { ReactNode } from 'react'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RenderParams } from '@/components/common/RenderParams/RenderParams'
// import { AccountNav } from '@/components/AccountNav'

/**
 * The account area is behind a session: it reads the auth cookie and redirects
 * before anything renders, so there is no shell worth prefetching and the
 * navigation is allowed to block on the server.
 */
export const instant = false

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div>
      <div className="container">
        <RenderParams className="" />
      </div>

      <div className="container mt-16 pb-8 flex gap-8">
        {/* {user && (
          <AccountNav className="max-w-62 grow flex-col items-start gap-4 hidden md:flex" />
        )} */}

        <div className="flex flex-col gap-12 grow">{children}</div>
      </div>
    </div>
  )
}
