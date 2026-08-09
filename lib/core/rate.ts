/**
 * Financial rates — D-023 as amended, and D-014 rule 10 as amended.
 *
 * Three distinct requirements, and the third was covered nowhere until Block 2:
 *   1. Never invent a rate.                    (D-023 as originally locked)
 *   2. Use an authoritative, owned rate.       (implied by 1)
 *   3. Use a rate APPROPRIATE TO THE DECISION. (D-023 as amended)
 *
 * Two demonstrations that 3 is distinct — both pass 1 and 2 and give a wrong answer:
 *   - a finance VALUATION rate is authoritative and inappropriate for a marginal decision
 *   - a carrying rate CONTAINING OBSOLESCENCE is authoritative and contains a risk
 *     we are forbidden to net (D-031)
 *
 * Hence `purpose` is STRUCTURED, not free text: a mechanism must be able to MATCH
 * against it. Block 1 thought this might be derivable from D-002's `limitations`;
 * Block 2 changed that conclusion, because a mechanism cannot match against prose,
 * and DP-15's obsolescence case demands BLOCKING rather than disclosure.
 *
 * Code standards 10d, 10d-1, 10d-2, 10d-4.
 */
import type { Rate } from "./decimal";
import { type Basis, type Envelope, insufficient, value } from "./provenance";

/**
 * What a rate was CONSTRUCTED FOR — stated by whoever owns it, never inferred.
 * Where finance has never been asked, that is an EVIDENCE GAP (F-08), not a default.
 */
export const RATE_PURPOSE = [
  "INVENTORY_VALUATION",
  "MARGINAL_DECISION",
  "COST_OF_FUNDS",
  "FX_POLICY",
  "ORDERING_COST",
  "UNSTATED",
] as const;
export type RatePurpose = (typeof RATE_PURPOSE)[number];

/** D-014 rule 10 as amended: source · owner · effective date · freshness · status · PURPOSE. */
export interface FinancialRate {
  readonly id: string;
  readonly kind: "COST_OF_FUNDS" | "CARRYING_COMPONENT" | "ORDERING_COST" | "FX";
  readonly rate: Rate;
  readonly unit: string;
  readonly source: string;
  readonly owner: string;
  readonly effectiveFrom: Date;
  readonly effectiveTo: Date | null;
  readonly status: "ACTIVE" | "SUPERSEDED" | "DRAFT";
  readonly purpose: RatePurpose;
  readonly basis: Basis;
}

export class RateFitnessError extends Error {
  constructor(
    readonly rateId: string,
    readonly declared: RatePurpose,
    readonly required: RatePurpose,
  ) {
    super(
      `Rate ${rateId} was constructed for ${declared} but this calculation requires ` +
        `${required}. A rate outside its purpose is authoritative and wrong (D-023 as amended). ` +
        `Currency quantification is blocked and an EVIDENCE GAP is raised.`,
    );
    this.name = "RateFitnessError";
  }
}

/**
 * The gate. Mismatch BLOCKS currency quantification and raises an EVIDENCE GAP —
 * it does not degrade basis and proceed, because disclosure does not prevent
 * netting a risk into a saving, which D-031 forbids.
 *
 * UNSTATED never passes. Finance not having been asked is a gap, not permission.
 */
export function requireRate(
  candidate: FinancialRate | null,
  required: RatePurpose,
  ctx: { unit: string; asOf: Date; what: string },
): Envelope<Rate> {
  if (candidate === null) {
    return insufficient<Rate>(
      ctx.unit,
      ctx.asOf,
      `${ctx.what}: no finance-owned rate is available. No default exists — not 15%, not 20%, ` +
        `not any value (D-023). Required: F-08 / F-22 / F-31.`,
    );
  }
  if (candidate.status !== "ACTIVE") {
    return insufficient<Rate>(ctx.unit, ctx.asOf, `${ctx.what}: rate ${candidate.id} is ${candidate.status}, not ACTIVE.`);
  }
  if (candidate.purpose === "UNSTATED") {
    return insufficient<Rate>(
      ctx.unit,
      ctx.asOf,
      `${ctx.what}: rate ${candidate.id} has no stated purpose. Finance may never have been asked ` +
        `what it was constructed for — that is an EVIDENCE GAP (F-08), not permission to use it.`,
    );
  }
  if (candidate.purpose !== required) {
    return insufficient<Rate>(
      ctx.unit,
      ctx.asOf,
      `${ctx.what}: rate ${candidate.id} was constructed for ${candidate.purpose}, but this ` +
        `calculation requires ${required}. Authoritative and inapplicable (D-023 as amended).`,
    );
  }
  if (candidate.effectiveTo !== null && candidate.effectiveTo < ctx.asOf) {
    return insufficient<Rate>(ctx.unit, ctx.asOf, `${ctx.what}: rate ${candidate.id} expired on ${candidate.effectiveTo.toISOString()}.`);
  }
  if (candidate.effectiveFrom > ctx.asOf) {
    return insufficient<Rate>(ctx.unit, ctx.asOf, `${ctx.what}: rate ${candidate.id} is not yet effective at ${ctx.asOf.toISOString()}.`);
  }
  return value(candidate.rate, ctx.unit, candidate.basis, candidate.effectiveFrom, {
    inputs: [{ kind: "financial_rate", id: candidate.id, basis: candidate.basis, asOf: candidate.effectiveFrom }],
    coverage: [`rate source: ${candidate.source}; owner: ${candidate.owner}; purpose: ${candidate.purpose}`],
  });
}

/* -------------------------------------------------------------------------- */
/* D-035 — carrying cost is component-wise. A whole rate is INVALID.          */
/* -------------------------------------------------------------------------- */

/**
 * Not merely "possibly unfit". A typical finance carrying rate contains at least
 * two EXPOSURE components and frequently two that generate no incremental cash
 * flow — used whole it would net a risk into a saving.
 */
export const CARRYING_COMPONENT = [
  "CAPITAL",
  "SPACE",
  "HANDLING",
  "INSURANCE",
  "OBSOLESCENCE",
  "SHRINKAGE_FUTURE",
  "SHRINKAGE_PAST",
  "INVENTORY_TAX",
] as const;
export type CarryingComponent = (typeof CARRYING_COMPONENT)[number];

export type ComponentVerdict =
  | { readonly kind: "APPLIES"; readonly basis: Basis }
  /** No incremental cash flow — an owned half-empty warehouse, salaried staff below capacity. */
  | { readonly kind: "NOT_VALID"; readonly why: string }
  /** A risk, not a cost. D-031 forbids netting it. Belongs in EXPOSURE / RISK. */
  | { readonly kind: "EXPOSURE"; readonly why: string }
  | { readonly kind: "UNKNOWN"; readonly needs: string };

/** Components that are never a cost, in any factory. Structural, not configurable. */
export const ALWAYS_EXPOSURE: readonly CarryingComponent[] = ["OBSOLESCENCE", "SHRINKAGE_FUTURE"];

export function classifyComponent(
  c: CarryingComponent,
  facts: { spaceConstrained: boolean | null; handlingIsMarginal: boolean | null; insuranceIsValueBased: boolean | null; inventoryTaxApplies: boolean | null },
): ComponentVerdict {
  switch (c) {
    case "OBSOLESCENCE":
      return { kind: "EXPOSURE", why: "Obsolescence is a risk, not a cost. Inside a rate it would be netted, which D-031 forbids." };
    case "SHRINKAGE_FUTURE":
      return { kind: "EXPOSURE", why: "Future shrinkage is forward-looking. Past shrinkage is a ledger adjustment and is ACTUAL; a rate conflates the two." };
    case "CAPITAL":
      return { kind: "APPLIES", basis: "CALCULATED" };
    case "SHRINKAGE_PAST":
      return { kind: "APPLIES", basis: "ACTUAL" };
    case "SPACE":
      if (facts.spaceConstrained === null) return { kind: "UNKNOWN", needs: "F-33 — is warehouse space constrained?" };
      return facts.spaceConstrained
        ? { kind: "APPLIES", basis: "ACTUAL" }
        : { kind: "NOT_VALID", why: "An owned, unconstrained warehouse generates no incremental cash flow when stock falls." };
    case "HANDLING":
      if (facts.handlingIsMarginal === null) return { kind: "UNKNOWN", needs: "is handling labour marginal (overtime / per-move) or salaried below capacity?" };
      return facts.handlingIsMarginal
        ? { kind: "APPLIES", basis: "ACTUAL" }
        : { kind: "NOT_VALID", why: "Salaried staff below capacity: marginal labour cost is zero." };
    case "INSURANCE":
      if (facts.insuranceIsValueBased === null) return { kind: "UNKNOWN", needs: "is insurance value-based and adjusting, or a fixed annual declared value?" };
      return facts.insuranceIsValueBased
        ? { kind: "APPLIES", basis: "ACTUAL" }
        : { kind: "NOT_VALID", why: "A fixed annual premium does not move with stock." };
    case "INVENTORY_TAX":
      if (facts.inventoryTaxApplies === null) return { kind: "UNKNOWN", needs: "F-40 — are inventory taxes or duties applicable to held stock?" };
      return facts.inventoryTaxApplies ? { kind: "APPLIES", basis: "ACTUAL" } : { kind: "NOT_VALID", why: "Not applicable in this jurisdiction." };
  }
}
