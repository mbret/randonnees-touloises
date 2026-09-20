import { describe, expect, it } from 'vitest'

import { anonymousApiRefusal, apiPathOf, isClosedToAnonymous } from '@/utilities/publicApiGate'

import { config as proxyConfig } from '@/proxy'

/**
 * Every assertion here is about what an unauthenticated caller can make the
 * database do.
 *
 * Payload answers its whole REST API from one generated catch-all, and the
 * collections the site needs to render are publicly readable, so `/api/pages`,
 * `/api/media` and the globals answered anyone — each request a function
 * invocation and a Neon query, `x-vercel-cache: MISS` every time, `?limit=0`
 * returning all 249 media documents in one go, and nothing rate limiting any of
 * it. The two halves of this file are the two ways that goes wrong: leaving the
 * door open, and closing it on the people who have to walk through.
 */
const ORIGIN = 'https://www.randonnees-touloises.net'

const request = (path: string, init: RequestInit = {}) =>
  new Request(`${ORIGIN}${path}`, init)

const signedIn = (path: string, init: RequestInit = {}) =>
  request(path, { ...init, headers: { cookie: `payload-token=ey.some.jwt`, ...init.headers } })

describe('what an anonymous caller is refused', () => {
  it.each([
    '/api/pages',
    '/api/pages?limit=0',
    '/api/posts',
    '/api/media',
    '/api/media?limit=0',
    '/api/categories',
    '/api/locations',
    '/api/forms',
    '/api/redirects',
  ])('refuses %s', (path) => {
    expect(isClosedToAnonymous(request(path))).toBe(true)
  })

  /**
   * `/api/globals/general` carries `contentPassword`, the shared password for
   * gated posts, so until this it could be read without going near a gated
   * post.
   */
  it.each(['/api/globals/general', '/api/globals/header', '/api/globals/footer'])(
    'refuses %s',
    (path) => {
      expect(isClosedToAnonymous(request(path))).toBe(true)
    },
  )

  it('refuses a single document as readily as a list', () => {
    expect(isClosedToAnonymous(request('/api/pages/4'))).toBe(true)
  })

  it('refuses HEAD, which costs the same query as GET', () => {
    expect(isClosedToAnonymous(request('/api/media', { method: 'HEAD' }))).toBe(true)
    expect(isClosedToAnonymous(request('/api/media', { method: 'head' }))).toBe(true)
  })

  /**
   * GraphQL is POST, so the read/write split does not reach it, and one query
   * asks for more than any REST call — gating REST alone would move the traffic
   * rather than stop it.
   */
  it('refuses GraphQL whatever the method', () => {
    expect(isClosedToAnonymous(request('/api/graphql', { method: 'POST' }))).toBe(true)
    expect(isClosedToAnonymous(request('/api/graphql-playground'))).toBe(true)
  })

  it('refuses with Payload’s error shape, uncached', async () => {
    const response = anonymousApiRefusal()

    expect(response.status).toBe(403)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ errors: [{ message: expect.any(String) }] })
  })
})

describe('what still has to get through', () => {
  /**
   * The admin panel is REST from end to end, and every call it makes carries
   * the session cookie. Blocking those locks the committee out of their own
   * site — the one failure here nobody would notice until they tried to log in.
   */
  it.each(['/api/pages', '/api/media?limit=0', '/api/globals/general', '/api/graphql'])(
    'lets a signed-in request through to %s',
    (path) => {
      expect(isClosedToAnonymous(signedIn(path))).toBe(false)
    },
  )

  /**
   * `vercel.json` runs the job queue at midnight with
   * `Authorization: Bearer $CRON_SECRET`, not a session, so it has to be let
   * past on its own path — and Payload checks the secret itself from there.
   */
  it('lets the nightly cron through on its own path', () => {
    expect(
      isClosedToAnonymous(
        request('/api/payload-jobs/run', { headers: { authorization: 'Bearer secret' } }),
      ),
    ).toBe(false)
  })

  it('refuses the cron path to anyone not even claiming the secret', () => {
    expect(isClosedToAnonymous(request('/api/payload-jobs/run'))).toBe(true)
  })

  /**
   * `jobs.access.run` allows `req.user` as well as the secret, so running the
   * queue from the admin panel sends a cookie and no `Authorization` header.
   * Checking the cron's path before the session would have refused it.
   */
  it('lets an administrator run the queue from the panel', () => {
    expect(isClosedToAnonymous(signedIn('/api/payload-jobs/run'))).toBe(false)
  })

  /**
   * Nothing here enables `useAPIKey`, so the only caller that ever holds an
   * `Authorization` header is the cron above. Honouring it anywhere else would
   * mean the gate opened for anyone who sent the word.
   */
  it('does not take an Authorization header as a session', () => {
    expect(
      isClosedToAnonymous(request('/api/pages', { headers: { authorization: 'Bearer x' } })),
    ).toBe(true)
    expect(
      isClosedToAnonymous(
        request('/api/pages', { headers: { authorization: 'users API-Key abc' } }),
      ),
    ).toBe(true)
  })

  /**
   * Presence, not proof — a deliberate limit, and the reasoning is in
   * `publicApiGate`. Payload's access control is what actually decides, and
   * still answers 403; this only chooses who gets to ask.
   */
  it('reads the cookie by name alone, and grants nothing by it', () => {
    expect(isClosedToAnonymous(request('/api/pages', { headers: { cookie: 'foo=1' } }))).toBe(true)
    expect(
      isClosedToAnonymous(request('/api/pages', { headers: { cookie: 'foo=1; payload-token=x' } })),
    ).toBe(false)
    /* `not-payload-token` ends in the cookie's name without being it. */
    expect(
      isClosedToAnonymous(request('/api/pages', { headers: { cookie: 'not-payload-token=x' } })),
    ).toBe(true)
  })

  /**
   * What an anonymous browser genuinely asks for: `users/me` on every page, and
   * the two the admin's login screen calls before anyone has a session.
   */
  it.each(['/api/users/me', '/api/access', '/api/users/init'])('leaves %s open', (path) => {
    expect(isClosedToAnonymous(request(path))).toBe(false)
  })

  /**
   * The account flows and the contact form are anonymous POSTs by design, and
   * access control already governs what they may do.
   */
  it.each([
    '/api/users/login',
    '/api/users/create',
    '/api/users/forgot-password',
    '/api/users/reset-password',
    '/api/form-submissions',
  ])('leaves an anonymous POST to %s alone', (path) => {
    expect(isClosedToAnonymous(request(path, { method: 'POST' }))).toBe(false)
  })

  it('leaves the CORS preflight alone', () => {
    expect(isClosedToAnonymous(request('/api/pages', { method: 'OPTIONS' }))).toBe(false)
  })

  /**
   * Every image on the site is one of these. They have their own route, their
   * own year of immutable caching, and they are the reason the matcher below
   * exists — but the gate lets them past on its own, so a mistake in that
   * pattern cannot take the site's images down.
   */
  it.each([
    '/api/media/file/photo.jpg',
    '/api/media/file/photo-xlarge.webp?v=2026-01-01T00%3A00%3A00.000Z',
  ])('lets uploads past whatever the matcher says: %s', (path) => {
    expect(isClosedToAnonymous(request(path))).toBe(false)
  })

  it('excludes uploads from the matcher as well', () => {
    const [pattern] = proxyConfig.matcher

    expect(new RegExp(`^${pattern}$`).test('/api/media/file/photo.jpg')).toBe(false)
    expect(new RegExp(`^${pattern}$`).test('/api/pages')).toBe(true)
  })
})

describe('the path a decision is made on', () => {
  it.each([
    ['/api/pages', 'pages'],
    ['/api/pages?limit=0', 'pages'],
    ['/api/users/me', 'users/me'],
    ['/api/globals/general', 'globals/general'],
    ['/api/graphql', 'graphql'],
    /* A trailing slash is the same endpoint, and must not read as a new one. */
    ['/api/pages/', 'pages'],
    ['/api/', ''],
  ])('reads %s as %s', (url, expected) => {
    expect(apiPathOf(`${ORIGIN}${url}`)).toBe(expected)
  })

  /** `/api/users/me/../pages` and friends are normalised before they reach us. */
  it('refuses a path that only looks allowed', () => {
    expect(isClosedToAnonymous(request('/api/users/me/../../pages'))).toBe(true)
    expect(isClosedToAnonymous(request('/api/accessories'))).toBe(true)
  })

  /**
   * Percent-encoding is not decoded by `URL`, so `%2e%2e%2f` stays a name
   * rather than becoming a step upwards — and Next routes it to the uploads
   * route as a filename, where Payload looks for an upload by that name and
   * does not find one. Checked against production, which answers 403.
   */
  it('does not let an encoded traversal out of the uploads path', () => {
    expect(apiPathOf(`${ORIGIN}/api/media/file/..%2f..%2fapi%2fpages`)).toBe(
      'media/file/..%2f..%2fapi%2fpages',
    )
  })

  /**
   * The matcher is what normally decides this, and a matcher is not something
   * a test can hold — so the path itself has to be unmistakable either way.
   */
  it.each(['/apidocs', '/apifoo/pages', '/search'])('does not read %s as an API path', (path) => {
    expect(apiPathOf(`${ORIGIN}${path}`)).toBe(path)
  })

  it('reads a doubled slash as the one path it is', () => {
    expect(apiPathOf(`${ORIGIN}/api//users/me`)).toBe('users/me')
  })
})
