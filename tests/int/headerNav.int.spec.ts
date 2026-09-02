import { describe, expect, it } from 'vitest'

import {
  DEFAULT_NAV_ORDER,
  staticNavItems,
  withStaticNavItems,
  type OrderedNavItem,
} from '@/navigation/Header/staticNavItems'
import { linkHref } from '@/utilities/linkHref'

const CONTACT = '/contact'

/** A Header global entry naming an address outright. */
const custom = (
  url: string,
  {
    authCondition,
    label = url,
    navOrder,
  }: {
    authCondition?: 'loggedIn' | 'loggedOut'
    label?: string
    navOrder?: number
  } = {},
): OrderedNavItem => ({ navOrder, link: { authCondition, label, type: 'custom', url } })

/** A Header global entry pointing at a document — the default link type. */
const reference = (
  slug: string,
  { relationTo = 'pages', label = slug }: { relationTo?: 'pages' | 'posts'; label?: string } = {},
): OrderedNavItem =>
  ({
    link: { label, reference: { relationTo, value: { slug } }, type: 'reference' },
  }) as OrderedNavItem

/** A derived entry, as `pageNavItems` builds them: an address, no condition. */
const derived = (url: string, label = url, navOrder?: number): OrderedNavItem => ({
  id: `page-${url}`,
  navOrder,
  link: { label, type: 'custom', url },
})

const hrefs = (items: OrderedNavItem[]) => items.map((item) => linkHref(item.link))
const labels = (items: OrderedNavItem[]) => items.map((item) => item.link.label)
const occurrences = (items: OrderedNavItem[], href: string) =>
  hrefs(items).filter((candidate) => candidate === href).length

describe('linkHref', () => {
  it('resolves a page reference to the site root, without the collection', () => {
    expect(
      linkHref({
        reference: { relationTo: 'pages', value: { slug: 'contact' } },
        type: 'reference',
      }),
    ).toBe('/contact')
  })

  it('prefixes a collection that is not served from the root', () => {
    expect(
      linkHref({
        reference: { relationTo: 'posts', value: { slug: 'sortie' } },
        type: 'reference',
      }),
    ).toBe('/posts/sortie')
  })

  it('falls back to the address when a reference was never populated', () => {
    expect(
      linkHref({
        reference: { relationTo: 'pages', value: 7 },
        type: 'reference',
        url: '/fallback',
      }),
    ).toBe('/fallback')
  })

  it('has no address to give when a reference is unpopulated and no url is set', () => {
    expect(linkHref({ reference: { relationTo: 'pages', value: 7 }, type: 'reference' })).toBeNull()
  })
})

describe('withStaticNavItems', () => {
  it('leaves an entry naming no order of its own behind every static entry', () => {
    const merged = withStaticNavItems([custom('/from-global')], [derived('/from-page')])

    expect(merged.slice(0, staticNavItems.length)).toEqual(staticNavItems)
    expect(hrefs(merged).slice(-2)).toEqual(['/from-global', '/from-page'])
  })

  it('renders the static entries in the order they are listed', () => {
    expect(labels(withStaticNavItems(null))).toEqual(labels(staticNavItems))
  })

  // The placement the whole ordering exists for: an editorial page in the gap
  // the static entries were spaced out to leave.
  it('places a page between the two static entries its order falls between', () => {
    const merged = withStaticNavItems(null, [derived('/adhesion', 'Adhésions', 15)])

    expect(labels(merged).slice(0, 4)).toEqual(['Recherche', 'Contact', 'Adhésions', 'À propos'])
  })

  // So that `0` reads as the front of the menu rather than as second place.
  it('lets an editorial entry win an order it shares with a static one', () => {
    const merged = withStaticNavItems(null, [derived('/adhesion', 'Adhésions', 0)])

    expect(labels(merged).slice(0, 2)).toEqual(['Adhésions', 'Recherche'])
  })

  it('keeps a Header global entry ahead of a page naming the same order', () => {
    const merged = withStaticNavItems(
      [custom('/global', { label: 'Global', navOrder: 15 })],
      [derived('/page', 'Page', 15)],
    )

    expect(labels(merged).slice(0, 5)).toEqual([
      'Recherche',
      'Contact',
      'Global',
      'Page',
      'À propos',
    ])
  })

  it('reads an order past the last static entry as the back of the menu', () => {
    const merged = withStaticNavItems(null, [
      derived('/loin', 'Loin', DEFAULT_NAV_ORDER + 1),
      derived('/defaut', 'Défaut'),
    ])

    expect(labels(merged).slice(-2)).toEqual(['Défaut', 'Loin'])
  })

  it('drops a derived entry a static entry already points at', () => {
    const merged = withStaticNavItems(null, [derived(CONTACT)])

    expect(occurrences(merged, CONTACT)).toBe(1)
  })

  // The Header global's seeded Contact entry is a reference, so `url` is empty:
  // comparing raw urls left both it and the page's own entry in the menu.
  it('recognises a reference and a derived entry as the same address', () => {
    const merged = withStaticNavItems([reference('une-page')], [derived('/une-page')])

    expect(occurrences(merged, '/une-page')).toBe(1)
  })

  it('lets an editor reference beat the page it points at, not the reverse', () => {
    const merged = withStaticNavItems(
      [reference('une-page', { label: 'Choisi à la main' })],
      [derived('/une-page')],
    )

    expect(merged.at(-1)?.link.label).toBe('Choisi à la main')
  })

  // A restricted entry renders as nothing for the other audience, so claiming
  // the address would leave that audience with no link to the page at all.
  it('keeps a derived entry that an audience-restricted entry would have displaced', () => {
    const merged = withStaticNavItems(
      [custom('/une-page', { authCondition: 'loggedIn' })],
      [derived('/une-page')],
    )

    expect(occurrences(merged, '/une-page')).toBe(2)
  })

  it('keeps two entries restricted to opposite audiences', () => {
    const merged = withStaticNavItems([
      custom('/espace', { authCondition: 'loggedIn', label: 'Mon espace' }),
      custom('/espace', { authCondition: 'loggedOut', label: 'Se connecter' }),
    ])

    expect(occurrences(merged, '/espace')).toBe(2)
  })

  it('still collapses an unrestricted duplicate', () => {
    const merged = withStaticNavItems([custom('/une-page'), custom('/une-page')])

    expect(occurrences(merged, '/une-page')).toBe(1)
  })

  it('leaves entries whose address cannot be resolved alone', () => {
    const orphan = { link: { label: 'Orphelin', type: 'reference' } } as OrderedNavItem
    const merged = withStaticNavItems([orphan, orphan])

    expect(merged.length).toBe(staticNavItems.length + 2)
  })
})
