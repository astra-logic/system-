/**
 * THE PRODUCT-WIDE VOCABULARY GUARD.
 * Interface Contract Law 2.
 *
 * Block 9 built a working vocabulary guard and applied it to ONE page. Block 10
 * measured the result: `/produce` scored zero violations and the other six
 * pages scored 29 between them, including decision-register IDs printed on the
 * home screen.
 *
 * This module is that guard, generalised. It EXTENDS the feasibility lists
 * rather than copying them, so the two can never drift apart.
 *
 * ⚠ WHY THIS IS A TEST AND NOT A STYLE GUIDE
 *
 *     A vocabulary rule enforced by review drifts. A rule enforced by a runnable
 *     instrument does not.
 *
 *     `scripts/vocab-scan.ts` renders every route against a live server and
 *     reports the leak count per page, exiting non-zero when any route leaks —
 *     so it becomes a release gate the moment the last page reaches zero.
 *     `tests/vocabulary.test.ts` proves, without a server, that this guard
 *     catches what it claims to and does not fire on ordinary English.
 */
import { BANNED_IDENTIFIERS, BANNED_PHRASES } from "../feasibility/language";

/**
 * Jargon, matched case-insensitively. Extends the feasibility list with the
 * terms Block 10 found leaking on the other six pages.
 */
export const PRODUCT_BANNED_PHRASES: readonly string[] = [
  ...BANNED_PHRASES,
  "evidence partition",
  "confidence interval",
  "evidence gap",
  "ledger",
  "projection",
  "reconciliation",
  "well-formedness",
  "adjudicat",          // adjudicator / adjudication
  "counterfactual",
  "provenance",
  "supersede",
  "natural key",
  "finding",
  "opportunity class",
  "intervention signature",
  "root cause classified",
  "expedite premium",
  "carrying cost",
  "annualis",           // annualise / annualisation
  "annualiz",
];

/**
 * Internal identifiers, matched EXACTLY — these are code tokens rather than
 * English. Case-insensitive matching would flag the ordinary word "actual",
 * which is legitimate plain language when talking about weight.
 */
export const PRODUCT_BANNED_IDENTIFIERS: readonly string[] = [
  ...BANNED_IDENTIFIERS,
  "ACTUAL", "ESTIMATED", "ASSUMED", "STALE_DATA",
  "POTENTIAL", "APPROVED", "IN_PROGRESS", "REALIZED", "REJECTED", "EXPIRED",
  "ANNUALIZATION", "ELIGIBLE", "OPPORTUNITY_DETECTED", "VERIFIED_REALIZATION",
  "EXPEDITE_EVENTS_IDENTIFIED", "ROOT_CAUSE_CLASSIFIED", "MASTER_LEAD_TIME_PRESENT",
  "COUNTERFACTUAL_TESTABLE", "PREMIUM_SEPARABLE", "FX_NORMALISABLE", "OFFSET_DETERMINABLE",
  "UNESTABLISHED", "M01", "M02", "M03",
  /* Operational enums. These reach the user as status badges today and are
     database values, not words a person would choose: an order is "not arrived
     yet", not "SENT". */
  "SENT", "RECEIVED", "PARTIALLY_RECEIVED", "CANCELLED", "DRAFT",
  "FORECAST", "DEPARTED", "ARRIVED", "CUSTOMS", "PASS", "FAIL",
  "SEED", "ACCEPTED", "PROCESS_MATERIAL", "DISCRETE_GOOD",
];

/**
 * Patterns for whole families of internal reference. A single regex catches
 * every decision and factory-question ID, present and future — which a literal
 * list would not.
 */
export const BANNED_PATTERNS: readonly { readonly name: string; readonly re: RegExp }[] = [
  { name: "decision ID", re: /\bD-\d{3}\b/ },
  { name: "factory question", re: /\bF-\d{2}\b/ },
  { name: "open question", re: /\b[NAQWP]-\d{2}\b/ },
  { name: "mechanism enum", re: /\bM\d{2}_[A-Z_]+\b/ },
  { name: "screaming-case enum", re: /\b[A-Z][A-Z]{2,}(?:_[A-Z]+)+\b/ },
  { name: "raw UUID", re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/ },
  { name: "over-precise number", re: /\d+\.\d{5,}/ },
];

export interface Violation {
  readonly term: string;
  readonly kind: "phrase" | "identifier" | "pattern";
}

/**
 * Every violation in a string. One implementation, so the test and any future
 * surface apply the identical rule.
 */
export function scan(s: string): Violation[] {
  const hits: Violation[] = [];
  const lower = s.toLowerCase();

  for (const p of PRODUCT_BANNED_PHRASES) {
    const needle = p.toLowerCase();
    // Short terms match as whole words: "bom" must not fire inside "bombs".
    const found = needle.length <= 4
      ? new RegExp(`\\b${needle}\\b`, "i").test(s)
      : lower.includes(needle);
    if (found) hits.push({ term: p, kind: "phrase" });
  }
  for (const t of PRODUCT_BANNED_IDENTIFIERS) {
    if (new RegExp(`\\b${t}\\b`).test(s)) hits.push({ term: t, kind: "identifier" });
  }
  for (const { name, re } of BANNED_PATTERNS) {
    const m = s.match(re);
    if (m) hits.push({ term: `${name}: ${m[0]}`, kind: "pattern" });
  }
  return hits;
}

/**
 * Strip a rendered HTML document to the text a user actually reads.
 *
 * Script and style content is excluded because it is never read, and Next.js
 * serialises the whole component tree into a script tag — scanning that would
 * flag prop names rather than prose.
 */
export function visibleText(html: string): string {
  let h = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  h = h.replace(/<!--[\s\S]*?-->/g, " ");
  const body = h.split('<div class="wrap">').pop() ?? h;
  return body
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
