# 16 — BLOCK 2: Monetary Boundaries & Cross-Cutting Rules

> ## ⚠ ANALYSIS ONLY — NOTHING LOCKED, NOTHING APPLIED
> Every decision re-opened adversarially. Prior conclusions were **not** treated as correct.
> No rate, percentage, threshold, probability or factory fact invented.
> **No code, no UI, no schemas. Part 2.3 not started.** **Date:** 2026-08-07

**Six findings changed or hardened a prior conclusion. Three are new contradictions.**

---

# DP-10 — Capital release / excess inventory

## 1. The actual economic question

> *"We hold more of this than we need. What cash consequence follows, and when?"*

## 2–3. Observable vs not

| Observable | Not observable |
|---|---|
| On-hand, from the ledger | Whether the coverage policy is *correct* |
| Consumption history | Future demand |
| Open and planned orders with ETAs | Expected price movement over a deferral window (`F-39`) |
| Unit cost, as imported | Whether deferral is operationally acceptable to the supplier |

## ⚠ NEW FINDING 1 — Excess is only actionable when future orders exist. **Narrows DP-10.**

`FACT` The deferral counterfactual requires **something to defer.**

Prior analysis assumed *excess = will be consumed, dead = never consumed* was a clean boundary. **It is not.** There is a third state: stock that **will** be consumed, but over a horizon so long that no order exists to defer.

> Five years of supply, no open orders. It is not dead — it will be used. But **there is no intervention at all.** It is a **position**, not an Opportunity.

**Excess stock without pending orders produces no Opportunity.** That narrows DP-10 materially and was missed.

## ⚠ NEW FINDING 2 — A double-count between DP-10 and DP-15. **This is the most important finding in Block 2.**

`FACT` Consider a deferral of 200,000 EGP for 40 days.

- **DP-10** would claim the **financing value of the deferred outlay**.
- **DP-15's carrying cost** contains a **cost-of-capital component**, which would claim the value of not having that money tied up.

> **These are the same economic quantity.** Cost of capital *is* the financing cost of tied-up money. Claiming both counts the financing twice.

Prior analysis treated DP-10 and DP-15 as independent. **They are not.**

**Resolution required:** the financing effect is claimed **either** through the deferral **or** through the capital component of carrying cost — **never both.** This is a `DECISION`, not a derivation, because which channel is correct depends on how the intervention is framed.

## ⚠ HARDENED — Deferral benefit cannot be computed without expected price movement

Prior finding: *"in a devaluing currency, deferring may cost more."* **That was too narrow.**

`FACT` It is not only FX. **Any** expected price increase — inflation, supplier increase, seasonal — reduces or reverses the benefit.

And the sharper point: **assuming zero price movement is itself an invented assumption**, and in a high-inflation economy it is *known to be wrong*.

> **Deferral benefit is `INSUFFICIENT_DATA` without an expected-price-movement input. Assuming zero is forbidden under D-017 and D-023.**

## Disposal economics

`FACT` Disposal does **not** release capital — confirmed on re-test. The money was spent; only recovery value returns.
`EVIDENCE GAP` A write-off may carry a **tax effect**. That is a real cash consequence, it belongs to finance under D-008, and **it must not be claimed here.**

## 4–10. The remaining tests

| Test | Result |
|---|---|
| **False-saving failure** | Presenting the principal as a benefit. Magnitude reads as value |
| **Double counting** | ⚠ Finding 2, plus 4.1↔4.7 (resolved as temporal: one-time correction vs recurring prevention) |
| **Contradiction** | With M02's price break — buy more vs hold less. D-029 handles |
| **Currency eligibility** | **Recurring: none from 4.1** — recurring belongs to the policy fix. **One-time: financing value only**, and only with `F-39` |
| **Evidence** | Ledger + open orders + `F-22` + `F-39` |
| **Realization** | Observable — the deferred order either moved or did not |
| **Finance-manager challenge** | *"Is this just cash-flow timing?"* → **Yes, and we say so.** Survives |

## Verdict

**READY TO LOCK — structure only**, with three additions to the prior recommendation: excess without pending orders yields no Opportunity · the financing double-count must be resolved · deferral benefit requires `F-39` and may be negative.

---

# DP-11 — Retirement of 4.2

## 1. The actual economic question

> *"This item barely moves. Is that costing us anything we can act on?"*

## ⚠ CHANGED REASONING — the shelf-life case is stronger than I said, and it still does not save 4.2

Prior conclusion: 4.2's shelf-life case is an `EXPOSURE / RISK`. **On re-test that is incomplete.**

`FACT` If an item will expire before use **and action is available now**, there is a genuine counterfactual:

> *"Sold or returned today, recovery is X. Held to expiry, recovery is zero."*

That is **not** a carrying-cost play. It is **recovery-value preservation**, and it is a real Opportunity.

**But it is 4.3's disposal decision, triggered earlier.** Shelf-life detection does not create an independent mechanism — it **advances the timing of an existing one.**

## The four tests for independence

| Attempt | Result |
|---|---|
| Slow but appropriately stocked | No intervention. Coverage is right, item will be used |
| Slow as a sourcing signal | That is 4.6 / temporal consolidation |
| Slow as an inventory-turns KPI | Analytics, not a mechanism |
| **Slow relative to shelf life** | **Triggers 4.3 earlier, or produces an exposure. Not independent** |

## Remaining tests

**False-saving failure:** claiming carrying cost on slow stock, which is imputed rather than incurred. **Double counting:** its entire risk profile — it would borrow 4.1's and 4.3's claims. **Currency eligibility:** none of its own. **Finance-manager challenge:** *"What do you want me to do about slow stock?"* — the honest answer is always 4.1's or 4.3's.

## Verdict

**READY TO LOCK — retire as a saving category.** Preserve as: a **detection signal** feeding 4.1 and 4.3 · a **trigger** that advances 4.3's disposal decision for shelf-life items · an **exposure** where no action is available.

`ASSUMPTION` A turnover cut-off is a threshold (`A-18`). Tolerable for a *detection signal*; **would not be tolerable if 4.2 produced currency** — a further argument for retirement.

---

# DP-12 — Classification of 4.9

## 1. The actual economic question

> *"We may run out. What is that worth?"* — and in Release 1 the answer is: **not knowable.**

## Testing every existing structure before creating anything

| Class | Fits? |
|---|---|
| `OPPORTUNITY` | **No** — no counterfactual; "you are at risk" is a projection, not a foregone alternative |
| `OBSERVED COST` | **No** — a past stockout has no attributable cost in Release 1 (D-007 removes production impact; no sales module) |
| `EVIDENCE GAP` | **No** — it is a claim about the factory, not about our data |
| **`EXPOSURE / RISK`** | **Yes** — forward-looking, `FORECAST`-derived, may carry mitigation |

**No new class required.**

## ⚠ NEW OBSERVATION — 4.9 and Mechanism 01 are mutually exclusive on the same event

`FACT` M01 measures **the premium paid to avoid** a stockout. 4.9 measures **the risk of** one.

If an expedite occurred, the stockout **did not happen** — there is no exposure, there is an M01 `OBSERVED COST`. The exposure was **mitigated before it was ever recorded** and leaves no trace.

**Not a defect** — but it means exposure counts and expedite counts are **not additive**, and anyone reading them together must know that.

## Remaining tests

**Currency eligibility:** none, and even a mitigation cannot be valued — expediting has a **knowable cost and an unvaluable benefit**, which is a human decision, not a system quantification. **D-031:** 4.1 and 4.7 `DEEPENS` it. **Realization:** none — exposure is never realized.

## Verdict

**READY TO LOCK — reclassify as `EXPOSURE / RISK`.** No new class. Record that exposure and expedite counts are not additive.

---

# DP-13 — Safety-stock backtesting

## 1. The actual economic question

> *"Could we hold less of this without running out?"*

## ⚠ NEW FINDING 3 — The observed floor may enshrine a lucky error

`FACT` Prior analysis listed interventions that propped the floor **up**. It missed the opposite case.

> A planner **misses a reorder**. Stock runs unusually low. Demand happens to be quiet. **No stockout occurs.**
>
> Backtesting to that floor would set the target at a level reached **by mistake**, validated **by luck**.

The floor is not a neutral observation in either direction. It is the outcome of decisions and accidents we cannot see.

## The full interference set

| Interference | Observable in Release 1? |
|---|---|
| Expedites / emergency purchases | **Only via M01's capture** (`F-01`, `F-06`) |
| Manual overrides | Only with override history (`F-36`) |
| Supplier escalation | **Usually unrecorded** (`F-35`) |
| Substitutions | Needs `F-27` — likely unavailable |
| Production rescheduling | **No — out of scope (D-007)** |
| **Demand suppression** | **Structurally unrecordable — no record exists of an order never placed** |
| **Missing orders (Finding 3)** | Detectable only if planned-vs-actual ordering is reconstructable |
| Managed demand | Invisible; the planner's success erases the evidence |

## What can and cannot be claimed

```
CAN CLAIM   "On-hand never fell below L in the observed window."
            ACTUAL. Always available from the ledger.

CAN CLAIM   "...and no recorded intervention explains that floor."
            Stronger. Still absence of evidence of insufficiency.

CANNOT CLAIM  "L would have been sufficient."
              Requires ruling out interferences that are
              structurally unobservable in Release 1.
```

## ⚠ NEW — a carve-out that turns "never" into "not for most items"

`ASSUMPTION`, requires factory evidence to instantiate.

The two fatal blind spots — **production rescheduling** and **demand suppression** — apply only to items whose demand is **schedulable or deferrable**.

> For items whose demand is **failure-driven or externally fixed** — maintenance spares, for instance — production cannot be resequenced around them and demand cannot be quietly suppressed. **For that class, the backtest's blind spots shrink materially.**

Whether such a class exists here is `EVIDENCE GAP`. But the blanket "never" was too strong, and the carve-out is principled rather than convenient.

## Remaining tests

**False-saving failure:** a quantified reduction beside an **unvaluable** stockout risk biases the decision structurally toward cutting. **Realization:** the claim unavailable prospectively **is** verifiable retrospectively — reduce, wait, observe. **Finance-manager challenge:** *"How do you know it wouldn't have stocked out?"* — the honest answer is *"we don't; we know nothing recorded says it would have."* **That answer survives; a modelled service level does not.**

## Verdict

**READY TO LOCK — prospective indication only, retrospective realization.** Plus the carve-out as an open question, not an assumption.

---

# DP-14 — Ownership

## 1. The actual economic question

> *"Who is answerable for this finding, who executes it, and who is answerable for the data under it?"*

Re-tested against 4.1: the ledger supplies the data (inventory), the finding concerns stock levels, **the action is deferring a purchase order (purchasing).** Three accountabilities that do not collapse.

| Role | Factory-facing? |
|---|---|
| Mechanism Owner | **No** — the detector's correctness is internal. Not a finding field |
| **Finding Owner** | Yes |
| **Action Owner** | Yes |
| **Data Owner** | Yes — the natural owner of an `EVIDENCE GAP` |

⚠ **The adjudicator (DP-07) is a reviewer, not an owner**, and must not be collapsed into Finding Owner or the independence requirement is silently lost.

**Configurable; one person may hold several; an unowned finding is visible, never hidden.**

## Verdict

**READY TO LOCK — three factory-facing roles.** Requires the D-011 amendment below.

---

# DP-15 — Carrying cost

## ⚠ HARDENED VERDICT — a whole-rate carrying cost is almost certainly *invalid*, not merely imprecise

Prior conclusion was *"treat it component-wise."* Re-testing each component against the four required classifications produces a stronger result.

| Component | Classification | Reasoning |
|---|---|---|
| **Capital** | **CALCULATED** — never `ACTUAL` | An opportunity cost, not an invoice. ⚠ **And subject to Finding 2's double-count with DP-10** |
| **Space** | **ACTUAL** if external storage is rented · **NOT VALID** for an own, unconstrained warehouse | No incremental cash flow when the building is already paid for and half empty |
| **Handling** | **ACTUAL** if overtime or per-move contracted · **NOT VALID** if salaried staff below capacity | Marginal labour cost may genuinely be zero |
| **Insurance** | **ACTUAL** if value-based and adjusting · **NOT VALID** if a fixed annual declared value | A fixed premium does not move with stock |
| **Obsolescence** | **EXPOSURE / RISK** | Not a cost at all. **Inside a rate it would be netted — which D-031 forbids** |
| **Shrinkage** | **Splits**: past shrinkage is `ACTUAL` (a ledger adjustment); future shrinkage is **EXPOSURE** | A rate conflates the two |
| **Disposal** | **ACTUAL when incurred — and it is a cost of the intervention, not a carrying cost** | Misclassified if placed inside a carrying rate |

### The conclusion this forces

> `FACT` **A typical finance carrying-cost rate contains at least two `EXPOSURE` components (obsolescence, future shrinkage) and frequently two that are `NOT VALID` for a marginal decision (own-warehouse space, salaried handling).**
>
> Using it whole would **net a risk into a saving — forbidden by D-031** — and claim costs that generate **no incremental cash flow**.

**A finance-owned rate is not merely possibly-unfit. Used whole, it is almost certainly invalid for these mechanisms.** That is a harder line than Block 1 took, and it is better supported.

## Remaining tests

**False-saving failure:** the largest available. **Currency eligibility:** only components that are `ACTUAL` or defensibly `CALCULATED`, and only where they generate incremental cash flow. **Evidence:** `F-08` must return **components and their construction**, not a single number. **Finance-manager challenge:** *"Where did 22% come from?"* — under the whole-rate approach there is no answer that survives. Under component treatment there is.

## Verdict

**READY TO LOCK — component principle, with the hardened conclusion.** Values require `F-08`, `F-33`, `F-40`.

---

# ARCHITECTURAL AMENDMENTS

## 1. D-011 — Owner split

**Exact problem.** One `Owner` field; three distinct accountabilities.
**Why the current rule fails.** Either the wrong person is asked to act, or nobody owns the data quality beneath the number — and `EVIDENCE GAP` has no natural owner at all.
**Proposed change.** Replace `Owner` with `Finding Owner · Action Owner · Data Owner`. Note the adjudicator is a reviewer, not an owner.
**Affected.** D-011 · Saving Opportunity object · `A-20` · build plan U-17 · code standards.
**Affected calculations.** None.
**Should it be LOCKED?** **Yes.** It is a field-specification amendment, not a new principle.

## 2 & 4. D-014 rule 10 *purpose* + D-023 *rate fitness* — **one issue**

**Exact problem.** An authoritative rate can be the wrong instrument. D-023 forbids *inventing*; nothing forbids *misapplying*.

### ⚠ CHANGED CONCLUSION — purpose is **not** derivable from `limitations`

Block 1 recorded this as *"may be derivable."* Re-tested, **it is not**, and the reason is precise:

> `limitations` is **free text**. A mechanism cannot **match** against free text.
>
> - If the requirement is **disclosure only**, `limitations` suffices and no new field is needed.
> - If the requirement is **blocking**, purpose must be **structured** so a mechanism can declare what it needs and detect mismatch.

**DP-15's obsolescence case demands blocking** — disclosure does not prevent netting a risk into a saving. **Therefore purpose must be structured.** The smaller derivation fails its own test.

**Proposed change.** Add **`purpose`** to D-014 rule 10's provenance list. A mechanism declares the purpose it requires; mismatch **blocks currency quantification** and raises an `EVIDENCE GAP`. Extend D-023 from *never invent* to *never invent, never misapply.*
**Affected.** D-014 rule 10 · D-023 · D-002 · every mechanism consuming a rate · `F-08` (must return purpose and components).
**Affected calculations.** Every figure using carrying cost, cost of funds, ordering cost or FX.
**Should it be LOCKED?** **Yes — as one amendment covering both.**

## 3. D-031 — `MITIGATES`

**Exact problem.** `CREATES` and `DEEPENS` both mean *worsening*. Risk **reduction** is inexpressible.

### Re-tested against a cheaper alternative — and it survives

Could supersession express it instead? After the action, a new exposure observation at a lower level supersedes the old one, and the chain shows the reduction.

> **That works retrospectively and fails prospectively.** The problem is at **decision time**: M01's reorder-point fix shows a cost and a quantified expedite reduction, while its stockout-risk reduction is invisible — so a correct action looks purely bad.
>
> **Supersession handles verification. It does not handle disclosure.**

**Proposed change.** Add `MITIGATES` as a third **disclosure-only** relationship. Never netted, never valued, no probability or severity score. Exposure still carries no intervention signature.
**Affected.** D-031 · saving model · code standards · M01 · 4.7.
**Affected calculations.** **None** — it is disclosure, not arithmetic.
**Should it be LOCKED?** **Yes.**

---

# CROSS-MECHANISM TEST

| Against | Result |
|---|---|
| **Mechanism 01** | ⚠ 4.7 **composes** at component level (reorder point = lead-time demand + safety stock); 4.9 exposure and M01 cost are **mutually exclusive on one event** |
| **Mechanism 02** | 4.1 contradicts its price-break case (D-029); 4.6 composes in the opposite direction |
| **Inventory categories** | 4.1↔4.7 temporal, not duplicative; 4.2 retired removes a structural double-count |
| **Orders & Supply Movement** | Supplies the open orders DP-10 needs, and the order→receipt lead time DP-13 needs. **Unchanged as `ENABLER`** |
| **D-029** | Handles 4.1↔M02 and same-component 4.7↔M01. Component decomposition prevents a false contradiction |
| **D-031** | `DEEPENS` from 4.1 and 4.7 into 4.9. `MITIGATES` needed for M01→4.9 |
| **D-025** | 4.9 fits `EXPOSURE / RISK`; obsolescence and future shrinkage move there from the carrying rate |
| **D-002** | Component-wise carrying cost carries the weakest component's basis. Capital is `CALCULATED`, never `ACTUAL` |
| **D-019** | DP-13's three claim levels map onto the ladder without new states |
| **D-020** | ⚠ **Finding 2's financing double-count is a D-020 case** — one economic benefit, two candidate channels |

---

# EXIT REPORT

## 1. LOCKED / READY decisions

| | Verdict |
|---|---|
| **DP-10** | **READY** — structure, with three additions: no pending orders → no Opportunity · financing double-count must be resolved · deferral needs `F-39` and may be negative |
| **DP-11** | **READY** — retire 4.2; shelf-life **triggers 4.3 earlier**, it is not independent |
| **DP-12** | **READY** — `EXPOSURE / RISK`. No new class. Exposure and expedite counts are not additive |
| **DP-13** | **READY** — prospective indication, retrospective realization. Carve-out recorded as a question, not an assumption |
| **DP-14** | **READY** — three factory-facing roles; adjudicator stays a reviewer |
| **DP-15** | **READY** — component principle, **hardened**: a whole rate is almost certainly invalid |

## 2. AMENDMENTS REQUIRED

**Three, not four** — rule-10 purpose and D-023 fitness are one.

1. **D-011** — Owner splits into Finding · Action · Data
2. **D-014 rule 10 + D-023** — structured `purpose`; blocking on mismatch; *never misapply*
3. **D-031** — `MITIGATES`, disclosure-only

Plus **one resolution, not an amendment**: **which channel claims the financing effect** — deferral, or the capital component of carrying cost.

## 3. FACTORY DATA REQUIRED

**`F-08`** carrying-cost **components and construction purpose** — not a single rate · **`F-33`** is space constrained · **`F-39`** expected price movement over a deferral window · `F-22` cost of funds · `F-40` inventory taxes · `F-01`/`F-06` expedite capture *(gates DP-13)* · `F-35` escalation records · `F-36` override history · `F-27` substitutes · `F-34` shelf lives · **new: do items exist whose demand cannot be rescheduled or suppressed?**

## 4. NEW QUESTIONS

| ID | Question |
|---|---|
| **B2-01** | **Which channel claims the financing effect** — deferral, or capital-in-carrying-cost? They are the same quantity |
| **B2-02** | Does a class of items exist whose demand cannot be rescheduled or suppressed, narrowing DP-13's blind spots? |
| **B2-03** | Does the disposal **tax effect** belong to finance entirely, or is it disclosable here? |
| **B2-04** | Is *"excess without pending orders"* reported as a position, and if so where — since it is not an Opportunity? |

## 5. IMPACT SURFACE

`docs/decisions/decision-register.md` — D-011, D-014, D-023, D-031 amendments; DP verdicts recorded ·
`docs/domain/03-saving-opportunity-model.md` — 4.2 retired, 4.9 reclassified, carrying-cost components, owner fields ·
`docs/domain/04-mechanism-01-expedite-premium.md` — `MITIGATES` to 4.9 ·
`context/code-standards.md` — rate fitness blocking; no whole-rate carrying cost; three owner fields ·
`context/specs/00-build-plan.md` — U-17 owner fields; U-18 rate-purpose gate ·
`docs/open-questions.md` — B2-01 … B2-04; `F-08` restated as components-and-purpose.

## 6. FINAL BLOCK-2 STATUS

**Complete.** Six decisions have definitive verdicts. Three amendments are specified. **No unresolved decision is disguised as future work** — B2-01 … B2-04 are open questions with owners, and B2-01 is a genuine choice between two valid channels rather than a deferral.

**No hidden monetary assumption remains.** The two that were hidden are now surfaced: the **financing double-count**, and the **assumption that zero price movement is a safe default**.

## 7. EXACT NEXT STEP — PART 2.3

**Do not start Part 2.3 until:**

1. The six DP verdicts are approved
2. The three amendments are approved and applied
3. **B2-01 is resolved** — the quantity mechanism cannot compute a net benefit without knowing which channel claims the financing effect
4. Block 1's D-001/D-002 amendments are applied

`FACT` **B2-01 is the hard gate.** Items 1, 2 and 4 are approvals of work already done. B2-01 is a genuine unanswered question, and Part 2.3's central calculation depends on it.

---

**Nothing locked. Nothing applied. Awaiting your decisions.**
