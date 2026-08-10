/**
 * UoM conversion — F6, and the first reader of `uom_conversions`.
 *
 * "Conversions are PER ITEM and versioned, never global constants."
 *
 * The rule that matters here is what happens when a conversion is ABSENT. There
 * is no global fallback table, no density constant, no "kg and KG are the same
 * so g must be 1/1000". A missing conversion produces INSUFFICIENT_DATA, which
 * the engine turns into ⚪ CAN'T SAY for that component.
 *
 * Anything else would be inventing a factory fact (D-017, Bible §47), and the
 * failure would be silent: a requirement wrong by a factor of a thousand looks
 * exactly like a requirement that is right.
 */
import { qty, type Qty, type Decimal } from "../core/decimal";
import { insufficient, value, type Envelope } from "../core/provenance";
import { sql } from "../db/client";

/** Case and surrounding space are presentation, not meaning. "KG" is "kg". */
const norm = (u: string): string => u.trim().toUpperCase();

export interface ConversionRow {
  readonly fromUom: string;
  readonly toUom: string;
  readonly factor: string;
  readonly effectiveFrom: Date;
}

/**
 * Conversions for one item, most recent first. Loaded once per item per answer
 * so that a request touching twenty components does not issue twenty queries
 * per conversion attempt.
 */
export async function conversionsFor(itemId: string, at: Date): Promise<ConversionRow[]> {
  const rows = await sql<{ from_uom: string; to_uom: string; factor: string; effective_from: Date }[]>`
    SELECT from_uom, to_uom, factor, effective_from
    FROM uom_conversions
    WHERE item_id = ${itemId}::uuid AND effective_from <= ${at.toISOString()}::timestamptz
    ORDER BY effective_from DESC`;
  return rows.map((r) => ({ fromUom: r.from_uom, toUom: r.to_uom, factor: r.factor, effectiveFrom: r.effective_from }));
}

/**
 * Convert a quantity from one unit to another for a specific item.
 *
 * Three paths, and the third is the important one:
 *   - same unit           -> the quantity unchanged, no conversion needed
 *   - a recorded factor   -> applied, in either direction
 *   - anything else       -> INSUFFICIENT_DATA naming both units
 *
 * The reverse direction is derived from a recorded forward factor because
 * `1 bag = 25 kg` and `1 kg = 1/25 bag` are the same recorded fact stated twice,
 * not two independent facts. That is arithmetic on the factory's own number, not
 * an assumption of our own.
 */
export function convertQty(
  q: Qty,
  fromUom: string,
  toUom: string,
  conversions: readonly ConversionRow[],
  ctx: { itemCode: string; asOf: Date },
): Envelope<Qty> {
  if (norm(fromUom) === norm(toUom)) {
    return value(q, toUom, "USER_DEFINED", ctx.asOf, {
      assumptions: [],
    });
  }

  const forward = conversions.find((c) => norm(c.fromUom) === norm(fromUom) && norm(c.toUom) === norm(toUom));
  if (forward) {
    const f = qty(forward.factor);
    return value(qty((q as Decimal).times(f)), toUom, "USER_DEFINED", ctx.asOf, {
      inputs: [{ kind: "uom_conversion", id: `${ctx.itemCode}:${forward.fromUom}->${forward.toUom}`, basis: "USER_DEFINED", asOf: forward.effectiveFrom }],
    });
  }

  const reverse = conversions.find((c) => norm(c.fromUom) === norm(toUom) && norm(c.toUom) === norm(fromUom));
  if (reverse) {
    const f = qty(reverse.factor);
    if (f.isZero()) {
      return insufficient<Qty>(toUom, ctx.asOf, `The recorded conversion for ${ctx.itemCode} between ${reverse.fromUom} and ${reverse.toUom} is zero, so it cannot be reversed.`);
    }
    return value(qty((q as Decimal).dividedBy(f)), toUom, "USER_DEFINED", ctx.asOf, {
      inputs: [{ kind: "uom_conversion", id: `${ctx.itemCode}:${reverse.fromUom}->${reverse.toUom}`, basis: "USER_DEFINED", asOf: reverse.effectiveFrom }],
    });
  }

  return insufficient<Qty>(
    toUom,
    ctx.asOf,
    `No conversion is recorded for ${ctx.itemCode} between ${fromUom} and ${toUom}.`,
  );
}
