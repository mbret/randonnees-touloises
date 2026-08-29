import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { dayInFrance, todayInFrance } from '@/utilities/parisDay'

/**
 * How far back the query reaches beyond the cutoff day. The database filter can
 * only compare instants, and a day stored as Paris midnight sits up to two hours
 * inside the previous UTC day — so the query casts one day wider than needed and
 * the exact cutoff is applied below on the `YYYY-MM-DD` strings, where the
 * comparison is unambiguous.
 */
const QUERY_MARGIN_MS = 24 * 60 * 60 * 1000

export type ProgramEntry = {
  slug: string
  title: string
  /** `YYYY-MM-DD`, the day it happens. */
  startDate: string
  /** `YYYY-MM-DD`, for the séjours and the week-ends. */
  endDate?: string
  /** The post's meta description, which `fillMeta` derives from its body. */
  summary?: string
  /** `YYYY-MM-DD`, the last day an inscription is accepted. */
  registrationDeadline?: string
  /** No places left. */
  isFull?: boolean
}

/**
 * The upcoming programme: every published post carrying a date, soonest first.
 *
 * A post with a `schedule.startDate` is a programme entry and a post without one
 * is an actualité — that single field is the whole distinction, so there is no
 * category to keep in step and nothing for an editor to tick.
 *
 * An entry drops off the day after it ends rather than the day after it starts,
 * so a séjour stays listed while it is running.
 */
export const getPrograms = async ({ limit }: { limit?: number } = {}): Promise<ProgramEntry[]> => {
  const payload = await getPayload({ config: configPromise })
  const today = todayInFrance()
  const cutoff = new Date(new Date(`${today}T00:00:00Z`).getTime() - QUERY_MARGIN_MS).toISOString()

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: { title: true, slug: true, schedule: true, meta: true },
    sort: 'schedule.startDate',
    where: {
      or: [
        { 'schedule.endDate': { greater_than_equal: cutoff } },
        { 'schedule.startDate': { greater_than_equal: cutoff } },
      ],
    },
  })

  const entries = docs.flatMap((doc) => {
    if (!doc.schedule?.startDate) return []

    const startDate = dayInFrance(doc.schedule.startDate)
    const endDate = doc.schedule.endDate ? dayInFrance(doc.schedule.endDate) : undefined

    if ((endDate ?? startDate) < today) return []

    return [
      {
        endDate,
        isFull: doc.schedule.isFull ?? undefined,
        registrationDeadline: doc.schedule.registrationDeadline
          ? dayInFrance(doc.schedule.registrationDeadline)
          : undefined,
        slug: doc.slug,
        startDate,
        summary: doc.meta?.description ?? undefined,
        title: doc.title,
      },
    ]
  })

  return limit === undefined ? entries : entries.slice(0, limit)
}
