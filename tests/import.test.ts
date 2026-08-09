/**
 * Import tests — Phase 3.
 * "The user must understand exactly why data is invalid."
 */
import { describe, expect, it } from "vitest";
import { parseFile } from "../lib/import/ingest";
import { ITEM_SPEC, MOVEMENT_SPEC, RECEIPT_SPEC } from "../lib/import/specs";
import { renderReport } from "../lib/import/ingest";

const H_ITEM = ["code", "name", "kind", "stock_uom", "catch_weight", "nominal_uom", "lead_time_days"];

describe("structural validation", () => {
  it("reports a missing required column ONCE, not per row, and imports nothing", () => {
    const r = parseFile(["code", "name"], [{ code: "A", name: "x" }, { code: "B", name: "y" }], ITEM_SPEC);
    expect(r.missingColumns.map((m) => m.column)).toEqual(["kind", "stock_uom"]);
    expect(r.accepted).toBe(0);
    const report = renderReport(r, "items.xlsx");
    expect(report).toMatch(/missing required columns/);
    expect(report).toMatch(/Nothing was imported/);
  });

  it("names the consequence in the factory's language, not the schema's", () => {
    const r = parseFile(["code", "name"], [], ITEM_SPEC);
    expect(r.missingColumns.find((m) => m.column === "stock_uom")!.consequence).toMatch(/a quantity has no meaning/i);
  });
});

describe("row validation", () => {
  it("rejects an ambiguous date rather than guessing which month it is", () => {
    const r = parseFile(
      ["natural_key", "po_number", "line_no", "sequence", "received_date", "quantity"],
      [{ natural_key: "k1", po_number: "PO-1", line_no: "1", sequence: "1", received_date: "03/04/2026", quantity: "10" }],
      RECEIPT_SPEC,
    );
    expect(r.accepted).toBe(0);
    const err = r.rows[0]!.errors[0]!;
    expect(err.consequence).toMatch(/day\/month or month\/day/);
    expect(err.consequence).toMatch(/FX rate applied to it/);
  });

  it("accepts an unambiguous ISO date", () => {
    const r = parseFile(
      ["natural_key", "po_number", "line_no", "sequence", "received_date", "quantity"],
      [{ natural_key: "k1", po_number: "PO-1", line_no: "1", sequence: "1", received_date: "2026-04-03", quantity: "10" }],
      RECEIPT_SPEC,
    );
    expect(r.accepted).toBe(1);
    expect(r.rows[0]!.parsed!.receivedAt.toISOString().slice(0, 10)).toBe("2026-04-03");
  });

  it("never treats an unparseable number as zero", () => {
    const r = parseFile(H_ITEM, [{ code: "A", name: "x", kind: "PROCESS_MATERIAL", stock_uom: "kg", lead_time_days: "n/a" }], ITEM_SPEC);
    expect(r.rows[0]!.errors[0]!.consequence).toMatch(/cannot be silently treated as zero/);
  });

  it("does not map an unrecognised enum value to a default", () => {
    const r = parseFile(H_ITEM, [{ code: "A", name: "x", kind: "LIQUID", stock_uom: "kg" }], ITEM_SPEC);
    expect(r.accepted).toBe(0);
    expect(r.rows[0]!.errors[0]!.consequence).toMatch(/not mapped to a default/);
  });

  it("requires the ordering unit for a catch-weight item", () => {
    const r = parseFile(H_ITEM, [{ code: "A", name: "x", kind: "PROCESS_MATERIAL", stock_uom: "kg", catch_weight: "Y" }], ITEM_SPEC);
    expect(r.rows[0]!.errors.some((e) => e.column === "nominal_uom")).toBe(true);
  });

  it("tolerates spreadsheet thousands separators without losing exactness", () => {
    const r = parseFile(
      ["natural_key", "item_code", "from_location", "to_location", "quantity", "uom", "effective_date", "reason_code"],
      [{ natural_key: "k", item_code: "A", from_location: "SUP", to_location: "WH1", quantity: "1,234.567", uom: "kg", effective_date: "2026-01-01", reason_code: "RECEIPT" }],
      MOVEMENT_SPEC,
    );
    expect(r.rows[0]!.parsed!.nominalQty.toFixed()).toBe("1234.567");
  });

  it("preserves the original row even when it is rejected", () => {
    const raw = { code: "", name: "x", kind: "PROCESS_MATERIAL", stock_uom: "kg" };
    const r = parseFile(H_ITEM, [raw], ITEM_SPEC);
    expect(r.rows[0]!.parsed).toBeNull();
    expect(r.rows[0]!.raw).toEqual(raw);
  });

  it("treats a missing lead time as absent, never as zero (F-09)", () => {
    const r = parseFile(H_ITEM, [{ code: "A", name: "x", kind: "PROCESS_MATERIAL", stock_uom: "kg", lead_time_days: "" }], ITEM_SPEC);
    expect(r.accepted).toBe(1);
    expect(r.rows[0]!.parsed!.leadTimeDays).toBeNull();
  });

  it("reports the row number a user can find in the spreadsheet", () => {
    const r = parseFile(H_ITEM, [
      { code: "A", name: "x", kind: "PROCESS_MATERIAL", stock_uom: "kg" },
      { code: "", name: "y", kind: "PROCESS_MATERIAL", stock_uom: "kg" },
    ], ITEM_SPEC);
    expect(r.rows[1]!.rowNumber).toBe(3); // 1-based, plus the header row
  });
});
