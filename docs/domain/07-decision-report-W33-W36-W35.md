# 07 — Formal Decision Report: W-33, W-36, W-35

> ## ⚠ DECISION REPORT — NOTHING HERE IS APPLIED
> **No locked decision has been amended.** D-025 stands exactly as locked.
> Recommendations await explicit approval. No lock document, no code, no UI, no schemas.
> **Date:** 2026-08-07

---

# 1. W-33 — Cost / Exposure / Risk architecture

## The framing correction that decides this report

The four alternatives were presented as competing. **Two of them are not alternatives — they are orthogonal axes.**

- **B** asks: *where do these objects sit **relative to Opportunity**?*
- **C** asks: *are Cost and Exposure/Risk **one thing or two**?*

You can have either without the other. The real option space is a 2×2:

| | **Stays inside `Opportunity`** | **Moves outside `Opportunity`** |
|---|---|---|
| **One combined class** | **A** — status quo | **B** |
| **Cost split from Exposure** | **C** | **D = B + C** |

Each axis fixes a *different* defect, and there are two defects:

| Defect | Fixed by axis |
|---|---|
| **Lifecycle inheritance** — `POTENTIAL → APPROVED → REALIZED` implies exposure can be "realized" | **B** (position) |
| **Meaningless aggregation** — one class holding `ACTUAL` past spend and `FORECAST` future risk | **C** (split) |

**A fixes neither. B fixes one. C fixes one. Only D fixes both.**

---

## 1.1 Alternatives assessed

### Alternative A — keep D-025, distinguish through provenance/type

Keep one class; let D-002's `basis` field carry `ACTUAL` vs `FORECAST`.

**The strongest argument for A, stated fairly:** D-002 already provides the distinction. Each record would be correctly labelled. Nothing needs amending. It is free.

**Why it fails.** The provenance labelling is correct and insufficient. Under A, any aggregate of the class mixes money we *spent* with money we *might lose*. D-002's weakest-basis rule would mark that aggregate `FORECAST` — which is the rule working correctly — but the aggregate is **meaningless regardless of how it is labelled.** You would never want that number.

So the defect is not provenance. **The defect is that the class invites a sum that should never be taken.** Avoiding it under A requires a discipline — *"never aggregate the class as a whole"* — enforced by convention.

> **A fails by D-025's own principle: structure over discipline.** D-025 exists precisely because a rule enforced by discipline eventually is not.

A also leaves the lifecycle problem entirely untouched.

### Alternative B — move outside the Opportunity hierarchy, keep one class

```
Finding
├── Opportunity              ← only PAS-eligible; carries the lifecycle
└── COST / EXPOSURE / RISK   ← outside; no lifecycle inheritance
```

**Fixes:** lifecycle. Nothing outside `Opportunity` inherits `POTENTIAL → APPROVED → REALIZED`, so "realized exposure" becomes structurally unsayable.

**Strengthens D-025's purpose** rather than relaxing it: exposure is now *further* from Potential Annual Saving, not closer.

**Does not fix:** the meaningless aggregate. One class still holds actual and forecast.

### Alternative C — split Cost from Exposure, keep inside Opportunity

**Fixes:** aggregation. Each class aggregates coherently — `ACTUAL` spend separately from `FORECAST` risk.

**Does not fix:** lifecycle. Both remain under `Opportunity`, so both still inherit a lifecycle in which **"realized cost" and "realized exposure" remain expressible** — the exact misleading semantics this investigation exists to prevent.

### Alternative D — B + C

```
Finding
├── Opportunity          ← only object eligible for Potential Annual Saving
│   └── (D-011 lifecycle: POTENTIAL → APPROVED → IN_PROGRESS → REALIZED)
├── Observed Cost        ← historical fact · ACTUAL · no lifecycle
└── Exposure / Risk      ← forward-looking · FORECAST / ESTIMATED · no lifecycle
                            · may carry mitigation
```

*(Evidence Gap, per W-18, sits alongside these as a fourth family — about our data, not the factory's money.)*

---

## 1.2 Recommendation: **D**

Not because it is the most thorough, but because **it is the only option that closes both defects**, and the two defects are independent.

---

## 1.3 Required determinations

| Question | A | B | C | **D** |
|---|---|---|---|---|
| Preserves D-025's original purpose? | Yes | **Strengthens** | Yes | **Strengthens** |
| Protects Potential Annual Saving? | Yes | Yes | Yes | **Yes, most strongly** |
| Preserves D-002 weakest-basis? | Labelled but misleading | Same | **Yes** | **Yes** |
| Requires a new lifecycle? | No | No | No | **No — absence of one** |
| Can it be approved? | Ambiguous | No | Ambiguous | **No** |
| Can it be realized? | **Yes — the defect** | No | **Yes — the defect** | **No** |
| Can it have an owner? | Unmodelled | Unmodelled | Unmodelled | **Optional, per class** |
| Can it have mitigation? | Unmodelled | Unmodelled | Unmodelled | **Exposure yes, Cost no** |
| Can it aggregate safely? | **No** | **No** | Yes | **Yes** |

### The behavioural evidence for splitting

| | **Observed Cost** | **Exposure / Risk** |
|---|---|---|
| Nature | Money **actually spent** | Money **at risk going forward** |
| Basis (D-002) | `ACTUAL` | `FORECAST` / `ESTIMATED` |
| Time | Fact about the past | Condition about the future |
| Owner | Whoever incurred it — optional | Conditional: systemic has none, specific may |
| Mitigation | **Impossible** — it already happened | **Possible** — that is its point |
| Example | Demurrage from port congestion | Unhedged FX on foreign commitments |

**Mitigation is the decisive behavioural difference.** One class cannot coherently define an attribute that is impossible for half its members.

### Approval, realization and mitigation — precisely

**Approval** has no meaning for either. Approving an Opportunity means *"yes, take this action."* Observed Cost is a fact; approving a fact is empty. Exposure could be *acknowledged*, which is a different verb.

But **mitigation of an exposure can be approved** — and here the model resolves cleanly:

> Once a mitigation has a defensible counterfactual and an expected benefit, **it is an Opportunity**, and it is that Opportunity which is approved and may be realized.
>
> **The exposure itself is never approved and never realized.**

Any avoided-cost claim then travels through the Opportunity, where D-014's avoided-cost rules already govern it. Nothing new is invented.

### What happens when an exposure changes direction

FX moves back favourably. Three options: mutate the record · supersede it · close it.

**Recommendation: supersede, never mutate** — consistent with D-001's ledger philosophy. An exposure observation was **true as of a date**. When conditions change, a new observation supersedes it, and *"we were exposed to X in March"* remains true even though it reversed in June. Mutation destroys that history.

### What happens when an exposure becomes an actual cost

FX exposure crystallises when the invoice is paid.

**Recommendation: the exposure closes as `MATERIALISED`, and a new Observed Cost is created, linked to it. The object does not transform.**

Transformation would destroy the forecast record — and with it the ability to ask *"was our exposure assessment accurate?"* Keeping both linked lets the system **audit its own forward-looking accuracy**, which is the `LEARN` step of the core product loop and the same reasoning as D-011's baseline-captured-before-action.

### What each user would see

**Finance.** Observed Cost reconciles to spend they already recognise — familiar and auditable. Exposure is forward-looking and reconciles to nothing in the ledger, correctly labelled `FORECAST`. **Finance would reject a single figure mixing the two on sight**, because the distinction is the substance of their discipline. Under A or B they see a mixed bucket, and the product loses credibility with the audience whose approval the North Star ultimately requires.

**Operations.** Observed Cost says *"this happened, here is what it cost"* — actionable for root cause even where no saving exists. Exposure says *"this could happen"* — actionable for mitigation. Mixed, an operations user **cannot tell whether to act now or to watch**. That is arguably a worse failure than Finance's, because it changes behaviour rather than confidence.

---

## 1.4 Interaction with locked decisions

| Decision | Effect |
|---|---|
| **D-025** | **Requires amendment.** This is the decision in question. D is a **hardening**, not a relaxation — exposure moves further from Potential Annual Saving, not closer |
| **D-002** | Preserved and strengthened — the misleading mixed aggregate becomes structurally impossible rather than merely mislabelled |
| **D-011** | Unaffected. The lifecycle stays with `Opportunity` alone |
| **D-012** | Strengthened — greater structural distance from the headline |
| **D-021** | **Wording needs re-expression.** *"Uncontrollable cost becomes `COST / EXPOSURE / RISK`"* would gain two destinations rather than one |
| **D-029** | Consistent. Neither class has an intervention, therefore no signature, therefore neither participates in contradiction detection |
| **W-18 Evidence Gap** | Consistent — a fourth family, already outside `Opportunity` |

---

## 1.5 Consequences

- Four top-level finding families instead of two: Opportunity · Observed Cost · Exposure/Risk · Evidence Gap.
- D-021's wording requires updating.
- **Mechanism 01's customs treatment splits**: demurrage already paid → Observed Cost; forward port-congestion risk → Exposure.
- More objects to model and present. Whether a common `Finding` parent is needed, or the four are simply siblings, is open.

## 1.6 Factory evidence required

`F-07` FX source and policy — without it, systemic and specific movement cannot be separated. New `F-29` — can the factory distinguish a **crystallised** cost from an **open** exposure in its own records (relevant to LC and hedging, `F-23`)?

## 1.7 New open questions

`W-38` does Observed Cost require an owner, or is ownership optional? · `W-39` is a common `Finding` parent needed, or are the four families siblings? · `W-40` where does the exposure→cost materialisation link live, and who maintains it?

---

# 2. W-36 — Annual-volume commitment risk

## 2.1 Alternatives

**A** Mechanism 02 · **B** future quantity/inventory mechanism · **C** Exposure/Risk · **D** a new mechanism · **E** a cross-cutting commitment-risk concept.

## 2.2 Recommendation: **C — Exposure/Risk, linked to the originating Opportunity, disclosed and not netted.** No new mechanism is required.

## 2.3 Reasoning

**The price side is already classified by D-030.** At commitment, two sub-cases:

- We would have bought 100 t anyway → quantity over the window unchanged → **Mechanism 02**, price benefit real.
- We committed to 100 t but would otherwise have bought 70 t → quantity changed → **quantity mechanism**.

The boundary holds without modification.

**The risk is a separate object.** The obligation to take volume that may not be needed is forward-looking, has no defensible alternative once committed, may or may not materialise, and if it materialises becomes either excess stock or a penalty. That is Exposure/Risk by every criterion in §1.

### The finding that matters

**An Opportunity can *create* an Exposure.** Mechanism 02 claims a price saving; the commitment creates a forward obligation. **Claiming the saving while hiding the exposure overstates the position.**

But it **cannot be netted**, and this is important:

> D-014 rule 6 requires **incremental costs** to be netted. This is not a cost — it is a **risk**. Netting a probability against a certainty requires inventing a probability, which D-017 and D-023 forbid.
>
> **Therefore: disclose, do not net.**

The saving stands — it is real, at a better price, on quantity genuinely purchased. The Opportunity carries a **linked exposure visible alongside it**. Nothing is invented, nothing is hidden.

This clarifies the boundary of a locked rule without amending it: **certain incremental costs are netted; uncertain future obligations are disclosed as linked exposure.**

## 2.4 Interaction with locked decisions

**D-014 rule 6** — scope clarified, not amended. **D-030** — the boundary already classifies the price side correctly. **W-33** — if D is adopted, this is Exposure/Risk specifically; on breach, a penalty paid creates an Observed Cost via the materialisation link.

## 2.5 Consequences

The Opportunity object gains a **link to created exposures**. New relationship, not a new class. Any mechanism whose intervention creates a forward obligation inherits this pattern — supplier consolidation is the next likely instance (see §3).

## 2.6 Factory evidence required

`F-28` are volume rebates and annual-volume agreements recorded, with thresholds and achievement to date? New `F-30` — do such agreements carry **penalty or shortfall clauses**, and are those terms recorded?

## 2.7 New open questions

`W-41` does the Opportunity object need a formal *"creates exposure"* link field? · `W-42` at what point does an unmet commitment become an Observed Cost — at period end, at breach, or at penalty invoice?

---

# 3. W-35 — Consolidation taxonomy

## 3.1 The ambiguity — and a third meaning

Taxonomy §4.5 *"Order consolidation"* currently reads: `(orders avoided × ordering cost) − additional carrying cost incurred`. *(That formula is separately D-027-invalid and already tracked under `Q-07`.)*

The name spans **three** distinct economic mechanisms, not two:

| Meaning | Lever | Quantity over window | Mechanism (per D-030) |
|---|---|---|---|
| **Supplier consolidation** | Fewer suppliers, same total volume | **Unchanged** | **Mechanism 02** |
| **Temporal / order consolidation** | Fewer, larger orders | **Changed per order** | **Quantity / inventory** |
| **Shipment consolidation** ⚠ | Multiple orders in one shipment | Unchanged | **Adjacent to mechanism 01's freight domain** |

The third was not previously identified. Its economic effect is **freight cost**, neither price nor quantity — and it sits close enough to mechanism 01 that leaving it inside §4.5 risks a double-counting collision with expedite/freight premium.

## 3.2 Recommendation

**Eventually split §4.5 into three.** Report and recommendation only — **no taxonomy rewrite now**, per instruction and consistent with discovering the abstraction mechanism-by-mechanism.

Also worth recording: **supplier consolidation creates a concentration exposure.** Fewer suppliers means less supply security — a forward-looking risk that cannot be netted, following exactly the W-36 pattern: **disclose the exposure alongside the saving.** This is the second instance of that pattern, which suggests it is general rather than incidental.

## 3.3 Interaction with locked decisions

**D-030** already classifies all three correctly once separated — evidence the boundary is doing real work. **`Q-07`** — the existing formula is invalid regardless of the split. **D-020 / D-029** — supplier consolidation could **contradict** a dual-sourcing recommendation; a real contradiction case for the new control. **D-023 by analogy** — *ordering cost* is an unknown input of the same class as the carrying-cost rate, and should be **finance-owned with no invented default**.

## 3.4 Consequences

One taxonomy category becomes three, distributed across two mechanisms plus one adjacent to mechanism 01. Until split, §4.5 cannot be specified without ambiguity about which mechanism owns it.

## 3.5 Factory evidence required

New `F-31` — is **ordering cost** known, and does Finance own it? New `F-32` — are **shipments** recorded such that multiple POs on one shipment are identifiable?

## 3.6 New open questions

`W-43` is shipment consolidation a third meaning, and does it belong with mechanism 01's freight domain? · `W-44` is ordering cost finance-owned, on the same footing as the carrying-cost rate (`N-10`)? · `W-45` **is "an Opportunity may create an Exposure that is disclosed rather than netted" a general pattern deserving its own rule?** — two instances found so far (W-36 commitment, supplier concentration)

---

## Status

| Item | Status |
|---|---|
| D-025 | **Unchanged.** No amendment made |
| W-33 | Recommendation **D**, awaiting decision |
| W-36 | Recommendation **C**, awaiting decision |
| W-35 | Recommendation *split into three*, awaiting decision. No rewrite performed |
| Part 2.2 lock document | **Not created** |
| Part 2.3 | **Not started** |
