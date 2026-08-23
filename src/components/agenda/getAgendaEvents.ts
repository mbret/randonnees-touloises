import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { AgendaEvent } from './groupEvents'
import { dayInFrance, todayInFrance } from './groupEvents'

/**
 * How far back the query reaches beyond the cutoff day. The database filter can
 * only compare instants, and a day stored as Paris midnight sits up to two hours
 * inside the previous UTC day — so the query casts one day wider than needed and
 * `groupEventsByMonth` applies the exact cutoff on the `YYYY-MM-DD` strings,
 * where the comparison is unambiguous.
 */
const QUERY_MARGIN_MS = 24 * 60 * 60 * 1000

/** Kept in step with the `revalidate` the home page exports. */
const PAGE_REVALIDATE_SECONDS = 3600

/**
 * Every published event from `today` onwards, in the flat shape the agenda groups.
 *
 * Events carry no page of their own, so this is a plain read of the collection —
 * no slugs to resolve and nothing to populate beyond the fields the card shows.
 */
const queryAgendaEvents = async (today: string): Promise<AgendaEvent[]> => {
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

/**
 * Cached under the events tag, which `revalidateEvent` fires on every write, so
 * a published event still reaches the agenda immediately.
 *
 * The expiry is a backstop for the writes no hook sees — a migration, a seed, an
 * edit made straight against the database — which would otherwise stay invisible
 * for as long as the entry lived. Next keeps these entries across builds and
 * deployments, so without it a deploy would not clear them either. An hour
 * matches the home page's own window, so this bounds staleness no more loosely
 * than the page already did.
 *
 * The cutoff day is the argument rather than something the query reads for
 * itself, which makes it part of the cache key: the first render of a new day
 * misses and queries again, so the list sheds yesterday on the day it should
 * even in a week when nobody publishes anything. Reading the clock inside the
 * cached function would have pinned the cutoff to whenever the entry was
 * written, and a time-based `revalidate` would only have bounded how long it
 * stayed wrong.
 */
const getCachedAgendaEvents = unstable_cache(queryAgendaEvents, ['agendaEvents'], {
  revalidate: PAGE_REVALIDATE_SECONDS,
  tags: ['events'],
})

export const getAgendaEvents = (): Promise<AgendaEvent[]> => getCachedAgendaEvents(todayInFrance())
