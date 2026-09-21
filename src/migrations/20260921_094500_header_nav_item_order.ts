import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `navOrder` on the En-tête global's own menu entries.
 *
 * One column, and only one: the header global keeps no drafts, so there is no
 * `_header_v` table to mirror it into the way a page field has to be.
 *
 * Nullable and read as `DEFAULT_NAV_ORDER` when unset, which is where an entry
 * added before this column already sat — so the single entry in production
 * ("Nos sorties du mois", at the tail of the Plus menu) does not move until
 * somebody types a number into it. Nothing is read, rewritten or backfilled
 * here: a default written into the row would be a number nobody chose, and the
 * fallback already lives in code where one edit moves every entry that never
 * asked for a position.
 *
 * `down` drops the column, which loses the orders typed since. The entries
 * themselves survive it and fall back to where they were before.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items" ADD COLUMN "nav_order" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items" DROP COLUMN "nav_order";`)
}
