/**
 * Import ingestion — Phase 3.
 *
 * Three properties this pipeline must have, all of them locked elsewhere:
 *   - the ORIGINAL SOURCE is preserved verbatim, whatever happens to the parse
 *   - provenance is established at the point of entry, never inferred later
 *   - a DUPLICATE is refused at the door (D-001 as amended)
 *
 * B-07 is answered: there is a pilot factory but no data yet. So the importer is
 * built against a declared column contract that can be REMAPPED to the factory's
 * real headers without touching the engine — see `ColumnMap`.
 */
import * as XLSX from "xlsx";
import { db } from "../db/client";
import { importBatches, importRows } from "../db/schema";
import { checkColumns, describeError, type FileResult, type RowError, type RowResult } from "./validate";

export interface ColumnMap {
  /** canonical name -> the header the factory actually uses */
  readonly [canonical: string]: string;
}

/** Read a sheet into raw rows, preserving cells verbatim. Nothing is coerced here. */
export function readSheet(buffer: Buffer | ArrayBuffer, sheetName?: string): { header: string[]; rows: Record<string, unknown>[] } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const name = sheetName ?? wb.SheetNames[0]!;
  const sheet = wb.Sheets[name];
  if (!sheet) throw new Error(`Sheet "${name}" not found. Sheets present: ${wb.SheetNames.join(", ")}`);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false, dateNF: "yyyy-mm-dd" });
  const header = rows.length > 0 ? Object.keys(rows[0]!) : [];
  return { header, rows };
}

/** Applies the factory's header names to the canonical names the parsers expect. */
export function remap(row: Record<string, unknown>, map: ColumnMap): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [canonical, actual] of Object.entries(map)) out[canonical] = row[actual];
  // Unmapped columns are preserved too — the original is never narrowed by the map.
  for (const [k, v] of Object.entries(row)) if (!(k in out)) out[k] = v;
  return out;
}

export interface ParseSpec<T> {
  readonly kind: string;
  readonly requiredColumns: readonly { column: string; consequence: string }[];
  readonly parseRow: (raw: Record<string, unknown>, errors: RowError[]) => T | null;
}

export function parseFile<T>(
  header: readonly string[],
  rows: readonly Record<string, unknown>[],
  spec: ParseSpec<T>,
  map: ColumnMap = {},
): FileResult<T> {
  const mappedHeader = header.map((h) => {
    const found = Object.entries(map).find(([, actual]) => actual === h);
    return found ? found[0] : h;
  });
  const missingColumns = checkColumns(mappedHeader, spec.requiredColumns);

  const results: RowResult<T>[] = rows.map((raw, i) => {
    const mapped = remap(raw, map);
    const errors: RowError[] = [];
    // If a required column is absent from the file, per-row parsing would produce
    // the same error N times. The structural problem is reported once, above.
    const parsed = missingColumns.length > 0 ? null : spec.parseRow(mapped, errors);
    return { rowNumber: i + 2, raw, parsed, errors }; // +2: 1-based, plus header row
  });

  const accepted = results.filter((r) => r.parsed !== null && r.errors.every((e) => e.severity !== "REJECT")).length;
  return { rows: results, missingColumns, accepted, rejected: results.length - accepted };
}

export interface IngestOptions {
  readonly siteId: string;
  readonly filename: string;
  readonly kind: string;
  readonly uploadedBy: string;
  /**
   * Bible §47 / rule 16: generated or demo data is NEVER presented as real factory
   * transactions. The flag lives on the batch, so everything descended from it is
   * traceable to a demo origin — structural, not a UI badge.
   */
  readonly isDemo: boolean;
}

/**
 * Records the batch and every row — accepted and rejected alike — with the
 * original cells preserved. A rejected row is not discarded: the factory needs to
 * see what it sent, and an importer that loses the input cannot be argued with.
 */
export async function recordBatch<T>(result: FileResult<T>, opts: IngestOptions): Promise<{ batchId: string }> {
  const [batch] = await db
    .insert(importBatches)
    .values({
      siteId: opts.siteId,
      filename: opts.filename,
      kind: opts.kind,
      uploadedBy: opts.uploadedBy,
      status: result.missingColumns.length > 0 ? "REJECTED_STRUCTURE" : result.rejected > 0 ? "PARTIAL" : "ACCEPTED",
      rowsTotal: result.rows.length,
      rowsAccepted: result.accepted,
      rowsRejected: result.rejected,
      isDemo: opts.isDemo,
    })
    .returning();

  if (result.rows.length > 0) {
    await db.insert(importRows).values(
      result.rows.map((r) => ({
        batchId: batch!.id,
        rowNumber: r.rowNumber,
        raw: r.raw as Record<string, unknown>,
        outcome: r.parsed !== null && r.errors.every((e) => e.severity !== "REJECT") ? "ACCEPTED" : "REJECTED",
        errors: r.errors.length > 0 ? (r.errors as unknown as Record<string, unknown>) : null,
      })),
    );
  }
  return { batchId: batch!.id };
}

/** The report a user actually reads. Structural problems first — they explain the rest. */
export function renderReport<T>(result: FileResult<T>, filename: string): string {
  const lines: string[] = [`Import report — ${filename}`];

  if (result.missingColumns.length > 0) {
    lines.push("", "The file is missing required columns, so no row could be read:");
    for (const m of result.missingColumns) lines.push(`  • ${m.column} — ${m.consequence}`);
    lines.push("", "Nothing was imported. Add the columns and upload again.");
    return lines.join("\n");
  }

  lines.push("", `${result.accepted} of ${result.rows.length} rows accepted.`);
  const bad = result.rows.filter((r) => r.errors.some((e) => e.severity === "REJECT"));
  if (bad.length === 0) return lines.join("\n");

  lines.push("", `${bad.length} row(s) rejected:`);
  for (const r of bad.slice(0, 50)) {
    lines.push(`  Row ${r.rowNumber}:`);
    for (const e of r.errors) lines.push(`    • ${describeError(e)}`);
  }
  if (bad.length > 50) lines.push(`  … and ${bad.length - 50} more.`);
  lines.push(
    "",
    "Rejected rows are preserved exactly as submitted and can be reviewed. Nothing was repaired or",
    "guessed — a value the system cannot understand is never treated as zero or defaulted.",
  );
  return lines.join("\n");
}
