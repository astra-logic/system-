/**
 * THE OFFSET — incremental carrying cost of a lead-time correction.
 *
 * This is the last unbuilt step of Mechanism 01, and the reason every net figure
 * has been INSUFFICIENT_DATA. Block 6's audit found the value hardcoded to `null`
 * with a comment blaming A-18; the comment was wrong. A-18 is the excess↔dead
 * boundary, read only by Mechanism 03. Nothing was missing from the factory —
 * the computation simply did not exist.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ECONOMICS, DERIVED — NOT ASSUMED
 *
 *   reorder point = lead-time demand + safety stock
 *
 * Correcting an understated master lead time raises lead-time demand, so the
 * factory reorders EARLIER. The order still takes the real lead time to arrive,
 * so what changes is the TROUGH: before the correction stock ran down past the
 * buffer (which is why expedites happened); after it, the buffer survives.
 *
 * The permanent increase in stock held is therefore the consumption that occurs
 * during the days of cover the master value was short by:
 *
 *   Δdays  = correctedLeadTimeDays − masterLeadTimeDays     observed, per event
 *   rate   = Σ observed issues over W ÷ days(W)             observed, from the ledger
 *   ΔQ     = rate × Δdays                                    quantity
 *   ΔV     = ΔQ × unit cost                                  value
 *   offset = ΔV × Σ applicable component rates               money per year
 *
 * Every term is read from recorded events or from a finance-owned, purpose-
 * matched rate. There is no constant anywhere in this file.
 *
 * ⚠ D-015 said this correction MAY need no additional inventory. That reading is
 * true only when the master value was not actually short — and where it was
 * short, Mechanism 01 §8's reading governs: "ordering earlier" carries a real
 * carrying cost. Which of the two applies is now COMPUTED per item rather than
 * assumed either way.
 */
import { sql } from "../db/client";
import {
  type Money, type Qty, type Rate, money, moneyTimesRate, priceTimesQty, qty, qtyTimesRate, rate as mkRate,
} from "../core/decimal";
import { type Envelope, insufficient, value, weakestBasis, type Basis } from "../core/provenance";
import { type CarryingComponent, classifyComponent, type FinancialRate, requireRate, type RatePurpose } from "../core/rate";

const DAY = 86_400_000;

/**
 * The components that can apply to THIS decision — a permanent change in the
 * inventory LEVEL at unchanged throughput.
 *
 * ⚠ HANDLING is deliberately absent, and its absence is decision-specific rather
 * than inherited from D-035's general table. Handling scales with the NUMBER OF
 * MOVEMENTS; this correction changes when an order is placed, not how many
 * orders or issues occur. Throughput is unchanged, so marginal handling is zero
 * whatever the factory's labour arrangements. D-023 as amended requires a rate
 * to be fit for the decision it is used in — and a handling rate is not fit for
 * a decision that moves no additional goods.
 */
export const APPLICABLE_COMPONENTS: readonly CarryingComponent[] = [
  "CAPITAL",
  "SPACE",
  "INSURANCE",
  "INVENTORY_TAX",
];

/** Capital is priced by the cost of funds; the rest by a marginal-decision rate. */
const REQUIRED_PURPOSE: Record<string, RatePurpose> = {
  CAPITAL: "COST_OF_FUNDS",
  SPACE: "MARGINAL_DECISION",
  INSURANCE: "MARGINAL_DECISION",
  INVENTORY_TAX: "MARGINAL_DECISION",
};

export interface FactoryFacts {
  readonly spaceConstrained: boolean | null;
  readonly handlingIsMarginal: boolean | null;
  readonly insuranceIsValueBased: boolean | null;
  readonly inventoryTaxApplies: boolean | null;
}

export interface ComponentOutcome {
  readonly component: CarryingComponent;
  readonly verdict: "APPLIED" | "NOT_VALID" | "EXPOSURE" | "UNKNOWN" | "RATE_UNFIT";
  readonly ratePerYear: Rate | null;
  readonly amountPerYear: Money | null;
  readonly why: string;
}

export interface OffsetResult {
  /** The incremental carrying cost, or INSUFFICIENT_DATA with the reason. */
  readonly cost: Envelope<Money>;
  /** Does the correction require holding more inventory at all? */
  readonly requiresAdditionalInventory: boolean | null;
  readonly deltaDaysCover: number;
  readonly deltaQuantity: Envelope<Qty>;
  /**
   * ⚠ The one-time working-capital increase. A POSITION CHANGE, NOT A COST and
   * NOT A SAVING (D-033). Reported separately and never annualised, never netted
   * into the recurring figure.
   */
  readonly oneTimePositionChange: Envelope<Money>;
  readonly components: readonly ComponentOutcome[];
  /** Components that are risks, not costs — disclosed, never netted (D-031). */
  readonly exposuresDisclosed: readonly { component: CarryingComponent; why: string }[];
}

export interface OffsetInput {
  readonly siteId: string;
  readonly itemId: string;
  readonly itemCode: string;
  readonly masterLeadTimeDays: number;
  readonly correctedLeadTimeDays: number;
  readonly windowFrom: Date;
  readonly asOf: Date;
  readonly currency: string;
}

/* -------------------------------------------------------------------------- */
/* Reading the observed position path.                                        */
/* -------------------------------------------------------------------------- */

/**
 * Observed consumption over the window, from the ledger.
 *
 * D-010: the demand signal is observed consumption. This reads issue movements —
 * stock leaving an on-hand location for a consuming destination — and is
 * therefore an ACTUAL quantity, not a forecast or a model.
 */
export async function observedConsumption(
  itemId: string, from: Date, to: Date,
): Promise<{ total: Qty; issueCount: number; days: number }> {
  const [row] = await sql<{ total: string; n: string }[]>`
    SELECT COALESCE(SUM(
      CASE WHEN i.catch_weight AND m.actual_qty IS NOT NULL THEN m.actual_qty ELSE m.nominal_qty END
    ), 0)::text AS total,
    COUNT(*)::text AS n
    FROM movements m
    JOIN items i     ON i.id = m.item_id
    JOIN locations s ON s.id = m.from_location_id
    JOIN locations d ON d.id = m.to_location_id
    WHERE m.item_id = ${itemId}::uuid
      AND s.counts_as_on_hand AND NOT d.counts_as_on_hand
      AND d.kind IN ('PRODUCTION', 'CUSTOMER')
      AND m.effective_at > ${from.toISOString()}::timestamptz
      AND m.effective_at <= ${to.toISOString()}::timestamptz`;
  return {
    total: qty(row!.total),
    issueCount: Number(row!.n),
    days: Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY)),
  };
}

/** D-008: an imported reference, `USER_DEFINED`. Never computed here. */
export async function costReferenceFor(
  itemId: string, asOf: Date,
): Promise<{ unitCost: Money; currency: string; asOf: Date; source: string; ageDays: number } | null> {
  const [row] = await sql<{ unit_cost: string; currency: string; as_of: string; source: string }[]>`
    SELECT unit_cost, currency, as_of::text, source FROM cost_references
    WHERE item_id = ${itemId}::uuid AND as_of <= ${asOf.toISOString()}::timestamptz
    ORDER BY as_of DESC LIMIT 1`;
  if (!row) return null;
  const at = new Date(row.as_of);
  return {
    unitCost: money(row.unit_cost),
    currency: row.currency,
    asOf: at,
    source: row.source,
    ageDays: Math.round((asOf.getTime() - at.getTime()) / DAY),
  };
}

export async function loadFactoryFacts(siteId: string): Promise<FactoryFacts> {
  const rows = await sql<{ key: string; value: boolean }[]>`
    SELECT key, value FROM factory_facts WHERE site_id = ${siteId}::uuid`;
  const m = new Map(rows.map((r) => [r.key, r.value]));
  // An absent row is UNANSWERED, never "no".
  const get = (k: string) => (m.has(k) ? m.get(k)! : null);
  return {
    spaceConstrained: get("space_constrained"),
    handlingIsMarginal: get("handling_is_marginal"),
    insuranceIsValueBased: get("insurance_is_value_based"),
    inventoryTaxApplies: get("inventory_tax_applies"),
  };
}

export async function loadCarryingRates(siteId: string, asOf: Date): Promise<Map<string, FinancialRate>> {
  const rows = await sql<{
    id: string; kind: string; component: string | null; rate: string; unit: string; source: string;
    owner: string; effective_from: string; effective_to: string | null; status: string; purpose: string; basis: string;
  }[]>`
    SELECT id, kind, rate, unit, source, owner, effective_from::text, effective_to::text,
           status, purpose, basis, NULL::text AS component
    FROM financial_rates
    WHERE site_id = ${siteId}::uuid AND effective_from <= ${asOf.toISOString()}::timestamptz`;

  const out = new Map<string, FinancialRate>();
  /**
   * ⚠ Two ACTIVE rates for the same component is an ambiguity, not a choice.
   *
   * Silently taking the first or the last would quietly decide which of finance's
   * two answers governs a saving figure. The component is marked unusable instead,
   * and the offset blocks with the reason — the same posture as an unstated
   * purpose (D-023 as amended).
   */
  const active = rows.filter((r) => r.status === "ACTIVE" && (r.effective_to === null || new Date(r.effective_to) >= asOf));
  const seen = new Map<string, number>();
  for (const r of active) seen.set(r.kind, (seen.get(r.kind) ?? 0) + 1);
  const ambiguous = new Set([...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k));

  for (const r of rows) {
    if (ambiguous.has(r.kind)) {
      out.set(r.kind, {
        id: r.id, kind: "CARRYING_COMPONENT", rate: mkRate("0"), unit: r.unit, source: r.source,
        owner: r.owner, effectiveFrom: new Date(r.effective_from), effectiveTo: null,
        // DRAFT is refused by requireRate, and the reason surfaces to the reader.
        status: "DRAFT", purpose: "UNSTATED", basis: "ASSUMED",
      });
      continue;
    }
    // `kind` names the component the rate prices: CARRYING_SPACE, CARRYING_INSURANCE,
    // CARRYING_INVENTORY_TAX, COST_OF_FUNDS. A generic CARRYING_COMPONENT rate
    // names no component and is therefore not usable for any of them.
    out.set(r.kind, {
      id: r.id,
      kind: (r.kind === "COST_OF_FUNDS" ? "COST_OF_FUNDS" : "CARRYING_COMPONENT") as FinancialRate["kind"],
      rate: mkRate(r.rate),
      unit: r.unit,
      source: r.source,
      owner: r.owner,
      effectiveFrom: new Date(r.effective_from),
      effectiveTo: r.effective_to ? new Date(r.effective_to) : null,
      status: r.status as FinancialRate["status"],
      purpose: r.purpose as RatePurpose,
      basis: r.basis as Basis,
    });
  }
  return out;
}

const RATE_KEY: Record<string, string> = {
  CAPITAL: "COST_OF_FUNDS",
  SPACE: "CARRYING_SPACE",
  INSURANCE: "CARRYING_INSURANCE",
  INVENTORY_TAX: "CARRYING_INVENTORY_TAX",
};

/* -------------------------------------------------------------------------- */
/* The computation.                                                           */
/* -------------------------------------------------------------------------- */

export async function computeOffset(input: OffsetInput): Promise<OffsetResult> {
  const { currency, asOf } = input;
  const deltaDays = input.correctedLeadTimeDays - input.masterLeadTimeDays;

  const zeroQty = value(qty("0"), "unit", "CALCULATED", asOf);
  const zeroMoney = value(money("0"), currency, "CALCULATED", asOf);

  /* --- Does it require more inventory at all? ----------------------------- */
  if (deltaDays <= 0) {
    return {
      cost: value(money("0"), currency, "CALCULATED", asOf, {
        coverage: [`corrected lead time (${input.correctedLeadTimeDays}d) does not exceed the master value (${input.masterLeadTimeDays}d)`],
        limitations: ["No additional cover is required, so no additional inventory is held and no carrying cost arises."],
      }),
      requiresAdditionalInventory: false,
      deltaDaysCover: deltaDays,
      deltaQuantity: zeroQty,
      oneTimePositionChange: zeroMoney,
      components: [],
      exposuresDisclosed: [],
    };
  }

  /* --- The observed position path. ----------------------------------------
     ⚠ The demand window is clamped to the SAME twelve months D-046 uses for the
     gross. The two figures are subtracted from one another, so they must
     describe the same year: a rate drawn from nineteen months of history and
     subtracted from a twelve-month premium would be two different periods
     wearing one number. Where less than twelve months exist, the window is
     whatever history there is — and the gross is refused anyway (rule 12). */
  const twelveMonthsBack = new Date(asOf.getTime() - 365 * DAY);
  const windowFrom = input.windowFrom > twelveMonthsBack ? input.windowFrom : twelveMonthsBack;
  const consumption = await observedConsumption(input.itemId, windowFrom, asOf);

  if (consumption.total.isZero()) {
    /**
     * ⚠ No observed consumption means no stock is held against demand, so there
     * is no incremental inventory to carry — and no capital claim on it. This is
     * also the guard that keeps D-035's excess/dead distinction honest here:
     * capital is only ever claimed against material the ledger shows moving.
     */
    return {
      cost: value(money("0"), currency, "CALCULATED", asOf, {
        coverage: [`no issues recorded for ${input.itemCode} in the window`],
        limitations: [
          "No consumption is observed, so the correction holds no additional stock against demand " +
            "and carries no incremental cost. Capital is never claimed against material the ledger " +
            "does not show moving (D-035: for stock that does not move, capital is lost, not tied).",
        ],
      }),
      requiresAdditionalInventory: false,
      deltaDaysCover: deltaDays,
      deltaQuantity: zeroQty,
      oneTimePositionChange: zeroMoney,
      components: [],
      exposuresDisclosed: [],
    };
  }

  const dailyRate = qtyTimesRate(consumption.total, mkRate(mkRate("1").div(consumption.days)));
  const deltaQty = qtyTimesRate(dailyRate, mkRate(String(deltaDays)));

  const deltaQuantity = value(deltaQty, "qty", "CALCULATED", asOf, {
    inputs: [{ kind: "ledger_issues", id: `${input.itemId}:${consumption.issueCount}`, basis: "ACTUAL", asOf }],
    coverage: [
      `observed consumption: ${consumption.total.toFixed()} over ${consumption.days} days across ${consumption.issueCount} issue movement(s)`,
      `daily rate ${dailyRate.toFixed(4)} × ${deltaDays} additional days of cover`,
    ],
    limitations: [
      "The additional stock is the consumption that occurs during the days of cover the master " +
        "value was short by, at the OBSERVED average rate over the window. Actual day-to-day " +
        "consumption varies around that rate; this is an observation, not a demand model.",
    ],
  });

  /* --- Value it. D-008: the cost reference is imported, never computed. ---- */
  const ref = await costReferenceFor(input.itemId, asOf);
  if (!ref) {
    return {
      cost: insufficient<Money>(
        currency, asOf,
        `no imported cost reference exists for ${input.itemCode}, so the additional stock cannot be ` +
          `valued. This system does not compute inventory value — finance owns it (D-008). Required: N-01.`,
      ),
      requiresAdditionalInventory: true,
      deltaDaysCover: deltaDays,
      deltaQuantity,
      oneTimePositionChange: insufficient<Money>(currency, asOf, "no cost reference"),
      components: [],
      exposuresDisclosed: [],
    };
  }
  if (ref.currency !== currency) {
    return {
      cost: insufficient<Money>(
        currency, asOf,
        `the cost reference for ${input.itemCode} is in ${ref.currency}, not the reporting currency ` +
          `${currency}. FX-normalising a cost reference is not the same as normalising a transaction ` +
          `and is not attempted here.`,
      ),
      requiresAdditionalInventory: true,
      deltaDaysCover: deltaDays,
      deltaQuantity,
      oneTimePositionChange: insufficient<Money>(currency, asOf, "cost reference currency mismatch"),
      components: [],
      exposuresDisclosed: [],
    };
  }

  const deltaValue = priceTimesQty(ref.unitCost, deltaQty);
  /**
   * ⚠ The one-time working-capital increase. D-033: a change in a stock LEVEL is
   * a position change, not a saving and not a recurring cost. It is reported
   * separately and never annualised.
   */
  const oneTimePositionChange = value(deltaValue, currency, "USER_DEFINED", asOf, {
    inputs: [{ kind: "cost_reference", id: `${input.itemId}@${ref.asOf.toISOString().slice(0, 10)}`, basis: "USER_DEFINED", asOf: ref.asOf }],
    coverage: [`cost reference ${ref.unitCost.toFixed()} ${ref.currency} as of ${ref.asOf.toISOString().slice(0, 10)} (${ref.ageDays} days old, source: ${ref.source})`],
    limitations: [
      "A one-time increase in working capital tied up. It is a POSITION CHANGE, not a cost and not " +
        "a saving (D-033), and it is never annualised or netted into the recurring figure.",
      ...(ref.ageDays > 0
        ? [`The cost reference is ${ref.ageDays} days old. No staleness threshold is defined (N-09), ` +
           `so its age is stated rather than classified — the system does not invent the point at ` +
           `which a figure becomes stale.`]
        : []),
    ],
  });

  /* --- Component by component (D-035). ------------------------------------ */
  const facts = await loadFactoryFacts(input.siteId);
  const rates = await loadCarryingRates(input.siteId, asOf);

  const components: ComponentOutcome[] = [];
  const exposures: { component: CarryingComponent; why: string }[] = [];
  const blocking: string[] = [];
  let total = money("0");
  const bases: Basis[] = ["USER_DEFINED"]; // the cost reference's basis floors the result

  // Components that are ALWAYS a risk are disclosed and never priced.
  for (const c of ["OBSOLESCENCE", "SHRINKAGE_FUTURE"] as CarryingComponent[]) {
    const v = classifyComponent(c, facts);
    if (v.kind === "EXPOSURE") {
      exposures.push({ component: c, why: v.why });
      components.push({ component: c, verdict: "EXPOSURE", ratePerYear: null, amountPerYear: null, why: v.why });
    }
  }
  components.push({
    component: "HANDLING",
    verdict: "NOT_VALID",
    ratePerYear: null,
    amountPerYear: null,
    why:
      "This correction changes WHEN an order is placed, not how many orders or issues occur. " +
      "Throughput is unchanged, so marginal handling cost is zero whatever the labour arrangement — " +
      "a handling rate is not fit for a decision that moves no additional goods (D-023 as amended).",
  });

  for (const c of APPLICABLE_COMPONENTS) {
    const verdict = classifyComponent(c, facts);

    if (verdict.kind === "UNKNOWN") {
      components.push({ component: c, verdict: "UNKNOWN", ratePerYear: null, amountPerYear: null, why: verdict.needs });
      blocking.push(`${c}: ${verdict.needs}`);
      continue;
    }
    if (verdict.kind === "NOT_VALID") {
      components.push({ component: c, verdict: "NOT_VALID", ratePerYear: null, amountPerYear: null, why: verdict.why });
      continue;
    }
    if (verdict.kind === "EXPOSURE") {
      exposures.push({ component: c, why: verdict.why });
      components.push({ component: c, verdict: "EXPOSURE", ratePerYear: null, amountPerYear: null, why: verdict.why });
      continue;
    }

    // APPLIES — now it needs a rate that is fit for THIS decision.
    const candidate = rates.get(RATE_KEY[c]!) ?? null;
    const required = REQUIRED_PURPOSE[c]!;
    const r = requireRate(candidate, required, { unit: "ratio/yr", asOf, what: `${c} component of the carrying offset` });

    if (r.value === null) {
      components.push({
        component: c, verdict: "RATE_UNFIT", ratePerYear: null, amountPerYear: null,
        why: r.limitations.join("; "),
      });
      blocking.push(`${c}: ${r.limitations.join("; ")}`);
      continue;
    }

    const amount = moneyTimesRate(deltaValue, r.value);
    total = money(total.plus(amount));
    bases.push(r.basis);
    components.push({ component: c, verdict: "APPLIED", ratePerYear: r.value, amountPerYear: amount, why: `rate ${r.value.toFixed()} /yr, purpose ${required}` });
  }

  /**
   * Code standard 10d-2: a missing APPLICABLE component yields INSUFFICIENT_DATA,
   * never a partial number presented as complete. A partial carrying cost would
   * understate the offset and therefore OVERSTATE the saving — the error this
   * whole mechanism exists to avoid.
   */
  if (blocking.length > 0) {
    return {
      cost: insufficient<Money>(
        currency, asOf,
        `carrying cost cannot be assembled component-wise: ${blocking.join(" | ")}. A partial carrying ` +
          `cost would understate the offset and overstate the saving, and no whole rate may be ` +
          `substituted (D-035).`,
        { coverage: deltaQuantity.coverage },
      ),
      requiresAdditionalInventory: true,
      deltaDaysCover: deltaDays,
      deltaQuantity,
      oneTimePositionChange,
      components,
      exposuresDisclosed: exposures,
    };
  }

  const applied = components.filter((c) => c.verdict === "APPLIED");
  return {
    cost: value(total, currency, weakestBasis(bases), asOf, {
      inputs: [
        ...oneTimePositionChange.inputs,
        ...deltaQuantity.inputs,
      ],
      coverage: [
        ...deltaQuantity.coverage,
        `additional stock value ${deltaValue.toFixed(2)} ${currency}`,
        `components applied: ${applied.map((c) => c.component).join(", ") || "none"}`,
        ...applied.map((c) => `${c.component} ${c.ratePerYear!.toFixed()} /yr → ${c.amountPerYear!.toFixed(2)} ${currency}`),
      ],
      limitations: [
        ...deltaQuantity.limitations,
        ...oneTimePositionChange.limitations.filter((l) => l.includes("days old")),
        `Excluded as risks, never netted: ${exposures.map((e) => e.component).join(", ") || "none"} (D-031).`,
        `Excluded as inapplicable to this decision: ${components.filter((c) => c.verdict === "NOT_VALID").map((c) => c.component).join(", ") || "none"}.`,
      ],
    }),
    requiresAdditionalInventory: true,
    deltaDaysCover: deltaDays,
    deltaQuantity,
    oneTimePositionChange,
    components,
    exposuresDisclosed: exposures,
  };
}
