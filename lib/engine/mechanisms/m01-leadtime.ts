/**
 * MECHANISM 01 — Expedited freight / emergency purchase premium.
 * The lead-time-correction slice (D-015, strengthened by D-017).
 *
 * This is the MVP's only detector, chosen for reasons already locked:
 *   - it needs NO carrying-cost rate, so F-08 does not gate it
 *   - cause, intervention, counterfactual and verification are all inside our data
 *   - it measures money ACTUALLY SPENT, not money hypothetically saveable
 *   - its capture (F-01, F-06) also gates D-037, so it unlocks the most downstream
 *   - realization is entirely procurement-side, and the operating chain is broken
 *     at Actual Outcome (D-007)
 *
 * The counterfactual, per D-027 — event-level, never a category percentage:
 *
 *   "Master lead time for item X is L days. On these K expedited orders the
 *    observed lead time was L' > L. Had the master value been at least L', each
 *    order would have been released early enough to arrive without expediting,
 *    and these are the premiums those K events cost."
 *
 * ⚠ No statistic is invented. The proposed correction is the OBSERVED MAXIMUM
 * within the window — the smallest value for which the counterfactual holds for
 * every attributed event. That is a derivation from the events, not a choice.
 */
import { type Money, type Qty, sumMoney, ZERO_MONEY } from "../../core/decimal";
import { annualise, type DatedAmount } from "../../core/annualise";
import { type CapturedAmount, type FxPolicy, normalise } from "../../core/fx";
import { type Envelope, insufficient, value, weakestBasis } from "../../core/provenance";
import { coverageFact, eligibleForCurrency, fail, type GateResult, ladderFrom, pass, unestablished } from "../gates";
import type { Opportunity } from "../findings";
import { DIMENSION, type InterventionSignature } from "../signature";

/* -------------------------------------------------------------------------- */
/* Inputs — all read from recorded events. Nothing is modelled.               */
/* -------------------------------------------------------------------------- */

export interface ObservedOrder {
  readonly poLineId: string;
  readonly orderedAt: Date;
  /** F-41: the FIRST receipt against the line. Partials matter — see below. */
  readonly firstReceiptAt: Date | null;
  readonly finalReceiptAt: Date | null;
  readonly receiptCount: number;
  readonly expedited: boolean;
}

export interface ExpediteEventInput {
  readonly id: string;
  readonly poLineId: string;
  readonly occurredAt: Date;
  /** NULL = not classified. Classification coverage is a measured input (rule 15). */
  readonly rootCause: string | null;
  /** F-01. NULL = freight not separably captured; the event still counts, the money does not. */
  readonly premium: CapturedAmount | null;
}

export interface DetectInput {
  readonly itemId: string;
  readonly itemCode: string;
  /** F-09. NULL means the factory does not maintain one — an EVIDENCE GAP, not zero. */
  readonly masterLeadTimeDays: number | null;
  readonly orders: readonly ObservedOrder[];
  readonly expedites: readonly ExpediteEventInput[];
  readonly fx: FxPolicy;
  readonly historyFrom: Date;
  readonly asOf: Date;
  /**
   * Does correcting the lead time require holding more inventory?
   *
   * D-015 nominated this slice because the answer MAY be no — correcting a false
   * parameter makes existing policy behave as intended rather than demanding a
   * larger buffer. The MVP must still CHECK, and must REFUSE where the answer is
   * yes and the offset cannot be valued. Removing the check because the expected
   * value is zero is exactly what D-014 rule 6 exists to prevent.
   */
  readonly requiresAdditionalInventory: boolean | null;
  /** Only consulted when the above is true. Component-wise per D-035, never a whole rate. */
  readonly incrementalCarryingCost: Envelope<Money> | null;
  readonly owners?: { finding?: string; action?: string; data?: string };
}

export interface DetectResult {
  readonly opportunity: Opportunity | null;
  readonly gates: readonly GateResult[];
  /** Raised whenever a gate is UNESTABLISHED for want of factory data. */
  readonly evidenceGaps: readonly { missingEvidence: string; factoryDataRef: string; blocks: string; observedSpend: Money | null }[];
  readonly notes: readonly string[];
}

const DAY = 86_400_000;
const leadTimeDays = (o: ObservedOrder): number | null =>
  o.firstReceiptAt ? Math.round((o.firstReceiptAt.getTime() - o.orderedAt.getTime()) / DAY) : null;

export function detectLeadTimeCorrection(input: DetectInput): DetectResult {
  const gates: GateResult[] = [];
  const gaps: DetectResult["evidenceGaps"] = [];
  const notes: string[] = [];
  const currency = input.fx.reportingCurrency;

  /* ---- G1. Are expedite events identifiable at all? (F-06) --------------- */
  if (input.expedites.length === 0) {
    gates.push(
      fail(
        "EXPEDITE_EVENTS_IDENTIFIED",
        `No expedite events are recorded for ${input.itemCode}. Either none occurred, or the factory ` +
          `does not record expedites in a form we can recognise (F-06). These are different facts and ` +
          `the system does not guess between them.`,
      ),
    );
    return { opportunity: null, gates, evidenceGaps: gaps as never[], notes };
  }
  gates.push(pass("EXPEDITE_EVENTS_IDENTIFIED", `${input.expedites.length} expedite event(s) recorded`));

  /* ---- G2. Root cause, captured in the workflow (D-018) ------------------ */
  const classified = input.expedites.filter((e) => e.rootCause !== null);
  const attributed = input.expedites.filter((e) => e.rootCause === "INCORRECT_LEAD_TIME");
  const coverage = [coverageFact("root cause classified", classified.length, input.expedites.length)];

  if (classified.length === 0) {
    gates.push(
      unestablished(
        "ROOT_CAUSE_CLASSIFIED",
        `None of the ${input.expedites.length} expedite events carry a root cause. Without it the ` +
          `mechanism produces a cost total rather than an actionable opportunity (D-018). ` +
          `UNESTABLISHED is not a pass.`,
      ),
    );
    (gaps as unknown[]).push({
      missingEvidence: "Expedite root cause is not captured at the time of the event",
      factoryDataRef: "F-05 / D-018",
      blocks: "Mechanism 01 — attribution of premium to a correctable cause",
      observedSpend: null,
    });
  } else if (attributed.length === 0) {
    gates.push(
      fail(
        "ROOT_CAUSE_CLASSIFIED",
        `${classified.length} events are classified but none to INCORRECT_LEAD_TIME. This item has ` +
          `expedites for other reasons; the lead-time-correction opportunity does not apply.`,
      ),
    );
    return { opportunity: null, gates, evidenceGaps: gaps as never[], notes };
  } else {
    gates.push(pass("ROOT_CAUSE_CLASSIFIED", `${attributed.length} event(s) attributed to INCORRECT_LEAD_TIME. ${coverage[0]}`));
  }

  /* ---- G3. Is there a master lead time to correct? (F-09) ---------------- */
  if (input.masterLeadTimeDays === null) {
    gates.push(
      unestablished(
        "MASTER_LEAD_TIME_PRESENT",
        `Item ${input.itemCode} has no master lead time. There is no parameter to correct, and a ` +
          `default lead time is never invented (F-09).`,
      ),
    );
    (gaps as unknown[]).push({
      missingEvidence: "Master-data lead time is not maintained",
      factoryDataRef: "F-09",
      blocks: "Mechanism 01 — the lead-time-correction slice entirely",
      observedSpend: null,
    });
  } else {
    gates.push(pass("MASTER_LEAD_TIME_PRESENT", `master lead time ${input.masterLeadTimeDays} days`));
  }

  /* ---- G4. The counterfactual, tested event by event (D-027) ------------- */
  const attributedOrders = attributed
    .map((e) => ({ event: e, order: input.orders.find((o) => o.poLineId === e.poLineId) ?? null }))
    .filter((x): x is { event: ExpediteEventInput; order: ObservedOrder } => x.order !== null);

  const withObserved = attributedOrders
    .map((x) => ({ ...x, observed: leadTimeDays(x.order) }))
    .filter((x): x is { event: ExpediteEventInput; order: ObservedOrder; observed: number } => x.observed !== null);

  const missingReceipts = attributedOrders.length - withObserved.length;
  if (missingReceipts > 0) {
    notes.push(
      `${missingReceipts} attributed event(s) have no recorded receipt, so no observed lead time exists ` +
        `for them. They are excluded from the counterfactual rather than assumed.`,
    );
  }

  const master = input.masterLeadTimeDays;
  const exceeding = master === null ? [] : withObserved.filter((x) => x.observed > master);
  const notExceeding = master === null ? [] : withObserved.filter((x) => x.observed <= master);

  if (master === null || withObserved.length === 0) {
    gates.push(
      unestablished(
        "COUNTERFACTUAL_TESTABLE",
        `Cannot test the counterfactual: ${master === null ? "no master lead time" : "no observed lead times"}. ` +
          `The system will not assert that a correction would have prevented an event it cannot measure.`,
      ),
    );
  } else if (exceeding.length === 0) {
    gates.push(
      fail(
        "COUNTERFACTUAL_TESTABLE",
        `Every attributed event's observed lead time (${withObserved.map((x) => x.observed).join(", ")} days) ` +
          `is within the master value of ${master}. The lead time was not demonstrably wrong, so these ` +
          `expedites are NOT explained by it — whatever the classifier recorded.`,
      ),
    );
    notes.push(
      `⚠ The recorded root cause and the evidence disagree. That is reported, not silently reconciled.`,
    );
    return { opportunity: null, gates, evidenceGaps: gaps as never[], notes };
  } else {
    gates.push(
      pass(
        "COUNTERFACTUAL_TESTABLE",
        `${exceeding.length} of ${withObserved.length} attributed event(s) had an observed lead time ` +
          `exceeding the master value of ${master} days` +
          (notExceeding.length > 0 ? `; ${notExceeding.length} did not and are excluded from the claim` : ""),
      ),
    );
  }

  /**
   * The proposed correction: the observed maximum among the events the
   * counterfactual covers. It is the SMALLEST value for which every one of them
   * would have been prevented — a derivation from the events, not a statistic
   * chosen from a menu.
   */
  const proposedLeadTime = exceeding.length > 0 ? Math.max(...exceeding.map((x) => x.observed)) : null;

  /* ---- G5. Is the premium separable? (F-01) — gates CURRENCY only -------- */
  const withPremium = exceeding.filter((x) => x.event.premium !== null);
  const withoutPremium = exceeding.length - withPremium.length;

  if (withPremium.length === 0) {
    gates.push(
      unestablished(
        "PREMIUM_SEPARABLE",
        `None of the ${exceeding.length} covered events carry a separable premium. The opportunity is ` +
          `real and countable; the money is not claimable (F-01). Event counts, no currency.`,
      ),
    );
    (gaps as unknown[]).push({
      missingEvidence: "Freight/expedite premium is not recorded separably per shipment and attributable to PO lines",
      factoryDataRef: "F-01",
      blocks: "Mechanism 01 — currency quantification (detection is unaffected)",
      observedSpend: null,
    });
  } else {
    gates.push(
      pass(
        "PREMIUM_SEPARABLE",
        `${withPremium.length} of ${exceeding.length} covered event(s) carry a separable premium` +
          (withoutPremium > 0 ? `; ${withoutPremium} do not and are excluded from the figure, not zeroed` : ""),
      ),
    );
  }

  /* ---- G6. FX normalisation at each amount's own effective date (D-042) --- */
  const normalised = withPremium.map((x) => ({ x, env: normalise(input.fx, x.event.premium!) }));
  const unnormalisable = normalised.filter((n) => n.env.value === null);
  if (unnormalisable.length > 0) {
    gates.push(
      unestablished(
        "FX_NORMALISABLE",
        `${unnormalisable.length} premium(s) cannot be FX-normalised: ` +
          unnormalisable.flatMap((n) => n.env.limitations).join("; "),
      ),
    );
    (gaps as unknown[]).push({
      missingEvidence: "FX rate history with finance's effective-dating policy",
      factoryDataRef: "F-07",
      blocks: "Mechanism 01 — any cross-period comparison",
      observedSpend: null,
    });
  } else if (normalised.length > 0) {
    gates.push(pass("FX_NORMALISABLE", `all ${normalised.length} premium(s) normalised at their own effective dates`));
  }

  /* ---- G7. The offset check (D-014 rule 6). Expected zero, still checked. -- */
  let incremental: Envelope<Money>;
  if (input.requiresAdditionalInventory === null) {
    gates.push(
      unestablished(
        "OFFSET_DETERMINABLE",
        `Whether correcting the lead time requires holding more inventory has not been determined. ` +
          `Claiming the premium without it would overstate the benefit and could recommend an ` +
          `action that loses money (D-014 rule 6).`,
      ),
    );
    incremental = insufficient<Money>(currency, input.asOf, "incremental inventory requirement not determined");
  } else if (input.requiresAdditionalInventory === false) {
    gates.push(
      pass(
        "OFFSET_DETERMINABLE",
        `The correction makes existing policy behave as intended and requires no additional inventory, ` +
          `so no carrying-cost input is needed. This is why D-015 nominated this slice.`,
      ),
    );
    incremental = value(ZERO_MONEY, currency, "CALCULATED", input.asOf, {
      coverage: ["no additional inventory required by this correction"],
    });
  } else {
    if (input.incrementalCarryingCost && input.incrementalCarryingCost.value !== null) {
      gates.push(pass("OFFSET_DETERMINABLE", `incremental carrying cost supplied component-wise`));
      incremental = input.incrementalCarryingCost;
    } else {
      gates.push(
        unestablished(
          "OFFSET_DETERMINABLE",
          `The correction requires additional inventory, and its carrying cost cannot be valued ` +
            `component-wise (D-035). The NET figure is refused — a gross premium presented as a saving ` +
            `would overstate the benefit (D-014 rule 6).`,
        ),
      );
      (gaps as unknown[]).push({
        missingEvidence: "Carrying-cost components and the purpose each was constructed for",
        factoryDataRef: "F-08",
        blocks: "Mechanism 01 — the NET figure where the correction requires more stock",
        observedSpend: null,
      });
      incremental =
        input.incrementalCarryingCost ??
        insufficient<Money>(currency, input.asOf, "carrying-cost components unavailable (F-08); no whole rate may be substituted (D-035)");
    }
  }

  /* ---- Annualisation (D-046). ------------------------------------------- */
  const dated: DatedAmount[] = normalised.map((n) => ({ at: n.x.event.occurredAt, amount: n.env }));
  const annual = annualise(dated, { historyFrom: input.historyFrom, asOf: input.asOf, unit: currency });

  const currencyEligible = eligibleForCurrency(gates);
  const ladder = ladderFrom(gates, annual.ladder === "ANNUALIZATION_ELIGIBLE");

  /* ---- The recurring figure. -------------------------------------------
     One exception, and it is deliberate. When the ONLY blocking gate is the
     OFFSET, the gross premium is still an ACTUAL fact we can see — the money
     was demonstrably spent. Suppressing it would discard the very figure that
     prioritises capture requests, since "capture requests are prioritised by
     observed spend, never by suspected opportunity" (Mechanism 02 §9).

     The GROSS is therefore reported and the NET is refused. That distinction is
     the whole point of D-014 rule 6: what cannot be established is the benefit
     after its offset, not the spend. */
  const blocking = gates.filter((g) => g.outcome !== "PASS");
  const onlyOffsetBlocks = blocking.length > 0 && blocking.every((g) => g.gate === "OFFSET_DETERMINABLE");

  const recurring: Envelope<Money> =
    currencyEligible || (onlyOffsetBlocks && annual.figure.value !== null)
      ? annual.figure
      : insufficient<Money>(
          currency,
          input.asOf,
          `currency quantification is blocked: ` +
            blocking.map((g) => `${g.gate} (${g.outcome}) — ${g.detail}`).join(" | "),
          { coverage },
        );

  /* ---- The net (D-014 rule 6), carrying its own incompleteness (D-041). -- */
  let net: Envelope<Money>;
  if (recurring.value === null) {
    net = insufficient<Money>(currency, input.asOf, recurring.limitations.join("; "), { coverage });
  } else if (incremental.value === null) {
    net = insufficient<Money>(
      currency,
      input.asOf,
      `gross premium is ${recurring.value.toFixed(2)} ${currency}, but the incremental cost cannot be ` +
        `valued, so no NET figure is produced: ${incremental.limitations.join("; ")}`,
      { coverage },
    );
  } else {
    /**
     * ⚠ Contagion (D-002): the net carries the WEAKEST basis of its inputs.
     *
     * It previously carried the gross's basis alone, which let a net resting on
     * a `USER_DEFINED` imported cost reference present itself as `CALCULATED`.
     * The figure would have looked stronger than the weakest thing underneath it
     * — exactly the basis laundering D-012 forbids.
     */
    net = value(
      recurring.value.minus(incremental.value) as Money,
      currency,
      weakestBasis([recurring.basis, incremental.basis]),
      input.asOf,
      {
        inputs: [...recurring.inputs, ...incremental.inputs],
        coverage: [...coverage, ...recurring.coverage, ...incremental.coverage],
        limitations: [
          ...recurring.limitations,
          ...incremental.limitations,
          `Net of certain incremental cost only. Where an exposure exists and cannot be valued, this ` +
            `figure EXCLUDES it and is therefore optimistic (D-041).`,
        ],
      },
    );
  }

  if (proposedLeadTime === null || master === null) {
    return { opportunity: null, gates, evidenceGaps: gaps as never[], notes };
  }

  /**
   * D-029: the signature. Correcting a master lead time raises LEAD_TIME_DEMAND,
   * which is a COMPONENT of the reorder point — not the reorder point itself.
   * That distinction is what lets this compose with a safety-stock reduction
   * rather than falsely contradicting it (Part 2.3 §A5).
   */
  const signature: InterventionSignature = {
    subject: { type: "ITEM", itemId: input.itemId },
    effects: [
      {
        dimension: DIMENSION.MASTER_LEAD_TIME,
        direction: "INCREASE",
        windowFrom: input.asOf,
        windowTo: new Date(input.asOf.getTime() + 365 * DAY),
      },
      {
        dimension: DIMENSION.LEAD_TIME_DEMAND,
        direction: "INCREASE",
        windowFrom: input.asOf,
        windowTo: new Date(input.asOf.getTime() + 365 * DAY),
      },
    ],
  };

  const opportunity: Opportunity = {
    class: "OPPORTUNITY",
    id: `m01:${input.itemId}`,
    mechanism: "M01_EXPEDITE_PREMIUM_LEADTIME",
    title: `Master lead time for ${input.itemCode} is understated`,
    statedIntervention: `Correct the master lead time for ${input.itemCode} from ${master} to at least ${proposedLeadTime} days.`,
    counterfactual:
      `${exceeding.length} expedite event(s) attributed to INCORRECT_LEAD_TIME occurred on orders whose ` +
      `observed lead time (${exceeding.map((x) => x.observed).join(", ")} days) exceeded the master value ` +
      `of ${master}. Had the master value been at least ${proposedLeadTime} days, each order would have ` +
      `been released early enough to arrive without expediting. ${proposedLeadTime} is the observed ` +
      `maximum — the smallest value covering every event, derived rather than chosen.`,
    lifecycle: "POTENTIAL",
    evidenceStrength: null,
    ladder,
    gates,
    recurringImpact: recurring,
    /** No one-time impact: correcting a parameter changes no stock level. */
    oneTimeImpact: value(ZERO_MONEY, currency, "CALCULATED", input.asOf, {
      coverage: ["a parameter correction changes no stock level, so there is no one-time impact"],
    }),
    incrementalCost: incremental,
    netImpact: net,
    /**
     * ⚠ Always true for this mechanism. The correction reduces stockout exposure,
     * and that reduction CANNOT BE VALUED (D-034, D-007). Under D-041 the number
     * must say so — otherwise a correct action shows only its cost and looks
     * purely bad. This is the case that required MITIGATES to exist.
     */
    netExcludesUnvaluedRisk: true,
    signature,
    findingOwner: input.owners?.finding ?? null,
    actionOwner: input.owners?.action ?? null,
    dataOwner: input.owners?.data ?? null,
    effectiveAsOf: input.asOf,
  };

  notes.push(
    `This Opportunity MITIGATES the stockout exposure for ${input.itemCode}. The mitigation is disclosed ` +
      `and never netted — valuing it would require production-impact data that is out of scope (D-031, D-007).`,
  );
  if (input.orders.some((o) => o.receiptCount > 1)) {
    notes.push(
      `Some orders were received in instalments. Lead time is measured to the FIRST receipt; the choice ` +
        `is declared rather than assumed (F-41).`,
    );
  }

  return { opportunity, gates, evidenceGaps: gaps as never[], notes };
}

/** Sum of premiums as an ACTUAL fact — used to prioritise capture requests by observed spend. */
export function observedPremiumSpend(events: readonly ExpediteEventInput[], fx: FxPolicy): Money {
  const amounts = events
    .map((e) => (e.premium ? normalise(fx, e.premium) : null))
    .filter((e): e is Envelope<Money> => e !== null && e.value !== null)
    .map((e) => e.value!);
  return amounts.length ? sumMoney(amounts) : ZERO_MONEY;
}
