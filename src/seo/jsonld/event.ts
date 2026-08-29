import type { Post } from '@/payload-types'
import type { JsonLdNode } from './serialize'

import { absoluteUrl } from '../absoluteUrl'
import { CLUB, clubId } from './club'
import { dayInFrance } from '@/utilities/parisDay'
import { getImageURL } from '../imageUrl'
import { postPath } from '@/utilities/postPath'
import { registrationStatus } from '@/components/programs/registrationStatus'
import { SEO_SITE_NAME } from '../constants'

const DAY_MS = 24 * 60 * 60 * 1000

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
 * The distance still stays out: it lives in the body text rather than in a
 * field, so there is nothing to read it from that would still be true next
 * week — marking it up would mean guessing, and the point of this node is that
 * it says exactly what the page says.
 *
 * Signing up is a field now, so it is marked up: `offers` is where a search
 * engine looks for whether an event can still be joined, and it is the one part
 * of the page that changes on its own between two visits.
 */
/**
 * Whether the outing can still be joined, in the shape a search engine reads it.
 *
 * Read from the same `registrationStatus` the page renders its pills from, so
 * the markup cannot say « places available » under a card reading
 * « Inscriptions closes ». A deadline passes on its own, so `availability` has
 * to be worked out per render rather than read off the field — which is also
 * why the page carries a `revalidate`.
 *
 * `SoldOut` only when the club has actually said so. A deadline that has simply
 * run out is `OutOfStock` — no longer obtainable, which is true — rather than
 * a claim the places ran out, which the page never makes.
 *
 * `availabilityEnds` is the day after the deadline, because schema.org reads it
 * as the instant availability stops and the club's deadline is a day someone can
 * still sign up on — quoting the deadline itself would close the outing a day
 * early in anything that renders it.
 *
 * Nothing at all when the club has said nothing: an `Offer` claiming `InStock`
 * on an outing whose places were never counted is a claim the page does not
 * make.
 */
const offers = (post: Post, today?: string) => {
  const deadline = post.schedule?.registrationDeadline
  const status = registrationStatus(
    {
      deadline: deadline ? dayInFrance(deadline) : undefined,
      isFull: post.schedule?.isFull,
    },
    today,
  )

  if (!status) return {}

  const availabilityEnds = deadline
    ? new Date(new Date(`${dayInFrance(deadline)}T00:00:00Z`).getTime() + DAY_MS)
        .toISOString()
        .slice(0, 10)
    : undefined

  const availability = status.full ? 'SoldOut' : status.deadline?.closed ? 'OutOfStock' : 'InStock'

  return {
    offers: {
      '@type': 'Offer',
      availability: `https://schema.org/${availability}`,
      ...(availabilityEnds ? { availabilityEnds } : {}),
      url: absoluteUrl(postPath(post)),
    },
  }
}

export const programEventJsonLd = (post: Post, today?: string): JsonLdNode | null => {
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
    ...offers(post, today),
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
