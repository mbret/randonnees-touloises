import { PROGRAMS_BASE } from '@/utilities/postPath'

type Refresh = [path: string, type?: 'layout' | 'page']

/**
 * The pages whose content changes because the date did, with no edit for a
 * hook to hear: the home page's agenda and programme drop what has passed,
 * /programs drops an entry the day after it ends, and each entry's own page
 * works out its registration status against today.
 *
 * Each is held until a hook or the daily refresh, in
 * `app/(frontend)/next/daily-refresh`, refreshes it, so this list is the only
 * thing that moves them at midnight. A page that starts reading
 * `todayInFrance()` belongs here too.
 *
 * Only these, not every page: an expired page is re-rendered in full for
 * whoever asks for it next, so refreshing the rest each night would buy
 * renders that come out the same. The sitemap is not on the list either: it
 * lists every published post whatever its dates, so it only changes on an
 * edit, and the post and page hooks already refresh it then.
 *
 * The entry pages go by their route file rather than by address, which covers
 * every slug without a query. The pattern names the `(frontend)` group because
 * Next tags a cached page with its file's path, group included.
 */
export const DAILY_PATHS: Refresh[] = [
  ['/'],
  [PROGRAMS_BASE],
  ['/(frontend)/programs/[slug]', 'page'],
]

/**
 * The footer prints the year, and every prerendered page carries the footer.
 * So on the first of January, and only then, the whole site is refreshed:
 * `revalidatePath('/', 'layout')` reaches every page under the root layout,
 * the ones above included. Once a year is cheap; every night would be most of
 * the site re-rendered to print the same year.
 */
export const isNewYear = (today: string) => today.endsWith('-01-01')

/** What the daily refresh hands `revalidatePath` on a given day in Toul. */
export const dailyRefresh = (today: string): Refresh[] =>
  isNewYear(today) ? [['/', 'layout']] : DAILY_PATHS
