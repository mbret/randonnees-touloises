import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config.js'

/** The catch-all `source` a rule needs to cover a whole host, not just its root. */
const EVERY_PATH = '/:path*'

const NOINDEX = 'noindex, nofollow'

/**
 * Whether one `has` condition of a header rule holds for a request to `host`.
 *
 * A `host` condition is matched by compiling its `value` to `^<value>$` and
 * testing that against the lowercased hostname, port removed — see `matchHas`
 * in `next/dist/shared/lib/router/utils/prepare-destination.js`. Reading the
 * rules back through the same anchoring is what makes these tests about what a
 * crawler is sent rather than about the string we happened to write.
 *
 * Any other kind of condition counts as unmet: nothing here should be deciding
 * whether to hide the site from a crawler on a cookie or a query string.
 */
const holdsFor = (condition: { type: string; value?: string }, host: string) =>
  condition.type === 'host' &&
  condition.value !== undefined &&
  new RegExp(`^${condition.value}$`).test(host.toLowerCase())

/** The header rules that carry an `X-Robots-Tag` and apply to a request for `host`. */
const robotsRules = async (host: string) => {
  const rules = (await nextConfig.headers?.()) ?? []

  return rules.filter(
    (rule) =>
      rule.headers.some(({ key }) => key === 'X-Robots-Tag') &&
      (rule.has ?? []).every((condition) => holdsFor(condition, host)),
  )
}

/**
 * The `X-Robots-Tag` a request for `host` is answered with, or `undefined` when
 * no rule claims it. Later rules win over earlier ones, as Next documents for
 * two rules setting the same key.
 */
const robotsTag = async (host: string) =>
  (await robotsRules(host))
    .flatMap((rule) => rule.headers)
    .filter(({ key }) => key === 'X-Robots-Tag')
    .at(-1)?.value

describe('hosts kept out of the index', () => {
  it('marks the staging copy served from the legacy domain', async () => {
    expect(await robotsTag('abonnes.randonnees-touloises.net')).toBe(NOINDEX)
  })

  /**
   * The production alias is not a copy of the site, it is the site under a
   * second name — the address the project answers on before a domain of the
   * club's own is put in front of it, and the one this was found at.
   */
  it('marks the production alias Vercel gives the project', async () => {
    expect(await robotsTag('randonnees-touloises.vercel.app')).toBe(NOINDEX)
  })

  /** Names nobody writes down, which is why the pattern covers the space. */
  it('marks a preview deployment, whose host is minted per branch', async () => {
    expect(await robotsTag('randonnees-touloises-git-main-mbret.vercel.app')).toBe(NOINDEX)
    expect(await robotsTag('randonnees-touloises-abc1234-mbret.vercel.app')).toBe(NOINDEX)
  })

  /**
   * The whole point of scoping by host: the rule has to be inert on the address
   * the club publishes, or the cutover deindexes the live site.
   */
  it('leaves the host the site will be published on indexable', async () => {
    expect(await robotsTag('www.randonnees-touloises.net')).toBeUndefined()
    expect(await robotsTag('randonnees-touloises.net')).toBeUndefined()
  })

  /** Anchored, so a public host is not caught by carrying one of these inside it. */
  it('reads a pattern as the whole host rather than a substring of it', async () => {
    expect(await robotsTag('randonnees-touloises.vercel.app.example.com')).toBeUndefined()
    expect(await robotsTag('abonnes.randonnees-touloises.net.example.com')).toBeUndefined()
  })

  /** A mark on the home page alone would leave every other URL crawlable. */
  it('sends the mark on every path of a host it claims', async () => {
    const rules = await robotsRules('randonnees-touloises.vercel.app')

    expect(rules).not.toHaveLength(0)
    expect(rules.map(({ source }) => source)).toEqual(rules.map(() => EVERY_PATH))
  })
})
