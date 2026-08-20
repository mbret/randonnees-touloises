import { s3Storage } from '@payloadcms/storage-s3'
import { fr } from '@payloadcms/translations/languages/fr'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './cms/globals/header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { GlobalPages } from './collections/GlobalPages/config'
import { Events } from './collections/Events'
import { General } from './cms/globals/general/config'
import { TeamDirectoryConfig } from './cms/globals/teamDirectory/config'
import { GalleriesConfig } from './collections/Galleries/Gallery'
import { ContactSubmissions } from './collections/ContactSubmissions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const connectionString = process.env.POSTGRES_URL || ''

/**
 * `.env` carries the Vercel/Neon values, and `.env.local` — which points at the
 * local container — is gitignored. A fresh clone or a deleted `.env.local`
 * would therefore make `pnpm dev` read and write production without saying so.
 * Refuse instead, and require an explicit opt-in for the occasions a remote
 * database really is wanted (running a migration against prod by hand).
 */
if (process.env.NODE_ENV !== 'production' && !process.env.ALLOW_REMOTE_DB && connectionString) {
  const host = new URL(connectionString).hostname
  const local = ['localhost', '127.0.0.1', '::1', 'host.docker.internal']

  if (!local.includes(host)) {
    throw new Error(
      `Refusing to connect to the remote database "${host}" outside production.\n` +
        `Point POSTGRES_URL at a local database, or prefix the command with ` +
        `ALLOW_REMOTE_DB=1 if you mean it.`,
    )
  }
}

/**
 * Media lives in Cloudflare R2 in production. One bucket serves every
 * environment, so keep local runs off it — without the adapter Payload stores
 * uploads on disk under the collection's `staticDir`, and a local upload or
 * delete can no longer touch the files production serves. Set
 * USE_REMOTE_STORAGE=1 for the occasions a workstation does need the bucket,
 * such as importing media into production.
 */
const wantsRemoteStorage =
  process.env.NODE_ENV === 'production' || process.env.USE_REMOTE_STORAGE === '1'

/**
 * Also require the credentials to be there: a deploy that reaches production
 * before the bucket variables are set should fall back to disk — media 404s,
 * the same as an empty bucket — rather than have every request fail inside an
 * S3 client that has nothing to talk to.
 */
const useRemoteStorage = wantsRemoteStorage && Boolean(process.env.R2_BUCKET)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablette',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Ordinateur',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  /**
   * The admin is for the club's committee, who are French. Payload picks the UI
   * language from the user's stored preference, then the `Accept-Language`
   * header, then this fallback — so listing French as the only supported
   * language is what makes the panel French for everyone, whatever their
   * browser asks for. Add `en` back to `supportedLanguages` to get the
   * language picker (and English) back.
   */
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    // The schema is managed by the files in src/migrations, in every
    // environment. Leaving dev push on would let local schema drift silently
    // and make the next `migrate:create` diff meaningless.
    push: false,
    pool: {
      connectionString,
    },
  }),
  collections: [
    Pages,
    Posts,
    Events,
    Media,
    Categories,
    Users,
    GlobalPages,
    GalleriesConfig,
    ContactSubmissions,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, General, TeamDirectoryConfig],
  plugins: [
    ...plugins,
    // Registered either way so the generated admin import map does not depend on
    // the environment; `enabled: false` leaves the config untouched, which is
    // what makes Payload fall back to disk storage.
    s3Storage({
      bucket: process.env.R2_BUCKET || '',
      collections: {
        media: true,
      },
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.R2_ENDPOINT || '',
        // R2 has no regions, and accepts the bucket in the path rather than in
        // the hostname.
        forcePathStyle: true,
        region: 'auto',
      },
      enabled: useRemoteStorage,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
