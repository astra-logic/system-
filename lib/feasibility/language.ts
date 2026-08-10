/**
 * The plain-language layer. Block 8 contract §4.
 *
 * "COMPLEXITY BELONGS IN THE ENGINE. CLARITY BELONGS IN THE INTERFACE."
 *
 * Every user-facing sentence in the feasibility capability is produced here, for
 * one reason: a vocabulary rule enforced by review drifts, and a vocabulary rule
 * enforced by a test does not. `vocabularyViolations` below is asserted against
 * the real rendered output in `tests/feasibility.test.ts`, so a leak fails the
 * build rather than reaching a factory manager.
 *
 * The four layers, and what may appear at each:
 *   1 ANSWER  the verdict and one sentence. No numbers, no codes, no dates.
 *   2 ACTION  what to do, one line per material. Plus any warning that would
 *             CHANGE what the user does.
 *   3 REASON  why, in the user's terms.
 *   4 DETAIL  the calculation and its sources.
 *
 * A correct decision must be reachable at layer 2. Layer 4 is available in one
 * interaction and required for none.
 */
/* Law 9: quantities reach the user through the ONE formatting boundary.
   Before Block 13 this rendered "305.100 kg" and "197.000 EA" — true, and not
   how a person writes a quantity. No feasibility RULE changes here; only the
   precision the result is spoken at. */
import { qty as fmtQty } from "../ui/format";
import type { ComponentResult, FeasibilityAnswer, Verdict } from "./engine";

/* -------------------------------------------------------------------------- */
/* The vocabulary rule, as data so it can be tested.                          */
/* -------------------------------------------------------------------------- */

/**
 * Terms that must never reach a user-facing string.
 *
 * These are not stylistic preferences. Each one is a piece of internal
 * architecture whose appearance would force a factory manager to learn our
 * domain model in order to read an answer — which is the exact failure this
 * product exists to avoid.
 *
 * ⚠ "BoM" is banned. The user's word is RECIPE (F-48 will confirm the factory's
 * own term). "MRP", "explosion" and "net requirement" are banned for the same
 * reason: they are true, and they are not the user's language.
 */
/** Jargon. Matched case-insensitively, as whole words where the word is short. */
export const BANNED_PHRASES: readonly string[] = [
  "MRP", "BoM", "bill of material", "requirements explosion", "net requirement",
  "gross requirement", "provenance", "contagion", "counterfactual", "annualisation",
  "annualization", "intervention signature", "evidence partition", "weakest basis",
  "potential annual saving", "decision register", "reorder point", "safety stock",
];

/**
 * Internal identifiers. Matched EXACTLY, because these are code tokens rather
 * than English — banning them case-insensitively would flag the ordinary word
 * "actual", which is legitimate plain language when talking about weight.
 */
export const BANNED_IDENTIFIERS: readonly string[] = [
  "INSUFFICIENT_DATA", "USER_DEFINED", "CALCULATED", "AT_RISK", "CANT_SAY",
  "D-054", "D-055", "D-056", "D-057", "D-058", "D-007", "D-010", "D-048", "D-050",
  "PAS", "F-48", "F-52",
];

/** One place, so the test and any future surface apply the identical rule. */
export function vocabularyViolations(s: string): string[] {
  const hits: string[] = [];
  const lower = s.toLowerCase();
  for (const p of BANNED_PHRASES) {
    const needle = p.toLowerCase();
    // Short terms must match as whole words: "bom" must not fire inside "bombs".
    const found =
      needle.length <= 4
        ? new RegExp(`\\b${needle}\\b`, "i").test(s)
        : lower.includes(needle);
    if (found) hits.push(p);
  }
  for (const t of BANNED_IDENTIFIERS) if (s.includes(t)) hits.push(t);
  return hits;
}

/**
 * The one permitted exception, and it is deliberate.
 *
 * "We don't have enough information to answer this" is not terminology leaking.
 * It is the most trust-building sentence the product can say, and the one no
 * competitor will say. It uses no internal term to say it.
 */

/* -------------------------------------------------------------------------- */
/* Layer 1 — the verdict and one sentence.                                    */
/* -------------------------------------------------------------------------- */

export const VERDICT_MARK: Record<Verdict, string> = {
  YES: "🟢", AT_RISK: "🟡", NO: "🔴", CANT_SAY: "⚪",
};

export const VERDICT_WORD: Record<Verdict, string> = {
  YES: "Yes", AT_RISK: "At risk", NO: "No", CANT_SAY: "Can't say",
};

/** Layer 1. No numbers, no material codes, no dates — by contract. */
export function headline(a: FeasibilityAnswer): string {
  const n = a.shortComponents.length;
  const materials = n === 1 ? "1 material" : `${n} materials`;
  switch (a.verdict) {
    case "YES":
      return "You have enough material for this.";
    case "AT_RISK": {
      const deliveries = countDeliveries(a);
      if (deliveries > 0) {
        return `You can make this only if ${deliveries === 1 ? "1 delivery arrives" : `${deliveries} deliveries arrive`} as expected.`;
      }
      return "You have enough today, but these materials are used regularly, so it may not still be there when you need it.";
    }
    case "NO":
      return `${materials} ${n === 1 ? "is" : "are"} short, and what is already on order does not cover the gap.`;
    case "CANT_SAY":
      return a.cantSayReason ?? "We don't have enough information to answer this.";
  }
}

const countDeliveries = (a: FeasibilityAnswer): number =>
  new Set(a.components.flatMap((c) => c.supply.map((s) => s.poNumber))).size;

/* -------------------------------------------------------------------------- */
/* Layer 2 — what's missing, and what to do.                                  */
/* -------------------------------------------------------------------------- */

export interface MissingLine {
  readonly code: string;
  readonly name: string;
  /** "4,500 kg short" */
  readonly missing: string;
  /** "Order 4,500 kg by Tue 18 Aug" — or why no date exists. Null when covered. */
  readonly action: string | null;
  /** Warnings that would CHANGE what the user does. Layer 2 by contract. */
  readonly warnings: readonly string[];
}

/**
 * Whole-unit items are shown as whole units. "197.000 EA" of a pump assembly is
 * technically exact and reads as though a third of a pump were meaningful.
 */
export const dpFor = (c: ComponentResult): number => (c.integerOnly ? 0 : 3);

export function missingLines(a: FeasibilityAnswer): MissingLine[] {
  return a.shortComponents.map((c) => ({
    code: c.code,
    name: c.name,
    missing: c.gapVsAvailable ? `${fmtQty(c.gapVsAvailable, c.stockUom, { whole: c.integerOnly })} short` : "short",
    action: actionFor(c),
    warnings: warningsFor(c),
  }));
}

/** Layer 2 action. Never fabricates a deadline (D-056). */
export function actionFor(c: ComponentResult): string | null {
  const r = c.recommendation;
  if (!r || !r.orderQty) {
    // Missing from the shelf, but supply already on the way covers it.
    return c.supply.length > 0 ? "Already on order — make sure it arrives on time." : null;
  }

  const packs =
    r.nominalQty && r.nominalUom ? ` (about ${fmtQty(r.nominalQty, r.nominalUom, { whole: true })})` : "";
  const qtyText = `${fmtQty(r.orderQty, r.orderUom, { whole: c.integerOnly })}${packs}`;

  if (r.lateByDays !== null && r.lateByDays > 0) {
    return `Order ${qtyText} now — even so, the earliest it can arrive is ${fmtDate(r.earliestArrival)}, ${r.lateByDays} days after you need it.`;
  }
  if (r.orderByDate) return `Order ${qtyText} by ${fmtDate(r.orderByDate)}.`;
  if (r.earliestArrival) return `Order ${qtyText} now. The earliest it can arrive is ${fmtDate(r.earliestArrival)}.`;
  return `Order ${qtyText}. ${r.noDateReason ?? ""}`.trim();
}

/**
 * Layer 2 warnings — the placement rule is: if it would change what the user
 * DOES, it belongs here; otherwise it is layer 3 or 4.
 */
export function warningsFor(c: ComponentResult): string[] {
  const w: string[] = [];

  if (c.observedLeadTime) {
    const o = c.observedLeadTime;
    const range = o.minDays === o.maxDays ? `${o.minDays} days` : `${o.minDays}–${o.maxDays} days`;
    w.push(
      `The last ${o.exceedingCount} ${o.exceedingCount === 1 ? "delivery" : "deliveries"} of ${c.code} took longer than the ${c.leadTimeDays ?? "recorded"} days on file (${range}).`,
    );
  }

  for (const o of c.openOpportunities) {
    w.push(`There is also an open saving opportunity on ${c.code}: "${o.title}". Ordering more will work against it.`);
  }

  if (c.cappedByConsumption && c.monthlyConsumption) {
    w.push(
      `You have enough of ${c.code} today, but it is used regularly — about ${fmtQty(c.monthlyConsumption, c.stockUom, { whole: true })} a month — so it may not still be there when you need it.`,
    );
  }

  if (c.catchWeight && c.recommendation?.orderQty && !c.recommendation.nominalQty) {
    w.push(
      `${c.code} is bought by the ${c.nominalUom ?? "pack"} and weighed on arrival. We don't have an average weight per ${c.nominalUom ?? "pack"} on file, so how many to order is yours to set.`,
    );
  }

  for (const s of c.supply) {
    if (s.overdue) w.push(`The order ${s.poNumber} for ${c.code} was expected ${fmtDate(s.expectedDate)} and has not arrived.`);
    if (s.datesDisagree) {
      w.push(`For ${s.poNumber}, the supplier promised ${fmtDate(s.promisedDate)} but the latest update says ${fmtDate(s.etaDate)}.`);
    }
  }

  for (const s of c.supplyExcludedLate) {
    w.push(`Order ${s.poNumber} for ${c.code} is expected ${fmtDate(s.expectedDate)}, which is after you need it, so it does not help here.`);
  }

  return w;
}

/**
 * Answer-level notices — stated ONCE, however many materials are involved.
 *
 * Demo marking was originally attached to each component, which repeated the
 * same sentence four times on a four-material answer. A warning repeated is a
 * warning ignored; it is a property of the ANSWER, so it is said once.
 */
export function answerNotices(a: FeasibilityAnswer): string[] {
  const n: string[] = [];
  if (a.isDemo) n.push("This uses a DEMO recipe, not your factory's data.");
  return n;
}

/* -------------------------------------------------------------------------- */
/* Layer 3 — why.                                                             */
/* -------------------------------------------------------------------------- */

export function reason(a: FeasibilityAnswer): string {
  if (a.verdict === "CANT_SAY") {
    return a.cantSayReason ?? "We don't have enough information to answer this.";
  }
  if (a.verdict === "YES") {
    return "Everything this product needs is already on the shelf.";
  }
  if (a.verdict === "AT_RISK") {
    return "What is on the shelf is not enough on its own, but orders already placed cover the difference — provided they arrive when expected.";
  }
  return "What is on the shelf, plus everything already on order, is not enough for what you want to produce.";
}

/** Layer 3, per material. */
export function reasonFor(c: ComponentResult): string {
  if (c.cantSayReason) return c.cantSayReason;
  const w = { whole: c.integerOnly };
  const need = fmtQty(c.requirement.value, c.stockUom, w);
  const have = fmtQty(c.available, c.stockUom, w);
  const coming = fmtQty(c.incoming, c.stockUom, w);
  const base = `You need ${need} of ${c.code}. You have ${have} on the shelf`;
  if (c.supply.length === 0) return `${base}, and nothing is on order.`;
  return `${base}, and ${coming} is on the way.`;
}

/* -------------------------------------------------------------------------- */
/* Formatting.                                                                */
/* -------------------------------------------------------------------------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function fmtDate(d: Date | null): string {
  if (!d) return "an unknown date";
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Every user-facing string this answer would produce, for the vocabulary test.
 * If a new sentence is added anywhere above and not surfaced here, the test that
 * guards the vocabulary silently stops covering it — so this function is part of
 * the contract, not a test helper.
 */
export function allUserFacingStrings(a: FeasibilityAnswer): string[] {
  const out: string[] = [headline(a), reason(a), ...answerNotices(a)];
  for (const m of missingLines(a)) {
    out.push(m.missing, ...(m.action ? [m.action] : []), ...m.warnings);
  }
  for (const c of a.components) {
    out.push(reasonFor(c), ...warningsFor(c));
    if (c.cantSayReason) out.push(c.cantSayReason);
  }
  out.push(...a.assumptions);
  return out.filter((s) => s.length > 0);
}
