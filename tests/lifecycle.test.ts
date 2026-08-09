/**
 * Persistence · review · baseline · adjudicator independence · contradiction.
 *
 * These prove the Block 6 acceptance journey survives the request that produced
 * it — the property the audit found missing.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { sql } from "../lib/db/client";
import { money, qty, ZERO_MONEY } from "../lib/core/decimal";
import { insufficient, value } from "../lib/core/provenance";
import { pass } from "../lib/engine/gates";
import type { Opportunity } from "../lib/engine/findings";
import { DIMENSION } from "../lib/engine/signature";
import { currentOpportunities, getOpportunity, persistRun, versionHistory } from "../lib/engine/persist";
import { baselineFor, checkIndependence, decisionFor, LifecycleError, markRealized, reviewOpportunity } from "../lib/engine/review";
import { evaluateContradictions, recordContradictions, resolveContradiction } from "../lib/engine/contradiction-service";
import { postMovement } from "../lib/ledger/post";
import { type Ctx, d, makeItem, makeUser, resetDb, seedWorld } from "./helpers";

let ctx: Ctx;
const ASOF = d("2027-01-01T00:00:00Z");

beforeEach(async () => {
  await resetDb();
  ctx = await seedWorld();
});

function opp(over: Partial<Opportunity> & { id: string }): Opportunity {
  const v = value(money("1000"), "EGP", "ACTUAL", ASOF);
  return {
    class: "OPPORTUNITY",
    mechanism: "M01_EXPEDITE_PREMIUM_LEADTIME",
    title: "Master lead time understated",
    statedIntervention: "Correct the master lead time from 18 to 38 days",
    counterfactual: "Four events would not have triggered",
    lifecycle: "POTENTIAL",
    evidenceStrength: null,
    ladder: "ANNUALIZATION_ELIGIBLE",
    gates: [pass("COUNTERFACTUAL_TESTABLE", "4 of 4 exceeded the master value")],
    recurringImpact: v,
    oneTimeImpact: value(ZERO_MONEY, "EGP", "CALCULATED", ASOF),
    incrementalCost: value(ZERO_MONEY, "EGP", "CALCULATED", ASOF),
    netImpact: v,
    netExcludesUnvaluedRisk: true,
    signature: { subject: { type: "ITEM", itemId: "" }, effects: [] },
    findingOwner: "inv",
    actionOwner: "buyer",
    dataOwner: "admin",
    effectiveAsOf: ASOF,
    ...over,
  } as Opportunity;
}

const sig = (itemId: string, dimension: string, direction: "INCREASE" | "DECREASE") => ({
  subject: { type: "ITEM" as const, itemId },
  effects: [{ dimension, direction, windowFrom: d("2027-01-01"), windowTo: d("2027-12-31") }],
});

async function persistOne(itemId: string, over: Partial<Opportunity> & { id: string }) {
  return persistRun({
    siteId: ctx.siteId, asOf: ASOF, mechanism: "M01_EXPEDITE_PREMIUM_LEADTIME", isDemo: true,
    opportunities: [opp({ signature: sig(itemId, DIMENSION.MASTER_LEAD_TIME, "INCREASE"), ...over })],
    evidenceGaps: [],
  });
}

/* ========================================================================== */
describe("persistence — a finding survives the request that produced it", () => {
  it("writes a finding, its gates and its signature", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-P1" });
    const r = await persistOne(itemId, { id: "m01:p1" });
    expect(r.written).toBe(1);

    const found = await currentOpportunities(ctx.siteId);
    expect(found).toHaveLength(1);
    expect(found[0]!.title).toBe("Master lead time understated");
    expect(found[0]!.isDemo).toBe(true);

    const [g] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM gate_results WHERE opportunity_id = ${found[0]!.id}::uuid`;
    expect(g!.n).toBe("1");
    const [s] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM signature_dimensions WHERE opportunity_id = ${found[0]!.id}::uuid`;
    expect(s!.n).toBe("1");
  });

  it("is reproducible from its recorded source facts — a fresh read returns the same figures", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-P2" });
    await persistOne(itemId, { id: "m01:p2" });
    const [first] = await currentOpportunities(ctx.siteId);
    const reread = await getOpportunity(first!.id);
    expect(JSON.stringify(reread!.netImpact)).toBe(JSON.stringify(first!.netImpact));
  });

  it("does not duplicate on re-run when nothing changed", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-P3" });
    await persistOne(itemId, { id: "m01:p3" });
    const second = await persistOne(itemId, { id: "m01:p3" });
    expect(second.written).toBe(0);
    expect(second.unchanged).toBe(1);
    expect(await currentOpportunities(ctx.siteId)).toHaveLength(1);
  });

  it("SUPERSEDES rather than overwrites when the figure changes — history is preserved", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-P4" });
    await persistOne(itemId, { id: "m01:p4" });
    const r2 = await persistOne(itemId, {
      id: "m01:p4",
      netImpact: value(money("2500"), "EGP", "ACTUAL", ASOF),
      recurringImpact: value(money("2500"), "EGP", "ACTUAL", ASOF),
    });
    expect(r2.written).toBe(1);
    expect(r2.superseded).toBe(1);

    const current = await currentOpportunities(ctx.siteId);
    expect(current).toHaveLength(1);
    expect((current[0]!.netImpact as Record<string, unknown>)["value"]).toBe("2500");

    const history = await versionHistory("m01:p4");
    expect(history).toHaveLength(2); // the old figure is still readable
    expect(history.filter((h) => h.supersededAt !== null)).toHaveLength(1);
  });

  it("does NOT supersede a finding that has already been decided", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-P5" });
    await persistOne(itemId, { id: "m01:p5" });
    const [f] = await currentOpportunities(ctx.siteId);
    await reviewOpportunity({ opportunityId: f!.id, action: "APPROVE", adjudicator: "fin", rationale: "agreed" });

    await persistOne(itemId, { id: "m01:p5", netImpact: value(money("9999"), "EGP", "ACTUAL", ASOF) });
    const after = await getOpportunity(f!.id);
    expect(after!.supersededAt).toBeNull();       // the decided version stands
    expect(after!.lifecycle).toBe("APPROVED");    // and keeps its decision
  });

  it("preserves the INSUFFICIENT_DATA state and its reason across the round trip", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-P6" });
    await persistOne(itemId, {
      id: "m01:p6",
      netImpact: insufficient("EGP", ASOF, "freight not separably captured (F-01)"),
    });
    const [f] = await currentOpportunities(ctx.siteId);
    const net = f!.netImpact as Record<string, unknown>;
    expect(net["value"]).toBeNull();
    expect(net["basis"]).toBe("INSUFFICIENT_DATA");
    expect(JSON.stringify(net["limitations"])).toMatch(/F-01/);
  });
});

/* ========================================================================== */
describe("review, approval and rejection", () => {
  let itemId: string;
  let findingId: string;

  beforeEach(async () => {
    itemId = await makeItem(ctx.siteId, { code: "RM-R1" });
    await makeUser("fin", ["ADJUDICATOR"]);
    await makeUser("buyer", ["BUYER"]);
    await persistOne(itemId, { id: "m01:r1" });
    findingId = (await currentOpportunities(ctx.siteId))[0]!.id;
  });

  it("approves, records the decision and captures a baseline", async () => {
    const r = await reviewOpportunity({
      opportunityId: findingId, action: "APPROVE", adjudicator: "fin",
      rationale: "Lead time is demonstrably wrong; correction agreed with planning.",
    });
    expect(r.lifecycle).toBe("APPROVED");
    expect(r.baselineId).not.toBeNull();

    const b = await baselineFor(findingId);
    expect(b!.method).toBe("M01_LEADTIME_PREMIUM_v1");
    // A snapshot of INPUTS AND METHOD, not only an output.
    expect(Object.keys(b!.inputs)).toEqual(expect.arrayContaining(["asOf", "statedIntervention", "expediteEvents", "evidenceRefs"]));
    expect(Object.keys(b!.output)).toEqual(expect.arrayContaining(["netImpact", "ladder"]));
  });

  it("rejects with a rationale and captures NO baseline — there is no action to measure", async () => {
    const r = await reviewOpportunity({
      opportunityId: findingId, action: "REJECT", adjudicator: "fin", rationale: "Supplier is being changed anyway.",
    });
    expect(r.lifecycle).toBe("REJECTED");
    expect(r.baselineId).toBeNull();
    expect(await baselineFor(findingId)).toBeNull();
  });

  it("refuses a decision with no rationale", async () => {
    await expect(
      reviewOpportunity({ opportunityId: findingId, action: "APPROVE", adjudicator: "fin", rationale: "   " }),
    ).rejects.toThrow(/requires a rationale/);
  });

  it("refuses a second decision on an already-decided finding", async () => {
    await reviewOpportunity({ opportunityId: findingId, action: "APPROVE", adjudicator: "fin", rationale: "ok" });
    await expect(
      reviewOpportunity({ opportunityId: findingId, action: "REJECT", adjudicator: "fin", rationale: "changed mind" }),
    ).rejects.toThrow(/already APPROVED/);
  });

  it("⚠ APPROVAL IS NOT REALIZATION — there is no path to REALIZED", async () => {
    await reviewOpportunity({ opportunityId: findingId, action: "APPROVE", adjudicator: "fin", rationale: "ok" });
    const f = await getOpportunity(findingId);
    expect(f!.lifecycle).toBe("APPROVED");
    expect(f!.lifecycle).not.toBe("REALIZED");
    expect(() => markRealized()).toThrow(/Approval is not realization/);
    const [n] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM outcomes`;
    expect(n!.n).toBe("0"); // no outcome is invented
  });

  it("writes an audit event for the decision", async () => {
    await reviewOpportunity({ opportunityId: findingId, action: "APPROVE", adjudicator: "fin", rationale: "ok" });
    const [a] = await sql<{ action: string; actor: string }[]>`
      SELECT action, actor FROM audit_events WHERE entity_id = ${findingId}`;
    expect(a!.action).toBe("OPPORTUNITY_APPROVE");
    expect(a!.actor).toBe("fin");
  });
});

/* ========================================================================== */
describe("adjudicator independence (DP-07, D-051)", () => {
  let itemId: string;
  let findingId: string;

  beforeEach(async () => {
    itemId = await makeItem(ctx.siteId, { code: "RM-I1", leadTimeDays: 18 });
    const supplierId = (await sql<{ id: string }[]>`
      INSERT INTO suppliers (code, name) VALUES ('S-I1','Supplier I1') RETURNING id`)[0]!.id;
    const poId = (await sql<{ id: string }[]>`
      INSERT INTO purchase_orders (site_id, number, supplier_id, status, ordered_at, currency)
      VALUES (${ctx.siteId}::uuid,'PO-I1',${supplierId}::uuid,'RECEIVED','2026-03-01','EGP') RETURNING id`)[0]!.id;
    const lineId = (await sql<{ id: string }[]>`
      INSERT INTO po_lines (po_id, line_no, item_id, ordered_qty, uom, unit_price, currency, expedited)
      VALUES (${poId}::uuid,1,${itemId}::uuid,100,'kg',10,'EGP',true) RETURNING id`)[0]!.id;
    // ⚠ The buyer classified the root cause this claim rests on.
    await sql`INSERT INTO expedite_events (po_line_id, occurred_at, root_cause, classified_by)
              VALUES (${lineId}::uuid,'2026-03-20','INCORRECT_LEAD_TIME','buyer')`;
    await persistOne(itemId, { id: "m01:i1" });
    findingId = (await currentOpportunities(ctx.siteId))[0]!.id;
  });

  it("finds an independent adjudicator independent, and says what it could NOT check", async () => {
    const c = await checkIndependence(findingId, "fin");
    expect(c.independent).toBe(true);
    expect(c.checkedAgainst).toContain("buyer");
    expect(c.uncheckable).toContain("purchase-order author");
  });

  it("detects self-adjudication by the person who classified the root cause", async () => {
    const c = await checkIndependence(findingId, "buyer");
    expect(c.independent).toBe(false);
    expect(c.note).toMatch(/self-adjudication/);
  });

  it("REFUSES approval by a conflicted adjudicator unless the conflict is explicitly accepted", async () => {
    await expect(
      reviewOpportunity({ opportunityId: findingId, action: "APPROVE", adjudicator: "buyer", rationale: "mine" }),
    ).rejects.toThrow(/self-adjudication/);
  });

  it("permits self-adjudication when accepted, and RECORDS the conflict rather than hiding it", async () => {
    const r = await reviewOpportunity({
      opportunityId: findingId, action: "APPROVE", adjudicator: "buyer",
      rationale: "No independent reviewer available on site.", acceptSelfAdjudication: true,
    });
    expect(r.lifecycle).toBe("APPROVED");
    expect(r.independence.independent).toBe(false);

    const decision = await decisionFor(findingId);
    expect(decision!.adjudicator_independent).toBe(false);
    expect(decision!.independence_note).toMatch(/self-adjudication/);
    expect(decision!.checked_against).toContain("buyer");
  });

  it("rejection does not require independence — only a currency claim does", async () => {
    const r = await reviewOpportunity({
      opportunityId: findingId, action: "REJECT", adjudicator: "buyer", rationale: "not worth pursuing",
    });
    expect(r.lifecycle).toBe("REJECTED");
  });
});

/* ========================================================================== */
describe("contradiction control on the LIVE path (D-029)", () => {
  it("CONFLICT: two persisted findings on the same dimension, opposed, overlapping → detected and BLOCKED", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-C1" });
    // Two legitimate findings that genuinely conflict: one argues for larger
    // orders, the other for smaller, on the same item over the same window.
    await persistRun({
      siteId: ctx.siteId, asOf: ASOF, mechanism: "TEST", isDemo: true, evidenceGaps: [],
      opportunities: [
        opp({ id: "a:buy-more", title: "Order larger quantities", signature: sig(itemId, DIMENSION.ORDER_QUANTITY, "INCREASE") }),
        opp({ id: "b:buy-less", title: "Order smaller quantities", signature: sig(itemId, DIMENSION.ORDER_QUANTITY, "DECREASE") }),
      ],
    });

    const report = await evaluateContradictions(ctx.siteId);
    expect(report.evaluated).toBe(2);
    expect(report.contradictions).toHaveLength(1);
    expect(report.contradictions[0]!.dimension).toBe(DIMENSION.ORDER_QUANTITY);

    // PRESENTATION / RELEASE BLOCKED — both sides, because presenting either
    // alone would hide that they cannot both be executed.
    expect(report.blockedOpportunityIds).toHaveLength(2);
    expect(await recordContradictions(report)).toBe(1);
  });

  it("COMPOSITION: different dimensions on the same subject → NOT a contradiction", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-C2" });
    // reorder point = lead-time demand + safety stock. Acting on the two
    // components is a legitimate combined correction, not a conflict.
    await persistRun({
      siteId: ctx.siteId, asOf: ASOF, mechanism: "TEST", isDemo: true, evidenceGaps: [],
      opportunities: [
        opp({ id: "a:leadtime", title: "Correct lead time", signature: sig(itemId, DIMENSION.LEAD_TIME_DEMAND, "INCREASE") }),
        opp({ id: "b:buffer", title: "Reduce safety stock", signature: sig(itemId, DIMENSION.SAFETY_STOCK, "DECREASE") }),
      ],
    });
    const report = await evaluateContradictions(ctx.siteId);
    expect(report.evaluated).toBe(2);
    expect(report.contradictions).toHaveLength(0);
    expect(report.blockedOpportunityIds).toHaveLength(0);
  });

  it("different subjects do not conflict, however opposed", async () => {
    const a = await makeItem(ctx.siteId, { code: "RM-C3" });
    const b = await makeItem(ctx.siteId, { code: "RM-C4" });
    await persistRun({
      siteId: ctx.siteId, asOf: ASOF, mechanism: "TEST", isDemo: true, evidenceGaps: [],
      opportunities: [
        opp({ id: "a:x", signature: sig(a, DIMENSION.ORDER_QUANTITY, "INCREASE") }),
        opp({ id: "b:y", signature: sig(b, DIMENSION.ORDER_QUANTITY, "DECREASE") }),
      ],
    });
    expect((await evaluateContradictions(ctx.siteId)).contradictions).toHaveLength(0);
  });

  it("a resolved contradiction stops blocking release", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-C5" });
    await persistRun({
      siteId: ctx.siteId, asOf: ASOF, mechanism: "TEST", isDemo: true, evidenceGaps: [],
      opportunities: [
        opp({ id: "a:more", signature: sig(itemId, DIMENSION.ORDER_QUANTITY, "INCREASE") }),
        opp({ id: "b:less", signature: sig(itemId, DIMENSION.ORDER_QUANTITY, "DECREASE") }),
      ],
    });
    const before = await evaluateContradictions(ctx.siteId);
    await recordContradictions(before);
    const c = before.contradictions[0]!;
    await resolveContradiction(c.leftId, c.rightId, c.dimension, "SUPERSEDE", "fin");

    const after = await evaluateContradictions(ctx.siteId);
    expect(after.contradictions[0]!.resolved).toBe(true);
    expect(after.blockedOpportunityIds).toHaveLength(0);
  });

  it("a REJECTED finding no longer participates in contradiction", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-C6" });
    await persistRun({
      siteId: ctx.siteId, asOf: ASOF, mechanism: "TEST", isDemo: true, evidenceGaps: [],
      opportunities: [
        opp({ id: "a:more", signature: sig(itemId, DIMENSION.ORDER_QUANTITY, "INCREASE") }),
        opp({ id: "b:less", signature: sig(itemId, DIMENSION.ORDER_QUANTITY, "DECREASE") }),
      ],
    });
    const list = await currentOpportunities(ctx.siteId);
    await reviewOpportunity({ opportunityId: list[0]!.id, action: "REJECT", adjudicator: "fin", rationale: "not pursuing" });
    expect((await evaluateContradictions(ctx.siteId)).contradictions).toHaveLength(0);
  });
});

/* ========================================================================== */
describe("demo / real separation survives persistence", () => {
  it("carries the demo marker from the run down to the finding", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-D1" });
    await persistRun({
      siteId: ctx.siteId, asOf: ASOF, mechanism: "M01", isDemo: true, evidenceGaps: [],
      opportunities: [opp({ id: "m01:d1", signature: sig(itemId, DIMENSION.MASTER_LEAD_TIME, "INCREASE") })],
    });
    expect((await currentOpportunities(ctx.siteId))[0]!.isDemo).toBe(true);
  });

  it("a real run produces findings NOT marked demo, and the two do not mix", async () => {
    const a = await makeItem(ctx.siteId, { code: "RM-D2" });
    const b = await makeItem(ctx.siteId, { code: "RM-D3" });
    await persistRun({ siteId: ctx.siteId, asOf: ASOF, mechanism: "M01", isDemo: true, evidenceGaps: [], opportunities: [opp({ id: "x:demo", signature: sig(a, DIMENSION.MASTER_LEAD_TIME, "INCREASE") })] });
    await persistRun({ siteId: ctx.siteId, asOf: ASOF, mechanism: "M01", isDemo: false, evidenceGaps: [], opportunities: [opp({ id: "y:real", signature: sig(b, DIMENSION.MASTER_LEAD_TIME, "INCREASE") })] });

    const all = await currentOpportunities(ctx.siteId);
    expect(all.filter((f) => f.isDemo)).toHaveLength(1);
    expect(all.filter((f) => !f.isDemo)).toHaveLength(1);
  });
});

/* ========================================================================== */
describe("the ledger is still the source of truth", () => {
  it("persisting findings does not touch stock", async () => {
    const itemId = await makeItem(ctx.siteId, { code: "RM-L1" });
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.SUP!, toLocationId: ctx.loc.WH1!,
      nominalQty: qty("100"), nominalUom: "kg", effectiveAt: d("2026-01-10"),
      sourceDocumentType: "GRN", sourceDocumentId: "G1", reasonCode: "RECEIPT", actor: "ops",
    });
    const before = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM movements`;
    await persistOne(itemId, { id: "m01:l1" });
    const after = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM movements`;
    expect(after[0]!.n).toBe(before[0]!.n);
  });
});
