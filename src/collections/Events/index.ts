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
 * The title is optional because the outing category now carries what it used to
 * say — an event titled « Petite » next to a category reading « Petite » is the
 * same word typed twice, and the one an editor forgets to update is the one the
 * site shows. What is not allowed is an entry that names itself in neither
 * place: that renders as a card with a time and nothing else.
 *
 * Only checked on publish. Payload skips field validation on drafts, so a
 * half-filled event still saves and still autosaves.
 */
const requireTitleOrCategory = (
  value: unknown,
  { data }: { data?: { outingCategory?: unknown } },
) =>
  value || data?.outingCategory
    ? true
    : 'Donnez un intitulé, ou choisissez une catégorie de sortie.'

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
    startLocation: true,
  },
  defaultSort: 'date',
  admin: {
    defaultColumns: ['date', 'outingCategory', 'title', 'startTime'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Intitulé',
      validate: requireTitleOrCategory,
      admin: {
        description:
          'Le nom de l’événement quand la catégorie ne suffit pas : « Assemblée générale », « Journée interclubs santé ».',
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
    /**
     * Which of the club's walks this is. Optional, because an event is not
     * always an outing — an assemblée générale has no category, and neither has
     * an event created before this field existed.
     */
    {
      name: 'outingCategory',
      type: 'relationship',
      label: 'Catégorie de sortie',
      relationTo: 'outingCategories',
      admin: {
        description: 'Choisissez la catégorie, ou créez-la si le club en propose une nouvelle.',
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
    /**
     * Where the walk starts, as a document rather than as a line of the body
     * text and a Google Maps short link pasted beside it. The same places come
     * round constantly, so this is a pick from a list far more often than it is
     * a new entry — and the pin behind it belongs to the place, not to this
     * one outing, so correcting it corrects every event that meets there.
     *
     * The body text is left exactly as it is for now: nothing renders this
     * yet, so removing the line would take the meeting point off the site.
     */
    {
      name: 'startLocation',
      type: 'relationship',
      label: 'Lieu de départ',
      relationTo: 'locations',
      admin: {
        description: 'Cherchez un lieu déjà utilisé, ou créez-le s’il est nouveau.',
        position: 'sidebar',
      },
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
      // Superseded by `outingCategory` above, which is what typing an event
      // turned out to need: one kind per outing, with a logo, in a list of its
      // own rather than in the general-purpose taxonomy the shop also uses.
      // Left in place only so that dropping it is a migration of its own, once
      // production is confirmed to hold no event that uses it.
      name: 'categories',
      type: 'relationship',
      label: 'Catégories',
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
