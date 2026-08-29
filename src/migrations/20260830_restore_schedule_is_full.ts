import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Put `schedule_is_full` back, with no field behind it.
 *
 * Every deployment reads the production database, so dropping the column in
 * the same migration that added `schedule_availability` broke every branch
 * still on the other side of it: the code they build asks `posts` for a column
 * the database no longer has, and the build dies exporting `/news/page/1` with
 * `column posts.schedule_is_full does not exist`. Two open pull requests were
 * in that window, and a rollback of production to a deployment from it would
 * have taken the site down rather than a preview.
 *
 * So the drop is undone and left for a later migration of its own, once no
 * branch in flight declares `isFull` any more. That is the rule the previous
 * one broke and this one restores: a migration ships with the code that needs
 * it, and only ever adds. Removing what the old code was reading is a separate
 * migration, after the old code is gone — otherwise the schema moves out from
 * under everything that has not merged yet.
 *
 * Nothing reads the column here: it is absent from the Posts config, so Payload
 * neither selects nor writes it, and `migrate:create` cannot see it either —
 * the generator diffs the config against the last `.json` snapshot, and the
 * column is in neither. The migration that finally drops it has to be written
 * by hand. That also required filing the snapshot #49 never wrote: without it
 * the generator was still diffing against the shape from before #49, so the
 * next generated migration would have re-added `schedule_availability` — which
 * would fail on deploy, the column being there already — and dropped this one
 * straight back out.
 *
 * The backfill is a snapshot, not a mirror: it carries the answer across as it
 * stands, and an outing filled or emptied afterwards moves `availability` alone.
 * A branch from the window therefore reads a truth that is current as of this
 * migration, which is what it needs to build and to render sensibly, and one
 * more reason not to leave the column standing longer than those branches do.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "schedule_is_full" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_is_full" boolean;`)

  await db.execute(sql`
   UPDATE "posts" SET "schedule_is_full" = true WHERE "schedule_availability" IN ('full', 'waitlist');
  UPDATE "_posts_v" SET "version_schedule_is_full" = true WHERE "version_schedule_availability" IN ('full', 'waitlist');`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "schedule_is_full";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_is_full";`)
}
