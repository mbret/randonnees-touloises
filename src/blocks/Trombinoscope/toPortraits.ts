import type { Adherent, Media } from '@/payload-types'

/** What the block reads off an adhérent, and no more than that: no surname. */
export type PortraitAdherent = Pick<Adherent, 'firstName' | 'id' | 'photo' | 'publicationConsent'>

export type Portrait = { firstName: string; id: number; photo: Media }

const collator = new Intl.Collator('fr', { sensitivity: 'base' })

/**
 * The photo as the card hands it to `ImageMedia`: what drawing it takes, with
 * the first name as its alt text.
 *
 * Narrowed rather than passed whole. The document belongs to the media library
 * and carries whatever its uploader wrote — an alt of « Pascal BRET », a
 * caption — and `ImageMedia` is a client component, so every field handed to it
 * is serialised into the page. Its own `alt` prop also loses to the document's,
 * so replacing the alt here is what keeps a surname out of the markup.
 */
const portraitPhoto = (photo: Media, firstName: string): Media => ({
  alt: firstName,
  createdAt: photo.createdAt,
  height: photo.height,
  id: photo.id,
  mimeType: photo.mimeType,
  sizes: photo.sizes,
  updatedAt: photo.updatedAt,
  url: photo.url,
  width: photo.width,
})

/**
 * Who is on the trombinoscope, in the order they are read.
 *
 * Two conditions and nothing else: a portrait on the fiche, and « Portrait »
 * ticked under « Publication sur le site ». Permission without a photograph has
 * nothing to show, and a photograph without permission must not be shown. The
 * adhérent's situation is deliberately not a third: the page shows everyone who
 * agreed, and a filter on it is one line here on the day that changes.
 *
 * Alphabetical by first name, the way the previous site listed them, compared
 * the way French reads — « Édith » among the E, « jocelyne » among the J. A
 * fiche without a first name still shows its face, after everyone else. Seven
 * Bernards are told apart by nothing on the page, so the id settles their
 * order and keeps it the same from one render to the next.
 */
export const toPortraits = (adherents: PortraitAdherent[]): Portrait[] =>
  adherents
    .flatMap(({ firstName, id, photo, publicationConsent }) => {
      // An unpopulated relationship arrives as an id, a deleted file as null.
      if (!publicationConsent?.photo || !photo || typeof photo !== 'object') return []

      const name = firstName?.trim() ?? ''

      return [{ firstName: name, id, photo: portraitPhoto(photo, name) }]
    })
    .sort(
      (a, b) =>
        Number(!a.firstName) - Number(!b.firstName) ||
        collator.compare(a.firstName, b.firstName) ||
        a.id - b.id,
    )

/** The line above the grid, counted from the grid itself so the two always agree. */
export const portraitCount = (count: number) =>
  count === 1
    ? '1 portrait d’adhérente ou d’adhérent'
    : `${count} portraits d’adhérentes et d’adhérents`
