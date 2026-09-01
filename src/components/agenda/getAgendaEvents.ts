import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'

import type { AgendaEvent, AgendaLocation } from './groupEvents'
import { dayInFrance, outingName, todayInFrance } from './groupEvents'

/**
 * How far back the query reaches beyond the cutoff day. The database filter can
 * only compare instants, and a day stored as Paris midnight sits up to two hours
 * inside the previous UTC day — so the query casts one day wider than needed and
 * `groupEventsByMonth` applies the exact cutoff on the `YYYY-MM-DD` strings,
 * where the comparison is unambiguous.
 */
const QUERY_MARGIN_MS = 24 * 60 * 60 * 1000

/**
 * What the card takes from a category: name, tile, the « en deux mots », and
 * the official label the walk has to be announced with.
 */
type CategoryCard = { credential?: Media; logo?: Media; summary?: string; title: string }

/**
 * Every outing category the given events point at, in one query.
 *
 * An ordinary outing is named by its category now — « Grande », « Petite » —
 * and its own title carries only what the category cannot say. So the agenda
 * has to read the category, or a perfectly ordinary walk arrives on the home
 * page as a time and nothing else.
 *
 * Fetched separately rather than by raising the events query to `depth: 1`:
 * that would populate every upload the rich text references too, which this
 * page never reads. `select` keeps this one narrow in the same spirit — what
 * the card prints, not the slug or the ordering — and `depth: 1` reaches
 * through to the logo's and the label's own records, which is where their URLs
 * and dimensions live. One extra query against five rows is the cheaper half
 * of that trade.
 */
const readCategories = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  events: { outingCategory?: unknown }[],
): Promise<Map<number, CategoryCard>> => {
  const ids = [
    ...new Set(
      events.flatMap((doc) => (typeof doc.outingCategory === 'number' ? [doc.outingCategory] : [])),
    ),
  ]

  if (!ids.length) return new Map()

  const { docs } = await payload.find({
    collection: 'outingCategories',
    depth: 1,
    overrideAccess: false,
    pagination: false,
    select: { credential: true, logo: true, summary: true, title: true },
    where: {
      id: {
        in: ids,
      },
    },
  })

  return new Map(
    docs.map((category) => [
      category.id,
      {
        title: category.title,
        ...(category.summary ? { summary: category.summary } : {}),
        // A category whose logo has not been picked yet comes back as null;
        // one read at `depth: 0` would come back as a bare id. Neither is
        // something the card can draw, so only the populated record passes.
        ...(category.logo && typeof category.logo === 'object' ? { logo: category.logo } : {}),
        // Same guard, same reason: a label nobody has picked, or one read
        // shallow, is not something the card can draw.
        ...(category.credential && typeof category.credential === 'object'
          ? { credential: category.credential }
          : {}),
      },
    ]),
  )
}

/**
 * Where every one of these events starts, in one query.
 *
 * The same shape as the categories above, and separate for the same reason:
 * `depth: 1` on the events query would reach every upload the rich text
 * references as well, which nothing here prints. `select` keeps this one to
 * what a card shows — the name, the pin behind its map link, and the note
 * about parking — leaving out the commune and the spot the title already
 * holds.
 */
const readStartLocations = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  events: { startLocation?: unknown }[],
): Promise<Map<number, AgendaLocation>> => {
  const ids = [
    ...new Set(
      events.flatMap((doc) => (typeof doc.startLocation === 'number' ? [doc.startLocation] : [])),
    ),
  ]

  if (!ids.length) return new Map()

  const { docs } = await payload.find({
    collection: 'locations',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: { title: true, latitude: true, longitude: true, notes: true },
    where: {
      id: {
        in: ids,
      },
    },
  })

  return new Map(docs.map((location) => [location.id, location]))
}

/**
 * Every published event from today onwards, in the flat shape the agenda groups.
 *
 * Events carry no page of their own, so this is a plain read of the collection —
 * no slugs to resolve, and nothing populated beyond the one relationship that
 * can hold the outing's name.
 */
export const getAgendaEvents = async (): Promise<AgendaEvent[]> => {
  const payload = await getPayload({ config: configPromise })
  const from = new Date(`${todayInFrance()}T00:00:00Z`).getTime() - QUERY_MARGIN_MS

  const { docs } = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    sort: 'date',
    where: {
      date: {
        greater_than_equal: new Date(from).toISOString(),
      },
    },
  })

  const categories = await readCategories(payload, docs)
  const startLocations = await readStartLocations(payload, docs)

  return docs.flatMap((doc) => {
    if (!doc.date) return []

    const category =
      typeof doc.outingCategory === 'number' ? categories.get(doc.outingCategory) : undefined

    return [
      {
        // The title is the exception — « Journée interclubs santé » — and the
        // category is the rule. Publishing an event with neither is refused, so
        // one of the two is always here.
        title: outingName(doc.title, category?.title),
        // The category's figures follow its name onto the card, and only its
        // name: an event that titles itself is the very walk « 11 à 15 km »
        // may not describe. Whether it did is read the way `outingName` reads
        // it — a cleared or whitespace intitulé is no intitulé.
        ...(!outingName(doc.title) && category?.summary ? { summary: category.summary } : {}),
        logo: category?.logo,
        // The label is deliberately *not* conditional the way the summary
        // above is: « Journée interclubs santé » titles itself and is still a
        // rando santé, and the obligation to show the label follows the kind
        // of walk rather than the wording of its intitulé.
        credential: category?.credential,
        date: dayInFrance(doc.date),
        startTime: doc.startTime ?? undefined,
        endTime: doc.endTime ?? undefined,
        content: doc.content,
        ...(typeof doc.startLocation === 'number' && startLocations.has(doc.startLocation)
          ? { startLocation: startLocations.get(doc.startLocation) }
          : {}),
      },
    ]
  })
}
