import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `hero.subtitle`: the sentence under a page's title, as a field of its own.
 *
 * Two columns for one field, as every page field costs — `pages` and the
 * `_pages_v` table behind drafts and version history, where it is prefixed
 * `version_`.
 *
 * Purely additive and nullable, so every existing page keeps rendering exactly
 * as it does: they have no subtitle, the hero draws nothing where it would go,
 * and whatever strapline they carry inside their hero rich text stays a
 * paragraph until somebody moves it. Nothing is read, rewritten or dropped here.
 *
 * `down` drops both columns, which loses any subtitle typed since — there is
 * nowhere else for the text to be, so a rollback is a rollback of the content
 * too.
 *
 * Note for the pull request rather than for later: a preview deployment of the
 * branch that adds this will fail to build, and is supposed to. Previews read
 * production's database and deliberately do not migrate it, so the code asks
 * `pages` for a column production does not have yet. The production deployment
 * runs this first and then builds. See `scripts/migrate-on-deploy.mjs`.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "hero_subtitle" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_subtitle" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "hero_subtitle";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_subtitle";`)
}
