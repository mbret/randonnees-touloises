import { describe, expect, it } from 'vitest'

import { formatDeadline } from '@/components/programs/formatSchedule'
import { registrationStatus } from '@/components/programs/registrationStatus'

const TODAY = '2026-09-15'

describe('whether an outing can still be joined', () => {
  it('says nothing about an outing the club has said nothing about', () => {
    expect(registrationStatus({}, TODAY)).toBeNull()
  })

  it('names the last day while it is still to come', () => {
    expect(registrationStatus({ deadline: '2026-09-18' }, TODAY)).toEqual({
      kind: 'open',
      deadline: '2026-09-18',
    })
  })

  /**
   * The deadline is a day someone can still sign up on, not the day after the
   * last one — an outing closing « le 18 » is open all of the 18th.
   */
  it('is still open on the deadline itself', () => {
    expect(registrationStatus({ deadline: TODAY }, TODAY)).toEqual({
      kind: 'open',
      deadline: TODAY,
    })
  })

  it('closes the day after', () => {
    expect(registrationStatus({ deadline: '2026-09-14' }, TODAY)).toEqual({ kind: 'closed' })
  })

  it('reports a full outing as full rather than as open', () => {
    expect(registrationStatus({ deadline: '2026-09-18', isFull: true }, TODAY)).toEqual({
      kind: 'full',
    })
  })

  /** Being full is the news, whether or not the deadline has also passed. */
  it('reports a full outing as full rather than as closed', () => {
    expect(registrationStatus({ deadline: '2026-09-14', isFull: true }, TODAY)).toEqual({
      kind: 'full',
    })
  })

  it('treats an unticked box as nothing said', () => {
    expect(registrationStatus({ isFull: false }, TODAY)).toBeNull()
  })
})

describe('how the last day is written', () => {
  it('drops the year the line above it has just printed', () => {
    expect(formatDeadline('2026-09-18', '2026-09-20')).toBe('18 septembre')
  })

  /** A séjour booked the previous autumn, where the year is the whole point. */
  it('keeps a year the outing does not share', () => {
    expect(formatDeadline('2026-11-30', '2027-02-06')).toBe('30 novembre 2026')
  })

  it('keeps the year when there is no outing date to compare it against', () => {
    expect(formatDeadline('2026-09-18')).toBe('18 septembre 2026')
  })
})
