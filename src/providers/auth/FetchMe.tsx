import { getClientSideURL } from '@/utilities/getURL'
import { clearSignedInCookie, hasSignedInCookie } from '@/utilities/signedInCookie'
import { useEffect } from 'react'
import { useAuth } from './useAuth'

export const FetchMe = () => {
  const { setUser, setStatus } = useAuth()

  useEffect(() => {
    const fetchMe = async () => {
      /* Nobody signed in from this browser: nothing to ask a function about. */
      if (!hasSignedInCookie()) {
        setUser(null)
        return
      }

      try {
        const res = await fetch(`${getClientSideURL()}/api/users/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        })

        if (res.ok) {
          const { user: meUser } = await res.json()
          /* The token expired or was cleared without a logout: stop asking. */
          if (!meUser) clearSignedInCookie()
          setUser(meUser || null)
          setStatus(meUser ? 'loggedIn' : undefined)
        } else {
          throw new Error('An error occurred while fetching your account.')
        }
      } catch {
        setUser(null)
        throw new Error('An error occurred while fetching your account.')
      }
    }

    void fetchMe()
  }, [setStatus, setUser])

  return null
}
