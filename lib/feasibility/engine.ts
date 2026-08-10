/**
 * PRODUCTION FEASIBILITY ENGINE — D-054, D-056, D-057.
 * Implements `docs/domain/22-BLOCK8-DOMAIN-CONTRACT.md` §3.
 *
 * The whole capability in one sentence: a user states a production quantity, and
 * the system explodes ONE level of the recipe, nets each component against stock
 * and supply already ordered, and answers with an evidence partition.
 *
 * ⚠ THE THREE THINGS THIS FILE MUST NEVER DO, each of which an implementer would
 *   otherwise reach for naturally:
 *
 *   1. No percentage, threshold or score. The verdict is an evidence partition —
 *      D-044's construction applied to feasibility instead of to money. "Green
 *      above 95%" embeds three invented constants in the product's most visible
 *      element, which D-014 rule 15 and D-017 forbid outright.
 *   2. No statistic derived from observed lead time and used IN a calculation.
 *      An observed HISTORY is ACTUAL; one number extracted from it to predict the
 *      future is a CHOSEN statistic, and choosing one is ours, not the factory's.
 *   3. No write. Not to the ledger, not to findings, not to anything a
 *      calculation reads. D-050 stands only while these answers stay inert.
 *
 * Everything derived here is floored at USER_DEFINED by contagion, because the
 * user's own quantity is USER_DEFINED. No feasibility figure is ever ACTUAL, and
 * it must never be presented as though it were.
 */
import {
  addQty,
  cmpQty,
  qty,
  subQty,
  ZERO_QTY,
  type Decimal,
  type Qty,
} from "../core/decimal";
import { insufficient, value, weakestBasis, type Basis, type Envelope } from "../core/provenance";
import { positionAt, type StockPosition } from "../ledger/post";
import { conversionsFor, convertQty } from "./uom";
import { structureFor, type StructureLine } from "./structure";
import { observedConsumption, openSupplyFor, totalOpen, usableBy, type OpenSupply } from "./supply";
import { sql } from "../db/client";

/* -------------------------------------------------------------------------- */
/* The four states. D-057.                                                    */
/* -------------------------------------------------------------------------- */

export type Verdict = "YES" | "AT_RISK" | "NO" | "CANT_SAY";

/**
 * Precedence for aggregating components into one answer — DERIVED, not chosen.
 *
 * NO outranks CANT_SAY because component X's shortfall does not depend on
 * component Y's missing recipe: resolving the unknown cannot remove the known
 * blocker, and exploding a deeper recipe can only ADD requirements, never
 * subtract them. A known blocker is dispositive regardless of an unrelated
 * unknown.
 *
 * CANT_SAY outranks AT_RISK and YES because an unevaluated component could be a
 * blocker, and a green light over an unevaluated component is a partial
 * calculation presented as complete.
 */
const PRECEDENCE: Record<Verdict, number> = { NO: 3, CANT_SAY: 2, AT_RISK: 1, YES: 0 };

export const worstVerdict = (vs: readonly Verdict[]): Verdict =>
  vs.length === 0 ? "CANT_SAY" : vs.reduce((w, v) => (PRECEDENCE[v] > PRECEDENCE[w] ? v : w));

/* -------------------------------------------------------------------------- */
/* Malformed input is REJECTED, and rejection is not ⚪.                       */
/* ⚪ means WE lack information. Rejection means the question was not asked.   */
/* -------------------------------------------------------------------------- */

export class MalformedRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedRequestError";
  }
}

/* -------------------------------------------------------------------------- */
/* Result shapes.                                                             */
/* -------------------------------------------------------------------------- */

export interface Recommendation {
  /** Shortfall in the component's STOCK unit. Null when not computable. */
  readonly orderQty: Qty | null;
  readonly orderUom: string;
  /**
   * D-048/F-52: the pack count in the supplier's unit, produced ONLY where a
   * factory-stated expected weight per pack exists. `actual_qty` is never
   * invented, and neither is the relationship that would let us invent it.
   */
  readonly nominalQty: Qty | null;
  readonly nominalUom: string | null;
  /** Null when no need-by date was stated, or no lead time is recorded. */
  readonly orderByDate: Date | null;
  /** Set when ordering today still arrives after the need-by date. */
  readonly earliestArrival: Date | null;
  readonly lateByDays: number | null;
  readonly leadTimeDays: number | null;
  /** D-056: which source the lead time came from, so "Tuesday" is traceable. */
  readonly leadTimeSource: "SUPPLIER_TERMS" | "ITEM_MASTER" | "NONE";
  /** Why no date could be produced. Stated, never inferred around. */
  readonly noDateReason: string | null;
}

export interface ObservedLeadTime {
  readonly observations: readonly number[];
  readonly exceedingCount: number;
  readonly minDays: number;
  readonly maxDays: number;
}

export interface ComponentResult {
  readonly itemId: string;
  readonly code: string;
  readonly name: string;
  readonly verdict: Verdict;
  /** Present unless the component could not be evaluated at all. */
  readonly requirement: Envelope<Qty>;
  readonly available: Qty | null;
  readonly qualityHold: Qty | null;
  readonly incoming: Qty | null;
  /**
   * Two gaps, and conflating them is the mistake that makes AT RISK unreadable.
   *   gapVsAvailable  what is NOT on the shelf right now — "what's missing"
   *   shortfall       what must be ORDERED, after supply already on the way
   * For AT RISK the first is positive and the second is zero: material is
   * missing, and an order already covers it. For NO both are positive.
   */
  readonly gapVsAvailable: Qty | null;
  readonly shortfall: Qty | null;
  readonly stockUom: string;
  /** The supplier's ordering unit for a catch-weight item (D-048). */
  readonly nominalUom: string | null;
  /** Carried on the component so a warning can name it without a recommendation. */
  readonly leadTimeDays: number | null;
  readonly leadTimeSource: Recommendation["leadTimeSource"];
  readonly quantityPer: string;
  readonly recipeUom: string;
  readonly integerOnly: boolean;
  readonly catchWeight: boolean;
  readonly rounded: boolean;
  readonly supply: readonly OpenSupply[];
  readonly supplyExcludedLate: readonly OpenSupply[];
  readonly recommendation: Recommendation | null;
  /** D-057's 🟢 cap: enough today, but the material is consumed regularly. */
  readonly cappedByConsumption: boolean;
  readonly monthlyConsumption: Qty | null;
  readonly observedLeadTime: ObservedLeadTime | null;
  /** D-055 rule 5 — displayed, never netted, never a new finding. */
  readonly openOpportunities: readonly { id: string; title: string }[];
  readonly hasOwnStructure: boolean;
  readonly isDemo: boolean;
  /** Why this component is ⚪, in the factory's language. */
  readonly cantSayReason: string | null;
}

export interface FeasibilityRequest {
  readonly productItemId: string;
  readonly quantity: Qty;
  readonly needBy: Date | null;
  readonly asOf: Date;
}

export interface FeasibilityAnswer {
  readonly productItemId: string;
  readonly productCode: string;
  readonly productName: string;
  readonly requestedQty: Qty;
  readonly needBy: Date | null;
  readonly asOf: Date;
  readonly verdict: Verdict;
  readonly components: readonly ComponentResult[];
  readonly shortComponents: readonly ComponentResult[];
  readonly structureAsOf: Date | null;
  readonly isDemo: boolean;
  /** Weakest basis across everything asserted. Never better than USER_DEFINED. */
  readonly basis: Basis;
  readonly cantSayReason: string | null;
  /** Stated limits of this answer, e.g. the calendar convention. */
  readonly assumptions: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Rounding — D-057.                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Round UP, and ONCE, at the final net requirement.
 *
 * UP because a default must never create an under-supply: rounding 4,500.3 down
 * produces a recommendation that is definitionally insufficient — the system
 * would compute a shortfall and then recommend covering less than it.
 *
 * ONCE because rounding at the gross requirement, again after conversion and
 * again after netting compounds the overstatement across a recipe. One rounding
 * bounds it at under one unit per component, always in the safe direction.
 */
const roundUpIfInteger = (q: Qty, integerOnly: boolean): { q: Qty; rounded: boolean } => {
  if (!integerOnly) return { q, rounded: false };
  const up = qty((q as Decimal).ceil());
  return { q: up, rounded: !up.equals(q as Decimal) };
};

/* -------------------------------------------------------------------------- */
/* Lead time and dates. D-056.                                                */
/* -------------------------------------------------------------------------- */

const DAY_MS = 24 * 3600 * 1000;
const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * DAY_MS);
const daysBetween = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / DAY_MS);

async function leadTimeFor(itemId: string, masterDays: number | null, at: Date): Promise<{ days: number | null; source: Recommendation["leadTimeSource"] }> {
  /* Supplier-specific terms beat item master — not a statistic, a MORE SPECIFIC
     STATED VALUE, which F6's per-item principle already establishes. */
  const rows = await sql<{ lead_time_days: number | null }[]>`
    SELECT lead_time_days FROM supplier_item_terms
    WHERE item_id = ${itemId}::uuid AND effective_from <= ${at.toISOString()}::timestamptz
      AND lead_time_days IS NOT NULL
    ORDER BY effective_from DESC LIMIT 1`;
  if (rows[0]?.lead_time_days != null) return { days: rows[0].lead_time_days, source: "SUPPLIER_TERMS" };
  if (masterDays != null) return { days: masterDays, source: "ITEM_MASTER" };
  return { days: null, source: "NONE" };
}

/**
 * Observed lead times, DISPLAYED and never substituted (D-056).
 *
 * A count of exceedances is categorical and therefore permitted under D-017. A
 * mean, median or percentile would be a chosen statistic and is not.
 */
async function observedLeadTimes(itemId: string, at: Date, comparedTo: number | null): Promise<ObservedLeadTime | null> {
  if (comparedTo === null) return null;
  const rows = await sql<{ days: number }[]>`
    SELECT EXTRACT(DAY FROM (r.received_at - po.ordered_at))::int AS days
    FROM receipts r
    JOIN po_lines pl        ON pl.id = r.po_line_id
    JOIN purchase_orders po ON po.id = pl.po_id
    WHERE pl.item_id = ${itemId}::uuid
      AND po.ordered_at IS NOT NULL
      AND r.received_at <= ${at.toISOString()}::timestamptz
    ORDER BY r.received_at DESC LIMIT 20`;
  const obs = rows.map((r) => r.days).filter((d) => Number.isFinite(d) && d >= 0);
  if (obs.length === 0) return null;
  const exceeding = obs.filter((d) => d > comparedTo);
  if (exceeding.length === 0) return null; // nothing worth telling the user
  return {
    observations: obs,
    exceedingCount: exceeding.length,
    minDays: Math.min(...exceeding),
    maxDays: Math.max(...exceeding),
  };
}

/* -------------------------------------------------------------------------- */
/* D-055 rule 5 — context, not a finding.                                     */
/* -------------------------------------------------------------------------- */

/**
 * Open Opportunities on the same item, READ at answer time.
 *
 * This is a lookup, not a stored signature and not a new relationship type. The
 * product must not tell one user to order more and order less of the same
 * material on the same day; showing both facts is the whole of the fix.
 */
async function openOpportunitiesFor(itemId: string): Promise<{ id: string; title: string }[]> {
  const rows = await sql<{ id: string; title: string }[]>`
    SELECT id, title FROM opportunities
    WHERE subject_item_id = ${itemId}::uuid
      AND superseded_at IS NULL
      AND lifecycle IN ('POTENTIAL', 'APPROVED', 'IN_PROGRESS')
    ORDER BY detected_at DESC LIMIT 5`;
  return rows;
}

/* -------------------------------------------------------------------------- */
/* The engine.                                                                */
/* -------------------------------------------------------------------------- */

export async function checkFeasibility(req: FeasibilityRequest): Promise<FeasibilityAnswer> {
  const [product] = await sql<{ id: string; code: string; name: string; integer_only: boolean }[]>`
    SELECT id, code, name, integer_only FROM items WHERE id = ${req.productItemId}::uuid`;
  if (!product) throw new MalformedRequestError("That product does not exist.");

  /* ---- Validation. Rejection is NOT ⚪ — the question was not asked. ------ */
  if (cmpQty(req.quantity, ZERO_QTY) <= 0) {
    throw new MalformedRequestError("Enter how many you want to produce — a number greater than zero.");
  }
  if (product.integer_only && !(req.quantity as Decimal).isInteger()) {
    throw new MalformedRequestError(
      `${product.code} is counted in whole units, so enter a whole number rather than ${req.quantity.toFixed()}.`,
    );
  }

  const structure = await structureFor(req.productItemId, req.asOf);
  const baseAssumptions = [
    "Dates are calculated in calendar days. Your factory's working week and holidays are not set up yet, so weekends are not skipped.",
  ];

  if (structure.lines.length === 0) {
    return {
      productItemId: product.id, productCode: product.code, productName: product.name,
      requestedQty: req.quantity, needBy: req.needBy, asOf: req.asOf,
      verdict: "CANT_SAY", components: [], shortComponents: [],
      structureAsOf: null, isDemo: false, basis: "INSUFFICIENT_DATA",
      cantSayReason: `We don't have the recipe for ${product.code} yet, so we can't work out what it needs.`,
      assumptions: baseAssumptions,
    };
  }

  const components = await Promise.all(structure.lines.map((line) => evaluateComponent(line, req)));
  const verdict = worstVerdict(components.map((c) => c.verdict));

  const bases = components.map((c) => c.requirement.basis);
  /* "What's missing" is measured against the SHELF, so an AT RISK component
     whose gap an inbound order already covers still appears — the user asked
     what is missing, not what is unordered. */
  const shortComponents = components.filter((c) => c.gapVsAvailable !== null && cmpQty(c.gapVsAvailable, ZERO_QTY) > 0);

  const deeper = components.filter((c) => c.hasOwnStructure);
  const cantSayReason =
    verdict === "CANT_SAY"
      ? deeper.length > 0
        ? `${deeper.map((d) => d.code).join(", ")} ${deeper.length === 1 ? "is" : "are"} made in-house, so we can't see what ${deeper.length === 1 ? "it needs" : "they need"} yet.`
        : (components.find((c) => c.cantSayReason)?.cantSayReason ?? "Some information we need is missing.")
      : null;

  return {
    productItemId: product.id,
    productCode: product.code,
    productName: product.name,
    requestedQty: req.quantity,
    needBy: req.needBy,
    asOf: req.asOf,
    verdict,
    components,
    shortComponents,
    structureAsOf: structure.structureAsOf,
    isDemo: structure.anyDemo,
    basis: weakestBasis(bases),
    cantSayReason,
    assumptions: baseAssumptions,
  };
}

async function evaluateComponent(line: StructureLine, req: FeasibilityRequest): Promise<ComponentResult> {
  const shell = {
    itemId: line.componentItemId, code: line.componentCode, name: line.componentName,
    stockUom: line.stockUom, nominalUom: line.nominalUom, quantityPer: line.quantityPer, recipeUom: line.uom,
    integerOnly: line.integerOnly, catchWeight: line.catchWeight,
    hasOwnStructure: line.hasOwnStructure, isDemo: line.isDemo,
  };
  const emptyResult = (reason: string): ComponentResult => ({
    ...shell,
    verdict: "CANT_SAY",
    leadTimeDays: null, leadTimeSource: "NONE",
    requirement: insufficient<Qty>(line.stockUom, req.asOf, reason),
    available: null, qualityHold: null, incoming: null, gapVsAvailable: null, shortfall: null,
    rounded: false, supply: [], supplyExcludedLate: [], recommendation: null,
    cappedByConsumption: false, monthlyConsumption: null, observedLeadTime: null,
    openOpportunities: [], cantSayReason: reason,
  });

  /* ---- A component with its own recipe. Never partially calculated. ------ */
  if (line.hasOwnStructure) {
    return emptyResult(`${line.componentCode} is made in-house, so we can't see what it needs yet.`);
  }

  /* ---- Gross requirement, then conversion to the stock unit. ------------- */
  const gross = qty((req.quantity as Decimal).times(qty(line.quantityPer) as Decimal));
  const conversions = await conversionsFor(line.componentItemId, req.asOf);
  const converted = convertQty(gross, line.uom, line.stockUom, conversions, {
    itemCode: line.componentCode,
    asOf: req.asOf,
  });
  if (converted.value === null) {
    return emptyResult(
      `We can't convert ${line.componentCode} from ${line.uom} to ${line.stockUom} — that conversion isn't set up.`,
    );
  }

  const position: StockPosition = await positionAt(line.componentItemId, req.asOf);
  const allSupply = await openSupplyFor(line.componentItemId, req.asOf);
  const { usable, excluded } = usableBy(allSupply, req.needBy);
  const incoming = totalOpen(usable);

  /* ---- Net, then round ONCE. -------------------------------------------- */
  const rawGapVsAvailable = subQty(converted.value, position.available);
  const rawShortfallVsAll = subQty(rawGapVsAvailable, incoming);
  const clamp = (q: Qty): Qty => (cmpQty(q, ZERO_QTY) > 0 ? q : ZERO_QTY);
  const { q: gapVsAvailable } = roundUpIfInteger(clamp(rawGapVsAvailable), line.integerOnly);
  const { q: shortfall, rounded } = roundUpIfInteger(clamp(rawShortfallVsAll), line.integerOnly);

  const requirement = value(converted.value, line.stockUom, "USER_DEFINED", req.asOf, {
    inputs: converted.inputs,
    assumptions: [`The recipe says ${line.quantityPer} ${line.uom} per unit. We use it exactly as recorded.`],
  });

  const consumption = await observedConsumption(line.componentItemId, req.asOf);
  const opportunities = await openOpportunitiesFor(line.componentItemId);

  /* ---- Verdict. An evidence partition, not a coverage score. ------------- */
  let verdict: Verdict;
  let cappedByConsumption = false;
  if (cmpQty(converted.value, position.available) <= 0) {
    /* D-057's cap: enough today, but no reservation model exists to net out what
       else will consume it (D-050), and D-041 establishes our exclusions run
       optimistic. Observed consumption is a stated fact, invents nothing, and is
       conservative by construction. */
    if (!consumption.total.isZero()) {
      verdict = "AT_RISK";
      cappedByConsumption = true;
    } else {
      verdict = "YES";
    }
  } else if (cmpQty(subQty(converted.value, position.available), incoming) <= 0) {
    verdict = "AT_RISK";
  } else {
    verdict = "NO";
  }

  /* ---- Recommendation. ------------------------------------------------- */
  const recommendation =
    cmpQty(shortfall, ZERO_QTY) > 0
      ? await buildRecommendation(line, shortfall, req)
      : null;

  const lt = await leadTimeFor(line.componentItemId, line.leadTimeDays, req.asOf);
  const observedLt = await observedLeadTimes(line.componentItemId, req.asOf, lt.days);

  return {
    ...shell,
    verdict,
    leadTimeDays: lt.days,
    leadTimeSource: lt.source,
    requirement,
    available: position.available,
    qualityHold: position.qualityHold,
    incoming,
    gapVsAvailable,
    shortfall,
    rounded,
    supply: usable,
    supplyExcludedLate: excluded,
    recommendation,
    cappedByConsumption,
    monthlyConsumption: consumption.monthly,
    observedLeadTime: observedLt,
    openOpportunities: opportunities,
    cantSayReason: null,
  };
}

async function buildRecommendation(line: StructureLine, shortfall: Qty, req: FeasibilityRequest): Promise<Recommendation> {
  const lt = await leadTimeFor(line.componentItemId, line.leadTimeDays, req.asOf);

  /* D-048 / F-52: a shortfall in the stock (actual) unit cannot become a pack
     count in the supplier's (nominal) unit without a stated expected weight per
     pack. `actual_qty` is never invented, and neither is what would let us. */
  let nominalQty: Qty | null = null;
  let nominalUom: string | null = null;
  if (line.catchWeight && line.nominalUom) {
    nominalUom = line.nominalUom;
    const conversions = await conversionsFor(line.componentItemId, req.asOf);
    const asNominal = convertQty(shortfall, line.stockUom, line.nominalUom, conversions, {
      itemCode: line.componentCode,
      asOf: req.asOf,
    });
    if (asNominal.value !== null) {
      // A partial pack cannot be ordered; round up for the same reason integers do.
      nominalQty = qty((asNominal.value as Decimal).ceil());
    }
  }

  const base: Omit<Recommendation, "orderByDate" | "earliestArrival" | "lateByDays" | "noDateReason"> = {
    orderQty: shortfall,
    orderUom: line.stockUom,
    nominalQty,
    nominalUom,
    leadTimeDays: lt.days,
    leadTimeSource: lt.source,
  };

  /* D-056: no lead time ⇒ NO DATE, and the answer says why. Never inferred. */
  if (lt.days === null) {
    return {
      ...base, orderByDate: null, earliestArrival: null, lateByDays: null,
      noDateReason: `We don't have a lead time on file for ${line.componentCode}, so we can't say when to order it.`,
    };
  }

  const earliest = addDays(req.asOf, lt.days);

  /* D-056: no need-by date ⇒ NO DEADLINE IS INVENTED. The earliest defensible
     arrival is shown instead, which is a fact rather than a fabrication. */
  if (!req.needBy) {
    return { ...base, orderByDate: null, earliestArrival: earliest, lateByDays: null, noDateReason: null };
  }

  const orderBy = addDays(req.needBy, -lt.days);
  /* The recommendation can be impossible: ordering today still arrives late.
     That is a first-class answer, not an edge case. */
  if (orderBy < req.asOf) {
    return {
      ...base, orderByDate: orderBy, earliestArrival: earliest,
      lateByDays: daysBetween(req.needBy, earliest), noDateReason: null,
    };
  }
  return { ...base, orderByDate: orderBy, earliestArrival: earliest, lateByDays: null, noDateReason: null };
}
