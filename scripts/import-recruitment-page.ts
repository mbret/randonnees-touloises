/**
 * Seed the `pages` collection with the recruitment appeal — the "On recrute"
 * poster from the old site, said in text rather than baked into an image.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-recruitment-page.ts
 *   pnpm payload run scripts/import-recruitment-page.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 USE_REMOTE_STORAGE=1 \
 *     pnpm payload run scripts/import-recruitment-page.ts
 *
 * The page answers at `/devenir-animateur`, served by the `[slug]` route like
 * any other document. It used to be a route file, which shadowed a document of
 * the same address; that file is gone, so the address is the document's.
 *
 * Configured through the environment, not flags: the payload CLI does not forward
 * extra argv to a script. DRY_RUN=1 reports without writing, SLUG=… overrides the
 * address, FORCE=1 replaces a document already at that slug, a remote database
 * needs ALLOW_REMOTE_DB=1, and uploading the poster to R2 rather than to the
 * local disk needs USE_REMOTE_STORAGE=1.
 *
 * Reruns are safe: the page is matched on its slug and skipped if it already
 * exists, and the poster is matched on its filename so it is uploaded once.
 *
 * The page is created published, and `showInNav` defaults on, so it enters the
 * menu on its own — nothing has to be added to the Header global by hand.
 *
 * One step is left to a person, against a deployment that is already running:
 * open the page in the admin and save it. This process cannot refresh the
 * site's caches — see the note on `disableRevalidate` below — so until that
 * save, the running site serves the menu it had cached before the page existed.
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
 * The three promises the poster makes, as the cards of an `iconCards` block —
 * the same icons the hardcoded page draws, so both versions read alike.
 */
const promises = [
  {
    icon: 'compass' as const,
    title: 'Proposez des randonnées',
    description:
      'Choisissez vos itinéraires, reconnaissez-les à votre rythme et faites découvrir les sentiers que vous aimez.',
  },
  {
    icon: 'handshake' as const,
    title: 'Partagez votre passion',
    description:
      'Transmettez votre goût de la nature et de la marche à des adhérents de tous niveaux, du parcours santé à la grande randonnée.',
  },
  {
    icon: 'users' as const,
    title: 'En toute convivialité',
    description:
      'Rejoignez une équipe de vingt animateurs et animatrices qui préparent les sorties ensemble et se relaient tout au long de l’année.',
  },
]

const layout = (posterId: number) => [
  {
    blockType: 'iconCards' as const,
    cards: promises,
    media: posterId,
    mediaPosition: 'right' as const,
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
  /* Compared to '1', not coerced: `Boolean('0')` is true, so a wrapper passing
   * FORCE=0 to mean "no" would have replaced a live page. The sibling import
   * scripts read their flags the same way. */
  const dryRun = process.env.DRY_RUN === '1'
  const force = process.env.FORCE === '1'
  const slug = process.env.SLUG || 'devenir-animateur'

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
    console.log(`Would ${pages[0] ? 'replace' : 'create'} page /${slug} with the poster ${POSTER}.`)
    process.exit(0)
  }

  // The poster is seed input, not a served asset: it lives beside this script
  // rather than in `public/`, where it would answer at an address of its own
  // and give the same image two homes. The media collection is where it belongs
  // once uploaded, so that is the only copy the site serves.
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
      filePath: `scripts/data/${POSTER}`,
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
