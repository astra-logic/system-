# 04 — Saving Mechanism 01: Expedited Freight / Emergency Purchase Premium

> **Status:** Part 2.1 — reconciled against the decision lock of 2026-08-07. **No code, no formulas implemented, no schema, no UI.**
> **Task source:** `docs/02-handoff-part1-locked.md`, Part 2.1 decision lock
> **Governed by:** the 16 locked financial-trust rules (D-014) and decisions D-017 … D-024
> **Labels:** `LOCKED` · `PROPOSED` (recommended, not accepted) · `UNKNOWN` · `REQUIRES_FACTORY_DATA` · `INSUFFICIENT_DATA`

This is the first saving mechanism because it measures **money that was actually spent**. Its evidence is a document the factory already possesses, and its core case needs no assumed rate. If any mechanism can be made defensible, this is the one.

---

## 0. What changed in this revision, and why

The Part 2.1 lock changed the mechanism's shape in one fundamental way and several important ones.

### The fundamental change: quantification moved

Draft 1 proposed:

> ~~Avoidable premium = Σ (event premium × avoidability weight for its root cause)~~

**This is rejected, and it was wrong.** It conflicted with an already-locked rule: D-014 rule 15 requires confidence to derive from evidence and data coverage, **never from category constants** — and an avoidability weight is exactly a category constant. Draft 1 introduced false precision through the back door, dressed as a formula. A weight of 0.8 on "wrong lead time" looks rigorous and is invented.

The replacement is structurally different, not merely more cautious:

> **Quantification moves from the category level to the intervention level.**

You cannot defensibly say *"80% of wrong-lead-time premium is recoverable."* You can defensibly say *"if the lead time for item X were corrected from 18 to 32 days, these four specific events in the last 12 months would not have been triggered, and here is what they cost."* The second is a **countable counterfactual over identified events**. The first is a guess with a decimal point.

This is why the three-state ladder in §7 matters so much: it lets the system say *"there is an opportunity here"* long before — and sometimes instead of — saying *"here is the money."*

### The other changes

| Area | Draft 1 | Now |
|---|---|---|
| Avoidability | Numeric weights per cause | Categorical classes; no weights (D-017) |
| Root cause | Recommended workflow capture | `LOCKED` with defined categories (D-018) |
| Event count | Proposed a minimum count | No universal minimum; three-state ladder (D-019) |
| Deduplication | One currency claim per PO line | At **economic-mechanism** level; genuinely independent effects may both be quantified (D-020) |
| Customs | Flagged as a question | Valid candidate; uncontrollable cost becomes `COST / EXPOSURE / RISK`, not a saving (D-021) |
| Realization | 6–12 months, `UNKNOWN` | 12 months default, with an early-evidence state (D-022) |
| Carrying cost | Flagged dependency | Finance-owned; **no developer defaults**, ever (D-023) |
| FX | Recommended normalisation | Tier 1, with four-way change decomposition (D-024) |

---

## 1. What economic mechanism are we measuring?

**The premium paid to compress time.** `LOCKED`

When material is needed sooner than the normal supply process delivers, the factory buys speed:

- **Freight premium** — a faster mode than standard for that lane (air instead of sea, courier instead of road, dedicated instead of consolidated).
- **Emergency purchase premium** — a non-preferred source, a smaller quantity, or spot price, because the preferred source cannot deliver in time.
- **Other incremental cost** — demurrage, detention, storage, clearance expediting (see §6).

Per D-020 these are **separate economic mechanisms**, not one blended figure.

### The framing that governs everything else `LOCKED`

> **The premium is not the waste. It is a symptom with a price tag attached.**

The chain is:

```
Root condition          →  Shortage risk  →  Expedite decision  →  Premium paid
```

Paying was very often the *correct* decision at the moment it was made — the alternative was a line stoppage costing more.

**The saving is never "reduce expedited freight."** It is:

> Identify the avoidable economic premium created by the underlying operational cause, quantify it only when defensible, recommend an intervention, and later test whether the intervention actually produced the expected financial effect.

**The system must never shame the procurement team, and must never treat every expedite as waste.** A product that tells a procurement manager they wasted 400,000 EGP on air freight will be dismissed, correctly, because they know each decision was defensible at the time. One that says *"260,000 of it traces to four items whose lead times are wrong in your master data"* is telling them something true, specific, and fixable.

The eight questions the mechanism exists to answer, in order:

```
WHY DID THIS COST OCCUR?
WAS THE CAUSE AVOIDABLE?
WHAT WOULD HAVE BEEN DIFFERENT?
WHAT ACTION CAN PREVENT RECURRENCE?
WHAT COST WOULD THAT ACTION CREATE?
WHAT IS THE NET FINANCIAL OPPORTUNITY?
CAN WE DEFEND THE NUMBER?
DID THE SAVING ACTUALLY HAPPEN?
```

---

## 2. What data is required?

### Per expedite event

| Data | Notes |
|---|---|
| PO and PO line reference | Anchor for attribution and deduplication |
| Item, quantity | |
| **Freight cost paid, separable from material cost** | The gate — see below |
| **Mode actually used** | Air / sea / road / courier / dedicated |
| **Standard mode for that item, supplier, lane** | Baseline input |
| Unit price paid vs preferred-source price at the time | Emergency *purchase* premium |
| Date ordered · required · received | |
| Standard lead time in master data, and observed actual | The comparison that drives the strongest case |
| Expedite authorisation — who, when | |
| **Root cause category** | See §3. Captured in workflow, not reconstructed. |
| Currency of each cost component, and rate date | Required for D-024 |

### The gating question

`REQUIRES_FACTORY_DATA` — **Does the factory record freight cost separably, per shipment, attributable to PO lines?**

Binary for this mechanism:

- **Yes** → `ACTUAL`-based cost figures; strongest category in the taxonomy.
- **No** → **event counts without currency values.** Still useful ("11 expedited shipments last quarter, 7 on the same three items") but contributes nothing to Potential Annual Saving until capture exists.

No honest middle path. Estimating freight from an average when the invoice never separated it manufactures the number.

### Allocation

`PROPOSED` — where a shipment carries multiple PO lines and only some were urgent, premium attributes to **the lines that drove the mode decision**, not spread by weight or value. Spreading dilutes signal and misattributes cause.
`UNKNOWN` — how the driving line is identified. Likely requires capture at decision time.

---

## 3. Root-cause capture `LOCKED` (D-018)

**Root cause is captured as part of the operational workflow, not reconstructed months later.**

```
Emergency / Expedite Event
→ Why did this happen?
→ Root Cause Category  (structured)
→ Optional explanation
→ Submit
```

### Locked categories

| Category | Notes |
|---|---|
| Supplier delay | |
| Incorrect lead time | The highest-value cause — see §8 |
| Late PO release | |
| Unexpected demand | |
| Production change | See limitation below |
| Stock policy issue | |
| Material master issue | |
| Logistics / customs issue | Feeds §6 |
| Other | **Requires additional explanation** |

Structured categories, not free text. **The purpose is not bureaucracy** — it is to create the causal data that turns a cost history into an actionable opportunity. Without it, this mechanism produces a total, not an opportunity.

### Two things to raise

**Quality rejection is not in the locked list.** Draft 1 identified "quality rejection forced a re-buy" as a distinct cause with a distinct owner and action. It could fall under *Supplier delay* or *Other*, but neither routes to the right action. `PROPOSED` — add it, or confirm it belongs under *Supplier delay*. Recorded as `Q-01`.

**"Production change" is capturable but not analysable in release 1.** Production is out of scope (D-007) — there are no manufacturing orders, no production calendar, no schedule history. The category can be *recorded*, and that is worth doing so the history exists later. But the system cannot verify, explain or quantify a production-driven cause in release 1. **This limit must be visible in the product**, not discovered by a user. Recorded as a known limitation, not a gap to be quietly filled.

`REQUIRES_FACTORY_DATA` — whether buyers will classify reliably. If coverage is low, the mechanism degrades to event counting. Coverage is measured and feeds confidence (§9).

---

## 4. Avoidability `LOCKED` (D-017)

**Categorical classification from evidence. No numerical weights.**

| Class | Includes |
|---|---|
| **HIGH** — potentially highly avoidable | Incorrect lead-time master data · planning / master-data errors · late PO release · controllable supplier issues · controllable internal process failures |
| **LOW** — uncertain avoidability | Genuine demand spike · legitimate emergency production requirement |
| **NOT AVOIDABLE** — normally excluded | Force majeure · genuinely uncontrollable external events |
| **UNKNOWN** | Insufficient evidence |

### The rule that prevents the obvious error `LOCKED`

> **HIGH avoidability does NOT mean 100% saving.**

The system must hold two things apart at all times:

```
OPPORTUNITY IDENTIFIED
    ≠
FINANCIAL SAVING THAT CAN BE SAFELY QUANTIFIED
```

A HIGH-avoidability cluster is a *place to look*. It is not a number. Turning a classification into currency requires §5.

**No numerical avoidability weights are to be invented unless evidence later supports them.** If evidence ever does support a rate, it will come from observed realization across many verified interventions — measured, not assigned.

---

## 5. From classification to a defensible number

This section replaces draft 1's rejected weighting formula.

`PROPOSED` — quantification requires **all four** of the following. Any one missing → the opportunity remains detected but unquantified.

**1. A specific intervention.** Not "improve planning" but "correct item X's lead time from 18 to 32 days." An intervention that cannot be stated precisely cannot be tested.

**2. A defensible counterfactual over identified events.** For each historical event, a testable claim: *would this event have occurred if the intervention had been in place?* This is answered **event by event against recorded evidence**, never by applying a percentage to a total.

> *Illustration of the form such a test takes, not a rule to adopt:* where master-data lead time is 18 days and observed actual is consistently 32, an expedite whose timing shortfall was within that 14-day gap is a candidate for "would not have occurred." `PROPOSED` — the exact test needs validation against real events before it is trusted. `Q-02`.

**3. Reliable cost inputs for the incremental cost of the intervention.** See §8. If the intervention requires more stock and the carrying-cost rate is unavailable, the **net** figure is not calculable (D-023).

**4. FX-normalised comparison** where any component is foreign-denominated (D-024).

### What the system may output at each level of evidence

| Evidence available | Output | Basis |
|---|---|---|
| Events + separable cost, no root cause | Cost breakdown by item/supplier. **No opportunity.** | `ACTUAL` |
| + root cause classified | Premium grouped by cause and avoidability class. **Opportunity detected.** | `ACTUAL` for the cost; classification is evidence, not estimate |
| + specific intervention + defensible counterfactual | Gross avoidable premium over identified events | `CALCULATED` |
| + reliable incremental-cost inputs | **Net potential benefit** | `CALCULATED`, or `ASSUMED` if any input is assumed |
| + 12 months usable history and sufficient repetition | **Annualization eligible** | Per §7 |
| Any required input missing | `INSUFFICIENT_DATA` — never zero, never a partial figure presented as whole | — |

---

## 6. Customs demurrage, detention and clearance cost `LOCKED` (D-021)

Valid candidates for the taxonomy. **Not automatically saving.**

Root cause is classified, for example: customs delay · documentation delay · supplier delay · internal clearance delay · warehouse readiness · port congestion · external uncontrollable event · unknown.

### The new output class

Where causality and avoidability are **not** sufficiently defensible — port congestion, external events — the amount is presented as:

```
COST / EXPOSURE / RISK          not          SAVING OPPORTUNITY
```

This is a genuine addition to the product's vocabulary and it is valuable. It lets the system be **useful about money it cannot claim**. A plant manager benefits from *"you spent 340,000 EGP on demurrage last year, 60% of it from port congestion we cannot control and 40% from documentation delays we can"* — the first half is exposure to manage, the second half is an opportunity.

**Binding consequence:** `COST / EXPOSURE / RISK` amounts **never aggregate into Potential Annual Saving.** They are reported separately, and must be structurally incapable of leaking into the headline. See `Q-03` on whether this is a distinct object class rather than a status.

This generalises: it is the same posture already taken for stockout risk in `03-saving-opportunity-model.md` §4.9. The pattern is now consistent across the product.

`REQUIRES_FACTORY_DATA` — customs data structure and availability are **not assumed**. Whether demurrage invoices exist, whether they attach to a shipment, and whether cause is recoverable are all open (`F-02`, `F-06`).

---

## 7. Event count and annualization `LOCKED` (D-019)

**No universal minimum event count.** A single event may be enough to identify an opportunity. It is generally not enough to support a defensible recurring annual saving.

Three distinct states, held apart at all times:

```
OPPORTUNITY DETECTED
        ↓   (requires repeated evidence over an adequate history window)
ANNUALIZATION ELIGIBLE
        ↓   (requires observation, see §11)
VERIFIED REALIZATION
```

Worked example, per the lock:

```
1 qualifying event
→ Opportunity detected
→ Annual saving = INSUFFICIENT_DATA
```

Combined with D-014 rule 11 — 12 months of usable history as the preferred minimum for demand-based annualisation — the two are complementary, not competing: **rule 11 sets the time window; D-019 refuses to reduce sufficiency to a counted threshold.** Eligibility is assessed per case against evidence, not against a constant.

### The statement the product can always make honestly

Below annualization eligibility, a true and useful statement remains:

> *"Observed expedite premium, last 5 months: 180,000 EGP (ACTUAL). Not enough evidence to project an annual figure."*

Defensible, valuable to a procurement manager, and honest. **This must be a designed state, not an empty screen.**

`PROPOSED` — a single large event is never annualised into a recurring pattern regardless of history length. One customs seizure is not a yearly rate.

---

## 8. Net, not gross `LOCKED`

```
Gross avoidable premium
−  Required incremental cost of the intervention
=  Potential net financial benefit
```

**Only where the required inputs are sufficiently reliable.**

Most interventions work by **holding more stock** — raising a reorder point, adding safety stock, ordering earlier. That carries a recurring carrying cost and a one-time working-capital increase (which is a *negative*, not a saving). Claiming the full premium while ignoring the stock increase needed to achieve it overstates the benefit and, at worst, recommends an action that loses money.

This is the same discipline as D-014 rule 6 on order consolidation.

### The special case that makes this mechanism buildable `LOCKED`

> **Lead-time master-data correction may reduce future expedites without requiring additional inventory.**

Because the planning system was working from a false input. Correcting it makes existing policy behave as intended rather than demanding a larger buffer. Where the offset is genuinely zero or small:

- no dependence on the carrying-cost rate (`N-10`)
- no `ASSUMED` basis introduced by the offset
- cause, intervention, counterfactual and verification **all inside our own data**

This is why D-015 nominates it as the defensible first slice — and D-017 *strengthens* that choice, because it is also the case where a counterfactual can be tested event by event rather than assumed by weight.

---

## 9. Uncertainty and confidence

Per D-014 rule 15 — from evidence and data coverage, **never category constants**.

`PROPOSED` — confidence derives from measurable coverage:

| Input | Effect |
|---|---|
| % of expedite events with separable freight cost | Primary driver |
| % of events with root cause classified | Gates §4 and §5 entirely |
| Baseline quality (contracted rate / matched history / unmatched) | Comparison validity |
| Length of usable history | Per §7 and rule 11 |
| Repetition and consistency of the pattern | Not a counted threshold — see D-019 |
| FX normalisation quality | Per D-024 |
| Reliability of incremental-cost inputs | Per §8 and D-023 |

Output is a **range**, widened by whichever input is weakest.

**Basis reporting:** gross observed premium may be `ACTUAL`. A counterfactual-derived avoidable figure is `CALCULATED` where the counterfactual is defensible. The net figure inherits from the incremental-cost inputs — `ASSUMED` if the carrying-cost rate is assumed, and **that dependency must be visibly disclosed** (D-023). Per D-002 contagion, the headline contribution carries the weakest basis present.

**A number with weak evidence must look weaker.** The goal is not to maximise the displayed figure. It is to produce one that survives a Finance Manager, a Procurement Manager, a Plant Manager, or an external auditor.

---

## 10. Deduplication `LOCKED` (D-020)

**One economic benefit has one financial owner.** Deduplication happens at the **economic-mechanism level**, not merely at transaction level.

- Genuinely **independent** effects may both be quantified.
- Where one effect is a **component or consequence** of another, deduplicate.
- **The system must be able to explain WHY an amount belongs to a particular mechanism.** Deduplication is not a silent filter; it is an explainable attribution.

### This corrects draft 1

Draft 1 proposed *"any PO line contributes to at most one currency claim."* Too blunt, and now amended in D-012. A single PO line can legitimately carry **two independent economic effects** — an air-freight premium (a logistics cost, owned by logistics, fixed by planning) and a spot-price premium on the same line (a procurement cost, owned by sourcing). Different mechanisms, different owners, different actions. Suppressing one would understate reality and misdirect the fix.

### Overlaps that remain real

| Overlap | Treatment |
|---|---|
| Emergency purchase premium vs purchase price variance | **Component relationship** — the price difference is explained by urgency, not by sourcing quality. Deduplicate; attribute to this mechanism, and explain why. |
| Expedite-driven reorder-point increase vs safety-stock capital release | **Same lever, opposite directions.** Evaluated as one combined netted opportunity for that item, never summed as two. |
| Freight capitalised into inventory value | If finance capitalises freight, premium is already inside stock value used elsewhere. See `F-04`. |
| Freight premium and purchase premium on one event | **Independent components of one event.** Both may be quantified, attributed to their own mechanisms, reported without double-claiming the same currency. |

---

## 11. Realization and verification `LOCKED` (D-022)

**Default verification window: 12 months.** Useful early evidence is not hidden.

| State | Meaning |
|---|---|
| **EARLY REALIZATION EVIDENCE** | Improvement is visible but not yet sufficiently verified for a full annual claim |
| **STRONG / VERIFIED REALIZATION** | Sufficient observation and evidence exist |

**The system must not claim a full verified annual saving merely because a cost dropped for a short period.**

**Baseline captured at `APPROVED`**, never reconstructed (D-011): trailing-12-month premium for the item/supplier, event count and cause distribution, planning parameters, purchase volume, lane rate reference where available, FX rates and dates.

### Confounders that must be considered `LOCKED`

Demand changes · volume changes · FX · freight-rate changes · supplier changes · seasonality · production changes · other operational changes.

> **A reduction in premium is evidence of improvement, not automatically proof of causation.**

`PROPOSED` mitigations, each partial and each declared: normalise by purchase volume; report lane rate movement alongside; FX-normalise per D-024; compare against unaffected items as a weak control.

`UNKNOWN` — whether a genuine control group is achievable. **Probably not.** The honest position is that realization here is *evidence-supported attribution*, not proof, and the product must say exactly that.

### One reconciliation issue to resolve

Core Mission §6 locks the opportunity lifecycle as `Potential → Approved → In Progress → Realized`, plus `Rejected` and `Expired`. **EARLY REALIZATION EVIDENCE must not silently become a seventh lifecycle state**, because that would extend a locked list.

`PROPOSED` — model it as an **evidence-strength attribute on `IN_PROGRESS`**, not a new state. The lifecycle stays locked; verification strength becomes a property of measurement. Flagged as `Q-04` for confirmation.

---

## 12. FX and change decomposition `LOCKED` (D-024)

**FX normalisation is a Tier-1 requirement for multi-currency financial comparison.** The factory is Egypt-based and may be import-dependent.

> **Do not interpret changes in EGP-denominated cost as purely operational when FX may explain part of the movement.**

Conceptual decomposition, where data allows:

```
Observed financial change
=  operational effect
+  price / rate effect
+  FX effect
+  volume / mix effect
```

**Do not pretend to calculate this decomposition when the required data is unavailable.** Where FX normalisation cannot be performed reliably, the conclusion is marked `INSUFFICIENT_DATA` / `ASSUMED` / `LIMITED_CONFIDENCE` — never presented with false precision.

### This is bigger than one mechanism

The decomposition applies to **every financial trend the product will ever show** — price variance, carrying cost, excess stock value, the headline figure itself. It is cross-cutting infrastructure, not a feature of mechanism 01.

`PROPOSED` — promote it to a cross-cutting foundation alongside F1–F9 in `01-factory-operating-model.md`, as **F10 — Financial change decomposition**. Flagged as `Q-05`.

`REQUIRES_FACTORY_DATA` — FX rate history, source, and finance's policy on which rate applies at which date (`F-07`).

---

## 13. Baseline for the premium calculation

`PROPOSED` — precedence ladder, first available wins:

1. **Contracted standard rate** for that lane and mode. Strongest.
2. **Trailing median actual cost** for the same item/supplier/lane at standard mode, matched period.
3. **Finance-provided standard freight rate.**
4. `CANNOT_CALCULATE`.

**A blanket average across all shipments is rejected.** Lanes, modes and periods differ.

Matching requirements, all mandatory: same lane or item · same period · same incoterm · FX-normalised (D-024).

For emergency purchase premium: baseline is **the preferred/contracted supplier's price at the time of the event** — not the lowest ever recorded, not today's.

---

## 14. Intervention definitions

The action is never "expedite less." It is cause-specific:

| Root cause | Intervention | Incremental cost | Quality |
|---|---|---|---|
| Incorrect lead time | Correct master-data lead time | Often **none** (§8) | **Best.** Testable counterfactual, self-verifiable. |
| Late PO release | Fix trigger or review cadence | Usually none | Good |
| Stock policy issue | Raise reorder point / safety stock | **Carrying cost — mandatory offset** | Good, but net depends on `N-10` |
| Supplier delay | Supplier conversation, dual-source, or buffer | Varies | Partial; needs supplier performance data (`A-12`) |
| Material master issue | Correct the master record | Usually none | Good |
| Logistics / customs issue | Documentation or clearance process | Varies | Partial; see §6 |
| Unexpected demand | **No opportunity created** | — | Honest refusal |
| Production change | **Capturable, not analysable in release 1** | — | Out of scope (D-007) |

`UNKNOWN` — owner of the opportunity. Buyer or procurement manager (`N-12`).

---

## 15. What is still unknown / requires factory evidence

Nothing in this section has been assumed anywhere else in this document.

### Requires factory data

| ID | What we need | Why it matters |
|---|---|---|
| `F-01` | **Actual freight invoice structure** — is freight cost separable, per shipment, attributable to PO lines? | **Gates the entire mechanism.** Without it: event counts, no currency. (= `N-07`) |
| `F-02` | **Customs / demurrage / detention data availability** — do these invoices exist, do they attach to a shipment? | May be the largest premium category in an import context. Structure is **not assumed**. |
| `F-03` | **Contracted standard freight rates by lane and mode** — do they exist in maintained form? | Determines whether the baseline is Tier A or falls to trailing median. |
| `F-04` | **Does finance capitalise freight into inventory value, or expense it?** | Creates a real double-count risk against excess-stock valuation. |
| `F-05` | **Root-cause capture feasibility** — will buyers classify reliably at the time of the event? | If coverage is low, the mechanism degrades to event counting. |
| `F-06` | **Actual PO ↔ expedite event relationship** — how is an expedite recognised today? Flag, mode field, reason code, or nothing at all? | Determines whether events can be identified without inference. |
| `F-07` | **FX rate history and source** — what rates, from where, with what effective dating? | Tier 1 per D-024. Without it, cross-period comparison is `INSUFFICIENT_DATA`. |
| `F-08` | **Finance's authoritative carrying-cost rate** — does it exist, who owns it, what provenance? | Any intervention requiring more stock. (= `N-10`) |
| `F-09` | **Master-data lead-time quality** — are recorded lead times maintained, and is actual receipt timing recorded well enough to compare? | The first slice (D-015) depends entirely on this. |
| `F-10` | **Volume and purchase history** — sufficient to normalise verification against demand changes? | §11 confounder handling. |

### Unknown / requires validation

| ID | Question |
|---|---|
| `Q-01` | Is *quality rejection* a distinct root-cause category, or does it belong under *Supplier delay*? |
| `Q-02` | What test makes a counterfactual "defensible" for quantification? The lead-time gap illustration in §5 is a form, not a validated rule. |
| `Q-03` | Is `COST / EXPOSURE / RISK` a distinct object class, or a status on the Saving Opportunity? **Recommend distinct class**, so it cannot leak into aggregation. |
| `Q-04` | Is `EARLY REALIZATION EVIDENCE` an attribute on `IN_PROGRESS`, or a lifecycle state? **Recommend attribute**, to avoid extending the locked Core Mission §6 lifecycle. |
| `Q-05` | Should four-way change decomposition become cross-cutting foundation **F10**? |
| `Q-06` | If lead-time correction is applied, does an intervention that reduces expedites also change planning behaviour in ways that create *other* costs not yet modelled? |

---

## 16. Part 2.1 Lock Status

### LOCKED — settled, not to be revisited without a new decision

| # | What |
|---|---|
| 1 | The premium is a symptom with a price tag; the saving is never "expedite less"; the system never shames the procurement team |
| 2 | Avoidability is **categorical** (HIGH / LOW / NOT AVOIDABLE / UNKNOWN). **No numerical weights.** HIGH ≠ 100% saving |
| 3 | "Opportunity identified" and "financial saving that can be safely quantified" are distinct and never conflated |
| 4 | Root cause is captured **in the operational workflow** via structured categories; *Other* requires explanation |
| 5 | **No universal minimum event count.** Three states: OPPORTUNITY DETECTED · ANNUALIZATION ELIGIBLE · VERIFIED REALIZATION |
| 6 | One event → opportunity detected, annual saving `INSUFFICIENT_DATA` |
| 7 | Deduplication at **economic-mechanism** level; genuinely independent effects may both be quantified; attribution must be explainable |
| 8 | Customs demurrage is a valid candidate; uncontrollable cost → `COST / EXPOSURE / RISK`, **never** aggregated into Potential Annual Saving |
| 9 | Realization window **12 months** default, with EARLY vs STRONG/VERIFIED evidence distinguished; confounders must be considered |
| 10 | A premium reduction is **evidence of improvement, not proof of causation** |
| 11 | Carrying-cost rate is **finance-owned**. **No hidden developer defaults.** Dependency on an assumed rate must be visibly disclosed |
| 12 | Financial model is **net, not gross** |
| 13 | Lead-time master-data correction is the special case that may require no additional inventory |
| 14 | **FX normalisation is Tier 1**; decomposition is not fabricated when data is unavailable |

### PROPOSED — recommended, awaiting acceptance

Baseline precedence ladder (§13) · premium allocation to the driving PO line (§2) · the four quantification preconditions (§5) · confidence coverage inputs (§9) · `COST/EXPOSURE/RISK` as a distinct class (`Q-03`) · `EARLY_EVIDENCE` as an attribute (`Q-04`) · F10 promotion (`Q-05`) · adding *quality rejection* as a category (`Q-01`) · single large events never annualised (§7).

### REQUIRES_FACTORY_DATA

`F-01` … `F-10` in §15. **`F-01` gates the mechanism's ability to produce currency at all.**

### INSUFFICIENT_DATA — cannot be stated today

- Any annual saving figure for this mechanism — no event history has been seen.
- Any net benefit figure — the carrying-cost rate is unknown (`F-08`).
- Any cross-period comparison — FX source and policy are unknown (`F-07`).
- Whether lead-time correction is viable as the first slice — depends on `F-09`.
- The relative size of customs cost versus freight premium — depends on `F-02`.

### MUST NOT BE IMPLEMENTED YET

- No detector, formula, schema, or UI for this mechanism.
- **No numerical avoidability weights**, in any form, anywhere.
- No default carrying-cost rate — not 15%, not 20%, not any value.
- No annualisation below the evidence bar in §7.
- No aggregation of `COST / EXPOSURE / RISK` into Potential Annual Saving.
- No cross-period financial comparison without FX normalisation.
- No verified-realization claim before the §11 evidence bar is met.

### Is Part 2.1 ready for final lock?

**The design is ready. The mechanism is not yet buildable, and that is a data problem rather than a design problem.**

Every business-judgment decision raised in the Part 2 workshop is now answered. What remains is factual: `F-01` through `F-10` are questions about the factory that cannot be reasoned into existence. `F-01` in particular determines whether this mechanism produces currency or only counts — and until it is answered, no honest estimate of this mechanism's value is possible.

`Q-03`, `Q-04` and `Q-05` are modelling choices that should be confirmed before Part 2.2, because all three affect shared structure rather than this mechanism alone.
