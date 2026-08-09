/**
 * Contradiction evaluation over PERSISTED findings — D-029.
 *
 * THE DEFECT THIS FIXES
 *
 * The Block 6 audit found that contradiction detection could not fire in the
 * live application: opportunities existed only in memory for one request, and
 * one mechanism emits at most one opportunity per item, so two findings never
 * coexisted to be compared.
 *
 * THE FIX, AND WHAT IT DELIBERATELY IS NOT
 *
 * The rule is unchanged. No mechanism was invented to manufacture a conflict and
 * no threshold was relaxed to make one trigger. What changed is that findings now
 * PERSIST, so the service can compare whatever genuinely coexists — from any
 * mechanism, present or future.
 *
 * With one mechanism in the MVP the live answer will legitimately be zero. That
 * is a fact about the current scope, not evidence the control works — which is
 * exactly why the tests construct two findings that genuinely conflict and prove
 * the service blocks them.
 */
import { sql } from "../db/client";
import { type Contradiction, detectContradictions, type InterventionSignature } from "./signature";

export interface EvaluatedContradiction extends Contradiction {
  readonly leftTitle: string;
  readonly rightTitle: string;
  readonly resolved: boolean;
  readonly resolution: string | null;
}

export interface ContradictionReport {
  readonly evaluated: number;
  readonly contradictions: readonly EvaluatedContradiction[];
  /**
   * D-029: opposed actions must resolve — net, suspend, supersede or adjudicate —
   * BEFORE presentation. Any unresolved conflict blocks release of BOTH sides,
   * because presenting either alone would hide that it cannot be executed
   * alongside the other.
   */
  readonly blockedOpportunityIds: readonly string[];
  readonly note: string;
}

/**
 * Load current findings with their signatures and compare them.
 *
 * Only non-superseded findings participate: a superseded version is history, and
 * history cannot contradict a live recommendation.
 */
export async function evaluateContradictions(siteId: string): Promise<ContradictionReport> {
  const rows = await sql<{
    id: string; title: string; subject_item_id: string | null; subject_supplier_id: string | null;
    dimension: string | null; direction: string | null; window_from: string | null; window_to: string | null;
  }[]>`
    SELECT o.id, o.title, o.subject_item_id, o.subject_supplier_id,
           s.dimension, s.direction, s.window_from::text, s.window_to::text
    FROM opportunities o
    LEFT JOIN signature_dimensions s ON s.opportunity_id = o.id
    WHERE o.site_id = ${siteId}::uuid
      AND o.superseded_at IS NULL
      AND o.lifecycle NOT IN ('REJECTED', 'EXPIRED')`;

  const byId = new Map<string, { id: string; title: string; signature: InterventionSignature }>();
  for (const r of rows) {
    if (!byId.has(r.id)) {
      byId.set(r.id, {
        id: r.id,
        title: r.title,
        signature: {
          subject: {
            type: r.subject_item_id ? "ITEM" : "SUPPLIER",
            ...(r.subject_item_id ? { itemId: r.subject_item_id } : {}),
            ...(r.subject_supplier_id ? { supplierId: r.subject_supplier_id } : {}),
          },
          effects: [],
        },
      });
    }
    if (r.dimension && r.direction && r.window_from && r.window_to) {
      const entry = byId.get(r.id)!;
      (entry.signature.effects as unknown[]).push({
        dimension: r.dimension,
        direction: r.direction,
        windowFrom: new Date(r.window_from),
        windowTo: new Date(r.window_to),
      });
    }
  }

  const candidates = [...byId.values()];
  const raw = detectContradictions(candidates.map((c) => ({ id: c.id, signature: c.signature })));

  const existing = await sql<{ left_opportunity_id: string; right_opportunity_id: string; dimension: string; resolution: string | null }[]>`
    SELECT left_opportunity_id, right_opportunity_id, dimension, resolution FROM contradictions`;
  const resolvedKey = new Set(
    existing.filter((e) => e.resolution).map((e) => `${e.left_opportunity_id}|${e.right_opportunity_id}|${e.dimension}`),
  );

  const evaluated: EvaluatedContradiction[] = raw.map((c) => {
    const key = `${c.leftId}|${c.rightId}|${c.dimension}`;
    const resolution = existing.find((e) => `${e.left_opportunity_id}|${e.right_opportunity_id}|${e.dimension}` === key)?.resolution ?? null;
    return {
      ...c,
      leftTitle: byId.get(c.leftId)?.title ?? c.leftId,
      rightTitle: byId.get(c.rightId)?.title ?? c.rightId,
      resolved: resolvedKey.has(key),
      resolution,
    };
  });

  const blocked = new Set<string>();
  for (const c of evaluated) {
    if (!c.resolved) {
      blocked.add(c.leftId);
      blocked.add(c.rightId);
    }
  }

  return {
    evaluated: candidates.length,
    contradictions: evaluated,
    blockedOpportunityIds: [...blocked],
    note:
      candidates.length < 2
        ? "Fewer than two findings coexist, so no comparison is possible. This is a fact about " +
          "current scope, not evidence that contradiction control works."
        : `${candidates.length} findings compared on subject, dimension, direction and window. ` +
          `A conflict requires all four to intersect.`,
  };
}

/** Persist a detected conflict so its resolution is auditable, not a UI state. */
export async function recordContradictions(report: ContradictionReport): Promise<number> {
  let written = 0;
  for (const c of report.contradictions) {
    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM contradictions
      WHERE left_opportunity_id = ${c.leftId}::uuid AND right_opportunity_id = ${c.rightId}::uuid
        AND dimension = ${c.dimension}`;
    if (existing) continue;
    await sql`
      INSERT INTO contradictions (left_opportunity_id, right_opportunity_id, dimension)
      VALUES (${c.leftId}::uuid, ${c.rightId}::uuid, ${c.dimension})`;
    written++;
  }
  return written;
}

/**
 * D-029's four allowed resolutions. Which applies when is W-24, deliberately
 * deferred to the first real conflict — so the type constrains the answer
 * without inventing it.
 */
export type Resolution = "NET" | "SUSPEND" | "SUPERSEDE" | "ADJUDICATE";

export async function resolveContradiction(
  leftId: string, rightId: string, dimension: string, resolution: Resolution, by: string,
): Promise<void> {
  await sql`
    UPDATE contradictions SET resolution = ${resolution}, resolved_by = ${by}, resolved_at = now()
    WHERE left_opportunity_id = ${leftId}::uuid AND right_opportunity_id = ${rightId}::uuid
      AND dimension = ${dimension}`;
}
