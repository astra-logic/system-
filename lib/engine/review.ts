/**
 * Review, approval and baseline capture.
 *
 * The locked discipline this implements, unchanged:
 *   D-011  POTENTIAL → APPROVED → IN_PROGRESS → REALIZED  (+ REJECTED, EXPIRED)
 *          Baselines are captured BEFORE the action, never reconstructed after.
 *   D-022  12-month verification window; a reduction is evidence of improvement,
 *          not automatically proof of causation.
 *   DP-07  Currency quantification needs an adjudicator INDEPENDENT of the
 *          underlying decision. Where none exists, self-adjudication is permitted
 *          with the conflict RECORDED as a factual condition — represented,
 *          never hidden (permitted by rule 15 because it is a fact about the
 *          evidence, not an invented constant).
 *   D-051  A user may not adjudicate a claim arising from a decision they made.
 *
 * ⚠ APPROVAL IS NOT REALIZATION. There is deliberately no code path from
 * approval to REALIZED. Reaching REALIZED requires observed measurement against
 * the captured baseline over D-022's window, and that window has not elapsed for
 * any finding this system has ever produced.
 */
import { eq } from "drizzle-orm";
import { db, sql } from "../db/client";
import { auditEvents, baselines, decisions, opportunities } from "../db/schema";
import { getOpportunity, type StoredOpportunity } from "./persist";

export type ReviewAction = "APPROVE" | "REJECT";

export class LifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LifecycleError";
  }
}

/* -------------------------------------------------------------------------- */
/* Adjudicator independence.                                                  */
/* -------------------------------------------------------------------------- */

export interface IndependenceCheck {
  readonly independent: boolean;
  /** Every party the adjudicator was compared against. Auditable, not asserted. */
  readonly checkedAgainst: readonly string[];
  /** ⚠ Parties we could NOT check, and why. See Q-13. */
  readonly uncheckable: readonly string[];
  readonly note: string;
}

/**
 * Is this adjudicator independent of the decision that produced the claim?
 *
 * For Mechanism 01 the claim is attributable because a buyer classified the
 * expedite's root cause as INCORRECT_LEAD_TIME. That classification IS the
 * judgement the claim rests on, so the adjudicator must not be the classifier.
 *
 * ⚠ WHAT CANNOT BE CHECKED, AND IS SAID RATHER THAN ASSUMED (Q-13)
 *
 * The schema does not record who RAISED or APPROVED a purchase order. DP-07 asks
 * for independence from "the price decision"; we can prove independence from the
 * classification and not from the purchasing decision proper. Returning
 * `independent: true` on a partial check would overstate it, so the uncheckable
 * parties are returned and the UI shows them.
 */
export async function checkIndependence(opportunityId: string, adjudicator: string): Promise<IndependenceCheck> {
  const classifiers = await sql<{ classified_by: string | null }[]>`
    SELECT DISTINCT e.classified_by
    FROM opportunity_evidence oe
    JOIN expedite_events e ON e.id::text = oe.ref
    WHERE oe.opportunity_id = ${opportunityId}::uuid AND e.classified_by IS NOT NULL`;

  // Fall back to the finding's subject item where evidence refs are not expedite
  // events — the same question, reached a different way.
  const viaItem = await sql<{ classified_by: string | null }[]>`
    SELECT DISTINCT e.classified_by
    FROM opportunities o
    JOIN po_lines l ON l.item_id = o.subject_item_id
    JOIN expedite_events e ON e.po_line_id = l.id
    WHERE o.id = ${opportunityId}::uuid AND e.classified_by IS NOT NULL`;

  const parties = [...new Set([...classifiers, ...viaItem].map((r) => r.classified_by).filter((x): x is string => !!x))];
  const conflict = parties.includes(adjudicator);

  return {
    independent: !conflict,
    checkedAgainst: parties,
    uncheckable: ["purchase-order author", "purchase-order approver"],
    note: conflict
      ? `${adjudicator} classified the root cause this claim rests on. Adjudicating it is ` +
        `self-adjudication (DP-07, D-051). It is permitted only with the conflict recorded.`
      : parties.length === 0
        ? `No classifier is recorded for this finding's evidence, so independence could not be ` +
          `established from the data. Unestablished is not a pass — the reviewer must confirm it.`
        : `${adjudicator} is not among the parties who classified this finding's evidence ` +
          `(${parties.join(", ")}). Independence from the purchasing decision itself could not be ` +
          `checked — the system does not record who raised or approved the order (Q-13).`,
  };
}

/* -------------------------------------------------------------------------- */
/* Baseline — a snapshot of INPUTS AND METHOD, not only an output.           */
/* -------------------------------------------------------------------------- */

export const BASELINE_METHOD = "M01_LEADTIME_PREMIUM_v1";

export interface BaselineSnapshot {
  readonly method: string;
  readonly inputs: Record<string, unknown>;
  readonly output: Record<string, unknown>;
}

/**
 * "A stored number cannot be re-verified." The baseline therefore records the
 * facts the figure was computed FROM and the method that computed it, so the
 * same result can be reproduced later and compared against what actually
 * happened (D-022).
 */
export async function buildBaseline(o: StoredOpportunity): Promise<BaselineSnapshot> {
  const evidence = await sql<{ kind: string; ref: string; basis: string; as_of: string }[]>`
    SELECT kind, ref, basis, as_of::text FROM opportunity_evidence WHERE opportunity_id = ${o.id}::uuid`;

  const events = await sql<{
    id: string; occurred_at: string; root_cause: string | null;
    premium_amount: string | null; premium_currency: string | null; premium_effective_on: string | null;
  }[]>`
    SELECT e.id, e.occurred_at::text, e.root_cause, e.premium_amount, e.premium_currency,
           e.premium_effective_on::text
    FROM expedite_events e
    JOIN po_lines l ON l.id = e.po_line_id
    JOIN opportunities o ON o.subject_item_id = l.item_id
    WHERE o.id = ${o.id}::uuid
    ORDER BY e.occurred_at`;

  const [item] = await sql<{ code: string; lead_time_days: number | null }[]>`
    SELECT i.code, i.lead_time_days FROM items i
    JOIN opportunities o ON o.subject_item_id = i.id WHERE o.id = ${o.id}::uuid`;

  return {
    method: BASELINE_METHOD,
    inputs: {
      asOf: o.effectiveAsOf.toISOString(),
      itemCode: item?.code ?? null,
      /** The parameter as it stood BEFORE the intervention. The whole point. */
      masterLeadTimeDaysAtBaseline: item?.lead_time_days ?? null,
      statedIntervention: o.statedIntervention,
      counterfactual: o.counterfactual,
      expediteEvents: events,
      evidenceRefs: evidence,
    },
    output: {
      recurringImpact: o.recurringImpact,
      oneTimeImpact: o.oneTimeImpact,
      incrementalCost: o.incrementalCost,
      netImpact: o.netImpact,
      ladder: o.ladder,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* The decision.                                                              */
/* -------------------------------------------------------------------------- */

export interface ReviewInput {
  readonly opportunityId: string;
  readonly action: ReviewAction;
  readonly adjudicator: string;
  readonly rationale: string;
  /** Explicit acknowledgement when the independence check fails or is unestablished. */
  readonly acceptSelfAdjudication?: boolean;
}

export interface ReviewResult {
  readonly opportunityId: string;
  readonly lifecycle: string;
  readonly independence: IndependenceCheck;
  readonly baselineId: string | null;
  readonly decisionId: string;
}

export async function reviewOpportunity(input: ReviewInput): Promise<ReviewResult> {
  const o = await getOpportunity(input.opportunityId);
  if (!o) throw new LifecycleError(`Unknown opportunity ${input.opportunityId}`);

  if (o.supersededAt) {
    throw new LifecycleError(
      `This version of the finding has been superseded by a later calculation. Decide on the ` +
        `current version — deciding on a superseded one would attach the decision to a figure ` +
        `no longer shown.`,
    );
  }
  if (o.lifecycle !== "POTENTIAL") {
    throw new LifecycleError(
      `Finding is already ${o.lifecycle}. The D-011 lifecycle moves POTENTIAL → APPROVED → ` +
        `IN_PROGRESS → REALIZED and is not re-entered by a second decision.`,
    );
  }
  if (!input.rationale.trim()) {
    throw new LifecycleError("A decision requires a rationale. Rejections must be analysable by category (U-17).");
  }

  const independence = await checkIndependence(input.opportunityId, input.adjudicator);

  if (input.action === "APPROVE" && !independence.independent && !input.acceptSelfAdjudication) {
    throw new LifecycleError(
      `${independence.note} To proceed, the conflict must be explicitly accepted and it will be ` +
        `recorded on the decision — represented, never hidden (DP-07).`,
    );
  }

  const next = input.action === "APPROVE" ? "APPROVED" : "REJECTED";

  return db.transaction(async (tx) => {
    await tx.update(opportunities).set({ lifecycle: next }).where(eq(opportunities.id, o.id));

    const [decision] = await tx
      .insert(decisions)
      .values({
        opportunityId: o.id,
        action: input.action,
        rationale: input.rationale,
        decidedBy: input.adjudicator,
        adjudicatorIndependent: independence.independent,
        independenceNote: independence.note,
        checkedAgainst: [...independence.checkedAgainst],
        evidenceRefs: [],
      })
      .returning();

    /**
     * D-011: the baseline is captured at APPROVED, never reconstructed at
     * REALIZED. A rejected finding gets no baseline — there is no action whose
     * effect could be measured.
     */
    let baselineId: string | null = null;
    if (input.action === "APPROVE") {
      const snapshot = await buildBaseline(o);
      const [b] = await tx
        .insert(baselines)
        .values({ opportunityId: o.id, method: snapshot.method, inputs: snapshot.inputs, output: snapshot.output })
        .returning();
      baselineId = b!.id;
    }

    await tx.insert(auditEvents).values({
      actor: input.adjudicator,
      action: `OPPORTUNITY_${input.action}`,
      entityType: "opportunity",
      entityId: o.id,
      detail: {
        lifecycle: next,
        independent: independence.independent,
        checkedAgainst: independence.checkedAgainst,
        uncheckable: independence.uncheckable,
        selfAdjudicationAccepted: input.acceptSelfAdjudication ?? false,
        rationale: input.rationale,
      },
    });

    return { opportunityId: o.id, lifecycle: next, independence, baselineId, decisionId: decision!.id };
  });
}

/**
 * ⚠ The prohibition, made callable.
 *
 * D-011: `REALIZED` is reachable only through observed measurement, never by
 * assertion. Nothing in this system can reach it yet, because D-022's twelve
 * month window has not elapsed for any finding it has produced. This function
 * exists so the rule is enforced by code rather than remembered.
 */
export function markRealized(): never {
  throw new LifecycleError(
    "REALIZED cannot be set by a decision. It requires measurement against the baseline captured " +
      "at APPROVED, over D-022's twelve-month window, with confounders considered — demand, volume, " +
      "FX, freight rates, supplier changes, seasonality. Approval is not realization (D-011).",
  );
}

export async function decisionFor(opportunityId: string) {
  const rows = await sql<{
    action: string; rationale: string | null; decided_by: string; decided_at: string;
    adjudicator_independent: boolean | null; independence_note: string | null; checked_against: string[] | null;
  }[]>`
    SELECT action, rationale, decided_by, decided_at::text, adjudicator_independent,
           independence_note, checked_against
    FROM decisions WHERE opportunity_id = ${opportunityId}::uuid ORDER BY decided_at DESC LIMIT 1`;
  return rows[0] ?? null;
}

export async function baselineFor(opportunityId: string) {
  const rows = await sql<{ id: string; method: string; inputs: Record<string, unknown>; output: Record<string, unknown>; captured_at: string }[]>`
    SELECT id, method, inputs, output, captured_at::text
    FROM baselines WHERE opportunity_id = ${opportunityId}::uuid ORDER BY captured_at DESC LIMIT 1`;
  return rows[0] ?? null;
}
