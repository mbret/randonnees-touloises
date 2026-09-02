import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { IconCards } from '../../blocks/IconCards/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { MediaLinks } from '../../blocks/MediaLinks/config'
import { MembershipTiers } from '../../blocks/MembershipTiers/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { AUTOSAVE_INTERVAL } from '../autosaveInterval'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { ProfileCardsBlockConfig } from '@/blocks/ProfileCards/config'
import { DEFAULT_NAV_ORDER, staticNavItems } from '@/navigation/Header/staticNavItems'

/**
 * What an editor needs in order to aim at a gap: the positions the menu's fixed
 * entries actually occupy, read off the menu itself rather than restated here,
 * where the two would drift apart the first time one of them moved.
 */
const navOrderDescription =
  'Classement croissant sur l’ensemble du menu. Les entrées fixes occupent ' +
  staticNavItems.map(({ link, navOrder }) => `${navOrder} ${link.label}`).join(', ') +
  `. Sans valeur, la page se place en ${DEFAULT_NAV_ORDER}, donc après elles. ` +
  'Un nombre intermédiaire l’insère entre deux entrées fixes — 15 la place entre Contact ' +
  'et À propos — et à nombre égal la page passe devant l’entrée fixe.'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'En-tête',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Blocs',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                IconCards,
                MediaLinks,
                MembershipTiers,
                ProfileCardsBlockConfig,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Contenu',
        },
        {
          name: 'meta',
          label: 'Référencement',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publié le',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      label: 'Afficher dans le menu',
      defaultValue: true,
      admin: {
        description:
          'Une page publiée entre dans le menu de navigation. Décochez pour la publier sans l’y ajouter.',
        position: 'sidebar',
      },
    },
    {
      name: 'navLabel',
      type: 'text',
      label: 'Libellé dans le menu',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showInNav),
        description: 'Par défaut, le titre de la page. Un libellé court tient mieux dans le menu.',
        position: 'sidebar',
      },
    },
    {
      name: 'navOrder',
      type: 'number',
      label: 'Ordre dans le menu',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showInNav),
        description: navOrderDescription,
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: AUTOSAVE_INTERVAL,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
