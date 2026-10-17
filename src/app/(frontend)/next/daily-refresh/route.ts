import { revalidatePath } from 'next/cache'

import { dailyRefresh } from '@/utilities/dailyRefresh'
import { isCronRequest } from '@/utilities/isCronRequest'
import { todayInFrance } from '@/utilities/parisDay'

/**
 * Called by the Vercel cron in `vercel.json` once a day, at midnight UTC: 1 or
 * 2am in Toul, so already the new day there, which is the day the pages work
 * out. Hobby allows a daily cron at most, and fires it somewhere in the hour.
 *
 * Which pages, and why those, is in `utilities/dailyRefresh`. Nothing renders
 * here: a refreshed page is rendered for whoever asks for it next, and a page
 * nobody asks for costs nothing.
 *
 * Vercel does not retry a cron that fails. If one is missed, these pages keep
 * yesterday's content until the next night, or until an edit refreshes them.
 */
export async function GET(request: Request): Promise<Response> {
  if (!isCronRequest(request.headers)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const today = todayInFrance()
  const paths = dailyRefresh(today)

  for (const [path, type] of paths) revalidatePath(path, type)

  return Response.json({
    refreshed: paths.map(([path, type]) => (type ? `${path} (${type})` : path)),
    today,
  })
}
