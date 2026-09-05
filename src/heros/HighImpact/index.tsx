'use client'
import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { HeroSubtitle } from '../HeroSubtitle'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText, subtitle }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[10.4rem] flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-146 md:text-center">
          {richText && (
            <RichText className={subtitle ? 'mb-3' : 'mb-6'} data={richText} enableGutter={false} />
          )}
          {/* Not the muted token here: this hero lays white type over a
           * photograph, and `--muted-foreground` is a grey chosen against the
           * page background. */}
          <HeroSubtitle className="mb-6 text-white/90">{subtitle}</HeroSubtitle>
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
      </div>
    </div>
  )
}
