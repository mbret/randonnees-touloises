/**
 * Create the first admin user, so a freshly migrated database has somebody who
 * can log in.
 *
 *   pnpm payload run scripts/create-local-user.ts
 *   SEED_EMAIL=moi@example.com SEED_PASSWORD=… pnpm payload run scripts/create-local-user.ts
 *
 * Payload's admin panel offers a first-run form that does the same thing by
 * hand. This exists so that seeding a local database is one command rather than
 * one command and a form.
 *
 * Reruns are safe: an existing user with that address is left exactly as it is,
 * password included. Nothing here resets a password — a script that quietly
 * changed the credentials of a database somebody was working in would be worse
 * than the error message.
 *
 * The defaults are deliberately worthless as secrets. `ensureFirstUserIsAdmin`
 * makes the first user an admin whatever roles are asked for; `roles` is passed
 * anyway so a second user created by hand later is an admin too.
 */
const main = async () => {
  /* `admin@example.com`, not `admin@localhost`: Payload's email validator wants
   * a domain with a dot in it, and example.com is the one reserved for exactly
   * this. */
  const email = process.env.SEED_EMAIL || 'admin@example.com'
  const password = process.env.SEED_PASSWORD || 'password'
  const name = process.env.SEED_NAME || 'Administrateur local'

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  })

  if (docs[0]) {
    console.log(`  user ${email} already exists (id ${docs[0].id})`)
    process.exit(0)
  }

  if (process.env.DRY_RUN === '1') {
    console.log(`Would create the admin user ${email}.`)
    process.exit(0)
  }

  /* `overrideAccess` because there is nobody to authenticate as yet, and the
   * `roles` field is admin-only to write. */
  const created = await payload.create({
    collection: 'users',
    data: { email, name, password, roles: ['admin'] },
    overrideAccess: true,
  })

  console.log(`  created admin user ${email} (id ${created.id}) — password: ${password}`)
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
