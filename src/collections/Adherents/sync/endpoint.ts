import type { Endpoint, PayloadRequest } from 'payload'

import { checkRole } from '@/access/utilities'

import { MAX_CSV_BYTES, parseSheet } from './parseCsv'
import { buildPlan, type ExistingAdherent } from './plan'
import { seasonFor } from './season'

const json = (body: unknown, status = 200) =>
  Response.json(body, { headers: { 'Cache-Control': 'no-store' }, status })

/**
 * Works out what importing a roster export would change, and reports it.
 *
 * `POST /api/adherents/sync` with `{ csv, season? }`. Read-only by
 * construction: this endpoint has no branch that writes, so the report cannot
 * be a side effect of anything. Applying a plan is a separate endpoint, still to
 * be written, and this one stays the way to look before that exists.
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

    const { csv, season } =
      typeof body === 'object' && body !== null
        ? (body as { csv?: unknown; season?: unknown })
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
      season: typeof season === 'string' && season.trim() !== '' ? season.trim() : seasonFor(new Date()),
    })

    return json({ plan, rowsRead: parsed.rows.length, storedTotal: stored.docs.length })
  },
  method: 'post',
  path: '/sync',
}
