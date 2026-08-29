import type { ReactNode } from 'react'

import { RenderParams } from '@/components/common/RenderParams/RenderParams'

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="container">
        <RenderParams className="" />
      </div>

      <div className="container mt-16 pb-8 flex gap-8">
        <div className="flex flex-col gap-12 grow">{children}</div>
      </div>
    </div>
  )
}
