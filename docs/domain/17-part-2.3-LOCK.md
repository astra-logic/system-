# 17 — PART 2.3 LOCK: Mechanism 03 — Quantity & Inventory Economics

> ## ✅ LOCKED — 2026-08-08
> **Authoritative statement of Part 2.3.** Governed by D-014 (the 16 financial-trust rules) and D-017 … D-041.
> **No code, no UI, no schemas, no formulas implemented.**
> No rate, percentage, threshold, probability, severity score or factory fact invented anywhere in this document.

**Workflow executed in full:** WORKSHOP → ADVERSARIAL CHALLENGE → RECONCILIATION → DECISION REPORT → LOCK → PROPAGATION → CONSISTENCY AUDIT. No stage skipped.

---

# PART A — WORKSHOP

## A1. The mechanism

> **Mechanism 03 — Quantity & Inventory Economics** identifies a defensible opportunity where a **change to the quantity, timing or frequency of purchase, or to the inventory level held**, produces a defensible economic consequence at **unchanged material requirement**.

The qualifier *at unchanged material requirement* is doing real work. It excludes every case where the factory simply needs less material — that is a consumption or specification change, and neither is in scope (D-007).

## A2. Boundaries — the twenty-three candidates, sorted

The instruction was *"do not force everything into one mechanism."* The dominant result of sorting is not that the list splits across mechanisms. It is that **most of the list are not opportunities at all.**

### In scope — genuine interventions

| Candidate | Subtype | Note |
|---|---|---|
| Order frequency | **A** | The same lever as order quantity, expressed inversely |
| Lot sizing · batch sizing | **A** | Purchasing lot size. Production batch sizing is out (D-007) |
| Temporal consolidation | **A** | D-032 sent it here. Fewer, larger orders — the *opposite direction* to order-quantity reduction |
| Reorder point | **B** | Decomposes; see A5 |
| Safety stock | **B** | Governed by D-037 |
| Excess inventory | **C** | Six interventions (D-033), not one |
| Purchase deferral | **C** | Financing value only, possibly negative |
| Dead stock | **C** | The *state* is not the finding; **disposal** is the intervention |
| MOQ | **D** | Only where an alternative is evidenced — see A6 |
| Price breaks | **D** | Composes with Mechanism 02 |

### Not opportunities — and this is the more important half

| Candidate | What it actually is | Consequence |
|---|---|---|
| **Lead time** | An **input** to the trough | Never a finding. A *wrong* lead time is Mechanism 01's |
| **Lead-time variability** | An **input**, and an exposure driver | Never a finding |
| **Demand variability** | An **input** | Never a finding |
| **Annual volume** | An **input** | Never a finding. Multiplying anything by it is the §4.4 error |
| **Ordering cost** | A **cost component** (`F-31`) | Consumed by the calculation. Finance-owned, never defaulted |
| **Carrying cost** | A **cost component** (`F-08`), and per D-035 not even one number | Consumed component-wise |
| **Service levels** | A **policy parameter** the factory sets (`N-11`, `P-06`) | We never invent one and never derive a saving from one |
| **Stockout risk** | **`EXPOSURE / RISK`** (D-034) | Never an Opportunity, never valued |
| **Slow-moving stock** | **Retired** (D-034) | Detection signal only |
| **Supplier minimums** | A **constraint on the counterfactual** | An opportunity only where an alternative exists |
| **Supplier consolidation** | **Mechanism 02** (D-032) | Same quantity, fewer suppliers |

> ⚠ **Eleven of the twenty-three items are inputs, parameters or states.** A taxonomy that lists them as saving categories — which is what §4.1–4.7 partially did — produces a category for every noun and an intervention for none. **The mechanism is a set of interventions on the ordering policy, not a list of nouns.**

### The one that belongs to nobody

**Shipment consolidation** remains the unowned future-domain gap D-032 preserved. It is **not** part of this mechanism: it changes freight cost at unchanged purchase quantity, which is logistics economics, not quantity economics. Its relevance here is now sharper than "acknowledged" — see the blocking finding in A7.

## A3. One mechanism or four? — the structural argument

**Four mechanisms would break D-020.** Deduplication is performed at the **economic-mechanism** level. Subtypes A, B and C all lower average inventory, and all three would claim the capital component of carrying cost. As four mechanisms, nothing structurally prevents the same money being claimed twice; the guard would be discipline, and D-025's reasoning says a rule enforced by discipline eventually is not enforced.

**One flat mechanism would break the evidence bar.** Subtype A is quantifiable from recorded data; subtype B is not (D-037). Merging them lets A's defensible claims inherit B's unreachable ones — or worse, lets B's claims borrow A's credibility.

**Resolution: one mechanism, four subtypes, one shared quantification base.** The base is the **inventory position path** (D-039). Every subtype changes the same path; the path is computed once; the money is claimed once.

## A4. The quantification base

```
Δ position path over window W    →  carrying delta, COMPONENT-WISE (D-035)
Δ order count over window W      →  ordering-cost delta (F-31)
Δ unit price × quantity CONSUMED →  price delta — Mechanism 02's, composed
```

The position path under the counterfactual is obtained by **replaying recorded issue events against the counterfactual ordering policy** (D-039). Never `Q/2`. Never an average-inventory formula. Those assume smooth depletion and instantaneous replenishment — EOQ's assumptions arriving through the side door.

## A5. The peak/trough decomposition

```
trough  =  reorder point  −  demand during lead time     ← the BUFFER sets this
peak    =  trough  +  order quantity                      ← ORDER QUANTITY sets this
```

Two consequences follow, and they are the most useful results in Part 2.3.

**First — subtype A does not make a stockout claim.** A counterfactual that lowers only the peak leaves the trough exactly where it was observed. It therefore asserts nothing about whether a lower level would have sufficed, and **D-037's unreachable evidence bar does not apply to it.** Subtype A is Mechanism 03's defensible first slice for the same reason lead-time correction was Mechanism 01's (D-015): the whole counterfactual sits inside recorded data.

**Second — the reorder point decomposes across mechanisms.**

```
reorder point  =  lead-time demand  +  safety stock
                        ↑                    ↑
              Mechanism 01's lever     subtype B's lever
```

Mechanism 01 and subtype B act on **different components of the same parameter**, so they **compose** rather than automatically contradicting. If lead time was understated *and* safety stock overstated, correcting both may net in either direction. D-029 still catches the case where both act on the *same* component in opposite directions.

## A6. MOQ and price breaks

**A cheaper unit price is not automatically a saving.** Three cases, tested separately.

### (i) Buy more to earn a lower unit price

```
benefit   (p − p′) × quantity ACTUALLY CONSUMED within the horizon   ← Mechanism 02's half
offset    incremental carrying on the additional stock held          ← Mechanism 03's half
offset    incremental freight per shipment, where applicable          ← unowned, see A7
exposure  obsolescence · specification change · demand falling away · FX
```

> ⚠ **The discount is earned on the quantity purchased; the saving is realised only on the quantity consumed.** Buying twelve months' supply for 5% off and consuming eight months' worth before the specification changes saves 5% on two-thirds and loses 100% on the rest.

A naive price-break calculation multiplies the discount by the **purchased** quantity. That is the same class of error as §4.4's `(price difference × annual volume)` — a rate applied to a total — and it is forbidden by D-027. **The consumed quantity is not knowable prospectively**, so a forward price-break claim is bounded by the horizon over which consumption is evidenced, and beyond that horizon it is `INSUFFICIENT_DATA`.

### (ii) Buy less despite MOQ

⚠ **§4.6 as currently written has no intervention.** *"Excess forced by MOQ, valued and carried"* computes a cost against an action that does not exist. If the MOQ cannot be changed, the carrying cost of the forced excess is **the price of doing business with that supplier** — an `OBSERVED COST` at most, never an Opportunity.

It becomes an Opportunity **only** where an alternative is evidenced: a negotiated lower MOQ, an alternative supplier with a lower one (`F-20`), or a smaller order multiple. **This is the same defect that retired §4.2** — a category computing a number with no available action — and §4.6 is reshaped on the same grounds rather than retired, because the alternative sometimes genuinely exists.

### (iii) Annual commitments and volume rebates

Quantity over the window changes, so the boundary (D-030) places them here; the price effect is Mechanism 02's, and the two compose with the effects kept distinguishable. The commitment itself **`CREATES` an `EXPOSURE / RISK`** (D-031) — shortfall and penalty clauses (`F-30`), which are **disclosed, never netted** and never assigned a probability.

## A7. ⚠ The offset that belongs to nobody — a blocking finding

Subtype A's honest net requires **freight per shipment**. Ordering smaller and more often means **more shipments**, and freight is not ordering cost: ordering cost is administrative (`F-31`), freight is logistics.

**D-032 recorded the logistics-cost domain as an unowned future-domain gap.** That gap is no longer merely acknowledged — **it now blocks a currency claim.**

| Case | Consequence |
|---|---|
| Domestic, supplier-delivered, freight not separately borne | Subtype A can be netted honestly |
| **Imported, or freight borne per shipment** | ⚠ **Subtype A's net is incomplete in the optimistic direction.** Under D-041 the figure must declare it |

**No freight component is invented to close the gap.** Where freight per shipment is material and unowned, the claim is `INSUFFICIENT_DATA` — not a smaller number with a caveat.

---

# PART B — ADVERSARIAL CHALLENGE

Every candidate was tested on the ten required points. Only the results that changed something are recorded; restating a conclusion is not analysis.

## B1. The ten-point test, by subtype

| | **A — order policy** | **B — buffer policy** | **C — position correction** | **D — quantity/price** |
|---|---|---|---|---|
| **1 Current state** | Order `Q` on reaching `s` | Buffer level `b` | Stock exceeds requirement | Ordering at `Q`, price `p` |
| **2 Intervention** | Order `Q′ < Q` more often | Reduce `b` | Defer · cancel · dispose | Order `Q′ > Q` at `p′ < p` |
| **3 Counterfactual** | Replay issues against `Q′` | Replay against `b′` | *"This order is not required within the horizon"* | Replay against `Q′`, price `p′` |
| **4 Quantity changed** | Per-order; **total unchanged** | Held level only | One order or one lot | Per-order; **total unchanged** |
| **5 Window** | Annualisation window | Annualisation window | **The deferral window only** | Consumption horizon of the extra stock |
| **6 Economic effect** | Lower average stock; more orders | Lower average stock | One-time cash timing | Price benefit − carrying − freight |
| **7 Incremental cost** | Ordering cost · **freight (A7)** | None direct | Cancellation penalty · disposal cost | Carrying · freight · capital |
| **8 Exposure** | ⚠ **More cycles → more exposure occasions** | **Stockout — unvaluable** | Stockout if demand was underestimated | Obsolescence · spec change · FX · commitment |
| **9 Evidence** | Ledger · receipts · `F-31` · `F-08` | + `F-01`, `F-35`, `F-36`, `F-27` | + open orders · `F-22` · `F-39` | + `F-26` · `F-30` · consumed-quantity history |
| **10 Measurable** | **Yes — trough unchanged** | **No prospectively** (D-037) | Financing value only | Only to the evidenced consumption horizon |

## B2. Findings that changed a conclusion

### ⚠ 1. Smaller orders increase exposure occasions

Reducing order quantity at an unchanged reorder point leaves the trough where it was — but it **increases the number of replenishment cycles**, and therefore the number of occasions on which the item is exposed to lead-time variability. **The trough is unchanged; the frequency of approaching it is not.**

This was missing from the workshop's first pass, which treated subtype A as having no exposure at all. It is disclosed as **`DEEPENS`** on the stockout exposure, **qualitatively** — direction stated, magnitude never, because a magnitude would require the invented probability D-017 forbids.

### ⚠ 2. Partial receipts make PO quantity the wrong input

If a supplier already delivers a 300-unit order in three instalments of 100, the position path **already reflects an effective order quantity of 100.** A subtype A opportunity computed from **PO quantity** would propose a change the factory has effectively already made, and would claim a saving that does not exist.

> **The mechanism computes the position path from *receipt* events, never from purchase-order quantities.**

This is not a refinement. It is the difference between a real finding and a fictional one, and it is invisible unless partial receipts are considered.

### ⚠ 3. `Q′` has a floor read from data, not chosen

A counterfactual order quantity below the **maximum observed lead-time demand** would trigger a second reorder before the first arrived — the trough would fall, and D-037's unreachable bar would apply after all. The floor is **read from recorded lead times and issues**, not selected. Below it, subtype A silently becomes subtype B.

### ⚠ 4. Subtype C's disposal counterfactual rests on a backward-looking proxy

*"No requirement is evidenced"* is a **forward-looking** claim, and D-010 gives only **observed consumption** — a backward-looking proxy. The claim is defensible only as *"no movement since date D and no open requirement recorded"*, which is what the system may say, and it is weaker than *"will never be consumed."*

### 5. The double count between subtypes, tested and closed

| Pair | Same money? | Resolution |
|---|---|---|
| A ↔ B | **Yes** — both lower average stock | One shared position path; the delta is computed once |
| C ↔ A/B | **Yes** — a deferral is a level change a policy would also produce | D-036: level-change and policy-change channels are mutually exclusive |
| D ↔ Mechanism 02 | **No** — price effect and carrying effect are genuinely independent | Composed, kept distinguishable (D-020, D-030) |
| A ↔ Mechanism 01 | **No** — expedite premium is a different economic event | Independent |

## B3. EOQ — the attack

Locked as **D-040**. The result in one line:

> **EOQ requires exactly the two inputs this project has already forbidden inventing — ordering cost and holding cost — and its "no shortages" assumption is structurally inconsistent with safety stock existing at all.**

Two further results are worth stating because they are not the obvious ones.

**EOQ is the wrong *kind* of thing.** It is a prescriptive optimiser; D-027 requires an event-level counterfactual. *"The optimum is 437 units"* is a model output, not evidence about what happened. Even with perfect `S` and `H`, EOQ would still be the wrong instrument — which is exactly the rate-fitness failure D-023's amendment now governs, appearing in a second guise.

**EOQ's own mathematics argues against small claims.** The total-cost curve is flat near the optimum, so a substantial deviation from `Q*` changes total relevant cost only slightly. **Small quantity changes therefore produce savings inside the noise of the inputs.** A materiality gate is required before any subtype A claim is presented — and its threshold is a finance-owned question (`B3-03`), not a number chosen here.

**Where EOQ may be used:** to **propose a candidate `Q′`** for evaluation by the replay, once `F-31` and the `F-08` components exist. **It may never produce the saving figure.**

## B4. Safety stock — what supports an increase

D-037 governs reduction. The instruction also asked what supports an **increase**, and the answer exposes a real asymmetry.

| | Evidence available |
|---|---|
| **Reduction** | **Absence of evidence** — no stockout, no recorded intervention. Structurally weak (D-037) |
| **Increase** | **Direct observation** — a recorded expedite, emergency purchase, substitution or missed issue |

> ⚠ **The evidence for increasing a buffer is strictly stronger than the evidence for reducing one.** A stockout that happened is a fact; a stockout that would not have happened is a counterfactual over unobservable interventions.

**And an increase is not a Mechanism 03 Opportunity.** The saving is the **avoided expedite premium** — Mechanism 01's currency; the cost is the **incremental carrying** — Mechanism 03's cost model; the risk reduction is **`MITIGATES`** on the stockout exposure (D-031 as amended). It is a Mechanism 01 Opportunity **consuming** Mechanism 03's cost model.

This is the concrete case that required `MITIGATES`: without it the opportunity shows a cost and an expedite reduction while its main justification — less stockout risk — is invisible, so a correct action looks purely bad.

**How the two variabilities enter.** *Lead-time variability* and *demand variability* enter as **inputs to the observed trough**, never as parameters of a distribution. The system reads what the trough actually was; it does not model what it might have been. A modelled service level is forbidden — it is unfalsifiable and requires assumed probabilities (D-017, D-023, `N-11`).

---

# PART C — RECONCILIATION

## C1. Contradiction engine — every candidate tested

**Intervention signature for Mechanism 03** (D-029): typed subject `item` (+ `supplier` for subtypes C and D) · affected dimensions from `{order_quantity, order_frequency, reorder_point, safety_stock, on_hand_level, supplier_share, unit_price}` · direction per dimension · effect window.

| Against | Result |
|---|---|
| **Mechanism 01** | **Composes** at component level — M01 moves lead-time demand, subtype B moves safety stock (A5). **Contradicts** only where both act on the same component in opposite directions. **Exposure and expedite counts are not additive** (D-034) |
| **Mechanism 02** | **Contradicts** where M02's price break says ↑ `order_quantity` while subtype A says ↓. **Composes** in subtype D, effects kept distinguishable |
| **Excess inventory** | Subtype C ↓ `on_hand_level` versus subtype D ↑ — direct contradiction on one item |
| **Safety stock** | Subtype B ↓ `safety_stock` versus a Mechanism 01 buffer increase ↑ — **same component, opposed. A true contradiction** |
| **MOQ** | A **constraint**, not an opposing opportunity. It bounds the counterfactual rather than conflicting with it |
| **Supplier concentration** | Subtype D's volume commitment ↑ `supplier_share` — `CREATES` or `DEEPENS` a concentration exposure |
| **FX exposure** | Buying ahead on an imported item `DEEPENS` FX exposure. **Disclosed, unvalued** (D-031) |
| **Cost / exposure / risk model** | Obsolescence and future shrinkage sit in `EXPOSURE`, never inside the carrying rate (D-035). §4.9 is `EXPOSURE` (D-034) |

### ⚠ The intra-mechanism contradiction

**Temporal consolidation** (fewer, larger orders) and **order-quantity reduction** (smaller, more frequent) are **both subtype A** and oppose on the same dimension for the same subject.

Neither Mechanism 01 nor Mechanism 02 had this property. **D-029 handles it unchanged** — the test is subject, dimension, direction and window, and it does not care whether the two Opportunities came from the same mechanism. But the mechanism must run **contradiction detection over its own outputs before presenting them**, which no previous mechanism was required to do.

**Which one is right is not resolvable in general.** It depends on the sign of `ordering cost + freight − carrying`, which needs `F-31`, `F-08` and the unowned freight component. Where those are unavailable, **both are `OPPORTUNITY DETECTED` without currency** and the pair is presented as an open question for the factory, not silently resolved.

## C2. Composition with the two locked mechanisms

```
Mechanism 01 ──consumes──▶  Mechanism 03's inventory cost model
                            (incremental carrying on a buffer increase)

Mechanism 02 ──consumes──▶  Mechanism 03's inventory cost model
                            (incremental carrying on a price-break purchase)

Mechanism 03 ──consumes──▶  Mechanism 02's price model
                            (subtype D's price benefit)
```

> **Mechanism 03 is load-bearing for M01 and M02 even where it produces no Opportunity of its own.** D-014 rule 6 requires certain incremental costs to be netted; for both locked mechanisms that cost is an inventory-carrying cost, and it comes from here.

**Consequence for sequencing.** Mechanism 02's price-break case cannot be netted honestly until Mechanism 03's component-wise cost model exists. That is a dependency neither Part 2.1 nor Part 2.2 recorded.

## C3. Monetary model

### Formulas, with their gates

```
POSITION PATH
    path′(t) = replay(recorded issue events, counterfactual policy)
    Basis: ACTUAL where issues and receipts are recorded; the policy is CALCULATED.
    Gate:  D-001 point-in-time reconstruction must exist.
    Forbidden: Q/2, average-inventory formulas, service-level models.

CARRYING DELTA over window W
    Δcarrying(W) = Σ over APPLICABLE components c:  rate_c × Δvalue(path, path′, W)
    Gate:  each rate_c is finance-owned (D-023), purpose-matched (D-014 rule 10),
           and classified ACTUAL / CALCULATED / NOT VALID / EXPOSURE (D-035).
    Forbidden: any whole rate; any EXPOSURE component; any NOT VALID component.
    Missing any applicable component → INSUFFICIENT_DATA, never a partial number
    presented as complete.

CAPITAL COMPONENT — the single financing channel (D-036)
    Δcapital(W) = r_funds × Δvalue(path, path′, W) × (W / 365)
    Gate:  r_funds is effective-dated (F-22). A scalar across a volatile year is
           false precision.
    Forbidden: claiming this AND a deferral financing value for the same money.

ORDERING DELTA over window W
    Δordering(W) = S × Δ(order count over W)
    Gate:  S is finance-owned (F-31). No default, by analogy with D-023.
    Blocks entirely without S.

FREIGHT DELTA
    UNOWNED (D-032). Where material, the claim is INSUFFICIENT_DATA (A7).

PRICE DELTA — subtype D only, Mechanism 02's half
    Δprice = (p − p′) × quantity CONSUMED within the evidenced horizon
    Forbidden: quantity purchased. Beyond the evidenced horizon: INSUFFICIENT_DATA.
```

**No percentage-of-total appears anywhere.** Every figure is a difference between two replayed paths over identified events.

### Per-subtype monetary properties

| | Units | Time basis | One-time / recurring | Currency-eligible | Realization |
|---|---|---|---|---|---|
| **A** | Currency | Annualisation window | **Recurring** | Carrying reduction **net of** ordering and freight | Observed order counts and position path after the change |
| **B** | Currency | Annualisation window | **Recurring** | **None prospectively** (D-037) | 12 months without stockout or recorded intervention (D-022) |
| **C** | Currency | **Deferral window only** | **One-time** | Financing value only, with `F-39`; **may be negative** | The deferred order either moved or did not — directly observable |
| **D** | Currency | Consumption horizon | Both | Price benefit − carrying − freight, all on **consumed** quantity | Price paid, and consumption of the additional stock |

**Confidence** is computed separately from observed coverage (D-014 rule 15) and never from any label above. Gates are pass / fail / unestablished and never become scores. **An unestablished dimension is never a pass.**

**Provenance.** The replay carries the weakest basis among its components; the imported cost reference is `USER_DEFINED` and ages to `STALE_DATA` (D-008, `N-09`); any component-wise carrying figure carries the weakest basis among its components (D-002).

## C4. Orders & Supply Movement — explicit dependency map

**Classification unchanged: `ENABLER`.** It produces no saving. It supplies evidence without which this mechanism cannot compute.

| O&SM element | Used by | Consequence if absent |
|---|---|---|
| Purchase order · order quantity | A, C, D | Ordering pattern unknown |
| **Ordered date** | A, B | Half of the lead-time measurement |
| Promised date | B | Promised-vs-actual variability |
| Shipment | A | **The freight-per-shipment offset (A7)** |
| **Receipt · actual arrival** | **All** | **The position path itself** |
| **Partial receipt** | **A** | ⚠ **Without it, subtype A is computed from the wrong quantity and produces fictional findings (B2.2)** |
| Supplier | C, D | MOQ, price breaks, commitments |
| **Lead time (ordered → received)** | **B** | The trough cannot be located |
| Delays | B | Variability, and the exposure disclosure |
| Expedite | B | **Gates D-037's level-B claim** (`F-01`, `F-06`) |
| **Actual outcome** | Realization | ⚠ **Chain broken in Release 1** — production consumption detail is out of scope (D-007) |

> **The operating chain is broken at *Actual Outcome*.** Procurement-side outcomes — price paid, freight paid, delivery timing, order counts, position path — are verifiable. Production-side outcomes are not. Every realization claim in this mechanism inherits that limit, and subtype A's realization is **entirely procurement-side**, which is a further reason it is the defensible first slice.

## C5. Factory evidence — the five classes

**A — required to DETECT.** Ledger position path (D-001) · recorded issue events · **receipt events including partials** · purchase-order history with dates and quantities · item master lead time and order multiple · supplier MOQ.

**B — required to QUANTIFY.** `F-31` ordering cost *(gates A entirely)* · `F-08` carrying **components and their purpose** *(gates A, B, D)* · `F-22` effective-dated cost of funds *(gates C, and the capital component)* · `F-33` is space constrained *(decides whether the space component exists at all)* · `F-40` inventory taxes · `F-39` expected price movement *(gates C; without it deferral is `INSUFFICIENT_DATA`)* · `F-26` price-break structures · `F-30` commitment penalty clauses · cost reference (`N-01`, U-14) · **freight per shipment — unowned (A7)**.

**C — required to APPROVE.** `A-18` coverage policy · `N-11` / `P-06` service-level policy, as the factory's stated policy and never as a modelled parameter · DP-14's three owner roles (D-011 as amended) · `F-24` / `F-25` adjudicator independence and capacity · `F-37` who owns data quality.

**D — required to REALIZE.** Post-change position path · post-change order counts · stockout and expedite occurrence (`F-01`, `F-06`) · the 12-month window (D-022) · a baseline captured at `APPROVED` (D-011).

**E — impossible to obtain in MVP.** Production rescheduling (D-007) · **demand suppression — structurally unrecordable** · true forward demand · stockout cost (D-007) · the supplier's own cost of a smaller order · whether the supplier will *accept* a changed order pattern.

### New factory questions this mechanism raises

| ID | Question | Why it matters |
|---|---|---|
| **`F-41`** | Are **partial receipts** recorded as separate receipt events against the PO line? | ⚠ **Without it, subtype A computes from the wrong quantity** |
| **`F-42`** | Will suppliers **accept** smaller, more frequent orders — and is there a **minimum order value** as well as a minimum quantity? | Subtype A's intervention may be unavailable in practice |
| **`F-43`** | Does **freight cost per shipment** vary with order size, and is it borne by the factory? | Gates subtype A's net for imported items (A7) |
| **`F-44`** | Are **order multiples / pack sizes** recorded, distinct from MOQ? | `Q′` may not be freely chosen |

**None of these is assumed to exist.** The mechanism does not presume the factory has an ERP field because the model needs one.

---

# PART D — DECISION REPORT

## D1. Decisions locked by Part 2.3

| | Decision | Closes |
|---|---|---|
| **D-033** | Inventory position correction — six interventions and what each may claim | `DP-10` |
| **D-034** | §4.2 retired; §4.9 reclassified as `EXPOSURE / RISK` | `DP-11`, `DP-12` |
| **D-035** | Carrying cost is component-wise; a whole rate is invalid for a marginal decision | `DP-15` |
| **D-036** | The financing effect has exactly one channel | **`B2-01`** |
| **D-037** | Safety stock — prospective indication, retrospective realization | `DP-13` |
| **D-038** | Mechanism 03, its boundary and four subtypes | — |
| **D-039** | Counterfactual replay; peak and trough are separate claims | — |
| **D-040** | EOQ may generate a hypothesis, never a number | `P-08` |
| **D-041** | The net figure declares its own incompleteness | — |

Plus amendments applied to **D-001** and **D-002** (promoted to `LOCKED`), **D-011** (owner split), **D-014 rule 10** (`purpose`), **D-023** (never misapply) and **D-031** (`MITIGATES`, and its status-line correction).

## D2. ⚠ One conclusion reversed from Block 2

Block 2 recorded `B2-01` as *"a genuine choice between two valid channels"* and named it the hard gate before Part 2.3. **On derivation it is not a choice.** The deferral value and the capital component are the same product measured over different windows, and the intervention's own recurrence determines which window applies. D-036 records the derivation.

This is a stronger and narrower result than Block 2 claimed, and it removes the gate rather than passing through it.

## D3. What Part 2.3 deliberately does not create

| | Why |
|---|---|
| A shipment-consolidation mechanism | Unowned (D-032), gated by `F-01`, materiality unmeasured — and creating a mechanism for an effect of unknown size is challenge D1's breadth risk |
| A logistics-cost domain | Same. Recorded as **now blocking** subtype A for imported items rather than merely acknowledged |
| An EOQ implementation | D-040 |
| A service-level model | Requires assumed probabilities (D-017, D-023) |
| A stockout valuation | Requires production impact — out of scope (D-007) |
| A materiality threshold | A number. Finance-owned, `B3-03` |

---

# PART E — THE LOCK

| # | Locked |
|---|---|
| 1 | **Mechanism 03 — Quantity & Inventory Economics**, one mechanism with four subtypes, one shared quantification base |
| 2 | Boundary per D-030: the counterfactual's effect on quantity over the relevant window. **Inputs, cost components, policy parameters and states are never saving categories** |
| 3 | **The position path is obtained by replaying recorded issue events. Never a formula.** `Q/2`, average-inventory approximations and service-level models are forbidden |
| 4 | **Order quantity moves the peak; the reorder point moves the trough.** A path that never falls below the observed floor makes no stockout claim |
| 5 | **The position path is computed from receipt events, never from PO quantities** |
| 6 | `Q′` is floored at the maximum observed lead-time demand, **read from data, never chosen** |
| 7 | Carrying cost is **component-wise**; a whole finance rate is **invalid**, not merely imprecise (D-035) |
| 8 | **The financing effect is claimed exactly once**, through the channel the intervention's recurrence determines (D-036) |
| 9 | One-time comes from changing a **level**; recurring comes from changing a **policy**. The principal is never a saving (D-033) |
| 10 | **Excess with no pending order produces no Opportunity** — it is a position |
| 11 | Deferral requires `F-39` and **may be negative** |
| 12 | Safety-stock reduction is a **prospective indication only**; realization is retrospective (D-037) |
| 13 | **Smaller orders `DEEPENS` the stockout exposure** — qualitatively, direction only, never a probability |
| 14 | Subtype D's price benefit applies to **quantity consumed**, never quantity purchased |
| 15 | §4.6 MOQ is an Opportunity **only where an alternative is evidenced** |
| 16 | **EOQ may propose a candidate quantity; it may never produce a figure** (D-040) |
| 17 | Contradiction detection runs **over this mechanism's own outputs**, not only across mechanisms |
| 18 | Mechanism 03 supplies an **inventory cost model** consumed by M01 and M02 |
| 19 | A buffer **increase** to avoid expedites is a **Mechanism 01 Opportunity** consuming this cost model, carrying `MITIGATES` |
| 20 | **The net figure declares its own incompleteness**, and the exclusion is always optimistic (D-041) |
| 21 | Freight per shipment is **unowned**; where material, subtype A is `INSUFFICIENT_DATA` |
| 22 | **No probability, percentage, threshold, confidence constant, service level, materiality number or invented rate anywhere in this mechanism** |

## Must not be implemented

No detector, formula, schema or UI · no EOQ · no `Q/2` or average-inventory shortcut · no service-level or safety-stock statistical model · no whole carrying rate · no default ordering cost · no invented freight component · no materiality threshold · no probability or severity on any exposure relationship · no prospective currency claim for subtype B · no price-break claim beyond the evidenced consumption horizon · no aggregation of non-Opportunity findings into Potential Annual Saving · no annualisation below the D-019 / rule 11 bar · no cross-period comparison without FX normalisation.

---

# PART F — CONSISTENCY AUDIT

## F1. Against every locked decision

| Decision | Result |
|---|---|
| D-001 (as amended) | **Depends on it.** Point-in-time reconstruction is a hard prerequisite of D-039's replay |
| D-002 (as amended) | Compatible. The replay carries the weakest basis; the stated limitation is what D-023's amendment now governs |
| D-007 | Compatible. Production rescheduling and stockout cost stay out, and both limits are stated rather than worked around |
| D-008 | Compatible. No valuation is computed; the cost reference is imported |
| D-010 | **Consistent, and its weakness is stated** — observed consumption is a backward-looking proxy for subtype C's forward claim (B2.4) |
| D-012 | **Sharpened.** One-time and recurring are separated per subtype, and the principal never enters |
| D-014 rule 6 | **Load-bearing.** Mechanism 03 supplies the incremental cost M01 and M02 must net |
| D-014 rule 10 (as amended) | Applied. Every rate used here is purpose-matched or blocked |
| D-014 rule 15 | Applied. No gate becomes a score |
| D-017 · D-027 | **Applied throughout.** Every figure is an event-level counterfactual; no category percentage survives |
| D-019 | Used unchanged. Subtype B stops at `OPPORTUNITY DETECTED` |
| D-020 | **The reason there is one mechanism, not four** |
| D-022 · D-026 | Used unchanged for realization and evidence strength |
| D-023 (as amended) | Applied. `F-31` and `F-08` block rather than default |
| D-024 · D-028 | Compatible. Deferral and price-break figures are FX-normalised; the replay preserves F10 dimensions |
| D-025 | Applied. Stockout and obsolescence sit in `EXPOSURE`; §4.2's residue is a signal, not a finding |
| D-029 | **Extended in use, not in substance** — first mechanism requiring intra-mechanism detection |
| D-030 | **Applied as the boundary.** Confirmed against all twenty-three candidates |
| D-031 (as amended) | Applied. `DEEPENS` for cycle frequency and FX; `MITIGATES` for the buffer-increase case |
| D-032 | **Temporal consolidation lands here as promised.** Shipment consolidation stays unowned — and now blocks something concrete |
| Mechanism 01 (`04-…`) | Composes at component level. Consumes this cost model |
| Mechanism 02 (`09-…`) | Composes in subtype D. **Its price-break netting depends on this mechanism** |

**No locked decision is contradicted. No locked decision required amendment because of Part 2.3.**

## F2. Stale references found

| | Status |
|---|---|
| `03-saving-opportunity-model.md` §4.1–4.7 formulas | **Corrected in this propagation** — `Q-07`'s debt is now paid for §4.1, §4.2, §4.3, §4.6, §4.7 and §4.9. §4.4 was already superseded by Mechanism 02 |
| `F-33` … `F-40` defined in file 13, never added to `open-questions.md` | **Corrected in this propagation** |
| README table missing files 10–17 | **Corrected in this propagation** |
| `05-…-WORKSHOP.md` | Superseded header already present. **Deliberately not rewritten** — history preserved |
| Build plan U-16 *"No MRP, no EOQ"* | **Consistent with D-040.** Confirmed, not changed |

## F3. Inconsistencies found and **reported, not fixed**

Per the standing rule: report rather than silently correct.

### ⚠ 1. Four decisions are `PROPOSED` while locked decisions amend or depend on them

This is the **same governance gap Block 1 closed for D-001 and D-002, one layer higher.**

| | Problem |
|---|---|
| **D-012** | **The sharpest.** `PROPOSED`, yet **three locked decisions amend it** — D-020 (deduplication), D-021 and D-025 (non-Opportunity findings), plus D-028's cross-mechanism note. It defines the headline figure the whole product is judged on |
| **D-010** | `PROPOSED`. D-037 and D-039 both rest on *"demand is observed consumption"* |
| **D-013** | `PROPOSED`, and it amends D-006, which is also `PROPOSED` |
| **D-015** | `PROPOSED`, and D-017 (`LOCKED`) records it as *"strengthened"* |

**Not corrected.** Promoting them is the product owner's decision, exactly as D-001 and D-002 were. **Nothing in Part 2.3 is blocked by it** — the substance of all four is used consistently everywhere — but the audit trail says a locked decision amends an unlocked one, which is not a state that should persist.

### ⚠ 2. `docs/01-core-mission.md` §mind-map lists *"EOQ where appropriate"*

**D-040 says never** — not as a source of any figure. The core mission is a **founding document** the README marks *do not edit casually*, so it is **reported rather than amended**.

The conflict is narrower than it looks: the mind map lists a *capability the factory might want*, and D-040 permits EOQ to **propose a candidate quantity**. What D-040 forbids is EOQ producing a **saving figure**. If that reading is accepted, the mind-map line needs one qualifier; if not, it needs removing. **Either way it is your call, not mine.**

### 3. Everything else was corrected in this propagation

`F-33` … `F-40` carried into the register · README file list · §4.1–§4.9 formulas (`Q-07`) · `P-08` closed · `B-05` closed · D-031's status line · `OPEN-15`'s EOQ note. The mechanism-02 workshop retains its superseded header and is **deliberately not rewritten** — history preserved.

---

# PART G — WHAT REMAINS BEFORE ARCHITECTURE / BUILD

## G1. Decision work — complete

**All three mechanisms are designed and locked.** No mechanism-level decision is outstanding. The four decisions Block 1 authorised remain **open by design**, and none blocks architecture:

| | Blocks |
|---|---|
| `Q-09` commercial-document immutability | **Mechanism 02's build**, not the architecture |
| `Q-10` in-transit ownership | Needs `F-15`. Affects the ledger's bucket semantics |
| `Q-11` source-record drift | Interacts with import architecture (`A-19`) |
| `Q-12` basis semantics | Refines D-002; no calculation depends on it |

## G2. The three things that actually block architecture

`FACT` Unchanged from the readiness audit, and **not moved by Part 2.3**:

1. **`A-19` — technology stack.** Blocks everything.
2. **`A-20` — permission model.** Blocks U-02, and the saving engine has now produced **three** concrete requirements for it: adjudication authority (DP-07), the three owner roles (D-011 as amended), and configurable role assignment.
3. **`A-01` — balance projection strategy.** Blocks U-07 — **and Part 2.3 has raised its stakes.** D-039's replay requires point-in-time reconstruction over long windows, so an async projection must support historical replay, not merely eventual consistency.

## G3. The eight factory facts that decide whether the engine produces numbers or findings

`N-03` consumption capture · `N-04` catch-weight · **`F-01`** freight separability *(gates M01 and D-037)* · `F-07` FX policy · **`F-08`** carrying **components and purpose** *(gates most of Mechanism 03)* · `F-09` lead-time quality · **`F-31`** ordering cost *(gates subtype A entirely)* · `B-07` pilot factory.

**Two are new from Part 2.3 and belong on this list:** **`F-41`** partial receipts *(without it subtype A is fictional)* and **`F-43`** freight per shipment *(without it subtype A cannot be netted for imports)*.

> `FACT` **Not one of these is a design question.** The design is done. What remains is a stack decision, a permission model, a projection strategy, and a discovery pack the factory answers.

## G4. Honest statement of what the engine will do on day one

If the factory answers none of the above, Mechanism 03 still **detects**: excess positions, ordering patterns far from the trade-off region, MOQ-forced excess, dead stock, and every contradiction between them. It produces **findings and `EVIDENCE GAP`s with no currency**.

That is not a degraded outcome. Per Mechanism 02's §9, the mechanism may honestly begin life as an **evidence-capture project rather than a quantified saving engine** — and capture requests are prioritised by **observed spend**, a fact we can see, never by suspected opportunity, which we cannot.

---

**Part 2.3 is locked. Nothing beyond it is started.**
