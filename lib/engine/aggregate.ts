/**
 * Potential Annual Saving — the headline figure.
 *
 * D-012 (range, weakest basis, deduplicated, recurring only, minimum history),
 * as completed by D-043 (exclusion is not contagion) and D-044 (the range is an
 * evidence partition, not a confidence interval).
 *
 * This is the number the entire product is judged on, and it is the easiest to
 * inflate invisibly — through double counting, one-time/recurring conflation,
 * thin-history annualisation, or basis laundering by aggregation. It will be
 * audited by a finance manager, and it must survive that.
 *
 * Code standards 10a, 10b, 10b-1, 10b-2, 10g.
 */
import { type Money, sumMoney, ZERO_MONEY } from "../core/decimal";
import { type Basis, type Envelope, isFirmBasis, partitionForAggregate, weakestBasis } from "../core/provenance";
import { type Opportunity, assertAggregable, type Finding } from "./findings";

export interface ExcludedMember {
  readonly opportunityId: string;
  readonly title: string;
  readonly reason: string;
  /**
   * D-043: "their observed magnitude wherever any is known". An excluded member
   * is not always a blank — sometimes we know what was spent and cannot claim it.
   */
  readonly observedMagnitude: Money | null;
}

export interface DeduplicationEntry {
  readonly keptId: string;
  readonly removedId: string;
  readonly mechanism: string;
  /** D-020: attribution must be EXPLAINABLE, never a silent filter. */
  readonly explanation: string;
  readonly amountRemoved: Money;
}

export interface HeadlineFigure {
  /** D-044 lower bound: every input ACTUAL or CALCULATED. */
  readonly lower: Money;
  /** D-044 upper bound: lower plus claims carrying ESTIMATED or ASSUMED inputs. */
  readonly upper: Money;
  readonly currency: string;
  /** D-012: the aggregate carries the WEAKEST basis among its inputs. */
  readonly basis: Basis;

  /** D-012 / D-033: reported separately, NEVER summed into the annual figure. */
  readonly oneTimeSeparate: Money;

  /** D-043: disclosed, never silently dropped. */
  readonly excluded: readonly ExcludedMember[];
  /** D-020: shown, with the reason. */
  readonly deduplicated: readonly DeduplicationEntry[];

  /**
   * Always true when anything was excluded. The number carries its own
   * incompleteness, and the direction of the omission is always optimistic.
   */
  readonly isLowerBound: boolean;
  readonly statements: readonly string[];

  /** D-012: displayed alongside the headline, always. */
  readonly realisedVersusIdentified: { realised: number; identified: number };
}

export interface AggregateInput {
  readonly findings: readonly Finding[];
  readonly currency: string;
  readonly asOf: Date;
  /**
   * D-020: deduplication is at the ECONOMIC-MECHANISM level, not by subject.
   * Subject-level deduplication UNDERSTATES — one PO line can carry two
   * genuinely independent effects (an air-freight premium fixed by planning and
   * a spot-price premium fixed by sourcing), and deduplicating by subject
   * discards one of them and misdirects the fix.
   */
  readonly dedupe?: readonly DeduplicationEntry[];
}

/**
 * The one place Potential Annual Saving is computed.
 *
 * Non-Opportunity findings cannot reach it — not by convention, but because
 * `onlyOpportunities` narrows the type and `assertAggregable` throws for anything
 * that slips through a boundary. There is no `WHERE status IN (...)` to widen.
 */
export function potentialAnnualSaving(input: AggregateInput): HeadlineFigure {
  const opps: Opportunity[] = [];
  for (const f of input.findings) {
    if (f.class !== "OPPORTUNITY") continue; // exposure and observed cost never enter
    assertAggregable(f);
    opps.push(f);
  }

  const removedIds = new Set((input.dedupe ?? []).map((d) => d.removedId));
  const eligible = opps.filter((o) => !removedIds.has(o.id));

  /* --- D-012: only ANNUALIZATION_ELIGIBLE claims may carry an annual figure. */
  const annualisable = eligible.filter((o) => o.ladder !== "OPPORTUNITY_DETECTED");
  const detectedOnly = eligible.filter((o) => o.ladder === "OPPORTUNITY_DETECTED");

  /* --- D-043: exclusion, not contagion. -------------------------------------
     Members that cannot be computed are EXCLUDED and DISCLOSED. Treating them
     as zero would produce a total that looks complete and omits them; applying
     contagion to the set would make the headline permanently uncomputable. */
  const netEnvelopes = annualisable.map((o) => o.netImpact);
  const part = partitionForAggregate(netEnvelopes);

  const excluded: ExcludedMember[] = [];
  annualisable.forEach((o, i) => {
    const e = netEnvelopes[i]!;
    if (e.value === null) {
      excluded.push({
        opportunityId: o.id,
        title: o.title,
        reason: e.limitations.join("; ") || "INSUFFICIENT_DATA",
        observedMagnitude: o.recurringImpact.value ?? null,
      });
    }
  });
  // Claims that never reached the annualisation bar are also excluded, and for a
  // reason a reader needs: they were detected, not dismissed.
  for (const o of detectedOnly) {
    excluded.push({
      opportunityId: o.id,
      title: o.title,
      reason:
        o.netImpact.limitations.join("; ") ||
        "detected but not annualisation-eligible: an evidence gate did not pass, so no currency is claimed (D-019)",
      observedMagnitude: o.recurringImpact.value ?? null,
    });
  }

  /* --- D-044: the range is an evidence partition, not a confidence interval.
     Both bounds are sums of REAL CLAIMS. No probability appears anywhere. */
  const included = annualisable.filter((o) => o.netImpact.value !== null);
  const firm = included.filter((o) => isFirmBasis(o.netImpact.basis));
  const softer = included.filter((o) => !isFirmBasis(o.netImpact.basis));

  const lower = sumMoney(firm.map((o) => o.netImpact.value!));
  const upper = sumMoney(included.map((o) => o.netImpact.value!));

  /* --- D-012 / D-033: one-time is reported SEPARATELY and never summed in. --- */
  const oneTimeSeparate = sumMoney(
    eligible.map((o) => o.oneTimeImpact.value).filter((v): v is Money => v !== null),
  );

  const basis = included.length === 0 ? "INSUFFICIENT_DATA" : weakestBasis(included.map((o) => o.netImpact.basis));

  const statements: string[] = [];
  statements.push(
    `Range is an evidence partition, not a confidence interval: the lower bound is claims whose ` +
      `every input is ACTUAL or CALCULATED; the upper adds ${softer.length} claim(s) carrying an ` +
      `ESTIMATED or ASSUMED input. No probability is used (D-044).`,
  );
  if (excluded.length > 0) {
    statements.push(
      `${excluded.length} identified opportunit${excluded.length === 1 ? "y is" : "ies are"} EXCLUDED ` +
        `from this total because ${excluded.length === 1 ? "it" : "they"} could not be defensibly valued. ` +
        `The total is therefore a LOWER BOUND, and the omission is optimistic (D-043).`,
    );
  }
  if (eligible.some((o) => o.netExcludesUnvaluedRisk)) {
    statements.push(
      `One or more claims in this total exclude an exposure that cannot be valued. Those net ` +
        `figures are optimistic by an unquantified amount (D-041).`,
    );
  }
  statements.push(
    `Recurring impact only. One-time impacts (${oneTimeSeparate.toFixed()} ${input.currency}) are ` +
      `reported separately and are NEVER summed into the annual figure (D-012, D-033).`,
  );
  if ((input.dedupe ?? []).length > 0) {
    statements.push(
      `${input.dedupe!.length} overlapping claim(s) deduplicated at the economic-mechanism level, ` +
        `with the deduction shown (D-020).`,
    );
  }

  const realised = opps.filter((o) => o.lifecycle === "REALIZED").length;

  return {
    lower,
    upper,
    currency: input.currency,
    basis,
    oneTimeSeparate,
    excluded,
    deduplicated: input.dedupe ?? [],
    isLowerBound: excluded.length > 0,
    statements,
    realisedVersusIdentified: { realised, identified: opps.length },
  };
}

/** Rendering helper. Never returns a bare number — the caveats travel with it. */
export function describeHeadline(h: HeadlineFigure): string {
  const range =
    h.lower.equals(h.upper)
      ? `${h.lower.toFixed(2)} ${h.currency}`
      : `${h.lower.toFixed(2)} – ${h.upper.toFixed(2)} ${h.currency}`;
  const bound = h.isLowerBound ? " (lower bound)" : "";
  return `Potential Annual Saving: ${range}${bound} · basis ${h.basis}`;
}

export const EMPTY_HEADLINE = (currency: string): HeadlineFigure => ({
  lower: ZERO_MONEY,
  upper: ZERO_MONEY,
  currency,
  basis: "INSUFFICIENT_DATA",
  oneTimeSeparate: ZERO_MONEY,
  excluded: [],
  deduplicated: [],
  isLowerBound: false,
  statements: ["No opportunity has yet reached the evidence bar for a currency claim."],
  realisedVersusIdentified: { realised: 0, identified: 0 },
});
