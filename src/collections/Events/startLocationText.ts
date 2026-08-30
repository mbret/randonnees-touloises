import type { Event } from '@/payload-types'

/**
 * Reading the meeting point out of the prose the club has always written it in.
 *
 * The club's agenda format, unchanged for years:
 *
 *     BOUCQ (terrain de foot)
 *     Animateur : Jean-Luc
 *     km : 10,0 · D+ : 125 m
 *     Lieu de départ : https://maps.app.goo.gl/…
 *
 * Two scripts need to agree exactly about what that means: the one that reads it
 * into `startLocation`, and the one that later removes the lines it read. If
 * they disagreed, the second would either strip a line the first never
 * understood or leave one behind — so they share this, rather than each carrying
 * its own copy of the same four regexes.
 *
 * In `src` rather than in `scripts` because it is testable there, and because a
 * « coller un lien » field in the admin will want the same parsing.
 */

/** Words a French place name keeps in lower case once it is not the first. */
const PARTICLES = new Set(['aux', 'de', 'des', 'du', 'en', 'et', 'la', 'le', 'les', 'sous', 'sur'])

const capitalise = (word: string) =>
  word
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-')

/**
 * « VILLEY LE SEC » → « Villey le Sec ».
 *
 * The club types communes in capitals, which is a shout on a web page rather
 * than a name. Hyphens are not invented on the way — the commune really is
 * « Villey-le-Sec » — because guessing which spaces are hyphens across forty
 * places would get some of them wrong silently, and they are one edit each now
 * that there is one row per place instead of one line per event.
 */
export const titleCase = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && PARTICLES.has(word.toLowerCase()) ? word.toLowerCase() : capitalise(word),
    )
    .join(' ')

/**
 * Case- and accent-blind, so two spellings of one car park land on one row —
 * the club's own six weeks hold « MARON (ancienne gare) » and « (ancienne
 * Gare) ». Only an exact match after normalising counts: « Les Acacias » and
 * « Acacias » stay apart, because a village really can have two meeting points
 * and collapsing them would lose a distinction drawn on purpose.
 */
export const dedupeKey = (commune: string, spot?: null | string): string =>
  [commune, spot ?? '']
    .map((value) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .join('|')

type LexicalNode = {
  children?: LexicalNode[]
  fields?: { url?: string }
  root?: LexicalNode
  text?: string
  type?: string
}

const nodeText = (node: LexicalNode): string =>
  typeof node.text === 'string' ? node.text : (node.children ?? []).map(nodeText).join('')

/**
 * Every top-level paragraph, keeping its position in the body.
 *
 * The position is what lets a line be removed later; the text is what lets it be
 * recognised. Empty paragraphs are kept here — dropping them would shift every
 * index after them — and skipped by `lines`.
 */
export const paragraphs = (content: Event['content']): { index: number; text: string }[] =>
  ((content as LexicalNode | null | undefined)?.root?.children ?? []).map((paragraph, index) => ({
    index,
    text: nodeText(paragraph).replace(/\s+/g, ' ').trim(),
  }))

/** The body as the lines a reader sees, blank ones dropped. */
export const lines = (content: Event['content']): string[] =>
  paragraphs(content)
    .map(({ text }) => text)
    .filter(Boolean)

/** Any link target in the body, since the importer made the URLs real links. */
export const linkUrls = (content: Event['content']): string[] => {
  const found: string[] = []

  const walk = (node: LexicalNode) => {
    if (node.type === 'link' && node.fields?.url) found.push(node.fields.url)
    if (node.root) walk(node.root)
    ;(node.children ?? []).forEach(walk)
  }

  walk((content ?? {}) as LexicalNode)

  return found
}

/**
 * Whether a URL is a map at all.
 *
 * Events carry other links — an inscription form, the animateur's write-up —
 * and taking the first one on the page put a Google Form in the « no pin »
 * column and would have put it in the location had it parsed.
 */
export const isMapLink = (url: string): boolean =>
  /maps\.|maps\/|goo\.gl|osm\.org|openstreetmap|^geo:/i.test(url)

/** « BOUCQ (terrain de foot) » → the two halves the collection stores. */
export const parsePlace = (line: string): null | { commune: string; spot?: string } => {
  const match = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(line.trim())

  if (match) {
    const commune = titleCase(match[1])
    const spot = match[2].trim()

    return commune ? { commune, ...(spot ? { spot } : {}) } : null
  }

  const commune = titleCase(line)

  return commune ? { commune } : null
}

/** Where the « Lieu de départ » label sits, and where its URL turned out to be. */
export type DepartureLine = {
  /** The paragraph holding the label. */
  index: number
  /** The paragraph holding the URL — the label's own, or the one after it. */
  urlIndex?: number
  /** The map URL, when there is one. A form or a write-up does not count. */
  url?: string
}

/**
 * The « Lieu de départ » line, and the map URL belonging to it.
 *
 * Two layouts, both real in the club's data. Usually the URL sits on the label's
 * own line; but an event may end « Lieu de départ : » with the link on the next
 * paragraph, and that same event may carry a *second* map link further up for
 * the covoiturage point. Reading only the label's line there falls through to
 * « any map link », which is a coin toss between the start and the car share.
 *
 * A URL that is not a map — the interclubs day's inscription form — is reported
 * as no URL, so nothing downstream treats it as a pin or removes the line
 * carrying it.
 */
export const departureLine = (content: Event['content']): DepartureLine | undefined => {
  const body = paragraphs(content).filter(({ text }) => text)
  const at = body.findIndex(({ text }) => /lieu de d[ée]part/i.test(text))

  if (at < 0) return undefined

  const label = body[at]
  const onTheLine = label.text.match(/https?:\/\/\S+/)?.[0]

  if (onTheLine) {
    return isMapLink(onTheLine)
      ? { index: label.index, url: onTheLine, urlIndex: label.index }
      : { index: label.index }
  }

  const next = body[at + 1]
  const onTheNext = next?.text.match(/^https?:\/\/\S+$/)?.[0]

  return onTheNext && isMapLink(onTheNext)
    ? { index: label.index, url: onTheNext, urlIndex: next.index }
    : { index: label.index }
}

/** The map link an event's start location should come from, if it has one. */
export const startMapLink = (content: Event['content']): string | undefined =>
  departureLine(content)?.url ?? linkUrls(content).find(isMapLink)
