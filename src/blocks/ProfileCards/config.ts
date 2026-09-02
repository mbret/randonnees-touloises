import type { Block } from 'payload'

export const ProfileCardsBlockConfig: Block = {
  slug: 'profileCards',
  admin: {
    images: {
      thumbnail: {
        alt: 'Une grille de portraits avec leurs noms et leurs fonctions.',
        url: '/blocks/team-section.svg',
      },
    },
  },
  interfaceName: 'ProfileCardsBlock',
  labels: {
    singular: 'Profils d’adhérents',
    plural: 'Profils d’adhérents',
  },
  fields: [
    /**
     * Who appears, and in what order.
     *
     * The order is the order of this list, dragged into shape — not a number
     * stored on each adhérent, and not a table of functions written into the
     * code. The conseil is read président, vice-présidente, secrétaire,
     * trésorier, the référents, then the members, which is neither alphabetical
     * nor derivable from anything on the documents; keeping it here puts it in
     * the one place that cares about it, editable by whoever rearranges the
     * conseil after an assemblée générale.
     *
     * Which leaves a clean division: this block says who and in what order, and
     * each adhérent's own record says what they are.
     */
    {
      name: 'members',
      type: 'relationship',
      label: 'Adhérents',
      relationTo: 'adherents',
      hasMany: true,
      admin: {
        description:
          'Glissez pour changer l’ordre d’affichage. La fonction de chacun vient de sa fiche ' +
          'adhérent ; sa photo et son téléphone n’apparaissent que s’il a donné son accord.',
      },
      required: true,
    },
  ],
}
