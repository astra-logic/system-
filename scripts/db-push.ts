/**
 * Applies generated DDL, once each.
 *
 * A `_migrations` ledger records what has run, so re-running is a no-op rather
 * than an error. Same discipline as the movement ledger: append-only, and
 * identity decides whether something has already happened.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "../lib/db/client";

const dir = new URL("../drizzle/", import.meta.url).pathname;

await sql`CREATE TABLE IF NOT EXISTS _migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const applied = new Set(
  (await sql<{ filename: string }[]>`SELECT filename FROM _migrations`).map((r) => r.filename),
);

const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  if (applied.has(f)) {
    console.log("skip   ", f);
    continue;
  }
  const ddl = readFileSync(join(dir, f), "utf8");
  for (const stmt of ddl.split("--> statement-breakpoint")) {
    const s = stmt.trim();
    if (s) await sql.unsafe(s);
  }
  await sql`INSERT INTO _migrations (filename) VALUES (${f})`;
  console.log("applied", f);
}
await sql.end();
