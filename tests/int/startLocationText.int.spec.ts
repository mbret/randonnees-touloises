import { describe, expect, it } from 'vitest'

import type { Event } from '@/payload-types'

import {
  dedupeKey,
  departureLine,
  paragraphs,
  parsePlace,
  startMapLink,
  titleCase,
} from '@/collections/Events/startLocationText'

const text = (value: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const link = (url: string) => ({
  type: 'link',
  children: [text(url)],
  fields: { linkType: 'custom', newTab: true, url },
  format: '',
  indent: 0,
  version: 3,
})

/** An event body, one argument per paragraph — a string, or a link. */
const body = (...rows: (string | { type: string })[]): Event['content'] =>
  ({
    root: {
      type: 'root',
      children: rows.map((row) => ({
        type: 'paragraph',
        children: [typeof row === 'string' ? text(row) : row],
        format: '',
        indent: 0,
        version: 1,
      })),
      format: '',
      indent: 0,
      version: 1,
    },
  }) as unknown as Event['content']

describe('how a place name is written', () => {
  it('stops the club shouting', () => {
    expect(titleCase('VILLEY LE SEC')).toBe('Villey le Sec')
    expect(titleCase('PAGNY SUR MEUSE')).toBe('Pagny sur Meuse')
  })

  it('keeps a hyphen it is given, and invents none', () => {
    expect(titleCase('SAINT-MAX')).toBe('Saint-Max')
    /* The commune really is « Villey-le-Sec »; guessing which spaces are
     * hyphens across forty places would get some of them wrong in silence. */
    expect(titleCase('VILLEY LE SEC')).not.toContain('-')
  })

  it('splits the club’s own format into the two halves stored', () => {
    expect(parsePlace('BOUCQ (terrain de foot)')).toEqual({
      commune: 'Boucq',
      spot: 'terrain de foot',
    })
  })

  it('takes a destination with nothing to add', () => {
    expect(parsePlace('LAC DU DER')).toEqual({ commune: 'Lac du Der' })
  })
})

describe('which places count as one', () => {
  /** The club's own six weeks hold both spellings of one car park. */
  it('ignores case and accents', () => {
    expect(dedupeKey('Maron', 'ancienne gare')).toBe(dedupeKey('MARON', 'Ancienne Gare'))
    expect(dedupeKey('Écrouves', 'cimetière')).toBe(dedupeKey('Ecrouves', 'cimetiere'))
  })

  /**
   * Everything else stays apart. A village can have two meeting points on
   * purpose — Villey-le-Sec's church and its mairie are sixty metres apart —
   * so near-misses are reported to a human rather than merged.
   */
  it('keeps anything else apart, article included', () => {
    expect(dedupeKey('Pagney', 'Les Acacias')).not.toBe(dedupeKey('Pagney', 'Acacias'))
    expect(dedupeKey('Chaudeney', 'salle Bouchot')).not.toBe(
      dedupeKey('Chaudeney', 'salle des Fêtes'),
    )
  })
})

describe('finding the start link in an event body', () => {
  it('reads the URL from the label’s own line', () => {
    const content = body(
      'BOUCQ (terrain de foot)',
      'Animateur : Jean-Luc',
      'Lieu de départ : https://maps.app.goo.gl/abc',
    )

    expect(departureLine(content)?.url).toBe('https://maps.app.goo.gl/abc')
    expect(startMapLink(content)).toBe('https://maps.app.goo.gl/abc')
  })

  /**
   * The shape that made the pin a coin toss. The label carries no URL, and the
   * covoiturage link sits *above* it — so « any map link in the body » picks the
   * car share, four kilometres from the hall.
   */
  it('reads the line after the label, ahead of an earlier covoiturage link', () => {
    const content = body(
      'VILLEY SAINT ETIENNE (salle Polyvalente)',
      'Covoiturage aire de Gondreville sortie du village à 13:30',
      link('https://maps.app.goo.gl/covoiturage'),
      'Lieu de départ :',
      link('https://maps.app.goo.gl/depart'),
    )

    expect(departureLine(content)?.url).toBe('https://maps.app.goo.gl/depart')
    expect(startMapLink(content)).toBe('https://maps.app.goo.gl/depart')
  })

  /** An inscription form is not a meeting point, and must not be read as one. */
  it('refuses a link that is not a map', () => {
    const content = body(
      'SAINT-MAX (Chateau)',
      'Lieu de départ : https://forms.gle/7c5QjegnhgkJ57uL8',
    )

    expect(departureLine(content)?.url).toBeUndefined()
    expect(startMapLink(content)).toBeUndefined()
  })

  it('says nothing about a body with no such line', () => {
    expect(departureLine(body('BOUCQ (terrain de foot)', 'Animateur : Jean-Luc'))).toBeUndefined()
  })

  /**
   * The index is what a later strip deletes by, so it has to point at the
   * paragraph as stored — blank ones included, or everything after one shifts.
   */
  it('points at the paragraph as stored, past a blank one', () => {
    const content = body(
      'BOUCQ (terrain de foot)',
      '',
      'Lieu de départ : https://maps.app.goo.gl/x',
    )

    expect(paragraphs(content)).toHaveLength(3)
    expect(departureLine(content)?.index).toBe(2)
  })
})
