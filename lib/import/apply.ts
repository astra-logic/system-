/**
 * Import → ledger. The path a spreadsheet takes to become stock truth.
 *
 * THE RULE THAT SHAPES THIS FILE
 *
 * "Do not allow a spreadsheet upload to bypass the ledger. No direct database
 *  writes from the UI. The import path must terminate in the same ledger rules
 *  used by the rest of the application."
 *
 * So every movement created here goes through `postMovement` — the same function
 * the seed and any future workflow use. It gets the same validation, the same
 * duplicate refusal, the same catch-weight enforcement and the same in-transaction
 * projection. There is no fast path, and nothing here writes to `movements`
 * directly.
 */
import { db, sql } from "../db/client";
import { items, locations, productStructures } from "../db/schema";
import { qty, toDb } from "../core/decimal";
import { DuplicateIngestionError, LedgerError, postMovement } from "../ledger/post";
import type { FileResult } from "./validate";
import type { ItemRow, MovementRow, StructureRow } from "./specs";

export interface ApplyOutcome {
  readonly rowNumber: number;
  readonly outcome: "APPLIED" | "REJECTED" | "DUPLICATE";
  readonly detail: string;
  readonly producedId?: string;
}

export interface ApplyReport {
  readonly applied: number;
  readonly rejected: number;
  readonly duplicates: number;
  readonly outcomes: readonly ApplyOutcome[];
}

/** Codes → ids, resolved once per file rather than per row. */
async function lookups(siteId: string) {
  const its = await db.select({ id: items.id, code: items.code }).from(items);
  const locs = await db.select({ id: locations.id, code: locations.code }).from(locations);
  return {
    item: new Map(its.map((i) => [i.code, i.id])),
    location: new Map(locs.map((l) => [l.code, l.id])),
    siteId,
  };
}

/**
 * Apply parsed movement rows to the ledger.
 *
 * A row that the ledger refuses is reported with the ledger's own reason — not a
 * generic "import error" — because the ledger's refusals are the ones that
 * explain what is wrong with the factory's data.
 */
export async function applyMovements(
  parsed: FileResult<MovementRow>,
  opts: { siteId: string; actor: string },
): Promise<ApplyReport> {
  const lu = await lookups(opts.siteId);
  const outcomes: ApplyOutcome[] = [];

  for (const row of parsed.rows) {
    if (!row.parsed || row.errors.some((e) => e.severity === "REJECT")) {
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "REJECTED",
        detail: row.errors.map((e) => `${e.column}: ${e.consequence}`).join(" | ") || "row could not be parsed",
      });
      continue;
    }
    const m = row.parsed;
    const itemId = lu.item.get(m.itemCode);
    const fromId = lu.location.get(m.fromLocation);
    const toId = lu.location.get(m.toLocation);

    if (!itemId || !fromId || !toId) {
      const missing = [
        !itemId ? `item "${m.itemCode}"` : null,
        !fromId ? `location "${m.fromLocation}"` : null,
        !toId ? `location "${m.toLocation}"` : null,
      ].filter(Boolean).join(", ");
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "REJECTED",
        detail:
          `${missing} does not exist in the system. The movement is refused rather than creating ` +
          `the missing record — an item invented to make an import succeed would carry no unit, no ` +
          `type and no lead time, and every figure resting on it would be wrong.`,
      });
      continue;
    }

    try {
      const { id } = await postMovement({
        siteId: opts.siteId,
        itemId,
        fromLocationId: fromId,
        toLocationId: toId,
        nominalQty: qty(m.nominalQty),
        nominalUom: m.nominalUom,
        actualQty: m.actualQty ? qty(m.actualQty) : null,
        actualUom: m.actualUom,
        effectiveAt: m.effectiveAt,
        sourceDocumentType: m.sourceDocumentType,
        sourceDocumentId: m.sourceDocumentId,
        reasonCode: m.reasonCode,
        actor: opts.actor,
        sourceNaturalKey: m.naturalKey,
        costCentre: m.costCentre,
      });
      outcomes.push({ rowNumber: row.rowNumber, outcome: "APPLIED", detail: "posted to the ledger", producedId: id });
    } catch (e) {
      if (e instanceof DuplicateIngestionError) {
        outcomes.push({
          rowNumber: row.rowNumber,
          outcome: "DUPLICATE",
          detail:
            `Already recorded under key "${m.naturalKey}". Refused rather than posted twice — ` +
            `an append-only ledger preserves a duplicate rather than protecting you from it.`,
        });
      } else if (e instanceof LedgerError) {
        outcomes.push({ rowNumber: row.rowNumber, outcome: "REJECTED", detail: e.message });
      } else {
        throw e;
      }
    }
  }

  return {
    applied: outcomes.filter((o) => o.outcome === "APPLIED").length,
    rejected: outcomes.filter((o) => o.outcome === "REJECTED").length,
    duplicates: outcomes.filter((o) => o.outcome === "DUPLICATE").length,
    outcomes,
  };
}

/**
 * Apply parsed item rows to the item master.
 *
 * Items are master data, not ledger events, so they are inserted directly — but
 * an EXISTING item is never silently overwritten by an import. Master data
 * carries lead times and units that findings depend on; replacing them from a
 * spreadsheet would change historical figures without a record of why.
 */
export async function applyItems(
  parsed: FileResult<ItemRow>,
  opts: { siteId: string },
): Promise<ApplyReport> {
  const outcomes: ApplyOutcome[] = [];
  const existing = new Set((await db.select({ code: items.code }).from(items)).map((i) => i.code));

  for (const row of parsed.rows) {
    if (!row.parsed || row.errors.some((e) => e.severity === "REJECT")) {
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "REJECTED",
        detail: row.errors.map((e) => `${e.column}: ${e.consequence}`).join(" | ") || "row could not be parsed",
      });
      continue;
    }
    const it = row.parsed;
    if (existing.has(it.code)) {
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "DUPLICATE",
        detail:
          `Item "${it.code}" already exists and was NOT overwritten. Master data carries lead ` +
          `times and units that existing findings rest on; replacing them from a spreadsheet would ` +
          `change historical figures with no record of why.`,
      });
      continue;
    }
    const [created] = await db
      .insert(items)
      .values({
        siteId: opts.siteId,
        code: it.code,
        name: it.name,
        kind: it.kind,
        stockUom: it.stockUom,
        catchWeight: it.catchWeight,
        nominalUom: it.nominalUom,
        // F-09: absent stays absent. No default lead time is ever invented.
        leadTimeDays: it.leadTimeDays ? Number(it.leadTimeDays.toFixed()) : null,
      })
      .returning();
    existing.add(it.code);
    outcomes.push({ rowNumber: row.rowNumber, outcome: "APPLIED", detail: "item created", producedId: created!.id });
  }

  return {
    applied: outcomes.filter((o) => o.outcome === "APPLIED").length,
    rejected: outcomes.filter((o) => o.outcome === "REJECTED").length,
    duplicates: outcomes.filter((o) => o.outcome === "DUPLICATE").length,
    outcomes,
  };
}

/** Attach per-row outcomes to the preserved originals, so nothing is lost. */
export async function recordOutcomes(batchId: string, report: ApplyReport): Promise<void> {
  for (const o of report.outcomes) {
    await sql`
      UPDATE import_rows
      SET outcome = ${o.outcome},
          produced_id = ${o.producedId ?? null},
          errors = ${o.outcome === "APPLIED" ? null : JSON.stringify([{ detail: o.detail }])}::jsonb
      WHERE batch_id = ${batchId}::uuid AND row_number = ${o.rowNumber}`;
  }
  await sql`
    UPDATE import_batches
    SET rows_accepted = ${report.applied}, rows_rejected = ${report.rejected + report.duplicates},
        status = ${report.rejected + report.duplicates === 0 ? "ACCEPTED" : report.applied === 0 ? "REJECTED" : "PARTIAL"}
    WHERE id = ${batchId}::uuid`;
}

/* ========================================================================== */
/* BLOCK 9 — recipe import. D-054, and §8 of the Block 8 contract.           */
/* ========================================================================== */

/**
 * Apply parsed recipe rows.
 *
 * ⚠ TWO RULES THAT ARE ENFORCED HERE RATHER THAN TRUSTED:
 *
 * 1. AN IMPORTED RECIPE IS NEVER DEMO. `isDemo` is hard-coded false on this
 *    path — there is no option and no parameter. Demo structure exists only in
 *    the seed, so a demo recipe cannot reach a real factory item by any route
 *    through this function.
 *
 * 2. AN IMPORTED RECIPE MAY NOT ATTACH TO A DEMO ITEM. The reverse leak matters
 *    just as much: real recipe lines hanging off seeded demo items would make a
 *    demo product look like factory data. Demo items are recognised by the
 *    convention the seed itself uses — the "(DEMO)" marker in the item name.
 *
 * A row naming an unknown item is REJECTED with the code that was not found,
 * never silently skipped: silently discarding rows is how a factory ends up
 * trusting a recipe that is missing a material.
 */
export async function applyStructures(
  parsed: FileResult<StructureRow>,
  opts: { siteId: string },
): Promise<ApplyReport> {
  const outcomes: ApplyOutcome[] = [];
  const its = await db.select({ id: items.id, code: items.code, name: items.name }).from(items);
  const byCode = new Map(its.map((i) => [i.code.trim().toUpperCase(), i]));

  const existing = new Set(
    (
      await db
        .select({
          p: productStructures.parentItemId,
          c: productStructures.componentItemId,
          e: productStructures.effectiveFrom,
        })
        .from(productStructures)
    ).map((r) => `${r.p}|${r.c}|${r.e.toISOString()}`),
  );

  for (const row of parsed.rows) {
    if (!row.parsed || row.errors.some((e) => e.severity === "REJECT")) {
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "REJECTED",
        detail: row.errors.map((e) => `${e.column}: ${e.consequence}`).join(" | ") || "row could not be parsed",
      });
      continue;
    }
    const r = row.parsed;
    const parent = byCode.get(r.parentCode.trim().toUpperCase());
    const component = byCode.get(r.componentCode.trim().toUpperCase());

    if (!parent || !component) {
      const missing = !parent ? r.parentCode : r.componentCode;
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "REJECTED",
        detail:
          `No item with the code "${missing}" exists yet. Import your items first, then the recipes — ` +
          `a recipe line pointing at nothing would leave a material silently missing from every answer.`,
      });
      continue;
    }

    // Rule 2 — the reverse leak. Real data must not attach to seeded demo items.
    if (parent.name.includes("(DEMO)") || component.name.includes("(DEMO)")) {
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "REJECTED",
        detail:
          `"${parent.name.includes("(DEMO)") ? parent.code : component.code}" is demonstration data. ` +
          `Imported recipes are never attached to demo items, so that what you see for a real product is ` +
          `always your factory's own data.`,
      });
      continue;
    }

    const key = `${parent.id}|${component.id}|${r.effectiveFrom.toISOString()}`;
    if (existing.has(key)) {
      outcomes.push({
        rowNumber: row.rowNumber,
        outcome: "DUPLICATE",
        detail:
          `${parent.code} already has a recipe line for ${component.code} effective ` +
          `${r.effectiveFrom.toISOString().slice(0, 10)}, and it was NOT overwritten. To change a ` +
          `quantity, add a line with a later effective date — the old one stays as history.`,
      });
      continue;
    }

    const [created] = await db
      .insert(productStructures)
      .values({
        siteId: opts.siteId,
        parentItemId: parent.id,
        componentItemId: component.id,
        quantityPer: toDb(qty(r.quantityPer)),
        uom: r.uom,
        effectiveFrom: r.effectiveFrom,
        isDemo: false, // Rule 1 — not a parameter. An imported recipe is real.
        sourceNaturalKey: `${parent.code}|${component.code}|${r.effectiveFrom.toISOString().slice(0, 10)}`,
      })
      .returning();
    existing.add(key);
    outcomes.push({
      rowNumber: row.rowNumber,
      outcome: "APPLIED",
      detail: `${parent.code} uses ${r.quantityPer.toFixed()} ${r.uom} of ${component.code} per unit`,
      producedId: created!.id,
    });
  }

  return {
    applied: outcomes.filter((o) => o.outcome === "APPLIED").length,
    rejected: outcomes.filter((o) => o.outcome === "REJECTED").length,
    duplicates: outcomes.filter((o) => o.outcome === "DUPLICATE").length,
    outcomes,
  };
}
