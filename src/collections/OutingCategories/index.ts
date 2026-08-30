import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { publicAccess } from '@/access/publicAccess'
import { authenticated } from '../../access/authenticated'

/**
 * What kind of outing an event is: « Grande », « Petite », « Douce »,
 * « Nordique », « Santé ».
 *
 * Five names cover nearly everything the club walks, which is precisely why
 * they never earned a field of their own — they fitted in the title. But a
 * title is retyped from memory every time. Over a single six-week programme the
 * club printed « Journée » three times and « Sortie journée » once for the same
 * thing, « Santé » beside « Santé (sortie journée) », and a « Moyenne » and a
 * « Marche Breathwalk » that appear nowhere in the list of five. Nothing can
 * group, filter or badge a walk it recognises only by string match.
 *
 * A collection rather than a `select`, because the list is not closed: a select
 * is an enum in the code and a database migration every time the club invents a
 * kind of walk, and the club invents them faster than this site is deployed.
 * Here the editor picks from the list in the event's sidebar, or creates the new
 * kind in the same drawer, exactly as they already do for a `location`.
 *
 * The logo hangs here rather than on each event, so redrawing a pictogram
 * reaches every outing of that kind at once — the ones already published
 * included — instead of none of them.
 */
export const OutingCategories: CollectionConfig<'outingCategories'> = {
  slug: 'outingCategories',
  labels: {
    singular: 'Catégorie de sortie',
    plural: 'Catégories de sortie',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    // Read by the agenda, which queries as the public would.
    read: publicAccess,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'summary', 'updatedAt'],
    useAsTitle: 'title',
  },
  /**
   * The club's own order — Grande, Moyenne, Petite, Douce, Santé, Nordique — is
   * neither alphabetical nor the order the categories happen to be created in,
   * and it is the order a legend or a filter row has to appear in. An unranked
   * category sorts last rather than first: Postgres puts nulls at the end of an
   * ascending sort, so one created in a hurry drops to the bottom of the list
   * instead of displacing the five that matter.
   */
  defaultSort: ['sortOrder', 'title'],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nom',
      admin: {
        description: 'Le nom que le club emploie, par exemple « Grande » ou « Nordique ».',
        placeholder: 'Grande',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
      admin: {
        description: 'Le pictogramme qui accompagne les sorties de cette catégorie.',
      },
    },
    {
      name: 'summary',
      type: 'text',
      label: 'En deux mots',
      admin: {
        description: 'La distance ou le rythme, tels qu’ils sont annoncés : « 11 à 15 km ».',
        placeholder: '11 à 15 km',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Ordre d’affichage',
      admin: {
        description:
          'Du plus petit au plus grand. Laissé vide, la catégorie passe en fin de liste.',
        placeholder: '10',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
