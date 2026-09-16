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
  `ALTER TABLE "home" ADD COLUMN IF NOT EXISTS "landing_light" boolean DEFAULT false`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "index_focal_x" numeric`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "index_focal_y" numeric`,
  // Rows that predate the tick default to shown, so no picture leaves a page
  // the moment this lands.
  `ALTER TABLE "projects_gallery" ADD COLUMN IF NOT EXISTS "on_page" boolean DEFAULT true`,
  // Every picture already up keeps filling its frame until someone says otherwise.
  `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "show_whole" boolean DEFAULT false`,
  // "Velik kvadrat" and the old tall cell are gone from the grid; a project left
  // on either would fail validation the next time it is saved. Compared as text
  // so a database whose enum never had these labels does not error.
  `UPDATE "projects" SET "grid_size" = 'auto' WHERE "grid_size"::text IN ('2x2', '1x2')`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "document_id" integer`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "as_text" boolean DEFAULT false`,
  // Kinds of work replace the old categories. The column is a Postgres enum, so
  // the new values are added to whatever the type is actually called, each in
  // its own statement before anything uses them.
  `DO $$ DECLARE t text; v text; BEGIN
     SELECT udt_name INTO t FROM information_schema.columns
       WHERE table_name = 'projects' AND column_name = 'category';
     IF t IS NOT NULL AND t NOT IN ('varchar', 'text') THEN
       FOREACH v IN ARRAY ARRAY['Idejna zasnova', 'Seminarski projekt', 'Raziskava', 'Natečaj'] LOOP
         EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', t, v);
       END LOOP;
     END IF;
   END $$`,
  // Only rows still on an old value are moved, so a kind chosen later in the
  // admin is never overwritten by a deploy.
  `UPDATE "projects" SET "category" = 'Seminarski projekt'
     WHERE "slug" IN ('zadnja-vecerja', 'zakaj-cez-ce-gres-lahko-skozi', 'pod-zeleznim-povrsjem')
       AND "category"::text IN ('Arhitektura', 'Literarni esej', 'Grafika')`,
  `UPDATE "projects" SET "category" = 'Raziskava'
     WHERE "slug" IN ('kdo-bo-odnesel-smeti', 'it-is-just-a-few-steps')
       AND "category"::text IN ('Arhitektura', 'Literarni esej', 'Grafika')`,
  `UPDATE "projects" SET "category" = 'Natečaj'
     WHERE "slug" = 'sotha-projekt' AND "category"::text IN ('Arhitektura', 'Literarni esej', 'Grafika')`,
  `UPDATE "projects" SET "category" = 'Idejna zasnova'
     WHERE "category"::text IN ('Arhitektura', 'Literarni esej', 'Grafika')`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "document_label" varchar`,
  `CREATE INDEX IF NOT EXISTS "projects_document_idx" ON "projects" ("document_id")`,
  `CREATE INDEX IF NOT EXISTS "home_landing_media_idx" ON "home" ("landing_media_id")`,
  `CREATE INDEX IF NOT EXISTS "home_landing_poster_idx" ON "home" ("landing_poster_id")`,
  // Postgres has no ADD CONSTRAINT IF NOT EXISTS, so the duplicate is swallowed.
  `DO $$ BEGIN
     ALTER TABLE "home" ADD CONSTRAINT "home_landing_media_id_media_id_fk"
       FOREIGN KEY ("landing_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     ALTER TABLE "projects" ADD CONSTRAINT "projects_document_id_media_id_fk"
       FOREIGN KEY ("document_id") REFERENCES "media"("id") ON DELETE SET NULL;
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
