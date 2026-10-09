import { describe, expect, it } from 'vitest'

import type { Media } from '@/payload-types'

import { toPortraits, type PortraitAdherent } from '@/blocks/Trombinoscope/toPortraits'

const media = (id: number, overrides: Partial<Media> = {}): Media => ({
  alt: 'Pascal BRET, président',
  caption: {
    root: {
      type: 'root',
      children: [{ type: 'text', text: 'Pascal BRET à Écrouves', version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  createdAt: '2026-09-01T00:00:00.000Z',
  filename: `portrait-${id}.jpg`,
  focalX: 50,
  focalY: 50,
  height: 581,
  id,
  mimeType: 'image/jpeg',
  sizes: {
    thumbnail: { mimeType: 'image/webp', url: `/media/portrait-${id}-300.webp`, width: 300 },
  },
  updatedAt: '2026-09-02T00:00:00.000Z',
  url: `/media/portrait-${id}.jpg`,
  width: 581,
  ...overrides,
})

let nextId = 1

const adherent = (overrides: Partial<PortraitAdherent> = {}): PortraitAdherent => {
  const id = nextId++

  return {
    firstName: 'Pascal',
    id,
    photo: media(100 + id),
    publicationConsent: { email: false, phone: false, photo: true },
    ...overrides,
  }
}

const firstNames = (adherents: PortraitAdherent[]) => toPortraits(adherents).map((p) => p.firstName)

describe('who is on the trombinoscope', () => {
  it('shows an adhérent with a portrait and permission to publish it', () => {
    expect(toPortraits([adherent()])).toHaveLength(1)
  })

  /** The permission is the whole point: a portrait on file is not consent. */
  it('leaves out a portrait whose publication was not agreed to', () => {
    const declined = adherent({ publicationConsent: { email: false, phone: false, photo: false } })

    expect(toPortraits([declined])).toEqual([])
    expect(toPortraits([adherent({ publicationConsent: undefined })])).toEqual([])
  })

  /** Nothing to show is not a card of initials: the page is faces. */
  it('leaves out someone who agreed but has no portrait', () => {
    expect(toPortraits([adherent({ photo: null })])).toEqual([])
  })

  /** Neither permission stands in for the other. */
  it('is not swayed by the telephone or e-mail permissions', () => {
    const others = adherent({ publicationConsent: { email: true, phone: true, photo: false } })

    expect(toPortraits([others])).toEqual([])
  })

  /**
   * An unpopulated relationship arrives as an id. Rendering that would put a
   * number where the portrait goes, so it counts as no portrait.
   */
  it('ignores a portrait that came back as an id rather than a document', () => {
    expect(toPortraits([adherent({ photo: 7 })])).toEqual([])
  })
})

describe('what a card shows', () => {
  it('is the first name, trimmed, and the portrait', () => {
    const source = media(41)
    const [portrait] = toPortraits([adherent({ firstName: '  Brigitte ', photo: source })])

    expect(portrait.firstName).toBe('Brigitte')
    expect(portrait.photo.id).toBe(source.id)
    expect(portrait.photo.url).toBe(source.url)
  })

  /**
   * The library's own alt text is whatever the uploader wrote, a surname
   * included, and `ImageMedia` prefers it to any `alt` prop — so the first name
   * has to replace it on the document itself.
   */
  it('gives the image the first name as its alt text, not the library’s', () => {
    const [portrait] = toPortraits([adherent({ firstName: 'Pascal' })])

    expect(portrait.photo.alt).toBe('Pascal')
  })

  /** Everything handed to the client component lands in the page. */
  it('hands the image over without the caption or anything else it does not draw', () => {
    const [{ photo }] = toPortraits([adherent()])

    expect(photo).not.toHaveProperty('caption')
    expect(photo).not.toHaveProperty('filename')
    expect(photo).not.toHaveProperty('focalX')
    expect(JSON.stringify(photo)).not.toContain('BRET')
  })

  it('keeps what drawing the image takes', () => {
    const source = media(42)
    const [{ photo }] = toPortraits([adherent({ photo: source })])

    expect(photo).toMatchObject({
      height: source.height,
      id: source.id,
      mimeType: source.mimeType,
      sizes: source.sizes,
      updatedAt: source.updatedAt,
      url: source.url,
      width: source.width,
    })
  })
})

describe('the order', () => {
  it('is alphabetical by first name', () => {
    expect(
      firstNames([
        adherent({ firstName: 'Yves' }),
        adherent({ firstName: 'Alain' }),
        adherent({ firstName: 'Monique' }),
      ]),
    ).toEqual(['Alain', 'Monique', 'Yves'])
  })

  /** As French reads: an accent or a lowercase initial does not exile a name. */
  it('files accented and lowercase names among their letter', () => {
    expect(
      firstNames([
        adherent({ firstName: 'Evelyne' }),
        adherent({ firstName: 'Édith' }),
        adherent({ firstName: 'Doudou' }),
        adherent({ firstName: 'Joël' }),
        adherent({ firstName: 'jocelyne' }),
        adherent({ firstName: 'Zoé' }),
      ]),
    ).toEqual(['Doudou', 'Édith', 'Evelyne', 'jocelyne', 'Joël', 'Zoé'])
  })

  /** Seven Bernards: the same arrangement on every render. */
  it('settles a shared first name by the order the fiches were created in', () => {
    const later = adherent({ firstName: 'Bernard' })
    const earlier = { ...adherent({ firstName: 'Bernard' }), id: later.id - 100 }

    expect(toPortraits([later, earlier]).map((p) => p.id)).toEqual([earlier.id, later.id])
  })

  it('puts a fiche without a first name after everyone, face still shown', () => {
    expect(firstNames([adherent({ firstName: null }), adherent({ firstName: 'Alain' })])).toEqual([
      'Alain',
      '',
    ])
  })
})
