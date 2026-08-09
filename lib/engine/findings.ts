/**
 * The finding model — D-025 as amended, LOCKED.
 *
 *   FINDING
 *   ├── OPPORTUNITY     the ONLY class eligible for Potential Annual Saving
 *   ├── OBSERVED COST   historical ACTUAL fact. No lifecycle. No mitigation.
 *   └── EXPOSURE / RISK forward-looking. No lifecycle. May carry mitigation.
 *                       NEVER approved, NEVER realized, NEVER valued.
 *
 *   EVIDENCE GAP        OUTSIDE the hierarchy entirely (W-46). A statement about
 *                       OUR data, never about the factory's money.
 *
 * These are separate TYPES, not a status field, for the same reason they are
 * separate tables: as a status, one forgotten filter or one widened join turns an
 * exposure into a saving. As distinct classes it is structurally impossible.
 *
 * Code standards 10e, 10e-1, 10e-2, 10e-3, 10e-4.
 */
import type { Money } from "../core/decimal";
import type { Envelope } from "../core/provenance";
import type { GateResult, Ladder } from "./gates";
import type { InterventionSignature } from "./signature";

export type Lifecycle = "POTENTIAL" | "APPROVED" | "IN_PROGRESS" | "REALIZED" | "REJECTED" | "EXPIRED";
/** D-026: evidence strength is an ATTRIBUTE, never a lifecycle state. */
export type EvidenceStrength = "EARLY" | "STRONG";

export interface Opportunity {
  readonly class: "OPPORTUNITY";
  readonly id: string;
  readonly mechanism: string;
  readonly title: string;
  /** D-027: specific enough to be TESTED, not "improve planning". */
  readonly statedIntervention: string;
  readonly counterfactual: string;

  readonly lifecycle: Lifecycle;
  readonly evidenceStrength: EvidenceStrength | null;
  readonly ladder: Ladder;
  readonly gates: readonly GateResult[];

  /** D-011 / D-012: separate. NEVER summed together. */
  readonly recurringImpact: Envelope<Money>;
  readonly oneTimeImpact: Envelope<Money>;
  /** D-014 rule 6: certain incremental cost, netted. */
  readonly incrementalCost: Envelope<Money>;
  readonly netImpact: Envelope<Money>;
  /**
   * D-041. Where an exposure exists and cannot be valued, the NUMBER declares it
   * — and declares that the exclusion is optimistic, because what is omitted is
   * always a cost or a risk.
   */
  readonly netExcludesUnvaluedRisk: boolean;

  /** D-029. An Opportunity without one CANNOT be presented. */
  readonly signature: InterventionSignature;

  /** D-011 as amended. NULL is unowned and VISIBLY so, never hidden. */
  readonly findingOwner: string | null;
  readonly actionOwner: string | null;
  readonly dataOwner: string | null;

  readonly effectiveAsOf: Date;
}

export interface ObservedCost {
  readonly class: "OBSERVED_COST";
  readonly id: string;
  readonly mechanism: string;
  readonly title: string;
  readonly amount: Envelope<Money>;
  /**
   * Required. The whole point of this class is being useful about money we
   * cannot claim: "you spent this, and there was nothing you could have done."
   */
  readonly whyNotAvoidable: string;
  readonly effectiveAsOf: Date;
}

export interface Exposure {
  readonly class: "EXPOSURE_RISK";
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly description: string;
  readonly observedAt: Date;
  /**
   * Deliberately absent: any value, probability, severity or score. D-031 rule 5
   * and the Mechanism 03 lock both forbid them, and there is nowhere to put one.
   */
}

export interface EvidenceGap {
  readonly class: "EVIDENCE_GAP";
  readonly id: string;
  readonly missingEvidence: string;
  readonly factoryDataRef: string | null;
  readonly blocks: string;
  /**
   * "Capture requests are prioritised by OBSERVED SPEND — a fact we can see —
   *  never by suspected opportunity, which we cannot."
   * This spend is an ACTUAL fact, and it is NOT an Evidence Gap value.
   */
  readonly observedSpend: Envelope<Money> | null;
  readonly dataOwner: string | null;
}

export type Finding = Opportunity | ObservedCost | Exposure;

/**
 * The aggregation guard, in code.
 *
 * D-025's whole argument is that this must be structural rather than a filter
 * someone remembers to write. The type system enforces it at compile time; this
 * function enforces it at runtime for anything crossing a boundary.
 */
export function onlyOpportunities(findings: readonly Finding[]): readonly Opportunity[] {
  return findings.filter((f): f is Opportunity => f.class === "OPPORTUNITY");
}

export class AggregationViolation extends Error {
  constructor(cls: string) {
    super(
      `A ${cls} record reached Potential Annual Saving. Only OPPORTUNITY is saving-eligible, ` +
        `and no transition, migration or aggregation path may convert a non-Opportunity finding ` +
        `into one (D-025 as amended).`,
    );
    this.name = "AggregationViolation";
  }
}

export function assertAggregable(f: Finding): asserts f is Opportunity {
  if (f.class !== "OPPORTUNITY") throw new AggregationViolation(f.class);
}

/**
 * D-025 principle 3: a mitigation with a defensible counterfactual BECOMES A NEW
 * OPPORTUNITY. The exposure itself is never approved and never realized, and the
 * original record is preserved rather than promoted.
 *
 * There is deliberately no `promoteExposure` function anywhere in this codebase.
 */
export function exposureCannotBeApproved(): never {
  throw new Error(
    "An EXPOSURE / RISK is never approved and never realized. If a defensible counterfactual " +
      "now exists, raise a NEW Opportunity with its own evidence; the exposure record is " +
      "preserved, never promoted (D-025 principles 1-3).",
  );
}
