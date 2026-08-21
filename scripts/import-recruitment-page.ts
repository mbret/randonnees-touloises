/**
 * Seed the `pages` collection with the recruitment appeal, so the CMS version of
 * "On recrute" can be looked at next to the hardcoded one before either is kept.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-recruitment-page.ts
 *   pnpm payload run scripts/import-recruitment-page.ts
 *   SLUG=devenir-animateur FORCE=1 pnpm payload run scripts/import-recruitment-page.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/import-recruitment-page.ts
 *
 * The default slug is `devenir-animateur-cms`, not `devenir-animateur`: a route
 * file shadows a page document sharing its address, so seeding onto the real
 * slug while `src/app/(frontend)/devenir-animateur/page.tsx` exists would write a
 * document nothing ever renders. Two slugs means both versions answer at once
 * and can be compared side by side.
 *
 * Configured through the environment, not flags: the payload CLI does not forward
 * extra argv to a script. DRY_RUN=1 reports without writing, SLUG=… overrides the
 * address, FORCE=1 replaces a document already at that slug, and a remote
 * database needs ALLOW_REMOTE_DB=1.
 *
 * Reruns are safe: the page is matched on its slug and skipped if it already
 * exists, and the poster is matched on its filename so it is uploaded once.
 */
const POSTER = 'recrutement-animateurs.webp'

const POSTER_ALT =
  'Affiche : devenez animateur bénévole aux Randonnées Touloises. Proposez des randonnées, ' +
  'partagez votre passion, en toute convivialité. Aucune expérience exigée.'

const CONTACT_MAILTO =
  'mailto:randonneestouloises@gmail.com?subject=Devenir%20animateur%20b%C3%A9n%C3%A9vole'

/** A lexical text node, with the flags the editor expects on every one. */
const textNode = (text: string, format = 0) => ({
  type: 'text' as const,
  detail: 0,
  format,
  mode: 'normal' as const,
  style: '',
  text,
  version: 1,
})

/** `format: 1` is the bold bit the editor sets from its own toolbar. */
const boldNode = (text: string) => textNode(text, 1)

type Inline = ReturnType<typeof textNode>

/** The shape every lexical node shares, as the generated types describe it. */
type Node = { [k: string]: unknown; type: string; version: number }

const block = <T extends string>(type: T, children: Node[], extra: object = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

const paragraph = (...children: Inline[]) => block('paragraph', children, { textFormat: 0 })

const heading = (tag: 'h1' | 'h2' | 'h3', text: string) =>
  block('heading', [textNode(text)], { tag })

const bullets = (items: string[]) =>
  block(
    'list',
    items.map((item, index) =>
      block('listitem', [textNode(item)], { checked: undefined, value: index + 1 }),
    ),
    { listType: 'bullet', start: 1, tag: 'ul' },
  )

const richText = (...children: Node[]) => ({
  root: block('root', children),
})

/**
 * The three promises the poster makes, one per column of a Content block. The
 * hardcoded page draws these as icon cards; no block does that, so as CMS
 * content they are three thirds of plain rich text.
 */
const promises = [
  {
    title: 'Proposez des randonnées',
    body: 'Choisissez vos itinéraires, reconnaissez-les à votre rythme et faites découvrir les sentiers que vous aimez.',
  },
  {
    title: 'Partagez votre passion',
    body: 'Transmettez votre goût de la nature et de la marche à des adhérents de tous niveaux, du parcours santé à la grande randonnée.',
  },
  {
    title: 'En toute convivialité',
    body: 'Rejoignez une équipe de vingt animateurs et animatrices qui préparent les sorties ensemble et se relaient tout au long de l’année.',
  },
]

const layout = (posterId: number) => [
  {
    blockType: 'content' as const,
    columns: promises.map(({ title, body }) => ({
      size: 'oneThird' as const,
      richText: richText(heading('h3', title), paragraph(textNode(body))),
      enableLink: false,
    })),
  },
  {
    blockType: 'mediaBlock' as const,
    media: posterId,
  },
  {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        richText: richText(
          heading('h2', 'Aucune expérience exigée'),
          paragraph(
            textNode(
              'Pas besoin d’être un randonneur chevronné ni de posséder un diplôme : il suffit d’aimer la nature, la marche et la bonne humeur. L’association prend en charge la formation fédérale de ses animateurs et vous accompagne sur vos premières sorties, aux côtés d’un animateur expérimenté.',
            ),
          ),
          heading('h2', 'Ce que nous demandons'),
          bullets([
            'être adhérent de l’association et licencié à la FFRandonnée ;',
            'encadrer quelques sorties dans l’année, selon vos disponibilités — personne ne s’engage sur un rythme hebdomadaire ;',
            'reconnaître son parcours avant de le proposer, seul ou accompagné ;',
            'veiller à ce que le groupe marche en sécurité et rentre au complet.',
          ]),
        ),
        enableLink: false,
      },
    ],
  },
  {
    blockType: 'cta' as const,
    richText: richText(
      heading('h2', 'Rejoignez-nous'),
      paragraph(
        textNode(
          'Envie d’en discuter sans vous engager ? Écrivez-nous, ou venez en parler à un animateur lors d’une prochaine sortie.',
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
  const dryRun = Boolean(process.env.DRY_RUN)
  const force = Boolean(process.env.FORCE)
  const slug = process.env.SLUG || 'devenir-animateur-cms'

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
    console.log(`Would ${pages[0] ? 'replace' : 'create'} page /${slug} with the poster ${POSTER}.`)
    process.exit(0)
  }

  // The poster already ships in `public/`, so the upload reads it from there
  // rather than fetching the old site again.
  const { docs: media } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { filename: { equals: POSTER } },
  })

  const poster =
    media[0] ??
    (await payload.create({
      collection: 'media',
      data: { alt: POSTER_ALT },
      filePath: `public/${POSTER}`,
      overrideAccess: true,
    }))

  console.log(`  poster ${media[0] ? 'reused' : 'uploaded'} (id ${poster.id})`)

  const data = {
    _status: 'published' as const,
    title: 'Devenez animateur bénévole !',
    slug,
    hero: {
      type: 'lowImpact' as const,
      richText: richText(
        heading('h1', 'Devenez animateur bénévole !'),
        paragraph(
          boldNode('Les Randonnées Touloises recrutent.'),
          textNode(
            ' Partagez votre passion de la nature et guidez nos adhérents sur les sentiers.',
          ),
        ),
      ),
    },
    layout: layout(poster.id),
    meta: {
      title: 'Devenez animateur bénévole',
      description:
        'Les Randonnées Touloises recrutent des animateurs bénévoles. Aucune expérience exigée : la formation fédérale est prise en charge par l’association.',
      image: poster.id,
    },
  }

  // The afterChange hook calls revalidatePath, which throws outside a Next
  // request. Nothing is serving pages from this process anyway.
  const context = { disableRevalidate: true }

  if (pages[0]) {
    await payload.update({ collection: 'pages', id: pages[0].id, context, data })
    console.log(`  replaced page /${slug} (id ${pages[0].id})`)
  } else {
    const created = await payload.create({ collection: 'pages', context, data })
    console.log(`  created page /${slug} (id ${created.id})`)
  }
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
