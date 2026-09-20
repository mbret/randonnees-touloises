import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `general.homeHeroImage`: the photograph at the top of the home page, as
 * something the club can change from the admin panel.
 *
 * One column, on a global that has no drafts and so no `_v` table to keep in
 * step. Additive and nullable, and null is where every environment starts: the
 * hero draws the site's « à définir » stand-in until somebody uploads a
 * picture, so the first thing to do after this migration reaches an
 * environment is to choose one in « Réglages généraux ».
 *
 * `ON DELETE set null`, which Payload picks for every upload relationship:
 * deleting the media document empties the field rather than refusing the
 * delete, and the hero shows the stand-in again.
 *
 * `down` drops the column, which forgets which image was chosen — the image
 * itself is a `media` document and is not touched.
 *
 * As with `hero_subtitle`, a preview deployment of the branch that adds this
 * will fail to build and is meant to: previews read production's database
 * without migrating it, so the code asks `general` for a column that is not
 * there yet. The production deployment migrates first, then builds. See
 * `scripts/migrate-on-deploy.mjs`.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "general" ADD COLUMN "home_hero_image_id" integer;
  ALTER TABLE "general" ADD CONSTRAINT "general_home_hero_image_id_media_id_fk" FOREIGN KEY ("home_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "general_home_hero_image_idx" ON "general" USING btree ("home_hero_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "general" DROP CONSTRAINT "general_home_hero_image_id_media_id_fk";
  
  DROP INDEX "general_home_hero_image_idx";
  ALTER TABLE "general" DROP COLUMN "home_hero_image_id";`)
}
