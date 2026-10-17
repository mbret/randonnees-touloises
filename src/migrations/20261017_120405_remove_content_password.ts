import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Removes the content password: the « Mot de passe pour le contenu » setting on
 * the general global, and the box on each post that asked for it.
 *
 * The values go with the columns, and `down` brings the columns back empty. No
 * published post had the box ticked, so nothing that was hidden is shown by
 * this.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "require_content_password";
  ALTER TABLE "_posts_v" DROP COLUMN "version_require_content_password";
  ALTER TABLE "general" DROP COLUMN "content_password";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "require_content_password" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_require_content_password" boolean;
  ALTER TABLE "general" ADD COLUMN "content_password" varchar;`)
}
