import type { Block } from 'payload'

/**
 * The trombinoscope: every adhérent with a portrait on their fiche and
 * permission to publish it, as a grid of faces and first names.
 *
 * No list to fill in, which is the difference from `profileCards`. That block
 * names its people and holds their order because the conseil is read in an
 * order nothing on the documents can produce. This one has neither problem —
 * it is everyone who qualifies, alphabetically — so the collection is the list
 * and the block only says where on the page it sits. Adding a portrait to a
 * fiche and ticking « Portrait » is what puts someone here, and
 * `revalidateAdherentPages` is what shows it without a deploy.
 *
 * Still a table of its own in the database: Payload gives every block one, with
 * nothing in it but the block's place on the page — the `ui` field below
 * stores nothing.
 */
export const TrombinoscopeBlockConfig: Block = {
  slug: 'trombinoscope',
  admin: {
    images: {
      thumbnail: {
        alt: 'Une grille de portraits ronds, chacun avec un prénom.',
        url: '/blocks/trombinoscope.svg',
      },
    },
  },
  interfaceName: 'TrombinoscopeBlock',
  labels: {
    singular: 'Trombinoscope',
    plural: 'Trombinoscopes',
  },
  fields: [
    {
      name: 'howItFills',
      type: 'ui',
      admin: {
        components: {
          Field: '@/blocks/Trombinoscope/AdminNote#AdminNote',
        },
      },
    },
  ],
}
