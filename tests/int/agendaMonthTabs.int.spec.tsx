import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'

import { AgendaMonthTabs } from '@/components/agenda/AgendaMonthTabs'

beforeAll(() => {
  // jsdom draws no pixels, so it ships no scrolling; in a browser the method
  // is on every element. Stubbed here rather than guarded in the component.
  Element.prototype.scrollIntoView = () => {}
})

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

const MONTHS = [
  { month: '2026-08', label: 'Août 2026', count: 2 },
  { month: '2026-09', label: 'Septembre 2026', count: 30 },
]

const renderTabs = () =>
  render(
    <AgendaMonthTabs months={MONTHS}>
      <p>les sorties d’août</p>
      <p>les sorties de septembre</p>
    </AgendaMonthTabs>,
  )

const tab = (name: RegExp) => screen.getByRole('tab', { name })

/**
 * Whether a panel's content is on show — the switch works by the `hidden`
 * attribute, so visibility is read off the nearest ancestor carrying it.
 */
const onShow = (text: string) => screen.getByText(text).closest('[hidden]') === null

describe('AgendaMonthTabs', () => {
  it('shows the first month and keeps the others in the document, merely hidden', () => {
    renderTabs()

    // `hidden` panels stay in the document — which is the design: crawlers
    // and the browser's own page search still see September.
    expect(onShow('les sorties d’août')).toBe(true)
    expect(onShow('les sorties de septembre')).toBe(false)
  })

  it('switches month on a tab, and writes it into the URL for sharing', () => {
    renderTabs()

    fireEvent.click(tab(/Septembre/))

    expect(onShow('les sorties de septembre')).toBe(true)
    expect(onShow('les sorties d’août')).toBe(false)
    expect(window.location.hash).toBe('#agenda-2026-09')
  })

  it('opens on the month a shared link points into, day anchors included', () => {
    window.history.replaceState(null, '', '/#agenda-2026-09-12')

    renderTabs()

    expect(onShow('les sorties de septembre')).toBe(true)
  })

  /** A fragment naming no month — `#agenda` itself, say — changes nothing. */
  it('stays on the default when the fragment names no month it has', () => {
    window.history.replaceState(null, '', '/#agenda')

    renderTabs()

    expect(onShow('les sorties d’août')).toBe(true)
  })

  it('walks the months with the arrow keys', () => {
    renderTabs()

    fireEvent.keyDown(tab(/Août/), { key: 'ArrowRight' })

    expect(onShow('les sorties de septembre')).toBe(true)
  })

  it('keeps the folded months searchable, not merely present', () => {
    renderTabs()

    // A boolean `hidden` is invisible to find-in-page; `until-found` is not.
    expect(document.getElementById('agenda-panel-2026-09')?.getAttribute('hidden')).toBe(
      'until-found',
    )
    expect(document.getElementById('agenda-panel-2026-08')?.getAttribute('hidden')).toBeNull()

    fireEvent.click(tab(/Septembre/))

    expect(document.getElementById('agenda-panel-2026-08')?.getAttribute('hidden')).toBe(
      'until-found',
    )
  })

  it('follows the browser to a match found behind another tab', () => {
    renderTabs()

    // Dispatched raw — `beforematch` is the browser's own event, not React's.
    act(() => {
      document.getElementById('agenda-panel-2026-09')?.dispatchEvent(new Event('beforematch'))
    })

    expect(onShow('les sorties de septembre')).toBe(true)
    expect(window.location.hash).toBe('#agenda-2026-09')
  })

  it('says the year on the tabs only when two are on them', () => {
    renderTabs()

    expect(tab(/Août/).textContent).not.toContain('2026')

    cleanup()
    render(
      <AgendaMonthTabs
        months={[
          { month: '2026-12', label: 'Décembre 2026', count: 4 },
          { month: '2027-01', label: 'Janvier 2027', count: 9 },
        ]}
      >
        <p>décembre</p>
        <p>janvier</p>
      </AgendaMonthTabs>,
    )

    expect(tab(/Décembre/).textContent).toContain('2026')
    expect(tab(/Janvier/).textContent).toContain('2027')
  })

  it('offers no tabs when there is only one month to choose from', () => {
    render(
      <AgendaMonthTabs months={[MONTHS[1]]}>
        <p>les sorties de septembre</p>
      </AgendaMonthTabs>,
    )

    expect(screen.queryByRole('tablist')).toBeNull()
    expect(onShow('les sorties de septembre')).toBe(true)
  })
})
