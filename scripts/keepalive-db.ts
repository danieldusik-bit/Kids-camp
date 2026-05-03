/**
 * Daily keep-alive ping for the Turso DB.
 *
 * Turso's free tier archives databases that sit idle for 30+ days.
 * One SELECT 1 a day is enough to keep ours flagged as active.
 *
 * Run via GitHub Actions on a daily cron.
 */

import { createClient } from "@libsql/client";

const DB_URL = process.env.TURSO_DATABASE_URL;
const TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!DB_URL || !TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN.");
  process.exit(1);
}

const client = createClient({ url: DB_URL, authToken: TOKEN });

(async () => {
  const r = await client.execute("SELECT COUNT(*) AS n FROM Registration");
  const row = r.rows[0] as unknown as { n: number };
  console.log(`Keep-alive OK — Registration table has ${row.n} rows.`);
})().catch((e) => {
  console.error("Keep-alive failed:", e);
  process.exit(1);
});
