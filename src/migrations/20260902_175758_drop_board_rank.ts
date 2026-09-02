import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drops `adherents.board_rank`.
 *
 * The conseil is read in the club's own order — président, vice-présidente,
 * secrétaire, trésorier, the référents, then the members — and that order is a
 * property of the functions rather than of the people holding them. Keeping it
 * as a number on each of fifteen documents made it something to maintain, and to
 * get wrong, every time the conseil changed; it belongs to the page that renders
 * the list, written once.
 *
 * Safe to drop unguarded, unlike the team directory before it: the column was
 * added in the migration two before this one and no import or admin screen ever
 * wrote to it, so there is nothing in it to lose. `down` restores the column,
 * empty, which is exactly what it holds now.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "adherents" DROP COLUMN "board_rank";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "adherents" ADD COLUMN "board_rank" numeric;`)
}
