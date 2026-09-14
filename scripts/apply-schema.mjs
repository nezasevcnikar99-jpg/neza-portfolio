/**
 * Brings the deployed database up to the shape the code expects, before the
 * build. Payload only pushes schema in development, so without this a new field
 * is a 500 on every page that reads it — which is exactly how the landing
 * fields took the home page down.
 *
 * Payload's own `migrate` is not usable here: this database was created by
 * push, so its payload_migrations table holds only a "dev" marker, and the
 * command stops to ask what to do — which would hang the build.
 *
 * Every statement is additive and guarded, so this is safe against whatever
 * state the database is actually in, and safe to run on every deploy.
 */
import { Client } from "pg";

const uri = process.env.DATABASE_URI;
if (!uri) {
  console.error("apply-schema: DATABASE_URI is not set — refusing to build blind.");
  process.exit(1);
}

const STATEMENTS = [
  `ALTER TABLE "home" ADD COLUMN IF NOT EXISTS "landing_media_id" integer`,
  `ALTER TABLE "home" ADD COLUMN IF NOT EXISTS "landing_poster_id" integer`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "index_focal_x" numeric`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "index_focal_y" numeric`,
  // Rows that predate the tick default to shown, so no picture leaves a page
  // the moment this lands.
  `ALTER TABLE "projects_gallery" ADD COLUMN IF NOT EXISTS "on_page" boolean DEFAULT true`,
  // Every picture already up keeps filling its frame until someone says otherwise.
  `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "show_whole" boolean DEFAULT false`,
  `CREATE INDEX IF NOT EXISTS "home_landing_media_idx" ON "home" ("landing_media_id")`,
  `CREATE INDEX IF NOT EXISTS "home_landing_poster_idx" ON "home" ("landing_poster_id")`,
  // Postgres has no ADD CONSTRAINT IF NOT EXISTS, so the duplicate is swallowed.
  `DO $$ BEGIN
     ALTER TABLE "home" ADD CONSTRAINT "home_landing_media_id_media_id_fk"
       FOREIGN KEY ("landing_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     ALTER TABLE "home" ADD CONSTRAINT "home_landing_poster_id_media_id_fk"
       FOREIGN KEY ("landing_poster_id") REFERENCES "media"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

const client = new Client({ connectionString: uri });
try {
  await client.connect();
  for (const statement of STATEMENTS) await client.query(statement);
  console.log(`apply-schema: ${STATEMENTS.length} statements applied.`);
} catch (error) {
  console.error("apply-schema failed:", error.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
