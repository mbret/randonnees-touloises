import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import type { ComponentProps } from 'react'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) => <a {...props}>{children}</a>,
}))

/* The bar's own state is what these are about; what it holds is not. */
vi.mock('@/components/Logo/Logo', () => ({ Logo: () => <span /> }))
vi.mock('@/navigation/Header/DesktopNav', () => ({ DesktopNav: () => <nav /> }))
vi.mock('@/navigation/Header/MobileNav', () => ({ MobileNav: () => <nav /> }))

/**
 * An observer that answers only when a test tells it to, which is what lets
 * these assert on the frame before it has answered at all — the frame the
 * reader sees, and the one the bar used to get wrong.
 */
let answer: ((isIntersecting: boolean) => void) | null = null

vi.stubGlobal(
  'IntersectionObserver',
  class {
    constructor(callback: IntersectionObserverCallback) {
      answer = (isIntersecting) =>
        act(() => callback([{ isIntersecting } as IntersectionObserverEntry], this as never))
    }
    observe() {}
    disconnect() {
      answer = null
    }
  },
)

const { HeaderClient } = await import('@/navigation/Header/Header.client')

/** Renders the bar on a page that opens with a photograph, unless told not to. */
const bar = ({ hash = '', hero = true }: { hash?: string; hero?: boolean } = {}) => {
  window.location.hash = hash

  if (hero)
    document.body.appendChild(document.createElement('div')).toggleAttribute('data-hero-top')

  render(<HeaderClient navItems={[]} />)

  return document.querySelector('header')!
}

const solid = (header: Element) => header.hasAttribute('data-scrolled')

beforeEach(() => {
  document.body.innerHTML = ''
  window.location.hash = ''
})

afterEach(cleanup)

describe('the header over a photograph', () => {
  /* Arriving at `/#agenda` from another page, the bar used to paint
   * cream-on-photograph for the frame before the observer's first answer, then
   * fade back to solid over its own 150ms transition. */
  it('is already solid on the frame a fragment in the address is committed', () => {
    expect(solid(bar({ hash: '#agenda' }))).toBe(true)
  })

  it('is transparent when the address names no section', () => {
    expect(solid(bar())).toBe(false)
  })

  /* `data-scrolled` means nothing on a page with no photograph, and must not be
   * carried back to one that has: the bar would show solid for a frame over a
   * hero the reader has not scrolled yet. */
  it('stays at rest on a page that opens with no photograph', () => {
    expect(solid(bar({ hash: '#agenda', hero: false }))).toBe(false)
  })

  it('hands the question back to the observer once it has an answer', () => {
    const header = bar({ hash: '#agenda' })

    answer!(true)
    expect(solid(header)).toBe(false)

    answer!(false)
    expect(solid(header)).toBe(true)
  })
})
