import { sql } from "@payloadcms/db-postgres";
import type { PayloadRequest } from "payload";

/**
 * Marks every picture and file with where the site uses it, so unused ones can
 * be filtered out in the admin and deleted. Recomputed in full on each change
 * to a project, the home page or the about page: the tables are small, and a
 * full pass can never drift. scripts/apply-schema.mjs runs the same statement
 * on every deploy, so keep the two in step.
 */
export const MEDIA_USAGE_SQL = `
  WITH refs(media_id, label) AS (
    SELECT hero_image_id, title || ' · naslovna' FROM projects WHERE hero_image_id IS NOT NULL
    UNION ALL
    SELECT g.image_id, p.title || CASE WHEN g.on_page THEN ' · na strani' ELSE ' · galerija' END
      FROM projects_gallery g JOIN projects p ON p.id = g._parent_id WHERE g.image_id IS NOT NULL
    UNION ALL
    SELECT document_id, title || ' · za prenos' FROM projects WHERE document_id IS NOT NULL
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

type Db = { transaction: (fn: (tx: { execute: (q: unknown) => Promise<unknown> }) => Promise<unknown>) => Promise<unknown> };

export async function refreshMediaUsage(req: PayloadRequest) {
  const adapter = req.payload.db as unknown as { drizzle: Db; sessions?: Record<string, { db: Db }> };
  // Inside the request's own transaction, so the change being saved is already
  // counted; a nested transaction is a savepoint, so a failure here rolls back
  // only this and never the save itself.
  const id = req.transactionID ? await req.transactionID : undefined;
  const db = (id !== undefined && adapter.sessions?.[String(id)]?.db) || adapter.drizzle;
  try {
    await db.transaction((tx) => tx.execute(sql.raw(MEDIA_USAGE_SQL)));
  } catch (error) {
    req.payload.logger.error({ err: error, msg: "Uporabe slik ni bilo mogoče osvežiti" });
  }
}
