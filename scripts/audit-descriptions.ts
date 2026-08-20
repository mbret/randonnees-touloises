/**
 * Audit the meta descriptions already stored in the posts collection, and
 * optionally rewrite the ones that should never have been published.
 *
 *   pnpm payload run scripts/audit-descriptions.ts            # report only
 *   FIX=1 pnpm payload run scripts/audit-descriptions.ts      # rewrite them
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 FIX=1 \
 *     pnpm payload run scripts/audit-descriptions.ts
 *
 * `fillMeta` and `publicDescription` keep contact details out of what the site
 * publishes from now on, but neither rewrites a row that is already there: a
 * description written before they existed keeps its phone number in the database
 * until something saves the post. Reading through `publicDescription` means such
 * a row is no longer published, so this is a tidy-up rather than the fix — it is
 * how the stored values catch up with what the site serves.
 *
 * Two kinds of row are put right, and the difference matters because one of them
 * is somebody's writing:
 *
 * - A description the old hook derived from the body is re-derived, which is what
 *   also clears the button labels it used to paste in. It is recognised by being
 *   character-for-character what that hook would have produced, so nothing an
 *   editor has since reworked is touched.
 * - Any other description only has its contact details taken out. What is left is
 *   still the sentence its author wrote.
 *
 * A rewrite goes through `payload.update`, so the search index is re-synced and
 * the post's own hooks run. Only the current row is rewritten: older versions
 * keep what they said, and none of them is served publicly.
 */
import type { Post } from '@/payload-types'

import { fillMeta } from '@/collections/Posts/hooks/fillMeta'

/**
 * The description the previous version of `fillMeta` would have derived: every
 * string in the body, spaces collapsed, cut at 155 characters. It lives on here
 * for one reason — a stored description that matches it was written by that hook
 * rather than by a person, and can be re-derived without losing anyone's words.
 */
const legacySummarise = (node: unknown): string => {
  const textOf = (value: unknown): string => {
    if (!value || typeof value !== 'object') return ''

    const { children, root, text } = value as {
      children?: unknown[]
      root?: unknown
      text?: unknown
    }

    if (typeof text === 'string') return text
    if (root) return textOf(root)

    return Array.isArray(children) ? children.map(textOf).join(' ') : ''
  }

  const text = textOf(node).replace(/\s+/g, ' ').trim()

  return text.length <= 155 ? text : `${text.slice(0, 154).trimEnd()}…`
}

/** What `fillMeta` would write for this post today. */
const intended = (post: Post) => {
  const derived = post.meta?.description === legacySummarise(post.content)

  // Blanking the field first is what asks the hook to derive rather than to keep:
  // it fills an empty description and only scrubs a filled one.
  const data = derived ? { ...post, meta: { ...post.meta, description: '' } } : post

  const result = fillMeta({ data, originalDoc: post, operation: 'update' } as unknown as Parameters<
    typeof fillMeta
  >[0]) as Partial<Post>

  return result.meta?.description ?? ''
}

const describeTarget = () => {
  try {
    const { host, pathname } = new URL(process.env.POSTGRES_URL ?? '')

    return `${host}${pathname}`
  } catch {
    return 'unknown (POSTGRES_URL is not set)'
  }
}

const isLocal = (target: string) =>
  /^(localhost|127\.0\.0\.1|host\.docker\.internal)[:/]/.test(target)

const main = async () => {
  const fix = process.env.FIX === '1'
  const target = describeTarget()

  if (fix && !isLocal(target) && !process.env.ALLOW_REMOTE_DB) {
    console.error(
      `Refusing to write to ${target}: set ALLOW_REMOTE_DB=1 to rewrite a non-local database.`,
    )
    process.exit(1)
  }

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })

  let flagged = 0

  for (const post of docs) {
    const stored = post.meta?.description ?? ''
    const wanted = intended(post as Post)

    if (stored === wanted) continue

    flagged++
    console.log(`\n${post.slug}`)
    console.log(`  stored : ${stored || '(vide)'}`)
    console.log(`  wanted : ${wanted || '(vide)'}`)

    if (!fix) continue

    await payload.update({
      collection: 'posts',
      // The afterChange hook calls revalidatePath, which throws outside a Next
      // request. Nothing is serving pages from this process anyway.
      context: { disableRevalidate: true },
      data: { meta: { ...post.meta, description: wanted } },
      id: post.id,
    })
    console.log('  rewritten')
  }

  console.log(
    `\n${flagged} of ${docs.length} descriptions ${fix ? 'rewritten' : 'to rewrite'}` +
      `${flagged && !fix ? ' — rerun with FIX=1 to apply' : ''}.`,
  )
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
