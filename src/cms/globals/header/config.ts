import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { navOrderDescription } from '@/navigation/Header/navOrderDescription'
import { revalidateHeader } from './revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'En-tête',
  access: {
    read: () => true,
  },
  fields: [
    /**
     * Where an entry sits is `navOrder` and not this array's own order. The menu
     * is assembled from three places — these entries, the pages collection and
     * the static entries in code — and dragging a row here can only rank it
     * against the other rows here, which is the one comparison the menu never
     * makes. Array order survives as the tie-break between entries naming the
     * same number; see `withStaticNavItems`.
     *
     * So the field below is not a convenience. Without it an entry added here
     * has no order at all, falls to `DEFAULT_NAV_ORDER` behind every static
     * entry, and no amount of dragging moves it — which is exactly what
     * happened to the entry this field was added for.
     */
    {
      name: 'navItems',
      type: 'array',
      label: 'Entrées du menu',
      labels: {
        singular: 'Entrée',
        plural: 'Entrées',
      },
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'navOrder',
          type: 'number',
          label: 'Ordre dans le menu',
          admin: {
            description: navOrderDescription('l’entrée'),
          },
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/navigation/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
