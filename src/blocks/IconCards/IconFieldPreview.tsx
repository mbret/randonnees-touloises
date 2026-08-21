'use client'

import React from 'react'

import { useField } from '@payloadcms/ui'

import { iconComponents } from './iconComponents'
import { type CardIcon, cardIconLabels } from './icons'

/**
 * Draws the icon the field currently names, beside the field.
 *
 * `useField` with no path resolves the field from the context every field is
 * wrapped in, which is what lets one component serve every row of the array
 * without being told which row it sits in.
 *
 * Styled inline against Payload's own custom properties: the admin does not
 * load the site's stylesheet, so a Tailwind class here would name nothing.
 */
export const IconFieldPreview: React.FC = () => {
  const { value } = useField<CardIcon>()

  const Icon = value ? iconComponents[value] : undefined

  if (!Icon) return null

  return (
    <div
      style={{
        alignItems: 'center',
        color: 'var(--theme-elevation-600)',
        display: 'flex',
        gap: '.5rem',
        paddingTop: '.5rem',
      }}
    >
      <Icon aria-hidden size={20} strokeWidth={2} />
      <span style={{ fontSize: '.8rem' }}>{cardIconLabels[value]}</span>
    </div>
  )
}
