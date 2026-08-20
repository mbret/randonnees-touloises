import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, screen } from '@testing-library/react'

import { Pagination } from '@/components/Pagination'

afterEach(cleanup)

/** The link for a control, by its accessible name. */
const link = (name: string) => screen.getByRole('link', { name })

const hrefOf = (name: string) => link(name).getAttribute('href')

describe('Pagination', () => {
  it('links every page number it offers', () => {
    render(<Pagination page={3} totalPages={5} />)

    expect(hrefOf('2')).toBe('/news/page/2')
    expect(hrefOf('3')).toBe('/news/page/3')
    expect(hrefOf('4')).toBe('/news/page/4')
  })

  it('marks the current page', () => {
    render(<Pagination page={3} totalPages={5} />)

    expect(link('3').getAttribute('aria-current')).toBe('page')
    expect(link('2').getAttribute('aria-current')).toBeNull()
  })

  it('honours basePath', () => {
    render(<Pagination basePath="/events" page={2} totalPages={3} />)

    expect(hrefOf('2')).toBe('/events/page/2')
  })

  it('renders previous and next as real links when there is somewhere to go', () => {
    render(<Pagination page={2} totalPages={3} />)

    expect(hrefOf('Go to previous page')).toBe('/news/page/1')
    expect(hrefOf('Go to next page')).toBe('/news/page/3')
  })

  it('does not link previous on the first page, nor next on the last', () => {
    render(<Pagination page={1} totalPages={1} />)

    // An inert control is not a link at all, so there is no href to follow and
    // nothing pointing at `/page/0`.
    expect(screen.queryByRole('link', { name: 'Go to previous page' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Go to next page' })).toBeNull()
    expect(document.querySelectorAll('[aria-disabled="true"]')).toHaveLength(2)
    expect(document.body.innerHTML).not.toContain('/page/0')
  })
})
