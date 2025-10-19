import { cn } from '@/components/ui'
import React from 'react'

import { PostCard, CardPostData } from '@/components/posts/PostCard'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'events'
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, relationTo = 'posts' } = props

  return (
    <>
      <div className={cn('container')}>
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
            {posts?.map((result, index) => {
              if (typeof result === 'object' && result !== null) {
                return (
                  <div className="col-span-4" key={index}>
                    <PostCard
                      className="h-full"
                      doc={result}
                      relationTo={relationTo}
                      showCategories
                    />
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      </div>
    </>
  )
}
