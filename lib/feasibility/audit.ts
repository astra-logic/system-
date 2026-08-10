/**
 * The audit record — D-055.
 *
 * ⚠⚠ THE ONE RULE THAT MATTERS HERE:
 *
 *     NO CALCULATION MAY JOIN TO `feasibility_answers`.
 *
 * This module is the ONLY writer, and the only reader is `recentAnswers`, which
 * exists to let a human answer "why did we buy that?" six months later. Nothing
 * in the saving engine, the ledger, or reorder-point planning may read it.
 *
 * Why the rule carries so much weight: D-050 dissolves A-02 — a Block 4 class A
 * blocker — on the premise that "nothing in the MVP can create a commitment".
 * An answer any calculation could read would be the first commitment source in
 * the system, reopening A-02 and making `Available` untruthful. The transience
 * is what holds a locked decision up.
 *
 * Answers are SNAPSHOTS. Re-asking writes a new row; a stored answer is never
 * updated in place. A saved answer that changed beneath a user who had already
 * acted on it would be worse than a stale one.
 */
import { toDb } from "../core/decimal";
import { db } from "../db/client";
import { feasibilityAnswers } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import type { FeasibilityAnswer } from "./engine";
import { headline, missingLines, reason } from "./language";

/**
 * What is stored: the question, the answer as the user saw it, and enough of the
 * derivation to reconstruct why. Not demand, not a plan, not a scenario.
 */
export interface StoredAnswer {
  readonly headline: string;
  readonly reason: string;
  readonly verdict: string;
  readonly missing: readonly { code: string; missing: string; action: string | null }[];
  readonly assumptions: readonly string[];
  readonly components: readonly {
    code: string; verdict: string;
    requirement: string | null; available: string | null; incoming: string | null;
    shortfall: string | null; uom: string; cantSayReason: string | null;
  }[];
}

export async function recordAnswer(
  a: FeasibilityAnswer,
  ctx: { siteId: string; askedBy: string },
): Promise<{ id: string }> {
  const stored: StoredAnswer = {
    headline: headline(a),
    reason: reason(a),
    verdict: a.verdict,
    missing: missingLines(a).map((m) => ({ code: m.code, missing: m.missing, action: m.action })),
    assumptions: [...a.assumptions],
    components: a.components.map((c) => ({
      code: c.code,
      verdict: c.verdict,
      requirement: c.requirement.value ? toDb(c.requirement.value) : null,
      available: c.available ? toDb(c.available) : null,
      incoming: c.incoming ? toDb(c.incoming) : null,
      shortfall: c.shortfall ? toDb(c.shortfall) : null,
      uom: c.stockUom,
      cantSayReason: c.cantSayReason,
    })),
  };

  const [row] = await db
    .insert(feasibilityAnswers)
    .values({
      siteId: ctx.siteId,
      askedBy: ctx.askedBy,
      productItemId: a.productItemId,
      requestedQty: toDb(a.requestedQty),
      needByDate: a.needBy ? a.needBy.toISOString().slice(0, 10) : null,
      verdict: a.verdict,
      answer: stored,
      asOf: a.asOf,
      /* Code standard 13 as corrected: which recipe version produced this, so a
         later answer that differs is explainable as a DIFFERENT answer rather
         than a wrong one. Falls back to the answer's own effective time when the
         product had no recipe at all. */
      structureAsOf: a.structureAsOf ?? a.asOf,
      isDemo: a.isDemo,
    })
    .returning({ id: feasibilityAnswers.id });

  return { id: row!.id };
}

/** The ONLY read path. For humans reading an audit trail — never for a calculation. */
export async function recentAnswers(limit = 20): Promise<
  { id: string; askedBy: string; askedAt: Date; verdict: string; requestedQty: string; isDemo: boolean; productItemId: string }[]
> {
  return db
    .select({
      id: feasibilityAnswers.id,
      askedBy: feasibilityAnswers.askedBy,
      askedAt: feasibilityAnswers.askedAt,
      verdict: feasibilityAnswers.verdict,
      requestedQty: feasibilityAnswers.requestedQty,
      isDemo: feasibilityAnswers.isDemo,
      productItemId: feasibilityAnswers.productItemId,
    })
    .from(feasibilityAnswers)
    .orderBy(desc(feasibilityAnswers.askedAt))
    .limit(limit);
}

export async function answerById(id: string): Promise<{ answer: StoredAnswer; askedAt: Date } | null> {
  const [row] = await db
    .select({ answer: feasibilityAnswers.answer, askedAt: feasibilityAnswers.askedAt })
    .from(feasibilityAnswers)
    .where(eq(feasibilityAnswers.id, id));
  return row ? { answer: row.answer as StoredAnswer, askedAt: row.askedAt } : null;
}
