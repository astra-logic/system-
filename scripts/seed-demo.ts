/**
 * DEMO FIXTURES — Phase 8's test corpus.
 *
 * ⚠ Bible §47 and locked rule 16: generated data is NEVER presented as real
 * factory transactions. Every batch created here carries `isDemo = true` at the
 * DATA layer, so anything descended from it is traceable to a demo origin. That
 * is structural, not a badge someone remembers to render.
 *
 * B-07: there is a pilot factory but no data yet. These fixtures exist to
 * exercise the engine, not to describe that factory. No number here is a claim
 * about any real business.
 */
import { db, sql } from "../lib/db/client";
import {
  costReferences, etaForecasts, expediteEvents, factoryFacts, financialRates, fxRates, importBatches,
  items, locations, poLines, portMilestones, purchaseOrders, receipts, shipments,
  sites, supplierItemTerms, suppliers, users, productStructures, uomConversions,
} from "../lib/db/schema";
import { qty } from "../lib/core/decimal";
import { postMovement } from "../lib/ledger/post";

const D = (s: string) => new Date(`${s}T08:00:00Z`);

async function reset() {
  await sql`
    TRUNCATE TABLE audit_events, import_rows, import_batches, cost_references, fx_rates,
      financial_rates, outcomes, baselines, decisions, gate_results, contradictions,
      signature_dimensions, finding_links, evidence_gaps, exposures, observed_costs,
      opportunities, expedite_events, port_milestones, eta_forecasts, receipts, shipments,
      po_line_changes, po_lines, purchase_orders, supplier_item_terms, balances, movements,
      feasibility_answers, product_structures,
      uom_conversions, factory_facts, items, locations, suppliers, users, sites RESTART IDENTITY CASCADE`;
}

async function main() {
  await reset();

  const [site] = await db.insert(sites).values({ code: "MAIN", name: "Pilot Plant (DEMO)", reportingCurrency: "EGP" }).returning();
  const siteId = site!.id;

  await db.insert(importBatches).values({
    siteId, filename: "demo-fixtures", kind: "SEED", uploadedBy: "seed",
    status: "ACCEPTED", rowsTotal: 0, rowsAccepted: 0, rowsRejected: 0,
    isDemo: true, // ⚠ the structural marker
  });

  /* ---- D-051 roles. The adjudicator is the one role the domain forces. ----- */
  await db.insert(users).values([
    { username: "ops", displayName: "Warehouse Operator (DEMO)", roles: ["WAREHOUSE_OPERATOR"] },
    { username: "inv", displayName: "Inventory Manager (DEMO)", roles: ["INVENTORY_MANAGER"] },
    { username: "buyer", displayName: "Buyer (DEMO)", roles: ["BUYER"] },
    { username: "fin", displayName: "Finance Manager (DEMO)", roles: ["ADJUDICATOR"] },
    { username: "admin", displayName: "Administrator (DEMO)", roles: ["ADMINISTRATOR"] },
  ]);

  const locDefs: [string, string, "STOCK" | "QUALITY_HOLD" | "SUPPLIER" | "PRODUCTION" | "SCRAP" | "ADJUSTMENT" | "IN_TRANSIT" | "OPENING_BALANCE", boolean][] = [
    ["WH1", "Main Warehouse", "STOCK", true],
    ["QH", "Quality Hold", "QUALITY_HOLD", true],
    ["SUP", "Supplier", "SUPPLIER", false],
    ["PROD", "Production", "PRODUCTION", false],
    ["SCRAP", "Scrap", "SCRAP", false],
    ["ADJ", "Adjustment", "ADJUSTMENT", false],
    ["TRANSIT", "In Transit", "IN_TRANSIT", false],
    ["OPEN", "Opening Balance", "OPENING_BALANCE", false],
  ];
  const loc: Record<string, string> = {};
  for (const [code, name, kind, counts] of locDefs) {
    const [r] = await db.insert(locations).values({ siteId, code, name, kind, countsAsOnHand: counts }).returning();
    loc[code] = r!.id;
  }

  /* ---- F-07: FX rate HISTORY, effective-dated. The EGP depreciation is the
         reason D-042 exists — a premium compared across it is mostly currency. */
  await db.insert(fxRates).values([
    { fromCurrency: "USD", toCurrency: "EGP", rate: "30.90", effectiveOn: "2025-06-01", source: "CBE (DEMO)", owner: "Finance" },
    { fromCurrency: "USD", toCurrency: "EGP", rate: "30.95", effectiveOn: "2025-12-01", source: "CBE (DEMO)", owner: "Finance" },
    { fromCurrency: "USD", toCurrency: "EGP", rate: "47.60", effectiveOn: "2026-03-06", source: "CBE (DEMO)", owner: "Finance" },
    { fromCurrency: "USD", toCurrency: "EGP", rate: "48.50", effectiveOn: "2026-09-01", source: "CBE (DEMO)", owner: "Finance" },
  ]);

  /* ---- Financial rates, WITH their purpose. One is deliberately wrong for the
         decision, so the fitness gate has something real to block (D-023). ---- */
  await db.insert(financialRates).values([
    {
      siteId, kind: "CARRYING_COMPONENT", rate: "0.22", unit: "ratio/yr",
      source: "Finance inventory policy (DEMO)", owner: "CFO",
      effectiveFrom: D("2026-01-01"), effectiveTo: null, status: "ACTIVE",
      // ⚠ Built for VALUATION. Authoritative, and wrong for a marginal decision.
      purpose: "INVENTORY_VALUATION", basis: "USER_DEFINED",
    },
    {
      siteId, kind: "COST_OF_FUNDS", rate: "0.2725", unit: "ratio/yr",
      source: "Bank facility (DEMO)", owner: "Treasury",
      effectiveFrom: D("2026-03-01"), effectiveTo: null, status: "ACTIVE",
      purpose: "COST_OF_FUNDS", basis: "USER_DEFINED",
    },
    /* Component rates, each built FOR a marginal decision and named for the
       component it prices. A generic "carrying rate" prices nothing, which is
       why the valuation rate above can never be substituted for these. */
    {
      siteId, kind: "CARRYING_INSURANCE", rate: "0.004", unit: "ratio/yr",
      source: "Insurance schedule, value-based cover (DEMO)", owner: "Finance",
      effectiveFrom: D("2026-01-01"), effectiveTo: null, status: "ACTIVE",
      purpose: "MARGINAL_DECISION", basis: "USER_DEFINED",
    },
  ]);

  /* ---- Factory facts (F-33, F-40, …) — DEMO ANSWERS, structurally marked.
         D-035 classifies each carrying component APPLIES / NOT_VALID / UNKNOWN
         from exactly these. An absent row means UNANSWERED, never "no", so
         without them the offset correctly refuses to compute. */
  await db.insert(factoryFacts).values([
    { siteId, ref: "F-33", key: "space_constrained", value: false,
      source: "Plant manager interview (DEMO)", answeredBy: "admin", isDemo: true },
    { siteId, ref: "F-08", key: "handling_is_marginal", value: false,
      source: "Warehouse staffing review (DEMO)", answeredBy: "admin", isDemo: true },
    { siteId, ref: "F-08", key: "insurance_is_value_based", value: true,
      source: "Insurance schedule (DEMO)", answeredBy: "admin", isDemo: true },
    { siteId, ref: "F-40", key: "inventory_tax_applies", value: false,
      source: "Finance, Egypt jurisdiction (DEMO)", answeredBy: "admin", isDemo: true },
  ]);

  const sup = async (code: string, name: string, country: string) =>
    (await db.insert(suppliers).values({ code, name, country, city: "—" }).returning())[0]!.id;
  const supA = await sup("SUP-A", "Jiangsu Materials (DEMO)", "CN");
  const supB = await sup("SUP-B", "Delta Chemicals (DEMO)", "EG");
  const supC = await sup("SUP-C", "Adriatic Polymers (DEMO)", "IT");

  const mkItem = async (o: Partial<typeof items.$inferInsert> & { code: string; name: string }) =>
    (await db.insert(items).values({ siteId, kind: "PROCESS_MATERIAL", stockUom: "kg", ...o }).returning())[0]!.id;

  /* ---- The item set. Each exists to exercise a named scenario. ------------ */
  // 1. The MVP's headline case: master lead time understated, repeated expedites.
  const rm001 = await mkItem({ code: "RM-001", name: "Polymer resin grade A (DEMO)", leadTimeDays: 18 });
  // 2. Catch-weight (D-048): ordered in bags, stocked and invoiced by weight.
  const rm002 = await mkItem({ code: "RM-002", name: "Mineral filler, bagged (DEMO)", catchWeight: true, nominalUom: "bag", stockUom: "kg" });
  // 3. Discrete, integer-only, serial-tracked — the other half of "mixed" (D-009).
  const cp001 = await mkItem({ code: "CP-001", name: "Pump assembly (DEMO)", kind: "DISCRETE_GOOD", stockUom: "EA", integerOnly: true, trackingPolicy: "SERIAL", leadTimeDays: 45 });
  // 4. No master lead time — F-09 absent. Must yield an EVIDENCE GAP, not a default.
  const rm003 = await mkItem({ code: "RM-003", name: "Additive B (DEMO)", leadTimeDays: null });
  // 5. Excess position, shelf-life bearing — data for Mechanism 03, which is NOT built.
  const rm004 = await mkItem({ code: "RM-004", name: "Curing agent (DEMO)", leadTimeDays: 21, shelfLifeDays: 180 });
  // 6. Low stock — the attention case, no opportunity.
  const rm005 = await mkItem({ code: "RM-005", name: "Pigment concentrate (DEMO)", leadTimeDays: 30 });

  await db.insert(costReferences).values([
    { itemId: rm001, unitCost: "412.50", currency: "EGP", asOf: D("2026-11-01"), source: "Finance export (DEMO)" },
    { itemId: rm002, unitCost: "88.20", currency: "EGP", asOf: D("2026-11-01"), source: "Finance export (DEMO)" },
    { itemId: cp001, unitCost: "31500.00", currency: "EGP", asOf: D("2026-05-01"), source: "Finance export (DEMO)" }, // deliberately stale
  ]);

  /* ---- Supplier terms: MOQ, price breaks, incoterms — some deliberately
         ABSENT so the comparability gates have something to be unestablished on. */
  await db.insert(supplierItemTerms).values([
    { supplierId: supA, itemId: rm001, leadTimeDays: 30, moq: "500", orderMultiple: "100", incoterm: "FOB", paymentTermsDays: 60, currency: "USD", effectiveFrom: D("2025-06-01") },
    { supplierId: supB, itemId: rm001, leadTimeDays: 12, moq: "2000", orderMultiple: "500", incoterm: null, paymentTermsDays: null, currency: "EGP", effectiveFrom: D("2025-06-01") }, // missing terms + incoterm
    { supplierId: supC, itemId: rm004, leadTimeDays: 25, moq: "1000", orderMultiple: null, incoterm: "CIF", paymentTermsDays: 90, currency: "USD", effectiveFrom: D("2025-06-01") },
  ]);

  /* ---- Opening balances. Seeded through OPENING_BALANCE, never ADJUSTMENT. -- */
  const open = async (itemId: string, q: string, uom: string, actual?: string) =>
    postMovement({
      siteId, itemId, fromLocationId: loc.OPEN!, toLocationId: loc.WH1!,
      nominalQty: qty(q), nominalUom: uom,
      actualQty: actual ? qty(actual) : null, actualUom: actual ? "kg" : null,
      effectiveAt: D("2025-06-01"), sourceDocumentType: "OPENING_BALANCE",
      sourceDocumentId: "GOLIVE-2025", reasonCode: "GO_LIVE", actor: "admin",
      sourceNaturalKey: `open:${itemId}`,
    });

  await open(rm001, "4200", "kg");
  await open(rm002, "300", "bag", "7480.5");       // catch-weight: 300 bags, 7,480.5 kg
  await open(rm003, "900", "kg");
  await open(rm004, "18000", "kg");                 // excess position
  await open(rm005, "120", "kg");                   // low
  await postMovement({
    siteId, itemId: cp001, fromLocationId: loc.OPEN!, toLocationId: loc.WH1!,
    nominalQty: qty("3"), nominalUom: "EA", effectiveAt: D("2025-06-01"),
    sourceDocumentType: "OPENING_BALANCE", sourceDocumentId: "GOLIVE-2025",
    reasonCode: "GO_LIVE", actor: "admin", serialCode: "SN-0001", sourceNaturalKey: "open:cp001",
  });

  /* ---- Consumption history — 18 months, so the annualisation bar is met.
         D-052: some rows carry a cost centre, some do not. NULL means NOT
         CAPTURED, never "general". */
  let n = 0;
  for (let m = 0; m < 18; m++) {
    const day = new Date(Date.UTC(2025, 5 + m, 12, 8));
    await postMovement({
      siteId, itemId: rm001, fromLocationId: loc.WH1!, toLocationId: loc.PROD!,
      nominalQty: qty("310"), nominalUom: "kg", effectiveAt: day,
      sourceDocumentType: "ISSUE", sourceDocumentId: `ISS-${1000 + n}`,
      reasonCode: "CONSUMPTION", actor: "ops", sourceNaturalKey: `iss:rm001:${m}`,
      costCentre: m % 3 === 0 ? null : "CC-EXTRUSION",
    });
    await postMovement({
      siteId, itemId: rm002, fromLocationId: loc.WH1!, toLocationId: loc.PROD!,
      nominalQty: qty("12"), nominalUom: "bag", actualQty: qty("299.2"), actualUom: "kg",
      effectiveAt: day, sourceDocumentType: "ISSUE", sourceDocumentId: `ISS-${2000 + n}`,
      reasonCode: "CONSUMPTION", actor: "ops", sourceNaturalKey: `iss:rm002:${m}`,
    });
    n++;
  }

  // Quality hold — Available must exclude it BY THE MODEL, not by a filter.
  await postMovement({
    siteId, itemId: rm001, fromLocationId: loc.WH1!, toLocationId: loc.QH!,
    nominalQty: qty("250"), nominalUom: "kg", effectiveAt: D("2026-10-05"),
    sourceDocumentType: "HOLD", sourceDocumentId: "QH-14", reasonCode: "QUALITY_HOLD",
    actor: "ops", sourceNaturalKey: "hold:rm001:1",
  });

  /* ---- Purchase orders, receipts, shipments, expedites. ------------------- */
  const mkPo = async (num: string, supplierId: string, currency: string, orderedAt: Date) =>
    (await db.insert(purchaseOrders).values({
      siteId, number: num, supplierId, status: "RECEIVED", orderedAt, currency,
      incoterm: currency === "USD" ? "FOB" : null, paymentTermsDays: currency === "USD" ? 60 : null,
      sourceNaturalKey: `po:${num}`,
    }).returning())[0]!.id;

  const mkLine = async (poId: string, lineNo: number, itemId: string, q: string, uom: string, price: string, currency: string, promised: string | null, expedited: boolean, mode: string | null) =>
    (await db.insert(poLines).values({
      poId, lineNo, itemId, orderedQty: q, uom, unitPrice: price, currency,
      promisedDate: promised, expedited, freightMode: mode,
    }).returning())[0]!.id;

  const mkShipment = async (ref: string, supplierId: string, mode: string, departed: Date, arrived: Date, freight: string | null, cur: string, on: string) =>
    (await db.insert(shipments).values({
      reference: ref, supplierId, mode, departedAt: departed, arrivedAt: arrived,
      freightAmount: freight, freightCurrency: freight ? cur : null,
      freightEffectiveOn: freight ? on : null,
      currentLocation: "Alexandria Port (DEMO)", status: "ARRIVED",
    }).returning())[0]!.id;

  /**
   * ⚠ The headline scenario: master lead time on RM-001 is 18 days.
   * Actual order-to-receipt on four orders was 33, 36, 31 and 38 days.
   * Each triggered an expedite classified INCORRECT_LEAD_TIME.
   *
   * The proposed correction is the observed MAXIMUM (38) — the smallest value
   * covering every event. Derived, not chosen.
   */
  const leadTimeCases: [string, string, string, number, string, string][] = [
    ["PO-1001", "2025-09-01", "2025-10-04", 33, "9800", "USD"],
    ["PO-1002", "2026-01-05", "2026-02-10", 36, "11200", "USD"],
    ["PO-1003", "2026-05-04", "2026-06-04", 31, "9400", "USD"],
    ["PO-1004", "2026-09-07", "2026-10-15", 38, "12600", "USD"],
  ];

  for (const [num, ordered, received, , freight, cur] of leadTimeCases) {
    const poId = await mkPo(num, supA, "USD", D(ordered));
    const lineId = await mkLine(poId, 1, rm001, "3000", "kg", "13.35", "USD", null, true, "AIR");
    const shipId = await mkShipment(`SHP-${num}`, supA, "AIR", D(ordered), D(received), freight, cur, received);

    await db.insert(receipts).values({
      poLineId: lineId, sequence: 1, receivedAt: D(received),
      nominalQty: "3000", nominalUom: "kg", shipmentId: shipId, sourceNaturalKey: `rcpt:${num}:1`,
    });
    await postMovement({
      siteId, itemId: rm001, fromLocationId: loc.SUP!, toLocationId: loc.WH1!,
      nominalQty: qty("3000"), nominalUom: "kg", effectiveAt: D(received),
      sourceDocumentType: "GRN", sourceDocumentId: num, reasonCode: "RECEIPT", actor: "ops",
      sourceNaturalKey: `mv:${num}`,
      // D-028 / F10: raw dimensions preserved AS APPLICABLE. This is a USD event.
      financialDimensions: { amount: "40050.00", currency: "USD", fxRateDate: received, unitBasis: "per kg" },
    });
    await db.insert(expediteEvents).values({
      poLineId: lineId, occurredAt: D(received), rootCause: "INCORRECT_LEAD_TIME",
      classifiedBy: "buyer", premiumAmount: freight, premiumCurrency: cur, premiumEffectiveOn: received,
      baselineAmount: "3200", baselineSource: "Contracted sea-freight rate, same lane (DEMO)",
      shipmentId: shipId, sourceNaturalKey: `exp:${num}`,
    });
  }

  /* ---- Partial receipts (F-41). One order, three instalments. Lead time is
         measured to the FIRST receipt, and the choice is declared. ----------- */
  const poPartial = await mkPo("PO-1005", supB, "EGP", D("2026-07-01"));
  const linePartial = await mkLine(poPartial, 1, rm004, "9000", "kg", "402.00", "EGP", "2026-07-20", false, "ROAD");
  for (const [seq, day, q] of [[1, "2026-07-18", "3000"], [2, "2026-08-02", "3000"], [3, "2026-08-19", "3000"]] as const) {
    await db.insert(receipts).values({
      poLineId: linePartial, sequence: seq, receivedAt: D(day),
      nominalQty: q, nominalUom: "kg", sourceNaturalKey: `rcpt:PO-1005:${seq}`,
    });
    await postMovement({
      siteId, itemId: rm004, fromLocationId: loc.SUP!, toLocationId: loc.WH1!,
      nominalQty: qty(q), nominalUom: "kg", effectiveAt: D(day),
      sourceDocumentType: "GRN", sourceDocumentId: "PO-1005", reasonCode: "RECEIPT",
      actor: "ops", sourceNaturalKey: `mv:PO-1005:${seq}`,
    });
  }

  /* ---- An expedite with NO separable premium (F-01 absent) and one with NO
         root cause classified (D-018 coverage < 100%). Both must degrade the
         claim honestly rather than being dropped. ---------------------------- */
  const poNoPremium = await mkPo("PO-1006", supB, "EGP", D("2026-04-02"));
  const lineNoPremium = await mkLine(poNoPremium, 1, rm003, "600", "kg", "155.00", "EGP", "2026-04-20", true, "ROAD");
  await db.insert(receipts).values({ poLineId: lineNoPremium, sequence: 1, receivedAt: D("2026-05-02"), nominalQty: "600", nominalUom: "kg", sourceNaturalKey: "rcpt:PO-1006:1" });
  await db.insert(expediteEvents).values({
    poLineId: lineNoPremium, occurredAt: D("2026-04-28"), rootCause: "INCORRECT_LEAD_TIME",
    classifiedBy: "buyer", premiumAmount: null, premiumCurrency: null, premiumEffectiveOn: null,
    sourceNaturalKey: "exp:PO-1006",
  });

  const poUnclassified = await mkPo("PO-1007", supA, "USD", D("2026-02-10"));
  const lineUnclassified = await mkLine(poUnclassified, 1, rm001, "1500", "kg", "13.60", "USD", null, true, "AIR");
  await db.insert(receipts).values({ poLineId: lineUnclassified, sequence: 1, receivedAt: D("2026-03-12"), nominalQty: "1500", nominalUom: "kg", sourceNaturalKey: "rcpt:PO-1007:1" });
  await db.insert(expediteEvents).values({
    poLineId: lineUnclassified, occurredAt: D("2026-03-10"), rootCause: null, // unclassified
    premiumAmount: "5400", premiumCurrency: "USD", premiumEffectiveOn: "2026-03-10",
    sourceNaturalKey: "exp:PO-1007",
  });

  /* ---- A delayed shipment in flight, with an ETA that must stay a FORECAST. */
  const poOpen = await mkPo("PO-1008", supC, "USD", D("2026-11-20"));
  await db.update(purchaseOrders).set({ status: "SENT" }).where(sql`number = 'PO-1008'` as never);
  const lineOpen = await mkLine(poOpen, 1, rm004, "5000", "kg", "9.85", "USD", "2026-12-25", false, "SEA");
  const shipOpen = await mkShipment("SHP-1008", supC, "SEA", D("2026-11-28"), D("2027-01-08"), "2100", "USD", "2026-11-28");
  await db.update(shipments).set({ arrivedAt: null, status: "IN_TRANSIT" }).where(sql`reference = 'SHP-1008'` as never);
  await db.insert(etaForecasts).values([
    { shipmentId: shipOpen, etaDate: "2026-12-22", basis: "FORECAST", source: "Carrier schedule (DEMO)", observedAt: D("2026-11-28") },
    { shipmentId: shipOpen, etaDate: "2027-01-05", basis: "FORECAST", source: "Carrier revision (DEMO)", observedAt: D("2026-12-18") },
  ]);
  await db.insert(portMilestones).values([
    { shipmentId: shipOpen, milestone: "DEPARTED_ORIGIN", occurredAt: D("2026-11-28"), location: "Trieste (DEMO)" },
    { shipmentId: shipOpen, milestone: "ARRIVED_PORT", occurredAt: D("2026-12-27"), location: "Alexandria (DEMO)" },
    { shipmentId: shipOpen, milestone: "CUSTOMS_HELD", occurredAt: D("2026-12-28"), location: "Alexandria (DEMO)" },
  ]);
  void lineOpen;

  /* ======================================================================== */
  /* BLOCK 9 — DEMO RECIPES. D-054, and §8 of the Block 8 contract.           */
  /*                                                                          */
  /* ⚠ These exist ONLY so the feasibility contract can be exercised before   */
  /* factory recipes arrive (F-48 is unanswered; B-07 says the pilot factory  */
  /* has no data yet). Every line carries isDemo = true, every parent name    */
  /* carries "(DEMO)", and the product SAYS SO at the layer the user reads to */
  /* act. Removing demo data leaves every real product at CAN'T SAY — the     */
  /* honest state, not a degraded one.                                        */
  /*                                                                          */
  /* The two recipes are chosen to exercise every branch of the engine:       */
  /*   FG-100  a normal component · a catch-weight one · one with no lead     */
  /*           time · an integer-only one · one needing a unit conversion     */
  /*   FG-200  contains FG-100, which has its own recipe -> CAN'T SAY         */
  /* ======================================================================== */

  const fg100 = await mkItem({
    code: "FG-100", name: "Sealant compound, 20L pail (DEMO)",
    kind: "DISCRETE_GOOD", stockUom: "EA", integerOnly: true,
  });
  const fg200 = await mkItem({
    code: "FG-200", name: "Sealant kit, boxed (DEMO)",
    kind: "DISCRETE_GOOD", stockUom: "EA", integerOnly: true,
  });

  /* F6: conversions are PER ITEM and versioned, never global. RM-005 is held
     in kg and the recipe states grams, so the answer needs this row. RM-003 is
     deliberately left WITHOUT one, to exercise the CAN'T SAY path. */
  await db.insert(uomConversions).values([
    { itemId: rm005, fromUom: "g", toUom: "kg", factor: "0.001", effectiveFrom: D("2026-01-01") },
    { itemId: rm002, fromUom: "bag", toUom: "kg", factor: "25", effectiveFrom: D("2026-01-01") },
  ]);

  const recipe = (parentItemId: string, componentItemId: string, quantityPer: string, uom: string) => ({
    siteId, parentItemId, componentItemId, quantityPer, uom,
    effectiveFrom: D("2026-01-01"), isDemo: true,
    sourceNaturalKey: `demo:${quantityPer}${uom}`,
  });

  await db.insert(productStructures).values([
    /* FG-100 is fully computable, so the answer moves 🟢 → 🟡 → 🔴 purely with
       the quantity asked for. That is the demonstration: same product, same
       data, and the verdict changes because the EVIDENCE changes. */
    recipe(fg100, rm001, "2.5", "kg"),   // plain kg -> kg; supplier terms say 30 days
    recipe(fg100, rm002, "0.8", "kg"),   // catch-weight: bought by the bag, weighed in kg
    recipe(fg100, rm005, "40", "g"),     // needs the g -> kg conversion above

    /* FG-200 exercises both ways an answer can be UNANSWERABLE, which is the
       state most systems fake: a component that is itself made in-house, and a
       component whose unit cannot be converted. */
    recipe(fg200, fg100, "1", "EA"),     // ⚠ FG-100 has its own recipe -> CAN'T SAY
    recipe(fg200, cp001, "2", "EA"),     // integer-only, lead time 45
    recipe(fg200, rm003, "0.15", "L"),   // ⚠ no L->kg conversion recorded -> CAN'T SAY
  ]);

  /* Open supply, so 🟡 AT RISK is reachable in the running product and not only
     in the tests. These are SENT and unreceived — which is exactly the state
     that can never produce 🟢, however much is on the way. */
  const openSupply = async (itemId: string, number: string, quantity: string, promised: string) => {
    const [po] = await db.insert(purchaseOrders).values({
      siteId, number, supplierId: supA, status: "SENT",
      orderedAt: D("2026-12-05"), currency: "EGP", paymentTermsDays: 60,
    }).returning();
    await db.insert(poLines).values({
      poId: po!.id, lineNo: 1, itemId, orderedQty: quantity, uom: "kg",
      unitPrice: "40", currency: "EGP", promisedDate: promised,
    });
  };
  await openSupply(rm001, "PO-1009", "9000", "2027-02-15");
  await openSupply(rm002, "PO-1010", "4000", "2027-02-18");
  await openSupply(rm005, "PO-1011", "400", "2027-02-20");

  console.log("Demo fixtures seeded. Every batch is marked isDemo = true.");
  console.log("Scenarios: lead-time correction (4 events) · unclassified expedite · expedite with no");
  console.log("separable premium · partial receipts · catch-weight · serial-tracked discrete · quality");
  console.log("hold · excess position · low stock · missing lead time · missing incoterm and terms ·");
  console.log("EGP devaluation across the window · delayed shipment with a revised FORECAST ETA.");
  console.log("Feasibility: FG-100 (3 materials, fully computable — ask 3,000 / 6,000 / 20,000 to");
  console.log("  see YES / AT RISK / NO) and FG-200 (a made-in-house component and an unconvertible");
  console.log("  unit — both CAN'T SAY). Three open orders make AT RISK reachable in the app.");
  await sql.end();
}

main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
