import React from 'react'

import type { MembershipTiersBlock as MembershipTiersBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Card } from '@/components/ui/card'

import { tierLineIcons } from './lineIcons'
import { type TierLineKind, tierLineLabels } from './lines'

type Tier = NonNullable<MembershipTiersBlockProps['tiers']>[number]
type TierLine = NonNullable<Tier['lines']>[number]

/**
 * Amounts are written the French way — the sign after the number, separated by
 * a non-breaking space — which `Intl` gives for free and a template string does
 * not. Decimals only when there are any: a membership is a round number of
 * euros, and `48,00 €` on four cards is noise on all four.
 */
const formatPrice = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    style: 'currency',
  }).format(value)

/**
 * The order the three kinds read in, whatever order they were entered in: who
 * the formula is for, then what comes off the price, then what to bring.
 *
 * Sorted rather than validated, because the shape is the block's decision and
 * not the editor's — they add a remise to a card without having to think about
 * where in the list it belongs.
 */
const KIND_ORDER: TierLineKind[] = ['condition', 'discount', 'requirement']

const byKind = (a: TierLine, b: TierLine) =>
  KIND_ORDER.indexOf(a.kind as TierLineKind) - KIND_ORDER.indexOf(b.kind as TierLineKind)

/**
 * A remise is the one line worth stopping on — it changes the number printed
 * above it — so it is set in a panel of its own rather than being the third
 * bullet of five. A requirement is the opposite: true, needed, and not what
 * anyone is choosing between, so it sits quietly at the bottom.
 */
const lineStyles: Record<TierLineKind, { icon: string; row: string; text: string }> = {
  condition: { icon: 'text-primary', row: '', text: '' },
  discount: {
    icon: 'text-primary',
    row: 'bg-muted/60 rounded-lg px-3 py-2.5',
    text: 'font-medium',
  },
  requirement: { icon: 'text-muted-foreground', row: '', text: 'text-muted-foreground' },
}

export const MembershipTiersBlock: React.FC<MembershipTiersBlockProps> = ({
  footnote,
  heading,
  tiers,
}) => {
  if (!tiers?.length) return null

  /* Whether the row reserves a line for the ribbon at all. A block whose
     formulas are all equal has nothing to put there, and four cards each
     holding an empty band open a gap above every name. */
  const anyBadge = tiers.some(({ badge }) => Boolean(badge?.trim()))

  return (
    <div className="container">
      {heading && <h2 className="mb-8 text-2xl font-semibold">{heading}</h2>}

      {/* Two to a row and no more, at every width past a phone. The container
          caps at 64rem, so four columns would leave each card ~230px — narrower
          than the sentence about the Meurthe-et-Moselle remise needs to stay
          readable, and the cards are being compared in pairs anyway: the two
          formulas for somebody who holds no licence, then the two for somebody
          who already holds one elsewhere. */}
      <ul className="grid list-none gap-6 p-0 sm:grid-cols-2">
        {tiers.map(({ badge, enableLink, id, lines, link, name, price, priceNote }) => {
          const featured = Boolean(badge?.trim())
          const orderedLines = [...(lines ?? [])].sort(byKind)
          /* The toggle decides, not the leftovers: an editor who fills a link
             and then switches the button off leaves the target behind in the
             document, and it is the switch they mean. The target is checked too
             because `CMSLink` renders nothing without one, and the padding that
             would hold the button must not outlive it. */
          const hasTarget = Boolean(enableLink && (link?.url || link?.reference))

          return (
            <li className="flex" key={id ?? name}>
              <Card
                className={`flex w-full flex-col gap-0 p-6 transition-shadow hover:shadow-md sm:p-8 ${
                  featured ? 'ring-primary shadow-sm ring-2' : ''
                }`}
              >
                {/* The ribbon holds the row's height whether a card carries
                    one or not, so the four names line up and the four prices
                    line up — the comparison the grid exists to make. Only
                    where there is a row to align to, though: stacked on a
                    phone, an empty band above three of four cards is three
                    gaps that say nothing. */}
                {anyBadge && (
                  <p className={`mb-4 h-6 ${featured ? '' : 'hidden sm:block'}`}>
                    {featured && (
                      <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase">
                        {badge}
                      </span>
                    )}
                  </p>
                )}

                <h3 className="text-xl font-semibold">{name}</h3>

                {/* `tabular-nums` so a 15 and a 94 occupy the same width: the
                    prices sit at the same place in each card, and the eye reads
                    down the column instead of hunting. */}
                <p className="mt-3 text-4xl font-semibold tracking-tight tabular-nums">
                  {formatPrice(price)}
                </p>

                {priceNote && <p className="text-muted-foreground mt-1 text-sm">{priceNote}</p>}

                {orderedLines.length > 0 && (
                  <ul className="mt-6 grid list-none gap-3 p-0 text-sm">
                    {orderedLines.map((line) => {
                      const kind = line.kind as TierLineKind
                      const Icon = tierLineIcons[kind]
                      const style = lineStyles[kind]

                      return (
                        <li className={`flex gap-3 ${style.row}`} key={line.id ?? line.text}>
                          {/* The mark is decoration for a reader who can see
                              it and repetition for one who cannot — four cards
                              saying "coche" down the list. The kind is said
                              once instead, and only where it is not already
                              obvious from the sentence. */}
                          <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${style.icon}`} />
                          <span className={style.text}>
                            {kind !== 'condition' && (
                              <span className="sr-only">{`${tierLineLabels[kind]} : `}</span>
                            )}
                            {line.text}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* `mt-auto` above the button, not a margin below the list: the
                    buttons of a row line up at its foot however many lines the
                    cards above them carry. */}
                {hasTarget && (
                  <div className="mt-auto pt-8">
                    <CMSLink
                      {...link}
                      appearance={featured ? 'default' : 'outline'}
                      className="w-full"
                      size="lg"
                    >
                      {/* Four buttons that all read "Formulaire d'inscription"
                          are four indistinguishable entries in a screen
                          reader's list of links. The formula's name is added
                          for them, and only for them — it is already the
                          heading of the card on screen. */}
                      <span className="sr-only">{` — formule ${name}`}</span>
                    </CMSLink>
                  </div>
                )}
              </Card>
            </li>
          )
        })}
      </ul>

      {footnote && <p className="text-muted-foreground mt-6 text-sm">{footnote}</p>}
    </div>
  )
}
