/**
 * Import validation — Phase 3.
 *
 * "The user must understand exactly why data is invalid."
 *
 * So an error is not a message. It is a structure: which row, which column, what
 * was found, what is required, and — the part usually missing — WHY IT MATTERS,
 * in the language of the factory rather than of the schema.
 *
 * The importer never repairs. Bible §2 and workflow rule 1: ambiguity becomes an
 * open question, never a silent assumption. A row that cannot be understood is
 * rejected with a reason, and the ORIGINAL is preserved either way.
 */
import { Decimal } from "../core/decimal";

export type Severity = "REJECT" | "WARN";

export interface RowError {
  readonly column: string;
  readonly found: string;
  readonly required: string;
  /** Why this matters to the factory, not to the database. */
  readonly consequence: string;
  readonly severity: Severity;
}

export interface RowResult<T> {
  readonly rowNumber: number;
  readonly raw: Record<string, unknown>;
  readonly parsed: T | null;
  readonly errors: readonly RowError[];
}

export interface FileResult<T> {
  readonly rows: readonly RowResult<T>[];
  /** Columns the file was required to have and does not. Reported once, not per row. */
  readonly missingColumns: readonly { column: string; consequence: string }[];
  readonly accepted: number;
  readonly rejected: number;
}

const asText = (v: unknown): string => (v === null || v === undefined ? "" : String(v).trim());

export function requireText(raw: Record<string, unknown>, column: string, consequence: string, errors: RowError[]): string | null {
  const v = asText(raw[column]);
  if (v === "") {
    errors.push({ column, found: "(empty)", required: "a non-empty value", consequence, severity: "REJECT" });
    return null;
  }
  return v;
}

/**
 * Numbers arrive from spreadsheets as text, and the text is often not a number.
 * Every rejection names the actual cell content, because "invalid number" sends
 * a user hunting through 4,000 rows.
 */
export function requireDecimal(
  raw: Record<string, unknown>,
  column: string,
  consequence: string,
  errors: RowError[],
  opts: { positive?: boolean; integer?: boolean } = {},
): Decimal | null {
  const v = asText(raw[column]);
  if (v === "") {
    errors.push({ column, found: "(empty)", required: "a number", consequence, severity: "REJECT" });
    return null;
  }
  // Spreadsheets export thousands separators and stray currency symbols.
  const cleaned = v.replace(/[\s,]/g, "");
  let d: Decimal;
  try {
    d = new Decimal(cleaned);
  } catch {
    errors.push({
      column,
      found: v,
      required: "a number, e.g. 1234.56",
      consequence: `${consequence} A value that is not a number cannot be silently treated as zero (rule 13).`,
      severity: "REJECT",
    });
    return null;
  }
  if (!d.isFinite()) {
    errors.push({ column, found: v, required: "a finite number", consequence, severity: "REJECT" });
    return null;
  }
  if (opts.positive && d.lessThanOrEqualTo(0)) {
    errors.push({ column, found: v, required: "a positive number", consequence, severity: "REJECT" });
    return null;
  }
  if (opts.integer && !d.isInteger()) {
    errors.push({ column, found: v, required: "a whole number", consequence, severity: "REJECT" });
    return null;
  }
  return d;
}

/**
 * Dates are the second-largest source of import failure and the most dangerous,
 * because a misparsed date lands in the wrong period and quietly moves money
 * between years. Ambiguous formats are REJECTED rather than guessed.
 */
export function requireDate(raw: Record<string, unknown>, column: string, consequence: string, errors: RowError[]): Date | null {
  const v = asText(raw[column]);
  if (v === "") {
    errors.push({ column, found: "(empty)", required: "a date", consequence, severity: "REJECT" });
    return null;
  }
  if (raw[column] instanceof Date) return raw[column] as Date;

  const iso = /^\d{4}-\d{2}-\d{2}([T ].*)?$/.exec(v);
  if (iso) {
    const dt = new Date(v.includes("T") ? v : `${v.slice(0, 10)}T00:00:00Z`);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  const ambiguous = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/.exec(v);
  if (ambiguous) {
    const [, a, b] = ambiguous;
    // 03/04/2026 is 3 April in Egypt and 4 March in the United States. Guessing
    // moves a transaction by a month; in a year with a devaluation that changes
    // its FX normalisation and therefore its money.
    if (Number(a) <= 12 && Number(b) <= 12) {
      errors.push({
        column,
        found: v,
        required: "an unambiguous date, ISO format YYYY-MM-DD",
        consequence:
          `${consequence} "${v}" could be either day/month or month/day. Guessing would move the ` +
          `transaction by up to a month, changing the period it falls in and the FX rate applied to it.`,
        severity: "REJECT",
      });
      return null;
    }
  }
  errors.push({
    column,
    found: v,
    required: "a date in ISO format, YYYY-MM-DD",
    consequence,
    severity: "REJECT",
  });
  return null;
}

export function requireOneOf<T extends string>(
  raw: Record<string, unknown>,
  column: string,
  allowed: readonly T[],
  consequence: string,
  errors: RowError[],
): T | null {
  const v = asText(raw[column]).toUpperCase();
  if (v === "") {
    errors.push({ column, found: "(empty)", required: `one of ${allowed.join(", ")}`, consequence, severity: "REJECT" });
    return null;
  }
  if (!(allowed as readonly string[]).includes(v)) {
    errors.push({
      column,
      found: v,
      required: `one of ${allowed.join(", ")}`,
      consequence: `${consequence} An unrecognised value is not mapped to a default — that would attribute the row to something it is not.`,
      severity: "REJECT",
    });
    return null;
  }
  return v as T;
}

export function checkColumns(header: readonly string[], required: readonly { column: string; consequence: string }[]) {
  const have = new Set(header.map((h) => h.trim()));
  return required.filter((r) => !have.has(r.column));
}

/** Human-readable rendering — the format the UI and the CLI both use. */
export function describeError(e: RowError): string {
  return `${e.column}: found "${e.found}", required ${e.required}. ${e.consequence}`;
}
