import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'

import type { GlobalPage } from '@/payload-types'

let pathname = '/'

vi.mock('next/navigation', () => ({ usePathname: () => pathname }))
vi.mock('@/providers/auth', () => ({ useAuth: () => ({ user: null }) }))

/* Both anchors reach the DOM as `<a href>`, so the router's is marked: what
 * these tests are about is which of the two renders, not what it points at. */
vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a data-router="" {...props}>
      {children}
    </a>
  ),
}))

const { CMSLink } = await import('@/components/Link')

const globalPage = (slug: string): GlobalPage => ({
  id: 6,
  name: 'agenda',
  slug,
  createdAt: '2026-09-20T09:00:00.000Z',
  updatedAt: '2026-09-21T21:45:00.000Z',
})

const anchor = (element: React.ReactElement) => {
  render(element)

  const link = screen.getByRole('link')

  return { href: link.getAttribute('href'), routed: link.hasAttribute('data-router') }
}

afterEach(cleanup)

describe('CMSLink', () => {
  it('routes an address on another page', () => {
    pathname = '/'

    expect(anchor(<CMSLink label="Contact" type="custom" url="/contact" />)).toEqual({
      href: '/contact',
      routed: true,
    })
  })

  it('routes a fragment on a page the reader is not on', () => {
    pathname = '/contact'

    expect(anchor(<CMSLink label="Nos sorties" type="custom" url="/#agenda" />)).toEqual({
      href: '/#agenda',
      routed: true,
    })
  })

  /* The router, asked to navigate to the URL it is already showing, does
   * nothing at all — so a reader who follows this link, scrolls back up and
   * presses it again would stay where they are. */
  it('hands the browser a fragment on the page already being read', () => {
    pathname = '/'

    expect(anchor(<CMSLink label="Nos sorties" type="custom" url="/#agenda" />)).toEqual({
      href: '/#agenda',
      routed: false,
    })
  })

  it('resolves a site page whose slug spells its own leading slash', () => {
    pathname = '/'

    expect(
      anchor(
        <CMSLink
          label="Nos sorties"
          reference={{ relationTo: 'globalPages', value: globalPage('/#agenda') }}
          type="reference"
        />,
      ),
    ).toEqual({ href: '/#agenda', routed: false })
  })
})
