import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { checkRole } from '@/access/utilities'
import { revalidateEvent, revalidateEventDelete } from './hooks/revalidateEvent'

/** Wall-clock time as the programme announces it, e.g. `08:30`. */
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const validateTime = (value: unknown) =>
  !value || (typeof value === 'string' && timePattern.test(value))
    ? true
    : 'Indiquez une heure au format HH:MM, par exemple 08:30.'

/**
 * Anything the club puts on a date: the weekly randonnées, a sortie à la
 * journée, an assemblée générale.
 *
 * An event is a calendar entry and nothing more — it has no page, so no slug, no
 * SEO and no hero image. Anything that deserves a page of its own (a poster, a
 * registration form, a write-up) is a post instead, which is also where the
 * content password lives.
 */
export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  labels: {
    singular: 'Événement',
    plural: 'Événements',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req: { user } }) => {
      if (user && checkRole(['admin'], user)) {
        return true
      }

      return {
        _status: {
          equals: 'published',
        },
      }
    },
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    date: true,
    startTime: true,
    endTime: true,
    content: true,
  },
  defaultSort: 'date',
  admin: {
    defaultColumns: ['date', 'title', 'startTime'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Intitulé',
      admin: {
        description: 'Le nom de l’événement, par exemple « Grande » ou « Assemblée générale ».',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      label: 'Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startTime',
          type: 'text',
          label: 'Heure de début',
          validate: validateTime,
          admin: {
            placeholder: '09:00',
            width: '50%',
          },
        },
        {
          name: 'endTime',
          type: 'text',
          label: 'Heure de fin',
          validate: validateTime,
          admin: {
            placeholder: '11:30',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Détails',
      admin: {
        description: 'Tout ce qu’il faut savoir, présenté comme vous le souhaitez.',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
    },
    {
      // Kept as the hook for typing events later — a select can be layered on
      // these without a migration once there is more than randonnées in here.
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'categories',
    },
  ],
  hooks: {
    afterChange: [revalidateEvent],
    afterDelete: [revalidateEventDelete],
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 10,
  },
}
