'use client'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment, Ref } from 'react'
import type { Media as MediaType, Post } from '@/payload-types'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Media } from '../Media'
import { cn } from '../ui/utils'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'>

export const BlogCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo: 'posts' | 'events'
  showCategories?: boolean
  title?: string
  authors?: { name: string; avatarUrl?: string }[]
  media?: MediaType
  publishedAt?: string | null
}> = ({
  doc,
  relationTo,
  showCategories,
  title: titleFromProps,
  authors,
  media,
  publishedAt,
  className,
  ...rest
}) => {
  const { card, link } = useClickableCard({})
  const { slug, categories, meta, title } = doc || {}
  const { description } = meta || {}
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <Card
      className={cn('hover:cursor-pointer pt-0', className)}
      ref={card.ref as Ref<HTMLDivElement>}
      {...rest}
    >
      <CardContent className="relative w-full px-0">
        {!media && <div className="">No image</div>}
        {media && typeof media !== 'string' && (
          <Media
            resource={media}
            imgClassName="aspect-video h-40 md:h-50 rounded-t-md object-cover"
          />
        )}
      </CardContent>
      <CardHeader>
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {publishedAt && (
          <div className="text-muted-foreground text-xs">
            {new Date(publishedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}
        {titleToUse && (
          <CardTitle>
            <Link href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </CardTitle>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </CardHeader>
      <CardFooter>
        {authors?.map((author, index) => (
          <div className="flex items-center gap-2" key={index}>
            <Avatar>
              <AvatarImage src={author.avatarUrl} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{author.name}</span>
              <span className="text-muted-foreground text-xs">Organisateur</span>
            </div>
          </div>
        ))}
      </CardFooter>
    </Card>
  )
}
