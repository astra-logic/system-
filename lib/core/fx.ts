/**
 * FX normalisation — D-024 (Tier 1) as reconciled by D-042.
 *
 * D-042 closed a contradiction that would have produced a false financial result:
 * the first-release scope and the build plan both listed "multi-currency" as out
 * of scope, while D-024 makes FX normalisation Tier 1 and D-028 already requires
 * currency, rate and rate date on every financial event. Both readings were
 * supported by current text, and the wrong one sat in the document read first.
 *
 *   OUT   multi-currency TRANSACTING — ledgers, revaluation, translation
 *   IN    multi-currency CAPTURE and FX NORMALISATION
 *
 * The rule an engineer would otherwise get wrong:
 *
 *   Each historical amount is normalised at the rate effective on ITS OWN
 *   effective date — never at a single current rate applied across history.
 *
 * Applying today's rate to history erases exactly the effect normalisation exists
 * to isolate: in an economy with EGP depreciation, a premium that is entirely
 * currency movement would present as an operational deterioration.
 *
 * Code standard 10b-5, 10f.
 */
import { type Money, money, moneyTimesRate, type Rate, rate as mkRate } from "./decimal";
import { type Envelope, insufficient, value } from "./provenance";

export interface FxObservation {
  readonly from: string;
  readonly to: string;
  readonly rate: Rate;
  /** The date this rate was effective. Not the date it was loaded. */
  readonly effectiveOn: Date;
  readonly source: string;
  readonly owner: string;
}

/** An amount as captured — D-028's contract. The raw dimensions, never reconstructed. */
export interface CapturedAmount {
  readonly amount: Money;
  readonly currency: string;
  /** F5 effective time: when this amount was true, not when it was recorded. */
  readonly effectiveOn: Date;
}

export interface FxPolicy {
  /** The reporting currency. Single, by D-042 — no multi-currency reporting. */
  readonly reportingCurrency: string;
  /**
   * Effective-dated observations. F-07 asks for rate HISTORY, not a scalar:
   * "a scalar across a volatile twelve months is itself false precision."
   */
  readonly observations: readonly FxObservation[];
  readonly owner: string;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/**
 * The rate effective ON OR BEFORE the amount's own effective date.
 *
 * Deliberately not the nearest rate, and never a later one: using a rate from
 * after the transaction is hindsight, and hindsight in a devaluing currency
 * systematically misstates the past.
 */
function rateOn(policy: FxPolicy, from: string, to: string, on: Date): FxObservation | null {
  const candidates = policy.observations
    .filter((o) => o.from === from && o.to === to && o.effectiveOn <= on)
    .sort((a, b) => b.effectiveOn.getTime() - a.effectiveOn.getTime());
  return candidates[0] ?? null;
}

/**
 * Normalise one captured amount into the reporting currency.
 *
 * Where no rate exists on or before the amount's date the result is
 * INSUFFICIENT_DATA — never a current-rate shortcut, never an assumed rate.
 * The fallback for a missing F-07 is NO CROSS-PERIOD COMPARISON AT ALL.
 */
export function normalise(policy: FxPolicy, a: CapturedAmount): Envelope<Money> {
  const unit = policy.reportingCurrency;
  if (a.currency === policy.reportingCurrency) {
    return value(a.amount, unit, "ACTUAL", a.effectiveOn, {
      coverage: [`domestic amount, no FX dimension`],
    });
  }
  const obs = rateOn(policy, a.currency, policy.reportingCurrency, a.effectiveOn);
  if (obs === null) {
    return insufficient<Money>(
      unit,
      a.effectiveOn,
      `no ${a.currency}/${policy.reportingCurrency} rate is recorded on or before ${dayKey(a.effectiveOn)}. ` +
        `Using a later or current rate would attribute currency movement to operations (D-042). Required: F-07.`,
    );
  }
  return value(moneyTimesRate(a.amount, obs.rate), unit, "CALCULATED", a.effectiveOn, {
    inputs: [{ kind: "fx_rate", id: `${obs.from}/${obs.to}@${dayKey(obs.effectiveOn)}`, basis: "USER_DEFINED", asOf: obs.effectiveOn }],
    coverage: [
      `FX ${obs.from}/${obs.to} = ${obs.rate.toFixed()} effective ${dayKey(obs.effectiveOn)} (source: ${obs.source}, owner: ${obs.owner})`,
      `normalised at the amount's own effective date ${dayKey(a.effectiveOn)}, not at a current rate`,
    ],
    limitations: [`FX-normalised; the operational and currency components of any change are not separated (Q-08 defers the decomposition engine)`],
  });
}

/** Convenience for building a policy in tests and fixtures. */
export function fxObservation(from: string, to: string, r: string, on: Date, source: string, owner: string): FxObservation {
  return { from, to, rate: mkRate(r), effectiveOn: on, source, owner };
}

export function captured(amount: string, currency: string, effectiveOn: Date): CapturedAmount {
  return { amount: money(amount), currency, effectiveOn };
}
