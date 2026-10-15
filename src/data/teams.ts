import type { TeamMember } from '@/components/TeamSection/TeamSection'

/** A member as written down here: a name and a function, no portrait. */
export type StaticTeamMember = Omit<TeamMember, 'media'>

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
