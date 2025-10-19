import { getCachedGlobal } from '@/utilities/getGlobals'
import { cookies } from 'next/headers'
import { ContentProtectedPasswordForm } from './ContentProtectedPasswordForm'

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

  console.log(general)

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
