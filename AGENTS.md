<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Stay on Vercel's free plan

This site runs on Vercel's Hobby plan, and staying inside its free limits comes first. Weigh every change by what it costs to serve. When options differ in cost, prefer the one that keeps requests off Vercel Functions, even if it is more work or the content is a little less fresh.

Hobby's limits are hard caps, shared by every project on the account. Going over one means waiting up to 30 days before that feature works again. If Functions stop, so do the admin and every page or form that needs the server. The tightest limit is Active CPU: 4 hours a month. The full list is in [Vercel's limits](https://vercel.com/docs/limits).

## What spends usage

Anything that runs a function spends Active CPU, and a cold start that loads Payload costs the most:

- a page rendered per request (`ƒ` in the route table that `next build` prints), and every prefetch of one;
- a route handler, Payload's REST or GraphQL API, and the admin;
- a background regeneration when a `revalidate` window expires;
- `proxy.ts` (middleware), which runs on every request it matches;
- cron jobs.

Deployments count too: Hobby allows 100 a day. Only `main` deploys automatically (`git.deploymentEnabled` in `vercel.json`). Keep it that way.

## Defaults

- Public pages are static or ISR, refreshed on CMS changes by the Payload revalidate hooks. A public page that shows `ƒ` in the route table is a regression unless it has to read the request.
- A public page reads `cookies()`, `headers()` or `searchParams` only when it must be rendered per request.
- Nothing calls the backend from the browser on page load for an anonymous visitor.
- A `<Link>` to a page rendered per request gets `prefetch={false}`.
- A route handler whose answer is the same for everyone sends `s-maxage`, as the map-tiles and thumbnail routes do.
- A time-based `revalidate` is only for content that changes with the clock, with the longest window the content allows.

## Flag cost to the owner

When a change could raise Vercel usage, say so before making it, and again in the PR description with a rough estimate, such as function calls per page view or per day. That includes:

- a new per-request page, route handler, browser call to the API, or `proxy.ts`;
- a new or more frequent cron job;
- a shorter `revalidate` window;
- more image variants (`deviceSizes`, `imageSizes`, `qualities`) or new images through `next/image`;
- turning preview deployments back on, or anything else that adds deployments;
- a paid Vercel feature or a plan change.

If the cost of an option is unclear, ask rather than guess.
