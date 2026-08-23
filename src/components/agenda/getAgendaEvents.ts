import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import type { AgendaEvent } from './groupEvents'
import { dayInFrance } from './groupEvents'

/**
 * How far back the query reaches beyond the cutoff day. The database filter can
 * only compare instants, and a day stored as Paris midnight sits up to two hours
 * inside the previous UTC day — so the query casts one day wider than needed and
 * `groupEventsByMonth` applies the exact cutoff on the `YYYY-MM-DD` strings,
 * where the comparison is unambiguous.
 */
const QUERY_MARGIN_MS = 24 * 60 * 60 * 1000

/**
 * Every published event from `today` onwards, in the flat shape the agenda groups.
 *
 * Events carry no page of their own, so this is a plain read of the collection —
 * no slugs to resolve and nothing to populate beyond the fields the card shows.
 *
 * Cached under the events tag, which `revalidateEvent` fires on every write, so a
 * published event still reaches the agenda immediately. The hour is only the
 * backstop for what changes without a write — a migration, a seed, an edit made
 * straight against the database.
 *
 * `today` is an argument rather than something this reads for itself, which puts
 * the day in the cache key: the first render of a new day misses and queries
 * again, so the list sheds yesterday even in a week when nobody publishes
 * anything. It also has to be, since a prerender refuses a bare clock read —
 * `cachedTodayInFrance` is what the caller supplies it from.
 */
export const getAgendaEvents = async (today: string): Promise<AgendaEvent[]> => {
  'use cache'
  cacheLife('hours')
  cacheTag('events')

  const payload = await getPayload({ config: configPromise })
  const from = new Date(`${today}T00:00:00Z`).getTime() - QUERY_MARGIN_MS

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

  return docs.flatMap((doc) => {
    if (!doc.date) return []

    return [
      {
        title: doc.title,
        date: dayInFrance(doc.date),
        startTime: doc.startTime ?? undefined,
        endTime: doc.endTime ?? undefined,
        content: doc.content,
      },
    ]
  })
}
