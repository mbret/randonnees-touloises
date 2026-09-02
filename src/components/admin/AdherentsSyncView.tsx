import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import React from 'react'

import { seasonFor } from '@/collections/Adherents/sync/season'

import { AdherentsSyncScreen } from './AdherentsSyncScreen'

/**
 * The comparison screen, inside the admin's own chrome.
 *
 * A server component so it can hand `DefaultTemplate` what it needs — the nav,
 * the language, the visible collections — and so the season it proposes is
 * worked out on the server rather than from whatever the browser thinks the date
 * is. The interactive half is a client component underneath.
 */
export const AdherentsSyncView: React.FC<AdminViewServerProps> = ({
  initPageResult,
  params,
  searchParams,
}) => (
  <DefaultTemplate
    i18n={initPageResult.req.i18n}
    locale={initPageResult.locale}
    params={params}
    payload={initPageResult.req.payload}
    permissions={initPageResult.permissions}
    req={initPageResult.req}
    searchParams={searchParams}
    user={initPageResult.req.user ?? undefined}
    visibleEntities={initPageResult.visibleEntities}
  >
    <AdherentsSyncScreen defaultSeason={seasonFor(new Date())} />
  </DefaultTemplate>
)
