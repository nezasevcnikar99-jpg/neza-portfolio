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
       FOREACH v IN ARRAY ARRAY['Idejna zasnova', 'Seminarski projekt', 'Raziskava', 'Natečaj', 'Grafično oblikovanje', 'Esej'] LOOP
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
  `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "in_use" boolean DEFAULT false`,
  `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "used_in" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "notes" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "sources" varchar`,
  // Two slips in the About text, corrected in place; each only where the old
  // wording is still there. Never allowed to stop a deploy.
  `DO $$ BEGIN
     UPDATE "about" SET "bio" = replace("bio"::text, 'predno se sestavi', 'preden se sestavi')::jsonb
       WHERE "bio"::text LIKE '%predno se sestavi%';
     UPDATE "about" SET "bio" = replace("bio"::text, 'pravili, katere je treba', 'pravili, ki jih je treba')::jsonb
       WHERE "bio"::text LIKE '%pravili, katere je treba%';
   EXCEPTION WHEN others THEN RAISE NOTICE 'about text not corrected: %', SQLERRM; END $$`,
  // Drag-and-drop order in the admin (Payload's "orderable"). Existing projects
  // get keys once, in the order the site showed them: newest year first, then
  // the old number, then title. Only while no project has a key yet.
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "_order" varchar`,
  `CREATE INDEX IF NOT EXISTS "projects__order_idx" ON "projects" ("_order")`,
  `WITH ranked AS (
     SELECT id, row_number() OVER (ORDER BY "year" DESC, "order" ASC NULLS LAST, "title" ASC) AS n FROM "projects"
   )
   UPDATE "projects" p
      SET "_order" = 'a' || substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', ranked.n::int, 1)
     FROM ranked
    WHERE p.id = ranked.id AND ranked.n <= 62
      AND NOT EXISTS (SELECT 1 FROM "projects" WHERE "_order" IS NOT NULL)`,
  // The essay moves to the new kind once; a later choice in the admin stays
  // because the row is then newer than this.
  `UPDATE "projects" SET "category" = 'Esej'
     WHERE "slug" = 'kdo-in-kaj-je-arhitekt' AND "category"::text = 'Raziskava'
       AND "updated_at" <= '2026-09-18T17:48:46.630Z'`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "hover_image_id" integer`,
  `CREATE INDEX IF NOT EXISTS "projects_hover_image_idx" ON "projects" ("hover_image_id")`,
  `DO $$ BEGIN
     ALTER TABLE "projects" ADD CONSTRAINT "projects_hover_image_id_media_id_fk"
       FOREIGN KEY ("hover_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  // The English site: every text beside its Slovene, empty until translated.
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "title_en" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "subtitle_en" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "quote_en" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "intro_en" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "concept_en" jsonb`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "stranka_en" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "vloga_en" varchar`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "document_label_en" varchar`,
  `ALTER TABLE "projects_gallery" ADD COLUMN IF NOT EXISTS "caption_en" varchar`,
  `ALTER TABLE "home" ADD COLUMN IF NOT EXISTS "hero_description_en" varchar`,
  `ALTER TABLE "about" ADD COLUMN IF NOT EXISTS "bio_en" jsonb`,
  `ALTER TABLE "about_education" ADD COLUMN IF NOT EXISTS "label_en" varchar`,
  `ALTER TABLE "about_skills" ADD COLUMN IF NOT EXISTS "skill_en" varchar`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "search_visible" boolean DEFAULT true`,
  // First English for the About page and the landing label, filled in once:
  // only where the English is still empty, so the admin's own wording stays.
  `UPDATE "about" SET "bio_en" = $t$ {"root": {"type": "root", "format": "", "indent": 0, "version": 1, "direction": "ltr", "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "direction": "ltr", "textFormat": 0, "children": [{"type": "text", "text": "I am an architect in the making who sees space as something to be read slowly and patiently, explored and questioned, before it comes together into a clear and meaningful story. I work in architectural design, I write, and now and then I design visual and graphic identities for publications and websites.", "format": 0, "style": "", "mode": "normal", "detail": 0, "version": 1}]}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "direction": "ltr", "textFormat": 0, "children": [{"type": "text", "text": "I am most drawn to buildings, spaces and projects that already carry the marks of time and whisper the stories of those who used them before – and, more generally, to any puzzle with given conditions and set rules that have to be skilfully woven together in search of the best solution.", "format": 0, "style": "", "mode": "normal", "detail": 0, "version": 1}]}]}}$t$::jsonb WHERE "bio_en" IS NULL`,
  `UPDATE "about_education" SET "label_en" = $t$Gimnazija Vič grammar school, Ljubljana$t$ WHERE "label_en" IS NULL AND trim("label") = trim($t$Gimnazija Vič, Ljubljana$t$)`,
  `UPDATE "about_education" SET "label_en" = $t$Exchange semester in the Master's programme in Architecture, Queen's University Belfast, Belfast, UK$t$ WHERE "label_en" IS NULL AND trim("label") = trim($t$Semester na magisterskem študiju arhitekture, Queen's University Belfast, Belfast, UK$t$)`,
  `UPDATE "about_education" SET "label_en" = $t$Master's programme in Architecture, Faculty of Architecture, University of Ljubljana$t$ WHERE "label_en" IS NULL AND trim("label") = trim($t$Magisterski študij arhitekture, Fakulteta za arhitekturo, Ljubljana$t$)`,
  `UPDATE "about_education" SET "label_en" = $t$Work experience - Book cover design for the MLC Faculty$t$ WHERE "label_en" IS NULL AND trim("label") = trim($t$Delovne izkušnje - Oblikovanje naslovnic knjig MLC Fakultete$t$)`,
  `UPDATE "about_education" SET "label_en" = $t$Work experience - Studio of Dr. Nataša Koselj, assistant architect$t$ WHERE "label_en" IS NULL AND trim("label") = trim($t$Delovne izkušnje -  Biro dr. Nataša Koselj, projektantka asistentka$t$)`,
  `UPDATE "about_education" SET "label_en" = $t$Work experience - Website design and development$t$ WHERE "label_en" IS NULL AND trim("label") = trim($t$Delovne izkušnje - Oblikovanje in izdelava spletnih strani$t$)`,
  `UPDATE "about_education" SET "label_en" = $t$Work experience - Apolonija Šušteršič Studio, assistant architect$t$ WHERE "label_en" IS NULL AND trim("label") = trim($t$Delovne izkušnje - Apolonija Šušteršič Studio, projektantka asistentka$t$)`,
  `UPDATE "about_skills" SET "skill_en" = $t$3D software: Rhino, SketchUp$t$ WHERE "skill_en" IS NULL AND trim("skill") = $t$3D programi Rhino, SketchUp$t$`,
  `UPDATE "about_skills" SET "skill_en" = $t$Visualisations$t$ WHERE "skill_en" IS NULL AND trim("skill") = $t$Vizualizacije$t$`,
  `UPDATE "about_skills" SET "skill_en" = $t$Adobe Illustrator$t$ WHERE "skill_en" IS NULL AND trim("skill") = $t$Adobe Ilustrator$t$`,
  `UPDATE "about_skills" SET "skill_en" = $t$Graphic design$t$ WHERE "skill_en" IS NULL AND trim("skill") = $t$Grafično oblikovanje$t$`,
  `UPDATE "about_skills" SET "skill_en" = $t$Web design in HTML and WordPress$t$ WHERE "skill_en" IS NULL AND trim("skill") = $t$Izdelava spletnih strani HTML in WordPress$t$`,
  `UPDATE "home" SET "hero_description_en" = 'Portfolio' WHERE "hero_description_en" IS NULL`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "phone" varchar`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "linkedin" varchar`,
  // The phone from the CV, filled in once: only while the settings have not been
  // saved since, so clearing it in the admin sticks.
  `UPDATE "settings" SET "phone" = '+386 64 148 632'
     WHERE "phone" IS NULL AND "updated_at" <= '2026-09-14T12:57:09.070Z'`,
  // "Html in Wordpress" written as the names are spelled; only that exact text.
  `DO $$ BEGIN
     UPDATE "about_skills" SET "skill" = 'Izdelava spletnih strani HTML in WordPress'
       WHERE "skill" = 'Izdelava spletnih strani Html in Wordpress';
   EXCEPTION WHEN others THEN RAISE NOTICE 'skill not corrected: %', SQLERRM; END $$`,
  // Puts back the landing label "Portfolio" briefly replaced. Only while the
  // home page has not been saved since (updated_at), so the admin's own choice
  // made later is never undone by a deploy.
  `UPDATE "home" SET "hero_description" = 'Zbirka arhitekturnih projektov, esejev in grafičnih del'
     WHERE "hero_description" = 'Portfolio' AND "updated_at" <= '2026-09-16T20:51:34.125Z'`,
];

// Marks which pictures the site uses. The same statement as MEDIA_USAGE_SQL in
// src/lib/media-usage.ts, which reruns it whenever a project or page is saved;
// here it fills the marks in for the first time and catches anything changed
// straight in the database. A failure only warns, so it can never stop a deploy.
const MEDIA_USAGE_SQL = `
  WITH refs(media_id, label) AS (
    SELECT hero_image_id, title || ' · naslovna' FROM projects WHERE hero_image_id IS NOT NULL
    UNION ALL
    SELECT g.image_id, p.title || CASE WHEN g.on_page THEN ' · na strani' ELSE ' · galerija' END
      FROM projects_gallery g JOIN projects p ON p.id = g._parent_id WHERE g.image_id IS NOT NULL
    UNION ALL
    SELECT document_id, title || ' · za prenos' FROM projects WHERE document_id IS NOT NULL
    UNION ALL
    SELECT hover_image_id, title || ' · ob prehodu' FROM projects WHERE hover_image_id IS NOT NULL
    UNION ALL
    SELECT landing_media_id, 'Naslovnica' FROM home WHERE landing_media_id IS NOT NULL
    UNION ALL
    SELECT landing_poster_id, 'Naslovnica · ozadje videa' FROM home WHERE landing_poster_id IS NOT NULL
    UNION ALL
    SELECT portrait_id, 'O meni · portret' FROM about WHERE portrait_id IS NOT NULL
  ), agg AS (
    SELECT media_id, string_agg(DISTINCT label, ', ') AS used_in FROM refs GROUP BY media_id
  )
  UPDATE media m
     SET in_use = (a.media_id IS NOT NULL), used_in = a.used_in
    FROM media m2 LEFT JOIN agg a ON a.media_id = m2.id
   WHERE m.id = m2.id
     AND (m.in_use IS DISTINCT FROM (a.media_id IS NOT NULL) OR m.used_in IS DISTINCT FROM a.used_in)
`;

const client = new Client({ connectionString: uri });
try {
  await client.connect();
  for (const statement of STATEMENTS) await client.query(statement);
  console.log(`apply-schema: ${STATEMENTS.length} statements applied.`);
  try {
    const { rowCount } = await client.query(MEDIA_USAGE_SQL);
    console.log(`apply-schema: media usage marked on ${rowCount} changed pictures.`);
  } catch (error) {
    console.warn("apply-schema: media usage not marked:", error.message);
  }
} catch (error) {
  console.error("apply-schema failed:", error.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
