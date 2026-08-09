/** Applies generated DDL. No migration tooling needed for the MVP; drizzle-kit
 *  takes over when migrations start to matter. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "../lib/db/client";

const dir = new URL("../drizzle/", import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  const ddl = readFileSync(join(dir, f), "utf8");
  for (const stmt of ddl.split("--> statement-breakpoint")) {
    const s = stmt.trim();
    if (s) await sql.unsafe(s);
  }
  console.log("applied", f);
}
await sql.end();
