import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
 * The Blob store is shared by every environment — unlike the database, there is
 * no separate dev store — so keep it out of local runs: without the adapter,
 * Payload stores uploads on disk under the collection's `staticDir`, and a local
 * upload or delete can no longer overwrite the files production serves. Set
 * USE_BLOB_STORAGE=1 to exercise the Blob code path deliberately.
 */
const useBlobStorage = process.env.NODE_ENV === 'production' || process.env.USE_BLOB_STORAGE === '1'

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
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
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
    vercelBlobStorage({
      collections: {
        media: true,
      },
      enabled: useBlobStorage,
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
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
