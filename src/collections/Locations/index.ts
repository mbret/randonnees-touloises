import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { publicAccess } from '@/access/publicAccess'
import { fillTitle } from './hooks/fillTitle'
import { revalidateLocation, revalidateLocationDelete } from './hooks/revalidateLocation'

/**
 * Both halves of a pin or neither: a latitude with no longitude points at
 * nothing, and would render a map link into the sea off Ghana.
 */
const pairedCoordinate =
  (other: 'latitude' | 'longitude', message: string) =>
  (value: unknown, { siblingData }: { siblingData?: unknown }) => {
    const sibling = (siblingData ?? {}) as Record<string, unknown>

    return typeof sibling[other] === 'number' && typeof value !== 'number' ? message : true
  }

/**
 * Where an outing meets — the car park, the church, the football pitch.
 *
 * A collection of its own rather than a field on the event, because the same
 * thirty-odd places come round again and again: over a single six-week
 * programme the club printed forty-three events across thirty-nine distinct
 * start places, and every one of the four repeats carried a *different* Google
 * Maps short link. Two of those pairs resolve six and twenty-seven metres
 * apart — the same car park, re-pinned by hand, twice. The same six weeks hold
 * « MARON (ancienne gare) » and « MARON (ancienne Gare) ».
 *
 * So the place is entered once and pointed at thereafter. The editor picks from
 * a searchable list instead of re-finding somewhere the club has met a dozen
 * times, and a correction to a pin reaches every event at once rather than none
 * of the ones already published.
 *
 * The coordinates are two plain numbers rather than Payload's `point` type,
 * which compiles to a PostGIS `geometry(Point)` column: `postgres:16` in
 * docker-compose has no PostGIS available, and nothing here asks a question —
 * « outings within 20 km » — that would need it. Storing the pair rather than a
 * map URL is what frees the club from a shortener: `goo.gl` proper was switched
 * off in 2025, and `maps.app.goo.gl` links are opaque, unreadable and
 * un-dedupable while they last.
 */
export const Locations: CollectionConfig<'locations'> = {
  slug: 'locations',
  labels: {
    singular: 'Lieu de départ',
    plural: 'Lieux de départ',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    // Read by the agenda, which queries as the public would.
    read: publicAccess,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'commune', 'updatedAt'],
    // The derived title already holds both halves, but searching the parts
    // finds a place typed as « Choloy » from a memory of « Mairie ».
    listSearchableFields: ['title', 'commune', 'spot'],
    useAsTitle: 'title',
  },
  defaultSort: 'title',
  fields: [
    {
      name: 'commune',
      type: 'text',
      index: true,
      label: 'Commune',
      required: true,
      admin: {
        description: 'La commune seule, par exemple « Boucq ».',
        placeholder: 'Boucq',
      },
    },
    {
      name: 'spot',
      type: 'text',
      label: 'Précision',
      admin: {
        description:
          'L’endroit dans la commune, tel qu’il apparaîtra entre parenthèses : « terrain de foot », « Mairie », « ancienne gare ».',
        placeholder: 'terrain de foot',
      },
    },
    /**
     * Derived by `fillTitle`, never typed. Hidden rather than read-only: a
     * greyed-out box repeating the two fields above it is a question the editor
     * has to answer ("do I need to do something with this?") for no gain.
     */
    {
      name: 'title',
      type: 'text',
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          label: 'Latitude',
          max: 90,
          min: -90,
          validate: pairedCoordinate(
            'longitude',
            'Indiquez aussi la latitude, ou effacez la longitude.',
          ),
          admin: {
            placeholder: '48.742468',
            width: '50%',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          label: 'Longitude',
          max: 180,
          min: -180,
          validate: pairedCoordinate(
            'latitude',
            'Indiquez aussi la longitude, ou effacez la latitude.',
          ),
          admin: {
            placeholder: '5.758898',
            width: '50%',
          },
        },
      ],
    },
    /**
     * Printed under the name on every card that meets here, which is both the
     * point and the constraint: written once instead of retyped into each
     * event, and therefore seen a dozen times a year. One short line.
     */
    {
      name: 'notes',
      type: 'textarea',
      label: 'Accès et stationnement',
      admin: {
        description:
          'Facultatif, une phrase courte : elle s’affiche sous le lieu à chaque sortie qui part d’ici. ' +
          'Ce qui vaut pour l’endroit — « se garer le long de la voie » — et non pour une sortie en ' +
          'particulier, qui se dit dans le détail de la sortie.',
        placeholder: 'Se garer le long de la voie, le parking se remplit vite.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateLocation],
    afterDelete: [revalidateLocationDelete],
    beforeValidate: [fillTitle],
  },
}
