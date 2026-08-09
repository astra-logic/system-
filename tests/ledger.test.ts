/**
 * Ledger tests — D-001 as amended.
 *
 * These are the MVP's acceptance criteria 4 and 5, written as tests rather than
 * as prose: balances equal the projection of history AT ANY PAST INSTANT, and a
 * duplicate ingestion is refused rather than accepted and corrected.
 */
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { qty } from "../lib/core/decimal";
import { balanceAt, DuplicateIngestionError, LedgerError, positionAt, postMovement, reverseMovement, verifyProjection } from "../lib/ledger/post";
import { type Ctx, d, makeItem, resetDb, seedWorld } from "./helpers";

let ctx: Ctx;

beforeEach(async () => {
  await resetDb();
  ctx = await seedWorld();
});

const base = (over: Partial<Parameters<typeof postMovement>[0]> = {}) => ({
  siteId: ctx.siteId,
  itemId: "",
  fromLocationId: ctx.loc.SUP!,
  toLocationId: ctx.loc.WH1!,
  nominalQty: qty("100"),
  nominalUom: "kg",
  effectiveAt: d("2026-01-10T08:00:00Z"),
  sourceDocumentType: "GRN",
  sourceDocumentId: "GRN-001",
  reasonCode: "RECEIPT",
  actor: "tester",
  ...over,
});

describe("stock conservation", () => {
  it("conserves stock by construction — every movement balances", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId }));
    // Supplier -100, warehouse +100. Total across all buckets is zero.
    expect((await balanceAt(itemId, d("2026-02-01T00:00:00Z"))).toFixed()).toBe("0");
  });

  it("refuses a movement with the same source and destination", async () => {
    const itemId = await makeItem(ctx.siteId);
    await expect(postMovement(base({ itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.WH1! }))).rejects.toThrow(LedgerError);
  });

  it("refuses a negative or zero quantity — direction is from/to, never sign", async () => {
    const itemId = await makeItem(ctx.siteId);
    await expect(postMovement(base({ itemId, nominalQty: qty("-5") }))).rejects.toThrow(/must be positive/);
    await expect(postMovement(base({ itemId, nominalQty: qty("0") }))).rejects.toThrow(/must be positive/);
  });

  it("refuses an orphan movement — no reason code, no source document", async () => {
    const itemId = await makeItem(ctx.siteId);
    await expect(postMovement(base({ itemId, reasonCode: "  " }))).rejects.toThrow(/reason code/);
    await expect(postMovement(base({ itemId, sourceDocumentId: "" }))).rejects.toThrow(/source document/);
  });
});

describe("point-in-time reconstruction (D-001 as amended, required by D-039)", () => {
  it("reconstructs the balance at any past instant, not only the present", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId, nominalQty: qty("100"), effectiveAt: d("2026-01-10T00:00:00Z"), sourceDocumentId: "GRN-1", sourceNaturalKey: "k1" }));
    await postMovement(base({ itemId, nominalQty: qty("40"), effectiveAt: d("2026-02-10T00:00:00Z"), sourceDocumentId: "GRN-2", sourceNaturalKey: "k2" }));
    await postMovement(
      base({ itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.PROD!, nominalQty: qty("30"), effectiveAt: d("2026-03-10T00:00:00Z"), sourceDocumentType: "ISSUE", sourceDocumentId: "ISS-1", reasonCode: "CONSUMPTION", sourceNaturalKey: "k3" }),
    );

    const onHand = async (at: string) => (await positionAt(itemId, d(at))).onHand.toFixed();
    expect(await onHand("2026-01-01T00:00:00Z")).toBe("0");
    expect(await onHand("2026-01-15T00:00:00Z")).toBe("100");
    expect(await onHand("2026-02-15T00:00:00Z")).toBe("140");
    expect(await onHand("2026-03-15T00:00:00Z")).toBe("110");
  });

  it("backdated movements produce correct balances at effective time", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId, nominalQty: qty("50"), effectiveAt: d("2026-03-01T00:00:00Z"), sourceNaturalKey: "a" }));
    // Recorded later, effective earlier — normal in factories.
    await postMovement(base({ itemId, nominalQty: qty("20"), effectiveAt: d("2026-01-05T00:00:00Z"), sourceDocumentId: "GRN-BACK", sourceNaturalKey: "b" }));
    expect((await positionAt(itemId, d("2026-02-01T00:00:00Z"))).onHand.toFixed()).toBe("20");
    expect((await positionAt(itemId, d("2026-04-01T00:00:00Z"))).onHand.toFixed()).toBe("70");
  });

  it("projection agrees with independent recomputation", async () => {
    const itemId = await makeItem(ctx.siteId);
    for (let i = 0; i < 12; i++) {
      await postMovement(base({ itemId, nominalQty: qty("7.125"), sourceDocumentId: `GRN-${i}`, sourceNaturalKey: `nk-${i}` }));
    }
    const v = await verifyProjection(itemId, d("2027-01-01T00:00:00Z"));
    expect(v.agreed).toBe(true);
  });
});

describe("duplicate ingestion is refused at the door (D-001 as amended)", () => {
  it("refuses a second movement bearing a natural key already recorded", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId, sourceNaturalKey: "ERP:GRN:1001" }));
    await expect(postMovement(base({ itemId, sourceNaturalKey: "ERP:GRN:1001" }))).rejects.toThrow(DuplicateIngestionError);
    // And the duplicate did not partially apply.
    expect((await positionAt(itemId, d("2027-01-01T00:00:00Z"))).onHand.toFixed()).toBe("100");
  });

  it("allows movements without a natural key to coexist", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId }));
    await postMovement(base({ itemId }));
    expect((await positionAt(itemId, d("2027-01-01T00:00:00Z"))).onHand.toFixed()).toBe("200");
  });
});

describe("opening balance is segregated from adjustment (D-001 as amended)", () => {
  it("permits seeding through OPENING_BALANCE", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId, fromLocationId: ctx.loc.OPEN!, sourceDocumentType: "OPENING_BALANCE", sourceDocumentId: "GOLIVE", reasonCode: "GO_LIVE" }));
    expect((await positionAt(itemId, d("2027-01-01T00:00:00Z"))).onHand.toFixed()).toBe("100");
  });

  it("refuses OPENING_BALANCE for an operational event — count accuracy must not be poisoned on day one", async () => {
    const itemId = await makeItem(ctx.siteId);
    await expect(
      postMovement(base({ itemId, fromLocationId: ctx.loc.OPEN!, sourceDocumentType: "GRN", reasonCode: "RECEIPT" })),
    ).rejects.toThrow(/OPENING_BALANCE is the counterparty for go-live/);
  });
});

describe("catch-weight (D-048)", () => {
  it("refuses to post a catch-weight movement without an actual weight", async () => {
    const itemId = await makeItem(ctx.siteId, { catchWeight: true, nominalUom: "bag", stockUom: "kg" });
    await expect(postMovement(base({ itemId, nominalQty: qty("10"), nominalUom: "bag" }))).rejects.toThrow(/INCOMPLETE and does not post/);
  });

  it("balances a catch-weight item on ACTUAL weight, not on nominal units", async () => {
    const itemId = await makeItem(ctx.siteId, { catchWeight: true, nominalUom: "bag", stockUom: "kg" });
    await postMovement(base({ itemId, nominalQty: qty("10"), nominalUom: "bag", actualQty: qty("248.6"), actualUom: "kg" }));
    expect((await positionAt(itemId, d("2027-01-01T00:00:00Z"))).onHand.toFixed()).toBe("248.6");
  });

  it("refuses an actual weight on a non-catch-weight item — NULL must stay unambiguous", async () => {
    const itemId = await makeItem(ctx.siteId, { catchWeight: false });
    await expect(postMovement(base({ itemId, actualQty: qty("99"), actualUom: "kg" }))).rejects.toThrow(/must be NULL/);
  });
});

describe("F3 quantity semantics", () => {
  it("excludes quality-hold stock from Available by the model, not by a filter", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId, nominalQty: qty("100"), sourceNaturalKey: "r1" }));
    await postMovement(base({ itemId, fromLocationId: ctx.loc.WH1!, toLocationId: ctx.loc.QH!, nominalQty: qty("25"), sourceDocumentType: "HOLD", sourceDocumentId: "H-1", reasonCode: "QUALITY_HOLD", sourceNaturalKey: "h1" }));
    const p = await positionAt(itemId, d("2027-01-01T00:00:00Z"));
    expect(p.onHand.toFixed()).toBe("100");
    expect(p.qualityHold.toFixed()).toBe("25");
    expect(p.available.toFixed()).toBe("75");
  });

  it("reports Reserved as zero rather than hiding it (D-050)", async () => {
    const itemId = await makeItem(ctx.siteId);
    await postMovement(base({ itemId }));
    expect((await positionAt(itemId, d("2027-01-01T00:00:00Z"))).reserved.toFixed()).toBe("0");
  });
});

describe("corrections are reversing entries, never edits", () => {
  it("reverses without mutating the original", async () => {
    const itemId = await makeItem(ctx.siteId);
    const { id } = await postMovement(base({ itemId, sourceNaturalKey: "orig" }));
    await reverseMovement(id, "tester", "wrong quantity keyed");
    expect((await positionAt(itemId, d("2027-01-01T00:00:00Z"))).onHand.toFixed()).toBe("0");
    const v = await verifyProjection(itemId, d("2027-01-01T00:00:00Z"));
    expect(v.agreed).toBe(true);
  });
});

describe("exact decimals survive the round trip (D-047)", () => {
  it("does not drift over repeated fractional movements", async () => {
    const itemId = await makeItem(ctx.siteId);
    for (let i = 0; i < 10; i++) {
      await postMovement(base({ itemId, nominalQty: qty("0.1"), sourceDocumentId: `G-${i}`, sourceNaturalKey: `d-${i}` }));
    }
    // 0.1 added ten times is exactly 1 — the assertion that fails under binary floats.
    expect((await positionAt(itemId, d("2027-01-01T00:00:00Z"))).onHand.toFixed()).toBe("1");
  });
});
