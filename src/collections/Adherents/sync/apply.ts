import type { PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import type { SyncPlan } from './plan'

export type ApplyResult = { created: number; updated: number }

/**
 * The plan carries its writes as plain objects, so the collection's own generated
 * type is asserted here — at the one point where the two meet — rather than
 * pulling Payload's types into the pure half of the sync.
 */
type AdherentData = RequiredDataFromCollectionSlug<'adherents'>

/**
 * Writes a plan, all of it or none of it.
 *
 * Everything runs inside one transaction. A roster half imported is worse than
 * one not imported at all: the secretary would have no way to tell which of 273
 * rows had landed, and running the file again would report a mixture of creates
 * and updates that matches nothing she saw. So a failure anywhere rolls the lot
 * back and the error reaches her instead.
 *
 * The writes themselves are dumb on purpose. Every decision — which adhérent,
 * which fields, which season row, what the notes become — was made when the plan
 * was built and is sitting in `data`, so what gets written is literally what the
 * report showed. Nothing here re-derives anything.
 *
 * `overrideAccess` because the caller has already been checked for admin, which
 * is the same thing the collection's own access control would have asked.
 */
export const applyPlan = async ({
  plan,
  req,
}: {
  plan: SyncPlan
  req: PayloadRequest
}): Promise<ApplyResult> => {
  const { payload } = req
  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    throw new Error('La base de données n’a pas ouvert de transaction.')
  }

  const scoped = { ...req, transactionID } as PayloadRequest

  try {
    for (const create of plan.creates) {
      await payload.create({
        collection: 'adherents',
        data: create.data as AdherentData,
        overrideAccess: true,
        req: scoped,
      })
    }

    for (const update of plan.updates) {
      await payload.update({
        collection: 'adherents',
        data: update.data as Partial<AdherentData>,
        id: update.id,
        overrideAccess: true,
        req: scoped,
      })
    }

    await payload.db.commitTransaction(transactionID)

    return { created: plan.creates.length, updated: plan.updates.length }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
