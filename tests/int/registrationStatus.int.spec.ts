import { describe, expect, it } from 'vitest'

import { formatDeadline } from '@/components/programs/formatSchedule'
import { registrationStatus } from '@/components/programs/registrationStatus'

const TODAY = '2026-09-15'

describe('what the club has said about signing up', () => {
  it('says nothing about an outing the club has said nothing about', () => {
    expect(registrationStatus({}, TODAY)).toBeNull()
  })

  it('names the last day while it is still to come', () => {
    expect(registrationStatus({ deadline: '2026-09-18' }, TODAY)).toEqual({
      openToAll: false,
      deadline: { day: '2026-09-18', closed: false },
    })
  })

  /**
   * The deadline is a day someone can still sign up on, not the day after the
   * last one — an outing closing « le 18 » is open all of the 18th.
   */
  it('is still open on the deadline itself', () => {
    expect(registrationStatus({ deadline: TODAY }, TODAY)?.deadline).toEqual({
      day: TODAY,
      closed: false,
    })
  })

  it('closes the day after', () => {
    expect(registrationStatus({ deadline: '2026-09-14' }, TODAY)?.deadline).toEqual({
      day: '2026-09-14',
      closed: true,
    })
  })

  /**
   * The two are independent: an outing can fill up while its deadline is still
   * days away, and the date is the thing a reader might still act on — a
   * waiting list, a cancellation — so being full does not hide it.
   */
  it('keeps the deadline on an outing that has filled up early', () => {
    expect(registrationStatus({ deadline: '2026-09-18', availability: 'full' }, TODAY)).toEqual({
      openToAll: false,
      places: 'full',
      deadline: { day: '2026-09-18', closed: false },
    })
  })

  it('reports both when a full outing has also closed', () => {
    expect(registrationStatus({ deadline: '2026-09-14', availability: 'full' }, TODAY)).toEqual({
      openToAll: false,
      places: 'full',
      deadline: { day: '2026-09-14', closed: true },
    })
  })

  it('reports a full outing with no deadline at all', () => {
    expect(registrationStatus({ availability: 'full' }, TODAY)).toEqual({
      openToAll: false,
      places: 'full',
    })
  })

  /** Places available is the ordinary case, and says nothing worth printing. */
  it('treats places available as nothing said', () => {
    expect(registrationStatus({ availability: 'open' }, TODAY)).toBeNull()
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
