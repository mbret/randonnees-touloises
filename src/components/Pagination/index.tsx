import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/components/ui'
import React from 'react'

export const Pagination: React.FC<{
  /** Where the numbered pages live, e.g. `/news` or `/events`. */
  basePath?: string
  className?: string
  page: number
  totalPages: number
}> = (props) => {
  const { basePath = '/news', className, page, totalPages } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  const pageHref = (target: number) => `${basePath}/page/${target}`

  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href={hasPrevPage ? pageHref(page - 1) : undefined} />
          </PaginationItem>

          {hasExtraPrevPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <PaginationLink href={pageHref(page - 1)}>{page - 1}</PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink href={pageHref(page)} isActive>
              {page}
            </PaginationLink>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <PaginationLink href={pageHref(page + 1)}>{page + 1}</PaginationLink>
            </PaginationItem>
          )}

          {hasExtraNextPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext href={hasNextPage ? pageHref(page + 1) : undefined} />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
