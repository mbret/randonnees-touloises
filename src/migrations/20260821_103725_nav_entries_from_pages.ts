import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "show_in_nav" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "nav_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "nav_order" numeric;
  ALTER TABLE "_pages_v" ADD COLUMN "version_show_in_nav" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_nav_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_nav_order" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "show_in_nav";
  ALTER TABLE "pages" DROP COLUMN "nav_label";
  ALTER TABLE "pages" DROP COLUMN "nav_order";
  ALTER TABLE "_pages_v" DROP COLUMN "version_show_in_nav";
  ALTER TABLE "_pages_v" DROP COLUMN "version_nav_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_nav_order";`)
}
