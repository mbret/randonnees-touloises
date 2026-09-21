import { DEFAULT_NAV_ORDER, staticNavItems } from './staticNavItems'

/**
 * What an editor needs in order to aim at a gap: the positions the menu's fixed
 * entries actually occupy, read off the menu itself rather than restated here,
 * where the two would drift apart the first time one of them moved.
 *
 * Shared by the two places an order can be set — a page's sidebar and an entry
 * in the En-tête global — because both are ranked on one scale, so an editor
 * reading either has to be told about the other's entries as well. `subject` is
 * the noun and nothing else: « la page » or « l’entrée », both feminine, which
 * is what lets the pronouns below stand for either.
 */
export const navOrderDescription = (subject: string) =>
  'Classement croissant sur l’ensemble du menu. Les entrées fixes occupent ' +
  staticNavItems.map(({ link, navOrder }) => `${navOrder} ${link.label}`).join(', ') +
  `. Sans valeur, ${subject} se place en ${DEFAULT_NAV_ORDER}, donc après elles. ` +
  'Un nombre intermédiaire l’insère entre deux entrées fixes — 15 la place entre Contact ' +
  'et À propos — et à nombre égal elle passe devant l’entrée fixe.'
