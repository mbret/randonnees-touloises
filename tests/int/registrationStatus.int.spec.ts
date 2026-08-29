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

  /**
   * A waiting list is not a softer « complet » but a different instruction:
   * there is no place, and there is still something to do about it.
   */
  it('keeps a waiting list distinct from a plain complet', () => {
    expect(registrationStatus({ availability: 'waitlist' }, TODAY)?.places).toBe('waitlist')
    expect(registrationStatus({ availability: 'full' }, TODAY)?.places).toBe('full')
  })

  /**
   * Members-only is the club's default, so it is the outing open to everyone
   * that gets said — the reverse would put a marker on nearly every card.
   */
  it('announces an outing open to everyone, and says nothing of the rest', () => {
    expect(registrationStatus({ openToAll: true }, TODAY)).toEqual({ openToAll: true })
    expect(registrationStatus({ openToAll: false }, TODAY)).toBeNull()
  })

  /**
   * A waiting list is the one state that invites an action, and a closed
   * deadline is the club saying there is none left. Someone may still be added
   * by asking a human; nothing rendered from this should say so.
   */
  it('retires a waiting list once the deadline has gone', () => {
    expect(
      registrationStatus({ availability: 'waitlist', deadline: '2026-09-14' }, TODAY)?.places,
    ).toBeUndefined()
  })

  it('keeps the waiting list while the deadline is still to come', () => {
    expect(
      registrationStatus({ availability: 'waitlist', deadline: '2026-09-18' }, TODAY)?.places,
    ).toBe('waitlist')
  })

  /** « Complet » invites nothing, and says more about why than « closes » does. */
  it('leaves complet standing after its deadline', () => {
    expect(
      registrationStatus({ availability: 'full', deadline: '2026-09-14' }, TODAY)?.places,
    ).toBe('full')
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
