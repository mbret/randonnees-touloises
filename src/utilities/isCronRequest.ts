/**
 * Whether a request comes from one of the Vercel crons in `vercel.json`.
 *
 * Vercel sends the project's `CRON_SECRET` as `Authorization: Bearer <secret>`
 * on every cron invocation, so the header is all there is to compare. An unset
 * secret refuses everyone. Without that check, an unset secret made the
 * expected header `Bearer undefined`, and anyone could send that.
 */
export const isCronRequest = (headers: Pick<Headers, 'get'>) => {
  const secret = process.env.CRON_SECRET

  return Boolean(secret) && headers.get('authorization') === `Bearer ${secret}`
}
