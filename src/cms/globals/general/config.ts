import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from '../revalidateGlobal'

export const General: GlobalConfig = {
  slug: 'general',
  label: 'Réglages généraux',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal('general')],
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
  ],
}
