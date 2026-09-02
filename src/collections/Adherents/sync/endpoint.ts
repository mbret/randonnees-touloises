import type { Endpoint, PayloadRequest } from 'payload'

import { checkRole } from '@/access/utilities'

import { applyPlan } from './apply'
import { planDigest } from './digest'
import { MAX_CSV_BYTES, parseSheet } from './parseCsv'
import { buildPlan, type ExistingAdherent } from './plan'
import { seasonFor } from './season'

const json = (body: unknown, status = 200) =>
  Response.json(body, { headers: { 'Cache-Control': 'no-store' }, status })

/**
 * Works out what importing a roster export would change, reports it, and — on a
 * second request naming the same plan — writes it.
 *
 * `POST /api/adherents/sync` with `{ csv, apply?, digest? }`. Without `apply` it
 * only reports. With `apply` it recomputes the plan from the same file and
 * refuses unless the fingerprint still matches the one the report carried, so
 * what gets written is what somebody read. A mismatch comes back as the *new*
 * report rather than an error, because that is what the person now needs to look
 * at.
 *
 * One request could not do both. The whole point is that a human reads 273 rows
 * in between, and nothing is stored server-side while they do — the browser
 * holds the file and sends it again, so there is no staging table to expire,
 * clean up, or leak a roster from.
 *
 * The season is not asked for. The export does not carry one and the club simply
 * renames the file, so it is worked out from today's date: a season opens on 1
 * September, which is the only rule the club's own file follows. Importing an
 * older file therefore records the current season, and correcting that is an
 * edit to one adhesion row rather than a question on every import.
 *
 * The file arrives as a string in the body rather than as a multipart upload,
 * because the page reads it in the browser and sends its text — there is nothing
 * to store, and nothing that could be mistaken for an upload to keep.
 *
 * `no-store` on the way out: the response is the club's roster, differences and
 * all, and has no business in any cache between here and the browser.
 */
export const syncEndpoint: Omit<Endpoint, 'root'> = {
  handler: async (req: PayloadRequest) => {
    if (!req.user || !checkRole(['admin'], req.user)) {
      return json({ error: 'Réservé aux administrateurs.' }, 403)
    }

    let body: unknown

    try {
      body = await req.json?.()
    } catch {
      return json({ error: 'Requête illisible.' }, 400)
    }

    const { apply, csv, digest } =
      typeof body === 'object' && body !== null
        ? (body as { apply?: unknown; csv?: unknown; digest?: unknown })
        : {}

    if (typeof csv !== 'string') {
      return json({ error: 'Aucun fichier reçu.' }, 400)
    }

    // Bytes, not characters: accented names cost more than one apiece.
    if (Buffer.byteLength(csv, 'utf8') > MAX_CSV_BYTES) {
      return json({ error: 'Le fichier est trop volumineux pour être un export d’adhérents.' }, 413)
    }

    const parsed = parseSheet(csv)

    if (!parsed.ok) return json({ error: parsed.error }, 422)

    /**
     * The whole roster, because the plan has to say which adhérents the file
     * does *not* mention. `limit: 0` lifts the page size, `overrideAccess` gets
     * past the collection's closed read — this handler has already established
     * that the caller is an admin, which is the same thing that access control
     * would have checked.
     */
    const stored = await req.payload.find({
      collection: 'adherents',
      depth: 0,
      limit: 0,
      overrideAccess: true,
      pagination: false,
      req,
    })

    const plan = buildPlan({
      existing: stored.docs as unknown as ExistingAdherent[],
      rows: parsed.rows,
      season: seasonFor(new Date()),
    })

    const fingerprint = planDigest(plan)
    const report = {
      digest: fingerprint,
      plan,
      rowsRead: parsed.rows.length,
      storedTotal: stored.docs.length,
    }

    if (apply !== true) return json(report)

    /**
     * The roster moved while the report was being read, so the plan on screen is
     * no longer the plan this file would apply. The new one goes back with a 409
     * for the page to show; nothing is written.
     */
    if (digest !== fingerprint) {
      return json(
        {
          ...report,
          error:
            'Les adhérents ont changé depuis l’analyse. Voici ce qu’un import ferait maintenant — ' +
            'relisez le rapport avant de confirmer.',
          stale: true,
        },
        409,
      )
    }

    if (plan.creates.length === 0 && plan.updates.length === 0) {
      return json({ ...report, applied: { created: 0, updated: 0 } })
    }

    try {
      const applied = await applyPlan({ plan, req })

      return json({ ...report, applied })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'adherents sync failed' })

      /**
       * The reason goes back to the screen, not just to the logs. Only an admin
       * can reach this, and the alternative is what happened the first time this
       * ran: a generic failure, and the actual cause — one address in the file
       * that the collection would not accept — only findable by reading the
       * function logs.
       *
       * `applyPlan` prefixes the line and licence it was writing, so the message
       * names the row to go and look at.
       */
      return json(
        {
          detail: error instanceof Error ? error.message : String(error),
          error:
            'L’import a échoué et rien n’a été enregistré. ' +
            'Le fichier et les adhérents sont inchangés.',
        },
        500,
      )
    }
  },
  method: 'post',
  path: '/sync',
}
