import { describe, it, expect, beforeAll } from 'vitest'

import type { Page, Post } from '@/payload-types'

import { breadcrumbJsonLd, pageTrail, postTrail } from '@/seo/jsonld/breadcrumbs'
import { clubJsonLd } from '@/seo/jsonld/club'
import { programEventJsonLd } from '@/seo/jsonld/event'
import { serializeJsonLd } from '@/seo/jsonld/serialize'

// The builders read the server URL at call time, so pin it before anything asks
// for an absolute URL.
const SERVER_URL = 'https://abonnes.randonnees-touloises.net'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = SERVER_URL
})

const post = (overrides: Partial<Post> = {}) =>
  ({
    title: 'Marche Breathwalk',
    slug: 'marche-breathwalk',
    meta: { title: 'Marche Breathwalk', description: 'Une sortie.' },
    ...overrides,
  }) as Post

describe('club structured data', () => {
  it('describes the club as a hiking club rather than a generic organisation', () => {
    const club = clubJsonLd()

    expect(club['@type']).toBe('SportsClub')
    expect(club['@id']).toBe(`${SERVER_URL}/#club`)
    expect(club.url).toBe(`${SERVER_URL}/`)
    expect(club.sport).toBe('Randonnée pédestre')
  })

  it('carries the founding year and the federation the club belongs to', () => {
    const club = clubJsonLd()

    expect(club.foundingDate).toBe('1987')
    expect(club.memberOf).toMatchObject({
      '@type': 'SportsOrganization',
      alternateName: 'FFRandonnée',
      url: 'https://www.ffrandonnee.fr/',
    })
  })

  it('places the club at the address the footer prints', () => {
    expect(clubJsonLd().address).toMatchObject({
      '@type': 'PostalAddress',
      postalCode: '54200',
      addressLocality: 'Toul',
      addressCountry: 'FR',
    })
  })

  it('prefers the club logo over the site image, and takes it absolute as given', () => {
    expect(clubJsonLd({ logo: 'https://cdn.example.com/logo.webp' }).logo).toBe(
      'https://cdn.example.com/logo.webp',
    )
    expect(clubJsonLd().logo).toBe(`${SERVER_URL}/og-image.jpg`)
  })
})

describe('programme event structured data', () => {
  it('marks a dated post up as an event at its programme address', () => {
    const event = programEventJsonLd(post({ schedule: { startDate: '2026-09-11T22:00:00.000Z' } }))

    expect(event).toMatchObject({
      '@type': 'Event',
      name: 'Marche Breathwalk',
      description: 'Une sortie.',
      url: `${SERVER_URL}/programs/marche-breathwalk`,
      eventStatus: 'https://schema.org/EventScheduled',
    })
  })

  it('reads the day the page prints, not the day the stored instant falls on in UTC', () => {
    // Midnight in Paris on 12 September is 22:00 UTC on the 11th.
    const event = programEventJsonLd(post({ schedule: { startDate: '2026-09-11T22:00:00.000Z' } }))

    expect(event?.startDate).toBe('2026-09-12')
  })

  it('spans the days of a séjour', () => {
    const event = programEventJsonLd(
      post({
        schedule: { startDate: '2026-10-03T22:00:00.000Z', endDate: '2026-10-10T22:00:00.000Z' },
      }),
    )

    expect(event?.startDate).toBe('2026-10-04')
    expect(event?.endDate).toBe('2026-10-11')
  })

  it('leaves out an end date that only repeats the start', () => {
    const event = programEventJsonLd(
      post({
        schedule: { startDate: '2026-09-11T22:00:00.000Z', endDate: '2026-09-11T22:00:00.000Z' },
      }),
    )

    expect(event).not.toHaveProperty('endDate')
  })

  it('gives an event the location Google asks for', () => {
    const event = programEventJsonLd(post({ schedule: { startDate: '2026-09-11T22:00:00.000Z' } }))

    expect(event?.location).toMatchObject({
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: 'Toul' },
    })
  })

  /**
   * `offers` is where a search engine looks for whether an event can still be
   * joined, and it is the part of the page that changes on its own between two
   * visits.
   */
  it('offers no places on an outing announced as full', () => {
    const event = programEventJsonLd(
      post({ schedule: { startDate: '2026-09-11T22:00:00.000Z', availability: 'full' as const } }),
    )

    expect(event?.offers).toMatchObject({ availability: 'https://schema.org/SoldOut' })
  })

  /**
   * schema.org reads `availabilityEnds` as the instant availability stops, and
   * the club's deadline is a day one can still sign up on — quoting the
   * deadline itself would close the outing a day early.
   */
  it('keeps places until the day after the deadline', () => {
    const event = programEventJsonLd(
      post({
        schedule: {
          startDate: '2026-09-19T22:00:00.000Z',
          registrationDeadline: '2026-09-17T22:00:00.000Z',
        },
      }),
    )

    expect(event?.offers).toMatchObject({
      availability: 'https://schema.org/InStock',
      availabilityEnds: '2026-09-19',
    })
  })

  /**
   * A deadline passes on its own, so `availability` is worked out per render
   * like the pill on the page is. Emitting `InStock` beside an
   * `availabilityEnds` already in the past would have the markup contradict
   * the card above it.
   */
  it('stops offering places once the deadline has gone', () => {
    const event = programEventJsonLd(
      post({
        schedule: {
          startDate: '2026-09-19T22:00:00.000Z',
          registrationDeadline: '2020-09-17T22:00:00.000Z',
        },
      }),
    )

    expect(event?.offers).toMatchObject({ availability: 'https://schema.org/OutOfStock' })
  })

  /**
   * `SoldOut` is a claim that the places ran out. A deadline that simply
   * expired on an outing with room left is not that, and the page never says
   * it is.
   */
  it('calls an expired deadline unavailable rather than sold out', () => {
    const expired = programEventJsonLd(
      post({
        schedule: {
          startDate: '2026-09-19T22:00:00.000Z',
          registrationDeadline: '2020-09-17T22:00:00.000Z',
        },
      }),
    )
    const full = programEventJsonLd(
      post({ schedule: { startDate: '2026-09-19T22:00:00.000Z', availability: 'full' as const } }),
    )

    expect(expired?.offers).not.toMatchObject({ availability: 'https://schema.org/SoldOut' })
    expect(full?.offers).toMatchObject({ availability: 'https://schema.org/SoldOut' })
  })

  /** A claim the page itself does not make has no business being marked up. */
  it('claims no availability for an outing the club has said nothing about', () => {
    const event = programEventJsonLd(post({ schedule: { startDate: '2026-09-11T22:00:00.000Z' } }))

    expect(event?.offers).toBeUndefined()
  })

  it('says nothing about a post with no date, which is news and not an outing', () => {
    expect(programEventJsonLd(post())).toBeNull()
    expect(programEventJsonLd(post({ schedule: { startDate: null } }))).toBeNull()
  })
})

describe('breadcrumb structured data', () => {
  const steps = (trail: ReturnType<typeof breadcrumbJsonLd>) =>
    trail?.itemListElement as { name: string; item: string }[]

  const names = (trail: ReturnType<typeof breadcrumbJsonLd>) => steps(trail).map(({ name }) => name)

  const items = (trail: ReturnType<typeof breadcrumbJsonLd>) => steps(trail).map(({ item }) => item)

  it('files a dated post under the programme', () => {
    const trail = breadcrumbJsonLd(postTrail(post({ schedule: { startDate: '2026-09-12' } })))

    expect(names(trail)).toEqual(['Accueil', 'Programme hebdomadaire', 'Marche Breathwalk'])
    expect(items(trail)).toEqual([
      `${SERVER_URL}/`,
      `${SERVER_URL}/programs`,
      `${SERVER_URL}/programs/marche-breathwalk`,
    ])
    expect(trail?.itemListElement).toMatchObject([
      { '@type': 'ListItem', position: 1 },
      { '@type': 'ListItem', position: 2 },
      { '@type': 'ListItem', position: 3 },
    ])
  })

  it('files an undated post under the news', () => {
    const trail = breadcrumbJsonLd(postTrail(post()))

    expect(names(trail)).toEqual(['Accueil', 'Actualités', 'Marche Breathwalk'])
    expect(items(trail)).toEqual([
      `${SERVER_URL}/`,
      `${SERVER_URL}/news`,
      `${SERVER_URL}/news/marche-breathwalk`,
    ])
  })

  it('hangs a page off the site root', () => {
    const page = { slug: 'qui-sommes-nous', title: 'Qui sommes-nous' } as Page
    const trail = breadcrumbJsonLd(pageTrail(page))

    expect(names(trail)).toEqual(['Accueil', 'Qui sommes-nous'])
    expect(items(trail)).toEqual([`${SERVER_URL}/`, `${SERVER_URL}/qui-sommes-nous`])
  })

  it('hangs a page slugged home off the root like any other, at /home', () => {
    const trail = breadcrumbJsonLd(pageTrail({ slug: 'home', title: 'Accueil' } as Page))

    expect(items(trail)).toEqual([`${SERVER_URL}/`, `${SERVER_URL}/home`])
  })
})

describe('serializing a node', () => {
  it('escapes markup so a stray tag cannot close the script block', () => {
    const serialized = serializeJsonLd({ '@type': 'Event', name: 'Sortie </script><b>x</b>' })

    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003c/script')
  })
})
