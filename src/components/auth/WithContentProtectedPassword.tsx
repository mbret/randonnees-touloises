import { getCachedGlobal } from '@/utilities/getGlobals'
import { cookies } from 'next/headers'
import { ContentProtectedPasswordForm } from './ContentProtectedPasswordForm'

/**
 * Hides a post's body behind a single shared password.
 *
 * This is a soft lock and deliberately so: it keeps a casual visitor out of the
 * members' pages without anyone having to hold an account, and that is all it is
 * asked to do. It is not a security boundary and would not survive anyone who
 * went looking, on two counts:
 *
 * - `ContentProtectedPasswordForm` compares the password in the browser, so the
 *   value is in the page for every visitor of a gated post.
 * - The `general` global is publicly readable, so `/api/globals/general` hands it
 *   out as well.
 *
 * TODO: known, and worth doing better — check the password on the server and set
 * a signed cookie from there, so `contentPassword` never reaches the client.
 * Until that happens, treat this as a speed bump: nothing that genuinely needs
 * protecting should be the only thing standing behind it.
 */
export const WithContentProtectedPassword = async ({
  children,
  required,
}: {
  children: React.ReactNode
  required: boolean | undefined | null
}) => {
  const general = await getCachedGlobal('general', 1)()
  const cookieStore = await cookies()
  const password = cookieStore.get('contentPassword')

  if (!general.contentPassword) {
    return children
  }

  if (required && password?.value !== general.contentPassword) {
    return (
      <div className="container flex grow items-center justify-center py-12">
        <ContentProtectedPasswordForm general={general} />
      </div>
    )
  }

  return children
}
