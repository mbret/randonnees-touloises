import type { Block } from 'payload'

export const TeamSectionBlockConfig: Block = {
  slug: 'teamSectionBlock',
  admin: {
    images: {
      thumbnail: {
        alt: 'Une grille de portraits avec leurs noms.',
        url: '/blocks/team-section.svg',
      },
    },
  },
  interfaceName: 'TeamSectionBlock',
  labels: {
    singular: 'Trombinoscope',
    plural: 'Trombinoscopes',
  },
  fields: [],
}
