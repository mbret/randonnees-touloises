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

/**
 * The bar an editor sees on the site, above the page they are looking at.
 *
 * Whether to show it is `AuthProvider`'s answer rather than the bar's own.
 * `PayloadAdminBar` asks `/api/users/me` for itself the moment it mounts, and
 * that is a function invocation nothing can cache — so rendering it hidden, as
 * this did, spent one on every page view by every visitor, to be told what
 * `FetchMe` had already asked in parallel and what is `null` for all but a
 * handful of people.
 *
 * Mounting it only once a user is known leaves the anonymous visit with the one
 * request the provider was making anyway. An editor still pays the bar's own,
 * which is the price of a component that takes no user and accepts no way to
 * skip the fetch.
 */
export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const { user } = useAuth()
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  /* `undefined` while the provider is still asking, `null` once it knows. */
  const show = Boolean(user)

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
        'sticky z-12 top-0 h-[var(--admin-bar-height)] bg-black  border-b backdrop-blur-[8px] items-center justify-center',
        'flex',
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
