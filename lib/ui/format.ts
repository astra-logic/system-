/**
 * THE FORMATTING BOUNDARY.
 * Interface Contract Law 9 · §20.
 *
 * ⚠ THE RULE THIS MODULE EXISTS TO ENFORCE
 *
 *     Values reach the interface ONLY through this module.
 *     No component performs arithmetic, calls .toFixed(), or renders a raw
 *     stored value.
 *
 * Block 11 found why this is stated so strongly: `formatMoney` and `formatQty`
 * already existed in lib/core/decimal.ts and rounded correctly. /produce used
 * them; the dashboard called .toFixed(2) inline; the two opportunity pages
 * interpolated the raw JSONB string — which is how
 * `1383868.667808219178082191781 EGP` reached a user.
 *
 * The helper was never the problem. The absence of an enforced boundary was.
 * So this module is the single boundary, and it is deliberately the only place
 * in the app tree permitted to turn a value into a string.
 *
 * NO FAKE PRECISION. A figure carries the precision a person would use, and the
 * exact value stays available one layer down.
 */
import { Decimal } from "../core/decimal";

/* -------------------------------------------------------------------------- */
/* Money                                                                      */
/* -------------------------------------------------------------------------- */

/** A value that may arrive as a stored string, a Decimal, or absent. */
export type Numeric = string | Decimal | null | undefined;

const toDecimal = (v: Numeric): Decimal | null => {
  if (v === null || v === undefined || v === "") return null;
  try {
    const d = v instanceof Decimal ? v : new Decimal(v);
    return d.isFinite() ? d : null;
  } catch {
    return null;
  }
};

const group = (s: string): string => {
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  const [whole = "", frac] = body.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
};

/**
 * Money for a PRIMARY surface — a headline or a card.
 *
 * Large values compact to three significant figures, because a manager reads
 * "1.38M EGP" and cannot read 1,383,868.67 at a glance. Smaller values keep
 * whole units: the piastres in an order value change nobody's decision.
 */
export function money(v: Numeric, currency = "EGP"): string {
  const d = toDecimal(v);
  if (d === null) return "—";
  const abs = d.abs();

  // Zero needs no cents. "0.00 – 1.38M" mixes two scales in one range and reads
  // as sloppiness; "0 – 1.38M" reads as a range.
  if (d.isZero()) return currency ? `0 ${currency}` : "0";

  if (abs.greaterThanOrEqualTo(1_000_000)) {
    return `${group(d.dividedBy(1_000_000).toSignificantDigits(3).toFixed())}M ${currency}`;
  }
  if (abs.greaterThanOrEqualTo(1_000)) {
    return `${group(d.toFixed(0, Decimal.ROUND_HALF_EVEN))} ${currency}`;
  }
  return `${group(d.toFixed(2, Decimal.ROUND_HALF_EVEN))} ${currency}`;
}

/** Money for a DETAIL surface — the exact figure, still grouped and rounded to cash. */
export function moneyExact(v: Numeric, currency = "EGP"): string {
  const d = toDecimal(v);
  if (d === null) return "—";
  return `${group(d.toFixed(2, Decimal.ROUND_HALF_EVEN))} ${currency}`;
}

/* -------------------------------------------------------------------------- */
/* Quantity                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A quantity, at the precision the unit warrants.
 *
 * `197.000 EA` is what a database thinks; `197 EA` is what a person means.
 * Whole-unit items therefore carry no decimals, and weights carry only the
 * decimals that survive — trailing zeros are noise, not precision.
 */
export function qty(v: Numeric, uom: string, opts: { whole?: boolean } = {}): string {
  const d = toDecimal(v);
  if (d === null) return "—";
  if (opts.whole || d.isInteger()) return `${group(d.toFixed(0, Decimal.ROUND_HALF_EVEN))} ${uom}`;

  // Keep up to three decimals, then drop trailing zeros: 305.100 -> 305.1
  const trimmed = d.toFixed(3, Decimal.ROUND_HALF_EVEN).replace(/\.?0+$/, "");
  return `${group(trimmed)} ${uom}`;
}

/** A quantity with its full recorded precision, for Layer 4 only. */
export function qtyExact(v: Numeric, uom: string): string {
  const d = toDecimal(v);
  return d === null ? "—" : `${group(d.toFixed())} ${uom}`;
}

/* -------------------------------------------------------------------------- */
/* Dates and durations                                                        */
/* -------------------------------------------------------------------------- */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * A date a person can act on.
 *
 * The weekday is included deliberately: "Fri 20 Feb" tells an Egyptian factory
 * manager something "2027-02-20" does not, because it lands on their weekend.
 * ⚠ The system does NOT adjust for that — the working calendar is unset (F-50)
 * — but showing the weekday lets the user see what the system cannot yet know.
 */
export function date(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "—";
  return `${DAYS[x.getUTCDay()]} ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

/** A short date for dense rows, where the year is understood from context. */
export function dateShort(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "—";
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`;
}

/**
 * Lateness and duration, in words and always signed by language rather than
 * by a minus sign. "-12" makes a reader work out the direction; "12 days late"
 * does not.
 */
export function days(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const a = Math.abs(Math.round(n));
  const unit = a === 1 ? "day" : "days";
  if (n === 0) return "today";
  return n > 0 ? `${a} ${unit} late` : `${a} ${unit} early`;
}

/**
 * Coverage, expressed COARSELY on purpose (Block 12b, D-060).
 *
 * "About 6 weeks" is honest about how well we know it; "43 days" implies a
 * precision the underlying observation does not carry. The window the figure
 * rests on is stated separately by the caller — never omitted.
 */
export function cover(daysOfCover: number | null | undefined): string {
  if (daysOfCover === null || daysOfCover === undefined || !Number.isFinite(daysOfCover)) return "—";
  const d = Math.round(daysOfCover);
  if (d < 1) return "less than a day";
  if (d < 14) return `about ${d} ${d === 1 ? "day" : "days"}`;
  if (d < 60) return `about ${Math.round(d / 7)} weeks`;
  return `about ${Math.round(d / 30)} months`;
}

/* -------------------------------------------------------------------------- */
/* Absence                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * ⚠ A missing value NEVER renders as 0 (Interface Contract §17.2).
 *
 * A bare dash is permitted only beside a stated reason, so this helper takes
 * the reason and makes the pairing hard to skip.
 */
export function unknown(reason?: string): string {
  return reason ? `— ${reason}` : "—";
}

/** Whether a value is genuinely absent, as opposed to genuinely zero. */
export const isAbsent = (v: Numeric): boolean => toDecimal(v) === null;
