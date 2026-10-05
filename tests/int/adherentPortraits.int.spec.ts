import { describe, expect, it } from 'vitest'

import {
  planFolder,
  planPortraits,
  type PortraitUpload,
  type RosterAdherent,
} from '@/collections/Adherents/portraits'

let nextId = 1

const fiche = (
  firstName: null | string,
  lastName: string,
  overrides: Partial<RosterAdherent> = {},
): RosterAdherent => ({
  firstName,
  id: nextId++,
  lastName,
  photo: null,
  publicationConsent: { email: false, phone: false, photo: false },
  ...overrides,
})

const upload = (filename: string, alt: string): PortraitUpload => ({
  alt,
  filename,
  id: 1000 + nextId++,
})

/** Who gets what, as « NOM Prénom » ← filename. */
const given = (adherents: RosterAdherent[], uploads: PortraitUpload[]) =>
  planPortraits({ adherents, uploads }).attach.map(({ filename, name }) => `${name} ← ${filename}`)

describe('a portrait captioned with a full name', () => {
  it('goes to the one fiche of that name', () => {
    expect(
      given(
        [fiche('Bernard', 'ATTENOT')],
        [upload('animation-bernard-attenot.jpg', 'Bernard ATTENOT')],
      ),
    ).toEqual(['ATTENOT Bernard ← animation-bernard-attenot.jpg'])
  })

  /** The old site and the federation do not always write a name the same way. */
  it('matches across accents, case and hyphens', () => {
    expect(
      given(
        [fiche('Jean Luc', 'STEPHAN'), fiche('Roger', 'FRANCOIS')],
        [
          upload('animation-jean-luc-stephan.jpg', 'Jean-luc STEPHAN'),
          upload('animation-roger-francois.jpg', 'Roger FRANÇOIS'),
        ],
      ),
    ).toEqual([
      'FRANCOIS Roger ← animation-roger-francois.jpg',
      'STEPHAN Jean Luc ← animation-jean-luc-stephan.jpg',
    ])
  })

  /** The choice already made by hand for the seven who have both. */
  it('prefers the animation portrait to the conseil one', () => {
    expect(
      given(
        [fiche('Pascal', 'BRET')],
        [
          upload('conseil-pascal-bret.png', 'Pascal BRET'),
          upload('animation-pascal-bret.jpg', 'Pascal BRET'),
        ],
      ),
    ).toEqual(['BRET Pascal ← animation-pascal-bret.jpg'])
  })

  it('goes nowhere when two fiches share the name', () => {
    const plan = planPortraits({
      adherents: [fiche('Daniel', 'ROCHEFOLLE'), fiche('Daniel', 'ROCHEFOLLE')],
      uploads: [upload('conseil-daniel-rochefolle.png', 'Daniel ROCHEFOLLE')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.shared).toEqual([
      {
        adherents: ['ROCHEFOLLE Daniel', 'ROCHEFOLLE Daniel'],
        fiches: 2,
        name: 'Daniel ROCHEFOLLE',
        portraits: ['conseil-daniel-rochefolle.png'],
      },
    ])
  })

  it('is reported when no fiche carries the name', () => {
    const plan = planPortraits({
      adherents: [fiche('Danielle', 'GARNIER')],
      uploads: [upload('animation-dany-garnier.jpg', 'Dany GARNIER')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.unmatched).toEqual(['Dany GARNIER'])
  })

  /** Ticked already, so the person asked for exactly this face. */
  it('is written even where « Portrait » is ticked, and says so', () => {
    const plan = planPortraits({
      adherents: [
        fiche('Gérald', 'SABOT', {
          publicationConsent: { email: false, phone: false, photo: true },
        }),
      ],
      uploads: [upload('animation-gerald-sabot.jpg', 'Gérald SABOT')],
    })

    expect(plan.attach).toMatchObject([{ consented: true, matchedOn: 'fullName' }])
  })
})

describe('a trombinoscope portrait, captioned with a first name', () => {
  it('goes to a fiche when one portrait and one fiche carry that first name', () => {
    expect(
      given(
        [fiche('Yves', 'MARCHAL'), fiche('Monique', 'LEBLANC')],
        [upload('trombinoscope-yves-66a9139b5e818.jpg', 'Yves')],
      ),
    ).toEqual(['MARCHAL Yves ← trombinoscope-yves-66a9139b5e818.jpg'])
  })

  it('says it was matched on the first name only', () => {
    const plan = planPortraits({
      adherents: [fiche('Yves', 'MARCHAL')],
      uploads: [upload('trombinoscope-yves-66a9139b5e818.jpg', 'Yves')],
    })

    expect(plan.attach).toMatchObject([{ consented: false, matchedOn: 'firstName' }])
  })

  it('goes nowhere when several portraits share the first name', () => {
    const plan = planPortraits({
      adherents: [fiche('Véronique', 'ADAM')],
      uploads: [
        upload('trombinoscope-veronique-5b1bfc268eaec.jpg', 'Véronique'),
        upload('trombinoscope-veronique-66a7d88cb364b.jpg', 'Veronique'),
      ],
    })

    expect(plan.attach).toEqual([])
    expect(plan.shared).toMatchObject([
      { adherents: ['ADAM Véronique'], fiches: 1, name: 'Véronique' },
    ])
    expect(plan.shared[0].portraits).toHaveLength(2)
  })

  it('goes nowhere when several fiches share the first name', () => {
    const plan = planPortraits({
      adherents: [fiche('Bernard', 'ATTENOT'), fiche('Bernard', 'TUAILLON')],
      uploads: [upload('trombinoscope-bernard-5b1bfc268eaec.jpg', 'Bernard')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.shared).toMatchObject([
      { adherents: ['ATTENOT Bernard', 'TUAILLON Bernard'], fiches: 2 },
    ])
  })

  /**
   * The one other Pierre already has a face, and this portrait may well be of
   * him — so it is no more this Pierre's than his.
   */
  it('counts the fiches that already have a portrait among those it could be', () => {
    const plan = planPortraits({
      adherents: [fiche('Pierre', 'REVEST', { photo: 501 }), fiche('Pierre', 'LAURENT')],
      uploads: [upload('trombinoscope-pierre-5b1bfc268eaec.jpg', 'Pierre')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.shared).toMatchObject([{ adherents: ['LAURENT Pierre'], fiches: 2 }])
  })

  /** Michèle and Michelle are two names, not two spellings of one. */
  it('keeps names apart that differ by more than an accent', () => {
    expect(
      given(
        [fiche('Michelle', 'ROY'), fiche('Michèle', 'PIERRON')],
        [
          upload('trombinoscope-michelle-5b1bfc268eaec.jpg', 'Michelle'),
          upload('trombinoscope-michele-5b1bfc268eaed.jpg', 'Michèle'),
        ],
      ),
    ).toEqual([
      'PIERRON Michèle ← trombinoscope-michele-5b1bfc268eaed.jpg',
      'ROY Michelle ← trombinoscope-michelle-5b1bfc268eaec.jpg',
    ])
  })

  it('does not stand in for a full-name portrait given in the same run', () => {
    expect(
      given(
        [fiche('Francis', 'SPECTE')],
        [
          upload('trombinoscope-francis-5b1bfc268eaec.jpg', 'Francis'),
          upload('animation-francis-specte.jpg', 'Francis SPECTE'),
        ],
      ),
    ).toEqual(['SPECTE Francis ← animation-francis-specte.jpg'])
  })

  /**
   * A guess, on a fiche that would publish it as soon as the page is rendered.
   * Left for someone to look at rather than written.
   */
  it('is not written onto a fiche whose « Portrait » is already ticked', () => {
    const plan = planPortraits({
      adherents: [
        fiche('Thierry', 'GERARD', {
          publicationConsent: { email: false, phone: false, photo: true },
        }),
      ],
      uploads: [upload('trombinoscope-thierry-5e1d99d73701c.jpg', 'Thierry')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.toConfirm).toEqual([
      { filename: 'trombinoscope-thierry-5e1d99d73701c.jpg', name: 'GERARD Thierry' },
    ])
  })

  /** A nickname, or someone who has left the club. */
  it('is reported when no fiche carries the first name', () => {
    const plan = planPortraits({
      adherents: [fiche('Abdellatif', 'OUELDENNAOUA')],
      uploads: [upload('trombinoscope-latif-5b1bfc268eaec.jpg', 'Latif')],
    })

    expect(plan.unmatched).toEqual(['Latif'])
  })
})

describe('what it leaves alone', () => {
  it('a portrait a fiche already has', () => {
    const plan = planPortraits({
      adherents: [fiche('Alain', 'GAUDE', { photo: 12 })],
      uploads: [
        upload('conseil-alain-gaude.png', 'Alain GAUDE'),
        upload('trombinoscope-alain-5b1bfc268eaec.jpg', 'Alain'),
      ],
    })

    expect(plan.attach).toEqual([])
    expect(plan.shared).toEqual([])
  })

  it('a portrait already on another fiche', () => {
    const onYves = upload('trombinoscope-yves-66a9139b5e818.jpg', 'Yves')

    expect(
      given([fiche('Yves', 'MARCHAL'), fiche('Paul', 'NOEL', { photo: onYves.id })], [onYves]),
    ).toEqual([])
  })

  /** A depth-1 read hands the photo over populated rather than as an id. */
  it('a fiche whose portrait came back populated', () => {
    const plan = planPortraits({
      adherents: [
        fiche('Alain', 'GAUDE', {
          photo: { createdAt: '', id: 12, updatedAt: '' },
        }),
      ],
      uploads: [upload('conseil-alain-gaude.png', 'Alain GAUDE')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.alreadyPortrayed).toBe(1)
  })

  /** Only the two sets known to be portraits are read. */
  it('an upload outside the portrait sets, whatever its alt says', () => {
    expect(
      given([fiche('Marie', 'COLIN')], [upload('sortie-lac-du-der-2026.png', 'Marie')]),
    ).toEqual([])
  })

  it('a name whose every fiche already has a face, out of the report', () => {
    const plan = planPortraits({
      adherents: [
        fiche('Daniel', 'BERTEAUX', { photo: 3 }),
        fiche('Daniel', 'DETHOREY', { photo: 4 }),
      ],
      uploads: [
        upload('trombinoscope-daniel-5b1bfc268eaec.jpg', 'Daniel'),
        upload('trombinoscope-daniel-2-5b1bfc268eaed.jpg', 'Daniel'),
      ],
    })

    expect(plan.shared).toEqual([])
  })
})

describe('the counts', () => {
  it('says how many fiches had a portrait, and how many are left without one', () => {
    const plan = planPortraits({
      adherents: [
        fiche('Alain', 'GAUDE', { photo: 12 }),
        fiche('Yves', 'MARCHAL'),
        fiche('Monique', 'LEBLANC'),
      ],
      uploads: [upload('trombinoscope-yves-66a9139b5e818.jpg', 'Yves')],
    })

    expect(plan.alreadyPortrayed).toBe(1)
    expect(plan.attach).toHaveLength(1)
    expect(plan.stillWithout).toBe(1)
  })
})

describe('a folder of photos named with full names', () => {
  const photo = (file: string) => ({ file, name: file.replace(/\s*\d*\.\w+$/, '') })

  /** Who gets which file, as « NOM Prénom » ← file. */
  const placed = (adherents: RosterAdherent[], files: string[]) =>
    planFolder({ adherents, photos: files.map(photo) }).attach.map(
      ({ file, name }) => `${name} ← ${file}`,
    )

  it('puts each photo on the one fiche of that name, accents and case aside', () => {
    expect(
      placed(
        [fiche('Françoise', 'MARCHAND'), fiche('Daniel', 'MARCHAND')],
        ['Francoise Marchand.jpg'],
      ),
    ).toEqual(['MARCHAND Françoise ← Francoise Marchand.jpg'])
  })

  /** What the public upload is captioned with: no surname. */
  it('captions the upload with the first name only', () => {
    const plan = planFolder({
      adherents: [fiche('Anne-Marie', 'LORRAIN')],
      photos: [photo('Anne-Marie Lorrain.jpg')],
    })

    expect(plan.attach[0].firstName).toBe('Anne-Marie')
  })

  /** The group is written whole, so the other two boxes must survive it. */
  it('ticks « Portrait » and keeps the telephone and e-mail consents as they were', () => {
    const plan = planFolder({
      adherents: [
        fiche('Annick', 'BAUDOIN', {
          publicationConsent: { email: false, phone: true, photo: false },
        }),
      ],
      photos: [photo('Annick Baudoin.jpg')],
    })

    expect(plan.attach[0].publicationConsent).toEqual({ email: false, phone: true, photo: true })
  })

  it('leaves a fiche that already has a photo and « Portrait » as it is', () => {
    const plan = planFolder({
      adherents: [
        fiche('Pascal', 'BRET', {
          photo: 7,
          publicationConsent: { email: false, phone: false, photo: true },
        }),
      ],
      photos: [photo('Pascal Bret.jpg')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.alreadyShown).toBe(1)
  })

  /** Ticking would publish whatever is there, guess or not, unseen. */
  it('leaves a fiche with a photo but no « Portrait » for someone to look at', () => {
    const plan = planFolder({
      adherents: [fiche('Marie-Hélène', 'DUVAL', { photo: 88 })],
      photos: [photo('Marie-Hélène Duval.jpg')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.photographed).toEqual(['DUVAL Marie-Hélène'])
  })

  it('reports a file no fiche is named for, and a name two fiches share', () => {
    const plan = planFolder({
      adherents: [fiche('Daniel', 'ROCHEFOLLE'), fiche('Daniel', 'ROCHEFOLLE')],
      photos: [photo('Brigite Vasseur.jpg'), photo('Daniel Rochefolle.jpg')],
    })

    expect(plan.attach).toEqual([])
    expect(plan.unmatched).toEqual(['Brigite Vasseur.jpg'])
    expect(plan.homonyms).toEqual(['Daniel Rochefolle'])
  })

  it('does not go by a first name', () => {
    expect(placed([fiche('Yves', 'MARCHAL')], ['Yves.jpg'])).toEqual([])
  })

  /** « Lucien Bernier.jpg » and « Lucien Bernier 1.jpg » are one person. */
  it('gives a fiche one photo when the folder has two of that person', () => {
    expect(
      placed([fiche('Lucien', 'BERNIER')], ['Lucien Bernier 1.jpg', 'Lucien Bernier.jpg']),
    ).toEqual(['BERNIER Lucien ← Lucien Bernier 1.jpg'])
  })

  /** It puts its photos on the fiches itself; the names-only match never sees them. */
  it('is not matched again by the portraits plan', () => {
    expect(
      given(
        [fiche('Bernard', 'ATTENOT')],
        [upload('portrait-bernard-3f9a2b7c1d0e.jpg', 'Bernard')],
      ),
    ).toEqual([])
  })
})
