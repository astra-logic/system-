/**
 * Import → ledger, end to end.
 *
 * The Block 6 audit found the importer was unit-tested but never wired: no
 * spreadsheet had ever reached the ledger. These tests take a real workbook
 * through parse → validate → apply → balances, and assert that the ledger's
 * rules apply to an upload exactly as they do to anything else.
 */
import { beforeEach, describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { sql } from "../lib/db/client";
import { parseFile, readSheet, recordBatch } from "../lib/import/ingest";
import { ITEM_SPEC, MOVEMENT_SPEC } from "../lib/import/specs";
import { applyItems, applyMovements, recordOutcomes } from "../lib/import/apply";
import { positionAt } from "../lib/ledger/post";
import { verifyProjection } from "../lib/ledger/verify";
import { type Ctx, d, resetDb, seedWorld } from "./helpers";

let ctx: Ctx;

beforeEach(async () => {
  await resetDb();
  ctx = await seedWorld();
});

/** Builds a real .xlsx in memory — the same path a browser upload takes. */
function workbook(rows: Record<string, unknown>[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

async function importItems(rows: Record<string, unknown>[], isDemo = true) {
  const { header, rows: parsedRows } = readSheet(workbook(rows));
  const parsed = parseFile(header, parsedRows, ITEM_SPEC);
  const { batchId } = await recordBatch(parsed, {
    siteId: ctx.siteId, filename: "items.xlsx", kind: "ITEMS", uploadedBy: "admin", isDemo,
  });
  const report = parsed.missingColumns.length === 0 ? await applyItems(parsed, { siteId: ctx.siteId }) : null;
  if (report) await recordOutcomes(batchId, report);
  return { parsed, report, batchId };
}

async function importMovements(rows: Record<string, unknown>[], isDemo = true) {
  const { header, rows: parsedRows } = readSheet(workbook(rows));
  const parsed = parseFile(header, parsedRows, MOVEMENT_SPEC);
  const { batchId } = await recordBatch(parsed, {
    siteId: ctx.siteId, filename: "movements.xlsx", kind: "MOVEMENTS", uploadedBy: "admin", isDemo,
  });
  const report = parsed.missingColumns.length === 0
    ? await applyMovements(parsed, { siteId: ctx.siteId, actor: "admin" })
    : null;
  if (report) await recordOutcomes(batchId, report);
  return { parsed, report, batchId };
}

const ITEM = { code: "RM-IMP", name: "Imported resin", kind: "PROCESS_MATERIAL", stock_uom: "kg", lead_time_days: 21 };
const MOVE = (over: Record<string, unknown> = {}) => ({
  natural_key: "ERP:GRN:5001", item_code: "RM-IMP", from_location: "SUP", to_location: "WH1",
  quantity: "1250.5", uom: "kg", effective_date: "2026-05-14", reason_code: "RECEIPT",
  document_type: "GRN", document_id: "GRN-5001", ...over,
});

/* ========================================================================== */
describe("a spreadsheet becomes stock truth", () => {
  it("UPLOAD → PARSE → VALIDATE → LEDGER → BALANCES", async () => {
    await importItems([ITEM]);
    const { report } = await importMovements([MOVE()]);

    expect(report!.applied).toBe(1);
    expect(report!.rejected).toBe(0);

    const [item] = await sql<{ id: string }[]>`SELECT id FROM items WHERE code = 'RM-IMP'`;
    const pos = await positionAt(item!.id, d("2026-06-01"));
    expect(pos.onHand.toFixed()).toBe("1250.5");

    // The upload lands under the SAME invariant as everything else.
    expect((await verifyProjection({ itemId: item!.id })).agreed).toBe(true);
  });

  it("goes through the ledger, not around it — the movement carries the ledger's fields", async () => {
    await importItems([ITEM]);
    await importMovements([MOVE()]);
    const [m] = await sql<{ reason_code: string; source_document_id: string; source_natural_key: string; actor: string }[]>`
      SELECT reason_code, source_document_id, source_natural_key, actor FROM movements`;
    expect(m!.reason_code).toBe("RECEIPT");
    expect(m!.source_document_id).toBe("GRN-5001");
    expect(m!.source_natural_key).toBe("ERP:GRN:5001");
    expect(m!.actor).toBe("admin");
  });

  it("preserves the original row exactly as submitted, accepted or not", async () => {
    await importItems([ITEM]);
    const { batchId } = await importMovements([MOVE()]);
    const [row] = await sql<{ raw: Record<string, unknown>; outcome: string }[]>`
      SELECT raw, outcome FROM import_rows WHERE batch_id = ${batchId}::uuid`;
    expect(row!.raw["natural_key"]).toBe("ERP:GRN:5001");
    expect(row!.outcome).toBe("APPLIED");
  });
});

/* ========================================================================== */
describe("the importer refuses rather than repairs", () => {
  it("REJECTS an ambiguous date and writes nothing", async () => {
    await importItems([ITEM]);
    const { report } = await importMovements([MOVE({ effective_date: "03/04/2026" })]);
    expect(report!.applied).toBe(0);
    expect(report!.rejected).toBe(1);
    expect(report!.outcomes[0]!.detail).toMatch(/day\/month or month\/day/);
    const [n] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM movements`;
    expect(n!.n).toBe("0");
  });

  it("REJECTS an invalid quantity and never treats it as zero", async () => {
    await importItems([ITEM]);
    const { report } = await importMovements([MOVE({ quantity: "n/a" })]);
    expect(report!.applied).toBe(0);
    expect(report!.outcomes[0]!.detail).toMatch(/cannot be silently treated as zero/);
  });

  it("REJECTS a negative quantity — direction is from/to, never sign", async () => {
    await importItems([ITEM]);
    const { report } = await importMovements([MOVE({ quantity: "-5" })]);
    expect(report!.applied).toBe(0);
  });

  it("REJECTS a missing unit", async () => {
    await importItems([ITEM]);
    const { report } = await importMovements([MOVE({ uom: "" })]);
    expect(report!.applied).toBe(0);
    expect(report!.outcomes[0]!.detail).toMatch(/unit/i);
  });

  it("REJECTS an unknown item rather than inventing one", async () => {
    const { report } = await importMovements([MOVE({ item_code: "GHOST" })]);
    expect(report!.applied).toBe(0);
    expect(report!.outcomes[0]!.detail).toMatch(/does not exist in the system/);
    expect(report!.outcomes[0]!.detail).toMatch(/carry no unit, no type and no lead time/);
  });

  it("REFUSES a duplicate ingestion on re-upload of the same file", async () => {
    await importItems([ITEM]);
    const first = await importMovements([MOVE()]);
    expect(first.report!.applied).toBe(1);

    const second = await importMovements([MOVE()]);
    expect(second.report!.applied).toBe(0);
    expect(second.report!.duplicates).toBe(1);
    expect(second.report!.outcomes[0]!.detail).toMatch(/Already recorded/);

    const [n] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM movements`;
    expect(n!.n).toBe("1"); // posted once, not twice
  });

  it("reports a missing required column ONCE and imports nothing", async () => {
    await importItems([ITEM]);
    const { parsed, report } = await importMovements([
      { natural_key: "k", item_code: "RM-IMP", quantity: "10", uom: "kg" } as Record<string, unknown>,
    ]);
    expect(parsed.missingColumns.length).toBeGreaterThan(0);
    expect(report).toBeNull();
    const [n] = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM movements`;
    expect(n!.n).toBe("0");
  });

  it("applies good rows and rejects bad ones in the same file, distinguishably", async () => {
    await importItems([ITEM]);
    const { report, batchId } = await importMovements([
      MOVE({ natural_key: "ok-1" }),
      MOVE({ natural_key: "bad-1", effective_date: "05/06/2026" }),
      MOVE({ natural_key: "ok-2", quantity: "10" }),
    ]);
    expect(report!.applied).toBe(2);
    expect(report!.rejected).toBe(1);

    const [batch] = await sql<{ rows_accepted: number; rows_rejected: number; status: string }[]>`
      SELECT rows_accepted, rows_rejected, status FROM import_batches WHERE id = ${batchId}::uuid`;
    expect(batch!.rows_accepted).toBe(2);
    expect(batch!.rows_rejected).toBe(1);
    expect(batch!.status).toBe("PARTIAL");
  });

  it("does NOT overwrite existing master data from a spreadsheet", async () => {
    await importItems([ITEM]);
    const { report } = await importItems([{ ...ITEM, lead_time_days: 99 }]);
    expect(report!.duplicates).toBe(1);
    expect(report!.outcomes[0]!.detail).toMatch(/change historical figures with no record of why/);
    const [i] = await sql<{ lead_time_days: number }[]>`SELECT lead_time_days FROM items WHERE code = 'RM-IMP'`;
    expect(i!.lead_time_days).toBe(21); // unchanged
  });

  it("catch-weight: a movement without an actual weight is refused by the LEDGER", async () => {
    await importItems([{ code: "CW-IMP", name: "Bagged filler", kind: "PROCESS_MATERIAL", stock_uom: "kg", catch_weight: "Y", nominal_uom: "bag" }]);
    const { report } = await importMovements([
      MOVE({ natural_key: "cw-1", item_code: "CW-IMP", quantity: "10", uom: "bag" }),
    ]);
    expect(report!.applied).toBe(0);
    expect(report!.outcomes[0]!.detail).toMatch(/INCOMPLETE and does not post/);
  });

  it("catch-weight: with an actual weight it posts and balances on the weight", async () => {
    await importItems([{ code: "CW-IMP2", name: "Bagged filler", kind: "PROCESS_MATERIAL", stock_uom: "kg", catch_weight: "Y", nominal_uom: "bag" }]);
    const { report } = await importMovements([
      MOVE({ natural_key: "cw-2", item_code: "CW-IMP2", quantity: "10", uom: "bag", actual_quantity: "248.6", actual_uom: "kg" }),
    ]);
    expect(report!.applied).toBe(1);
    const [item] = await sql<{ id: string }[]>`SELECT id FROM items WHERE code = 'CW-IMP2'`;
    expect((await positionAt(item!.id, d("2026-06-01"))).onHand.toFixed()).toBe("248.6");
  });

  it("D-052: a missing cost centre stays NULL — never defaulted to 'general'", async () => {
    await importItems([ITEM]);
    await importMovements([MOVE({ natural_key: "cc-1" })]);
    const [m] = await sql<{ cost_centre: string | null }[]>`SELECT cost_centre FROM movements`;
    expect(m!.cost_centre).toBeNull();
  });
});

/* ========================================================================== */
describe("demo / real origin survives the import path", () => {
  it("marks a demo batch, and a real batch separately", async () => {
    await importItems([ITEM], true);
    await importMovements([MOVE({ natural_key: "demo-1" })], true);
    await importMovements([MOVE({ natural_key: "real-1" })], false);

    const rows = await sql<{ is_demo: boolean; kind: string }[]>`SELECT is_demo, kind FROM import_batches ORDER BY uploaded_at`;
    expect(rows.filter((r) => r.is_demo)).toHaveLength(2);
    expect(rows.filter((r) => !r.is_demo)).toHaveLength(1);
  });
});
