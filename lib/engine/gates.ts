/**
 * Evidence gates.
 *
 * "Gates are pass / fail / unestablished. They are never averaged and never
 *  become scores — and an unestablished dimension is never a pass."
 *
 * Promoted from the Mechanism 02 lock to cross-cutting in Block 4: every
 * mechanism has gates, and treating unknown as equivalent is the likeliest route
 * to a manufactured saving. It would present as a data bug rather than a
 * financial one, which is why it has to be structural.
 *
 * Code standard 10h-1.
 */
export type GateOutcome = "PASS" | "FAIL" | "UNESTABLISHED";

export interface GateResult {
  readonly gate: string;
  readonly outcome: GateOutcome;
  /** Always populated. A gate that fails without saying why is a defect. */
  readonly detail: string;
}

export const pass = (gate: string, detail: string): GateResult => ({ gate, outcome: "PASS", detail });
export const fail = (gate: string, detail: string): GateResult => ({ gate, outcome: "FAIL", detail });
export const unestablished = (gate: string, detail: string): GateResult => ({ gate, outcome: "UNESTABLISHED", detail });

/**
 * There is deliberately no `score()`, no `weight()` and no `average()` in this
 * module. Eligibility is a conjunction — every gate must PASS. An UNESTABLISHED
 * gate blocks exactly as a FAIL does, and the two are kept distinct only so the
 * reader learns whether the answer was "no" or "we cannot tell".
 */
export function eligibleForCurrency(gates: readonly GateResult[]): boolean {
  return gates.length > 0 && gates.every((g) => g.outcome === "PASS");
}

export function blockingGates(gates: readonly GateResult[]): readonly GateResult[] {
  return gates.filter((g) => g.outcome !== "PASS");
}

/**
 * D-019's ladder. Currency is permitted only at ANNUALIZATION_ELIGIBLE or beyond.
 *
 * The three states are held apart because a single event may IDENTIFY an
 * opportunity while not supporting a defensible recurring annual saving —
 * and no universal minimum event count exists to separate them (D-019).
 */
export type Ladder = "OPPORTUNITY_DETECTED" | "ANNUALIZATION_ELIGIBLE" | "VERIFIED_REALIZATION";

export function ladderFrom(gates: readonly GateResult[], annualisable: boolean): Ladder {
  if (!eligibleForCurrency(gates)) return "OPPORTUNITY_DETECTED";
  return annualisable ? "ANNUALIZATION_ELIGIBLE" : "OPPORTUNITY_DETECTED";
}

/**
 * Coverage facts, per D-045 — stated plainly, never compressed into a score.
 * "Root cause classified on 7 of 9 events" is more useful to a finance manager
 * than a number, and an observation cannot be wrong.
 */
export function coverageFact(label: string, have: number, total: number): string {
  return `${label}: ${have} of ${total}`;
}
