# 09 — PART 2.2 LOCK: Mechanism 02 — Procurement Price Opportunity

> ## ✅ LOCKED — 2026-08-07
> **Authoritative statement of Part 2.2.** Supersedes `05-mechanism-02-purchase-price-WORKSHOP.md`, which is retained as the workshop record and deliberately not rewritten.
> **Governed by:** D-014 (16 financial-trust rules) · D-017 … D-032.
> **No code, no UI, no schemas, no formulas implemented. Part 2.3 not started.**

---

## 1. The mechanism

> **Procurement Price Opportunity** identifies a defensible opportunity where the factory paid more for an **equivalent procurement outcome** than an **available or contractually achievable alternative at the relevant time.**

**Accounting Purchase Price Variance is explicitly out of scope** and remains Finance's under D-008. The two describe the same PO line from different sides and must never be presented as competing figures.

---

## 2. The finding model as locked

```
FINDING
├── OPPORTUNITY          ← the only class eligible to contribute to Potential
│                          Annual Saving. Carries the D-011 lifecycle:
│                          POTENTIAL → APPROVED → IN_PROGRESS → REALIZED
│                          Evidence strength is an ATTRIBUTE, never a state (D-026)
│
├── OBSERVED COST        ← historical ACTUAL financial fact.
│                          No lifecycle. Observation state only. No mitigation.
│
└── EXPOSURE / RISK      ← forward-looking FORECAST / ESTIMATED condition.
                           No lifecycle. May carry mitigation.
                           No intervention signature.

EVIDENCE GAP             ← OUTSIDE the Finding hierarchy entirely.
                           A statement about the completeness of our own data,
                           never about the factory's money. May carry observed
                           spend exposure as an ACTUAL fact — and that spend is
                           not itself an Evidence Gap value.
```

**Exposure is never approved and never realized.** A mitigation with a defensible counterfactual **becomes a new Opportunity**, and that Opportunity carries the signature and any avoided-cost claim. Direction changes **supersede**; a materialised exposure is **preserved** and creates a **linked `OBSERVED COST`**. `ACTUAL` cost and `FORECAST` exposure are **never mixed in an aggregate**.

---

## 3. The linked-finding relationship

```
OPPORTUNITY
    ├── CREATES ──▶  EXPOSURE / RISK    introduces a new exposure
    └── DEEPENS ──▶  EXPOSURE / RISK    worsens an existing exposure

OPPORTUNITY      ──creates 0..n──▶ · ──deepens 0..n──▶  EXPOSURE / RISK
EXPOSURE / RISK  ──has 0..1 creating · 0..n deepening Opportunities
```

Distinct types. **`DEEPENS` is never counted as `CREATES`.** Both are **factual relationships, not financial valuations** — no probability, percentage, threshold or monetary value is assigned, and neither is ever silently netted. Disclosure to the reviewer is **mandatory**.

The Exposure record is **not created until the intervention is actioned**; before that the prospective consequence is an attribute of the Opportunity's disclosure.

---

## 4. Quantification — the four preconditions

Per D-027, quantification is **event-level and counterfactual**, never a percentage over a total:

1. **Stated intervention** — specific enough to be tested
2. **Testable counterfactual** — assessed event by event against recorded evidence
3. **Reliable incremental-cost inputs** — no invented defaults (D-023)
4. **FX normalisation** where any component is foreign-denominated (D-024)

### The evidence model — three gates, then confidence

```
EVIDENCE CLASS      → does an alternative EXIST?
COMPARABILITY       → is it EQUIVALENT?
FACTUAL CONDITIONS  → is it COMPUTABLE?
       ↓  all three are GATES → eligibility
CONFIDENCE          → computed separately, from observed coverage (D-014 rule 15)
```

**Gates are pass / fail / unestablished. They are never averaged and never become scores.** No evidence label may become a confidence constant.

> **An unestablished dimension is not a pass.** An unrecorded incoterm makes comparability *unestablished*, not *equivalent*. Treating unknown as equivalent is the likeliest route to a manufactured saving, and it would present as a data bug rather than a financial one.

Eligibility maps onto D-019's ladder: existence fails → **no opportunity at all** · existence passes, equivalence not established → **opportunity detected, no currency** · all gates pass → **eligible for currency quantification**.

**Comparability dimensions:** specification and grade · incoterm · **payment and financing conditions** · quantity · supplier eligibility · timing · landed-cost basis.

**Payment and financing conditions — exclusion is the default.** Where conditions differ materially and no approved Finance model can normalise them without false precision, the alternatives are **non-equivalent** and no saving is quantified. A Finance-owned, effective-dated model may arrive later; **it is not required for this mechanism's honest operation.**

---

## 5. The boundary

> **The mechanism boundary is whether the counterfactual changes the quantity purchased over the relevant defined window** — never supplier terminology such as "price break".

| Case | Mechanism |
|---|---|
| Same quantity + better defensible price | **Mechanism 02** |
| Changed quantity | Quantity / inventory economics |
| Contract or price condition not applied at unchanged quantity | **Mechanism 02** |
| Quantity-driven price advantage | May **compose**, with the two economic effects kept distinguishable |

> **Boundary determines mechanism; gates determine quantifiability.** The boundary alone never licenses a claim.

**Consolidation, as redistributed (D-032):** supplier consolidation → **Mechanism 02**, landed-cost comparability required, may create a concentration exposure · temporal consolidation → **future quantity mechanism** · **shipment consolidation → future-domain gap, not a mechanism.**

---

## 6. Market movement and exposure

**A market-driven price increase alone is not a saving opportunity.** The classification trigger is **the absence of a defensible alternative at the relevant time** — market movement is the common instance, not the test.

Where no defensible alternative existed: `OBSERVED COST` if already incurred, `EXPOSURE / RISK` if forward-looking. **Never Potential Annual Saving.**

Systemic movement offers **no per-item alternative**, so it is honestly **one finding about a cause**, not thousands about items.

---

## 7. Deduplication and contradiction — two separate controls

| | Double counting (D-020) | Contradiction (D-029) |
|---|---|---|
| Question | Same money twice? | Can both actions be taken? |
| Failure | Headline inflates | Recommendations unexecutable |
| Visibility | **Invisible unless audited** | **Immediately visible** |

Every Opportunity declares an **intervention signature** — typed subject · affected dimensions · direction per dimension · effect window. Conflict requires **all four to intersect**. Exposure carries no signature.

**Emergency-purchase lines are excluded from this mechanism** (D-020) — the price difference is explained by urgency, not sourcing.

---

## 8. Adjudication

```
SYSTEM   → detects candidate comparable opportunity
BUYER    → provides context, confirms or rejects comparability
REVIEWER → adjudicates where required
SYSTEM   → calculates only from approved evidence
```

**Independence scales with the claim.** Detection needs the buyer's context; **currency quantification needs an adjudicator independent of the price decision.** This states a *property the adjudicator must have*, not a role that must exist.

Where no independent adjudicator exists, **self-adjudication is permitted with the conflict recorded as a factual condition affecting evidence strength** — permitted by rule 15 because it is a fact about the evidence, not an invented constant. It must be **represented, never hidden.** Authority is **role-based and configurable**.

---

## 9. When evidence is insufficient

The mechanism **remains valid**. Currency quantification is unavailable; the system identifies the missing evidence and may recommend improving capture — as an **`EVIDENCE GAP`**, outside the Finding hierarchy, carrying **no opportunity value**.

**Capture requests are prioritised by observed spend** — a fact we can see — never by suspected opportunity, which we cannot.

The mechanism may therefore initially operate as an **evidence-capture project rather than a quantified saving engine.**

---

## 10. Locked — the complete list

| # | Locked |
|---|---|
| 1 | Scope is **Procurement Price Opportunity**; accounting PPV stays with Finance |
| 2 | Findings separated by class; only `OPPORTUNITY` is saving-eligible; `EVIDENCE GAP` outside the hierarchy |
| 3 | Exposure never approved, never realized; mitigation with a counterfactual becomes an Opportunity |
| 4 | Direction changes supersede; materialisation preserves and links |
| 5 | `ACTUAL` cost and `FORECAST` exposure never mixed |
| 6 | `CREATES` and `DEEPENS` distinct; `DEEPENS` never counted as `CREATES`; neither valued |
| 7 | Evidence class, comparability, factual conditions and confidence remain separate; gates are not scores |
| 8 | Unestablished is never a pass |
| 9 | Payment and financing conditions: **exclusion-first** |
| 10 | Market movement alone is never a saving; trigger is absence of a defensible alternative |
| 11 | Boundary = counterfactual's effect on quantity over the window; **boundary determines mechanism, gates determine quantifiability** |
| 12 | §4.5 retired and redistributed; **no shipment-consolidation mechanism created** |
| 13 | Deduplication and contradiction are separate controls; every Opportunity declares a signature |
| 14 | Adjudication independence scales with the claim; self-adjudication is disclosed, never hidden |
| 15 | Insufficient evidence yields an Evidence Gap, not a fabricated figure |
| 16 | **No probability, percentage, threshold, confidence constant or invented monetary value anywhere in this mechanism** |

## 11. Must not be implemented

No detector, formula, schema or UI · no avoidability weights in any form · no default carrying-cost or ordering-cost rate · no annualisation below the D-019 / rule 11 bar · no aggregation of non-Opportunity findings into Potential Annual Saving · no cross-period comparison without FX normalisation · no verified-realization claim before the evidence bar · **no monetary value on `CREATES` or `DEEPENS`** · **no shipment-consolidation mechanism.**

---

## 12. Factory-data dependencies — the mechanism is not buildable until these are answered

**Gating:** `F-12` are quotations recorded with dates and terms, including declined ones? · `F-13` do purchase contracts exist in structured form? — **without these there is no counterfactual.**

**Comparability gates:** `F-15` incoterms · `F-16` payment terms · `F-19` duty and clearing per PO line · `F-21` specification and grade · `F-20` approved-supplier status.

**Financial inputs:** `F-08` carrying-cost basis · `F-22` effective-dated cost-of-funds rate · `F-31` ordering cost · `F-07` FX source and policy.

**Other:** `F-11` who sets prices · `F-14` invoice vs PO price · `F-17` historical price lists · `F-18` Finance's accounting PPV · `F-23` LC and advance payment · `F-24`/`F-25` adjudicator independence and capacity · `F-26` price-break structures · `F-27` substitute items · `F-28` volume rebates · `F-29` crystallised vs open exposure · `F-30` penalty clauses · `F-32` shipment-to-PO linkage.

---

## 13. Open questions carried forward — none blocking

| ID | Carried |
|---|---|
| `Q-07` | Saving-model categories 4.1–4.7 still describe percentage-over-total calculations and must each be re-expressed under D-027. **Growing debt** — each new mechanism widens the gap |
| `Q-08` | F10 decomposition **engine** deferred pending a second validated mechanism |
| `W-01` … `W-08` | Workshop questions from the mechanism-02 design |
| `W-09` … `W-14` | Evidence-model and exposure-materiality refinements |
| `W-17`, `W-20`, `W-23`, `W-24`, `W-31`, `W-32` | Structural refinements |
| `W-36`, `W-43`, `W-44` | Commitment-risk ownership, shipment consolidation, ordering-cost ownership |
| **Future-domain gaps** | **Shipment consolidation** · **logistics-cost domain** — preserved, unowned, deliberately not built |
