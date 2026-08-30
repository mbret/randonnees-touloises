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
 * (ancienne Gare) », which are one car park. Where two events pin the same
 * place differently — and every repeated place in the seed data does, by six to
 * twenty-seven metres — the first pin is kept and the disagreement is reported
 * rather than averaged. A metre or two is the animateur's finger; anything more
 * is a question for a human.
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
import type { Event } from '@/payload-types'

import { parseCoordinates, type Coordinates } from '@/utilities/mapCoordinates'

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

/** Words a French place name keeps in lower case once it is not the first. */
const PARTICLES = new Set(['aux', 'de', 'des', 'du', 'en', 'et', 'la', 'le', 'les', 'sous', 'sur'])

const capitalise = (word: string) =>
  word
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-')

/**
 * « VILLEY LE SEC » → « Villey le Sec ».
 *
 * The club types communes in capitals, which is a shout on a web page rather
 * than a name. Hyphens are not invented on the way — the commune really is
 * « Villey-le-Sec » — because guessing which spaces are hyphens across forty
 * places would get some of them wrong silently, and they are one edit each now
 * that there is one row per place instead of one line per event.
 */
const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && PARTICLES.has(word.toLowerCase()) ? word.toLowerCase() : capitalise(word),
    )
    .join(' ')

/** Case- and accent-blind, so two spellings of one car park land on one row. */
const dedupeKey = (commune: string, spot?: string) =>
  [commune, spot ?? '']
    .map((value) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .join('|')

type LexicalNode = {
  children?: LexicalNode[]
  fields?: { url?: string }
  root?: LexicalNode
  text?: string
  type?: string
}

/** Every top-level paragraph of an event's body, as the plain line it was. */
const lines = (content: Event['content']): string[] => {
  const root = (content as LexicalNode | null | undefined)?.root

  return (root?.children ?? [])
    .map((paragraph) => {
      const text = (node: LexicalNode): string => {
        if (typeof node.text === 'string') return node.text

        return (node.children ?? []).map(text).join('')
      }

      return text(paragraph).replace(/\s+/g, ' ').trim()
    })
    .filter(Boolean)
}

/** Any link target in the body, since the importer made the URLs real links. */
const linkUrls = (content: Event['content']): string[] => {
  const found: string[] = []

  const walk = (node: LexicalNode) => {
    if (node.type === 'link' && node.fields?.url) found.push(node.fields.url)
    if (node.root) walk(node.root)
    ;(node.children ?? []).forEach(walk)
  }

  walk((content ?? {}) as LexicalNode)

  return found
}

/** « BOUCQ (terrain de foot) » → the two halves the collection stores. */
export const parsePlace = (line: string): { commune: string; spot?: string } | null => {
  const match = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(line.trim())

  if (match) {
    const commune = titleCase(match[1])
    const spot = match[2].trim()

    return commune ? { commune, ...(spot ? { spot } : {}) } : null
  }

  const commune = titleCase(line)

  return commune ? { commune } : null
}

/**
 * Whether a URL is a map at all.
 *
 * Events carry other links — an inscription form, the animateur's write-up —
 * and taking the first one on the page put a Google Form in the « no pin »
 * column and would have put it in the location had it parsed.
 */
const isMapLink = (url: string) => /maps\.|maps\/|goo\.gl|osm\.org|openstreetmap|^geo:/i.test(url)

/**
 * The « Lieu de départ » target, or any map link in the body.
 *
 * Two layouts, both real. Usually the URL sits on the label's own line; but an
 * event may end « Lieu de départ : » with the link on the next paragraph, and
 * that same event may carry a *second* map link further up for the covoiturage
 * point. Reading only the label's line there falls through to « any map link »,
 * which is a coin toss between the start and the car share — so the line after
 * the label is read too, before any fallback.
 */
const mapLink = (event: Event): string | undefined => {
  const body = lines(event.content)
  const label = body.findIndex((line) => /lieu de d[ée]part/i.test(line))

  if (label >= 0) {
    const onTheLine = body[label].match(/https?:\/\/\S+/)?.[0]

    if (onTheLine) return onTheLine

    const onTheNext = body[label + 1]?.match(/^https?:\/\/\S+$/)?.[0]

    if (onTheNext && isMapLink(onTheNext)) return onTheNext
  }

  return linkUrls(event.content).find(isMapLink)
}

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

    const link = mapLink(event)
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

        if (apart > PIN_TOLERANCE_M) {
          conflicts.push(
            apart > SAME_PLACE_MAX_M
              ? `${location.title ?? key}: ${label} pins it ${apart} m away — too far to be the same place, so one of the two links is wrong and the one kept may be the wrong one. Fix the event BEFORE the real run: a rerun does not re-derive a pin.`
              : `${location.title ?? key}: ${label} pins it ${apart} m from the pin already stored — keeping the first`,
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
