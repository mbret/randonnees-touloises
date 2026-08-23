import type { Block } from 'payload'

import { link } from '@/fields/link'

import { tierLineOptions } from './lines'

/**
 * The season's membership formulas, side by side.
 *
 * Amounts change every season — the FFRandonnée sets the licence, the general
 * meeting sets the association's share — so they are fields rather than markup:
 * the treasurer edits four numbers in September and the page is right, with no
 * deploy in between.
 *
 * Typed fields rather than a rich-text table, because the shape is the same
 * every year and a table is where a card loses its price, its button, or its
 * alignment with the three beside it.
 */
export const MembershipTiers: Block = {
  slug: 'membershipTiers',
  admin: {
    images: {
      thumbnail: {
        alt: 'Des cartes tarifaires côte à côte, chacune avec un prix et un bouton.',
        url: '/blocks/membership-tiers.svg',
      },
    },
  },
  interfaceName: 'MembershipTiersBlock',
  labels: {
    singular: 'Formules d’adhésion',
    plural: 'Formules d’adhésion',
  },
  fields: [
    {
      /* The block draws its own heading rather than leaving it to a Content
       * block above: a heading and the grid it names have to stay together,
       * and a page whose first heading under the title were a card's would
       * read as a level skipped. */
      name: 'heading',
      type: 'text',
      label: 'Titre de la section',
      admin: {
        description: 'Facultatif. Par exemple « Les formules ». Affiché au-dessus des cartes.',
      },
    },
    {
      name: 'tiers',
      type: 'array',
      label: 'Formules',
      labels: {
        singular: 'Formule',
        plural: 'Formules',
      },
      minRows: 1,
      required: true,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/blocks/MembershipTiers/RowLabel#RowLabel',
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nom de la formule',
          required: true,
          admin: {
            description: 'Par exemple « Individuelle » ou « Familiale (ext.) ».',
          },
        },
        {
          name: 'price',
          type: 'number',
          label: 'Montant en euros',
          min: 0,
          required: true,
          admin: {
            description:
              'Le montant total à régler pour la saison, licence et assurance comprises le cas échéant.',
          },
        },
        {
          name: 'priceNote',
          type: 'text',
          label: 'Précision sous le montant',
          admin: {
            description:
              'Facultative. Par exemple « pour la saison » ou « pour toute la famille ».',
          },
        },
        {
          /* One field, two effects: the text of the ribbon and the emphasis on
           * the card. An editor asked to fill a label and tick a box beside it
           * eventually does one without the other, and a highlighted card with
           * nothing to say for itself reads as a mistake. */
          name: 'badge',
          type: 'text',
          label: 'Mise en avant',
          admin: {
            description:
              'Facultative. Le texte saisi s’affiche en étiquette et met la carte en avant — par exemple « Le plus populaire ». Laissez vide pour une carte normale.',
          },
        },
        {
          name: 'lines',
          type: 'array',
          label: 'Détails',
          labels: {
            singular: 'Détail',
            plural: 'Détails',
          },
          minRows: 1,
          required: true,
          admin: {
            description:
              'Les conditions viennent en premier, puis les remises, puis les pièces à fournir — quel que soit l’ordre de saisie.',
          },
          fields: [
            {
              name: 'kind',
              type: 'select',
              label: 'Nature',
              defaultValue: 'condition',
              options: tierLineOptions,
              required: true,
              admin: {
                description:
                  'Décide le pictogramme et la place de la ligne dans la carte : une condition d’éligibilité, une remise sur le montant, ou une pièce à joindre au dossier.',
              },
            },
            {
              name: 'text',
              type: 'textarea',
              label: 'Texte',
              required: true,
            },
          ],
        },
        {
          /* What makes the button genuinely optional. The link field declares
           * its target and its label required, and a group left blank fails
           * validation rather than reading as "no button" — so the way to have
           * a card without one is to say so, and let the condition take those
           * validations out of the way. Same pattern as the Content block.
           *
           * On by default: nearly every formula has a button, and a new row
           * whose button had to be switched on would be a row an editor fills
           * in twice. */
          name: 'enableLink',
          type: 'checkbox',
          label: 'Afficher un bouton d’inscription',
          defaultValue: true,
          admin: {
            description:
              'Décochez pour une formule dont l’inscription n’est pas encore ouverte : la carte s’affiche alors sans bouton.',
          },
        },
        /* The registration button. A link field rather than a URL, so the
         * committee can send a formula to the payment site, to a page of the
         * site, or to a PDF they uploaded, without any of it being a code
         * change. `appearances: false` because the block decides how the button
         * looks — four cards in a row have to agree. */
        link({
          appearances: false,
          overrides: {
            label: 'Bouton d’inscription',
            admin: {
              condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
            },
          },
        }),
      ],
    },
    {
      name: 'footnote',
      type: 'text',
      label: 'Mention sous les cartes',
      admin: {
        description:
          'Facultative. Une ligne discrète sous la grille, par exemple la période de validité des licences.',
      },
    },
  ],
}
