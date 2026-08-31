/**
 * The club in numbers, in one place because two pages say them.
 *
 * They were written into `/about` alone; the home page now opens with four of
 * them too, and a figure that disagrees with itself between two pages is worse
 * than one that is merely out of date. Kept in code rather than the CMS for now,
 * the way `data/teams.ts` is — they change about once a year, at the assemblée
 * générale, and that is the moment to edit this file.
 */
export type KeyFigure = {
  value: string
  /** Set on an ordinal, so `1` can be drawn as `1ᵉʳ` without the label carrying it. */
  suffix?: string
  label: string
  /**
   * The same fact in as few words as it takes, for the phone, where the four
   * figures are read as one sentence rather than a table. Not an abbreviation
   * of the label so much as the way you would say it out loud.
   */
  short?: string
}

export const KEY_FIGURES = {
  founded: { value: '1987', label: 'Année de création' },
  members: { value: '260', label: 'Adhérents', short: 'adhérents' },
  leaders: { value: '20', label: 'Animateurs et animatrices diplômés', short: 'animateurs' },
  /* U+202F, the narrow no-break space French sets thousands with. It is also
     what stops `59 000` breaking across two lines in a narrow column. */
  kilometres: { value: '59\u202f000', label: 'Kilomètres parcourus en 2025', short: 'km en 2025' },
  ranking: {
    value: '1',
    suffix: 'er',
    label: 'Club de Meurthe-et-Moselle',
    short: 'de Meurthe-et-Moselle',
  },
} as const satisfies Record<string, KeyFigure>

/**
 * What `/about` has always shown: the club's own history first.
 */
export const ABOUT_FIGURES: KeyFigure[] = [
  KEY_FIGURES.founded,
  KEY_FIGURES.members,
  KEY_FIGURES.leaders,
  KEY_FIGURES.kilometres,
]

/**
 * What the home page opens with. The founding year is left out here because the
 * hero says « depuis 1987 » a few lines above; its place goes to the ranking,
 * which is the one figure a visitor cannot infer from the others.
 */
export const HOME_FIGURES: KeyFigure[] = [
  KEY_FIGURES.members,
  KEY_FIGURES.kilometres,
  KEY_FIGURES.leaders,
  KEY_FIGURES.ranking,
]
