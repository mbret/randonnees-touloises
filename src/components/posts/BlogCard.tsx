'use client'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Ref } from 'react'
import type { Media as MediaType, Post } from '@/payload-types'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Media } from '../Media'
import { cn } from '../ui/utils'
import { postPath } from '@/utilities/postPath'

export type CardPostData = Pick<Post, 'slug' | 'meta' | 'title' | 'heroImage' | 'schedule'>

/**
 * The card's picture is sized by its height rather than the viewport:
 * `aspect-video` against `h-40` (160px), or `h-50` (200px) from `md`, puts its
 * width at 16/9 of whichever applies.
 */
const IMAGE_SIZES = '(min-width: 768px) 356px, 284px'

export const BlogCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  title?: string
  authors?: { name: string; avatarUrl?: string }[]
  media?: MediaType
  publishedAt?: string | null
}> = ({ doc, title: titleFromProps, authors, media, publishedAt, className, ...rest }) => {
  const { card, link } = useClickableCard({})
  const { schedule, slug, meta, title } = doc || {}
  const { description } = meta || {}
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = postPath({ schedule, slug: slug ?? '' })

  return (
    <Card
      className={cn('hover:cursor-pointer pt-0', className)}
      ref={card as Ref<HTMLDivElement>}
      {...rest}
    >
      <CardContent className="relative w-full px-0">
        {media && typeof media !== 'string' && (
          <Media
            resource={media}
            imgClassName="aspect-video h-40 md:h-50 rounded-t-md object-cover"
            size={IMAGE_SIZES}
          />
        )}
      </CardContent>
      <CardHeader>
        {publishedAt && (
          <div className="text-muted-foreground text-xs">
            {new Date(publishedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        )}
        {titleToUse && (
          <CardTitle>
            <Link href={href} ref={link}>
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
