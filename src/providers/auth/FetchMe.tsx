import { getClientSideURL } from '@/utilities/getURL'
import { useEffect } from 'react'
import { useAuth } from './useAuth'

export const FetchMe = () => {
  const { setUser, setStatus } = useAuth()

  useEffect(() => {
    const fetchMe = async () => {
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
          setUser(meUser || null)
          setStatus(meUser ? 'loggedIn' : undefined)
        } else {
          throw new Error('An error occurred while fetching your account.')
        }
      } catch (e) {
        setUser(null)
        throw new Error('An error occurred while fetching your account.')
      }
    }

    void fetchMe()
  }, [])

  return null
}
