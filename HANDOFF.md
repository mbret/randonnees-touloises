# Handoff — migrating the "On recrute" section

Working notes for whoever picks this up. **Delete this file before merging.**

Branch: `claude/on-recrute-section-migration-nun5eg` (3 commits plus this note, pushed).

---

## The ask

Bring the "On recrute" section from the old site, <https://www.randonnees-touloises.net/>,
onto the new one. The owner's opening idea was to make it a news post.

The old section is **one PNG poster** on the home page — no text, no links.
Its message: _"Devenez animateur bénévole ! Rejoignez les Randonnées
Touloises"_, three promises (proposez des randonnées / partagez votre passion /
en toute convivialité), "aucune expérience exigée", contact
`randonneestouloises@gmail.com`. Every word of that is baked into pixels, so
today it reaches neither a search engine nor a screen reader.

The poster is committed at `public/recrutement-animateurs.webp` (converted from
the original 1.5 MB PNG down to 183 KB).

---

## Where it stands

| Commit    | What it does                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `596c86e` | `/devenir-animateur` as a **hardcoded page** + nav entry + sitemap + inbound links from `/about` and `/animation-team` |
| `e8aec2d` | Unrelated bug fix in the Content block — see [Findings](#findings)                                                     |
| `9cdcac7` | `scripts/import-recruitment-page.ts`, seeding the **same content as a CMS page** at `/devenir-animateur-cms`           |

Both versions render. The point of having both is to choose between them, not to
ship both.

Checks: `pnpm lint` 0 errors, `npx tsc --noEmit` clean, `pnpm test:int` 44 pass.
`tests/int/api.int.spec.ts` fails without a `PAYLOAD_SECRET` in `.env` — that is
environmental, not this branch.

---

## The open decision

**Hardcoded page, or CMS page?** Nothing is settled. The owner asked to see the
design before deciding, which is where the conversation stopped.

Agreed so far:

- **Not a news post as its only home.** Recruitment is standing, not dated; a
  post gets a publish date, scrolls off `/news`, and reads as stale in a season.
  A short post _announcing_ the drive and linking to the page is still wanted —
  copy was drafted but is not in the repo, and posts are CMS content anyway.
- **Restate the poster as real text**, keep the poster as the illustration.
  Text-in-an-image is invisible to search and to screen readers.

The case for CMS, which is stronger here than for `/about` or `/privacy`: this
is the committee's message and they will reword it every season, the `pages`
collection is fully wired (hero + blocks, drafts, autosave live preview,
scheduled publish, SEO), and `FormBlock` means it could collect candidates
instead of firing a mailto into a shared Gmail.

The case for code: every institutional page here is deliberately hardcoded
(`feat: add static about page`, `static activities page`), and the icon cards
have no block equivalent.

Three questions were put to the owner and all three are **unanswered**:

1. Three promises as icon cards (needs a new block if CMS), three rich-text
   columns, or folded into prose?
2. Keep the mailto, or build a real `FormBlock` for candidates?
3. If CMS wins, revert the hardcoded page or keep both for now?

Plus one raised at the very end and not yet answered: **should the seed script
also add the nav entry?**

---

## Findings

Things learned by actually rendering both versions — worth knowing before you
re-litigate any of it.

### A real bug in the Content block (fixed in `e8aec2d`)

`src/blocks/Content/Component.tsx` built its width class by interpolation:

```text
`col-span-4 lg:col-span-${colsSpanClasses[size!]}`
```

Tailwind finds classes by scanning source for whole ones, so **no `lg:col-span-*`
rule was ever generated**. Verified against the compiled stylesheet: it carried
`col-span-4` and `md:col-span-2` and nothing else. Every Content column
therefore stayed 2/12 wide from `md` upward whatever width the editor picked — a
"Pleine largeur" column rendered at one sixth of the container.

This affected **every CMS page using Content blocks**, not just this one. The fix
writes the four classes out. It is a standalone commit and can be dropped
independently of the rest.

### The poster is what makes the CMS version weaker, not the cards

Losing the icon cards costs less than expected — three rich-text columns with
bold headings read fine. The real cost is that `MediaBlock` renders full
container width with nothing beside it, so the portrait poster becomes an
~800px slab with an empty right half, pushing the prose a full screen down. The
hardcoded page pairs poster and cards side by side, which is why it reads
tighter.

Untried idea that might close the gap: a `mediumImpact` / `highImpact` hero,
which takes a media upload, instead of a `mediaBlock`.

### Nothing puts a CMS page in the nav

The header is built from exactly two sources
(`src/navigation/Header/staticNavItems.ts`): the hardcoded `staticNavItems`
list, then the **Header global** (`En-tête` → `Entrées du menu`) which an editor
fills by hand. Nothing enumerates the `pages` collection, and `Pages`' only
hooks are `revalidatePage`, `populatePublishedAt`, `revalidateDelete`.

So `/devenir-animateur` appears because `596c86e` added it to `staticNavItems`;
`/devenir-animateur-cms` has no entry at all.

**This cuts against the CMS option:** the Header global is `maxRows: 6` and
there are already 10 static entries. A CMS-managed page wants a CMS-managed nav
entry — otherwise unpublishing it leaves a dead link in code — and that spends
one of the six.

### Known rough edges in the hardcoded page

- Desktop leaves ~200px of dead space under the last card, because the poster
  column is taller. One-line fix: `items-start` → `items-center` on the grid.
- With ten static nav entries, "Devenir animateur" collapses into the "Plus"
  overflow at 1440px.

---

## Merge-forward notes — read before you push

**The branch is 13 commits behind `origin/main`** and two of those changed
conventions this page follows. Merge `main` in first, then fix:

1. **Metadata.** `main` added `src/seo/servedAt.ts`; pages now write
   `...servedAt('/path')`, which emits the canonical _and_ `og:url` together.
   `/devenir-animateur/page.tsx` still uses the older
   `openGraph: mergeOpenGraph({ url: … })`, so as-is it would ship with no
   canonical tag. `mergeOpenGraph` still exists — `servedAt` wraps it — so this
   is a small edit, not a rewrite.

2. **Page width.** `main` capped `.container` at 64rem in `globals.css` and
   dropped the per-page `max-w-3xl mx-auto` wrappers in favour of
   `prose max-w-none`, so headings line up across pages.
   `/devenir-animateur/page.tsx` still has `max-w-3xl mx-auto` and `max-w-5xl`
   wrappers and will look narrower than its neighbours until they come out.
   Compare against `origin/main:src/app/(frontend)/about/page.tsx`.

The `STATIC_ROUTES` and `sitemap.int.spec.ts` additions are single inserted
lines in lists `main` did not touch — those should merge clean.

---

## Running it locally

```bash
git checkout claude/on-recrute-section-migration-nun5eg
docker compose -f docker-compose.dev.yml up -d
pnpm payload migrate
pnpm payload run scripts/import-recruitment-page.ts   # seeds the CMS version
pnpm dev
```

- `/devenir-animateur` — hardcoded version
- `/devenir-animateur-cms` — CMS version

You need a `.env` (see `.env.example`); `PAYLOAD_SECRET` and `POSTGRES_URL` are
the two that matter. The compose file maps Postgres to port **54320**.

Seed script knobs, following the other `scripts/import-*.ts`: `DRY_RUN=1`
reports without writing, `FORCE=1` replaces an existing document, `SLUG=…`
overrides the address, and a non-local database needs `ALLOW_REMOTE_DB=1`. It is
safe to rerun — the page is matched on its slug and the poster on its filename.

It deliberately seeds `devenir-animateur-cms`, **not** `devenir-animateur`: a
route file shadows a page document sharing its address, so seeding onto the real
slug while `src/app/(frontend)/devenir-animateur/page.tsx` exists would write a
document nothing renders. Use `SLUG=devenir-animateur FORCE=1` once that route
file is gone.

---

## Facts to verify with the club — do this before publishing either version

The poster says nothing about conditions. The following were **written from
assumption, not from a source**, and they are exactly the part a prospective
volunteer will act on:

- that the association pays for the FFRandonnée training;
- that you must be an adhérent and licensed to the FFRandonnée;
- that a few outings a year is enough, with no weekly commitment;
- that a new animateur is accompanied on their first outings.

They appear in both versions — `src/app/(frontend)/devenir-animateur/page.tsx`
and in the `layout()` of `scripts/import-recruitment-page.ts`. Correct them in
both, or drop them.

The "vingt animateurs" figure comes from `/about`, which is sourced.

---

## Suggested next steps

1. Merge `main`, apply the two convention fixes above.
2. Look at both versions and settle CMS vs code; delete the loser, including its
   nav entry, sitemap line, and seed script if the CMS version goes.
3. Get the four facts confirmed by the club.
4. Whichever survives: fix the desktop whitespace, decide the nav position, and
   write the announcement post in Payload.
