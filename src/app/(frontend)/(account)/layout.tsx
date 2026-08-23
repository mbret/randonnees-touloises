import type { ReactNode } from 'react'

import { RenderParams } from '@/components/common/RenderParams/RenderParams'
// import { AccountNav } from '@/components/AccountNav'

/**
 * The `user` this used to resolve went to an `AccountNav` that is commented out,
 * so the layout authenticated the request and did nothing with the answer. Left
 * in, it would have to sit behind a boundary of its own for no visible reason —
 * the page below already authenticates for itself.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
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
