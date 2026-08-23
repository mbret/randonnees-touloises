import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_membership_tiers_tiers" ADD COLUMN "enable_link" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_membership_tiers_tiers" ADD COLUMN "enable_link" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_membership_tiers_tiers" DROP COLUMN "enable_link";
  ALTER TABLE "_pages_v_blocks_membership_tiers_tiers" DROP COLUMN "enable_link";`)
}
