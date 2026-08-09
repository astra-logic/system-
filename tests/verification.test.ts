/**
 * Ledger verification — the ten adversarial cases.
 *
 * The Block 6 audit found that the previous verification was algebraically zero
 * on both sides. These tests exist to PROVE THE INVARIANT rather than exercise
 * the function: each one damages the data in a specific way and asserts that
 * verification NOTICES.
 *
 * A test here passing while the data is corrupt would be worse than no test.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { sql } from "../lib/db/client";
import { qty } from "../lib/core/decimal";
import { balanceAt, positionAt, postMovement, postReturn, reverseMovement } from "../lib/ledger/post";
import { reconstructOnHandAt, verifyProjection } from "../lib/ledger/verify";
import { type Ctx, d, makeItem, resetDb, seedWorld } from "./helpers";

let ctx: Ctx;
let itemId: string;

beforeEach(async () => {
  await resetDb();
  ctx = await seedWorld();
  itemId = await makeItem(ctx.siteId, { code: "RM-V1" });
});

const receive = (q: string, on: string, key: string) =>
  postMovement({
    siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.SUP!, toLocationId: ctx.loc.WH1!,
    nominalQty: qty(q), nominalUom: "kg", effectiveAt: d(on),
    sourceDocumentType: "GRN", sourceDocumentId: key, reasonCode: "RECEIPT", actor: "ops",
    sourceNaturalKey: key,
  });

const issue = (q: string, on: string, key: string) =>
  postMovement({
    siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.PROD!,
    nominalQty: qty(q), nominalUom: "kg", effectiveAt: d(on),
    sourceDocumentType: "ISSUE", sourceDocumentId: key, reasonCode: "CONSUMPTION", actor: "ops",
    sourceNaturalKey: key,
  });

/* ========================================================================== */
describe("the invariant has content (it is not a tautology)", () => {
  it("agrees on clean data", async () => {
    await receive("100", "2026-01-10", "r1");
    await issue("30", "2026-02-10", "i1");
    const r = await verifyProjection({ itemId });
    expect(r.agreed).toBe(true);
    expect(r.locationsChecked).toBeGreaterThan(0);
  });

  it("compares PER LOCATION, so the two sides are not both zero", async () => {
    await receive("100", "2026-01-10", "r1");
    const r = await verifyProjection({ itemId });
    // WH1 +100 and SUP −100 are checked separately; neither side is a global sum.
    expect(r.locationsChecked).toBeGreaterThanOrEqual(2);
  });

  it("1. CORRUPTED BALANCE ROW — verification FAILS", async () => {
    await receive("100", "2026-01-10", "r1");
    expect((await verifyProjection({ itemId })).agreed).toBe(true);

    await sql`UPDATE balances SET qty = qty + 5 WHERE item_id = ${itemId}::uuid AND location_id = ${ctx.loc.WH1!}::uuid`;

    const r = await verifyProjection({ itemId });
    expect(r.agreed).toBe(false);
    expect(r.discrepancies).toHaveLength(1);
    expect(r.discrepancies[0]!.kind).toBe("DRIFT");
    expect(r.discrepancies[0]!.difference.toFixed()).toBe("5");
  });

  it("2. MISSING MOVEMENT — a deleted movement is detected", async () => {
    await receive("100", "2026-01-10", "r1");
    await issue("30", "2026-02-10", "i1");
    // Simulating history loss. The projection still remembers the issue.
    await sql`DELETE FROM movements WHERE source_natural_key = 'i1'`;
    const r = await verifyProjection({ itemId });
    expect(r.agreed).toBe(false);
    expect(r.discrepancies.map((x) => x.locationCode).sort()).toEqual(["PROD", "WH1"]);
  });

  it("3. DUPLICATED MOVEMENT — an extra ledger row is detected", async () => {
    await receive("100", "2026-01-10", "r1");
    await sql`
      INSERT INTO movements (site_id, item_id, from_location_id, to_location_id, nominal_qty,
                             nominal_uom, effective_at, source_document_type, source_document_id,
                             reason_code, actor)
      SELECT site_id, item_id, from_location_id, to_location_id, nominal_qty, nominal_uom,
             effective_at, source_document_type, source_document_id, reason_code, actor
      FROM movements WHERE source_natural_key = 'r1'`;
    const r = await verifyProjection({ itemId });
    expect(r.agreed).toBe(false);
    expect(r.discrepancies.some((x) => x.difference.abs().toFixed() === "100")).toBe(true);
  });

  it("4. WRONG QUANTITY on a ledger row — detected", async () => {
    await receive("100", "2026-01-10", "r1");
    await sql`UPDATE movements SET nominal_qty = 140 WHERE source_natural_key = 'r1'`;
    const r = await verifyProjection({ itemId });
    expect(r.agreed).toBe(false);
    expect(r.discrepancies).toHaveLength(2); // both endpoints move
  });

  it("5. WRONG LOCATION on a ledger row — detected as orphan + missing", async () => {
    await receive("100", "2026-01-10", "r1");
    await sql`UPDATE movements SET to_location_id = ${ctx.loc.SCRAP!}::uuid WHERE source_natural_key = 'r1'`;
    const r = await verifyProjection({ itemId });
    expect(r.agreed).toBe(false);
    const kinds = r.discrepancies.map((x) => x.kind).sort();
    expect(kinds).toContain("ORPHAN_PROJECTION");   // WH1 has a row history disowns
    expect(kinds).toContain("MISSING_PROJECTION");  // SCRAP has history with no row
  });

  it("detects a corrupted row even when the corruption preserves the global sum", async () => {
    // This is exactly what the OLD verification could not see.
    await receive("100", "2026-01-10", "r1");
    await sql`UPDATE balances SET qty = qty + 7 WHERE item_id = ${itemId}::uuid AND location_id = ${ctx.loc.WH1!}::uuid`;
    await sql`UPDATE balances SET qty = qty - 7 WHERE item_id = ${itemId}::uuid AND location_id = ${ctx.loc.SUP!}::uuid`;
    const [tot] = await sql<{ s: string }[]>`SELECT SUM(qty)::text AS s FROM balances WHERE item_id = ${itemId}::uuid`;
    expect(tot!.s).toBe("0"); // globally balanced — the old check would pass
    expect((await verifyProjection({ itemId })).agreed).toBe(false); // this one does not
  });
});

/* ========================================================================== */
describe("6. HISTORICAL RECONSTRUCTION — against independently derived values", () => {
  it("matches hand-computed expectations at each instant", async () => {
    await receive("100", "2026-01-10", "r1");
    await receive("40", "2026-02-10", "r2");
    await issue("30", "2026-03-10", "i1");
    await issue("55", "2026-04-10", "i2");

    // Expected values derived by hand, NOT by any code under test:
    //   before any movement            0
    //   after r1                     100
    //   after r1+r2                  140
    //   after r1+r2−i1               110
    //   after r1+r2−i1−i2             55
    const expected: [string, string][] = [
      ["2026-01-01", "0"],
      ["2026-01-15", "100"],
      ["2026-02-15", "140"],
      ["2026-03-15", "110"],
      ["2026-05-01", "55"],
    ];
    for (const [at, want] of expected) {
      const r = await reconstructOnHandAt(itemId, d(at));
      expect(`${at}=${r.onHand.toFixed()}`).toBe(`${at}=${want}`);
    }
  });

  it("two independent implementations of history agree with each other", async () => {
    await receive("100", "2026-01-10", "r1");
    await issue("30", "2026-03-10", "i1");
    for (const at of ["2026-01-01", "2026-02-01", "2026-06-01"]) {
      const viaSql = await reconstructOnHandAt(itemId, d(at));
      const viaTs = await positionAt(itemId, d(at));
      expect(viaSql.onHand.toFixed()).toBe(viaTs.onHand.toFixed());
    }
  });

  it("does not claim the projection can answer a historical question", async () => {
    await receive("100", "2026-01-10", "r1");
    const r = await verifyProjection({ itemId });
    expect(r.note).toMatch(/no time dimension/);
    expect(r.note).toMatch(/cannot and does not verify any past instant/);
  });

  it("a backdated movement changes history at effective time, and the projection still agrees", async () => {
    await receive("50", "2026-03-01", "a");
    await receive("20", "2026-01-05", "b"); // recorded later, effective earlier
    expect((await reconstructOnHandAt(itemId, d("2026-02-01"))).onHand.toFixed()).toBe("20");
    expect((await reconstructOnHandAt(itemId, d("2026-04-01"))).onHand.toFixed()).toBe("70");
    expect((await verifyProjection({ itemId })).agreed).toBe(true);
  });
});

/* ========================================================================== */
describe("7. CATCH-WEIGHT QUANTITY", () => {
  it("verifies on ACTUAL weight, not nominal units", async () => {
    const cw = await makeItem(ctx.siteId, { code: "CW-1", catchWeight: true, nominalUom: "bag", stockUom: "kg" });
    await postMovement({
      siteId: ctx.siteId, itemId: cw, fromLocationId: ctx.loc.SUP!, toLocationId: ctx.loc.WH1!,
      nominalQty: qty("10"), nominalUom: "bag", actualQty: qty("248.6"), actualUom: "kg",
      effectiveAt: d("2026-01-10"), sourceDocumentType: "GRN", sourceDocumentId: "cw1",
      reasonCode: "RECEIPT", actor: "ops", sourceNaturalKey: "cw1",
    });
    const r = await verifyProjection({ itemId: cw });
    expect(r.agreed).toBe(true);
    expect((await reconstructOnHandAt(cw, d("2026-02-01"))).onHand.toFixed()).toBe("248.6");
    // Corrupting to the NOMINAL figure must fail — proving actual is what is checked.
    await sql`UPDATE balances SET qty = 10 WHERE item_id = ${cw}::uuid AND location_id = ${ctx.loc.WH1!}::uuid`;
    expect((await verifyProjection({ itemId: cw })).agreed).toBe(false);
  });
});

/* ========================================================================== */
describe("8. RETURN MOVEMENT", () => {
  it("a return moves stock back to the supplier and the projection agrees", async () => {
    await receive("100", "2026-01-10", "r1");
    await postReturn({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.SUP!,
      nominalQty: qty("25"), nominalUom: "kg", effectiveAt: d("2026-02-01"),
      sourceDocumentType: "RTV", sourceDocumentId: "rtv-1", reasonCode: "RETURN_TO_SUPPLIER",
      actor: "ops", sourceNaturalKey: "rtv1",
    });
    expect((await verifyProjection({ itemId })).agreed).toBe(true);
    expect((await reconstructOnHandAt(itemId, d("2026-03-01"))).onHand.toFixed()).toBe("75");
    // A return is a movement, not a reversal: the original is untouched.
    const [n] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM movements WHERE reverses_movement_id IS NOT NULL AND item_id = ${itemId}::uuid`;
    expect(n!.n).toBe("0");
  });

  it("a reversal is distinguishable from a return in the ledger", async () => {
    const { id } = await receive("100", "2026-01-10", "r1");
    await reverseMovement(id, "ops", "quantity keyed wrong");
    const [n] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM movements WHERE reverses_movement_id = ${id}::uuid`;
    expect(n!.n).toBe("1");
    expect((await verifyProjection({ itemId })).agreed).toBe(true);
    expect((await reconstructOnHandAt(itemId, d("2027-01-01"))).onHand.toFixed()).toBe("0");
  });
});

/* ========================================================================== */
describe("9. OPENING BALANCE", () => {
  it("seeds through OPENING_BALANCE and verifies, without touching ADJUSTMENT", async () => {
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.OPEN!, toLocationId: ctx.loc.WH1!,
      nominalQty: qty("4200"), nominalUom: "kg", effectiveAt: d("2025-06-01"),
      sourceDocumentType: "OPENING_BALANCE", sourceDocumentId: "GOLIVE", reasonCode: "GO_LIVE",
      actor: "admin", sourceNaturalKey: "open1",
    });
    expect((await verifyProjection({ itemId })).agreed).toBe(true);
    const [adj] = await sql<{ q: string | null }[]>`SELECT qty::text AS q FROM balances WHERE item_id = ${itemId}::uuid AND location_id = ${ctx.loc.ADJ!}::uuid`;
    expect(adj?.q ?? null).toBeNull(); // count accuracy is not poisoned on day one
  });
});

/* ========================================================================== */
describe("10. ADJUSTMENT", () => {
  it("a count adjustment produces a movement and the projection agrees", async () => {
    await receive("100", "2026-01-10", "r1");
    await postMovement({
      siteId: ctx.siteId, itemId, fromLocationId: ctx.loc.ADJ!, toLocationId: ctx.loc.WH1!,
      nominalQty: qty("3.5"), nominalUom: "kg", effectiveAt: d("2026-02-20"),
      sourceDocumentType: "COUNT", sourceDocumentId: "CNT-9", reasonCode: "CYCLE_COUNT_VARIANCE",
      actor: "ops", sourceNaturalKey: "cnt9",
    });
    expect((await verifyProjection({ itemId })).agreed).toBe(true);
    expect((await reconstructOnHandAt(itemId, d("2026-03-01"))).onHand.toFixed()).toBe("103.5");
    // The variance is attributable, not absorbed.
    const [adj] = await sql<{ q: string }[]>`SELECT qty::text AS q FROM balances WHERE item_id = ${itemId}::uuid AND location_id = ${ctx.loc.ADJ!}::uuid`;
    expect(qty(adj!.q).toFixed()).toBe("-3.5");
  });
});

/* ========================================================================== */
describe("conservation is reported separately from projection agreement", () => {
  it("does not present conservation as evidence the projection is right", async () => {
    await receive("100", "2026-01-10", "r1");
    await sql`UPDATE balances SET qty = qty + 9 WHERE item_id = ${itemId}::uuid AND location_id = ${ctx.loc.WH1!}::uuid`;
    const r = await verifyProjection({ itemId });
    expect(r.conservationHolds).toBe(true); // the ledger is still well-formed
    expect(r.agreed).toBe(false);           // and the projection is still wrong
  });

  it("balanceAt over all buckets remains zero — the old check's blind spot, kept visible", async () => {
    await receive("100", "2026-01-10", "r1");
    expect((await balanceAt(itemId, d("2027-01-01"))).toFixed()).toBe("0");
  });
});
