/**
 * THE OFFSET — financial correctness tests.
 *
 * The offset is the only thing standing between a gross premium and a net saving,
 * so it is the single most profitable place in the system to cheat. Every test
 * here exists to prove it does not.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { sql } from "../lib/db/client";
import { money, qty } from "../lib/core/decimal";
import { isKnown } from "../lib/core/provenance";
import { classifyComponent } from "../lib/core/rate";
import { APPLICABLE_COMPONENTS, computeOffset, observedConsumption } from "../lib/engine/offset";
import { postMovement } from "../lib/ledger/post";
import { type Ctx, d, makeItem, resetDb, seedWorld } from "./helpers";

let ctx: Ctx;
const ASOF = d("2027-01-01T00:00:00Z");
const WINDOW_FROM = d("2025-06-01T00:00:00Z");

beforeEach(async () => {
  await resetDb();
  ctx = await seedWorld();
});

/* -------------------------------------------------------------------------- */

async function facts(over: Partial<Record<string, boolean>> = {}) {
  const base: Record<string, [string, boolean]> = {
    space_constrained: ["F-33", false],
    handling_is_marginal: ["F-08", false],
    insurance_is_value_based: ["F-08", true],
    inventory_tax_applies: ["F-40", false],
  };
  for (const [key, [ref, dflt]] of Object.entries(base)) {
    const v = key in over ? over[key] : dflt;
    if (v === undefined) continue; // omitted entirely = UNANSWERED
    await sql`INSERT INTO factory_facts (site_id, ref, key, value, source, answered_by, is_demo)
              VALUES (${ctx.siteId}::uuid, ${ref}, ${key}, ${v}, 'test', 'test', true)
              ON CONFLICT (site_id, key) DO NOTHING`;
  }
}

async function rate(kind: string, r: string, purpose: string, status = "ACTIVE") {
  // One rate per component per site: a second ACTIVE row is an ambiguity, and the
  // engine refuses it. The helper is therefore idempotent by design.
  const rows = await sql<{ n: string }[]>`
    SELECT COUNT(*)::text AS n FROM financial_rates WHERE site_id = ${ctx.siteId}::uuid AND kind = ${kind}`;
  if (Number(rows[0]!.n) > 0) return;
  await sql`INSERT INTO financial_rates (site_id, kind, rate, unit, source, owner, effective_from, status, purpose, basis)
            VALUES (${ctx.siteId}::uuid, ${kind}, ${r}, 'ratio/yr', 'test', 'Finance',
                    '2026-01-01'::timestamptz, ${status}, ${purpose}, 'USER_DEFINED')`;
}

async function costRef(itemId: string, unit: string, currency = "EGP", asOf = "2026-11-01") {
  await sql`INSERT INTO cost_references (item_id, unit_cost, currency, as_of, source)
            VALUES (${itemId}::uuid, ${unit}, ${currency}, ${asOf}::timestamptz, 'finance export')`;
}

/** N monthly issues of `each`, ending before asOf. */
async function consume(itemId: string, months: number, each: string) {
  for (let m = 0; m < months; m++) {
    const day = new Date(Date.UTC(2026, m, 12, 8));
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.PROD!,
      nominalQty: qty(each), nominalUom: "kg", effectiveAt: day,
      sourceDocumentType: "ISSUE", sourceDocumentId: `I-${m}`, reasonCode: "CONSUMPTION",
      actor: "ops", sourceNaturalKey: `iss:${itemId}:${m}`,
    });
  }
}

async function stock(itemId: string, q: string) {
  await postMovement({
    siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.OPEN!, toLocationId: ctx.loc.WH1!,
    nominalQty: qty(q), nominalUom: "kg", effectiveAt: d("2025-06-01"),
    sourceDocumentType: "OPENING_BALANCE", sourceDocumentId: "GOLIVE", reasonCode: "GO_LIVE",
    actor: "admin", sourceNaturalKey: `open:${itemId}`,
  });
}

const run = (itemId: string, master = 18, corrected = 38) =>
  computeOffset({
    siteId: ctx.siteId, itemId, itemCode: "RM-O", masterLeadTimeDays: master,
    correctedLeadTimeDays: corrected, windowFrom: WINDOW_FROM, asOf: ASOF, currency: "EGP",
  });

async function fullyEquipped(code = "RM-O", months = 12, each = "310") {
  const itemId = await makeItem(ctx.siteId, { code, leadTimeDays: 18 });
  await stock(itemId, "10000");
  await consume(itemId, months, each);
  await costRef(itemId, "412.50");
  await facts();
  await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
  await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
  return itemId;
}

/* ========================================================================== */
describe("the offset is DERIVED from the observed position path", () => {
  it("reads consumption from the ledger, and the figure follows it", async () => {
    const itemId = await fullyEquipped();
    const c = await observedConsumption(itemId, d("2026-01-01"), ASOF);
    expect(c.total.toFixed()).toBe("3720"); // 12 × 310, an ACTUAL ledger quantity
    expect(c.issueCount).toBe(12);

    const r = await run(itemId);
    // rate = 3720/365 = 10.191780…; ΔQ = rate × 20 days
    expect(r.deltaQuantity.value!.toFixed(4)).toBe("203.8356");
    expect(r.deltaQuantity.basis).toBe("CALCULATED");
    expect(r.deltaQuantity.coverage.join(" ")).toMatch(/observed consumption/);
  });

  it("is not a constant: doubling consumption doubles the offset", async () => {
    const a = await fullyEquipped("RM-A", 12, "310");
    const b = await fullyEquipped("RM-B", 12, "620");
    const ra = await run(a);
    const rb = await run(b);
    const ratio = rb.cost.value!.div(ra.cost.value!);
    expect(ratio.toFixed(6)).toBe("2.000000");
  });

  it("is not a constant: doubling the lead-time gap doubles the offset", async () => {
    const itemId = await fullyEquipped();
    const twenty = await run(itemId, 18, 38);
    const forty = await run(itemId, 18, 58);
    expect(forty.cost.value!.div(twenty.cost.value!).toFixed(6)).toBe("2.000000");
  });

  it("scales with the cost reference, because the stock is valued not assumed", async () => {
    const a = await makeItem(ctx.siteId, { code: "RM-C1", leadTimeDays: 18 });
    await stock(a, "10000"); await consume(a, 12, "310"); await costRef(a, "100");
    const b = await makeItem(ctx.siteId, { code: "RM-C2", leadTimeDays: 18 });
    await stock(b, "10000"); await consume(b, 12, "310"); await costRef(b, "300");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    expect((await run(b)).cost.value!.div((await run(a)).cost.value!).toFixed(6)).toBe("3.000000");
  });

  it("reconciles to hand arithmetic", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    // 3720/365 × 20 × 412.50 × (0.2725 + 0.004)
    const expected = money("3720").div(365).times(20).times("412.50").times("0.2765");
    expect(r.cost.value!.toFixed(6)).toBe(expected.toFixed(6));
  });

  it("uses the SAME twelve-month window as the gross, so the two are comparable", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-W", leadTimeDays: 18 });
    await stock(itemId, "20000");
    // Consumption in 2025 is OUTSIDE the twelve months ending at asOf.
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.PROD!,
      nominalQty: qty("9000"), nominalUom: "kg", effectiveAt: d("2025-08-01"),
      sourceDocumentType: "ISSUE", sourceDocumentId: "OLD", reasonCode: "CONSUMPTION",
      actor: "ops", sourceNaturalKey: "old-iss",
    });
    await consume(itemId, 12, "310");
    await costRef(itemId, "412.50"); await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");

    const r = await run(itemId);
    // The 9,000 kg from 2025 is excluded: the rate is 3720/365, not 12720/579.
    expect(r.deltaQuantity.value!.toFixed(4)).toBe("203.8356");
  });
});

/* ========================================================================== */
describe("the correct F-08 components are used", () => {
  it("applies CAPITAL and INSURANCE; excludes SPACE and INVENTORY_TAX on the factory's answers", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    const applied = r.components.filter((c) => c.verdict === "APPLIED").map((c) => c.component);
    expect(applied.sort()).toEqual(["CAPITAL", "INSURANCE"]);

    const notValid = r.components.filter((c) => c.verdict === "NOT_VALID").map((c) => c.component);
    expect(notValid).toContain("SPACE");         // warehouse is not constrained
    expect(notValid).toContain("INVENTORY_TAX"); // not applicable in this jurisdiction
  });

  it("HANDLING is excluded because throughput does not change — decision-specific, not generic", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    const h = r.components.find((c) => c.component === "HANDLING")!;
    expect(h.verdict).toBe("NOT_VALID");
    expect(h.why).toMatch(/moves no additional goods/);
    // …and it stays excluded even when the factory says handling IS marginal.
    await sql`UPDATE factory_facts SET value = true WHERE key = 'handling_is_marginal' AND site_id = ${ctx.siteId}::uuid`;
    const r2 = await run(itemId);
    expect(r2.components.find((c) => c.component === "HANDLING")!.verdict).toBe("NOT_VALID");
  });

  it("SPACE applies when the warehouse IS constrained, and then needs its own rate", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-S", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts({ space_constrained: true });
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    // No CARRYING_SPACE rate exists, so the component is applicable and unpriced.
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/SPACE/);
  });

  it("APPLICABLE_COMPONENTS contains no risk component", async () => {
    expect(APPLICABLE_COMPONENTS).not.toContain("OBSOLESCENCE");
    expect(APPLICABLE_COMPONENTS).not.toContain("SHRINKAGE_FUTURE");
  });
});

/* ========================================================================== */
describe("obsolescence can never enter carrying cost as a certain cost", () => {
  it("is classified EXPOSURE and disclosed, never priced", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);

    const obs = r.components.find((c) => c.component === "OBSOLESCENCE")!;
    expect(obs.verdict).toBe("EXPOSURE");
    expect(obs.amountPerYear).toBeNull();
    expect(obs.ratePerYear).toBeNull();

    expect(r.exposuresDisclosed.map((e) => e.component)).toContain("OBSOLESCENCE");
    expect(r.cost.limitations.join(" ")).toMatch(/Excluded as risks, never netted.*OBSOLESCENCE/);
  });

  it("future shrinkage is an exposure; past shrinkage is not smuggled in either", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    expect(r.exposuresDisclosed.map((e) => e.component)).toContain("SHRINKAGE_FUTURE");
    expect(r.components.find((c) => c.component === "SHRINKAGE_PAST")).toBeUndefined();
  });

  it("classification is structural — obsolescence is EXPOSURE whatever the factory answers", () => {
    for (const spaceConstrained of [true, false, null]) {
      const v = classifyComponent("OBSOLESCENCE", {
        spaceConstrained, handlingIsMarginal: true, insuranceIsValueBased: true, inventoryTaxApplies: true,
      });
      expect(v.kind).toBe("EXPOSURE");
    }
  });
});

/* ========================================================================== */
describe("an unfit rate is rejected", () => {
  it("REFUSES a valuation rate for a marginal decision", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-U", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    // Authoritative, finance-owned — and built for VALUATION.
    await rate("CARRYING_INSURANCE", "0.22", "INVENTORY_VALUATION");

    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/constructed for INVENTORY_VALUATION/);
    expect(r.components.find((c) => c.component === "INSURANCE")!.verdict).toBe("RATE_UNFIT");
  });

  it("REFUSES a rate whose purpose was never stated", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-UN", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "UNSTATED");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/EVIDENCE GAP/);
  });

  it("REFUSES a superseded rate", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-SP", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS", "SUPERSEDED");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/SUPERSEDED/);
  });

  it("a generic carrying rate prices no component and cannot be substituted", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-G", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_COMPONENT", "0.22", "MARGINAL_DECISION"); // names no component
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/INSURANCE/);
  });
});

/* ========================================================================== */
describe("missing data produces INSUFFICIENT_DATA, never a guess", () => {
  it("an UNANSWERED factory fact blocks the whole offset", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-F", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts({ space_constrained: undefined }); // F-33 unanswered
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/F-33/);
    expect(r.cost.limitations.join(" ")).toMatch(/partial carrying cost would understate the offset/);
  });

  it("no cost-of-funds rate blocks the offset — no default is invented", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-NR", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts();
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/not 15%, not 20%, not any value/);
  });

  it("no cost reference blocks the offset — this system does not compute value", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-NC", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/finance owns it/);
  });

  it("a cost reference in another currency is refused, not converted", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-FX", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310");
    await costRef(itemId, "13.35", "USD");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.cost.limitations.join(" ")).toMatch(/not the reporting currency/);
  });

  it("states the cost reference's AGE rather than classifying it stale — N-09 is undefined", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    expect(r.oneTimePositionChange.limitations.join(" ")).toMatch(/No staleness threshold is defined \(N-09\)/);
  });
});

/* ========================================================================== */
describe("dead stock is not treated as excess working capital", () => {
  it("an item the ledger shows no consumption for carries NO capital claim", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-DEAD", leadTimeDays: 18 });
    await stock(itemId, "18000"); // plenty of stock, never issued
    await costRef(itemId, "412.50");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");

    const r = await run(itemId);
    expect(r.cost.value!.toFixed()).toBe("0");
    expect(r.requiresAdditionalInventory).toBe(false);
    expect(r.components.filter((c) => c.verdict === "APPLIED")).toHaveLength(0);
    expect(r.cost.limitations.join(" ")).toMatch(/capital is lost, not tied/);
  });

  it("the offset is proportional to stock that MOVES, not to stock on hand", async () => {
    // Two items with identical on-hand and cost; only consumption differs.
    const slow = await makeItem(ctx.siteId, { code: "RM-SLOW", leadTimeDays: 18 });
    await stock(slow, "18000"); await consume(slow, 12, "10"); await costRef(slow, "412.50");
    const fast = await makeItem(ctx.siteId, { code: "RM-FAST", leadTimeDays: 18 });
    await stock(fast, "18000"); await consume(fast, 12, "310"); await costRef(fast, "412.50");
    await facts();
    await rate("COST_OF_FUNDS", "0.2725", "COST_OF_FUNDS");
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");

    const rs = await run(slow);
    const rf = await run(fast);
    expect(rf.cost.value!.div(rs.cost.value!).toFixed(4)).toBe("31.0000");
  });
});

/* ========================================================================== */
describe("the one-time position change is never a recurring cost or a saving", () => {
  it("is reported separately from the recurring carrying cost", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    // ΔV = 203.8356 × 412.50 = 84,082.19; the recurring cost is a fraction of it.
    expect(r.oneTimePositionChange.value!.toFixed(2)).toBe("84082.19");
    expect(r.cost.value!.lessThan(r.oneTimePositionChange.value!)).toBe(true);
  });

  it("declares itself a POSITION CHANGE, not a cost and not a saving", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    expect(r.oneTimePositionChange.limitations.join(" ")).toMatch(/POSITION CHANGE, not a cost and not a saving/);
    expect(r.oneTimePositionChange.limitations.join(" ")).toMatch(/never annualised/);
  });

  it("carries USER_DEFINED basis from the imported cost reference — never CALCULATED", async () => {
    const itemId = await fullyEquipped();
    const r = await run(itemId);
    expect(r.oneTimePositionChange.basis).toBe("USER_DEFINED");
    expect(r.cost.basis).toBe("USER_DEFINED"); // contagion: no stronger than its inputs
  });
});

/* ========================================================================== */
describe("the offset can never make the net exceed the gross", () => {
  it("is never negative", async () => {
    const itemId = await fullyEquipped();
    for (const [m, c] of [[18, 38], [18, 19], [30, 31]] as const) {
      const r = await run(itemId, m, c);
      expect(r.cost.value!.isNegative()).toBe(false);
    }
  });

  it("is exactly zero when the corrected lead time does not exceed the master value", async () => {
    const itemId = await fullyEquipped();
    for (const [m, c] of [[38, 38], [38, 20]] as const) {
      const r = await run(itemId, m, c);
      expect(r.cost.value!.toFixed()).toBe("0");
      expect(r.requiresAdditionalInventory).toBe(false);
    }
  });

  it("a larger gap always costs more, never less", async () => {
    const itemId = await fullyEquipped();
    let previous = money("-1");
    for (const gap of [1, 5, 20, 60]) {
      const r = await run(itemId, 18, 18 + gap);
      expect(r.cost.value!.greaterThan(previous)).toBe(true);
      previous = r.cost.value!;
    }
  });
});

/* ========================================================================== */
describe("consumption is read from the ledger, not from orders", () => {
  it("counts only stock leaving on-hand for a consuming destination", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-Q" });
    await stock(itemId, "5000");
    await consume(itemId, 3, "100");
    // A transfer to quality hold is NOT consumption.
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.QH!,
      nominalQty: qty("900"), nominalUom: "kg", effectiveAt: d("2026-05-01"),
      sourceDocumentType: "HOLD", sourceDocumentId: "H", reasonCode: "QUALITY_HOLD",
      actor: "ops", sourceNaturalKey: "hold-q",
    });
    // Nor is a return to the supplier.
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.SUP!,
      nominalQty: qty("400"), nominalUom: "kg", effectiveAt: d("2026-06-01"),
      sourceDocumentType: "RTV", sourceDocumentId: "R", reasonCode: "RETURN_TO_SUPPLIER",
      actor: "ops", sourceNaturalKey: "rtv-q",
    });
    const c = await observedConsumption(itemId, d("2026-01-01"), ASOF);
    expect(c.total.toFixed()).toBe("300"); // 3 × 100 only
  });

  it("uses ACTUAL weight for catch-weight items, not nominal units", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "CW-Q", catchWeight: true, nominalUom: "bag", stockUom: "kg" });
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.OPEN!, toLocationId: ctx.loc.WH1!,
      nominalQty: qty("100"), nominalUom: "bag", actualQty: qty("2500"), actualUom: "kg",
      effectiveAt: d("2025-06-01"), sourceDocumentType: "OPENING_BALANCE", sourceDocumentId: "G",
      reasonCode: "GO_LIVE", actor: "admin", sourceNaturalKey: "cw-open",
    });
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.PROD!,
      nominalQty: qty("12"), nominalUom: "bag", actualQty: qty("299.2"), actualUom: "kg",
      effectiveAt: d("2026-03-01"), sourceDocumentType: "ISSUE", sourceDocumentId: "I",
      reasonCode: "CONSUMPTION", actor: "ops", sourceNaturalKey: "cw-iss",
    });
    const c = await observedConsumption(itemId, d("2026-01-01"), ASOF);
    expect(c.total.toFixed()).toBe("299.2");
  });
});

/* ========================================================================== */
describe("two ACTIVE rates for one component is an ambiguity, not a choice", () => {
  it("BLOCKS rather than silently picking one of finance's two answers", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-AMB", leadTimeDays: 18 });
    await stock(itemId, "10000"); await consume(itemId, 12, "310"); await costRef(itemId, "412.50");
    await facts();
    await rate("CARRYING_INSURANCE", "0.004", "MARGINAL_DECISION");
    // Two ACTIVE cost-of-funds rates with different values, inserted directly so
    // the helper's guard does not hide the case being tested.
    for (const r of ["0.2725", "0.1900"]) {
      await sql`INSERT INTO financial_rates (site_id, kind, rate, unit, source, owner, effective_from, status, purpose, basis)
                VALUES (${ctx.siteId}::uuid, 'COST_OF_FUNDS', ${r}, 'ratio/yr', 'test', 'Finance',
                        '2026-01-01'::timestamptz, 'ACTIVE', 'COST_OF_FUNDS', 'USER_DEFINED')`;
    }
    const r = await run(itemId);
    expect(isKnown(r.cost)).toBe(false);
    expect(r.components.find((c) => c.component === "CAPITAL")!.verdict).toBe("RATE_UNFIT");
  });
});

/* ========================================================================== */
describe("the NET carries the weakest basis of its inputs (D-002 contagion)", () => {
  it("does not present a net resting on an imported cost reference as CALCULATED", async () => {
    const { detectLeadTimeCorrection } = await import("../lib/engine/mechanisms/m01-leadtime");
    const { captured, fxObservation } = await import("../lib/core/fx");
    const itemId = await fullyEquipped("RM-BASIS");
    const offset = await run(itemId);
    expect(offset.cost.basis).toBe("USER_DEFINED"); // the cost reference floors it

    const res = detectLeadTimeCorrection({
      itemId, itemCode: "RM-BASIS", masterLeadTimeDays: 18,
      orders: [{ poLineId: "L1", orderedAt: d("2026-02-01"), firstReceiptAt: d("2026-03-11"),
                 finalReceiptAt: d("2026-03-11"), receiptCount: 1, expedited: true }],
      expedites: [{ id: "e1", poLineId: "L1", occurredAt: d("2026-03-05"),
                    rootCause: "INCORRECT_LEAD_TIME", premium: captured("50000", "EGP", d("2026-03-05")) }],
      fx: { reportingCurrency: "EGP", owner: "Finance",
            observations: [fxObservation("USD", "EGP", "48.5", d("2025-01-01"), "CBE", "Finance")] },
      historyFrom: d("2025-06-01"), asOf: ASOF,
      requiresAdditionalInventory: offset.requiresAdditionalInventory,
      incrementalCarryingCost: offset.cost,
    });

    // gross is ACTUAL-derived, offset is USER_DEFINED — the net must be the weaker.
    expect(res.opportunity!.recurringImpact.basis).toBe("CALCULATED");
    expect(res.opportunity!.netImpact.basis).toBe("USER_DEFINED");
  });

  it("the net never exceeds the gross once an offset applies", async () => {
    const { detectLeadTimeCorrection } = await import("../lib/engine/mechanisms/m01-leadtime");
    const { captured, fxObservation } = await import("../lib/core/fx");
    const itemId = await fullyEquipped("RM-NETLE");
    const offset = await run(itemId);
    const res = detectLeadTimeCorrection({
      itemId, itemCode: "RM-NETLE", masterLeadTimeDays: 18,
      orders: [{ poLineId: "L1", orderedAt: d("2026-02-01"), firstReceiptAt: d("2026-03-11"),
                 finalReceiptAt: d("2026-03-11"), receiptCount: 1, expedited: true }],
      expedites: [{ id: "e1", poLineId: "L1", occurredAt: d("2026-03-05"),
                    rootCause: "INCORRECT_LEAD_TIME", premium: captured("50000", "EGP", d("2026-03-05")) }],
      fx: { reportingCurrency: "EGP", owner: "Finance",
            observations: [fxObservation("USD", "EGP", "48.5", d("2025-01-01"), "CBE", "Finance")] },
      historyFrom: d("2025-06-01"), asOf: ASOF,
      requiresAdditionalInventory: offset.requiresAdditionalInventory,
      incrementalCarryingCost: offset.cost,
    });
    const gross = res.opportunity!.recurringImpact.value!;
    const net = res.opportunity!.netImpact.value!;
    expect(net.lessThanOrEqualTo(gross)).toBe(true);
    expect(gross.minus(net).toFixed(6)).toBe(offset.cost.value!.toFixed(6));
  });
});
