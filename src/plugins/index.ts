import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects, revalidateRedirectsDelete } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { SEO_TITLE } from '@/seo/constants'
import { adminOnly } from '@/access/adminOnly'
import { adminOrCustomerOwner } from '@/access/adminOrCustomerOwner'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { ProductsCollection } from '@/collections/Product'

/**
 * What the Generate button writes into `meta.title`: the document's own title and
 * nothing else. `generateMeta` appends the site name when it renders the tag, so
 * suffixing here too would print it twice.
 */
const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title || SEO_TITLE
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'globalPages'],
    overrides: {
      labels: {
        singular: 'Redirection',
        plural: 'Redirections',
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'Le site doit être reconstruit après une modification de ce champ.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
        afterDelete: [revalidateRedirectsDelete],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      labels: {
        singular: 'Formulaire',
        plural: 'Formulaires',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      labels: {
        singular: 'Réponse au formulaire',
        plural: 'Réponses aux formulaires',
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: {
        singular: 'Entrée d’index',
        plural: 'Index de recherche',
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  payloadCloudPlugin(),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      // Renamed in @payloadcms/plugin-ecommerce 3.8x: `adminOnly` -> `isAdmin`,
      // `adminOrCustomerOwner` -> `isDocumentOwner`.
      isAdmin: adminOnly,
      isDocumentOwner: adminOrCustomerOwner,
      // Deprecated in favour of `isCustomer`, but kept: `isCustomer` means
      // "authenticated and not an admin", while this checks for an explicit
      // `customer` role. Switching would widen field access.
      customerOnlyFieldAccess,
    },
    customers: {
      slug: 'users',
    },
    payments: {
      paymentMethods: [
        // stripeAdapter({
        //   secretKey: process.env.STRIPE_SECRET_KEY!,
        //   publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        //   webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
        // }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
]
