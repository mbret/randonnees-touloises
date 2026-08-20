import type { JsonLdNode } from './serialize'

import { absoluteUrl } from '../absoluteUrl'
import { SEO_IMAGE, SEO_SITE_NAME, SEO_TITLE } from '../constants'

/**
 * The node every page points at for "who publishes this".
 *
 * A stable `@id` rather than a bare object so a crawler that reads two pages
 * knows it read the same club twice, and so anything else on a page — an
 * outing's organiser, say — can name the club instead of restating it.
 *
 * A function rather than a constant because the origin comes from the
 * environment: read at import time it would freeze whatever the first module to
 * load happened to see.
 */
export const clubId = () => absoluteUrl('/#club')

/**
 * What the site says about the club, in the one place structured data can read
 * it. Every figure here is published on the site itself: the founding year on
 * the home page and in « À propos », the federation and the label in the same
 * two places, the address in the footer and on the contact page.
 */
export const CLUB = {
  description:
    'Club de randonnée pédestre à Toul, en Meurthe-et-Moselle, affilié à la Fédération Française de Randonnée depuis 1992.',
  foundingDate: '1987',
  sport: 'Randonnée pédestre',
  address: {
    streetAddress: 'Maison des Associations, 2 cours Raymond Poincaré',
    postalCode: '54200',
    locality: 'Toul',
    region: 'Grand Est',
    country: 'FR',
  },
  federation: {
    name: 'Fédération Française de Randonnée',
    alternateName: 'FFRandonnée',
    url: 'https://www.ffrandonnee.fr/',
  },
} as const

/**
 * The club as a `SportsClub` — the type that actually fits a hiking association,
 * where a plain `Organization` would say nothing about what it organises.
 *
 * `logo` is the club's own logo when the media library holds one; the site image
 * stands in until then, so the node never claims a picture that does not exist.
 */
export const clubJsonLd = ({ logo }: { logo?: string } = {}): JsonLdNode => ({
  '@context': 'https://schema.org',
  '@type': 'SportsClub',
  '@id': clubId(),
  name: SEO_SITE_NAME,
  alternateName: SEO_TITLE,
  description: CLUB.description,
  url: absoluteUrl('/'),
  logo: logo ?? absoluteUrl(SEO_IMAGE),
  image: logo ?? absoluteUrl(SEO_IMAGE),
  sport: CLUB.sport,
  foundingDate: CLUB.foundingDate,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CLUB.address.streetAddress,
    postalCode: CLUB.address.postalCode,
    addressLocality: CLUB.address.locality,
    addressRegion: CLUB.address.region,
    addressCountry: CLUB.address.country,
  },
  areaServed: {
    '@type': 'Place',
    name: `${CLUB.address.locality} et ses environs`,
  },
  memberOf: {
    '@type': 'SportsOrganization',
    name: CLUB.federation.name,
    alternateName: CLUB.federation.alternateName,
    url: CLUB.federation.url,
  },
})
