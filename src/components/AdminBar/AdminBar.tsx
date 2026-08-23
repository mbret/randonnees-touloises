'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/components/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useCallback, useEffect, useState } from 'react'
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
 * The bar, once there is somebody to show it to.
 *
 * Split from the component below so this state belongs to the mount: logging out
 * unmounts this and takes the answer with it, rather than leaving a stale one to
 * reveal the wrapper the moment somebody logs back in.
 */
const MountedAdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = ({ adminBarProps }) => {
  const segments = useSelectedLayoutSegments()
  const router = useRouter()

  /**
   * Whether the bar has anything to show yet, which is still `onAuthChange` and
   * has to be: `PayloadAdminBar` renders nothing until its own request to
   * `/api/users/me` comes back. Revealing the wrapper before then would put an
   * empty black strip at the top of the page — and, since the bar's height is
   * what the header offsets against, shift the page under the reader — for as
   * long as that request takes.
   */
  const [ready, setReady] = useState(false)

  const onAuthChange = useCallback((barUser: PayloadMeUser) => {
    setReady(Boolean(barUser?.id))
  }, [])

  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels

  /* Cleaned up on the way out as well, so logging out gives the header its
   * offset back. */
  useEffect(() => {
    if (!ready) return

    document.documentElement.classList.add('admin-bar-enabled')

    return () => document.documentElement.classList.remove('admin-bar-enabled')
  }, [ready])

  return (
    <div
      className={cn(
        styles['admin-bar'],
        'admin-bar',
        'sticky z-12 top-0 h-[var(--admin-bar-height)] bg-black  border-b backdrop-blur-[8px] items-center justify-center',
        {
          flex: ready,
          hidden: !ready,
        },
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
          onAuthChange={onAuthChange}
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

/**
 * Whether the bar is worth mounting at all, which the auth provider already
 * resolves once for the whole tree.
 *
 * `PayloadAdminBar` asks the same question itself, fetching `/api/users/me` from
 * an effect of its own — so mounting it unconditionally spent a second round trip
 * on every visit by somebody who will never see the bar. Gating the mount is the
 * only way to avoid that: the component takes no user prop, and declining to
 * fetch is not on offer.
 */
export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { user } = useAuth()

  if (!user) return null

  return <MountedAdminBar adminBarProps={props?.adminBarProps} />
}
