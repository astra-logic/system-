/**
 * THE TRANSLATION BOUNDARY — engine vocabulary → the words a manager uses.
 * Interface Contract Law 2, and the companion to lib/ui/format.ts.
 *
 * ⚠ WHY THIS EXISTS RATHER THAN A REWRITE OF THE ENGINE
 *
 *   The engine writes prose that is precise and auditable, and it cites the
 *   decision that governs each claim — "…not that the past repeats (D-046)".
 *   That citation is correct and load-bearing for an auditor. It is also
 *   meaningless to the factory manager the product is for, and `D-046` is
 *   exactly what the vocabulary guard bans.
 *
 *   Both readers are real. So the engine keeps its language, the database keeps
 *   the verbatim string, and the UI translates on the way out. Nothing upstream
 *   of this module changes.
 *
 * ⚠ WHAT THIS MODULE MAY AND MAY NOT DO
 *
 *   MAY   remove an internal reference the user cannot act on.
 *   MAY   substitute a code token for the English it stands for.
 *   MAY NOT soften, hedge, strengthen or drop a claim. A limitation that says
 *         a figure is optimistic must still say so after translation.
 *
 *   Every substitution below is therefore one-for-one and meaning-preserving.
 *   Where no faithful translation exists, the correct answer is to NOT render
 *   the string — not to paraphrase it into something vaguer.
 */

/* -------------------------------------------------------------------------- */
/* Where a number came from                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The eight basis values, in the words a person would use.
 *
 * ⚠ These are not quality grades and must never be ranked or scored. They say
 * where a number came from, which is a different question from how good it is.
 */
const BASIS: Record<string, string> = {
  ACTUAL: "measured",
  CALCULATED: "worked out from measured records",
  USER_DEFINED: "entered by hand",
  ESTIMATED: "estimated",
  ASSUMED: "assumed",
  DERIVED: "derived from other figures",
  IMPORTED: "taken from an imported file",
  INSUFFICIENT_DATA: "not established",
};

export const basisWord = (b: string | null | undefined): string =>
  (b && BASIS[b]) ?? "not recorded";

/** What kind of record a figure was read from. */
const EVIDENCE_KIND: Record<string, string> = {
  fx_rate: "an exchange rate",
  cost_reference: "a cost you entered",
  ledger_issues: "your stock movements",
  po_line: "a purchase order",
  receipt: "a delivery receipt",
  expedite_event: "a rush-shipping charge",
  movement: "a stock movement",
  item: "an item record",
  supplier_terms: "a supplier's terms",
};

export const evidenceKind = (k: string): string =>
  EVIDENCE_KIND[k] ?? k.replace(/_/g, " ");

/* -------------------------------------------------------------------------- */
/* Where a saving stands                                                      */
/* -------------------------------------------------------------------------- */

const STATE: Record<string, string> = {
  POTENTIAL: "Waiting for your decision",
  APPROVED: "You said yes to this",
  REJECTED: "You said no to this",
  IN_PROGRESS: "Being acted on",
  REALIZED: "Confirmed as saved",
  EXPIRED: "No longer current",
};

export const stateWord = (lifecycle: string): string => STATE[lifecycle] ?? "Not recorded";

/**
 * Whether this saving is allowed into the yearly figure, in one sentence.
 *
 * ⚠ Not a confidence score. It reports which side of a structural boundary the
 * saving sits on — a saving either cleared every gate or it did not.
 */
export const countsTowardYear = (ladder: string): boolean => ladder === "ANNUALIZATION_ELIGIBLE";

export const ladderWord = (ladder: string): string =>
  ladder === "ANNUALIZATION_ELIGIBLE"
    ? "Counted in the yearly figure"
    : ladder === "VERIFIED_REALIZATION"
      ? "Checked against what actually happened afterwards"
      : "Found, but not yet solid enough to count";

/* -------------------------------------------------------------------------- */
/* Engine prose                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Internal citations, removed. `(D-046)`, `(D-012, D-033)`, `(F-09)`, `(N-09)`
 * and the bare trailing forms all name a document the user has no access to.
 * Removing the pointer leaves the claim itself untouched.
 */
const CITATION = /\s*\((?:[DFNAQWPU]-\d{2,3}(?:\s*,\s*[DFNAQWPU]-\d{2,3})*)\)/g;

/**
 * Code tokens that appear INSIDE otherwise-plain engine sentences, and the
 * English each one stands for. Longest first, so a compound never gets eaten
 * by its own prefix.
 */
const TOKENS: readonly (readonly [RegExp, string])[] = [
  [/\bSHRINKAGE_FUTURE\b/g, "stock going missing in future"],
  [/\bINVENTORY_TAX\b/g, "tax on stock held"],
  [/\bINCORRECT_LEAD_TIME\b/g, "a delivery time that was wrong"],
  [/\bOBSOLESCENCE\b/g, "stock becoming unusable"],
  [/\bOBSOLETE\b/g, "unusable"],
  [/\bHANDLING\b/g, "handling"],
  [/\bINSURANCE\b/g, "insurance"],
  [/\bCAPITAL\b/g, "money tied up"],
  [/\bSPACE\b/g, "storage space"],
  [/\bACTUAL\b/g, "measured"],
  [/\bCALCULATED\b/g, "worked out"],
  [/\bUSER_DEFINED\b/g, "entered by hand"],
  [/\bESTIMATED\b/g, "estimated"],
  [/\bASSUMED\b/g, "assumed"],
];

/**
 * Jargon the engine uses correctly and the product may not. Each replacement
 * says the same thing in the register the interface speaks.
 */
const JARGON: readonly (readonly [RegExp, string])[] = [
  [/\bannualisation window\b/gi, "twelve-month window"],
  [/\bannualised\b/gi, "stated as a yearly figure"],
  [/\bannualise[sd]?\b/gi, "state as a yearly figure"],
  [/\bannual only on the claim\b/gi, "yearly only on the claim"],
  [/\bcarrying costs?\b/gi, "cost of holding stock"],
  [/\bexpedite premiums?\b/gi, "rush-delivery charge"],
  /* ⚠ `(s)` is absorbed, not left behind. The engine writes "4 expedite
     event(s)"; a replacement that ignores the suffix produced the nonsense
     "4 rush-shipping charges(s)". */
  [/\bexpedite events?(\(s\))?/gi, "rush-delivery charge(s)"],
  [/\bexpediting\b/gi, "paying to rush it"],
  [/\bcounterfactual\b/gi, "what would have happened instead"],
  [/\bissue movements?(\(s\))?/gi, "withdrawal(s) from stock"],
  /* No leading article: the engine's own sentences already supply one, and
     "the master lead time" must not become "the the delivery time…". */
  [/\bmaster lead time\b/gi, "recorded delivery time"],
  [/\bmaster value\b/gi, "recorded delivery time"],
  [/\bobserved lead time\b/gi, "delivery time we actually saw"],
  [/\bnetted\b/gi, "subtracted"],
  [/\bthe ledger\b/gi, "your recorded movements"],
  [/\bledger adjustments?\b/gi, "a correction to your records"],
  [/\bstaleness threshold\b/gi, "age limit"],
  [/\broot causes? classified\b/gi, "reason identified"],
  [/\broot cause\b/gi, "reason"],
  [/\bprojections?\b/gi, "prediction"],
  [/\bevidence gaps?\b/gi, "missing record"],
  [/\breconciliation\b/gi, "cross-check"],
  [/\breconciles?\b/gi, "agrees with"],
  [/\bwell-formedness\b/gi, "whether the row made sense"],
  [/\bwell-formed\b/gi, "sensible"],

  /* ⚠ The gap records name the engine's own machinery — "Mechanism 01 — the
     lead-time-correction slice entirely". The vocabulary guard's enum pattern
     never fired on these because the engine spells them in prose, which is
     exactly how internal architecture reaches a user unnoticed. Translated
     longest-first so the specific phrasing wins over the bare noun. */
  [/\bMechanism 0?1 — the lead-time-correction slice entirely\b/gi, "what a wrong delivery time is costing you"],
  [/\bMechanism 0?1 — currency quantification \(detection is unaffected\)/gi,
   "how much those charges came to in money — we can still spot them, we just can't price them"],
  [/\bMechanism 0?\d+\b/g, "one of the things we look for"],
  [/\bmaster[- ]data lead time\b/gi, "the delivery time on the item record"],
  [/\bis not maintained\b/gi, "is not filled in"],
  [/\brecorded separably per shipment and attributable to PO lines\b/gi,
   "recorded per shipment and linked to the order it belongs to"],
  [/\bFreight\/rush-delivery charge\b/gi, "The extra paid for freight or to rush a delivery"],
  [/\bdemand model\b/gi, "prediction of future use"],
  // Emphasis-by-shouting is engine style, not product style.
  [/\bOBSERVED\b/g, "observed"],
  [/\bEXCLUDES\b/g, "excludes"],
  [/\bACTUALLY\b/g, "actually"],
];

/**
 * The checks the engine runs, named for what they mean rather than for the
 * constant that identifies them. A mechanical de-underscoring produced
 * "fx normalisable", which is not English.
 */
const GATE: Record<string, string> = {
  EXPEDITE_EVENTS_IDENTIFIED: "We found the rush-delivery charges",
  ROOT_CAUSE_CLASSIFIED: "We know why each one happened",
  MASTER_LEAD_TIME_PRESENT: "A delivery time is on record to compare against",
  COUNTERFACTUAL_TESTABLE: "We can test whether fixing it would have helped",
  PREMIUM_SEPARABLE: "The extra cost can be separated from the price",
  FX_NORMALISABLE: "The foreign-currency amounts convert cleanly",
  OFFSET_DETERMINABLE: "The cost of the fix can be worked out",
};

export const gateWord = (gate: string): string =>
  GATE[gate] ?? plain(gate.replace(/_/g, " ").toLowerCase());

/** A bare `2027-01-01` inside engine prose, rewritten the way the product writes dates. */
const ISO = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Engine prose, made readable — citations dropped, tokens and jargon replaced.
 *
 * ⚠ This does NOT guarantee a clean string. It is a translator, not a filter:
 * `scripts/vocab-scan.ts` remains the authority, and a sentence it still flags
 * after translation must be dropped from the interface rather than fudged here.
 */
export function plain(s: string): string {
  let out = s.replace(CITATION, "");
  for (const [re, word] of TOKENS) out = out.replace(re, word);
  for (const [re, word] of JARGON) out = out.replace(re, word);
  out = out.replace(ISO, (_m, y, mo, d) => `${Number(d)} ${MONTH[Number(mo) - 1]} ${y}`);

  return out
    // A replacement can meet the article the engine already wrote.
    .replace(/\b(the|a|an) (the|a|an) \b/gi, "$1 ")
    // A citation removed mid-sentence leaves " ." or a doubled space behind.
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * `plain`, then capitalised — for the places engine prose is used as a title.
 *
 * A translation can move a lowercase word to the front ("master-data lead time
 * is not maintained" → "the delivery time on the item record is not filled
 * in"), which reads as a typo at the head of a row.
 */
export const sentence = (s: string): string => {
  const t = plain(s);
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/**
 * `plain`, applied to a list — translated, emptied entries dropped, and
 * DE-DUPLICATED.
 *
 * ⚠ The de-duplication is not cosmetic. Several envelopes legitimately carry
 * the same limitation, so gathering them into one list printed the same caveat
 * twice in a row — which reads as a bug and teaches the reader to skim the
 * section that most deserves reading.
 */
export const plainAll = (xs: readonly string[] | null | undefined): string[] =>
  [...new Set((xs ?? []).map(plain).filter((s) => s.length > 0))];
