import type { Post } from '../payload-types'
import type { JsonLdNode } from './structuredData'

import { absoluteUrl } from './absoluteUrl'
import { CLUB, clubId } from './club'
import { dayInFrance } from '../utilities/parisDay'
import { getImageURL } from './imageUrl'
import { postPath } from '../utilities/postPath'
import { SEO_SITE_NAME } from './constants'

/**
 * A programme entry as an `Event`.
 *
 * Programme entries are the pages worth marking up: they are dated outings a
 * reader can turn up to, which is what an `Event` is for and what a search
 * engine can show as a date rather than as another blue link. News posts carry
 * no date of their own and get nothing here.
 *
 * The dates are the calendar days the page prints, read in Paris — the stored
 * instant is midnight in the editor's timezone, so the raw ISO string is a day
 * out for anything chosen in France. `endDate` is only emitted for a stay that
 * actually spans days, since a single-day outing repeating its own start reads
 * as a run of one.
 *
 * Two things the club announces in prose stay out of here: the distance and the
 * registration deadline. Both live in the body text rather than in fields, so
 * there is nothing to read them from that would still be true next week —
 * marking them up would mean guessing, and the point of this node is that it
 * says exactly what the page says.
 */
export const programEventJsonLd = (post: Post): JsonLdNode | null => {
  const start = post.schedule?.startDate

  // The date is what makes a post a programme entry; without one it is news, and
  // an announcement with no date is not an event.
  if (!start) return null

  const startDate = dayInFrance(start)
  const endDate = post.schedule?.endDate ? dayInFrance(post.schedule.endDate) : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: post.title,
    startDate,
    ...(endDate && endDate !== startDate ? { endDate } : {}),
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    url: absoluteUrl(postPath(post)),
    image: getImageURL(post.meta?.image),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    // Google needs a location for an event, and the only one the site publishes
    // is the area the club walks: where each outing meets is written in the body
    // text, not held as a field. So this is the club's own ground rather than a
    // precise meeting point invented for the markup.
    location: {
      '@type': 'Place',
      name: `${CLUB.address.locality} et ses environs`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: CLUB.address.locality,
        addressRegion: CLUB.address.region,
        addressCountry: CLUB.address.country,
      },
    },
    organizer: {
      '@type': 'SportsClub',
      '@id': clubId(),
      name: SEO_SITE_NAME,
      url: absoluteUrl('/'),
    },
  }
}
