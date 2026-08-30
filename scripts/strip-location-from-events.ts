/**
 * Remove the meeting point from an event's body, now that the field holds it.
 *
 *   DRY_RUN=1 pnpm payload run scripts/strip-location-from-events.ts
 *   pnpm payload run scripts/strip-location-from-events.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/strip-location-from-events.ts
 *
 * DO NOT RUN THIS UNTIL THE AGENDA RENDERS `startLocation`. The place is on the
 * site today only because it is written in the body; taking the lines out before
 * something prints the field would leave walkers with no meeting point at all.
 * Run it in the deploy that starts rendering the field, not before.
 *
 * Two lines go, and only two:
 *
 *     BOUCQ (terrain de foot)          ← the place, now `startLocation`
 *     Animateur : Jean-Luc                stays
 *     km : 10,0 · D+ : 125 m              stays
 *     Lieu de départ : https://…       ← the pin, now latitude/longitude
 *
 * Everything else is left exactly as the club wrote it. That matters more than
 * it sounds: some events carry a *second* map link for the covoiturage point
 * (« Covoiturage aire de Gondreville sortie du village à 13:30 ») and one names
 * a bus (« Départ bus à 08H20 (Arsenal) »). Those are places the location field
 * does not hold, so they stay until something models them.
 *
 * Nothing is removed on a guess. The place line goes only when it parses back to
 * the very location the event points at — same commune, same spot, compared the
 * same accent-blind way the import matched them — so an event whose first line
 * was edited since the import keeps it. The « Lieu de départ » line goes only
 * when the URL on it is a map; the interclubs day, whose line carries an
 * inscription form, keeps both the line and the form.
 *
 * Reruns are safe: an event with nothing left to strip is skipped, so this can
 * be run again after new events arrive. Every write makes a version, so an
 * editor can restore a body from the admin if one comes out wrong.
 */
import type { Event, Location } from '@/payload-types'

import {
  dedupeKey,
  departureLine,
  paragraphs,
  parsePlace,
} from '@/collections/Events/startLocationText'

const DRY_RUN = Boolean(process.env.DRY_RUN)
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined

type LexicalRoot = { root: { children: unknown[] } }

/** An empty paragraph, so a body stripped to nothing is still a valid document. */
const emptyParagraph = {
  type: 'paragraph' as const,
  children: [],
  direction: null,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
}

/**
 * Which paragraphs of this event's body the location has made redundant.
 *
 * Indices into the body as stored, which is why `paragraphs` keeps the blank
 * ones: dropping them first would shift everything after them and strip the
 * wrong line.
 */
const redundant = (event: Event, location: Location): { index: number; text: string }[] => {
  const body = paragraphs(event.content)
  const remove = new Set<number>()

  const [first] = body.filter(({ text }) => text)
  const place = first ? parsePlace(first.text) : null

  /* The place line, but only if it is provably the location the event points
   * at — otherwise an edited first line would be deleted on the strength of
   * nothing. */
  if (
    first &&
    place &&
    dedupeKey(place.commune, place.spot) === dedupeKey(location.commune, location.spot)
  ) {
    remove.add(first.index)
  }

  /* The « Lieu de départ » line, and the URL after it when that is where the
   * link lived. Only when it is a map: a line carrying an inscription form is
   * not a meeting point and the field does not hold it. */
  const departure = departureLine(event.content)

  if (departure?.url) {
    remove.add(departure.index)

    if (departure.urlIndex !== undefined) remove.add(departure.urlIndex)
  }

  return body.filter(({ index }) => remove.has(index))
}

async function main() {
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const { docs: events } = await payload.find({
    collection: 'events',
    depth: 1,
    limit: LIMIT ?? 1000,
    pagination: false,
    sort: 'date',
  })

  const report = { skipped: 0, stripped: 0, unlinked: 0 }

  for (const event of events.slice(0, LIMIT ?? events.length)) {
    const label = `${event.date?.slice(0, 10) ?? '????'} ${event.title}`
    const location = event.startLocation

    /* No location means nothing has been proven about this body. Run the import
     * first; it is what earns the right to delete anything. */
    if (!location || typeof location === 'number') {
      report.unlinked++
      console.log(`  - ${label}: no start location, left alone`)
      continue
    }

    const cut = redundant(event, location)

    if (!cut.length) {
      report.skipped++
      continue
    }

    const dropped = new Set(cut.map(({ index }) => index))
    const children = ((event.content as unknown as LexicalRoot).root.children ?? []).filter(
      (_, index) => !dropped.has(index),
    )

    console.log(`\n  ${label}  → ${location.title}`)
    cut.forEach(({ text }) => console.log(`      − ${text}`))

    if (!DRY_RUN) {
      await payload.update({
        collection: 'events',
        context: { disableRevalidate: true },
        data: {
          content: {
            ...(event.content as unknown as LexicalRoot),
            root: {
              ...(event.content as unknown as LexicalRoot).root,
              children: children.length ? children : [emptyParagraph],
            },
          } as Event['content'],
        },
        id: event.id,
      })
    }

    report.stripped++
  }

  console.log(
    `\n${DRY_RUN ? '[dry run] ' : ''}${report.stripped} events stripped, ` +
      `${report.skipped} already clean, ${report.unlinked} without a start location.`,
  )
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
