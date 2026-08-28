import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "schedule_registration_deadline" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "schedule_is_full" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_registration_deadline" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_is_full" boolean;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "schedule_registration_deadline";
  ALTER TABLE "posts" DROP COLUMN "schedule_is_full";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_registration_deadline";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_is_full";`)
}
