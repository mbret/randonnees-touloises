import type { PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import { commitTransaction, initTransaction, killTransaction } from 'payload'

import type { SyncPlan } from './plan'

/**
 * The plan carries its writes as plain objects, so the collection's own generated
 * type is asserted here — at the one point where the two meet — rather than
 * pulling Payload's types into the pure half of the sync.
 */
type AdherentData = RequiredDataFromCollectionSlug<'adherents'>

export type ApplyResult = { created: number; updated: number }

/**
 * Writes a plan, all of it or none of it.
 *
 * Everything runs inside one transaction. A roster half imported is worse than
 * one not imported at all: the secretary would have no way to tell which of 273
 * rows had landed, and running the file again would report a mixture of creates
 * and updates that matches nothing she saw. So a failure anywhere rolls the lot
 * back and the error reaches her instead.
 *
 * The transaction goes through Payload's own `initTransaction`, which assigns it
 * to `req.transactionID` on the request it is handed. Building a copy of the
 * request instead — `{ ...req, transactionID }` — silently breaks: a
 * `PayloadRequest` is a Web `Request`, so spreading it keeps the own properties
 * and drops every prototype getter, `headers` included, and the operation then
 * reads `undefined` off it.
 *
 * The writes themselves are dumb on purpose. Every decision — which adhérent,
 * which fields, which season row, what the notes become — was made when the plan
 * was built and is sitting in `data`, so what gets written is literally what the
 * report showed. Nothing here re-derives anything.
 *
 * `overrideAccess` because the caller has already been checked for admin, which
 * is the same thing the collection's own access control would have asked.
 * `depth: 0` because nothing reads the documents back; populating a relationship
 * on each of several hundred writes is a query apiece for an answer thrown away.
 */
export const applyPlan = async ({
  plan,
  req,
}: {
  plan: SyncPlan
  req: PayloadRequest
}): Promise<ApplyResult> => {
  const { payload } = req

  await initTransaction(req)

  /**
   * Which row was being written when it went wrong. The plan's own numbering, so
   * the message names the line the secretary would open in her spreadsheet.
   */
  let at = ''

  try {
    for (const create of plan.creates) {
      at = `ligne ${create.line} (licence ${create.licence})`

      await payload.create({
        collection: 'adherents',
        data: create.data as AdherentData,
        depth: 0,
        overrideAccess: true,
        req,
      })
    }

    for (const update of plan.updates) {
      at = `ligne ${update.line} (licence ${update.licence})`

      await payload.update({
        collection: 'adherents',
        data: update.data as Partial<AdherentData>,
        depth: 0,
        id: update.id,
        overrideAccess: true,
        req,
      })
    }

    await commitTransaction(req)

    return { created: plan.creates.length, updated: plan.updates.length }
  } catch (error) {
    await killTransaction(req)

    const because = error instanceof Error ? error.message : String(error)

    throw new Error(`${at ? `${at} : ` : ''}${because}`)
  }
}
