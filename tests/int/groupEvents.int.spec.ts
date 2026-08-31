import { describe, expect, it } from 'vitest'

import type { AgendaDay } from '@/components/agenda/groupEvents'

import { groupDaysByWeek } from '@/components/agenda/groupEvents'

const day = (date: string): AgendaDay => ({ date, label: date, events: [] })

describe('how a month cuts into weeks', () => {
  it('breaks on Mondays and keeps a week’s days together', () => {
    const weeks = groupDaysByWeek([day('2026-09-01'), day('2026-09-03'), day('2026-09-07')])

    expect(weeks.map((week) => week.days.map(({ date }) => date))).toEqual([
      ['2026-09-01', '2026-09-03'],
      ['2026-09-07'],
    ])
    expect(weeks.map(({ start }) => start)).toEqual(['2026-08-31', '2026-09-07'])
  })

  /* `getUTCDay` counts weeks from Sunday; the programme counts them to it. */
  it('lands a Sunday in the week its Monday opened', () => {
    expect(groupDaysByWeek([day('2026-09-06')])[0].start).toBe('2026-08-31')
  })

  /** Abbreviated (« sept. »), so the line fits a phone beside its count. */
  it('names a week with one month name when one is enough', () => {
    expect(groupDaysByWeek([day('2026-09-22')])[0].label).toBe('Semaine du 21 au 27 sept.')
  })

  it('spells out both months when the week straddles the turn of one', () => {
    expect(groupDaysByWeek([day('2026-08-31')])[0].label).toBe('Semaine du 31 août au 6 sept.')
  })
})
