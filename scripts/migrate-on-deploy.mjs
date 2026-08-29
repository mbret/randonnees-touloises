/**
 * Run the migrations, unless this is a Vercel deployment that is not production.
 *
 *   pnpm migrate:deploy
 *
 * Preview deployments are built with the project's environment variables, and
 * those point at the production database — so `payload migrate` in the build
 * command meant that *opening* a pull request migrated production, hours or
 * days before the code that expects the new schema was deployed. A migration
 * that only adds a column survives that; one that drops the column the live
 * site is still selecting does not, and the site went down until the pull
 * request merged.
 *
 * So the schema is only ever moved by the deployment that also ships the code
 * for it. A preview keeps reading production, which is the point of a preview
 * on a project this size — it just reads it as it currently is.
 *
 * The consequence, and it is the intended one: a preview of a branch that
 * changes the schema will fail to build, because the code asks the database for
 * columns that are not there yet. That is a broken preview rather than a broken
 * site, and it says plainly what it is waiting for.
 *
 * `VERCEL_ENV` is set to `production`, `preview` or `development` on Vercel and
 * unset everywhere else, so a local `pnpm ci` still migrates whatever `.env`
 * points at, exactly as it did before.
 */
import { spawnSync } from 'node:child_process'
import { delimiter, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { VERCEL_ENV } = process.env

if (VERCEL_ENV && VERCEL_ENV !== 'production') {
  console.log(
    `Skipping migrations: this is a "${VERCEL_ENV}" deployment, and the database it ` +
      `would migrate is production's. The production deployment runs them.`,
  )
  process.exit(0)
}

/* `payload` lives in the workspace's `.bin`, which is on `PATH` when a package
 * script runs but not when this file is invoked directly. Put it there either
 * way, so running it by hand behaves the same as the build does. */
const binDir = join(dirname(dirname(fileURLToPath(import.meta.url))), 'node_modules', '.bin')

const { status } = spawnSync('payload', ['migrate'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--no-deprecation',
    PATH: `${binDir}${delimiter}${process.env.PATH ?? ''}`,
  },
})

process.exit(status ?? 1)
