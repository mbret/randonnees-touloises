import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'
import { HeroSubtitle } from '../HeroSubtitle'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
      subtitle?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
      subtitle?: Page['hero']['subtitle']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText, subtitle }) => {
  return (
    /* The page's frame, arrived at in two parts: `[slug]` gives the article 24px
     * of padding and this makes up the rest of what `page-shell` gives a coded
     * page — 48px above the title on a phone, 96px from `md` up. A flat `mt-16`
     * here put a CMS page's title 88px down at every width, which on a phone was
     * nearly twice what the rest of the site had settled on.
     *
     * Made up here rather than by widening the article's own padding, because
     * the high-impact hero slides up into that padding by a fixed `-mt-[10.4rem]`
     * — widening it would move the picture rather than the title. */
    <div className="container mt-6 md:mt-18">
      <div className="max-w-3xl">
        {children || (
          <>
            {richText && <RichText data={richText} enableGutter={false} />}
            <HeroSubtitle className="mt-4">{subtitle}</HeroSubtitle>
          </>
        )}
      </div>
    </div>
  )
}
