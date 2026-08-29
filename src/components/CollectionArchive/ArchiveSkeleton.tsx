import React from 'react'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Stands in for a grid of post cards while it streams, on the same grid as
 * `CollectionArchive` so the placeholder occupies the space the cards will.
 */
export const ArchiveSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => {
  return (
    <div className="container" aria-busy="true">
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
        {Array.from({ length: cards }).map((_, index) => (
          <div className="col-span-4" key={index}>
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
