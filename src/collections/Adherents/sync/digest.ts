import { createHash } from 'node:crypto'

import type { SyncPlan } from './plan'

/**
 * A fingerprint of a plan, so that what gets applied is what was read.
 *
 * The screen shows a report, then someone reads it — for 273 rows, that takes a
 * while — and only then confirms. In between, another admin can have edited an
 * adhérent, which changes what the same file would now do. So the plan is
 * recomputed on confirmation and its fingerprint compared against the one the
 * screen was given: if they differ, the new report is shown instead of anything
 * being written.
 *
 * Deterministic because `buildPlan` is: same file, same roster, same season,
 * same plan, in the same order. The fingerprint therefore changes only when the
 * roster underneath has moved — which is exactly the case worth stopping for.
 *
 * No plan is stored anywhere between the two requests. The browser holds the
 * file and sends it again, which is why there is no staging table to expire, to
 * clean up, or to leak a roster from.
 */
export const planDigest = (plan: SyncPlan): string =>
  createHash('sha256').update(JSON.stringify(plan)).digest('hex').slice(0, 32)
