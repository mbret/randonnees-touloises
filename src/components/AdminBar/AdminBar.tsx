'use client'

import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'

import { cn } from '@/components/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import styles from './AdminBar.module.scss'

import { getClientSideURL } from '@/utilities/getURL'
import { useAuth } from '@/providers/auth'

/**
 * `@payloadcms/admin-bar` builds its labels as `Edit ${singular}` / `New
 * ${singular}` and hardcodes "Exit preview mode" — it takes no translations, so
 * only these nouns can be made French from here.
 */
const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'page',
  },
  posts: {
    plural: 'Publications',
    singular: 'publication',
  },
  events: {
    plural: 'Événements',
    singular: 'événement',
  },
}

const Title: React.FC = () => <span>Administration</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  /**
   * Whether there is anyone to show a bar to is already known: the auth provider
   * resolves it once for the whole tree. `PayloadAdminBar` asks the same
   * question itself — it fetches `/api/users/me` from an effect of its own and
   * reports the answer through `onAuthChange` — so rendering it unconditionally
   * spent a second round trip on every visit by someone who will never see the
   * bar. Mounting it only once a user is known leaves that fetch to the handful
   * of logged-in editors, and it is the only way to avoid it: the component
   * takes no user prop.
   */
  const { user } = useAuth()
  const show = Boolean(user)
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  useEffect(() => {
    if (show) {
      document.documentElement.classList.add('admin-bar-enabled')
    } else {
      document.documentElement.classList.remove('admin-bar-enabled')
    }
  }, [show])

  if (!show) return null

  return (
    <div
      className={cn(
        styles['admin-bar'],
        'admin-bar',
        'sticky z-12 top-0 h-[var(--admin-bar-height)] bg-black  border-b backdrop-blur-[8px] flex items-center justify-center',
      )}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'page',
          }}
          logo={<Title />}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
