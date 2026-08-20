import { describe, it, expect, beforeAll } from 'vitest'

import type { Post } from '@/payload-types'

import { beforeSyncWithSearch } from '@/search/beforeSync'
import { fillMeta, summarise } from '@/collections/Posts/hooks/fillMeta'
import { generateMeta } from '@/seo/generateMeta'
import { programEventJsonLd } from '@/seo/jsonld/event'
import { publicDescription, redactContacts } from '@/seo/publicText'

// The builders read the server URL at call time, so pin it before anything asks
// for an absolute URL.
beforeAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = 'https://abonnes.randonnees-touloises.net'
})

// Every number here is made up. The point of the guard is that the club's real
// ones stay out of anything published, and a test fixture is published too.
const PHONE = '06 12 34 56 78'

const text = (value: string) => ({ type: 'text', text: value, version: 1 })

const link = (value: string, url: string) => ({
  type: 'link',
  children: [text(value)],
  fields: { linkType: 'custom', newTab: true, url },
  version: 3,
})

const paragraph = (...children: unknown[]) => ({ type: 'paragraph', children, version: 1 })

/** A media block, as the importer and the editor both write one. */
const mediaBlock = () => ({
  type: 'block',
  fields: { blockName: '', blockType: 'mediaBlock', id: 'a', media: 1 },
  version: 2,
})

/** A banner block, which holds prose of its own inside its fields. */
const banner = (value: string) => ({
  type: 'block',
  fields: {
    blockName: '',
    blockType: 'banner',
    id: 'b',
    content: { root: { type: 'root', children: [paragraph(text(value))], version: 1 } },
  },
  version: 2,
})

const body = (...children: unknown[]) =>
  ({ root: { type: 'root', children, version: 1 } }) as unknown as Post['content']

/** A post part-way through being written, as a hook sees it. */
type PostDraft = Partial<Omit<Post, 'meta'>> & { meta?: Partial<NonNullable<Post['meta']>> }

const runFillMeta = (data: PostDraft, originalDoc?: PostDraft) => {
  const result = fillMeta({ data, originalDoc, operation: 'create' } as unknown as Parameters<
    typeof fillMeta
  >[0])

  return (result as Partial<Post>).meta
}

describe('redactContacts', () => {
  it('takes out a phone number however it is spaced', () => {
    for (const phone of ['06 12 34 56 78', '06.12.34.56.78', '06-12-34-56-78', '0612345678']) {
      expect(redactContacts(`Renseignements : Pascal ${phone}`)).toBe('Renseignements : Pascal')
    }
  })

  it('takes out a number written for someone calling from abroad', () => {
    expect(redactContacts('Contact +33 6 12 34 56 78 pour le covoiturage')).toBe(
      'Contact pour le covoiturage',
    )
    expect(redactContacts('Contact +33 (0)6 12 34 56 78')).toBe('Contact')
  })

  it('takes out an email address', () => {
    expect(redactContacts('Écrire à contact.club@example.org avant jeudi')).toBe(
      'Écrire à avant jeudi',
    )
  })

  it('takes out a number the truncation cut in two', () => {
    expect(redactContacts('Renseignements : Pascal 06 12 34 5…')).toBe('Renseignements : Pascal')
  })

  it('leaves alone the numbers a programme entry is made of', () => {
    for (const kept of [
      'Rendez-vous le 01.02.2026 à 9h30',
      'Départ le 12/09/2026, retour le 14/09/2026',
      'Nombre de places : 10',
      '18 km pour 450 m de dénivelé, tarif 15 €',
    ]) {
      expect(redactContacts(kept)).toBe(kept)
    }
  })

  it('collapses the whitespace a body arrives with', () => {
    expect(redactContacts('Une  sortie\nau bord de l’eau')).toBe('Une sortie au bord de l’eau')
  })
})

describe('summarise', () => {
  it('describes a programme entry without its contact block or its buttons', () => {
    const description = summarise(
      body(
        paragraph(text(`Renseignements : Pascal ${PHONE}`)),
        paragraph(text('Nombre de places : 10')),
        paragraph(link('Je m’inscris', 'https://forms.gle/example')),
        mediaBlock(),
        paragraph(text('C’est une marche consciente de Kundalini Yoga.')),
      ),
    )

    expect(description).toBe(
      'Renseignements : Pascal Nombre de places : 10 C’est une marche consciente de Kundalini Yoga.',
    )
  })

  it('keeps a link that is part of a sentence', () => {
    const description = summarise(
      body(paragraph(text('Voir le'), link('programme', 'https://example.org'), text('complet.'))),
    )

    expect(description).toBe('Voir le programme complet.')
  })

  it('says nothing for a body that is only a registration link and a poster', () => {
    expect(
      summarise(body(paragraph(link('Je m’inscris', 'https://forms.gle/x')), mediaBlock())),
    ).toBe('')
  })

  it('leaves a block to speak for itself rather than for the post', () => {
    expect(
      summarise(body(banner('Attention, sortie annulée'), paragraph(text('Une sortie.')))),
    ).toBe('Une sortie.')
  })

  it('cuts to what a search engine shows', () => {
    const description = summarise(body(paragraph(text('Une marche au bord de l’eau. '.repeat(20)))))

    expect(description.length).toBeLessThanOrEqual(155)
    expect(description.endsWith('…')).toBe(true)
  })
})

describe('fillMeta', () => {
  it('derives a description the post can be published with', () => {
    const meta = runFillMeta({
      title: 'Marche Breathwalk',
      content: body(paragraph(text(`Renseignements : Pascal ${PHONE}`))),
    })

    expect(meta?.title).toBe('Marche Breathwalk')
    expect(meta?.description).toBe('Renseignements : Pascal')
  })

  it('scrubs a description written by hand as well as one it derives', () => {
    const meta = runFillMeta({
      title: 'Marche Breathwalk',
      content: body(paragraph(text('Une marche consciente.'))),
      meta: { description: `Inscriptions auprès de Pascal au ${PHONE}` },
    })

    expect(meta?.description).toBe('Inscriptions auprès de Pascal au')
  })

  it('describes a password-gated post with its title alone', () => {
    const meta = runFillMeta({
      title: 'Séjour dans les Vosges',
      content: body(paragraph(text('Le code du dossier est vosges2026.'))),
      requireContentPassword: true,
    })

    expect(meta?.description).toBe('Séjour dans les Vosges')
  })

  it('reads the gate off the stored post when the write does not carry it', () => {
    const meta = runFillMeta(
      { content: body(paragraph(text('Le code du dossier est vosges2026.'))) },
      { title: 'Séjour dans les Vosges', requireContentPassword: true },
    )

    expect(meta?.description).toBe('Séjour dans les Vosges')
  })

  it('falls back to the title when the body has no prose to summarise', () => {
    const meta = runFillMeta({
      title: 'Journée interclubs du 19 septembre 2026',
      content: body(paragraph(link('Je m’inscris', 'https://forms.gle/x')), mediaBlock()),
    })

    expect(meta?.description).toBe('Journée interclubs du 19 septembre 2026')
  })

  it('falls back to the body when a hand-written description was only a number', () => {
    const meta = runFillMeta({
      title: 'Marche Breathwalk',
      content: body(paragraph(text('Une marche consciente.'))),
      meta: { description: PHONE },
    })

    expect(meta?.description).toBe('Une marche consciente.')
  })

  it('falls back to the title when nothing else is left to say', () => {
    const meta = runFillMeta({
      title: 'Marche Breathwalk',
      content: body(paragraph(text(PHONE))),
      meta: { description: PHONE },
    })

    expect(meta?.description).toBe('Marche Breathwalk')
  })

  it('leaves a description an editor is happy with alone', () => {
    const meta = runFillMeta({
      title: 'Marche Breathwalk',
      content: body(paragraph(text('Une marche consciente.'))),
      meta: { description: 'Une marche silencieuse au bord des étangs.' },
    })

    expect(meta?.description).toBe('Une marche silencieuse au bord des étangs.')
  })
})

// A row written before the guard existed keeps its contact details in the
// database until someone rewrites it, so every reader has to be able to hold the
// line on its own.
describe('a description already stored with a phone number in it', () => {
  const meta = { title: 'Marche Breathwalk', description: `Renseignements : Pascal ${PHONE}` }

  it('is cleaned before it is read', () => {
    expect(publicDescription(meta)).toBe('Renseignements : Pascal')
  })

  it('does not reach the meta tag or the OpenGraph description', async () => {
    const metadata = await generateMeta({
      collection: 'posts',
      doc: { slug: 'marche-breathwalk', meta },
    })

    expect(metadata.description).toBe('Renseignements : Pascal')
    expect(metadata.openGraph?.description).toBe('Renseignements : Pascal')
  })

  it('does not reach the structured data', () => {
    const event = programEventJsonLd({
      title: 'Marche Breathwalk',
      slug: 'marche-breathwalk',
      schedule: { startDate: '2026-09-18T00:00:00.000Z' },
      meta,
    } as Post)

    expect(event?.description).toBe('Renseignements : Pascal')
  })

  it('does not reach the search index', async () => {
    const synced = await beforeSyncWithSearch({
      originalDoc: { title: 'Marche Breathwalk', slug: 'marche-breathwalk', meta },
      searchDoc: {},
    } as unknown as Parameters<typeof beforeSyncWithSearch>[0])

    expect(synced.meta.description).toBe('Renseignements : Pascal')
  })
})
