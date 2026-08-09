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
 * postgres.js returns `numeric` as a STRING by default, which is exactly what
 * D-047's containment requires — no parser is registered for it, so there is no
 * path by which an exact column becomes a JS float. `assertNumericIsString`
 * below turns that default into a checked guarantee rather than a hope.
 */
export const sql = postgres(url, {
  max: 10,
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
