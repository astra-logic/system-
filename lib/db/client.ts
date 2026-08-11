/**
 * Database client.
 *
 * D-047: `numeric` is returned as a STRING and never parsed to a JS number.
 * postgres.js does this by default for numeric/decimal; the assertion below
 * makes the guarantee a test rather than a hope.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/mos";

/**
 * ⚠ SERVERLESS CHANGES WHAT A CONNECTION POOL MEANS.
 *
 * On a long-lived server, ten pooled connections shared by every request is
 * right. On a serverless platform each concurrent request may be its own
 * instance, so "ten each" multiplies by the number of instances and exhausts
 * the database's connection limit under load — the classic failure that only
 * appears once more than one person uses the deployment.
 *
 * So the pool collapses to one connection per instance, and idle connections
 * are released quickly rather than held for an instance that may never be
 * invoked again.
 */
const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * ⚠ A TRANSACTION-MODE POOLER CANNOT HOLD A PREPARED STATEMENT.
 *
 * Hosted Postgres (Neon's `-pooler` endpoint, Supabase's port 6543, anything
 * fronted by PgBouncer in transaction mode) hands a different backend to each
 * transaction. postgres.js prepares its tagged queries by default, and the
 * prepared statement does not survive that hand-off — the deployment fails with
 * "prepared statement already exists" under exactly the concurrency it was
 * pooled to handle.
 *
 * Detected from the connection string rather than assumed, so a direct
 * connection keeps prepared statements and their performance.
 */
const pooled = /-pooler|pgbouncer=true|:6543\//.test(url);

/**
 * postgres.js returns `numeric` as a STRING by default, which is exactly what
 * D-047's containment requires — no parser is registered for it, so there is no
 * path by which an exact column becomes a JS float. `assertNumericIsString`
 * below turns that default into a checked guarantee rather than a hope.
 *
 * ⚠ None of the options below touch type parsing. `prepare: false` changes how
 * a statement is sent, not how a value is decoded, so D-047 holds either way —
 * and the assertion proves it rather than trusting this comment.
 */
export const sql = postgres(url, {
  max: serverless ? 1 : 10,
  idle_timeout: serverless ? 20 : undefined,
  connect_timeout: 15,
  prepare: !pooled,
  transform: { undefined: null },
});

/** Called by the test suite. A regression here silently corrupts every figure. */
export async function assertNumericIsString(): Promise<void> {
  const [row] = await sql<{ v: unknown }[]>`SELECT 0.1::numeric + 0.2::numeric AS v`;
  if (typeof row!.v !== "string") {
    throw new Error(
      `The driver returned numeric as ${typeof row!.v}. Money and quantity would be silently ` +
        `corrupted by binary floating point (D-047). Refusing to proceed.`,
    );
  }
}

export const db = drizzle(sql, { schema });
export { schema };
