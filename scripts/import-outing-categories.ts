/**
 * Give every event an `outingCategory`, read out of the title it was written
 * into.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-outing-categories.ts
 *   pnpm payload run scripts/import-outing-categories.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/import-outing-categories.ts
 *
 * The kind of walk has always been the event's title — « Petite », « Grande »,
 * « Nordique » — so that is what this reads. A title that is exactly a
 * category's name says nothing the category will not say, so the event takes
 * the category and gives up the title: the same word in two places is the one
 * an editor updates in one of them. Nothing moves on the page, because the
 * agenda already prints the category where an event has no title of its own.
 *
 * The five are the ones the club advertises, and the ones the media library
 * holds a logo for. The logos are not attached here: there are five, and
 * picking each in the admin is quicker and surer than matching filenames from a
 * script — which is also why a rerun never touches a category that exists.
 *
 * Anything else is left exactly as it is, and reported: « Journée », « Moyenne
 * », « Marche Breathwalk », « Journée interclubs santé ». Some are a format
 * rather than a kind of walk, one names two categories at once, and none of
 * them is a decision a string match should make on the club's behalf. They are
 * a handful of events, listed with their dates, and a minute in the admin.
 *
 * Configured through the environment, not flags: the payload CLI does not
 * forward extra argv to a script. DRY_RUN=1 reports without writing, LIMIT=N
 * takes the first N events, and a remote database needs ALLOW_REMOTE_DB=1 —
 * that refusal lives in payload.config.ts and covers every script here.
 *
 * Reruns are safe, and largely inert: an event that already has a category is
 * left alone, and a category already in the collection is reused as it stands.
 * So this tops up after new events arrive without revisiting what has been
 * decided, and without overwriting a logo or a summary edited by hand.
 */
const DRY_RUN = Boolean(process.env.DRY_RUN)
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined

/**
 * The club's five, in the order it lists them rather than alphabetically, with
 * the distances exactly as the activities page announces them.
 *
 * The slug is given rather than left to generate: Payload's slugify drops any
 * character outside `[A-Za-z0-9_-]`, so « Santé » would become `sant`.
 *
 * No `logo`. The five pictograms are already in the media library —
 * `logo-grand-outing.png` and its siblings — and they are picked in the admin,
 * where you can see which is which.
 */
const CATEGORIES = [
  { slug: 'grande', sortOrder: 10, summary: '11 à 15 km', title: 'Grande' },
  { slug: 'petite', sortOrder: 20, summary: '8 à 11 km', title: 'Petite' },
  { slug: 'douce', sortOrder: 30, summary: '6 à 7 km', title: 'Douce' },
  { slug: 'sante', sortOrder: 40, summary: '5 à 6 km', title: 'Santé' },
  { slug: 'nordique', sortOrder: 50, summary: 'Séance d’environ 2 heures', title: 'Nordique' },
]

/** Case- and accent-blind, so « SANTÉ » and « Santé » land on the same row. */
const key = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

async function main() {
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const { docs: existing } = await payload.find({
    collection: 'outingCategories',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  type Category = (typeof existing)[number]

  const bySlug = new Map(existing.map((category) => [category.slug, category]))
  const byName = new Map<string, Category>()
  let created = 0

  for (const category of CATEGORIES) {
    let doc = bySlug.get(category.slug)

    if (!doc) {
      doc = DRY_RUN
        ? ({ id: -1, ...category } as Category)
        : await payload.create({
            collection: 'outingCategories',
            // Same reason as the event updates below, and now a hard one: the
            // collection's afterChange hook calls revalidatePath, which throws
            // outside a Next request.
            context: { disableRevalidate: true },
            data: category,
          })

      created++
      console.log(`  + ${category.title}`)
    }

    byName.set(key(category.title), doc)
  }

  const { docs: events } = await payload.find({
    collection: 'events',
    depth: 0,
    limit: LIMIT ?? 1000,
    pagination: false,
    sort: 'date',
  })

  const report = { linked: 0, skipped: 0, untouched: [] as string[] }

  for (const event of events) {
    const label = `${event.date?.slice(0, 10) ?? '????'} ${event.title ?? '(sans intitulé)'}`

    if (event.outingCategory) {
      report.skipped++
      continue
    }

    const category = event.title ? byName.get(key(event.title)) : undefined

    if (!category) {
      report.untouched.push(label)
      continue
    }

    if (!DRY_RUN) {
      /* The card reads the same either way — the title said « Petite » and the
       * category says « Petite » — so there is nothing for the agenda to
       * re-render, and a bulk backfill has no business dropping the home page
       * once per event. */
      await payload.update({
        collection: 'events',
        context: { disableRevalidate: true },
        data: { outingCategory: category.id, title: null },
        id: event.id,
      })
    }

    report.linked++
    console.log(`  → ${label}  ⇒  ${category.title}`)
  }

  console.log(
    `\n${DRY_RUN ? '[dry run] ' : ''}${report.linked} events categorised, ` +
      `${created} categories created, ${report.skipped} already had one.`,
  )

  if (report.untouched.length) {
    console.log(
      `\nLeft exactly as they are (${report.untouched.length}) — not one of the five, so yours to decide:`,
    )
    report.untouched.forEach((line) => console.log(`  ? ${line}`))
  }
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
