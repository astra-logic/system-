/**
 * Finding persistence — making a finding durable, traceable and reproducible.
 *
 * THE DEFECT THIS FIXES
 *
 * The Block 6 audit found twelve finding-model tables with zero rows and zero
 * write paths. Opportunities were computed in memory per request and discarded,
 * which made the D-011 lifecycle, baseline capture, D-022 verification and DP-07
 * adjudication impossible rather than merely un-UI'd.
 *
 * THE RULE THAT SHAPES THE DESIGN
 *
 * D-025 principle 4 and D-001: history is SUPERSEDED, never mutated. A re-run
 * therefore never updates a finding. It writes a NEW row and marks the previous
 * one superseded, so a figure once shown can always be reconstructed — the same
 * discipline the movement ledger applies to stock.
 *
 * Nothing here invents a domain concept. `runId`, `naturalKey`, `supersedesId`
 * and `isDemo` implement U-16's reproducible snapshot, finding identity across
 * runs, D-025's supersession, and Bible §47 respectively.
 */
import { and, eq, isNull, sql as raw } from "drizzle-orm";
import { db, sql } from "../db/client";
import {
  detectionRuns, evidenceGaps, gateResults, opportunities, opportunityEvidence, signatureDimensions,
} from "../db/schema";
import type { Money } from "../core/decimal";
import type { Envelope } from "../core/provenance";
import type { EvidenceGap, Opportunity } from "./findings";

/** The envelope, as stored. Decimals become strings so nothing is ever a float. */
function envelopeToJson(e: Envelope<Money>): Record<string, unknown> {
  return {
    value: e.value === null ? null : e.value.toFixed(),
    unit: e.unit,
    basis: e.basis,
    asOf: e.asOf.toISOString(),
    inputs: e.inputs.map((i) => ({ kind: i.kind, id: i.id, basis: i.basis, asOf: i.asOf.toISOString() })),
    assumptions: e.assumptions,
    coverage: e.coverage,
    limitations: e.limitations,
  };
}

export interface PersistInput {
  readonly siteId: string;
  readonly asOf: Date;
  readonly mechanism: string;
  readonly isDemo: boolean;
  readonly opportunities: readonly Opportunity[];
  readonly evidenceGaps: readonly EvidenceGap[];
}

export interface PersistResult {
  readonly runId: string;
  readonly written: number;
  readonly superseded: number;
  readonly unchanged: number;
}

/**
 * Write one detection run's findings.
 *
 * Idempotency is by CONTENT, not by re-running: if the newly computed finding is
 * identical to the current one for the same natural key, nothing is written and
 * nothing is superseded. Re-running detection on unchanged data therefore does
 * not accumulate rows — but a genuine change always produces a new version
 * beside the old one rather than overwriting it.
 */
export async function persistRun(input: PersistInput): Promise<PersistResult> {
  return db.transaction(async (tx) => {
    const [run] = await tx
      .insert(detectionRuns)
      .values({ siteId: input.siteId, asOf: input.asOf, mechanism: input.mechanism, isDemo: input.isDemo })
      .returning();
    const runId = run!.id;

    let written = 0;
    let superseded = 0;
    let unchanged = 0;

    for (const o of input.opportunities) {
      const naturalKey = o.id; // mechanism:subject — stable across runs
      const current = await tx
        .select()
        .from(opportunities)
        .where(and(eq(opportunities.naturalKey, naturalKey), isNull(opportunities.supersededAt)))
        .limit(1);

      const nextValues = {
        siteId: input.siteId,
        mechanism: o.mechanism,
        subjectItemId: o.signature.subject.itemId ?? null,
        subjectSupplierId: o.signature.subject.supplierId ?? null,
        title: o.title,
        statedIntervention: o.statedIntervention,
        counterfactual: o.counterfactual,
        lifecycle: o.lifecycle,
        evidenceStrength: o.evidenceStrength,
        ladder: o.ladder,
        recurringImpact: envelopeToJson(o.recurringImpact),
        oneTimeImpact: envelopeToJson(o.oneTimeImpact),
        incrementalCost: envelopeToJson(o.incrementalCost),
        netImpact: envelopeToJson(o.netImpact),
        netExcludesUnvaluedRisk: o.netExcludesUnvaluedRisk,
        findingOwner: o.findingOwner,
        actionOwner: o.actionOwner,
        dataOwner: o.dataOwner,
        effectiveAsOf: o.effectiveAsOf,
        runId,
        naturalKey,
        isDemo: input.isDemo,
      };

      const existing = current[0];
      if (existing && isMateriallyIdentical(existing, nextValues)) {
        unchanged++;
        continue;
      }

      /**
       * ⚠ A decided finding is NOT superseded by a re-run.
       *
       * Once a human has approved or rejected a claim, silently replacing it
       * with a recomputed version would destroy the link between the decision
       * and what was actually decided upon. The new version is written and left
       * unlinked, so the reviewer sees both and can act deliberately.
       */
      const decided = existing && existing.lifecycle !== "POTENTIAL";
      if (existing && !decided) {
        await tx.update(opportunities).set({ supersededAt: new Date() }).where(eq(opportunities.id, existing.id));
        superseded++;
      }

      const [row] = await tx
        .insert(opportunities)
        .values({ ...nextValues, supersedesId: existing && !decided ? existing.id : null })
        .returning();
      written++;

      // D-029: an Opportunity without a signature cannot be presented, so the
      // signature is written in the same transaction as the finding.
      await tx.insert(signatureDimensions).values(
        o.signature.effects.map((e) => ({
          opportunityId: row!.id,
          dimension: e.dimension,
          direction: e.direction,
          windowFrom: e.windowFrom,
          windowTo: e.windowTo,
        })),
      );

      await tx.insert(gateResults).values(
        o.gates.map((g) => ({ opportunityId: row!.id, gate: g.gate, outcome: g.outcome, detail: g.detail })),
      );

      // Capability 11: which recorded facts this figure rests on, queryable.
      const refs = [
        ...o.netImpact.inputs,
        ...o.recurringImpact.inputs,
        ...o.incrementalCost.inputs,
      ];
      const seen = new Set<string>();
      const unique = refs.filter((r) => {
        const k = `${r.kind}:${r.id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (unique.length > 0) {
        await tx.insert(opportunityEvidence).values(
          unique.map((r) => ({ opportunityId: row!.id, kind: r.kind, ref: r.id, basis: r.basis, asOf: r.asOf })),
        );
      }
    }

    for (const g of input.evidenceGaps) {
      const existing = await tx
        .select({ id: evidenceGaps.id })
        .from(evidenceGaps)
        .where(and(eq(evidenceGaps.naturalKey, g.id), isNull(evidenceGaps.supersededAt)))
        .limit(1);
      if (existing.length > 0) continue;
      await tx.insert(evidenceGaps).values({
        siteId: input.siteId,
        runId,
        naturalKey: g.id,
        missingEvidence: g.missingEvidence,
        factoryDataRef: g.factoryDataRef,
        blocks: g.blocks,
        observedSpend: g.observedSpend ? envelopeToJson(g.observedSpend) : null,
        dataOwner: g.dataOwner,
        isDemo: input.isDemo,
      });
    }

    return { runId, written, superseded, unchanged };
  });
}

/**
 * Two versions are the same finding when the CLAIM is the same.
 *
 * Deliberately excludes `runId` and timestamps: a re-run at a later wall-clock
 * time that produces the same claim from the same facts is not a new finding.
 * It includes every figure and every narrative element a reviewer would read,
 * so any change a human would notice produces a new version.
 */
function isMateriallyIdentical(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keys = [
    "title", "statedIntervention", "counterfactual", "ladder", "netExcludesUnvaluedRisk",
    "recurringImpact", "oneTimeImpact", "incrementalCost", "netImpact",
  ];
  return keys.every((k) => stable(a[k]) === stable(b[k]));
}

/**
 * Canonical serialisation with sorted keys.
 *
 * Postgres `jsonb` does not preserve key order, so a value written and read back
 * is equal in content and unequal under `JSON.stringify`. Comparing the raw
 * strings would report every re-run as a change and supersede a finding that had
 * not moved — filling the history with versions that differ only in key order.
 */
function stable(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stable(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
}

/* -------------------------------------------------------------------------- */
/* Reading back.                                                              */
/* -------------------------------------------------------------------------- */

export interface StoredOpportunity {
  id: string;
  naturalKey: string | null;
  mechanism: string;
  title: string;
  statedIntervention: string;
  counterfactual: string;
  lifecycle: string;
  ladder: string;
  recurringImpact: Record<string, unknown> | null;
  oneTimeImpact: Record<string, unknown> | null;
  incrementalCost: Record<string, unknown> | null;
  netImpact: Record<string, unknown> | null;
  netExcludesUnvaluedRisk: boolean;
  findingOwner: string | null;
  actionOwner: string | null;
  dataOwner: string | null;
  effectiveAsOf: Date;
  isDemo: boolean;
  supersedesId: string | null;
  supersededAt: Date | null;
  subjectItemId: string | null;
  itemCode?: string | null;
}

/** The current view: findings not yet superseded. Balances-of-the-ledger shaped. */
export async function currentOpportunities(siteId: string): Promise<StoredOpportunity[]> {
  const rows = await sql<Record<string, unknown>[]>`
    SELECT o.*, i.code AS "itemCode"
    FROM opportunities o
    LEFT JOIN items i ON i.id = o.subject_item_id
    WHERE o.site_id = ${siteId}::uuid AND o.superseded_at IS NULL
    ORDER BY o.detected_at DESC`;
  return rows.map(normaliseRow);
}

export async function getOpportunity(id: string): Promise<StoredOpportunity | null> {
  const rows = await sql<Record<string, unknown>[]>`
    SELECT o.*, i.code AS "itemCode"
    FROM opportunities o LEFT JOIN items i ON i.id = o.subject_item_id
    WHERE o.id = ${id}::uuid`;
  return rows[0] ? normaliseRow(rows[0]) : null;
}

/** The full version chain, newest first. History is readable, not merely retained. */
export async function versionHistory(naturalKey: string): Promise<StoredOpportunity[]> {
  const rows = await sql<Record<string, unknown>[]>`
    SELECT o.*, i.code AS "itemCode"
    FROM opportunities o LEFT JOIN items i ON i.id = o.subject_item_id
    WHERE o.natural_key = ${naturalKey}
    ORDER BY o.detected_at DESC`;
  return rows.map(normaliseRow);
}

export async function gatesFor(opportunityId: string) {
  return sql<{ gate: string; outcome: string; detail: string }[]>`
    SELECT gate, outcome, detail FROM gate_results WHERE opportunity_id = ${opportunityId}::uuid`;
}

export async function evidenceFor(opportunityId: string) {
  return sql<{ kind: string; ref: string; basis: string; as_of: string }[]>`
    SELECT kind, ref, basis, as_of::text FROM opportunity_evidence WHERE opportunity_id = ${opportunityId}::uuid`;
}

export async function signatureFor(opportunityId: string) {
  return sql<{ dimension: string; direction: string; window_from: string; window_to: string }[]>`
    SELECT dimension, direction, window_from::text, window_to::text
    FROM signature_dimensions WHERE opportunity_id = ${opportunityId}::uuid`;
}

export async function currentEvidenceGaps(siteId: string) {
  return sql<{ id: string; missing_evidence: string; factory_data_ref: string | null; blocks: string; observed_spend: Record<string, unknown> | null; is_demo: boolean }[]>`
    SELECT id, missing_evidence, factory_data_ref, blocks, observed_spend, is_demo
    FROM evidence_gaps WHERE site_id = ${siteId}::uuid AND superseded_at IS NULL`;
}

/** postgres.js returns snake_case; the app speaks camelCase. One place, not many. */
function normaliseRow(r: Record<string, unknown>): StoredOpportunity {
  const g = (a: string, b: string) => (r as never)[a] ?? (r as never)[b];
  return {
    id: r["id"] as string,
    naturalKey: g("naturalKey", "natural_key") as string | null,
    mechanism: r["mechanism"] as string,
    title: r["title"] as string,
    statedIntervention: g("statedIntervention", "stated_intervention") as string,
    counterfactual: r["counterfactual"] as string,
    lifecycle: r["lifecycle"] as string,
    ladder: r["ladder"] as string,
    recurringImpact: g("recurringImpact", "recurring_impact") as Record<string, unknown> | null,
    oneTimeImpact: g("oneTimeImpact", "one_time_impact") as Record<string, unknown> | null,
    incrementalCost: g("incrementalCost", "incremental_cost") as Record<string, unknown> | null,
    netImpact: g("netImpact", "net_impact") as Record<string, unknown> | null,
    netExcludesUnvaluedRisk: Boolean(g("netExcludesUnvaluedRisk", "net_excludes_unvalued_risk")),
    findingOwner: g("findingOwner", "finding_owner") as string | null,
    actionOwner: g("actionOwner", "action_owner") as string | null,
    dataOwner: g("dataOwner", "data_owner") as string | null,
    effectiveAsOf: new Date(String(g("effectiveAsOf", "effective_as_of"))),
    isDemo: Boolean(g("isDemo", "is_demo")),
    supersedesId: g("supersedesId", "supersedes_id") as string | null,
    supersededAt: g("supersededAt", "superseded_at") ? new Date(String(g("supersededAt", "superseded_at"))) : null,
    subjectItemId: g("subjectItemId", "subject_item_id") as string | null,
    itemCode: (r["itemCode"] ?? r["item_code"]) as string | null,
  };
}

export { raw };
