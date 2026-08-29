import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `schedule_is_full` becomes a three-way `schedule_availability`, and
 * `schedule_open_to_all` arrives beside it.
 *
 * Written by hand rather than generated, because the generator offers only to
 * create the new column or to rename the old one, and this is neither: the
 * values have to be carried across before the boolean goes. An outing marked
 * full stays full; everything else takes the default, which is what a row with
 * no answer meant anyway.
 *
 * The `down` puts the boolean back and fills it the same way. A waiting list
 * has nowhere to go in a boolean and reads as full, which is the truthful half
 * of it — there are no places — and the closest the old shape can come.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_schedule_availability" AS ENUM('open', 'full', 'waitlist');
  CREATE TYPE "public"."enum__posts_v_version_schedule_availability" AS ENUM('open', 'full', 'waitlist');
  ALTER TABLE "posts" ADD COLUMN "schedule_availability" "enum_posts_schedule_availability" DEFAULT 'open';
  ALTER TABLE "posts" ADD COLUMN "schedule_open_to_all" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_availability" "enum__posts_v_version_schedule_availability" DEFAULT 'open';
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_open_to_all" boolean;`)

  /* Carry the answers over before the column they live in is dropped. */
  await db.execute(sql`
   UPDATE "posts" SET "schedule_availability" = 'full' WHERE "schedule_is_full" IS TRUE;
  UPDATE "_posts_v" SET "version_schedule_availability" = 'full' WHERE "version_schedule_is_full" IS TRUE;`)

  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "schedule_is_full";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_is_full";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "schedule_is_full" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_is_full" boolean;`)

  await db.execute(sql`
   UPDATE "posts" SET "schedule_is_full" = true WHERE "schedule_availability" IN ('full', 'waitlist');
  UPDATE "_posts_v" SET "version_schedule_is_full" = true WHERE "version_schedule_availability" IN ('full', 'waitlist');`)

  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "schedule_availability";
  ALTER TABLE "posts" DROP COLUMN "schedule_open_to_all";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_availability";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_open_to_all";
  DROP TYPE "public"."enum_posts_schedule_availability";
  DROP TYPE "public"."enum__posts_v_version_schedule_availability";`)
}
