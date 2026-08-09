/**
 * Turn a stored finding back into the in-memory Opportunity the aggregator reads.
 *
 * The headline is computed from PERSISTED findings, so what a manager sees is
 * what was recorded — not a fresh computation that happens to agree. Rehydration
 * is a pure mapping: it revives the envelopes exactly as written, including
 * `INSUFFICIENT_DATA` and its reasons, and invents nothing that was not stored.
 */
import { money } from "../core/decimal";
import type { Basis, Envelope } from "../core/provenance";
import type { Money } from "../core/decimal";
import type { Opportunity } from "./findings";
import type { StoredOpportunity } from "./persist";

function toEnvelope(j: Record<string, unknown> | null, fallbackUnit = "EGP"): Envelope<Money> {
  if (!j) {
    return { value: null, unit: fallbackUnit, basis: "INSUFFICIENT_DATA", asOf: new Date(),
             inputs: [], assumptions: [], coverage: [], limitations: ["not recorded"] };
  }
  const v = j["value"] as string | null;
  return {
    value: v === null ? null : money(v),
    unit: String(j["unit"] ?? fallbackUnit),
    basis: String(j["basis"] ?? "INSUFFICIENT_DATA") as Basis,
    asOf: new Date(String(j["asOf"] ?? new Date().toISOString())),
    inputs: [],
    assumptions: (j["assumptions"] as string[]) ?? [],
    coverage: (j["coverage"] as string[]) ?? [],
    limitations: (j["limitations"] as string[]) ?? [],
  };
}

export function rehydrate(s: StoredOpportunity): Opportunity {
  return {
    class: "OPPORTUNITY",
    id: s.id,
    mechanism: s.mechanism,
    title: s.title,
    statedIntervention: s.statedIntervention,
    counterfactual: s.counterfactual,
    lifecycle: s.lifecycle as Opportunity["lifecycle"],
    evidenceStrength: null,
    ladder: s.ladder as Opportunity["ladder"],
    gates: [],
    recurringImpact: toEnvelope(s.recurringImpact),
    oneTimeImpact: toEnvelope(s.oneTimeImpact),
    incrementalCost: toEnvelope(s.incrementalCost),
    netImpact: toEnvelope(s.netImpact),
    netExcludesUnvaluedRisk: s.netExcludesUnvaluedRisk,
    signature: { subject: { type: "ITEM", itemId: s.subjectItemId ?? "" }, effects: [] },
    findingOwner: s.findingOwner,
    actionOwner: s.actionOwner,
    dataOwner: s.dataOwner,
    effectiveAsOf: s.effectiveAsOf,
  };
}
