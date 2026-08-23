/**
 * Bring a local database from empty to a site you can click through, in one
 * command:
 *
 *   pnpm seed:local
 *
 * It runs the migrations, creates an admin user, then runs the import scripts
 * in an order that makes sense — portraits before the pages that resolve them
 * by filename, events and posts before the pages that link to them.
 *
 * Nothing here is local-only in principle: production is seeded by running the
 * same scripts, one at a time and deliberately, which is why this wrapper
 * refuses any host but this machine's. A single command that runs every
 * importer is right for a database you can throw away and wrong for the one
 * the club depends on.
 *
 *   DRY_RUN=1 pnpm seed:local     report what each step would do, write nothing
 *   LIMIT=10  pnpm seed:local     take the first 10 of each bulk import
 *   SKIP=trombinoscope,programs   leave those steps out
 *
 * The `seed:local` script brings the Postgres container up first, the way `dev`
 * does, so this runs against a database that is there. Calling the file
 * directly — `node scripts/seed-local.mjs` — skips that, for a Postgres that is
 * not Docker's.
 *
 * Plain JavaScript, and not a `payload run` script like its siblings, because
 * it has to run `payload migrate` before any schema exists — so it must not be
 * a process that loads Payload itself.
 *
 * Reruns are safe: every step it calls is idempotent, so this is also how a
 * database that is merely out of date catches up.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/* Loaded the way Next loads them, `.env.local` last and winning, so this reads
 * the same database the dev server and the payload CLI will. */
dotenv.config({ path: path.join(root, '.env'), quiet: true })
dotenv.config({ path: path.join(root, '.env.local'), override: true, quiet: true })

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', 'host.docker.internal']

const connectionString = process.env.POSTGRES_URL || ''

if (!connectionString) {
  console.error(
    'No POSTGRES_URL. Copy .env.example to .env.local and point it at a local database\n' +
      '(docker compose -f docker-compose.dev.yml up -d serves one on port 54320).',
  )
  process.exit(1)
}

const host = new URL(connectionString).hostname

if (!LOCAL_HOSTS.includes(host)) {
  console.error(
    `Refusing to seed "${host}": this command runs every importer at once, which is\n` +
      'meant for a database you can throw away. Seed production by running the\n' +
      'scripts in scripts/ one at a time, with ALLOW_REMOTE_DB=1.',
  )
  process.exit(1)
}

/**
 * The steps, in dependency order.
 *
 * `network` marks a step that reads the old randonnees-touloises.net: those are
 * the ones that fail on a train, and failing them should not cost the rest of
 * the seed. `bulk` marks the ones LIMIT applies to, so `LIMIT=10` shortens the
 * long imports without truncating a page into nonsense.
 */
const steps = [
  { name: 'migrate', label: 'Schéma', args: ['migrate'] },
  { name: 'user', label: 'Utilisateur admin', script: 'create-local-user.ts' },
  {
    name: 'team-photos',
    label: 'Portraits CA + animation',
    script: 'import-team-photos.ts',
    network: true,
  },
  {
    name: 'trombinoscope',
    label: 'Trombinoscope',
    script: 'import-trombinoscope.ts',
    network: true,
    bulk: true,
  },
  { name: 'agenda', label: 'Agenda (événements)', script: 'import-agenda.ts', bulk: true },
  {
    name: 'programs',
    label: 'Programme (publications)',
    script: 'import-programs.ts',
    network: true,
    bulk: true,
  },
  { name: 'recruitment', label: 'Page /devenir-animateur', script: 'import-recruitment-page.ts' },
  { name: 'media-page', label: 'Page /photos-et-videos', script: 'import-media-page.ts' },
  { name: 'membership', label: 'Page /adhesion', script: 'import-membership-page.ts' },
]

const skipped = new Set(
  (process.env.SKIP || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean),
)

const unknown = [...skipped].filter((name) => !steps.some((step) => step.name === name))

if (unknown.length) {
  console.error(
    `SKIP names no such step: ${unknown.join(', ')}.\n` +
      `Known steps: ${steps.map(({ name }) => name).join(', ')}.`,
  )
  process.exit(1)
}

const dryRun = process.env.DRY_RUN === '1'
const limit = process.env.LIMIT

/**
 * A dry run writes nothing at all, migrations included — which leaves it
 * unable to say anything about a database with no tables, since every importer
 * reports by querying what is already there. So it checks the schema instead of
 * creating it, and stops rather than printing eight failures that only mean
 * "there is nothing here yet".
 */
if (dryRun) {
  const status = spawnSync('pnpm', ['payload', 'migrate:status'], {
    cwd: root,
    env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
    encoding: 'utf8',
  })

  /* Read off the table's own Ran column, with the colours stripped: a row
   * marked No is a migration this database has not seen. */
  const pending = (status.stdout ?? '').replace(/\u001b\[[0-9;]*m/g, '').includes('No ')

  if (status.status !== 0 || pending) {
    console.log(
      'Le schéma n’est pas à jour, et une simulation n’applique pas les migrations.\n' +
        'Lancez `pnpm payload migrate`, puis relancez la simulation — ou lancez\n' +
        '`pnpm seed:local` sans DRY_RUN, qui migre puis importe.',
    )
    process.exit(0)
  }
}

const failures = []

for (const { args, bulk, label, name, network, script } of steps) {
  if (dryRun && name === 'migrate') continue

  if (skipped.has(name)) {
    console.log(`\n— ${label} — ignoré (SKIP)`)
    continue
  }

  console.log(`\n— ${label}`)

  const result = spawnSync('pnpm', ['payload', ...(args ?? ['run', `scripts/${script}`])], {
    cwd: root,
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-deprecation',
      /* LIMIT reaches only the imports that read it. Left in the environment
       * for the others it would be inert, but it would also read as a promise
       * this script cannot keep. */
      ...(bulk && limit ? { LIMIT: limit } : { LIMIT: '' }),
    },
    stdio: 'inherit',
  })

  /* The migration is the one step nothing downstream survives without: an
   * importer against a database with no tables fails on every row and buries
   * the reason under the noise. */
  if (result.status !== 0 && name === 'migrate') {
    console.error('\nLa migration a échoué — rien ne peut être importé sans schéma.')
    process.exit(result.status ?? 1)
  }

  if (result.status !== 0) {
    failures.push({ label, network: Boolean(network) })
  }
}

console.log('')

if (failures.length) {
  for (const { label, network } of failures) {
    console.log(
      `✗ ${label}${network ? ' — cette étape lit l’ancien site, vérifiez la connexion' : ''}`,
    )
  }
  console.log(
    `\n${failures.length} étape(s) en échec. Les autres ont abouti : relancez la commande, ` +
      `elle reprend sans dupliquer.`,
  )
  process.exit(1)
}

console.log(
  dryRun
    ? 'Simulation terminée — rien n’a été écrit.'
    : 'Base locale prête. pnpm dev, puis http://localhost:3000/admin.',
)
