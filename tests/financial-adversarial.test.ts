/**
 * PHASE 9 — ADVERSARIAL FINANCIAL VALIDATION.
 *
 * Each block below is one of the eight questions the block-5 brief requires be
 * asked before the product may be called correct. A test here failing is not a
 * unit-test failure; it means the system can lie about money.
 */
import { describe, expect, it } from "vitest";
import { InexactInputError, money, qty, ZERO_MONEY } from "../lib/core/decimal";
import { derive, insufficient, isKnown, partitionForAggregate, value, weakestBasis } from "../lib/core/provenance";
import { captured, fxObservation, normalise, type FxPolicy } from "../lib/core/fx";
import { annualise, refuseToAnnualiseOneTime } from "../lib/core/annualise";
import { requireRate, classifyComponent, type FinancialRate } from "../lib/core/rate";
import { eligibleForCurrency, fail, pass, unestablished } from "../lib/engine/gates";
import { AggregationViolation, assertAggregable, exposureCannotBeApproved, type Exposure, type Finding, type Opportunity } from "../lib/engine/findings";
import { describeHeadline, potentialAnnualSaving } from "../lib/engine/aggregate";
import { DIMENSION, detectContradictions, assertPresentable, MissingSignatureError } from "../lib/engine/signature";
import { detectLeadTimeCorrection } from "../lib/engine/mechanisms/m01-leadtime";

const d = (s: string) => new Date(s);
const ASOF = d("2027-01-01T00:00:00Z");

const EGP_ONLY: FxPolicy = { reportingCurrency: "EGP", observations: [], owner: "Finance" };
const WITH_USD: FxPolicy = {
  reportingCurrency: "EGP",
  owner: "Finance",
  observations: [
    fxObservation("USD", "EGP", "30.90", d("2026-01-01T00:00:00Z"), "CBE", "Finance"),
    fxObservation("USD", "EGP", "48.50", d("2026-06-01T00:00:00Z"), "CBE", "Finance"),
  ],
};

const sig = (dimension: string, direction: "INCREASE" | "DECREASE", itemId = "item-1") => ({
  subject: { type: "ITEM" as const, itemId },
  effects: [{ dimension, direction, windowFrom: d("2027-01-01"), windowTo: d("2027-12-31") }],
});

function opp(over: Partial<Opportunity> = {}): Opportunity {
  const v = value(money("1000"), "EGP", "ACTUAL", ASOF);
  return {
    class: "OPPORTUNITY",
    id: "o1",
    mechanism: "M01",
    title: "Test opportunity",
    statedIntervention: "Correct the master lead time from 18 to 32 days",
    counterfactual: "These four events would not have triggered",
    lifecycle: "POTENTIAL",
    evidenceStrength: null,
    ladder: "ANNUALIZATION_ELIGIBLE",
    gates: [pass("G", "ok")],
    recurringImpact: v,
    oneTimeImpact: value(ZERO_MONEY, "EGP", "CALCULATED", ASOF),
    incrementalCost: value(ZERO_MONEY, "EGP", "CALCULATED", ASOF),
    netImpact: v,
    netExcludesUnvaluedRisk: false,
    signature: sig(DIMENSION.MASTER_LEAD_TIME, "INCREASE"),
    findingOwner: null,
    actionOwner: null,
    dataOwner: null,
    effectiveAsOf: ASOF,
    ...over,
  };
}

/* ========================================================================== */
describe("Q1 — Could this system tell a factory it saved money when it didn't?", () => {
  it("refuses currency when the premium is not separably captured (F-01), and still reports the finding", () => {
    const r = detectLeadTimeCorrection({
      itemId: "i1",
      itemCode: "RM-001",
      masterLeadTimeDays: 18,
      orders: [{ poLineId: "L1", orderedAt: d("2026-03-01"), firstReceiptAt: d("2026-04-10"), finalReceiptAt: d("2026-04-10"), receiptCount: 1, expedited: true }],
      expedites: [{ id: "e1", poLineId: "L1", occurredAt: d("2026-04-01"), rootCause: "INCORRECT_LEAD_TIME", premium: null }],
      fx: EGP_ONLY,
      historyFrom: d("2025-06-01"),
      asOf: ASOF,
      requiresAdditionalInventory: false,
      incrementalCarryingCost: null,
    });
    expect(r.opportunity).not.toBeNull();
    // The finding exists; the money does not, and the reason is named.
    expect(isKnown(r.opportunity!.netImpact)).toBe(false);
    expect(r.opportunity!.netImpact.limitations.join(" ")).toMatch(/PREMIUM_SEPARABLE/);
    expect(r.evidenceGaps.some((g) => g.factoryDataRef === "F-01")).toBe(true);
  });

  it("refuses the claim when the recorded root cause and the evidence disagree", () => {
    const r = detectLeadTimeCorrection({
      itemId: "i1",
      itemCode: "RM-001",
      masterLeadTimeDays: 60, // master is generous; the delay was NOT a lead-time error
      orders: [{ poLineId: "L1", orderedAt: d("2026-03-01"), firstReceiptAt: d("2026-03-20"), finalReceiptAt: d("2026-03-20"), receiptCount: 1, expedited: true }],
      expedites: [{ id: "e1", poLineId: "L1", occurredAt: d("2026-03-15"), rootCause: "INCORRECT_LEAD_TIME", premium: captured("50000", "EGP", d("2026-03-15")) }],
      fx: EGP_ONLY,
      historyFrom: d("2025-01-01"),
      asOf: ASOF,
      requiresAdditionalInventory: false,
      incrementalCarryingCost: null,
    });
    expect(r.opportunity).toBeNull();
    expect(r.notes.join(" ")).toMatch(/root cause and the evidence disagree/);
  });

  it("refuses a NET figure when the intervention needs more stock and carrying cost cannot be valued", () => {
    const r = detectLeadTimeCorrection({
      itemId: "i1",
      itemCode: "RM-001",
      masterLeadTimeDays: 18,
      orders: [{ poLineId: "L1", orderedAt: d("2026-03-01"), firstReceiptAt: d("2026-04-10"), finalReceiptAt: d("2026-04-10"), receiptCount: 1, expedited: true }],
      expedites: [{ id: "e1", poLineId: "L1", occurredAt: d("2026-04-01"), rootCause: "INCORRECT_LEAD_TIME", premium: captured("80000", "EGP", d("2026-04-01")) }],
      fx: EGP_ONLY,
      historyFrom: d("2025-06-01"),
      asOf: ASOF,
      requiresAdditionalInventory: true,
      incrementalCarryingCost: null,
    });
    // The GROSS premium is an ACTUAL fact and is reported — it is what prioritises
    // capture requests. The NET is refused, because a gross premium presented as a
    // saving would overstate the benefit (D-014 rule 6).
    expect(isKnown(r.opportunity!.recurringImpact)).toBe(true);
    expect(isKnown(r.opportunity!.netImpact)).toBe(false);
    expect(r.opportunity!.netImpact.limitations.join(" ")).toMatch(/incremental cost cannot be valued/);
  });

  it("never annualises below twelve months of usable history (rules 11 and 12)", () => {
    const a = annualise([{ at: d("2026-11-01"), amount: value(money("100000"), "EGP", "ACTUAL", d("2026-11-01")) }], {
      historyFrom: d("2026-08-01"),
      asOf: d("2026-12-01"),
      unit: "EGP",
    });
    expect(isKnown(a.figure)).toBe(false);
    expect(a.ladder).toBe("OPPORTUNITY_DETECTED");
    expect(a.figure.limitations.join(" ")).toMatch(/scaled partial window is extrapolation/);
  });

  it("refuses to annualise a one-time impact — a level changes once", () => {
    expect(isKnown(refuseToAnnualiseOneTime("EGP", ASOF))).toBe(false);
  });
});

/* ========================================================================== */
describe("Q2 — Could the same saving appear twice?", () => {
  it("shows the deduction when overlapping claims are deduplicated, rather than filtering silently", () => {
    const a = opp({ id: "a" });
    const b = opp({ id: "b" });
    const h = potentialAnnualSaving({
      findings: [a, b],
      currency: "EGP",
      asOf: ASOF,
      dedupe: [
        {
          keptId: "a",
          removedId: "b",
          mechanism: "M01",
          explanation: "Same economic benefit: both claim the premium avoided on PO line L1.",
          amountRemoved: money("1000"),
        },
      ],
    });
    expect(h.upper.toFixed()).toBe("1000"); // not 2000
    expect(h.deduplicated).toHaveLength(1);
    expect(h.statements.join(" ")).toMatch(/deduplicated at the economic-mechanism level/);
  });

  it("does not deduplicate two genuinely independent effects on the same subject", () => {
    // D-020: subject-level deduplication UNDERSTATES. One PO line can carry a
    // freight premium fixed by planning and a price premium fixed by sourcing.
    const freight = opp({ id: "freight", mechanism: "M01" });
    const price = opp({ id: "price", mechanism: "M02" });
    const h = potentialAnnualSaving({ findings: [freight, price], currency: "EGP", asOf: ASOF });
    expect(h.upper.toFixed()).toBe("2000");
  });
});

/* ========================================================================== */
describe("Q3 — Could an exposure be accidentally counted as saving?", () => {
  const exposure: Exposure = {
    class: "EXPOSURE_RISK",
    id: "x1",
    kind: "STOCKOUT",
    title: "Stockout risk on RM-001",
    description: "Buffer is thin relative to observed lead-time variability",
    observedAt: ASOF,
  };

  it("excludes exposure from the headline structurally, not by a filter", () => {
    const findings: Finding[] = [opp(), exposure];
    const h = potentialAnnualSaving({ findings, currency: "EGP", asOf: ASOF });
    expect(h.upper.toFixed()).toBe("1000"); // the exposure contributed nothing
  });

  it("throws if a non-Opportunity is forced into the aggregation path", () => {
    expect(() => assertAggregable(exposure)).toThrow(AggregationViolation);
  });

  it("has no way to approve or realize an exposure", () => {
    expect(() => exposureCannotBeApproved()).toThrow(/never approved and never realized/);
  });

  it("carries no value, probability or severity anywhere on the exposure type", () => {
    expect(Object.keys(exposure)).toEqual(expect.not.arrayContaining(["value", "amount", "probability", "severity", "score"]));
  });

  it("never mixes ACTUAL cost with FORECAST exposure in one aggregate", () => {
    // The type system prevents it; this asserts the runtime guard too.
    const observed: Finding = {
      class: "OBSERVED_COST",
      id: "oc1",
      mechanism: "M01",
      title: "Demurrage incurred",
      amount: value(money("340000"), "EGP", "ACTUAL", ASOF),
      whyNotAvoidable: "Port congestion outside the factory's control",
      effectiveAsOf: ASOF,
    };
    const h = potentialAnnualSaving({ findings: [opp(), observed, exposure], currency: "EGP", asOf: ASOF });
    expect(h.upper.toFixed()).toBe("1000");
  });
});

/* ========================================================================== */
describe("Q4 — Could a forecast become an actual?", () => {
  it("degrades contagiously: anything computed from a FORECAST is at best a FORECAST", () => {
    const forecast = value(money("100"), "EGP", "FORECAST", ASOF);
    const actual = value(money("50"), "EGP", "ACTUAL", ASOF);
    const derived = derive(() => money("150"), { unit: "EGP", asOf: ASOF, from: [forecast, actual] });
    expect(derived.basis).toBe("FORECAST");
  });

  it("an aggregate carries the WEAKEST basis among its inputs", () => {
    expect(weakestBasis(["ACTUAL", "CALCULATED", "ESTIMATED"])).toBe("ESTIMATED");
    expect(weakestBasis(["ACTUAL", "STALE_DATA"])).toBe("STALE_DATA");
  });

  it("a computed value is never stronger than CALCULATED even from all-ACTUAL inputs", () => {
    const derived = derive(() => money("1"), { unit: "EGP", asOf: ASOF, from: [value(money("1"), "EGP", "ACTUAL", ASOF)] });
    expect(derived.basis).toBe("CALCULATED");
  });

  it("refuses to construct a valued envelope with basis INSUFFICIENT_DATA", () => {
    expect(() => value(money("1"), "EGP", "INSUFFICIENT_DATA", ASOF)).toThrow();
  });
});

/* ========================================================================== */
describe("Q5 — Could missing evidence be treated as equivalent evidence?", () => {
  it("UNESTABLISHED is never a pass", () => {
    expect(eligibleForCurrency([pass("a", "x"), unestablished("b", "unknown incoterm")])).toBe(false);
    expect(eligibleForCurrency([pass("a", "x"), fail("b", "no")])).toBe(false);
    expect(eligibleForCurrency([pass("a", "x"), pass("b", "y")])).toBe(true);
  });

  it("gates are never averaged into a score — there is no such function", async () => {
    const gates = await import("../lib/engine/gates");
    for (const banned of ["score", "weight", "average", "confidence"]) {
      expect(Object.keys(gates)).not.toContain(banned);
    }
  });

  it("INSUFFICIENT_DATA never becomes zero inside a sum (D-043)", () => {
    const members = [
      value(money("500"), "EGP", "ACTUAL", ASOF),
      insufficient<ReturnType<typeof money>>("EGP", ASOF, "freight not separable (F-01)"),
      value(money("300"), "EGP", "ACTUAL", ASOF),
    ];
    const p = partitionForAggregate(members);
    expect(p.included).toHaveLength(2);
    expect(p.excludedCount).toBe(1);
    expect(p.exclusionReasons.join(" ")).toMatch(/F-01/);
  });

  it("discloses excluded members on the headline and marks it a lower bound", () => {
    const good = opp({ id: "good" });
    const bad = opp({
      id: "bad",
      netImpact: insufficient("EGP", ASOF, "freight not separably captured (F-01)"),
      recurringImpact: insufficient("EGP", ASOF, "freight not separably captured (F-01)"),
    });
    const h = potentialAnnualSaving({ findings: [good, bad], currency: "EGP", asOf: ASOF });
    expect(h.upper.toFixed()).toBe("1000");
    expect(h.isLowerBound).toBe(true);
    expect(h.excluded).toHaveLength(1);
    expect(h.statements.join(" ")).toMatch(/LOWER BOUND, and the omission is optimistic/);
  });

  it("one uncomputable member does not make the whole headline uncomputable", () => {
    const good = opp({ id: "good" });
    const bad = opp({ id: "bad", netImpact: insufficient("EGP", ASOF, "missing") });
    const h = potentialAnnualSaving({ findings: [good, bad], currency: "EGP", asOf: ASOF });
    expect(h.basis).not.toBe("INSUFFICIENT_DATA");
  });
});

/* ========================================================================== */
describe("Q6 — Could an authoritative financial rate be misapplied?", () => {
  const valuationRate: FinancialRate = {
    id: "r-val",
    kind: "CARRYING_COMPONENT",
    rate: { toFixed: () => "0.22" } as never,
    unit: "ratio/yr",
    source: "Finance policy 2026",
    owner: "CFO",
    effectiveFrom: d("2026-01-01"),
    effectiveTo: null,
    status: "ACTIVE",
    purpose: "INVENTORY_VALUATION",
    basis: "USER_DEFINED",
  };

  it("blocks an authoritative rate used outside its stated purpose", () => {
    const r = requireRate(valuationRate, "MARGINAL_DECISION", { unit: "ratio/yr", asOf: ASOF, what: "carrying offset" });
    expect(isKnown(r)).toBe(false);
    expect(r.limitations.join(" ")).toMatch(/constructed for INVENTORY_VALUATION/);
  });

  it("blocks a rate whose purpose was never stated — silence is a gap, not permission", () => {
    const r = requireRate({ ...valuationRate, purpose: "UNSTATED" }, "MARGINAL_DECISION", { unit: "x", asOf: ASOF, what: "offset" });
    expect(isKnown(r)).toBe(false);
    expect(r.limitations.join(" ")).toMatch(/EVIDENCE GAP/);
  });

  it("invents no default when no rate exists", () => {
    const r = requireRate(null, "COST_OF_FUNDS", { unit: "ratio/yr", asOf: ASOF, what: "financing" });
    expect(isKnown(r)).toBe(false);
    expect(r.limitations.join(" ")).toMatch(/not 15%, not 20%, not any value/);
  });

  it("classifies obsolescence as EXPOSURE, never as a cost — a whole rate would net a risk", () => {
    const v = classifyComponent("OBSOLESCENCE", { spaceConstrained: true, handlingIsMarginal: true, insuranceIsValueBased: true, inventoryTaxApplies: true });
    expect(v.kind).toBe("EXPOSURE");
  });

  it("marks space NOT_VALID in an unconstrained owned warehouse — no incremental cash flow", () => {
    const v = classifyComponent("SPACE", { spaceConstrained: false, handlingIsMarginal: null, insuranceIsValueBased: null, inventoryTaxApplies: null });
    expect(v.kind).toBe("NOT_VALID");
  });

  it("returns UNKNOWN rather than guessing when the factory fact is missing", () => {
    const v = classifyComponent("SPACE", { spaceConstrained: null, handlingIsMarginal: null, insuranceIsValueBased: null, inventoryTaxApplies: null });
    expect(v.kind).toBe("UNKNOWN");
  });

  it("normalises each amount at its OWN effective date, never at a current rate", () => {
    const early = normalise(WITH_USD, captured("1000", "USD", d("2026-02-01")));
    const late = normalise(WITH_USD, captured("1000", "USD", d("2026-07-01")));
    expect(early.value!.toFixed()).toBe("30900"); // 30.90, the rate in force then
    expect(late.value!.toFixed()).toBe("48500");
    // Had a single current rate been applied, the earlier amount would have been
    // inflated by 57% and the "premium growth" would be pure currency movement.
  });

  it("refuses normalisation when no rate exists on or before the amount's date", () => {
    const r = normalise(WITH_USD, captured("1000", "USD", d("2025-01-01")));
    expect(isKnown(r)).toBe(false);
    expect(r.limitations.join(" ")).toMatch(/F-07/);
  });
});

/* ========================================================================== */
describe("Q7 — Could two recommendations contradict each other?", () => {
  it("detects opposed directions on the same dimension, subject and window", () => {
    const c = detectContradictions([
      { id: "a", signature: sig(DIMENSION.ORDER_QUANTITY, "INCREASE") },
      { id: "b", signature: sig(DIMENSION.ORDER_QUANTITY, "DECREASE") },
    ]);
    expect(c).toHaveLength(1);
  });

  it("does NOT flag Mechanism 01 against a safety-stock reduction — different components compose", () => {
    // reorder point = lead-time demand + safety stock. Treating the pair as
    // inherently contradictory would suppress a legitimate combined correction.
    const c = detectContradictions([
      { id: "m01", signature: sig(DIMENSION.LEAD_TIME_DEMAND, "INCREASE") },
      { id: "m03", signature: sig(DIMENSION.SAFETY_STOCK, "DECREASE") },
    ]);
    expect(c).toHaveLength(0);
  });

  it("does not flag opposed directions on different subjects", () => {
    const c = detectContradictions([
      { id: "a", signature: sig(DIMENSION.ORDER_QUANTITY, "INCREASE", "item-1") },
      { id: "b", signature: sig(DIMENSION.ORDER_QUANTITY, "DECREASE", "item-2") },
    ]);
    expect(c).toHaveLength(0);
  });

  it("does not flag opposed directions in non-overlapping windows", () => {
    const c = detectContradictions([
      { id: "a", signature: { subject: { type: "ITEM", itemId: "i" }, effects: [{ dimension: "order_quantity", direction: "INCREASE", windowFrom: d("2027-01-01"), windowTo: d("2027-03-01") }] } },
      { id: "b", signature: { subject: { type: "ITEM", itemId: "i" }, effects: [{ dimension: "order_quantity", direction: "DECREASE", windowFrom: d("2027-06-01"), windowTo: d("2027-09-01") }] } },
    ]);
    expect(c).toHaveLength(0);
  });

  it("refuses to present an Opportunity with no signature", () => {
    expect(() => assertPresentable("o9", null)).toThrow(MissingSignatureError);
    expect(() => assertPresentable("o9", { subject: { type: "ITEM", itemId: "i" }, effects: [] })).toThrow(MissingSignatureError);
  });
});

/* ========================================================================== */
describe("Q8 — Could a manager misunderstand a principal as a benefit?", () => {
  it("keeps one-time strictly separate from the annual figure", () => {
    const o = opp({ oneTimeImpact: value(money("200000"), "EGP", "ACTUAL", ASOF) });
    const h = potentialAnnualSaving({ findings: [o], currency: "EGP", asOf: ASOF });
    expect(h.upper.toFixed()).toBe("1000"); // the 200,000 is NOT in the annual figure
    expect(h.oneTimeSeparate.toFixed()).toBe("200000");
    expect(h.statements.join(" ")).toMatch(/NEVER summed into the annual figure/);
  });

  it("declares when a net figure excludes an unvalued risk, and that the omission is optimistic", () => {
    const o = opp({ netExcludesUnvaluedRisk: true });
    const h = potentialAnnualSaving({ findings: [o], currency: "EGP", asOf: ASOF });
    expect(h.statements.join(" ")).toMatch(/optimistic by an unquantified amount/);
  });

  it("the rendered headline never appears as a bare number", () => {
    const h = potentialAnnualSaving({ findings: [opp()], currency: "EGP", asOf: ASOF });
    expect(describeHeadline(h)).toMatch(/basis/);
  });
});

/* ========================================================================== */
describe("the float guard (D-047)", () => {
  it("refuses a JavaScript number for money or quantity", () => {
    expect(() => money(0.1 as never)).toThrow(InexactInputError);
    expect(() => qty(1 as never)).toThrow(InexactInputError);
  });

  it("adds exactly where binary floating point does not", () => {
    expect(money("0.1").plus(money("0.2")).toFixed()).toBe("0.3");
    expect(0.1 + 0.2).not.toBe(0.3); // the failure being guarded against
  });
});
