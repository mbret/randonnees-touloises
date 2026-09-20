/**
 * Who may read Payload's HTTP API without an account.
 *
 * Payload serves its whole REST API from one generated catch-all,
 * `api/[...slug]/route.ts`, and every collection with a public `read` answers
 * it: `pages`, `posts`, `media`, `categories`, `locations`, `forms`,
 * `redirects` and all three globals. Nothing on the site asks for any of them
 * that way — pages and posts are read server-side through the Local API — so
 * the only callers are the admin panel, which is logged in, and whoever else
 * has found the URL.
 *
 * What that costs is the point. Each of those requests is a function
 * invocation and a Neon query, answered `public, max-age=0, must-revalidate`
 * with `x-vercel-cache: MISS`, so nothing absorbs the second identical one.
 * `?limit=0` turns pagination off outright: one request returns all 249 media
 * documents, 387 KB, in 0.9s. There is no rate limit in front of it and no
 * ceiling on it — the same shape as the image-optimisation bill, minus the
 * cache that eventually capped that one.
 *
 * It also hands out `contentPassword`. `/api/globals/general` carries the
 * shared password for gated posts, so today it can be read without visiting a
 * gated post at all. That lock is a speed bump either way — see
 * `WithContentProtectedPassword` — but there is no reason to publish the value.
 *
 * So: a request with no session on it is refused here, before it reaches
 * Payload or the database. One with a session is passed straight through, and
 * Payload's own access control decides as it always did — this grants nothing,
 * it only declines to block, so a forged cookie buys a caller exactly the 403
 * it would have had.
 *
 * Writes are not touched. `POST /api/users/login`, `POST /api/form-submissions`
 * and the rest of the account flows are how the site works, and access control
 * already governs what they may do.
 *
 * WHAT THIS IS NOT. The cookie is checked for by name and nothing more, so
 * anyone who reads the 403 and thinks to send `payload-token=anything` is
 * through it — and `pages` really is publicly readable, so Payload would answer
 * them. That is deliberate. Verifying the token here means reimplementing how
 * Payload derives its signing key, and the failure direction of getting that
 * wrong is the committee locked out of their own admin panel, to protect data
 * that is on the public site anyway. What is being defended is the bill, and
 * the traffic that runs it up — crawlers, scrapers, whoever finds the URL —
 * sends no cookies at all. Against someone deliberately working around this,
 * the lever is a rate limit in front of the app, not more code behind it.
 */

/** Reads. Everything else is a write, already governed by access control. */
const READ_METHODS = new Set(['GET', 'HEAD'])

/**
 * The paths an anonymous caller is still allowed to read.
 *
 * `users/me` answers `{ user: null }` for a visitor and is asked for on every
 * page by `AdminBar` and `FetchMe`; `access` and `users/init` are what the
 * admin's login screen asks for before anyone has logged in. Close these and
 * the committee cannot reach the panel — which is the one failure worth being
 * careful about here, since nobody would notice it until they tried.
 */
const ANONYMOUS_READS = new Set(['access', 'users/init', 'users/me'])

/**
 * Uploads, which are the one part of this API the browser is meant to call.
 *
 * They have their own route and their own year of `immutable` caching, and the
 * `proxy` matcher already leaves them out. Repeated here because a typo in that
 * matcher would otherwise take every image on the site down with it, and a
 * matcher is not something a test can hold.
 */
const MEDIA_FILE_PREFIX = 'media/file/'

/**
 * GraphQL, which is the same door with a wider frame.
 *
 * It answers anonymously today — `{ Pages(limit:1){ totalDocs } }` comes back
 * 200 — and it takes POST, so the read/write split above would let it through.
 * One query can ask for more, and more deeply joined, than any REST call, so
 * gating REST while leaving this open would be pointless. `graphQL.disable` in
 * the config turns the endpoint into a 404 as well; this stops the request
 * before it gets that far.
 */
const GRAPHQL_PATHS = new Set(['graphql', 'graphql-playground'])

/**
 * The nightly job runner, which `vercel.json` calls at midnight.
 *
 * It authenticates by `Authorization: Bearer $CRON_SECRET` rather than a
 * session — see `jobs.access.run` in the config, which checks the secret
 * itself — so it has to be let through on its own terms or the cron starts
 * failing silently at midnight. Requiring the header narrows that to requests
 * that at least claim to be it; the secret is still Payload's to verify, and
 * the endpoint returns no data either way.
 */
const CRON_PATH = 'payload-jobs/run'

/**
 * Payload's session cookie. Its name is `<cookiePrefix>-token`, and the config
 * sets no prefix, so it is Payload's default.
 */
const AUTH_COOKIE = 'payload-token'

/** The REST path itself: `/api/users/me` -> `users/me`. */
export const apiPathOf = (url: string) =>
  new URL(url).pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '')

/**
 * Whether the caller arrived with a session cookie.
 *
 * By name alone — see the note above on what that is and is not worth. The
 * admin panel sends it on every request it makes (`credentials: 'include'`
 * throughout `@payloadcms/ui`), which is the case this exists to let past.
 *
 * `Authorization` is not accepted in its place. Nothing here enables
 * `useAPIKey`, so the only thing that arrives holding one is the cron, which is
 * handled by path above; treating the header as a credential everywhere would
 * mean any request claiming one walked straight through.
 */
const hasSession = (request: Request) =>
  (request.headers.get('cookie')?.split(';') ?? []).some(
    (cookie) => cookie.trim().split('=')[0] === AUTH_COOKIE,
  )

/** Whether this request is one to refuse before it reaches Payload. */
export const isClosedToAnonymous = (request: Request): boolean => {
  const path = apiPathOf(request.url)

  if (path.startsWith(MEDIA_FILE_PREFIX)) return false
  if (path === CRON_PATH) return !request.headers.has('authorization')
  if (hasSession(request)) return false

  if (GRAPHQL_PATHS.has(path)) return true

  return READ_METHODS.has(request.method.toUpperCase()) && !ANONYMOUS_READS.has(path)
}

/**
 * Payload's own shape for a refusal, so a caller parsing the API is not handed
 * something it has never seen — with a message of our own, because the reason
 * is this gate rather than a rule on a collection, and the two are worth
 * telling apart from the outside.
 */
export const anonymousApiRefusal = () =>
  new Response(
    JSON.stringify({
      errors: [{ message: 'L’API n’est pas ouverte sans authentification.' }],
    }),
    {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
      status: 403,
    },
  )
