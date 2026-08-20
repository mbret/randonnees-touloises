import type { Where } from 'payload'

/**
 * Actualités are the posts without a date, the programme is the posts with one.
 * The archive of club news filters on this so the eleven sorties and séjours do
 * not bury it — there is no category doing the work, only the date.
 */
export const withoutPrograms: Where = { 'schedule.startDate': { exists: false } }
