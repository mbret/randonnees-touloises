/**
 * Seed the `pages` collection with the season's membership page — the
 * "ADHÉSIONS" page the committee drafted in the old site's dashboard and never
 * published there.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-membership-page.ts
 *   pnpm payload run scripts/import-membership-page.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/import-membership-page.ts
 *
 * The page answers at `/adhesion`, served by the `[slug]` route like any other
 * document.
 *
 * The four formulas are a `membershipTiers` block rather than prose, which is
 * what makes next season an editor's job rather than a deploy: the general
 * meeting sets the association's share, the FFRandonnée sets the licence, and
 * the treasurer changes four numbers in September.
 *
 * Configured through the environment, not flags: the payload CLI does not
 * forward extra argv to a script. DRY_RUN=1 reports without writing, SLUG=…
 * overrides the address, FORCE=1 replaces a document already at that slug, and
 * a remote database needs ALLOW_REMOTE_DB=1.
 *
 * Reruns are safe: the page is matched on its slug and skipped if it already
 * exists. FORCE=1 overwrites, which discards whatever an editor has since
 * changed — every price included. It is for fixing a bad first import, not for
 * updating a page that is live.
 *
 * The page is created published, and `showInNav` defaults on, so it enters the
 * menu on its own — nothing has to be added to the Header global by hand.
 *
 * One step is left to a person, against a deployment that is already running:
 * open the page in the admin and save it. This process cannot refresh the
 * site's caches — see the note on `disableRevalidate` below — so until that
 * save, the running site serves the menu it had cached before the page existed.
 */
import { bullets, heading, paragraph, richText, textNode, boldNode } from './lexical'

/** The season the amounts below were voted for, as it reads on the page. */
const SEASON = '2026-2027'

/**
 * Where the club takes payment: the Crédit Mutuel's association service, which
 * is somebody else's application, so the button opens in a tab of its own.
 */
const PAYMENT_URL = 'https://www.monetico-online-asso.com/randonnees-touloises/adhesion'

const CTA_LABEL = 'Formulaire d’inscription'

const registration = {
  type: 'custom' as const,
  isExternal: true,
  label: CTA_LABEL,
  newTab: true,
  url: PAYMENT_URL,
}

/**
 * The four formulas, in the order the old site's draft listed them: the two for
 * somebody who holds no FFRandonnée licence first, since they are what a
 * visitor arriving from the agenda is looking for, then the two for somebody
 * already licensed in another club.
 *
 * The wording is the committee's own, down to the remise conditions — this page
 * is a quote of a decision, not a rewrite of it.
 */
const tiers = [
  {
    name: 'Individuelle',
    price: 48,
    priceNote: 'pour la saison, licence et assurance comprises',
    badge: 'Le plus populaire',
    lines: [
      {
        kind: 'condition' as const,
        text: 'Vous n’êtes pas licencié(e) dans un club de la FFRandonnée',
      },
      { kind: 'condition' as const, text: 'Vous souhaitez participer à nos activités' },
      {
        kind: 'discount' as const,
        text:
          'Une remise de 15 € est accordée à toute personne de 60 ans et plus, n’ayant jamais eu ' +
          'de licence à la FFRandonnée et habitant en Meurthe-et-Moselle.',
      },
      {
        kind: 'requirement' as const,
        text: 'Un certificat médical daté de moins de 6 mois est obligatoire.',
      },
    ],
    enableLink: true,
    link: registration,
  },
  {
    name: 'Familiale',
    price: 94,
    priceNote: 'pour la saison, pour toute la famille',
    lines: [
      {
        kind: 'condition' as const,
        text:
          'Vous et les membres de votre famille n’êtes pas licencié(e)s dans un club de la ' +
          'FFRandonnée',
      },
      {
        kind: 'condition' as const,
        text: 'Vous et les membres de votre famille souhaitez participer à nos activités',
      },
      {
        kind: 'discount' as const,
        text:
          'Une remise de 30 € est accordée si les 2 personnes adultes ont 60 ans et plus, n’ont ' +
          'jamais eu de licence à la FFRandonnée et habitent en Meurthe-et-Moselle.',
      },
      {
        kind: 'requirement' as const,
        text: 'Un certificat médical daté de moins de 6 mois est obligatoire pour chaque personne.',
      },
    ],
    enableLink: true,
    link: registration,
  },
  {
    name: 'Individuelle (ext.)',
    price: 15,
    priceNote: 'cotisation seule, votre licence restant prise dans votre club',
    lines: [
      {
        kind: 'condition' as const,
        text: 'Vous êtes licencié(e) dans un autre club de la FFRandonnée',
      },
      { kind: 'condition' as const, text: 'Vous souhaitez participer à nos activités' },
    ],
    enableLink: true,
    link: registration,
  },
  {
    name: 'Familiale (ext.)',
    price: 28,
    priceNote: 'cotisation seule, vos licences restant prises dans votre club',
    lines: [
      {
        kind: 'condition' as const,
        text:
          'Vous et les membres de votre famille êtes licencié(e)s dans un autre club de la ' +
          'FFRandonnée',
      },
      {
        kind: 'condition' as const,
        text: 'Vous et les autres membres de votre famille souhaitez participer à nos activités',
      },
    ],
    enableLink: true,
    link: registration,
  },
]

/**
 * The three steps between reading this page and being an adhérent, as the cards
 * of an `iconCards` block. The old site's page went straight from a price to a
 * payment form, which left the two things that actually stop people — the trial
 * outings and the certificat médical — buried in the fourth bullet of a card.
 */
const steps = [
  {
    icon: 'footprints' as const,
    title: '1. Essayez deux sorties',
    description:
      'L’essai est gratuit et sans engagement. Choisissez une sortie dans l’agenda du mois et ' +
      'faites-vous connaître auprès de l’animateur ou de l’animatrice à l’arrivée.',
  },
  {
    icon: 'shield' as const,
    title: '2. Réunissez votre dossier',
    description:
      'Un certificat médical de moins de 6 mois est demandé pour toute nouvelle adhésion, pour ' +
      'chaque personne dans le cas d’une adhésion familiale.',
  },
  {
    icon: 'handshake' as const,
    title: '3. Remplissez le formulaire',
    description:
      'Le bouton de votre formule ouvre le formulaire d’inscription et de paiement en ligne. ' +
      'Votre licence est ensuite établie par la FFRandonnée.',
  },
]

const layout = [
  {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        richText: richText(
          paragraph(
            boldNode('Prendre sa licence aux Randonnées Touloises'),
            textNode(
              ', c’est partager le plaisir de se retrouver en groupe tout en améliorant sa ' +
                'condition physique et faire des rencontres avec des passionné(e)s, en ' +
                'bénéficiant d’un encadrement de qualité par nos animateurs et animatrices ' +
                'diplômés.',
            ),
          ),
          paragraph(
            textNode(
              'Avant d’adhérer, vous pouvez essayer gratuitement 2 sorties : consultez l’agenda ' +
                'du mois et faites-vous connaître auprès de l’animateur ou de l’animatrice.',
            ),
          ),
        ),
        enableLink: false,
      },
    ],
  },
  {
    blockType: 'membershipTiers' as const,
    heading: 'Les formules',
    tiers,
    footnote:
      'Les licences sont valables du 1er septembre au 31 août. Les renouvellements doivent être ' +
      'clos au 30 octobre.',
  },
  {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        richText: richText(heading('h2', 'Comment adhérer')),
        enableLink: false,
      },
    ],
  },
  {
    blockType: 'iconCards' as const,
    cards: steps,
  },
  {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        richText: richText(
          heading('h2', 'Ce que comprend l’adhésion'),
          bullets([
            'la licence FFRandonnée, dématérialisée, et l’assurance qui va avec — sauf pour les formules « ext. », dont la licence est prise dans votre club ;',
            'la cotisation à l’association, votée chaque année en assemblée générale ;',
            'l’accès à toutes nos sorties encadrées, du parcours santé à la grande randonnée ;',
            'la possibilité de participer aux séjours réservés aux adhérents.',
          ]),
        ),
        enableLink: false,
      },
    ],
  },
  {
    blockType: 'cta' as const,
    richText: richText(
      heading('h2', 'Une question avant d’adhérer ?'),
      paragraph(
        textNode(
          'Écrivez-nous ou venez en parler à un animateur lors d’une prochaine sortie. Les ' +
            'modalités complètes figurent dans notre règlement intérieur.',
        ),
      ),
    ),
    links: [
      {
        link: {
          type: 'custom' as const,
          appearance: 'default' as const,
          label: 'Nous contacter',
          url: '/contact',
        },
      },
      {
        link: {
          type: 'custom' as const,
          appearance: 'outline' as const,
          label: 'Lire le règlement intérieur',
          url: '/terms#adhesion',
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
  const slug = process.env.SLUG || 'adhesion'

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
      `Would ${pages[0] ? 'replace' : 'create'} page /${slug} with ${tiers.length} formules ` +
        `(${tiers.map(({ price }) => `${price} €`).join(', ')}).`,
    )
    process.exit(0)
  }

  const title = `Adhésions saison ${SEASON}`

  const data = {
    _status: 'published' as const,
    title,
    slug,
    hero: {
      type: 'lowImpact' as const,
      richText: richText(
        heading('h1', title),
        paragraph(
          textNode(
            'Quatre formules, selon que vous adhérez seul(e) ou en famille et que vous êtes déjà ' +
              'licencié(e) dans un autre club de la FFRandonnée.',
          ),
        ),
      ),
    },
    layout,
    navLabel: 'Adhésions',
    /* Between Contact (10) and Actualités (20): `navOrder` positions an entry
     * against the whole menu, static entries included, so a number in the gap
     * between two of them is what puts the page there. */
    navOrder: 15,
    meta: {
      title: `Adhésions saison ${SEASON}`,
      description:
        `Tarifs et formules d’adhésion aux Randonnées Touloises pour la saison ${SEASON} : ` +
        'individuelle 48 €, familiale 94 €, et 15 € ou 28 € pour les licenciés d’un autre club ' +
        'de la FFRandonnée.',
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
