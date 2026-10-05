import type { Adherent, Media } from '@/payload-types'

import { adherentName } from './adherentName'

/** What the plan reads off an adhérent. */
export type RosterAdherent = Pick<
  Adherent,
  'firstName' | 'id' | 'lastName' | 'photo' | 'publicationConsent'
>

/** What the plan reads off an upload. */
export type PortraitUpload = Pick<Media, 'alt' | 'filename' | 'id'>

export type PortraitAttachment = {
  adherent: number
  /**
   * « Portrait » is already ticked on the fiche, so the page shows this the
   * next time it is rendered. Only ever true for a full-name match: a guess on
   * a first name is not written onto a fiche that would publish it.
   */
  consented: boolean
  filename: string
  matchedOn: 'firstName' | 'fullName'
  media: number
  name: string
}

/**
 * A name carried by several portraits or several fiches: which face is whose
 * is for someone who knows them. `adherents` is only the fiches still without
 * a portrait, since those are the ones to open; `fiches` counts every fiche of
 * that name, because a portrait may well be of one that already has a face.
 */
export type SharedName = {
  adherents: string[]
  fiches: number
  name: string
  portraits: string[]
}

export type PortraitPlan = {
  /** Fiches that had a portrait before this plan, which it leaves alone. */
  alreadyPortrayed: number
  attach: PortraitAttachment[]
  shared: SharedName[]
  /** Fiches after this plan with no portrait. */
  stillWithout: number
  /**
   * A first name that only one portrait and one fiche carry, on a fiche whose
   * « Portrait » is already ticked. Probably right, but the one place where
   * being wrong would put a stranger's face on the site, so it is not written.
   */
  toConfirm: { filename: string; name: string }[]
  /**
   * Names on a portrait that no fiche carries: a nickname (« Latif »), a
   * spelling the federation does not share, or someone who has left the club.
   */
  unmatched: string[]
}

/**
 * The uploads known to be portraits, by the prefix their importer gave them.
 *
 * `import-team-photos.ts` captioned the conseil and the équipe d'animation
 * with the full name — « Pascal BRET » — which identifies a person. The old
 * trombinoscope only ever printed a first name, which is all
 * `import-trombinoscope.ts` had to put in the alt.
 *
 * Nothing else in the library is considered, whatever its alt says: what those
 * two scripts imported is known to be portraits, and an alt reading « Marie »
 * on anything else is not evidence of whose face it is. That includes the
 * uploads of `import-portrait-folder.ts`, which puts each one on its fiche
 * itself.
 *
 * The full-name prefixes are in order of preference. Seven people have both a
 * conseil and an animation portrait, and the conseil's fiches, filled in by
 * hand, carry the animation one for all seven.
 */
const FULL_NAME_PREFIXES = ['animation-', 'conseil-']
const FIRST_NAME_PREFIX = 'trombinoscope-'

const collator = new Intl.Collator('fr', { sensitivity: 'base' })

/**
 * A name as the comparison reads it: letters only, without their accents or
 * case — `NFD` parts « é » into « e » and an accent the filter then drops.
 * « Jean-luc » is « Jean-Luc », « Veronique » is « Véronique » — but
 * « Michelle » stays apart from « Michèle », which is a different name rather
 * than a different spelling of one.
 */
const nameKey = (value?: null | string) =>
  (value ?? '')
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '')

/** A fiche's whole name as the comparison reads it, or nothing without both halves. */
const fullNameKey = ({ firstName, lastName }: Pick<RosterAdherent, 'firstName' | 'lastName'>) =>
  firstName?.trim() && lastName?.trim() ? nameKey(`${firstName}${lastName}`) : ''

/** A relationship arrives as an id or as the document, depending on depth. */
const photoId = (photo: RosterAdherent['photo']) =>
  photo && typeof photo === 'object' ? photo.id : (photo ?? null)

const groupBy = <T>(items: T[], keyOf: (item: T) => string) => {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const key = keyOf(item)

    if (key) groups.set(key, [...(groups.get(key) ?? []), item])
  }

  return groups
}

/**
 * Which uploaded portrait goes on which fiche, decided on names alone.
 *
 * A full-name portrait goes to the one fiche of that name. A trombinoscope
 * portrait goes to a fiche only when nothing else could be meant: its first
 * name is on no other portrait and on no other fiche — counting fiches that
 * already have a face, since it could be theirs. Everything else is left for a
 * person, who can tell faces apart where this cannot tell seven Bernards apart.
 *
 * Three things it never does. It never replaces a portrait: a fiche that has
 * one keeps it, whoever chose it. It never gives a portrait to a second fiche:
 * one already on a fiche is out of the running. And it never touches
 * « Portrait » under « Publication sur le site » — a photograph on a fiche is
 * not consent to show it.
 */
export const planPortraits = ({
  adherents,
  uploads,
}: {
  adherents: RosterAdherent[]
  uploads: PortraitUpload[]
}): PortraitPlan => {
  const withPhoto = adherents.filter(({ photo }) => photoId(photo) !== null)
  const onAFiche = new Set(withPhoto.map(({ photo }) => photoId(photo)))
  const portrayed = new Set(withPhoto.map(({ id }) => id))
  const alreadyPortrayed = portrayed.size

  const free = uploads
    .filter((upload) => upload.filename && !onAFiche.has(upload.id))
    .sort((a, b) => collator.compare(a.filename ?? '', b.filename ?? ''))

  const attach: PortraitAttachment[] = []
  const shared: SharedName[] = []
  const toConfirm: PortraitPlan['toConfirm'] = []
  const unmatched = new Set<string>()

  const nameOf = (portrait: PortraitUpload) => portrait.alt?.trim() || portrait.filename || ''

  const share = (name: string, fiches: RosterAdherent[], portraits: PortraitUpload[]) => {
    const without = fiches.filter(({ id }) => !portrayed.has(id))

    // A name whose every fiche has a face leaves nobody to do anything for.
    if (without.length === 0) return

    shared.push({
      adherents: without.map(adherentName).sort(collator.compare),
      fiches: fiches.length,
      name,
      portraits: portraits.map(({ filename }) => filename ?? ''),
    })
  }

  const give = (
    fiche: RosterAdherent,
    portrait: PortraitUpload,
    matchedOn: PortraitAttachment['matchedOn'],
  ) => {
    portrayed.add(fiche.id)
    attach.push({
      adherent: fiche.id,
      consented: Boolean(fiche.publicationConsent?.photo),
      filename: portrait.filename ?? '',
      matchedOn,
      media: portrait.id,
      name: adherentName(fiche),
    })
  }

  /* Full names first: a certain match is worth more than a likely one, and a
   * fiche given its animation portrait no longer wants a guess from the
   * trombinoscope. */
  const byFullName = groupBy(adherents, fullNameKey)

  const fullNamePortraits = groupBy(
    FULL_NAME_PREFIXES.flatMap((prefix) =>
      free.filter(({ filename }) => filename?.startsWith(prefix)),
    ),
    (portrait) => nameKey(nameOf(portrait)),
  )

  for (const [key, portraits] of fullNamePortraits) {
    const fiches = byFullName.get(key) ?? []
    const name = nameOf(portraits[0])

    if (fiches.length === 0) unmatched.add(name)
    else if (fiches.length > 1) share(name, fiches, portraits)
    else if (!portrayed.has(fiches[0].id)) give(fiches[0], portraits[0], 'fullName')
  }

  const byFirstName = groupBy(adherents, ({ firstName }) => nameKey(firstName))

  const firstNamePortraits = groupBy(
    free.filter(({ filename }) => filename?.startsWith(FIRST_NAME_PREFIX)),
    (portrait) => nameKey(nameOf(portrait)),
  )

  for (const [key, portraits] of firstNamePortraits) {
    const fiches = byFirstName.get(key) ?? []
    const name = nameOf(portraits[0])

    if (fiches.length === 0) {
      unmatched.add(name)
      continue
    }

    if (portraits.length > 1 || fiches.length > 1) {
      share(name, fiches, portraits)
      continue
    }

    const [fiche] = fiches

    if (portrayed.has(fiche.id)) continue

    if (fiche.publicationConsent?.photo) {
      toConfirm.push({ filename: portraits[0].filename ?? '', name: adherentName(fiche) })
      continue
    }

    give(fiche, portraits[0], 'firstName')
  }

  return {
    alreadyPortrayed,
    attach: attach.sort((a, b) => collator.compare(a.name, b.name)),
    shared: shared.sort((a, b) => collator.compare(a.name, b.name)),
    stillWithout: adherents.length - portrayed.size,
    toConfirm: toConfirm.sort((a, b) => collator.compare(a.name, b.name)),
    unmatched: [...unmatched].sort(collator.compare),
  }
}

/** A photo in a folder, and the name its file was given: « Bernard Attenot.jpg ». */
export type FolderPhoto = { file: string; name: string }

export type FolderPlan = {
  /** Fiches with no photo that the folder gives one to. */
  attach: {
    adherent: number
    file: string
    /** What the upload is captioned with: the first name and nothing more. */
    firstName: string
    name: string
    /** The fiche's consent group as written when « Portrait » is ticked. */
    publicationConsent: { email: boolean; phone: boolean; photo: true }
  }[]
  /** Fiches that already have a photo and « Portrait », left as they are. */
  alreadyShown: number
  /** Names several fiches carry: which of them it is, is for someone who knows. */
  homonyms: string[]
  /**
   * Fiches that have a photo but no « Portrait ». The photo stays, and ticking
   * would publish it unseen — it may be a guess on a first name — so the box
   * is left for someone who has looked.
   */
  photographed: string[]
  /** Files whose name no fiche carries. Nothing is uploaded for them. */
  unmatched: string[]
}

/**
 * Which fiche each photo in a folder goes on, by the full name its file was
 * given: the one fiche carrying that exact name, as with any full-name match,
 * and only while it has no photo, since a fiche that has one keeps it.
 *
 * That is also what makes ticking « Portrait » safe for a folder whose people
 * all agreed to appear: the face it publishes is the folder's own photo of
 * them, put there in the same write.
 *
 * The name is used here and goes no further. The library is public, so an
 * upload captioned « Prénom Nom » would list who belongs to the club, and its
 * filename would carry the surname into the trombinoscope's image URLs. The
 * upload gets the first name, like the old trombinoscope's.
 */
export const planFolder = ({
  adherents,
  photos,
}: {
  adherents: RosterAdherent[]
  photos: FolderPhoto[]
}): FolderPlan => {
  const byFullName = groupBy(adherents, fullNameKey)
  const done = new Set<number>()
  const homonyms = new Set<string>()
  const attach: FolderPlan['attach'] = []
  const photographed: string[] = []
  const unmatched: string[] = []
  let alreadyShown = 0

  for (const photo of [...photos].sort((a, b) => collator.compare(a.file, b.file))) {
    const fiches = byFullName.get(nameKey(photo.name)) ?? []

    if (fiches.length === 0) {
      unmatched.push(photo.file)
      continue
    }

    if (fiches.length > 1) {
      homonyms.add(photo.name)
      continue
    }

    const [fiche] = fiches
    const consent = fiche.publicationConsent

    // The same person twice in the folder, as « X.jpg » and « X 1.jpg ».
    if (done.has(fiche.id)) continue
    done.add(fiche.id)

    if (photoId(fiche.photo) !== null) {
      if (consent?.photo) alreadyShown++
      else photographed.push(adherentName(fiche))
      continue
    }

    attach.push({
      adherent: fiche.id,
      file: photo.file,
      firstName: fiche.firstName?.trim() ?? '',
      name: adherentName(fiche),
      publicationConsent: {
        email: Boolean(consent?.email),
        phone: Boolean(consent?.phone),
        photo: true,
      },
    })
  }

  return {
    alreadyShown,
    attach: attach.sort((a, b) => collator.compare(a.name, b.name)),
    homonyms: [...homonyms].sort(collator.compare),
    photographed: photographed.sort(collator.compare),
    unmatched,
  }
}
