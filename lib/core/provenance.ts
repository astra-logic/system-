/**
 * The provenance envelope — D-002 as amended, LOCKED.
 *
 * "Every value the system asserts carries {value, unit, basis, as_of, inputs,
 *  assumptions, confidence, limitations}. Basis degrades contagiously. An
 *  aggregate carries the weakest basis among its components. INSUFFICIENT_DATA
 *  is a designed state, not an error."
 *
 * Three amendments applied (Block 1):
 *   - EVERY value carries the envelope, not only derived ones, so contagion has
 *     a defined floor. A raw value is ACTUAL (observed) or USER_DEFINED (asserted).
 *   - as_of is the EFFECTIVE time, per F5. Recorded time is carried separately.
 *   - Provenance establishes WHAT a number is. It does NOT establish whether
 *     using it here is APPROPRIATE — that is D-023 as amended, see rate.ts.
 *
 * Code standards 7, 7a, 7b, 8, 9, 10a, 10b, 10b-1.
 */
import type { Money, Qty, Rate } from "./decimal";

/* -------------------------------------------------------------------------- */
/* Basis — the eight values of core-mission §7, ordered weakest-last.          */
/* -------------------------------------------------------------------------- */

export const BASIS = [
  "ACTUAL",
  "CALCULATED",
  "FORECAST",
  "ESTIMATED",
  "ASSUMED",
  "USER_DEFINED",
  "STALE_DATA",
  "INSUFFICIENT_DATA",
] as const;
export type Basis = (typeof BASIS)[number];

/**
 * Strength ordering for the contagion rule. Higher number = weaker.
 *
 * The ordering is a claim about EVIDENTIAL STRENGTH, not about desirability:
 *   ACTUAL      observed. Strongest.
 *   CALCULATED  derived from observed inputs by a stated method.
 *   FORECAST    a stated model's view of the future.
 *   ESTIMATED   a value judged from partial evidence.
 *   ASSUMED     a value taken without evidence, disclosed as such.
 *   USER_DEFINED asserted by a person. Weaker than ASSUMED because a system
 *               assumption is at least visible in the code; a user value is not.
 *   STALE_DATA  once ACTUAL, now past its freshness threshold (N-09).
 *   INSUFFICIENT_DATA  no value exists. Weakest by construction.
 */
const BASIS_WEAKNESS: Record<Basis, number> = {
  ACTUAL: 0,
  CALCULATED: 1,
  FORECAST: 2,
  ESTIMATED: 3,
  ASSUMED: 4,
  USER_DEFINED: 5,
  STALE_DATA: 6,
  INSUFFICIENT_DATA: 7,
};

/** D-002: an aggregate carries the WEAKEST basis among its components. */
export function weakestBasis(bases: readonly Basis[]): Basis {
  if (bases.length === 0) return "INSUFFICIENT_DATA";
  return bases.reduce((w, b) => (BASIS_WEAKNESS[b] > BASIS_WEAKNESS[w] ? b : w));
}

/** D-044 partitions the headline by whether every input is ACTUAL or CALCULATED. */
export function isFirmBasis(b: Basis): boolean {
  return b === "ACTUAL" || b === "CALCULATED";
}

/* -------------------------------------------------------------------------- */
/* The envelope.                                                              */
/* -------------------------------------------------------------------------- */

export interface InputRef {
  /** What kind of thing this input is — a movement, a PO line, a rate, an item. */
  readonly kind: string;
  /** Its identity, so the number can be traced back to it (capability 11). */
  readonly id: string;
  readonly basis: Basis;
  /** The effective moment of the input, per F5. */
  readonly asOf: Date;
}

export interface Envelope<T> {
  /** null when basis is INSUFFICIENT_DATA. There is no zero stand-in. */
  readonly value: T | null;
  /** kg, EGP, days, EGP/kg — always stated, never implied. */
  readonly unit: string;
  readonly basis: Basis;
  /** EFFECTIVE time (F5), never recorded time. Amendment to D-002. */
  readonly asOf: Date;
  readonly inputs: readonly InputRef[];
  /** Named and explicit. An empty list means none were made, not none recorded. */
  readonly assumptions: readonly string[];
  /**
   * D-045: no synthesised confidence score exists until A-03 defines one.
   * Coverage facts are stated plainly instead — they are observations, and an
   * observation cannot be wrong.
   */
  readonly coverage: readonly string[];
  /** What would make this wrong. */
  readonly limitations: readonly string[];
}

export type MoneyValue = Envelope<Money>;
export type QtyValue = Envelope<Qty>;
export type RateValue = Envelope<Rate>;

export function value<T>(v: T, unit: string, basis: Basis, asOf: Date, extra: Partial<Envelope<T>> = {}): Envelope<T> {
  if (basis === "INSUFFICIENT_DATA") {
    throw new Error("Use insufficient() — an INSUFFICIENT_DATA envelope must not carry a value.");
  }
  return {
    value: v,
    unit,
    basis,
    asOf,
    inputs: extra.inputs ?? [],
    assumptions: extra.assumptions ?? [],
    coverage: extra.coverage ?? [],
    limitations: extra.limitations ?? [],
  };
}

/**
 * A designed, first-class outcome — not an error path (D-002 consequence 1).
 *
 * `reason` is required and must name what was missing, because code standard 9
 * and MVP acceptance criterion 3 require every refusal to say what it needed.
 * "Cannot calculate" without a reason is a defect.
 */
export function insufficient<T>(unit: string, asOf: Date, reason: string, extra: Partial<Envelope<T>> = {}): Envelope<T> {
  if (!reason.trim()) throw new Error("insufficient() requires a reason naming what was missing.");
  return {
    value: null,
    unit,
    basis: "INSUFFICIENT_DATA",
    asOf,
    inputs: extra.inputs ?? [],
    assumptions: extra.assumptions ?? [],
    coverage: extra.coverage ?? [],
    limitations: [reason, ...(extra.limitations ?? [])],
  };
}

export const isKnown = <T>(e: Envelope<T>): boolean => e.basis !== "INSUFFICIENT_DATA" && e.value !== null;

/**
 * Contagion (D-002): a derived value is at best as strong as its weakest input.
 * If any input is INSUFFICIENT_DATA the result cannot be computed at all —
 * it does not silently proceed with the remaining inputs.
 *
 * This governs THE INPUTS OF ONE VALUE. For the members of a SET see
 * `partitionForAggregate` — D-043 says those are different operations.
 */
export function derive<T>(
  compute: () => T,
  opts: {
    unit: string;
    asOf: Date;
    from: readonly Envelope<unknown>[];
    inputs?: readonly InputRef[];
    assumptions?: readonly string[];
    coverage?: readonly string[];
    limitations?: readonly string[];
    /** Ceiling on the result's basis, e.g. FORECAST for anything predictive. */
    cap?: Basis;
  },
): Envelope<T> {
  const missing = opts.from.filter((f) => !isKnown(f));
  if (missing.length > 0) {
    const reasons = missing.flatMap((m) => m.limitations);
    return insufficient<T>(
      opts.unit,
      opts.asOf,
      reasons.length > 0 ? reasons.join("; ") : "a required input was INSUFFICIENT_DATA",
      { inputs: [...(opts.inputs ?? []), ...opts.from.flatMap((f) => f.inputs)] },
    );
  }
  const bases = opts.from.map((f) => f.basis);
  if (opts.cap) bases.push(opts.cap);
  // A computed value is never stronger than CALCULATED, however strong its inputs.
  const basis = weakestBasis([...bases, "CALCULATED"]);
  return {
    value: compute(),
    unit: opts.unit,
    basis,
    asOf: opts.asOf,
    inputs: [...(opts.inputs ?? []), ...opts.from.flatMap((f) => f.inputs)],
    assumptions: [...(opts.assumptions ?? []), ...opts.from.flatMap((f) => f.assumptions)],
    coverage: opts.coverage ?? [],
    limitations: [...(opts.limitations ?? []), ...opts.from.flatMap((f) => f.limitations)],
  };
}

/* -------------------------------------------------------------------------- */
/* D-043 — exclusion is not contagion.                                        */
/* -------------------------------------------------------------------------- */

export interface Partitioned<T> {
  /** Members that can be computed. */
  readonly included: readonly Envelope<T>[];
  /** Members that cannot. Disclosed, never silently dropped. */
  readonly excluded: readonly Envelope<T>[];
  readonly excludedCount: number;
  /**
   * Why each excluded member could not be computed. The reader is told what is
   * missing, not merely that something is.
   */
  readonly exclusionReasons: readonly string[];
}

/**
 * "Contagion applies to the inputs of a value. Exclusion applies to the members
 *  of a set — and an excluded member is disclosed, never silently dropped."
 *
 * Both of the moves an engineer would otherwise make are wrong:
 *   (a) treat INSUFFICIENT_DATA as zero  -> a total that looks complete and omits members
 *   (b) apply contagion to the set       -> a headline that is permanently uncomputable
 *
 * The direction of the error is always the same: what is omitted is favourable,
 * so any total produced from `included` is a LOWER BOUND. Callers must say so.
 */
export function partitionForAggregate<T>(members: readonly Envelope<T>[]): Partitioned<T> {
  const included = members.filter(isKnown);
  const excluded = members.filter((m) => !isKnown(m));
  return {
    included,
    excluded,
    excludedCount: excluded.length,
    exclusionReasons: [...new Set(excluded.flatMap((e) => e.limitations))],
  };
}
