# 10 — Q-07: Saving Model Reconciliation

> ## ⚠ AUDIT ONLY — NOTHING REWRITTEN, NOTHING LOCKED
> No category has been modified. No formula invented. No percentage, threshold, confidence constant or factory fact introduced.
> **No code, no UI, no schemas. Part 2.3 not started.** **Date:** 2026-08-07

**The test applied to every category:**

> Does it define a **defensible intervention + testable counterfactual**, or does it still rely on a **category-level formula applied to a total**?

**Headline result: no category passes as written.** 4.9 comes closest — its conclusion survives, but its classification changes.

---

## Already resolved — not re-audited

| Category | Status |
|---|---|
| **4.4** Purchase price variance | **Mechanism 02**, locked Part 2.2. Renamed *Procurement Price Opportunity* |
| **4.5** Order consolidation | **Retired and redistributed**, D-032 |
| **4.8** Emergency purchasing / expedited freight | **Mechanism 01**, locked Part 2.1 |

---

# 4.1 — Excess stock → working capital release

### 1. Current model, verbatim

> **Impact:** one-time (capital) + recurring (carrying cost avoided)
> **Inputs:** on-hand, consumption rate, lead time, target coverage policy, unit cost
> **Calculation:** `excess qty = on-hand − (target coverage × consumption rate)`; value at unit cost

### 2. Where it conflicts

**(a) It is a formula over a total.** `target coverage × consumption rate` is a policy parameter multiplied by an aggregate — the exact shape D-027 forbids. There is **no intervention** and **no counterfactual** anywhere in it.

**(b) "Excess" is defined by a policy, not by evidence.** If the target is 60 days and you hold 90, the formula declares 30 days excess. But whether 60 is the right target is *itself* an open question — and arguably a different opportunity (4.7). The category assumes its own baseline.

**(c) The most serious problem: the capital is already spent.**

You cannot un-buy stock. The realistic interventions are:

| Intervention | Reality |
|---|---|
| Defer or reduce future purchase | **The real one, almost always** |
| Return to supplier | Rare, usually penalised |
| Sell or scrap | **Loss recognition, not saving** — same logic as 4.3 |
| Transfer to another site | Out of scope (single site, D-007) |

### 3. Why the old logic is unsafe

> **"Working capital release of 200,000 EGP" is not 200,000 EGP saved.**

The mechanism by which excess stock frees cash is that you **stop spending on replenishment while consuming what you hold**. That is a **cash-flow timing effect**. If the same total quantity is eventually purchased, the *saving* is not the principal — it is the **financing benefit over the deferral period**, plus carrying cost avoided.

Reporting the principal as a benefit overstates it by the reciprocal of the financing rate. D-012 already keeps it out of Potential Annual Saving — but it is still displayed as a headline magnitude, and **a magnitude implies a benefit.** See `DP-10`.

### 4. Re-expressed conceptually

| | |
|---|---|
| **Intervention** | Defer or reduce specific planned/committed purchases for item X |
| **Counterfactual** | *"On-hand covers N days of observed consumption. Purchase orders / planned orders totalling Q are scheduled to arrive within that window. Deferring these specific orders by D days avoids Y outlay in the period without breaching the stated coverage policy."* — **testable per order, not per item aggregate** |
| **Evidence** | Ledger on-hand · observed consumption history · **open POs and their ETAs** · stated coverage policy |
| **Factual conditions** | Consumption history sufficient (D-019 ladder) · coverage policy defined (`A-18`) · cost reference not stale · item not seasonal without a profile |
| **Incremental costs / offsets** | Stockout risk created by deferral — **an exposure, disclosed not netted** (D-031, and 4.9 cannot be valued) · possible supplier penalty for deferral |
| **Provenance** | Deferred outlay `CALCULATED` from `ACTUAL` orders; carrying cost avoided inherits `ASSUMED` if the rate is assumed (`F-08`) |
| **FX** | Required where the deferred purchase is foreign-denominated (D-024) |

### 5. Classification

**Valid future mechanism** — quantity / inventory domain. **Requires full conceptual rewrite.**

⚠ But see `DP-14`: it is *detected* in inventory and *acted on* through purchasing. Its domain ownership is genuinely ambiguous.

### 6. Factory-data dependencies

On-hand (ledger) · consumption history (`F-10`) · **open and planned purchase orders with quantities, prices and ETAs (Orders & Supply Movement)** · unit cost (`F-08` area) · coverage policy (`A-18`) · financing rate for the timing value (`F-22`).

### 7. Contradictions and double counting

| Against | Type |
|---|---|
| **M02 price break** — "buy more to reach the break" vs "you hold too much" | **CONTRADICTION** (D-029) — opposed direction, same subject, overlapping window |
| **4.7** — both reduce stock | **DOUBLE COUNTING** (D-020) — same money, two framings. 4.1 is symptom, 4.7 is cause |
| **4.6** — MOQ-forced excess is a subset of excess | **DOUBLE COUNTING** |

---

# 4.2 — Slow-moving stock

### 1. Current model, verbatim

> **Impact:** recurring (carrying cost)
> **Refuses when:** movement history shorter than the aging window

### 2. Where it conflicts

**It has no calculation at all, and no intervention.** It is not a formula conflict — it is a **category that is not a mechanism.**

"This stock moves slowly" is an **observation**. Ask what the intervention is, and the answer is always someone else's: stop buying it (4.1) or dispose of it (4.3). It has **no independent action.**

### 3. Why it is insufficient

A category that cannot state its own intervention cannot produce a defensible saving under D-027. Left in the taxonomy it would either produce nothing, or borrow 4.1's and 4.3's claims — **double counting by construction.**

Nor is it an `OBSERVED COST`: carrying cost on slow stock is **imputed** from a rate, not invoiced. Under D-025, `OBSERVED COST` is `ACTUAL`. An imputed figure is `CALCULATED` and does not qualify.

### 4. Re-expressed conceptually

Not as a mechanism. As a **detection signal**: identifies candidate items for 4.1 and 4.3, using ledger movement history alone. Produces **no currency figure of its own.**

### 5. Classification

**Duplicate / absorbed.** Recommend **retiring 4.2 as a saving category** and retaining it as a detection input. See `DP-11`.

### 6. Factory-data dependencies

Movement history (ledger) · aging window definition (`A-18`).

### 7. Contradictions and double counting

**Its entire risk is double counting** with 4.1 and 4.3, which is precisely why it should not be a category.

---

# 4.3 — Dead / obsolete stock

### 1. Current model, verbatim

> **Impact:** recurring (carrying cost avoided) + space recovered
> **⚠ Deliberate exclusion:** the *value of the stock itself is not a saving.*

### 2. Where it conflicts

**The exclusion principle survives D-027 intact and is correct.** Two problems remain:

**(a) "Carrying cost avoided" is a rate × total** — a percentage applied to an aggregate, in disguise.

**(b) ⚠ Applying an average carrying rate to a marginal decision.** If the warehouse is not full, the **marginal** storage cost of dead stock may be near zero. Finance's carrying rate is an **average** that assumes the space has an alternative use. Applying it to a disposal decision assumes a counterfactual use of space that may not exist.

This is a genuine and non-obvious error class. See `DP-15`.

**(c) "Space recovered" has no basis at all** — no rate, no method, no source.

### 3. Why the old logic is unsafe

It would produce a confident figure resting on an average rate applied where a marginal rate is the correct one, plus an unquantified space term. Both are invisible to the reader of the number.

### 4. Re-expressed conceptually

| | |
|---|---|
| **Intervention** | Dispose of specific identified lots — scrap, sell, or return |
| **Counterfactual** | *"These specific lots have had no movement since date D. Disposing of them avoids ongoing carrying cost of X and recovers Y, at a disposal cost of Z."* |
| **Evidence** | Ledger movement history per lot · disposal quotes or recovery values · disposal cost |
| **Factual conditions** | Movement history exceeds the aging window · **marginal storage cost basis is available** (`DP-15`) · recovery and disposal values known |
| **Incremental costs / offsets** | **Disposal cost** and **recovery value** — both currently unknown factory data. Net = carrying avoided + recovery − disposal cost |
| **Provenance** | Carrying cost avoided inherits `ASSUMED` from `F-08`. Recovery and disposal are `ACTUAL` only if quoted |
| **FX** | Rarely relevant; applies if recovery is foreign-denominated |

### 5. Classification

**Valid future mechanism**, but small and heavily dependent on inputs we do not have. Requires conceptual rewrite.

### 6. Factory-data dependencies

Movement history · aging definition (`A-18`) · `F-08` carrying basis · **new**: disposal cost, recovery value, and whether marginal storage cost is knowable.

### 7. Contradictions and double counting

Overlaps **4.2** (which should not be a category) and **4.1** at the boundary — where does "excess" end and "dead" begin? A threshold question (`A-18`), and the same stock must not be claimed by both.

---

# 4.6 — MOQ optimisation

### 1. Current model, verbatim

> **Impact:** one-time + recurring
> **Calculation:** excess forced by MOQ, valued and carried
> **Refuses when:** MOQ not recorded on the supplier's item terms

### 2. Where it conflicts

**(a) "Valued and carried" is a rate × total.**

**(b) "Excess forced by MOQ" assumes the MOQ caused the excess** — which requires knowing what would otherwise have been ordered. That *is* a counterfactual, but it is **implicit and untested**. D-027 requires it stated and tested per event.

### 3. Why the old logic is unsafe

It attributes all excess above requirement to the MOQ, when order quantity may have been chosen for other reasons entirely — price breaks, freight efficiency, or a buyer's judgement about supply risk.

### 4. Re-expressed conceptually

| | |
|---|---|
| **Intervention** | Negotiate a lower minimum order quantity with a specific supplier for a specific item |
| **Counterfactual** | *"For these N orders, MOQ forced quantity Q where the requirement was R. At a minimum of M, the forced excess would have been lower by (Q − M) on those specific orders."* |
| **Evidence** | PO lines · recorded MOQ terms · requirement at the time of ordering |
| **Factual conditions** | MOQ recorded (`F-26` area) · requirement determinable at order time |
| **Incremental costs / offsets** | ⚠ **Negotiating MOQ down frequently raises unit price** — smaller batches cost the supplier more. **This composes with Mechanism 02 in the opposite direction: inventory improves, price worsens.** Both effects must be shown, per D-030's compose-but-keep-distinguishable rule |
| **Provenance** | Forced-excess quantity `CALCULATED` from `ACTUAL` orders; its valuation inherits from `F-08` |
| **FX** | Required if the price consequence is foreign-denominated |

### 5. Classification

**Valid future mechanism** — quantity domain (D-030: MOQ changes quantity). **Composes with Mechanism 02.**

### 6. Factory-data dependencies

**Supplier MOQ terms** · **PO lines with quantities (Orders & Supply Movement)** · requirement at order time · `F-08` · price impact of MOQ reduction.

### 7. Contradictions and double counting

| Against | Type |
|---|---|
| **4.1** — MOQ-forced excess is a subset of excess | **DOUBLE COUNTING** |
| **M02** — MOQ reduction may worsen price | **COMPOSITION in opposite directions.** Not contradiction — one negotiation, two effects, both disclosed |

---

# 4.7 — Reorder point / safety stock optimisation

### 1. Current model, verbatim

> **Impact:** one-time (capital) + recurring (carrying)
> **Inputs:** consumption variability, lead-time variability, service-level target
> **Refuses when:** lead-time sample below `A-12` · service-level target undefined (`P-06`)
> **⚠** Reducing safety stock trades capital against stockout risk. **An opportunity that presents only the capital gain and hides the risk it creates is dishonest.** Both sides must be shown.

### 2. Where it conflicts

No formula is stated, but the inputs imply a **statistical safety-stock model**. That is not a percentage-over-total — but it shares the defect: **it produces a number from assumptions rather than from a testable counterfactual.**

Specifically it needs a **service-level target** (a business decision, `P-06`/`N-11`) and **distributional assumptions** — typically normality — that may not hold for a factory with lumpy, seasonal or FX-driven demand.

### 3. Why the old logic is insufficient

A modelled service level is unfalsifiable against history. If the model says 95% and you had two stockouts, was the model wrong or was it the 5%? Nothing in the output can be checked.

### 4. Re-expressed conceptually — **and this one has a genuinely stronger form**

> **Backtested safety stock, not modelled safety stock.**

| | |
|---|---|
| **Intervention** | Reduce safety stock for item X from S to S′ |
| **Counterfactual** | *"Over the last 12 months, on-hand for item X never fell below level L. Reducing safety stock to L would not have caused a stockout in any observed period."* — **checkable against recorded history, event by event** |
| **Evidence** | Ledger balance history · receipt and consumption timing · observed lead times (ordered → received) |
| **Factual conditions** | Sufficient usable history (D-014 rule 11) · lead-time sample sufficient (`A-12`) |
| **Incremental costs / offsets** | ⚠ **Reducing safety stock creates or deepens a stockout exposure** — and per 4.9 that exposure **cannot be valued**. Therefore **disclosed, never netted** (D-031) |
| **Provenance** | `CALCULATED` from `ACTUAL` observed history. **Stated limitation: the past is not the future** — a demand spike absent from history is not covered |
| **FX** | Applies to the capital figure if stock is foreign-sourced |

**This uses only observed data, produces an event-level testable claim, and needs no service-level assumption.** See `DP-13`.

**Note:** D-031 — designed for Mechanism 02 — turns 4.7's existing warning from an advisory sentence into a **structurally enforced disclosure**. The old text said "both sides must be shown"; D-031 makes it impossible not to.

### 5. Classification

**Valid future mechanism** — quantity domain. Requires conceptual rewrite, and the backtested form is materially stronger than the modelled one.

### 6. Factory-data dependencies

Ledger balance history · **observed lead times, which are ordered-date → received-date and therefore come from Orders & Supply Movement** · `F-08` · `N-11` service-level target *(no longer required under the backtested form)*.

### 7. Contradictions and double counting

| Against | Type |
|---|---|
| **Mechanism 01** — its fix often *raises* reorder point to avoid expedites | **CONTRADICTION** (D-029). **This is the exact case predicted in Part 2.1 §8** — lead-time correction avoids it, reorder-point raising does not |
| **4.1** — both reduce stock | **DOUBLE COUNTING** |
| **4.9** — reducing safety stock deepens stockout exposure | **D-031 `DEEPENS`** |

---

# 4.9 — Stockout avoidance

### 1. Current model, verbatim

> **Impact:** avoided cost
> **Status in release 1: NOT QUANTIFIABLE.**
> The system may **flag stockout risk** … but it may not attach a currency figure to it.

### 2. Where it conflicts

**Its conclusion is correct and survives D-027 intact.** What has changed is that it now has a **proper home** that did not exist when it was written.

### 3. Why it needs reclassification rather than rewriting

It was written as *"a category that refuses to produce a number"* — an awkward shape. Under D-025 as amended it is cleanly an **`EXPOSURE / RISK`**: forward-looking, no defensible currency value, may carry mitigation.

That reclassification also makes it the exposure that **4.7 deepens** and that **4.1 creates** — the model becomes coherent rather than merely consistent.

### 4. Re-expressed conceptually

Not a saving mechanism. An **`EXPOSURE / RISK` finding**: *"item X is at risk of stockout"* — with no currency figure, per D-007 (no production impact model) and D-031 (no invented value).

Mitigations that acquire a defensible counterfactual **become Opportunities** in their own right.

### 5. Classification

**Move to another domain** — `EXPOSURE / RISK` class. See `DP-12`.

### 6. Factory-data dependencies

Ledger on-hand and consumption · **inbound supply: open POs, ETAs, current location, port and customs milestones — all Orders & Supply Movement.** A shipment stuck at port changes stockout risk materially, and that fact is invisible without movement visibility.

### 7. Contradictions and double counting

None — it produces no currency. It is the **target** of D-031 `DEEPENS` links from 4.1 and 4.7.

---

# Orders & Supply Movement — dependency check

**Classification unchanged: `ENABLER`, not a saving mechanism.** Not turned into one here.

| Element | 4.1 | 4.2 | 4.3 | 4.6 | 4.7 | 4.9 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Purchase orders | ● | | | ● | ● | ● |
| Supplier | | | | ● | ● | |
| Ordered quantity | ● | | | ● | ● | ● |
| Agreed price | ● | | | ● | | |
| Payment / financing conditions | ● | | | | | |
| Shipment | | | | | | ● |
| Freight | | | | ● | | |
| Current location | | | | | | ● |
| Port / customs milestones | | | | | | ● |
| ETA | ● | | | | ● | ● |
| Receiving | ● | ● | ● | | ● | |
| Actual delivery | | ● | ● | | ● | |
| Actual outcome | ● | | ● | ● | ● | |

**Two findings worth recording:**

**1. Orders & Supply Movement is a dependency of the inventory and quantity categories, not only of mechanisms 01 and 02.** Every remaining category except 4.2 depends on it.

**2. Lead-time variability — 4.7's central input — *is* the order journey.** Ordered-date → received-date is precisely what this enabler captures. Without it, 4.7's backtested form has no lead-time evidence.

The eventual chain — *Saving Opportunity → Decision → Order → Supplier → Supply Movement → Receipt → Actual Outcome* — is recorded as a **domain and operating requirement**, not a UI or implementation request.

---

# Summary

## A. Categories fully compatible as written

**None.** 4.9's *conclusion* survives intact but its *classification* changes; 4.3's exclusion principle survives but its calculation does not.

## B. Categories requiring conceptual rewrite

| | Reason |
|---|---|
| **4.1** | Formula over a total; no intervention; **and capital release is a cash-flow timing effect, not a benefit of its principal** |
| **4.3** | Rate × total; **average carrying rate applied to a marginal decision**; unquantified space term |
| **4.6** | Rate × total; counterfactual implicit and untested |
| **4.7** | Modelled rather than backtested; needs an assumed service level. **The backtested form is materially stronger** |

## C. Categories that duplicate or overlap existing mechanisms

**4.2 slow-moving stock** — no independent intervention. Absorbed into 4.1 and 4.3 as a **detection signal**. Its entire risk profile is double counting.

## D. Categories that should move to another domain

**4.9 stockout avoidance** → **`EXPOSURE / RISK`** class. It becomes the exposure that 4.1 creates and 4.7 deepens.

## E. Unowned gaps

| Gap | Note |
|---|---|
| **Shipment consolidation** | Existing (D-032). Unchanged |
| **Logistics-cost domain** | Existing. Unchanged |
| **Disposal economics** | **New.** Recovery value and disposal cost are owned by no mechanism and unavailable |
| **Time value of deferred outlay** | **New.** 4.1's real financial benefit needs `F-22`, and no mechanism currently claims it |

## F. Factory-data dependencies

**New, raised by this audit:** disposal cost and recovery value (4.3) · marginal versus average storage cost basis (4.3) · requirement-at-order-time (4.6) · price impact of MOQ reduction (4.6) · coverage policy definition (`A-18`, blocking 4.1 and 4.3).

**Existing and confirmed:** `F-08` carrying basis · `F-10` consumption history · `F-22` financing rate · `A-12` lead-time sample · `A-18` thresholds · **the full Orders & Supply Movement set.**

## G. Cross-mechanism contradictions

| Pair | Type | Note |
|---|---|---|
| **4.7 vs Mechanism 01** | **CONTRADICTION** | M01's fix raises reorder point; 4.7 lowers it. **The case predicted in Part 2.1 §8**, now confirmed |
| **4.1 vs Mechanism 02** | **CONTRADICTION** | Price break says buy more; excess says buy less |
| 4.1 vs 4.7 | Double counting | Same stock, symptom vs cause |
| 4.1 vs 4.6 | Double counting | MOQ-forced excess is a subset |
| 4.1 vs 4.3 | Boundary | Where excess ends and dead begins (`A-18`) |
| 4.6 vs Mechanism 02 | **Composition, opposed** | One negotiation, two effects, both disclosed |
| 4.7 → 4.9 | **D-031 `DEEPENS`** | Reducing safety stock deepens stockout exposure |

**D-029 and D-031 both earn their keep here.** Neither was designed for these categories, and both resolve problems the categories could not resolve themselves.

## H. New decision points

| ID | Decision |
|---|---|
| **DP-10** | **Is "working capital release" reported as a magnitude?** If so, how is it labelled so that a principal is not read as a benefit? Its actual value is the financing cost over the deferral period |
| **DP-11** | **Retire 4.2 as a saving category**, retaining it as a detection signal? |
| **DP-12** | **Reclassify 4.9 as `EXPOSURE / RISK`?** |
| **DP-13** | **Accept backtested safety stock** as the re-expression of 4.7, replacing the modelled form? |
| **DP-14** | **Which domain owns 4.1** — detected in inventory, acted on through purchasing? |
| **DP-15** | **Is an average carrying rate acceptable for a marginal disposal decision (4.3)?** If the warehouse is not full, marginal storage cost may be near zero |

---

**Nothing rewritten. Nothing locked. Awaiting review.**
