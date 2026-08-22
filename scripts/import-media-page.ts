/**
 * Seed the `pages` collection with the club's media page — the old site's
 * "PHOTOS DIVERSES" and "VIDEOS Rando SANTE" sections, as links out to where
 * the photos and videos now actually live.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-media-page.ts
 *   pnpm payload run scripts/import-media-page.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/import-media-page.ts
 *
 * The page answers at `/photos-et-videos`, served by the `[slug]` route like
 * any other document.
 *
 * Nothing is uploaded: the albums are on Google Photos and the videos on the
 * association's YouTube channel, and the page is a `mediaLinks` block pointing
 * at them. That is what makes the next album an editor's job rather than a
 * deploy — they add a row, and the card appears.
 *
 * Configured through the environment, not flags: the payload CLI does not
 * forward extra argv to a script. DRY_RUN=1 reports without writing, SLUG=…
 * overrides the address, FORCE=1 replaces a document already at that slug, and
 * a remote database needs ALLOW_REMOTE_DB=1.
 *
 * Reruns are safe: the page is matched on its slug and skipped if it already
 * exists. FORCE=1 overwrites, which discards whatever an editor has since added
 * to the page — every album row included. It is for fixing a bad first import,
 * not for updating a page that is live.
 *
 * The page is created published, and `showInNav` defaults on, so it enters the
 * menu on its own — nothing has to be added to the Header global by hand.
 *
 * One step is left to a person, against a deployment that is already running:
 * open the page in the admin and save it. This process cannot refresh the
 * site's caches — see the note on `disableRevalidate` below — so until that
 * save, the running site serves the menu it had cached before the page existed.
 */
import { heading, link, paragraph, richText, textNode } from './lexical'

const CONTACT_MAILTO =
  'mailto:randonneestouloises@gmail.com?subject=Photos%20des%20Randonn%C3%A9es%20Touloises'

/**
 * The channel leads, and the albums follow it.
 *
 * Not for prominence: an editor adds the next album at the end of the list, so
 * anything that should stay findable a year from now has to sit above the
 * additions rather than be pushed down by them. The channel is the one
 * destination here that never goes out of date.
 */
const mediaLinks = [
  {
    platform: 'youtube' as const,
    title: 'La chaîne du club',
    description:
      'Les vidéos des sorties et des séjours, dont celles de la Randonnée Santé, réunies sur la chaîne de l’association.',
    url: 'https://www.youtube.com/channel/UCQFwjYStaA6vnfWkRaFJteA',
  },
  {
    platform: 'googlePhotos' as const,
    title: 'Photos diverses',
    description: 'Les photos des sorties et des moments de la vie du club, au fil de l’année.',
    url: 'https://photos.app.goo.gl/wgBqzox1M9T1ounr9',
  },
  {
    platform: 'googlePhotos' as const,
    title: 'Randonnée Santé',
    description: 'Le groupe Randonnée Santé, qui marche le mardi sur 5 à 6 kilomètres.',
    url: 'https://photos.app.goo.gl/RsGG1M6U9z5w7q3v7',
  },
  {
    platform: 'googlePhotos' as const,
    title: 'Marche gourmande',
    description: 'Les photos de la marche gourmande.',
    url: 'https://photos.app.goo.gl/BvYMLjczR2Hq7ePo7',
  },
  {
    platform: 'googlePhotos' as const,
    title: 'Barbecue',
    description: 'Les photos du barbecue de l’association.',
    url: 'https://photos.app.goo.gl/itjapoDJPibfLjNM9',
  },
]

const layout = [
  {
    blockType: 'mediaLinks' as const,
    items: mediaLinks,
  },
  {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        richText: richText(
          heading('h2', 'Comment ça marche'),
          paragraph(
            textNode(
              'Les albums sont hébergés sur Google Photos et les vidéos sur la chaîne YouTube de ' +
                'l’association. Une carte s’ouvre dans un nouvel onglet : ni compte ni installation ' +
                'ne sont nécessaires pour regarder. De nouveaux albums s’ajoutent au fil des sorties.',
            ),
          ),
          paragraph(
            textNode(
              'L’association applique le Règlement européen sur la protection des données ' +
                'personnelles aux photos qu’elle publie ; le ',
            ),
            link('règlement intérieur', '/terms'),
            textNode(' le rappelle.'),
          ),
        ),
        enableLink: false,
      },
    ],
  },
  {
    blockType: 'cta' as const,
    richText: richText(
      heading('h2', 'Une photo à partager ?'),
      paragraph(
        textNode(
          'Envoyez-nous vos clichés de sortie, ils rejoindront l’album. Et si vous préférez ne pas ' +
            'apparaître sur une photo déjà en ligne, dites-le nous : elle sera retirée.',
        ),
      ),
    ),
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Écrire à l’association',
          url: CONTACT_MAILTO,
          isExternal: true,
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'Utiliser le formulaire de contact',
          url: '/contact',
        },
      },
    ],
  },
]

const main = async () => {
  /* Compared to '1', not coerced: `Boolean('0')` is true, so a wrapper passing
   * FORCE=0 to mean "no" would have replaced a live page. The sibling import
   * scripts read their flags the same way. */
  const dryRun = process.env.DRY_RUN === '1'
  const force = process.env.FORCE === '1'
  const slug = process.env.SLUG || 'photos-et-videos'

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')

  const resolved = await config
  const connection = String(
    (resolved.db as unknown as { pool?: { connectionString?: string } })?.pool?.connectionString ??
      process.env.POSTGRES_URL ??
      '',
  )
  const isRemote = /@(?!localhost|127\.0\.0\.1)/.test(connection)

  if (isRemote && process.env.ALLOW_REMOTE_DB !== '1') {
    console.error('Refusing to write to a remote database without ALLOW_REMOTE_DB=1.')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  const { docs: pages } = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })

  if (pages[0] && !force) {
    console.log(`Page /${slug} already exists (id ${pages[0].id}). FORCE=1 to replace it.`)
    process.exit(0)
  }

  if (dryRun) {
    console.log(
      `Would ${pages[0] ? 'replace' : 'create'} page /${slug} with ${mediaLinks.length} links.`,
    )
    process.exit(0)
  }

  const data = {
    _status: 'published' as const,
    title: 'Photos et vidéos',
    slug,
    hero: {
      type: 'lowImpact' as const,
      richText: richText(
        heading('h1', 'Photos et vidéos'),
        paragraph(
          textNode(
            'Les albums des sorties et les vidéos du club, sur Google Photos et sur notre chaîne ' +
              'YouTube. Aucun compte n’est nécessaire pour les regarder.',
          ),
        ),
      ),
    },
    layout,
    meta: {
      title: 'Photos et vidéos',
      description:
        'Les albums photos et les vidéos des Randonnées Touloises : les sorties, la Randonnée ' +
        'Santé, la marche gourmande et le barbecue, sur Google Photos et YouTube.',
    },
  }

  /* The afterChange hook calls `revalidatePath` and `revalidateTag`, and both
   * need a Next request to be inside of: from a CLI process they throw
   * `Invariant: static generation store missing`. Hence suppressing them.
   *
   * Which leaves a running deployment serving its cached page and, because the
   * menu is derived from this collection, its cached menu — neither aware of
   * what was just written. Nothing callable from out here fixes that, so the
   * script says what does rather than letting it be discovered. */
  const context = { disableRevalidate: true }

  if (pages[0]) {
    await payload.update({ collection: 'pages', id: pages[0].id, context, data })
    console.log(`  replaced page /${slug} (id ${pages[0].id})`)
  } else {
    const created = await payload.create({ collection: 'pages', context, data })
    console.log(`  created page /${slug} (id ${created.id})`)
  }

  console.log(
    `\nOne step left, in the admin: open /${slug} and press Save.\n` +
      `A running site is still serving the menu and the page it had cached before this` +
      ` write,\nand that save fires the revalidation this process cannot.`,
  )
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
