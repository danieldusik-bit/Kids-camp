/**
 * Weekly backup of the Kids Camp Portal Turso DB.
 *
 * What it does:
 *   1. Connects to Turso using TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 *   2. Dumps Registration, Team, User (without password hashes) into JSON
 *      AND CSV, in-memory.
 *   3. If RESEND_API_KEY + BACKUP_EMAIL_TO are set, sends an email with
 *      the JSON + CSV files attached.
 *   4. Writes the same files to ./tmp-backup/ on the runner so a workflow
 *      can also archive them as an artifact (encrypted) if desired.
 *
 * Designed to run from GitHub Actions on a weekly cron, but also works
 * locally:
 *
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
 *   RESEND_API_KEY=re_... BACKUP_EMAIL_TO=you@example.com \
 *   npx tsx scripts/backup-db.ts
 */

import { createClient } from "@libsql/client";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DB_URL = process.env.TURSO_DATABASE_URL;
const TOKEN = process.env.TURSO_AUTH_TOKEN;
const RESEND_KEY = process.env.RESEND_API_KEY;
const EMAIL_TO = process.env.BACKUP_EMAIL_TO;
const EMAIL_FROM = process.env.BACKUP_EMAIL_FROM || "onboarding@resend.dev";

if (!DB_URL || !TOKEN) {
  console.error(
    "Missing required env: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN."
  );
  process.exit(1);
}

const client = createClient({ url: DB_URL, authToken: TOKEN });

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const outDir = join(process.cwd(), "tmp-backup", today);
mkdirSync(outDir, { recursive: true });

type DumpedTable = {
  table: string;
  rows: number;
  jsonPath: string;
  csvPath: string;
  jsonBuf: Buffer;
  csvBuf: Buffer;
};

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function dumpTable(table: string, columnsToExclude: string[] = []): Promise<DumpedTable> {
  const result = await client.execute(`SELECT * FROM "${table}"`);
  const allCols = result.columns;
  const cols = allCols.filter((c) => !columnsToExclude.includes(c));

  const rows: Record<string, unknown>[] = result.rows.map((row) => {
    const o: Record<string, unknown> = {};
    cols.forEach((c) => {
      // libSQL Row supports both array index and named property access.
      o[c] = (row as unknown as Record<string, unknown>)[c];
    });
    return o;
  });

  const jsonPath = join(outDir, `${table}.json`);
  const csvPath = join(outDir, `${table}.csv`);
  const jsonStr = JSON.stringify(rows, null, 2);
  const csvStr =
    "﻿" +
    [cols.join(","), ...rows.map((r) => cols.map((c) => csvEscape(r[c])).join(","))].join(
      "\n"
    );
  const jsonBuf = Buffer.from(jsonStr, "utf-8");
  const csvBuf = Buffer.from(csvStr, "utf-8");

  writeFileSync(jsonPath, jsonBuf);
  writeFileSync(csvPath, csvBuf);

  return { table, rows: rows.length, jsonPath, csvPath, jsonBuf, csvBuf };
}

async function sendEmail(dumps: DumpedTable[]) {
  if (!RESEND_KEY || !EMAIL_TO) {
    console.log("RESEND_API_KEY or BACKUP_EMAIL_TO not set — skipping email.");
    return;
  }

  const totalRows = dumps.reduce((s, d) => s + d.rows, 0);
  const summary = dumps
    .map((d) => `  • ${d.table}: ${d.rows} rows`)
    .join("\n");

  const html = `
    <h2>Kids Camp Portal — недельный бэкап (${today})</h2>
    <p>Снапшот базы Turso с ${totalRows} записей суммарно.</p>
    <pre style="font: 13px/1.5 ui-monospace, Menlo, monospace; background:#f6f6f6; padding:12px; border-radius:6px;">${summary}</pre>
    <p style="font-size:13px; color:#555;">
      JSON и CSV файлы прикреплены. Сохрани это письмо — оно твоя
      резервная копия за ${today}. Восстановление: импорт CSV в Turso shell
      или Excel/Sheets для быстрого просмотра.
    </p>
    <hr/>
    <p style="font-size:12px; color:#888;">
      Авто-сообщение из GitHub Actions · kids-camp-portal
    </p>
  `;

  const attachments = dumps.flatMap((d) => [
    {
      filename: `${today}-${d.table}.json`,
      content: d.jsonBuf.toString("base64"),
    },
    {
      filename: `${today}-${d.table}.csv`,
      content: d.csvBuf.toString("base64"),
    },
  ]);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: `[Kids Camp] Бэкап ${today} — ${totalRows} записей`,
      html,
      attachments,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { id?: string };
  console.log(`Email sent to ${EMAIL_TO} (Resend id: ${data.id || "?"})`);
}

(async () => {
  try {
    const dumps = await Promise.all([
      dumpTable("Registration"),
      dumpTable("Team"),
      // Skip passwordHash from User — never back up live credentials.
      dumpTable("User", ["passwordHash"]),
    ]);

    for (const d of dumps) {
      console.log(`${d.table}: ${d.rows} rows -> ${d.csvPath}`);
    }

    await sendEmail(dumps);
    console.log("Backup complete.");
  } catch (e) {
    console.error("Backup failed:", e);
    process.exit(1);
  }
})();
