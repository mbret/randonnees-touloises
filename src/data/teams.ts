import type { TeamMember } from '@/components/TeamSection/TeamSection'

/**
 * A member as written down here: what `TeamSection` renders, less the portrait.
 * That comes from the person's adhérent fiche, found by name at render time —
 * see `resolveTeamPhotos`.
 */
export type StaticTeamMember = Omit<TeamMember, 'media'> & {
  /**
   * The name on the person's fiche, where this list prints another: « Dany »
   * here is « Daniel » there.
   */
  ficheName?: string
}

/**
 * The conseil as the previous website listed it. Nothing renders it any more —
 * /board is a page built from the adhérents — and scripts/build-board-page.ts
 * reads it only for the order that page started from.
 */
export const boardMembers: StaticTeamMember[] = [
  { name: 'Pascal BRET', role: 'Président' },
  { name: 'Suzanne ROCHEFOLLE', role: 'Vice Présidente' },
  { name: 'Isabelle ANDERLINI', role: 'Secrétaire' },
  { name: 'Alain GAUDE', role: 'Trésorier' },
  { name: 'Daniel BERTEAUX', role: 'Référent Santé' },
  { name: 'Jean-Marie MAZELIN', role: 'Référent Voyages' },
  { name: 'Muriel TARAL', role: 'Référente Animations' },
  { name: 'Anne-Marie OUELDENNAOUA', role: 'Secrétaire adjointe' },
  { name: 'Abdelatif OUELDENNAOUA', role: 'Membre' },
  { name: 'Pascal MELIN', role: 'Membre' },
  { name: 'Philippe NEUVILLERS', role: 'Membre' },
  { name: 'Denis CHATELAIN', role: 'Membre' },
  { name: 'Daniel ROCHEFOLLE', role: 'Membre' },
  { name: 'Pierre REVEST', role: 'Membre' },
  { name: 'Christophe LE MAGUERESSE', role: 'Membre' },
]

/**
 * The équipe d'animation, in the order /animation-team shows it. The list stays
 * here until the fiches can say who is an animateur and whose number may be
 * published; the portraits already come from the fiches.
 *
 * Animateurs publish their mobile number so randonneurs can reach them about a
 * sortie. The number is stored the way it should read on the card — the card
 * shows it next to the phone icon and strips the spaces for the tel: link.
 */
export const animationTeam: StaticTeamMember[] = [
  {
    name: 'Isabelle ANDERLINI',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 84 62 62 52' }],
  },
  {
    name: 'Bernard ATTENOT',
    contactLinks: [{ id: 'phone', type: 'phone', value: '07 71 93 28 04' }],
  },
  {
    name: 'Daniel BERTEAUX',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 86 07 99 09' }],
  },
  {
    name: 'Pascal BRET',
    contactLinks: [{ id: 'phone', type: 'phone', value: '07 88 26 43 84' }],
  },
  {
    name: 'Daniel DETHOREY',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 85 86 40 10' }],
  },
  {
    name: 'Roland FERRARI',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 61 15 47 03' }],
  },
  {
    name: 'Roger FRANÇOIS',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 84 36 42 72' }],
  },
  {
    name: 'Pierre LAURENT',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 10 53 87 81' }],
  },
  {
    name: 'Jean-Marie MAZELIN',
    contactLinks: [{ id: 'phone', type: 'phone', value: '07 81 11 20 47' }],
  },
  {
    name: 'Patricia MORELE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 73 97 19 14' }],
  },
  {
    name: 'Philippe NEUVILLERS',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 72 77 32 84' }],
  },
  {
    name: 'Michel PASQUET',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 12 27 67 10' }],
  },
  {
    name: 'Dany ROCHEFOLLE',
    ficheName: 'Daniel ROCHEFOLLE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 86 18 43 89' }],
  },
  {
    name: 'Suzanne ROCHEFOLLE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 89 34 78 32' }],
  },
  {
    name: 'Gérald SABOT',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 07 23 21 83' }],
  },
  {
    name: 'Francis SPECTE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 75 73 51 73' }],
  },
  {
    name: 'Jean-luc STEPHAN',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 75 08 61 69' }],
  },
  {
    name: 'Muriel TARAL',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 78 64 07 73' }],
  },
  {
    name: 'Bernard TUAILLON',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 21 77 17 85' }],
  },
]
