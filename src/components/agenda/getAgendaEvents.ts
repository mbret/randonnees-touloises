import configPromise from '@payload-config'
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

/**
 * Every published event from today onwards, in the flat shape the agenda groups.
 *
 * Events carry no page of their own, so this is a plain read of the collection —
 * no slugs to resolve and nothing to populate beyond the fields the card shows.
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
