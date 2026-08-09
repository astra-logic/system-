/**
 * Annualisation — D-046, completing D-014 rules 11 and 12 and D-019.
 *
 * Rules 11 and 12 set the HISTORY BAR and never said what the annual figure IS.
 * With eighteen months an engineer must choose a window; with fourteen,
 * `sum * (12 / months)` is the obvious move — and it is extrapolation wearing
 * arithmetic's clothing.
 *
 *   "Annualisation is a claim that the intervention prevents recurrence — not a
 *    claim that the past repeats, and never a scaling of a partial window."
 *
 * And a distinction that would otherwise be conflated: rule 11's twelve months is
 * a HISTORY MINIMUM; D-022's twelve months is a VERIFICATION WINDOW. Two different
 * twelves on two different clocks.
 *
 * Code standard 10b-4, 10h.
 */
import { type Money, sumMoney } from "./decimal";
import { type Envelope, insufficient, value, weakestBasis } from "./provenance";

const DAY = 86_400_000;

export interface DatedAmount {
  readonly at: Date;
  readonly amount: Envelope<Money>;
}

export interface AnnualisationWindow {
  readonly from: Date;
  readonly to: Date;
  readonly monthsUsable: number;
}

export interface AnnualisationResult {
  readonly figure: Envelope<Money>;
  /** Shown, always — an undeclared window is a knob nobody can audit. */
  readonly window: AnnualisationWindow | null;
  /** D-019's ladder. Currency is only permitted at ANNUALIZATION_ELIGIBLE or beyond. */
  readonly ladder: "OPPORTUNITY_DETECTED" | "ANNUALIZATION_ELIGIBLE";
}

/** Whole months between two instants, floored. */
export function monthsBetween(from: Date, to: Date): number {
  const m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return to.getDate() >= from.getDate() ? m : m - 1;
}

/**
 * The annual figure is the OBSERVED figure over a stated twelve-month window.
 *
 * @param events        dated amounts already FX-normalised (D-042).
 * @param historyFrom   the first date for which usable history exists. NOT the
 *                      first event — an item with one event in month 11 of 12
 *                      has twelve months of history and one event.
 * @param asOf          the effective "now" of the calculation.
 * @param evidenceSpan  where an intervention's evidence spans longer than twelve
 *                      months, the window is widened to it rather than truncated.
 */
export function annualise(
  events: readonly DatedAmount[],
  opts: { historyFrom: Date; asOf: Date; unit: string; evidenceSpanMonths?: number },
): AnnualisationResult {
  const monthsUsable = monthsBetween(opts.historyFrom, opts.asOf);

  if (monthsUsable < 12) {
    return {
      figure: insufficient<Money>(
        opts.unit,
        opts.asOf,
        `${monthsUsable} months of usable history; twelve is the preferred minimum (rule 11). ` +
          `Below it there is NO annual figure — a scaled partial window is extrapolation, not observation (rule 12, D-046).`,
        { coverage: [`usable history: ${monthsUsable} months from ${opts.historyFrom.toISOString().slice(0, 10)}`] },
      ),
      window: null,
      ladder: "OPPORTUNITY_DETECTED",
    };
  }

  const spanMonths = Math.max(12, opts.evidenceSpanMonths ?? 12);
  const to = opts.asOf;
  const from = new Date(to.getTime() - spanMonths * 30.436875 * DAY);
  const inWindow = events.filter((e) => e.at >= from && e.at <= to);

  const partitionedMissing = inWindow.filter((e) => e.amount.value === null);
  if (partitionedMissing.length > 0) {
    return {
      figure: insufficient<Money>(
        opts.unit,
        opts.asOf,
        `${partitionedMissing.length} of ${inWindow.length} events in the window could not be valued: ` +
          partitionedMissing.flatMap((e) => e.amount.limitations).join("; "),
      ),
      window: { from, to, monthsUsable },
      ladder: "OPPORTUNITY_DETECTED",
    };
  }

  const amounts = inWindow.map((e) => e.amount.value!) as Money[];
  const total = sumMoney(amounts);
  const basis = weakestBasis([...inWindow.map((e) => e.amount.basis), "CALCULATED"]);

  return {
    figure: value(total, opts.unit, basis, opts.asOf, {
      inputs: inWindow.flatMap((e) => e.amount.inputs),
      coverage: [
        `annualisation window: ${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)} (${spanMonths} months)`,
        `${inWindow.length} events observed in the window`,
        `usable history: ${monthsUsable} months`,
      ],
      limitations: [
        `This is the OBSERVED figure over the stated window, not a projection. It is annual only ` +
          `on the claim that the intervention prevents recurrence — not that the past repeats (D-046).`,
      ],
    }),
    window: { from, to, monthsUsable },
    ladder: "ANNUALIZATION_ELIGIBLE",
  };
}

/**
 * One-time impacts are never annualised at all — they are level changes, and a
 * level changes once (D-012, D-033). Exported so the prohibition is callable
 * rather than remembered.
 */
export function refuseToAnnualiseOneTime(unit: string, asOf: Date): Envelope<Money> {
  return insufficient<Money>(
    unit,
    asOf,
    `This is a one-time impact. One-time impacts are never annualised — a level changes once (D-012, D-033). ` +
      `It is reported separately from the recurring annual figure and never summed with it.`,
  );
}
