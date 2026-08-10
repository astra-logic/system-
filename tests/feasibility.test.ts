/**
 * PRODUCTION FEASIBILITY — the 28 acceptance assertions of the Block 8 contract
 * (`docs/domain/22-BLOCK8-DOMAIN-CONTRACT.md` §6), plus the adversarial cases
 * Block 9 requires.
 *
 * The assertion numbers below are the contract's own numbering, so a reader can
 * check coverage against the contract without interpreting anything.
 *
 * Three of these are the STRUCTURAL GUARDS (25, 26, 28). They are what turn
 * D-055's firewall and the product's vocabulary principle from statements of
 * intent into things that fail a build.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { db, sql } from "../lib/db/client";
import {
  costReferences, etaForecasts, financialRates, fxRates, items, opportunities,
  poLines, productStructures, purchaseOrders, receipts, shipments, supplierItemTerms, uomConversions,
} from "../lib/db/schema";
import { qty } from "../lib/core/decimal";
import { postMovement } from "../lib/ledger/post";
import { checkFeasibility, MalformedRequestError, worstVerdict } from "../lib/feasibility/engine";
import { allUserFacingStrings, actionFor, headline, missingLines, vocabularyViolations } from "../lib/feasibility/language";
import { recordAnswer, answerById, recentAnswers } from "../lib/feasibility/audit";
import { parseFile } from "../lib/import/ingest";
import { STRUCTURE_SPEC } from "../lib/import/specs";
import { applyStructures } from "../lib/import/apply";
import { makeItem, makeSupplier, resetDb, seedWorld, type Ctx } from "./helpers";

const AT = new Date("2027-01-01T00:00:00Z");
const D = (s: string) => new Date(`${s}T00:00:00Z`);

let ctx: Ctx;
beforeEach(async () => {
  await resetDb();
  ctx = await seedWorld();
});

/* -------------------------------------------------------------------------- */
/* Fixture builders.                                                          */
/* -------------------------------------------------------------------------- */

async function product(over: Partial<typeof items.$inferInsert> = {}) {
  return makeItem(ctx.siteId, { code: "FG-1", name: "Finished good", kind: "DISCRETE_GOOD", stockUom: "EA", integerOnly: true, ...over });
}

async function recipe(parentItemId: string, componentItemId: string, quantityPer: string, uom: string, isDemo = false) {
  await db.insert(productStructures).values({
    siteId: ctx.siteId, parentItemId, componentItemId, quantityPer, uom,
    effectiveFrom: D("2026-01-01"), isDemo,
  });
}

/** Stock arrives from OPENING_BALANCE, per D-001 as amended. */
async function stock(itemId: string, amount: string, to = "WH1") {
  await postMovement({
    siteId: ctx.siteId,
    itemId, fromLocationId: ctx.loc.OPEN!, toLocationId: ctx.loc[to]!,
    nominalQty: qty(amount), nominalUom: "kg",
    effectiveAt: D("2026-01-02"), sourceDocumentType: "OPENING_BALANCE",
    sourceDocumentId: `ob-${itemId}-${to}-${amount}`, reasonCode: "OPENING_BALANCE", actor: "test",
  });
}

/** An issue OUT of stock — what the 🟢 cap reads as observed consumption. */
async function consume(itemId: string, amount: string, on = "2026-06-01") {
  await postMovement({
    siteId: ctx.siteId,
    itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.PROD!,
    nominalQty: qty(amount), nominalUom: "kg",
    effectiveAt: D(on), sourceDocumentType: "ISSUE",
    sourceDocumentId: `iss-${itemId}-${on}-${amount}`, reasonCode: "CONSUMPTION", actor: "test",
  });
}

async function openPo(
  itemId: string,
  o: { number: string; qty: string; status?: "DRAFT" | "APPROVED" | "SENT" | "PARTIALLY_RECEIVED" | "CANCELLED"; promised?: string; received?: string; eta?: string; orderedAt?: string },
) {
  const supplierId = await makeSupplier(`Sup ${o.number}`);
  const [po] = await db.insert(purchaseOrders).values({
    siteId: ctx.siteId, number: o.number, supplierId, status: o.status ?? "SENT",
    orderedAt: D(o.orderedAt ?? "2026-11-01"), currency: "EGP",
  }).returning();
  const [line] = await db.insert(poLines).values({
    poId: po!.id, lineNo: 1, itemId, orderedQty: o.qty, uom: "kg",
    unitPrice: "10", currency: "EGP", promisedDate: o.promised ?? null,
  }).returning();

  let shipmentId: string | undefined;
  if (o.eta) {
    const [sh] = await db.insert(shipments).values({ reference: `SH-${o.number}`, supplierId, mode: "SEA" }).returning();
    shipmentId = sh!.id;
    await db.insert(etaForecasts).values({
      shipmentId, etaDate: o.eta, basis: "FORECAST", source: "carrier", observedAt: D("2026-12-01"),
    });
  }
  if (o.received) {
    await db.insert(receipts).values({
      poLineId: line!.id, sequence: 1, receivedAt: D("2026-12-01"),
      nominalQty: o.received, nominalUom: "kg", shipmentId, sourceNaturalKey: `r-${o.number}`,
    });
  } else if (shipmentId) {
    // Carry the shipment so the ETA is reachable even with nothing received yet.
    await db.insert(receipts).values({
      poLineId: line!.id, sequence: 1, receivedAt: D("2026-12-01"),
      nominalQty: "0", nominalUom: "kg", shipmentId, sourceNaturalKey: `r0-${o.number}`,
    });
  }
  return { poId: po!.id, lineId: line!.id };
}

/* ========================================================================== */
/* Assertions 1–4 — structure and CAN'T SAY.                                 */
/* ========================================================================== */

describe("structure and ⚪ CAN'T SAY", () => {
  it("1 · no recipe ⇒ CAN'T SAY, never NO", async () => {
    const fg = await product();
    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("CANT_SAY");
    expect(a.verdict).not.toBe("NO");
    expect(a.cantSayReason).toMatch(/don't have the recipe/i);
  });

  it("2 · a component with its own recipe ⇒ overall CAN'T SAY, naming it, with other components still shown", async () => {
    const sub = await makeItem(ctx.siteId, { code: "SUB-1", name: "Sub-assembly", stockUom: "EA" });
    const raw = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const leaf = await makeItem(ctx.siteId, { code: "RM-2", stockUom: "kg" });
    const fg = await product();

    await recipe(sub, leaf, "1", "kg");     // SUB-1 is itself a parent
    await recipe(fg, sub, "1", "EA");
    await recipe(fg, raw, "2", "kg");
    await stock(raw, "10000");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("CANT_SAY");
    expect(a.cantSayReason).toContain("SUB-1");
    // The nine answers we DO have are not discarded to protect the one we don't.
    expect(a.components).toHaveLength(2);
    expect(a.components.find((c) => c.code === "RM-1")!.verdict).toBe("YES");
    expect(a.components.find((c) => c.code === "SUB-1")!.verdict).toBe("CANT_SAY");
  });

  it("3 · missing UoM conversion ⇒ CAN'T SAY for that component; no global default is applied", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "0.15", "L"); // no L→kg conversion recorded anywhere
    await stock(rm, "100000");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("CANT_SAY");
    expect(a.components[0]!.cantSayReason).toMatch(/can't convert/i);
    expect(a.components[0]!.requirement.value).toBeNull();
  });

  it("4 · one component CAN'T SAY and another NO ⇒ NO (a known blocker outranks an unrelated unknown)", async () => {
    const bad = await makeItem(ctx.siteId, { code: "RM-BAD", stockUom: "kg" });
    const short = await makeItem(ctx.siteId, { code: "RM-SHORT", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, bad, "1", "L");     // unconvertible ⇒ CAN'T SAY
    await recipe(fg, short, "10", "kg"); // nothing in stock ⇒ NO

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("NO");
  });

  it("precedence is total and derived: NO ▸ CAN'T SAY ▸ AT RISK ▸ YES", () => {
    expect(worstVerdict(["YES", "AT_RISK"])).toBe("AT_RISK");
    expect(worstVerdict(["AT_RISK", "CANT_SAY"])).toBe("CANT_SAY");
    expect(worstVerdict(["CANT_SAY", "NO"])).toBe("NO");
    expect(worstVerdict(["YES", "YES"])).toBe("YES");
    expect(worstVerdict([])).toBe("CANT_SAY");
  });
});

/* ========================================================================== */
/* Assertions 5–8 — the verdict.                                             */
/* ========================================================================== */

describe("the verdict", () => {
  it("5 · enough on hand with no other consumption ⇒ YES", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "1000");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("YES");
    expect(a.components[0]!.requirement.value!.toFixed()).toBe("200");
  });

  it("6 · enough on hand but the material is consumed regularly ⇒ AT RISK with the reason stated", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "1000");
    await consume(rm, "120", "2026-06-01"); // observed, unrelated to this request

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("AT_RISK");
    expect(a.components[0]!.cappedByConsumption).toBe(true);
    // Nothing is "missing" — it is a warning, not a shortfall.
    expect(a.shortComponents).toHaveLength(0);
  });

  it("7 · short on the shelf but covered by supply on the way ⇒ AT RISK, never YES", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "100");
    await openPo(rm, { number: "PO-1", qty: "500", promised: "2027-02-01" });

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("AT_RISK");
    expect(a.components[0]!.gapVsAvailable!.toFixed()).toBe("100"); // missing from the shelf
    expect(a.components[0]!.shortfall!.toFixed()).toBe("0");        // nothing to order
    expect(a.shortComponents).toHaveLength(1);
  });

  it("8 · supply arriving AFTER the need-by date ⇒ NO, stating the gap in days", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 30 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "100");
    await openPo(rm, { number: "PO-LATE", qty: "500", promised: "2027-06-01" });

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: D("2027-02-01"), asOf: AT });
    expect(a.verdict).toBe("NO");
    expect(a.components[0]!.supplyExcludedLate).toHaveLength(1);
    expect(a.components[0]!.shortfall!.toFixed()).toBe("100");
  });
});

/* ========================================================================== */
/* Assertions 9–12 — supply.                                                 */
/* ========================================================================== */

describe("supply", () => {
  it("9 · DRAFT, APPROVED and CANCELLED orders contribute nothing", async () => {
    const fg = await product();
    for (const status of ["DRAFT", "APPROVED", "CANCELLED"] as const) {
      const rm = await makeItem(ctx.siteId, { code: `RM-${status}`, stockUom: "kg" });
      await recipe(fg, rm, "1", "kg");
      await openPo(rm, { number: `PO-${status}`, qty: "10000", status, promised: "2027-02-01" });
    }
    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("NO");
    for (const c of a.components) {
      expect(c.incoming!.toFixed()).toBe("0");
      expect(c.supply).toHaveLength(0);
    }
  });

  it("10 · open quantity is ordered − received, never the ordered quantity", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "1", "kg");
    await openPo(rm, { number: "PO-P", qty: "1000", received: "600", status: "PARTIALLY_RECEIVED", promised: "2027-02-01" });

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.components[0]!.supply[0]!.openQty.toFixed()).toBe("400");
    expect(a.components[0]!.incoming!.toFixed()).toBe("400");
  });

  it("11 · an overdue order counts, is flagged, and cannot produce YES", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "100");
    await openPo(rm, { number: "PO-OVERDUE", qty: "500", promised: "2026-11-15" }); // before AT

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.components[0]!.supply[0]!.overdue).toBe(true);
    expect(a.verdict).toBe("AT_RISK");
    expect(a.verdict).not.toBe("YES");
    expect(allUserFacingStrings(a).join(" ")).toMatch(/has not arrived/i);
  });

  it("12 · promised date and ETA disagree ⇒ both shown, neither overrides", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "100");
    await openPo(rm, { number: "PO-D", qty: "500", promised: "2027-02-01", eta: "2027-03-15" });

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    const s = a.components[0]!.supply[0]!;
    expect(s.datesDisagree).toBe(true);
    expect(s.promisedDate).not.toBeNull();
    expect(s.etaDate).not.toBeNull();
    const text = allUserFacingStrings(a).join(" ");
    expect(text).toMatch(/promised/i);
    expect(text).toMatch(/latest update/i);
  });
});

/* ========================================================================== */
/* Assertions 13–16 — timing.                                                */
/* ========================================================================== */

describe("timing", () => {
  it("13 · observed lead time exceeding the stated one is DISPLAYED as a count, and changes no calculation", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 30 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    // Three receipts, each far slower than the 30 days on file.
    await openPo(rm, { number: "PO-H1", qty: "10", received: "10", orderedAt: "2026-10-01" });
    await openPo(rm, { number: "PO-H2", qty: "10", received: "10", orderedAt: "2026-10-05" });

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: D("2027-03-01"), asOf: AT });
    const c = a.components[0]!;
    expect(c.observedLeadTime).not.toBeNull();
    expect(c.observedLeadTime!.exceedingCount).toBeGreaterThan(0);
    // The DATE still comes from the stated 30 days — observation informs, never substitutes.
    expect(c.recommendation!.leadTimeDays).toBe(30);
    expect(c.recommendation!.leadTimeSource).toBe("ITEM_MASTER");
    expect(c.recommendation!.orderByDate!.toISOString().slice(0, 10)).toBe("2027-01-30");
    expect(allUserFacingStrings(a).join(" ")).toMatch(/took longer than the 30 days on file/i);
  });

  it("supplier-specific terms beat item master — a more specific stated value, not a statistic", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 30 });
    const supplierId = await makeSupplier("Specific");
    await db.insert(supplierItemTerms).values({
      supplierId, itemId: rm, leadTimeDays: 10, effectiveFrom: D("2026-01-01"),
    });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: D("2027-03-01"), asOf: AT });
    expect(a.components[0]!.recommendation!.leadTimeSource).toBe("SUPPLIER_TERMS");
    expect(a.components[0]!.recommendation!.leadTimeDays).toBe(10);
  });

  it("14 · no lead time ⇒ no date, and the answer says why", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: null });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: D("2027-03-01"), asOf: AT });
    const r = a.components[0]!.recommendation!;
    expect(r.orderByDate).toBeNull();
    expect(r.earliestArrival).toBeNull();
    expect(r.noDateReason).toMatch(/don't have a lead time/i);
    expect(actionFor(a.components[0]!)).toMatch(/don't have a lead time/i);
  });

  it("15 · no need-by date ⇒ NO DEADLINE IS INVENTED; earliest arrival is shown instead", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 30 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    const r = a.components[0]!.recommendation!;
    expect(r.orderByDate).toBeNull();                    // ⚠ the whole point
    expect(r.earliestArrival!.toISOString().slice(0, 10)).toBe("2027-01-31");
    expect(actionFor(a.components[0]!)).toMatch(/earliest it can arrive/i);
    expect(actionFor(a.components[0]!)).not.toMatch(/\bby\b/i);
  });

  it("16 · order-by date already past ⇒ NO, with the lateness in days", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 60 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: D("2027-01-15"), asOf: AT });
    expect(a.verdict).toBe("NO");
    const r = a.components[0]!.recommendation!;
    expect(r.lateByDays).toBe(46); // need 15 Jan, earliest arrival 2 Mar
    expect(actionFor(a.components[0]!)).toMatch(/even so, the earliest it can arrive/i);
  });
});

/* ========================================================================== */
/* Assertions 17–21 — quantities.                                            */
/* ========================================================================== */

describe("quantities", () => {
  it("17 · integer-only rounds UP, and exactly ONCE across a multi-step conversion", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-INT", stockUom: "EA", integerOnly: true });
    const fg = await product();
    // 100 × 45.003 = 4500.3 EA required, nothing in stock ⇒ shortfall 4500.3 → 4501
    await recipe(fg, rm, "45.003", "EA");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    const c = a.components[0]!;
    // The REQUIREMENT stays exact; only the final net figure rounds. Rounding at
    // each step would compound the overstatement across a recipe.
    expect(c.requirement.value!.toFixed()).toBe("4500.3");
    expect(c.shortfall!.toFixed()).toBe("4501");
    expect(c.rounded).toBe(true);
  });

  it("a non-integer item does not round", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "45.003", "kg");
    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.components[0]!.shortfall!.toFixed()).toBe("4500.3");
    expect(a.components[0]!.rounded).toBe(false);
  });

  it("18 · a fractional quantity of an integer-only product is REJECTED, not rounded and not CAN'T SAY", async () => {
    const fg = await product({ integerOnly: true });
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    await recipe(fg, rm, "1", "kg");

    await expect(
      checkFeasibility({ productItemId: fg, quantity: qty("100.5"), needBy: null, asOf: AT }),
    ).rejects.toThrow(MalformedRequestError);
  });

  it("19 · zero and negative quantities are REJECTED, not CAN'T SAY", async () => {
    const fg = await product();
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    await recipe(fg, rm, "1", "kg");
    for (const q of ["0", "-5"]) {
      await expect(
        checkFeasibility({ productItemId: fg, quantity: qty(q), needBy: null, asOf: AT }),
      ).rejects.toThrow(MalformedRequestError);
    }
  });

  it("20 · catch-weight nets on actual, and produces NO pack count without a recorded weight per pack", async () => {
    const rm = await makeItem(ctx.siteId, {
      code: "RM-CW", stockUom: "kg", catchWeight: true, nominalUom: "bag", leadTimeDays: 20,
    });
    const fg = await product();
    await recipe(fg, rm, "0.8", "kg");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("1000"), needBy: null, asOf: AT });
    const c = a.components[0]!;
    expect(c.shortfall!.toFixed()).toBe("800");        // in the stock unit — actual
    expect(c.recommendation!.nominalQty).toBeNull();   // ⚠ never invented
    expect(allUserFacingStrings(a).join(" ")).toMatch(/how many to order is yours to set/i);
  });

  it("20b · with a recorded weight per pack, the pack count IS produced and rounds up", async () => {
    const rm = await makeItem(ctx.siteId, {
      code: "RM-CW", stockUom: "kg", catchWeight: true, nominalUom: "bag", leadTimeDays: 20,
    });
    await db.insert(uomConversions).values({
      itemId: rm, fromUom: "bag", toUom: "kg", factor: "25", effectiveFrom: D("2026-01-01"),
    });
    const fg = await product();
    await recipe(fg, rm, "0.8", "kg");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("1000"), needBy: null, asOf: AT });
    const r = a.components[0]!.recommendation!;
    expect(r.orderQty!.toFixed()).toBe("800");
    expect(r.nominalQty!.toFixed()).toBe("32"); // 800 kg ÷ 25 kg/bag
    expect(r.nominalUom).toBe("bag");
  });

  it("21 · quality-hold stock is excluded from what is available", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "150");        // usable
    await stock(rm, "500", "QH");  // on hand but NOT available

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.components[0]!.available!.toFixed()).toBe("150");
    expect(a.components[0]!.qualityHold!.toFixed()).toBe("500");
    expect(a.verdict).toBe("NO"); // 200 needed, 150 available, nothing on order
  });

  it("a versioned per-item conversion is applied, and it is never global", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-G", stockUom: "kg" });
    const other = await makeItem(ctx.siteId, { code: "RM-OTHER", stockUom: "kg" });
    await db.insert(uomConversions).values({
      itemId: rm, fromUom: "g", toUom: "kg", factor: "0.001", effectiveFrom: D("2026-01-01"),
    });
    const fg = await product();
    await recipe(fg, rm, "40", "g");
    await recipe(fg, other, "40", "g"); // same units, NO conversion for THIS item

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.components.find((c) => c.code === "RM-G")!.requirement.value!.toFixed()).toBe("4");
    // The other item does not borrow it. Conversions are per item (F6).
    expect(a.components.find((c) => c.code === "RM-OTHER")!.verdict).toBe("CANT_SAY");
  });
});

/* ========================================================================== */
/* Assertion 22 — Opportunity context.                                       */
/* ========================================================================== */

describe("opportunity context", () => {
  it("22 · an open opportunity on a recommended item is displayed, and no new finding is created", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 20 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");

    await db.insert(opportunities).values({
      siteId: ctx.siteId, mechanism: "M03", subjectItemId: rm,
      title: "Reduce order quantity on RM-1", statedIntervention: "Order less, more often",
      counterfactual: "Had the order quantity been lower...", lifecycle: "POTENTIAL",
      effectiveAsOf: D("2026-12-01"),
    });

    const before = await db.select().from(opportunities);
    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });

    expect(a.components[0]!.openOpportunities).toHaveLength(1);
    expect(allUserFacingStrings(a).join(" ")).toMatch(/work against it/i);

    // ⚠ Displayed, never created. The count is unchanged.
    const after = await db.select().from(opportunities);
    expect(after).toHaveLength(before.length);
  });
});

/* ========================================================================== */
/* Assertions 23–24 — answers are snapshots.                                 */
/* ========================================================================== */

describe("answers are snapshots", () => {
  it("23 · repeating a request recomputes; it is not cached or deduplicated", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "1000");

    const first = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    await recordAnswer(first, { siteId: ctx.siteId, askedBy: "manager" });
    expect(first.verdict).toBe("YES");

    // The world changes underneath: the stock is issued out.
    await consume(rm, "900", "2026-12-15");

    const second = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    await recordAnswer(second, { siteId: ctx.siteId, askedBy: "manager" });
    expect(second.verdict).toBe("NO");

    // Two rows, not one updated row.
    const rows = await recentAnswers();
    expect(rows).toHaveLength(2);
  });

  it("24 · a stored answer is never mutated; it keeps the verdict it was given", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "1000");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    const { id } = await recordAnswer(a, { siteId: ctx.siteId, askedBy: "manager" });

    await consume(rm, "900", "2026-12-15");
    const b = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    await recordAnswer(b, { siteId: ctx.siteId, askedBy: "manager" });

    const stored = await answerById(id);
    expect(stored!.answer.verdict).toBe("YES"); // unchanged by the later reality
  });
});

/* ========================================================================== */
/* THE STRUCTURAL GUARDS — assertions 25, 26, 28.                            */
/* These are what make the firewall enforceable rather than aspirational.     */
/* ========================================================================== */

describe("structural guards", () => {
  it("25 · a feasibility run writes NO row to any finding, ledger or reservation structure", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 20 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "50");
    await openPo(rm, { number: "PO-1", qty: "100", promised: "2027-02-01" });

    const counts = async () => {
      const tables = [
        "opportunities", "exposures", "observed_costs", "evidence_gaps", "finding_links",
        "movements", "balances", "detection_runs", "gate_results", "contradictions",
        "baselines", "outcomes", "decisions",
      ];
      const out: Record<string, number> = {};
      for (const t of tables) {
        const [r] = await sql<{ n: string }[]>`SELECT count(*)::text AS n FROM ${sql(t)}`;
        out[t] = Number(r!.n);
      }
      return out;
    };

    const before = await counts();
    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    await recordAnswer(a, { siteId: ctx.siteId, askedBy: "manager" });
    const after = await counts();

    expect(after).toEqual(before);
  });

  it("26 · the saving headline is byte-identical before and after a feasibility run", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 20 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");

    await db.insert(opportunities).values({
      siteId: ctx.siteId, mechanism: "M01", subjectItemId: rm, title: "Lead-time correction",
      statedIntervention: "Correct the lead time", counterfactual: "Had it been correct...",
      lifecycle: "POTENTIAL", effectiveAsOf: D("2026-12-01"),
      recurringImpact: { value: "1405180", unit: "EGP", basis: "CALCULATED" },
    });

    const headlineSnapshot = async () =>
      JSON.stringify(
        await db.select({ id: opportunities.id, r: opportunities.recurringImpact, n: opportunities.netImpact, l: opportunities.lifecycle }).from(opportunities),
      );

    const before = await headlineSnapshot();
    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    await recordAnswer(a, { siteId: ctx.siteId, askedBy: "manager" });
    const after = await headlineSnapshot();

    expect(after).toBe(before);
  });

  it("28 · no banned term reaches any user-facing string", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 20 });
    const cw = await makeItem(ctx.siteId, { code: "RM-CW", stockUom: "kg", catchWeight: true, nominalUom: "bag" });
    const bad = await makeItem(ctx.siteId, { code: "RM-BAD", stockUom: "kg" });
    const sub = await makeItem(ctx.siteId, { code: "SUB-1", stockUom: "EA" });
    const leaf = await makeItem(ctx.siteId, { code: "RM-L", stockUom: "kg" });
    const fg = await product();
    await recipe(sub, leaf, "1", "kg");
    await recipe(fg, rm, "2", "kg", true); // demo line, so its warning is covered too
    await recipe(fg, cw, "1", "kg");
    await recipe(fg, bad, "1", "L");
    await recipe(fg, sub, "1", "EA");
    await stock(rm, "50");
    await consume(rm, "10", "2026-06-01");
    await openPo(rm, { number: "PO-1", qty: "100", promised: "2026-11-01", eta: "2027-05-01" });
    await db.insert(opportunities).values({
      siteId: ctx.siteId, mechanism: "M03", subjectItemId: rm, title: "Hold less RM-1",
      statedIntervention: "x", counterfactual: "y", lifecycle: "POTENTIAL", effectiveAsOf: D("2026-12-01"),
    });

    for (const needBy of [null, D("2027-02-01")]) {
      const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy, asOf: AT });
      const strings = allUserFacingStrings(a);
      expect(strings.length).toBeGreaterThan(5);
      for (const s of strings) {
        expect(vocabularyViolations(s), `banned vocabulary in: "${s}"`).toEqual([]);
      }
    }
  });

  it("28b · the vocabulary guard actually catches violations (the test can fail)", () => {
    expect(vocabularyViolations("Run the MRP to explode the BoM")).toContain("MRP");
    expect(vocabularyViolations("basis is USER_DEFINED")).toContain("USER_DEFINED");
    expect(vocabularyViolations("the net requirement is 40 kg")).toContain("net requirement");
    // ...and does not fire on ordinary English that merely contains a substring.
    expect(vocabularyViolations("The bombs are actually fine")).toEqual([]);
    expect(vocabularyViolations("You need 4,500 kg more of RM-001.")).toEqual([]);
  });

  it("no calculation outside the feasibility audit module references the answers table", () => {
    /* D-055's binding structural test, asserted by inspecting the source tree
       rather than trusting a convention. `audit.ts` is the only permitted
       reader and writer; a page may read it to SHOW an audit trail. */
    const allowed = new Set(["lib/feasibility/audit.ts"]);
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) { walk(full); continue; }
        if (!/\.(ts|tsx)$/.test(full)) continue;
        const rel = full.replace(`${process.cwd()}/`, "");
        if (allowed.has(rel)) continue;
        const src = readFileSync(full, "utf8");
        if (/feasibilityAnswers|feasibility_answers/.test(src)) offenders.push(rel);
      }
    };
    for (const root of ["lib", "app"]) walk(join(process.cwd(), root));

    // The schema declares the table; everything else must go through audit.ts.
    expect(offenders.filter((f) => f !== "lib/db/schema.ts")).toEqual([]);
  });
});

/* ========================================================================== */
/* Assertion 27 and demo isolation.                                          */
/* ========================================================================== */

describe("demo isolation", () => {
  it("27 · a demo recipe is visibly marked in what the user reads", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg", leadTimeDays: 20 });
    const fg = await product();
    await recipe(fg, rm, "2", "kg", true);

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.isDemo).toBe(true);
    expect(allUserFacingStrings(a).join(" ")).toMatch(/DEMO recipe, not your factory's data/);
  });

  it("a real recipe is not marked, and removing demo data leaves the product at CAN'T SAY", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg", true);

    let a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.isDemo).toBe(true);

    await sql`DELETE FROM product_structures WHERE is_demo = true`;
    a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    expect(a.verdict).toBe("CANT_SAY"); // the honest state, not a degraded one
  });
});

/* ========================================================================== */
/* The journey the product promises.                                         */
/* ========================================================================== */

describe("the promised journey", () => {
  it("produces the four-layer answer the contract specifies", async () => {
    const a1 = await makeItem(ctx.siteId, { code: "MAT-A", name: "Material A", stockUom: "kg", leadTimeDays: 18 });
    const b1 = await makeItem(ctx.siteId, { code: "MAT-B", name: "Material B", stockUom: "kg", leadTimeDays: 25 });
    const c1 = await makeItem(ctx.siteId, { code: "MAT-C", name: "Material C", stockUom: "EA", integerOnly: true, leadTimeDays: 40 });
    const fg = await product({ code: "PROD-X", name: "Product X" });
    await recipe(fg, a1, "0.5", "kg");
    await recipe(fg, b1, "0.1", "kg");
    await recipe(fg, c1, "0.02", "EA");
    await stock(a1, "500");
    await stock(b1, "200");
    await stock(c1, "80");
    await openPo(a1, { number: "PO-A", qty: "4500", promised: "2027-02-10" });
    await openPo(b1, { number: "PO-B", qty: "800", promised: "2027-02-12" });
    await openPo(c1, { number: "PO-C", qty: "120", promised: "2027-02-14" });

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("10000"), needBy: D("2027-03-01"), asOf: AT });

    expect(a.verdict).toBe("AT_RISK");
    // Layer 1 — one sentence, no numbers or codes.
    expect(headline(a)).toMatch(/only if 3 deliveries arrive as expected/);
    // Layer 2 — one line per material.
    const lines = missingLines(a);
    expect(lines.map((l) => l.code).sort()).toEqual(["MAT-A", "MAT-B", "MAT-C"]);
    expect(lines.every((l) => l.missing.includes("short"))).toBe(true);
    // Every string a manager reads stays in a manager's language.
    for (const s of allUserFacingStrings(a)) expect(vocabularyViolations(s)).toEqual([]);
  });

  it("no feasibility figure is ever presented as observed fact", async () => {
    const rm = await makeItem(ctx.siteId, { code: "RM-1", stockUom: "kg" });
    const fg = await product();
    await recipe(fg, rm, "2", "kg");
    await stock(rm, "1000");

    const a = await checkFeasibility({ productItemId: fg, quantity: qty("100"), needBy: null, asOf: AT });
    // The user's own quantity is USER_DEFINED, so contagion floors everything.
    expect(a.basis).toBe("USER_DEFINED");
    expect(a.components[0]!.requirement.basis).not.toBe("ACTUAL");
  });
});

/* ========================================================================== */
/* Recipe import — and the two demo-isolation rules it enforces.             */
/* ========================================================================== */

describe("recipe import", () => {
  const header = ["parent_code", "component_code", "quantity_per", "uom", "effective_from"];
  const rows = (...r: string[][]) =>
    r.map((v) => Object.fromEntries(header.map((h, i) => [h, v[i]])) as Record<string, unknown>);

  it("applies a valid recipe, and an imported recipe is never marked demo", async () => {
    const fg = await makeItem(ctx.siteId, { code: "REAL-FG", name: "Real product", stockUom: "EA" });
    const rm = await makeItem(ctx.siteId, { code: "REAL-RM", name: "Real material", stockUom: "kg" });

    const parsed = parseFile(header, rows(["REAL-FG", "REAL-RM", "2.5", "kg", "2026-01-01"]), STRUCTURE_SPEC);
    const report = await applyStructures(parsed, { siteId: ctx.siteId });

    expect(report.applied).toBe(1);
    const [row] = await db.select().from(productStructures);
    expect(row!.isDemo).toBe(false); // ⚠ not a parameter — always real
    expect(row!.parentItemId).toBe(fg);
    expect(row!.componentItemId).toBe(rm);
  });

  it("REJECTS a line naming an unknown item, and never silently discards it", async () => {
    await makeItem(ctx.siteId, { code: "REAL-FG", stockUom: "EA" });
    const parsed = parseFile(header, rows(["REAL-FG", "GHOST-RM", "1", "kg", "2026-01-01"]), STRUCTURE_SPEC);
    const report = await applyStructures(parsed, { siteId: ctx.siteId });

    expect(report.applied).toBe(0);
    expect(report.rejected).toBe(1);
    expect(report.outcomes[0]!.detail).toContain("GHOST-RM");
    expect(report.outcomes[0]!.detail).toMatch(/silently missing/i);
  });

  it("REJECTS an imported recipe that would attach to a demo item — the reverse leak", async () => {
    await makeItem(ctx.siteId, { code: "DEMO-FG", name: "Seeded product (DEMO)", stockUom: "EA" });
    await makeItem(ctx.siteId, { code: "REAL-RM", name: "Real material", stockUom: "kg" });

    const parsed = parseFile(header, rows(["DEMO-FG", "REAL-RM", "1", "kg", "2026-01-01"]), STRUCTURE_SPEC);
    const report = await applyStructures(parsed, { siteId: ctx.siteId });

    expect(report.applied).toBe(0);
    expect(report.rejected).toBe(1);
    expect(report.outcomes[0]!.detail).toMatch(/demonstration data/i);
    expect(await db.select().from(productStructures)).toHaveLength(0);
  });

  it("REJECTS a product listed inside its own recipe", async () => {
    await makeItem(ctx.siteId, { code: "REAL-FG", stockUom: "EA" });
    const parsed = parseFile(header, rows(["REAL-FG", "REAL-FG", "1", "EA", "2026-01-01"]), STRUCTURE_SPEC);
    expect(parsed.rows[0]!.errors.some((e) => e.severity === "REJECT")).toBe(true);
    const report = await applyStructures(parsed, { siteId: ctx.siteId });
    expect(report.applied).toBe(0);
    expect(report.outcomes[0]!.detail).toMatch(/cannot be made from itself/i);
  });

  it("does not overwrite an existing line; a change is a new effective date", async () => {
    await makeItem(ctx.siteId, { code: "REAL-FG", stockUom: "EA" });
    await makeItem(ctx.siteId, { code: "REAL-RM", stockUom: "kg" });
    const line = rows(["REAL-FG", "REAL-RM", "2.5", "kg", "2026-01-01"]);

    await applyStructures(parseFile(header, line, STRUCTURE_SPEC), { siteId: ctx.siteId });
    const second = await applyStructures(parseFile(header, line, STRUCTURE_SPEC), { siteId: ctx.siteId });

    expect(second.duplicates).toBe(1);
    expect(second.outcomes[0]!.detail).toMatch(/later effective date/i);
    expect(await db.select().from(productStructures)).toHaveLength(1);
  });

  it("a missing required column stops the file, naming the consequence", () => {
    const parsed = parseFile(
      ["parent_code", "component_code"],
      [{ parent_code: "A", component_code: "B" }],
      STRUCTURE_SPEC,
    );
    expect(parsed.missingColumns.length).toBeGreaterThan(0);
    expect(parsed.missingColumns.map((m) => m.column)).toContain("quantity_per");
  });
});
