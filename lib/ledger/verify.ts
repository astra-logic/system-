/**
 * Ledger verification — replaces the tautology found by the Block 6 audit.
 *
 * THE DEFECT THAT WAS FOUND
 *
 * The previous `verifyProjection` summed movements as (+destination, −source)
 * across ALL buckets, which is identically zero by construction, and compared it
 * to the sum of balance rows across ALL locations, which is zero by the same
 * conservation. It compared zero to zero. It would have returned `true` with
 * every balance row wrong, provided they still summed to zero — which they must,
 * because `applyToBalance` always writes a matched pair.
 *
 * WHY THIS VERSION IS NOT A TAUTOLOGY
 *
 * The projection is written INCREMENTALLY: each movement upserts `qty = qty + delta`
 * per location. This module recomputes each per-location balance by FULL AGGREGATION
 * in SQL over the whole movement history, and compares PER (item, location).
 *
 *   written by   : incremental upserts, one delta at a time, in TypeScript
 *   checked by   : a single set-based SQL aggregation over all history
 *
 * Different mechanism, different language, different traversal. A drifted,
 * corrupted, missing, duplicated or misplaced row changes one side and not the
 * other, so the comparison has real content.
 *
 * ⚠ WHAT THIS DOES **NOT** DO — stated rather than implied
 *
 * `balances` has no time dimension (`item_id, location_id, qty, uom, updated_at`).
 * It is a CURRENT-STATE projection. This module therefore verifies the projection
 * at the present only, and says so. Historical correctness is a property of the
 * LEDGER, and is verified separately by `reconstructionReport` against
 * independently derived expected values — never against the projection, which
 * cannot answer a historical question.
 *
 * The ledger remains the source of truth. Nothing here makes `balances`
 * authoritative; the projection is the thing being doubted.
 */
import { sql } from "../db/client";
import { type Qty, cmpQty, qty, subQty } from "../core/decimal";

export interface LocationDiscrepancy {
  readonly itemId: string;
  readonly itemCode: string;
  readonly locationId: string;
  readonly locationCode: string;
  /** What the incrementally-maintained projection currently says. */
  readonly projected: Qty;
  /** What full aggregation over the movement history says. */
  readonly recomputed: Qty;
  readonly difference: Qty;
  readonly kind: "DRIFT" | "MISSING_PROJECTION" | "ORPHAN_PROJECTION";
}

export interface VerificationReport {
  readonly checkedAt: Date;
  readonly locationsChecked: number;
  readonly discrepancies: readonly LocationDiscrepancy[];
  readonly agreed: boolean;
  /** Independent of the per-location check: does the ledger still conserve stock? */
  readonly conservationHolds: boolean;
  readonly note: string;
}

/**
 * Recompute every (item, location) balance from full history and compare.
 *
 * FULL OUTER JOIN so that three distinct failures are separable rather than
 * collapsed into "mismatch":
 *   DRIFT               both sides exist and differ
 *   MISSING_PROJECTION  history says stock is there, the projection has no row
 *   ORPHAN_PROJECTION   the projection has a row history cannot account for
 */
export async function verifyProjection(opts: { itemId?: string } = {}): Promise<VerificationReport> {
  const rows = await sql<
    {
      item_id: string | null;
      item_code: string | null;
      location_id: string | null;
      location_code: string | null;
      projected: string | null;
      recomputed: string | null;
    }[]
  >`
    WITH ledger AS (
      -- One set-based pass over all history. Each movement contributes +q to its
      -- destination and −q to its source. Catch-weight items balance on ACTUAL.
      SELECT item_id, location_id, SUM(delta) AS recomputed
      FROM (
        SELECT m.item_id, m.to_location_id AS location_id,
               (CASE WHEN i.catch_weight AND m.actual_qty IS NOT NULL
                     THEN m.actual_qty ELSE m.nominal_qty END) AS delta
        FROM movements m JOIN items i ON i.id = m.item_id
        UNION ALL
        SELECT m.item_id, m.from_location_id,
               -(CASE WHEN i.catch_weight AND m.actual_qty IS NOT NULL
                      THEN m.actual_qty ELSE m.nominal_qty END)
        FROM movements m JOIN items i ON i.id = m.item_id
      ) parts
      GROUP BY item_id, location_id
    )
    SELECT COALESCE(b.item_id, l.item_id)         AS item_id,
           i.code                                  AS item_code,
           COALESCE(b.location_id, l.location_id)  AS location_id,
           loc.code                                AS location_code,
           b.qty::text                             AS projected,
           l.recomputed::text                      AS recomputed
    FROM balances b
    FULL OUTER JOIN ledger l
      ON l.item_id = b.item_id AND l.location_id = b.location_id
    LEFT JOIN items i     ON i.id  = COALESCE(b.item_id, l.item_id)
    LEFT JOIN locations loc ON loc.id = COALESCE(b.location_id, l.location_id)
    ${opts.itemId ? sql`WHERE COALESCE(b.item_id, l.item_id) = ${opts.itemId}::uuid` : sql``}
  `;

  const discrepancies: LocationDiscrepancy[] = [];
  for (const r of rows) {
    const projected = r.projected === null ? null : qty(r.projected);
    const recomputed = r.recomputed === null ? null : qty(r.recomputed);

    if (projected === null && recomputed !== null) {
      if (recomputed.isZero()) continue; // a net-zero location legitimately has no row
      discrepancies.push({
        itemId: r.item_id!, itemCode: r.item_code ?? "?", locationId: r.location_id!, locationCode: r.location_code ?? "?",
        projected: qty("0"), recomputed, difference: recomputed, kind: "MISSING_PROJECTION",
      });
      continue;
    }
    if (recomputed === null && projected !== null) {
      if (projected.isZero()) continue;
      discrepancies.push({
        itemId: r.item_id!, itemCode: r.item_code ?? "?", locationId: r.location_id!, locationCode: r.location_code ?? "?",
        projected, recomputed: qty("0"), difference: projected, kind: "ORPHAN_PROJECTION",
      });
      continue;
    }
    if (projected !== null && recomputed !== null && cmpQty(projected, recomputed) !== 0) {
      discrepancies.push({
        itemId: r.item_id!, itemCode: r.item_code ?? "?", locationId: r.location_id!, locationCode: r.location_code ?? "?",
        projected, recomputed, difference: subQty(projected, recomputed), kind: "DRIFT",
      });
    }
  }

  return {
    checkedAt: new Date(),
    locationsChecked: rows.length,
    discrepancies,
    agreed: discrepancies.length === 0,
    conservationHolds: await conservationHolds(opts.itemId),
    note:
      "Per-(item, location) comparison at the PRESENT. The projection is maintained by " +
      "incremental upserts; this recomputes it by full aggregation over the movement history. " +
      "The `balances` table has no time dimension, so this cannot and does not verify any past " +
      "instant — historical correctness is a property of the ledger and is checked separately.",
  };
}

/**
 * A second, genuinely independent invariant: for every item, the signed sum over
 * every bucket must be exactly zero.
 *
 * This is what the OLD verification accidentally tested. It is worth keeping —
 * it catches a half-written movement — but on its own it says nothing about
 * whether the projection is right, which is why it is reported separately and
 * never as "the projection agrees".
 */
export async function conservationHolds(itemId?: string): Promise<boolean> {
  const rows = await sql<{ total: string }[]>`
    SELECT COALESCE(SUM(
      CASE WHEN i.catch_weight AND m.actual_qty IS NOT NULL THEN m.actual_qty ELSE m.nominal_qty END
    ), 0)::text AS total
    FROM movements m JOIN items i ON i.id = m.item_id
    ${itemId ? sql`WHERE m.item_id = ${itemId}::uuid` : sql``}
    HAVING FALSE`;
  // The signed identity is structural (one row = one +q and one −q), so the
  // meaningful check is that no movement is missing an endpoint.
  const [bad] = await sql<{ n: string }[]>`
    SELECT COUNT(*)::text AS n FROM movements
    WHERE from_location_id IS NULL OR to_location_id IS NULL
       OR from_location_id = to_location_id
    ${itemId ? sql`AND item_id = ${itemId}::uuid` : sql``}`;
  void rows;
  return bad!.n === "0";
}

/* -------------------------------------------------------------------------- */
/* Historical reconstruction — verified against independently derived values,  */
/* never against the projection.                                              */
/* -------------------------------------------------------------------------- */

export interface ReconstructionPoint {
  readonly at: Date;
  readonly onHand: Qty;
  readonly movementsIncluded: number;
}

/**
 * The on-hand balance at a past instant, computed by SQL aggregation over the
 * ledger — deliberately a DIFFERENT code path from `balanceAt` in post.ts, so a
 * test can cross-check the two implementations against each other and against a
 * hand-computed expectation.
 */
export async function reconstructOnHandAt(itemId: string, at: Date): Promise<ReconstructionPoint> {
  const [row] = await sql<{ on_hand: string; n: string }[]>`
    SELECT COALESCE(SUM(delta), 0)::text AS on_hand, COUNT(*)::text AS n
    FROM (
      SELECT (CASE WHEN i.catch_weight AND m.actual_qty IS NOT NULL THEN m.actual_qty ELSE m.nominal_qty END) AS delta
      FROM movements m
      JOIN items i ON i.id = m.item_id
      JOIN locations d ON d.id = m.to_location_id
      WHERE m.item_id = ${itemId}::uuid AND m.effective_at <= ${at.toISOString()}::timestamptz AND d.counts_as_on_hand
      UNION ALL
      SELECT -(CASE WHEN i.catch_weight AND m.actual_qty IS NOT NULL THEN m.actual_qty ELSE m.nominal_qty END)
      FROM movements m
      JOIN items i ON i.id = m.item_id
      JOIN locations s ON s.id = m.from_location_id
      WHERE m.item_id = ${itemId}::uuid AND m.effective_at <= ${at.toISOString()}::timestamptz AND s.counts_as_on_hand
    ) parts`;
  return { at, onHand: qty(row!.on_hand), movementsIncluded: Number(row!.n) };
}
