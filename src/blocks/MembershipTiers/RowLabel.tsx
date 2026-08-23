'use client'
import type { MembershipTiersBlock } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

/**
 * Rows start collapsed, so the label is all an editor has to find the formula
 * whose price they came to change — hence the price in it, which is also the
 * one value worth checking without opening anything.
 */
export const RowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<NonNullable<MembershipTiersBlock['tiers']>[number]>()

  const position = rowNumber !== undefined ? `${rowNumber + 1}. ` : ''

  if (!data?.name) return <div>{`${position}Formule`}</div>

  /* `typeof`, not a truthiness check: a formula the club offers for nothing is
   * priced at 0, and that is a price to show rather than one to hide. */
  const price = typeof data.price === 'number' ? ` — ${data.price} €` : ''

  return <div>{`${position}${data.name}${price}`}</div>
}
