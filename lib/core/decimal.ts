/**
 * Exact arithmetic for money and quantity.
 *
 * D-047 records the known risk of choosing TypeScript: JavaScript's `number` is
 * IEEE-754 binary floating point, so `0.1 + 0.2 !== 0.3`. A money or quantity
 * value that passes through a JS number is silently corrupted — and this
 * project's entire premise is that its numbers are defensible.
 *
 * Containment is structural, not disciplinary:
 *   1. money/quantity columns are Postgres `numeric`, never `double precision`
 *   2. the driver returns `numeric` as a string and it is never parsed to number
 *   3. money and quantity exist here only as branded Decimal wrappers
 *   4. the constructors REJECT a JS number at runtime
 *   5. property tests assert round-trip exactness through the database
 *
 * Code standard 4 and 6: exact decimals, rounding only at defined boundaries,
 * never inside iteration.
 */
import Decimal from "decimal.js";

// 28 significant digits. Quantities run to 3+ dp (D-009) and money to 2;
// intermediate products of the two need headroom well beyond both.
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_EVEN });

declare const MoneyBrand: unique symbol;
declare const QtyBrand: unique symbol;
declare const RateBrand: unique symbol;

export type Money = Decimal & { readonly [MoneyBrand]: true };
export type Qty = Decimal & { readonly [QtyBrand]: true };
/** A dimensionless multiplier: an FX rate, a cost-of-funds rate, a conversion factor. */
export type Rate = Decimal & { readonly [RateBrand]: true };

export class InexactInputError extends Error {
  constructor(kind: string, value: unknown) {
    super(
      `${kind} refused a JavaScript number (${String(value)}). ` +
        `Binary floating point cannot represent decimal values exactly, and a corrupted ` +
        `money or quantity is indistinguishable from a correct one downstream. ` +
        `Pass a string or a Decimal. See D-047.`,
    );
    this.name = "InexactInputError";
  }
}

/**
 * Accepts strings (the driver's `numeric` representation) and Decimals.
 * Refuses JS numbers — this is the one guard that makes the rest of the
 * containment hold, so it throws rather than warns.
 */
function coerce(kind: string, v: string | Decimal): Decimal {
  if (typeof v === "number") throw new InexactInputError(kind, v);
  if (v instanceof Decimal) return v;
  if (typeof v !== "string") throw new InexactInputError(kind, v);
  const trimmed = v.trim();
  if (trimmed === "") throw new Error(`${kind} refused an empty string.`);
  const d = new Decimal(trimmed);
  if (!d.isFinite()) throw new Error(`${kind} refused a non-finite value: ${v}`);
  return d;
}

export const money = (v: string | Decimal): Money => coerce("money", v) as Money;
export const qty = (v: string | Decimal): Qty => coerce("qty", v) as Qty;
export const rate = (v: string | Decimal): Rate => coerce("rate", v) as Rate;

export const ZERO_MONEY = money("0");
export const ZERO_QTY = qty("0");

/* -------------------------------------------------------------------------- */
/* Arithmetic — explicit functions, never operators.                          */
/*                                                                            */
/* There is deliberately no `+` that could coerce a Decimal to a number via    */
/* valueOf. Every operation below is total and returns the same brand it took. */
/* -------------------------------------------------------------------------- */

export const addMoney = (a: Money, b: Money): Money => a.plus(b) as Money;
export const subMoney = (a: Money, b: Money): Money => a.minus(b) as Money;
export const negMoney = (a: Money): Money => a.neg() as Money;
export const sumMoney = (xs: readonly Money[]): Money =>
  xs.reduce<Money>((acc, x) => addMoney(acc, x), ZERO_MONEY);

export const addQty = (a: Qty, b: Qty): Qty => a.plus(b) as Qty;
export const subQty = (a: Qty, b: Qty): Qty => a.minus(b) as Qty;
export const negQty = (a: Qty): Qty => a.neg() as Qty;
export const sumQty = (xs: readonly Qty[]): Qty =>
  xs.reduce<Qty>((acc, x) => addQty(acc, x), ZERO_QTY);

/** unit price × quantity */
export const priceTimesQty = (unit: Money, q: Qty): Money => unit.times(q) as Money;
/** money × a dimensionless rate (FX, cost of funds, conversion) */
export const moneyTimesRate = (m: Money, r: Rate): Money => m.times(r) as Money;
/** quantity × a dimensionless conversion factor */
export const qtyTimesRate = (q: Qty, r: Rate): Qty => q.times(r) as Qty;
/** money ÷ quantity — the unit price implied by a total. Guards division by zero. */
export const moneyOverQty = (m: Money, q: Qty): Money => {
  if (q.isZero()) throw new Error("moneyOverQty: division by zero quantity.");
  return m.div(q) as Money;
};

export const cmpMoney = (a: Money, b: Money): -1 | 0 | 1 => a.comparedTo(b) as -1 | 0 | 1;
export const cmpQty = (a: Qty, b: Qty): -1 | 0 | 1 => a.comparedTo(b) as -1 | 0 | 1;
export const maxQty = (xs: readonly Qty[]): Qty | null =>
  xs.length === 0 ? null : xs.reduce((a, b) => (cmpQty(a, b) >= 0 ? a : b));

export const isZeroMoney = (a: Money): boolean => a.isZero();
export const isNegMoney = (a: Money): boolean => a.isNegative();
export const isNegQty = (a: Qty): boolean => a.isNegative();

/**
 * Serialisation for the database. Always a string — a `numeric` column never
 * receives a JS number, so nothing can be lost on the way in or out.
 */
export const toDb = (v: Money | Qty | Rate): string => v.toFixed();

/**
 * Presentation only. Rounds at a defined boundary (standard 6) and is the ONLY
 * place a value becomes fixed-precision. Never feed the result back into
 * arithmetic — it is a display string, not a value.
 */
export function formatMoney(v: Money, currency: string, dp = 2): string {
  return `${v.toFixed(dp, Decimal.ROUND_HALF_EVEN)} ${currency}`;
}
export function formatQty(v: Qty, uom: string, dp = 3): string {
  return `${v.toFixed(dp, Decimal.ROUND_HALF_EVEN)} ${uom}`;
}

export { Decimal };
