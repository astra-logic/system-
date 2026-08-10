/**
 * Product structure — reading the recipe. D-054.
 *
 * One level. A component that is itself a parent makes the WHOLE answer
 * ⚪ CAN'T SAY, because the alternative — treating a manufactured item as
 * purchasable — produces a recommendation to buy something the factory makes.
 * That is not an incomplete answer, it is a WRONG one, and a wrong answer the
 * user cannot detect is the worst thing this product can produce.
 *
 * The per-component detail is still returned, so the honest verdict does not
 * cost the user the nine answers we do have.
 */
import { sql } from "../db/client";

export interface StructureLine {
  readonly componentItemId: string;
  readonly componentCode: string;
  readonly componentName: string;
  readonly quantityPer: string;
  readonly uom: string;
  readonly stockUom: string;
  readonly nominalUom: string | null;
  readonly integerOnly: boolean;
  readonly catchWeight: boolean;
  readonly leadTimeDays: number | null;
  readonly effectiveFrom: Date;
  readonly isDemo: boolean;
  /** ⚠ True when this component is itself a parent in the structure table. */
  readonly hasOwnStructure: boolean;
}

export interface ProductStructure {
  readonly lines: readonly StructureLine[];
  /** The newest `effective_from` among the lines used — code standard 13. */
  readonly structureAsOf: Date | null;
  readonly anyDemo: boolean;
}

/**
 * The structure effective at `at`, one level deep.
 *
 * "Effective at" means the most recent line per component whose `effective_from`
 * has passed — a recipe that changed is history (F5), so the current answer uses
 * the current version and records which version it used.
 */
export async function structureFor(parentItemId: string, at: Date): Promise<ProductStructure> {
  /* ⚠ The driver returns timestamptz as a STRING from raw SQL — it is only
     Drizzle's mapper that produces a Date. Typing the row as Date here and
     letting a string escape produced a crash three layers away, in the audit
     writer. The row type below states what actually arrives, and the boundary
     converts once. */
  const rows = await sql<{
    component_item_id: string; code: string; name: string; quantity_per: string; uom: string;
    stock_uom: string; nominal_uom: string | null; integer_only: boolean; catch_weight: boolean;
    lead_time_days: number | null; effective_from: string; is_demo: boolean; has_own_structure: boolean;
  }[]>`
    SELECT DISTINCT ON (ps.component_item_id)
           ps.component_item_id, i.code, i.name, ps.quantity_per, ps.uom,
           i.stock_uom, i.nominal_uom, i.integer_only, i.catch_weight,
           i.lead_time_days, ps.effective_from, ps.is_demo,
           EXISTS (
             SELECT 1 FROM product_structures child
             WHERE child.parent_item_id = ps.component_item_id
               AND child.effective_from <= ${at.toISOString()}::timestamptz
           ) AS has_own_structure
    FROM product_structures ps
    JOIN items i ON i.id = ps.component_item_id
    WHERE ps.parent_item_id = ${parentItemId}::uuid
      AND ps.effective_from <= ${at.toISOString()}::timestamptz
    ORDER BY ps.component_item_id, ps.effective_from DESC`;

  const lines: StructureLine[] = rows.map((r) => ({
    componentItemId: r.component_item_id,
    componentCode: r.code,
    componentName: r.name,
    quantityPer: r.quantity_per,
    uom: r.uom,
    stockUom: r.stock_uom,
    nominalUom: r.nominal_uom,
    integerOnly: r.integer_only,
    catchWeight: r.catch_weight,
    leadTimeDays: r.lead_time_days,
    effectiveFrom: new Date(r.effective_from),
    isDemo: r.is_demo,
    hasOwnStructure: r.has_own_structure,
  }));

  return {
    lines,
    structureAsOf: lines.length === 0 ? null : lines.reduce<Date>((a, l) => (l.effectiveFrom > a ? l.effectiveFrom : a), lines[0]!.effectiveFrom),
    anyDemo: lines.some((l) => l.isDemo),
  };
}
