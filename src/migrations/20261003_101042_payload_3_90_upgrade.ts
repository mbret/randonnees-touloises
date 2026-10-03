import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Schema changes Payload 3.90 brings with it, nothing of ours.
 *
 * - `users.reset_password_requested_at`: Payload now stamps when a password
 *   reset was asked for, to rate-limit the forgot-password flow. Nullable, so
 *   every existing user simply has none.
 * - `processing` on the ecommerce plugin's transaction status, between
 *   `pending` and `succeeded`.
 *
 * Both are additive: the code still running before the deploy never selects the
 * column and never writes the new status, so it keeps working against the
 * migrated schema.
 *
 * `down` rebuilds the enum without `processing`, which fails if a transaction
 * has been left in that status — move it to another status first.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_transactions_status" ADD VALUE 'processing' BEFORE 'succeeded';
  ALTER TABLE "users" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "transactions" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  DROP TYPE "public"."enum_transactions_status";
  CREATE TYPE "public"."enum_transactions_status" AS ENUM('pending', 'succeeded', 'failed', 'cancelled', 'expired', 'refunded');
  ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_transactions_status";
  ALTER TABLE "transactions" ALTER COLUMN "status" SET DATA TYPE "public"."enum_transactions_status" USING "status"::"public"."enum_transactions_status";
  ALTER TABLE "users" DROP COLUMN "reset_password_requested_at";`)
}
