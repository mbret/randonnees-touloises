/**
 * Give every event a `startLocation`, read out of the body text it was written
 * into.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-event-locations.ts
 *   pnpm payload run scripts/import-event-locations.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/import-event-locations.ts
 *
 * The club's agenda has always printed the meeting point as two lines — the
 * place on the first, « Lieu de départ : <lien Google Maps> » further down — so
 * that is what this reads. The commune and the spot come out of « BOUCQ
 * (terrain de foot) »; the pin comes from resolving the short link, since
 * `maps.app.goo.gl` gives up its coordinates only in what it redirects to.
 *
 * Deduplicating is the point of the exercise, so the key ignores case and
 * accents: the same six weeks hold « MARON (ancienne gare) » and « MARON
 * (ancienne Gare) », which are one car park. Nothing beyond that is merged —
 * « Les Acacias » and « Acacias » stay apart, and near-misses are reported for
 * a human to judge, because a village can have two meeting points on purpose.
 *
 * Where two events pin one place differently, a few metres is the animateur's
 * finger and the first is kept; past half a kilometre one of the two links is
 * simply wrong and neither is kept, since guessing would store the error as
 * fact.
 *
 * Configured through the environment, not flags: the payload CLI does not
 * forward extra argv to a script. DRY_RUN=1 reports without writing, LIMIT=N
 * takes the first N events, and a remote database needs ALLOW_REMOTE_DB=1.
 *
 * Reruns are safe, and are also inert: an event that already points at a
 * location is left alone, and a location already in the collection is reused as
 * it stands. So this tops up after new events are added, but it never revisits
 * what it has already decided — correcting a bad link in an event and running
 * again will not move the pin. That is what the report is for, and why it is
 * worth reading a dry run to the end before dropping DRY_RUN.
 *
 * The body text is deliberately left untouched. Nothing renders `startLocation`
 * yet, so stripping the lines it was read from would take the meeting point off
 * the site; they come out when the agenda starts printing the field instead.
 */
import { parseCoordinates, type Coordinates } from '@/utilities/mapCoordinates'
import { dedupeKey, lines, parsePlace, startMapLink } from '@/collections/Events/startLocationText'

const DRY_RUN = Boolean(process.env.DRY_RUN)
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined

/**
 * Who we say we are, and it matters more than it looks.
 *
 * Sent a full desktop Chrome string — which is what the sibling importers use to
 * get files off the old site — `maps.app.goo.gl` answers 200 with a JavaScript
 * interstitial instead of the 302 it gives everyone else, because it believes a
 * browser is there to run the app. The short link then resolves to itself and
 * every pin comes back empty. Anything that does not claim to be a browser gets
 * the redirect, so this says plainly what it is.
 */
const USER_AGENT =
  'Mozilla/5.0 (compatible; RandonneesTouloisesBot/1.0; +https://randonnees-touloises.net)'

/** How far two pins for one place may sit apart before it is worth a mention. */
const PIN_TOLERANCE_M = 3

/**
 * Past this, two pins are not one car park pinned twice — a village hall does
 * not move half a kilometre — so the club's data has a wrong link in it and the
 * report should say so rather than shrug about metres.
 */
const SAME_PLACE_MAX_M = 500

/** How close two *differently named* places must sit to be worth merging. */
const NEAR_DUPLICATE_M = 200

/**
 * What a short link points at.
 *
 * `maps.app.goo.gl` answers 302 with the real URL in `Location`, and only that
 * URL carries the coordinates. Followed by hand rather than with
 * `redirect: 'follow'` so nothing downloads a map page to read a header.
 */
const resolveLink = async (url: string): Promise<string> => {
  let current = url

  for (let hop = 0; hop < 5; hop++) {
    if (!/goo\.gl|g\.co/i.test(current)) return current

    const response = await fetch(current, {
      headers: { 'user-agent': USER_AGENT },
      redirect: 'manual',
    })
    const next = response.headers.get('location')

    if (!next) return current

    current = new URL(next, current).toString()
  }

  return current
}

/** Metres between two pins, close enough at this scale for a « same place? ». */
const metresApart = (a: Coordinates, b: Coordinates) => {
  const latitudeMetres = (a.latitude - b.latitude) * 111_320
  const longitudeMetres =
    (a.longitude - b.longitude) * 111_320 * Math.cos((a.latitude * Math.PI) / 180)

  return Math.round(Math.hypot(latitudeMetres, longitudeMetres))
}

async function main() {
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const { docs: events } = await payload.find({
    collection: 'events',
    depth: 0,
    limit: LIMIT ?? 1000,
    pagination: false,
    sort: 'date',
  })

  const { docs: existing } = await payload.find({
    collection: 'locations',
    depth: 0,
    limit: 1000,
    pagination: false,
  })

  /* Everything already in the collection, so a rerun reuses rather than adds. */
  const known = new Map(
    existing.map((location) => [dedupeKey(location.commune, location.spot ?? undefined), location]),
  )

  const resolved = new Map<string, null | string>()
  const report = { created: 0, linked: 0, reused: 0, skipped: 0, unresolved: [] as string[] }
  const conflicts: string[] = []

  for (const event of events.slice(0, LIMIT ?? events.length)) {
    const label = `${event.date?.slice(0, 10) ?? '????'} ${event.title}`

    if (event.startLocation) {
      report.skipped++
      continue
    }

    const [first] = lines(event.content)
    const place = first ? parsePlace(first) : null

    if (!place) {
      report.unresolved.push(`${label}: no place on the first line`)
      continue
    }

    const link = startMapLink(event.content)
    let coordinates: Coordinates | null = null

    if (link) {
      if (!resolved.has(link)) {
        try {
          resolved.set(link, await resolveLink(link))
        } catch (error) {
          resolved.set(link, null)
          report.unresolved.push(`${label}: ${link} did not resolve (${String(error)})`)
        }
      }

      coordinates = parseCoordinates(resolved.get(link) ?? undefined)

      if (link && !coordinates) report.unresolved.push(`${label}: no pin in ${link}`)
    } else {
      report.unresolved.push(`${label}: no map link in the body`)
    }

    const key = dedupeKey(place.commune, place.spot)
    let location = known.get(key)

    if (location) {
      report.reused++

      const pinned =
        typeof location.latitude === 'number' && typeof location.longitude === 'number'
          ? { latitude: location.latitude, longitude: location.longitude }
          : null

      if (coordinates && pinned) {
        const apart = metresApart(coordinates, pinned)

        if (apart > SAME_PLACE_MAX_M) {
          /* Neither pin survives. Past half a kilometre one of the two links is
           * simply wrong, and nothing here can tell which — the one already
           * stored is only "first by date", which on the club's own Villey-
           * Saint-Étienne outings is the one twelve kilometres away. Keeping
           * either would be a coin toss stored as fact, and a rerun does not
           * revisit it. So the place keeps its name, loses its pin, and says
           * so: a location visibly missing a pin invites the one edit that
           * fixes it, where a confident wrong one invites nothing. */
          conflicts.push(
            `${location.title ?? key}: ${label} pins it ${apart} m away — too far to be the same place, so one of the two links is wrong. Pin dropped rather than guessed; set it by hand, and fix the wrong link in the event.`,
          )

          if (!DRY_RUN) {
            await payload.update({
              collection: 'locations',
              context: { disableRevalidate: true },
              data: { latitude: null, longitude: null },
              id: location.id,
            })
          }

          location = { ...location, latitude: null, longitude: null }
          known.set(key, location)
        } else if (apart > PIN_TOLERANCE_M) {
          conflicts.push(
            `${location.title ?? key}: ${label} pins it ${apart} m from the pin already stored — keeping the first`,
          )
        }
      }
    } else {
      const data = {
        commune: place.commune,
        ...(place.spot ? { spot: place.spot } : {}),
        ...(coordinates ?? {}),
      }

      location = DRY_RUN
        ? ({
            id: -1,
            ...data,
            title: `${place.commune}${place.spot ? ` (${place.spot})` : ''}`,
          } as (typeof existing)[number])
        : await payload.create({
            collection: 'locations',
            context: { disableRevalidate: true },
            data,
          })

      known.set(key, location)
      report.created++
      console.log(`  + ${location.title}${coordinates ? '' : '  (no pin)'}`)
    }

    if (!DRY_RUN) {
      await payload.update({
        collection: 'events',
        context: { disableRevalidate: true },
        data: { startLocation: location.id },
        id: event.id,
      })
    }

    report.linked++
  }

  console.log(
    `\n${DRY_RUN ? '[dry run] ' : ''}${report.linked} events linked, ` +
      `${report.created} locations created, ${report.reused} reused, ` +
      `${report.skipped} already had one.`,
  )

  if (conflicts.length) {
    console.log(`\nPins that disagree (${conflicts.length}) — worth a look:`)
    conflicts.forEach((line) => console.log(`  ! ${line}`))
  }

  /**
   * Two names for one place, which the key cannot catch: « salle Bouchot » and
   * « salle des Fêtes » are the same hall in Chaudeney, one metre apart, and
   * « Les Acacias » and « Acacias » are ten. Reported rather than merged — a
   * village can genuinely have two meeting points a hundred metres apart, and
   * collapsing those would lose a distinction the club draws on purpose.
   */
  const pinned = [...known.values()].flatMap((location) =>
    typeof location.latitude === 'number' && typeof location.longitude === 'number'
      ? [{ at: { latitude: location.latitude, longitude: location.longitude }, location }]
      : [],
  )
  const nearDuplicates = pinned.flatMap(({ at, location }, index) =>
    pinned.slice(index + 1).flatMap((other) => {
      const apart = metresApart(at, other.at)

      return apart <= NEAR_DUPLICATE_M
        ? [`${apart} m apart: « ${location.title} » and « ${other.location.title} »`]
        : []
    }),
  )

  if (nearDuplicates.length) {
    console.log(
      `\nDifferent names, nearly the same spot (${nearDuplicates.length}) — merge by hand if they are one place:`,
    )
    nearDuplicates.forEach((line) => console.log(`  = ${line}`))
  }

  if (report.unresolved.length) {
    console.log(`\nNo pin found (${report.unresolved.length}) — the location was still created:`)
    report.unresolved.forEach((line) => console.log(`  ? ${line}`))
  }
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
