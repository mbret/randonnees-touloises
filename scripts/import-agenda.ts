/**
 * Seed the `events` collection with the club's programme as printed on the
 * previous randonnees-touloises.net site.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-agenda.ts
 *   pnpm payload run scripts/import-agenda.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/import-agenda.ts
 *
 * The source is scripts/data/agenda.ts, where each outing's details are still
 * plain text. Every line becomes a paragraph and every bare URL a real link, so
 * what lands in the CMS is rich text an editor can rework rather than a blob.
 *
 * Configured through the environment, not flags: the payload CLI does not forward
 * extra argv to a script. DRY_RUN=1 reports without writing, LIMIT=N takes the
 * first N outings, and a remote database needs ALLOW_REMOTE_DB=1.
 *
 * Reruns are safe: an event is matched on its date plus title plus start time and
 * skipped if it already exists, so the script tops up rather than duplicating.
 */
import { agendaOutings, type SeedOuting } from './data/agenda'
import { dayInFrance } from '@/components/agenda/groupOutings'

const urlPattern = /(https?:\/\/\S+)/g

const isUrl = (value: string) => /^https?:\/\//.test(value)

/** A lexical text node, with the flags the editor expects on every one. */
const textNode = (text: string) => ({
  type: 'text' as const,
  detail: 0,
  format: 0,
  mode: 'normal' as const,
  style: '',
  text,
  version: 1,
})

const linkNode = (url: string) => ({
  type: 'link' as const,
  children: [textNode(url)],
  direction: 'ltr' as const,
  fields: { linkType: 'custom' as const, newTab: true, url },
  format: '' as const,
  indent: 0,
  version: 3,
})

const paragraphNode = (line: string) => ({
  type: 'paragraph' as const,
  children: line
    .split(urlPattern)
    .filter((part) => part !== '')
    .map((part) => (isUrl(part) ? linkNode(part) : textNode(part))),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

/**
 * The plain-text details as a lexical document: one paragraph per line, blank
 * lines dropped since the paragraph spacing already separates the items.
 */
const toRichText = (content: string) => ({
  root: {
    type: 'root' as const,
    children: content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map(paragraphNode),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const main = async () => {
  const dryRun = Boolean(process.env.DRY_RUN)
  const limit = Number(process.env.LIMIT) || 0

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')

  const resolved = await config
  const connection = String(
    (resolved.db as unknown as { pool?: { connectionString?: string } })?.pool?.connectionString ??
      process.env.POSTGRES_URL ??
      '',
  )
  const isRemote = /@(?!localhost|127\.0\.0\.1)/.test(connection)

  if (isRemote && !process.env.ALLOW_REMOTE_DB) {
    console.error('Refusing to write to a remote database without ALLOW_REMOTE_DB=1.')
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const outings: SeedOuting[] = limit ? agendaOutings.slice(0, limit) : agendaOutings

  const days = outings.map((outing) => outing.date).sort()
  const DAY_MS = 24 * 60 * 60 * 1000

  /**
   * Everything already stored anywhere near the seed's span, in one query. The
   * window is cast a day wide either side because a date saved through the admin
   * picker is midnight in the editor's timezone — up to two hours inside the
   * neighbouring UTC day — so the identity check happens on the Paris day rather
   * than on the raw instant.
   */
  const { docs: existing } = await payload.find({
    collection: 'events',
    depth: 0,
    draft: true,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { date: { greater_than_equal: new Date(`${days[0]}T00:00:00Z`).getTime() - DAY_MS } },
        { date: { less_than_equal: new Date(`${days.at(-1)}T00:00:00Z`).getTime() + DAY_MS } },
      ],
    },
  })

  const identity = (outing: { date: string; startTime?: string | null; title: string }) =>
    `${outing.date}|${outing.startTime ?? ''}|${outing.title}`

  const present = new Set(
    existing.map((doc) =>
      identity({ date: dayInFrance(doc.date), startTime: doc.startTime, title: doc.title }),
    ),
  )

  let created = 0
  let skipped = 0

  for (const outing of outings) {
    const label = `${outing.date} ${outing.startTime ?? '--:--'} ${outing.title}`

    if (present.has(identity(outing))) {
      skipped++
      console.log(`  skipped ${label} (already present)`)
      continue
    }

    if (dryRun) {
      created++
      console.log(`  would create ${label}`)
      continue
    }

    await payload.create({
      collection: 'events',
      // The afterChange hook calls revalidatePath, which throws outside a Next
      // request. Nothing is serving pages from this process anyway.
      context: { disableRevalidate: true },
      data: {
        _status: 'published',
        content: toRichText(outing.content),
        date: `${outing.date}T00:00:00.000Z`,
        endTime: outing.endTime,
        startTime: outing.startTime,
        title: outing.title,
      },
    })

    present.add(identity(outing))
    created++
    console.log(`  created ${label}`)
  }

  console.log(
    `${dryRun ? 'Would create' : 'Created'} ${created}, skipped ${skipped}, of ${outings.length}.`,
  )
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
