import type { GlobalConfig } from 'payload'

import { revalidateGeneral } from './revalidateGeneral'

export const General: GlobalConfig = {
  slug: 'general',
  label: 'Réglages généraux',
  access: {
    read: () => true,
  },
  fields: [
    {
      // Readable by anyone, along with the rest of this global, so
      // `/api/globals/general` serves this value too. Soft lock, known — see the
      // note on `WithContentProtectedPassword`.
      name: 'contentPassword',
      type: 'text',
      label: 'Mot de passe pour le contenu',
      required: false,
    },
    {
      /**
       * The photograph the home page opens with.
       *
       * It lives here rather than on a page because the home page is not a CMS
       * page: it is a React route that assembles the hero, the figures, the
       * agenda and the programme itself. Until that changes, a global is the
       * only place the club can reach the one thing about it they ask to
       * change — and a field costs less than turning the route into content.
       *
       * Optional, and the hero draws the site's usual « à définir » stand-in
       * while it is empty rather than a photograph bundled for the occasion:
       * one field decides what opens the site, and an empty one is a thing to
       * fix here rather than something for the code to paper over.
       */
      name: 'homeHeroImage',
      type: 'upload',
      label: 'Image d’en-tête de la page d’accueil',
      admin: {
        description:
          'La grande photo tout en haut de la page d’accueil. Une image large et en haute ' +
          'définition (au moins 2000 px de large) : elle occupe toute la largeur de l’écran. ' +
          'Le texte se pose sur le bas de la photo, alors évitez d’y placer un sujet ' +
          'important. Sans image, la page d’accueil affiche un cadre « à définir » à la ' +
          'place de la photo.',
      },
      relationTo: 'media',
      required: false,
    },
  ],
  hooks: {
    afterChange: [revalidateGeneral],
  },
}
