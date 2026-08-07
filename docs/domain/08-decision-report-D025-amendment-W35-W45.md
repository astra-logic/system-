# 08 — Decision Report: Proposed D-025 Amendment · W-35 · W-45

> ## ⚠ NOTHING APPLIED. D-025 STANDS EXACTLY AS LOCKED.
> This document **proposes** an amendment and **analyses** two open questions. No locked decision has been modified, no taxonomy rewritten, no mechanism created.
> No code, no UI, no schemas. Part 2.3 not started. **Date:** 2026-08-07

---

# 1. Proposed amendment to D-025

## 1.1 ⚠ A gap in the accepted model that must be resolved first

The accepted tree shows **three** children of `FINDING`:

```
FINDING
├── OPPORTUNITY
├── OBSERVED COST
└── EXPOSURE / RISK
```

**W-18 (accepted) placed `EVIDENCE GAP` outside the Opportunity hierarchy.** It is not in this tree. Three readings are possible, and they are materially different:

| Reading | Consequence |
|---|---|
| **(i)** Evidence Gap is a **fourth child of `FINDING`** | Consistent with W-18; `FINDING` becomes the parent of everything the system asserts |
| **(ii)** Evidence Gap sits **outside `FINDING` entirely** | `FINDING` means "a statement about money"; Evidence Gap is a statement about *our data* and belongs elsewhere |
| **(iii)** Evidence Gap was **omitted inadvertently** | Same as (i) |

**Not assumed.** The amendment below is written for **(i)** and marked, because it is the reading most consistent with W-18's accepted reasoning — but reading (ii) is defensible, and arguably more precise: an Evidence Gap is genuinely *not* a finding about money. **Requires your decision.** Recorded as `W-46`.

---

## 1.2 The amendment — before and after, verbatim

### Title

| | |
|---|---|
| **BEFORE** | `## D-025 — `COST / EXPOSURE / RISK` is a distinct class, not a lifecycle status` |
| **AFTER** | `## D-025 — Findings are separated by class; only Opportunity is saving-eligible` |

### Status line

| | |
|---|---|
| **BEFORE** | `**Status:** `LOCKED` 2026-08-07 · **Area:** F9, saving engine structure · **Closes:** `Q-03` · **Reinforces:** D-021, D-012` |
| **AFTER** | `**Status:** `LOCKED` 2026-08-07 · **AMENDED** [date] by W-33 · **Area:** F9, saving engine structure · **Closes:** `Q-03`, `W-26`, `W-33` · **Reinforces:** D-021, D-012, D-002` |

### The decision block

**BEFORE**
```
**Decision.** Opportunity records are one of two **distinct classes**:

    Opportunity
    ├── SAVING_OPPORTUNITY
    └── COST / EXPOSURE / RISK

The North Star financial aggregation may consume **only `SAVING_OPPORTUNITY` records.**
```

**AFTER**
```
**Decision.** Findings are separated into distinct classes:

    FINDING
    ├── OPPORTUNITY          ← the only class eligible to contribute to
    │                          Potential Annual Saving. Carries the D-011
    │                          lifecycle: POTENTIAL → APPROVED →
    │                          IN_PROGRESS → REALIZED
    │
    ├── OBSERVED COST        ← historical ACTUAL financial fact.
    │                          No lifecycle. Observation state only.
    │                          No mitigation — it already happened.
    │
    ├── EXPOSURE / RISK      ← forward-looking FORECAST / ESTIMATED
    │                          condition. No lifecycle.
    │                          May carry mitigation.
    │
    └── EVIDENCE GAP         ← [PENDING W-46] insufficiency in our own
                               data, not money belonging to the factory.
                               Never carries opportunity value.

The North Star financial aggregation may consume **only `OPPORTUNITY` records.**

**Binding principles:**

1. EXPOSURE / RISK is never approved as an Opportunity.
2. EXPOSURE / RISK is never realized as an Opportunity.
3. A mitigation that creates a defensible counterfactual becomes a
   NEW OPPORTUNITY. The exposure itself is neither approved nor realized.
4. A direction change SUPERSEDES the previous exposure. Historical truth
   is never mutated.
5. When an exposure materialises, the exposure record is PRESERVED as
   historical evidence and a LINKED OBSERVED COST is created. The object
   does not transform.
6. Uncertain EXPOSURE / RISK is never netted against Potential Annual Saving.
7. ACTUAL historical cost and FORECAST / ESTIMATED exposure are never mixed
   in a financial aggregate.
```

### The "Why" block — **add** after the existing text, nothing removed

```
**Amendment rationale (W-33).** The original decision was correct about
aggregation safety and silent about lifecycle. Two defects surfaced later,
and they are independent:

  - LIFECYCLE INHERITANCE — placing the class under `Opportunity` made
    "realized exposure" expressible, which implies exposure became a saving.
  - MEANINGLESS AGGREGATION — one class holding ACTUAL past spend and
    FORECAST future risk permits a sum that is meaningless however it is
    labelled. Avoiding it required a convention, and D-025 exists precisely
    because a rule enforced by discipline eventually is not.

This amendment is a HARDENING, not a relaxation: exposure moves further from
Potential Annual Saving, not closer. Mitigation is the decisive behavioural
evidence for the split — it is impossible for cost, which already happened,
and is the entire point of exposure. One class cannot coherently define an
attribute impossible for half its members.
```

### Binding-consequence block — **replace**

| | |
|---|---|
| **BEFORE** | *"No status transition, migration, reclassification or aggregation path may convert a `COST / EXPOSURE / RISK` record into a `SAVING_OPPORTUNITY`. If a previously undefensible cost later becomes defensibly avoidable, a **new** `SAVING_OPPORTUNITY` is raised with its own evidence — the exposure record is not promoted."* |
| **AFTER** | *"No status transition, migration, reclassification or aggregation path may convert any non-`OPPORTUNITY` finding into an `OPPORTUNITY`. If a previously undefensible cost or exposure later becomes defensibly avoidable, a **new** `OPPORTUNITY` is raised with its own evidence — the original record is preserved, never promoted. The same applies to exposure materialisation: a linked `OBSERVED COST` is created; the exposure is not converted."* |

---

## 1.3 Every affected decision and document

Verified by search, not assumed. **None of these have been changed.**

### Decisions

| Ref | Current text | Required change |
|---|---|---|
| **D-021** | *"uncontrollable cost becomes `COST / EXPOSURE / RISK`"* + binding consequence | **Two destinations**: already-incurred cost → `OBSERVED COST`; forward risk → `EXPOSURE / RISK`. Customs demurrage already paid vs port-congestion risk going forward |
| **D-012** | Amendment note: *"`COST / EXPOSURE / RISK` amounts never enter this aggregate"* | Re-express as *"non-`OPPORTUNITY` findings never enter this aggregate"* |
| **D-011** | Lifecycle | **No change.** Lifecycle stays with `OPPORTUNITY` alone — that is the point |
| **D-029** | Intervention signature on every Opportunity | **No change**, but see W-45 §3 — confirms exposure carries none |
| **D-002** | Provenance | **No change.** Strengthened: the mixed aggregate becomes structurally impossible rather than mislabelled |

### Documents

| File | Lines | Change |
|---|---|---|
| `docs/domain/03-saving-opportunity-model.md` | 74, 79, 220 | §2a item 2 tree and text; §5 item 0 aggregation guard |
| `docs/domain/04-mechanism-01-expedite-premium.md` | 40, 236, 241, 517, 524, 533, 553 | §6 customs treatment **splits into two destinations**; lock-status rows 8 and 15; must-not-implement list |
| `context/code-standards.md` | 25 (rule 10e) | Re-express for the four-class model |
| `context/specs/00-build-plan.md` | 156 (U-17) | Class list |
| `context/architecture.md` | 46 | D-025 row |
| `docs/open-questions.md` | 161 | Q-03 resolution text |
| `docs/domain/05-…-WORKSHOP.md` | 12 references | Workshop draft — updates when Part 2.2 locks, not before |

### Consequential

- **Mechanism 01's customs treatment splits.** Demurrage already paid → `OBSERVED COST`. Forward port-congestion risk → `EXPOSURE / RISK`. This is a genuine improvement: the current single destination conflates a bill the factory has paid with a risk it carries.
- **`W-46`** — Evidence Gap placement, per §1.1.
- Four finding families to model and present.

---

# 2. W-35 — Consolidation analysis

## 2.1 A correction to my own earlier recommendation

I previously recommended *"split §4.5 into three."* **The analysis does not support that phrasing.** It shows **two homes and one gap** — two cases belong to mechanisms that already exist or are already planned, and the third belongs to nothing. "Split into three mechanisms" would have created a mechanism the evidence does not yet justify.

## 2.2 Case 1 — Supplier consolidation

| Question | Finding |
|---|---|
| Economic mechanism | Better unit price through volume leverage, or moving volume to the supplier already better priced. **Quantity over the window unchanged** |
| Intervention | Shift purchase volume between qualified suppliers, or negotiate a consolidated agreement |
| Counterfactual | *"These N lines went to supplier A at P1; supplier B was qualified, available and priced at P2 for equivalent supply at that quantity; the difference on those lines is X"* |
| **Which mechanism owns it** | **Mechanism 02.** D-030: quantity unchanged. The counterfactual is already M02's shape |
| New mechanism needed? | **No** |
| Overlaps M01? | Only where the split existed for urgency — **already excluded by D-020** |
| Overlaps M02? | It **is** M02 |
| Inventory consequences? | **Possibly — via lead time, not quantity.** If supplier B has a longer lead time, safety stock must rise. Subtle and real |
| Freight consequences? | **Yes.** Different supplier, different lane. The comparison must be **landed-cost based** (`F-19`), or you save on price and lose on freight |
| Concentration exposure? | **Yes** — fewer suppliers, less supply security. See W-45 |
| Claimable by another mechanism? | Yes, if booked as §4.5 order consolidation. Needs D-020 attribution |
| Data | PO lines by supplier/item/window · prices · qualification status · **lead times per supplier** · landed-cost components |
| Evidence | M02's gates: existence (B available *at that quantity*) and equivalence (spec, terms, incoterm, **lead time, reliability**) |
| **What PAS means** | Recurring annual price difference on volume genuinely purchased, **net of freight differences**, with a **linked concentration exposure disclosed** |

**Key finding:** not a separate mechanism — a **specific counterfactual shape inside M02**. Its equivalence test must include lead time and reliability, which is exactly DP-01's *"equivalent procurement outcome"* doing real work.

## 2.3 Case 2 — Temporal / order consolidation

| Question | Finding |
|---|---|
| Economic mechanism | Fewer ordering transactions → ordering cost saved. Higher average stock → carrying cost incurred |
| Intervention | Change order frequency / order-quantity policy |
| Counterfactual | *"Over this window N orders were placed; under a policy of M orders, ordering cost would have been lower by X and average stock higher by Y"* |
| **Which mechanism owns it** | **Quantity / inventory economics.** D-030: quantity per order changes. **Not M02** |
| New mechanism needed? | **No** — but **homeless until the quantity mechanism is designed** |
| Overlaps M01? | No |
| Overlaps M02? | **Only if the larger order also earns a price break** — then two effects compose, kept distinguishable per D-030 |
| Inventory consequences? | **Yes, by definition.** That is its entire cost side |
| Freight consequences? | Possibly — larger orders may ship more cheaply per unit. A third effect |
| Concentration exposure? | No |
| Claimable by another mechanism? | Yes — the price-break effect belongs to M02 |
| Data | Order history · **ordering cost** (`F-31`, unknown) · consumption rate · **carrying cost basis** (`F-08`, unknown) |
| Evidence | **Both cost inputs must be finance-owned.** Without them, not quantifiable (D-023) |
| **What PAS means** | Recurring net of ordering saved minus carrying incurred |

**Key finding:** this depends on **two** unresolved finance-owned inputs. It is currently the **least quantifiable of the three**, and would return `INSUFFICIENT_DATA` today on principle, not on data volume.

## 2.4 Case 3 — Shipment consolidation *(hypothesis, tested)*

| Question | Finding |
|---|---|
| Economic mechanism | Freight cost per unit falls as fixed shipment costs amortise across combined loads |
| Intervention | Combine shipments · change shipping schedule · consolidate at supplier or forwarder |
| Counterfactual | *"These three shipments each carried X; combined, freight would have been Y instead of Z"* |
| **Which mechanism owns it** | **None.** See below |
| New mechanism needed? | **Genuinely unowned — but not yet justified.** See recommendation |
| Overlaps M01? | **Adjacency, not overlap.** M01 measures the *premium paid to compress time*; this measures *fixed-cost amortisation*. One shipment can carry both effects independently — permitted by D-020 |
| Overlaps M02? | No — different cost category entirely |
| Inventory consequences? | **Yes.** Waiting to combine delays arrival → more safety stock, or later availability |
| Freight consequences? | It **is** the freight consequence |
| Concentration exposure? | **Timing risk** — a shipment that waits may arrive late |
| Claimable by another mechanism? | **M01 could claim it wrongly**, if freight reduction were attributed to avoided premium |
| Data | Shipment records linking multiple POs (`F-32`) · freight cost per shipment · rate structure by weight/volume |
| Evidence | **`F-01` — the same gate as M01.** If freight is not separable, this is unevidenceable too |
| **What PAS means** | Recurring freight reduction, **net of any safety-stock increase from delayed arrival** |

### ⚠ What this case reveals about D-030

**D-030's boundary does not classify it — and that is not a defect.**

D-030 separates *price* from *quantity*. Shipment consolidation is neither: it is **logistics cost**, a third economic domain the boundary was never written to address. D-030 remains correct for what it was locked to do.

### Recommendation for case 3

**Record as an identified gap. Do not create a mechanism.**

The existing mechanisms genuinely cannot represent it — but that justifies *recording* it, not *building* it. Two reasons to wait:

1. **It is gated by `F-01` anyway.** If freight is not separably captured, the question is moot.
2. Materiality is unknown. Creating a mechanism for an effect of unmeasured size is exactly the breadth risk challenge D1 warns about.

**Revisit when `F-01` is answered.**

## 2.5 W-35 recommendation

> **§4.5 "Order consolidation" should eventually be retired and redistributed, not split into three mechanisms.**
>
> - Supplier consolidation → **Mechanism 02** (a counterfactual shape, not a new mechanism)
> - Temporal consolidation → **future quantity/inventory mechanism**
> - Shipment consolidation → **identified gap**, no mechanism, revisit after `F-01`

**No rewrite performed.** Awaiting decision.

**Interaction with locked decisions:** D-030 classifies cases 1–2 correctly, confirming the boundary does real work · `Q-07` — §4.5's existing formula is invalid regardless · D-029 — supplier consolidation may **contradict** a dual-sourcing recommendation, a genuine test case · D-023 by analogy — *ordering cost* is an unknown of the same class as the carrying-cost rate and should be **finance-owned with no invented default**.

---

# 3. W-45 — Does an Opportunity create a linked Exposure/Risk?

## 3.1 The five tests

| # | Instance | Opportunity | Exposure created | Valid? |
|---|---|---|---|---|
| 1 | **Supplier concentration** | Consolidate to supplier B for a better price | Fewer suppliers → supply security | ✓ |
| 2 | **Commitment risk** | Annual-volume price agreement | Obligation if demand falls | ✓ *(already accepted)* |
| 3 | **Inventory risk** | Buy at a price break (larger quantity) | Obsolescence, damage, shelf-life on the extra stock | ✓ **and instructive — see below** |
| 4 | **Logistics / supply disruption** | Shipment consolidation, or single-lane sourcing | One delay now affects more material | ✓ |
| 5 | **FX exposure** | Switch to a cheaper foreign supplier | EGP cost now depends on FX | ✓ **and instructive — see below** |

**5 of 5 valid. The pattern is general, not mechanism-specific.**

### Case 3 shows netting and disclosure coexist

A price-break intervention produces **both**:
- **Carrying cost** — a *certain* incremental cost → **netted** under D-014 rule 6
- **Obsolescence risk** — an *uncertain* future condition → **disclosed** as linked exposure

They are not alternatives. **One intervention can produce a nettable cost and a disclosable risk simultaneously**, and the two rules apply side by side.

### Case 5 shows the link is optional on the exposure side

FX exposure exists **independently** of any opportunity — the factory already imports. So an Exposure may exist **with or without** an originating Opportunity.

> **Cardinality: an Opportunity may create 0..n Exposures; an Exposure may have 0..1 originating Opportunity.**

## 3.2 Recommendation

**A saving-model rule establishing a linked-finding relationship.** Not a cross-cutting foundation, not mechanism-specific.

Applying D-029's placement principle — *F-series foundations govern what must be captured from reality; the saving model governs what may be asserted about it* — this governs what may be **asserted alongside an Opportunity**. Therefore: **saving model.**

It is simultaneously **a relationship** (Opportunity → Exposure link) and **a rule** (must disclose, must not net). Both belong together.

## 3.3 Does Exposure/Risk carry an intervention signature? **No.**

And this follows from an already-accepted principle rather than being asserted:

> *"A mitigation that creates a defensible counterfactual becomes a new Opportunity."* (W-33, accepted)

So the mitigation — the only thing an Exposure could act through — **is an Opportunity**, and *that* carries the signature. The Exposure never does.

**Two confirming edge cases:**

- **Can two Exposures contradict?** No. They are *observations*, not recommendations, and both can be true at once. Nothing to reconcile.
- **Can an Opportunity contradict an Exposure?** No — but something real happens there. An Opportunity whose intervention *worsens* an existing Exposure is **the disclosure linkage**, not contradiction control. The two controls stay distinct and complementary: **D-029 governs opposed actions; W-45 governs an action that creates or deepens a risk.**

## 3.4 Interaction with locked decisions

**D-014 rule 6** — scope clarified, not amended: certain incremental costs are netted; uncertain future obligations are disclosed. **D-029** — confirmed: exposure carries no signature. **D-025 as amended** — the relationship crosses two of the four classes. **D-012** — disclosed exposure never enters the headline.

## 3.5 New open questions

`W-47` — if the originating Opportunity is **rejected or expired**, does the linked Exposure persist? *(Analysis suggests no: if the action is never taken, the exposure is never created — so the link is conditional on the Opportunity reaching `IN_PROGRESS`. Not assumed.)*
`W-48` — when several Opportunities create the **same** exposure (three consolidations onto one supplier), does the exposure aggregate, or does each carry its own?
`W-49` — must an Opportunity **disclose exposures it deepens but did not create**?

---

## Status

| Item | Status |
|---|---|
| D-025 | **UNCHANGED.** Amendment proposed only |
| `W-46` Evidence Gap placement | **Blocks the amendment** — three readings, not assumed |
| W-35 | Recommendation: retire and redistribute §4.5. **No rewrite performed** |
| W-45 | Recommendation: saving-model rule + linked relationship. Exposure carries no signature |
| Part 2.2 lock | **Not created** |
| Part 2.3 | **Not started** |


---
---

# 4. W-47 / W-48 / W-49 — investigation

> Requested before locking the W-45 relationship. **No new questions raised** beyond one flagged extension.

## W-47 — Does an Exposure created by an Opportunity remain linked if the Opportunity is rejected?

**Alternatives**

| | Option |
|---|---|
| A | Exposure is deleted on rejection |
| B | Exposure persists, unlinked |
| C | **Exposure is never created until the intervention is actioned** |
| D | Created at `APPROVED`, closed on rejection |

**Recommendation: C.**

**Reasoning.** The exposure is a consequence of **the action**, not of the recommendation. If we never consolidate to supplier B, we never acquire the concentration risk. But the *prospective* consequence is decision-relevant — a reviewer must see *"this would create X exposure"* to decide honestly.

Those are two different objects:

```
Prospective consequence  →  an attribute of the Opportunity's disclosure
Actual Exposure record   →  created when the intervention reaches IN_PROGRESS
```

**Consequences.** No orphan exposures. No deletion — which would violate the supersede-never-mutate principle. Rejection history is preserved and useful: *"we declined this partly because of the concentration risk"* remains readable.

*Edge case:* an actioned intervention later reversed produces a **supersede**, not a delete — consistent with D-025 principle 4.

**Relationship to cardinality.** Unchanged. It clarifies **when** the link comes into being, not how many.

**Changes the locked W-45 principle?** **No.**

---

## W-48 — Can multiple Opportunities create or link to the same Exposure?

**Alternatives**

| | Option |
|---|---|
| A | One Exposure, many originating Opportunities (would make the exposure side 0..n) |
| B | **Each Opportunity creates its own Exposure record; current exposure is a derived view** |
| C | Each creates its own, merged into a stored aggregate |

**Recommendation: B.**

**Reasoning.** Three consolidation opportunities all moving volume to supplier B each deepen concentration on B. Merging them into one mutable record would **destroy which action caused what** — exactly what an audit trail needs, and a mutation the ledger philosophy forbids.

The intuition behind A is still served: *"current concentration on supplier B"* is a **derived view over the records**, precisely as balances are projections of the ledger (D-001), and consistent with DP-04's accepted *aggregate by cause* discipline.

**Consequences.** Exposure records accumulate; the presentation layer aggregates by subject. No stored merged object, so no mutation.

**Relationship to cardinality.** **Confirms 0..1 exactly.** Each exposure has exactly one originating Opportunity — or none, in the standalone case.

**Changes the locked W-45 principle?** **No — it confirms it.**

---

## W-49 — Must an Opportunity disclose an existing Exposure it deepens but did not create?

**Alternatives**

| | Option |
|---|---|
| A | Yes, mandatory, same relationship as created |
| B | No — only created exposures are disclosed |
| C | **Yes, mandatory, as a distinct relationship type** |

**Recommendation: C.**

**Reasoning.** The case is real and detectable without inventing anything. FX exposure already exists because the factory imports; an Opportunity to switch to a cheaper foreign supplier **increases foreign-denominated spend and therefore deepens it.** The system can see this from the intervention signature plus existing exposure records — **qualitatively, with no probability and no scoring.** *How much* it deepens may be unquantifiable; *that* it deepens is a factual statement.

**B is rejected** because an Opportunity that silently worsens a known risk is exactly the hidden cost this discipline exists to prevent. Deepening is the same failure as creating, in a different shape.

**A is rejected** because *creates* and *deepens* differ materially — one brings a risk into existence, the other adds to an existing one. Different remediation, different ownership. Conflating them would also corrupt W-48's aggregation, since a *deepens* link could be miscounted as a new exposure.

**Consequences.** The linked-finding relationship gains a **type**: `CREATES` | `DEEPENS`.

### ⚠ Relationship to cardinality — this extends what was accepted

The accepted statement was: *"an Exposure may have 0..1 originating Opportunity."* That remains true **for `CREATES`**. Adding `DEEPENS` means:

```
OPPORTUNITY  ──creates 0..n──▶  EXPOSURE / RISK
OPPORTUNITY  ──deepens 0..n──▶  EXPOSURE / RISK

EXPOSURE / RISK  ──has 0..1 creating Opportunity──▶
EXPOSURE / RISK  ──has 0..n deepening Opportunities──▶
```

**Changes the locked W-45 principle?** **It extends it.** Not a contradiction — origination stays 0..1 — but an exposure becomes linkable to more Opportunities than one, through a second relationship type.

**This is more than what was accepted, so it is flagged rather than applied.** D-031 has been locked with the accepted `CREATES` cardinality only. **`DEEPENS` awaits your decision.**

---

## Remaining decision point

| | |
|---|---|
| **W-49 `DEEPENS` relationship type** | Recommended. Extends the accepted cardinality on the exposure side. **Not applied.** D-031 currently carries `CREATES` only |
