import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The official label a category's walks must be announced with — one nullable
 * foreign key on `outing_categories`, alongside the `logo_id` it sits next to.
 *
 * Purely additive: a new column, its constraint and its index, and nothing
 * dropped or rewritten, so the schema can go out ahead of the code that reads
 * it. `outingCategories` has no drafts, so there is no versions table to carry
 * the column too — the same reason the logo needed only the one.
 *
 * Unlike the two migrations before it, `down` keeps the generator's plain
 * `DROP CONSTRAINT`: those two had already dropped the whole table with
 * `CASCADE` above, which took their constraints with it and made dropping them
 * by name fail. Here the table stays and the constraint really is there to drop.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "outing_categories" ADD COLUMN "credential_id" integer;
  ALTER TABLE "outing_categories" ADD CONSTRAINT "outing_categories_credential_id_media_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "outing_categories_credential_idx" ON "outing_categories" USING btree ("credential_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "outing_categories" DROP CONSTRAINT "outing_categories_credential_id_media_id_fk";
  
  DROP INDEX "outing_categories_credential_idx";
  ALTER TABLE "outing_categories" DROP COLUMN "credential_id";`)
}
