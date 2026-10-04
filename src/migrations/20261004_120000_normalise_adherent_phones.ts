import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Rewrites every stored telephone number the way the field now stores one:
 * separators taken out, `+` kept, and the `00 00 00 00 00` placeholder or a
 * blank turned into NULL — the same reading as `sheetPhone`.
 *
 * Numbers saved before the field normalised its input still read
 * `06 15 10 59 93`, and the import, which writes `0615105993`, saw every one of
 * them as a change. No schema change: the snapshot is the previous one.
 *
 * `down` does nothing. The spacing each number was typed with is not kept
 * anywhere, and the digits are unchanged, so there is nothing to restore.
 */

// The separators `PHONE_SEPARATORS` strips, as a Postgres regex: whitespace
// (including the non-breaking and narrow kinds), dots, bullets, brackets,
// slashes, underscores and dashes.
const SEPARATORS = '[\\s  .•·()\\[\\]/\\\\_-]'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "adherents"
    SET "phone" = regexp_replace("phone", ${SEPARATORS}, '', 'g')
    WHERE "phone" IS NOT NULL;`)

  await db.execute(sql`
    UPDATE "adherents"
    SET "phone" = NULL
    WHERE "phone" ~ '^\\+?0*$';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
