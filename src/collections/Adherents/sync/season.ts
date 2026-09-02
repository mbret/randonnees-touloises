/**
 * Which season a date falls in, written the way the club writes it: `2026/2027`.
 *
 * The export carries no season column — the sheet is simply *this* season's
 * sheet, and the club renames the file. So the importer has to be told, and this
 * is what it proposes: an FFRandonnée season opens on 1 September, so anything
 * from September belongs to the year it starts and anything before it to the
 * season already running.
 *
 * Proposed, not decided. The sync page shows the season it worked out and lets
 * it be changed before anything is applied, because the one occasion this is
 * wrong — importing last season's file in October to correct something — is
 * exactly the occasion nobody would think to check.
 */
export const seasonFor = (date: Date): string => {
  const year = date.getUTCFullYear()
  const startsThisYear = date.getUTCMonth() >= 8 // 8 = September

  return startsThisYear ? `${year}/${year + 1}` : `${year - 1}/${year}`
}
