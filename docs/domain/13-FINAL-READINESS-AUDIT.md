# 13 — Final Readiness Audit

> ## ⚠ AUDIT ONLY — NOTHING LOCKED, NOTHING REWRITTEN
> No project file was modified. Inconsistencies are **reported, not corrected**. No factory fact, formula, threshold, rate or confidence value invented.
> **No code, no UI, no schemas. Part 2.3 not started.** **Date:** 2026-08-07

---

# ⚠ TWO INCONSISTENCIES FOUND — reported for your decision

## Inconsistency 1 — the foundations are still `PROPOSED` while everything above them is `LOCKED`

| Still `PROPOSED` | What it is |
|---|---|
| **D-001** | **The append-only movement ledger.** The single source of inventory truth |
| **D-002** | **The provenance envelope.** The mechanism that makes data trust enforceable |
| D-004 | Site-scoped records |
| D-006 | Thin vertical slice |
| D-010 | Demand is observed consumption |
| **D-012** | **The headline figure rules** — range, weakest basis, deduplication |
| D-013 | Slice extends to a saving opportunity |
| D-015 | Expedite premium first, lead-time correction as the defensible core |

Meanwhile **D-017 … D-032 are all `LOCKED`** — and every one of them depends on D-001 and D-002.

> **We have locked the roof while the foundation is still a proposal.**

Concretely: D-025, D-027, D-029 and D-031 all assume the provenance envelope (D-002) exists as a platform primitive. D-019 and D-022 assume the ledger (D-001) records what they measure against. If either proposal were revised, sixteen locked decisions would need re-examination.

This is not a modelling error — the reasoning in each is sound. It is a **governance gap**: the sequence of your attention followed the mechanisms rather than the substrate.

**Recommendation: promote D-001 and D-002 (at minimum) before any further mechanism work.** They have been stable through five rounds of adversarial review without needing revision, which is itself evidence.

## Inconsistency 2 — D-031's status line does not record its own amendment

```
## D-031 — An Opportunity may create or deepen a linked Exposure / Risk
**Status:** `LOCKED` 2026-08-07 · **Area:** saving model · **Closes:** `W-45` · **Clarifies:** D-014 rule 6
```

The **body** carries the W-49 `DEEPENS` amendment with original text preserved. The **status line** does not mention it, unlike D-025's, which reads *"AMENDED 2026-08-07 by W-33 / W-46"*.

A reader scanning status lines would not know D-031 had been amended. **Cosmetic, but it breaks the audit trail discipline applied everywhere else.** Not corrected — reported per your process rule.

---

# PART 1 — Current architecture map

## In plain language

**The mission.** Find out how much money this factory could save each year, prove it, help them do it, then check whether it actually happened.

**The foundations** are the rules about *reality*: how stock is recorded, what a quantity means, how time works, what a unit is, and — most importantly — **where every number came from**.

**The findings** are the four kinds of things the system can say:

| | In plain words |
|---|---|
| **Opportunity** | *"You could save money by doing this specific thing, and here's the proof."* The only kind that counts toward the headline number |
| **Observed Cost** | *"You already spent this money and there was nothing you could have done."* A fact about the past |
| **Exposure / Risk** | *"This might cost you money later."* A condition about the future. **Never a saving** |
| **Evidence Gap** | *"We can't tell you, because you don't record X."* A statement about **our data**, not your money |

**A mechanism** is one specific way of finding savings — one economic story, one kind of evidence, one kind of fix. We have two.

**Orders & Supply Movement** is not a mechanism. It's the record of what you ordered, from whom, where it is now, and when it arrived. **Almost every mechanism needs it, and none of them is it.**

**F10** says: capture the raw pieces of every money number *now* — the amount, the currency, the exchange rate, the date, the quantity — because if you don't capture them at the time, **you can never get them back**.

## How they connect

```
                    THE FACTORY (reality)
                            │
        F1…F10 FOUNDATIONS  │  capture reality faithfully
                            ↓
                   Orders & Supply Movement   ← ENABLER
                   Ledger · Items · Suppliers
                            ↓
                      MECHANISMS  (01, 02)
                    each: intervention + counterfactual
                            ↓
   ┌────────────────────────┴────────────────────────┐
   │                    FINDINGS                     │
   │  OPPORTUNITY ─CREATES/DEEPENS/(MITIGATES?)─▶ EXPOSURE/RISK
   │       │                                   OBSERVED COST
   │       │                                   EVIDENCE GAP (outside)
   └───────┼─────────────────────────────────────────┘
           ↓  only Opportunity
   POTENTIAL ANNUAL SAVING  ← range, weakest basis, deduplicated
           ↓
   Decision → Action → Measurement → REALIZED  (or not)
```

## In formal terms

| Concept | Definition |
|---|---|
| **Core mission** | Discover, quantify, prioritise, execute and verify Potential Annual Saving. Operational management is the `ENABLER`; the saving engine is `CORE` |
| **Foundations** | F1 tenancy · F2 stock ledger · F3 quantity semantics · F4 provenance · F5 time · F6 UoM · F7 lot/serial · F8 costing · F9 recommendations · **F10 financial change decomposition capture contract**. *F-series governs what must be captured from reality* |
| **Finding classes** | `FINDING → OPPORTUNITY \| OBSERVED COST \| EXPOSURE / RISK`, with `EVIDENCE GAP` outside the hierarchy (D-025 as amended) |
| **Opportunity** | The only saving-eligible class. Carries the D-011 lifecycle, an intervention signature (D-029), evidence strength as an attribute (D-026), and may `CREATES`/`DEEPENS` an exposure (D-031) |
| **Observed Cost** | Historical `ACTUAL` financial fact. No lifecycle, no mitigation |
| **Exposure / Risk** | Forward-looking `FORECAST`/`ESTIMATED` condition. No lifecycle, no signature, may carry mitigation. Never approved, never realized |
| **Evidence Gap** | Statement about the completeness of our data. Outside the Finding hierarchy. Never carries opportunity value |
| **Mechanism** | A bounded economic story with a defensible intervention and a testable counterfactual (D-027). Boundary set by the counterfactual's effect on quantity (D-030) |
| **Orders & Supply Movement** | `ENABLER`. Not a mechanism. Evidence source for every mechanism |
| **F10** | Capture contract only. The decomposition **engine** is deferred (`Q-08`) |
| **Governing distinction** | *F-series governs what must be captured from reality; the saving model governs what may be asserted about it* |

---

# PART 2 — LOCKED vs UNLOCKED

## LOCKED

| Area | Decision / document | Build from it? | Missing |
|---|---|---|---|
| 16 financial-trust rules | D-014 | **Yes** | — |
| Avoidability categorical, no weights | D-017 | Yes | — |
| Root-cause capture in workflow | D-018 | Yes | `F-05` will buyers classify |
| Three-state evidence ladder | D-019 | **Yes** | — |
| Mechanism-level deduplication | D-020 | Yes | — |
| Customs cost in scope, two destinations | D-021 | Partial | `F-02` |
| 12-month realization window | D-022 | Yes | — |
| Carrying cost finance-owned, no defaults | D-023 | **Policy yes, value no** | `F-08` |
| FX Tier 1 | D-024 | Policy yes | `F-07` |
| Finding classes | D-025 *(amended)* | **Yes** | — |
| Evidence strength as attribute | D-026 | Yes | — |
| Event-level counterfactual reasoning | D-027 | **Yes** | — |
| F10 capture contract | D-028 | **Yes** | `F-07` |
| Contradiction control | D-029 | Yes | `F-27` for cross-item |
| Mechanism boundary | D-030 | **Yes** | — |
| `CREATES`/`DEEPENS` | D-031 *(amended)* | Yes | — |
| §4.5 retired and redistributed | D-032 | Yes | — |
| **Mechanism 01** | Part 2.1 lock | **Design yes, build no** | `F-01`, `F-09` |
| **Mechanism 02** | Part 2.2 lock | **Design yes, build no** | `F-12`, `F-13` |

## PROVISIONALLY READY *(analysis complete, not locked)*

| Area | Document | Build from it? | Missing |
|---|---|---|---|
| DP-10 six intervention types | Doc 12 §1 | No | Your decision |
| DP-13 three-claim structure | Doc 12 §2 | No | Your decision |
| DP-14 owner roles | Doc 12 §4 | No | Decision + D-011 amendment |
| `MITIGATES` | Doc 12 §5 | No | Decision + D-031 amendment |
| Asymmetric valuation rule | Doc 12 §6 | No | Your decision |
| Rate fitness | Doc 12 §7 | No | Decision + rule-10 amendment |
| DP-15 component principle | Doc 12 §3 | No | Decision |
| DP-11 retire 4.2 · DP-12 reclassify 4.9 | Doc 11 | No | Your decision |

## FACTORY DATA REQUIRED

**`F-01`** expedite/freight capture — *gates M01 **and** 4.7* · **`F-12`/`F-13`** quotations and contracts — *gate M02* · **`F-08`** carrying basis · **`F-07`** FX source · **space constrained?** · finance rate's purpose · `F-09` lead-time quality · `F-22` financing rate · `F-31` ordering cost. Full list in Part 5.

## ARCHITECTURAL DECISION REQUIRED

| | |
|---|---|
| **D-001 / D-002 promotion** | ⚠ **The most important item in this audit** |
| D-011 `Owner` field splits | Three accountabilities |
| D-014 rule 10 gains *purpose* | Rate fitness |
| D-031 gains `MITIGATES` | Third relationship type |
| D-023 extends to *never misapply* | |
| `Q-08` decomposition engine | Second mechanism now exists — could be revisited |

## OPEN / UNRESOLVED

`A-01` balance projection · `A-02` reservation · `A-03` confidence formula · `A-18` thresholds · **`A-19` stack** · **`A-20` permissions** *(two concrete requirements now feed it)* · `B-07` pilot factory · `N-01` finance contract · `N-03` consumption capture · `N-04` catch-weight · `P-06` safety stock · `P-12` design system · `W-01`…`W-44` residue.

## FUTURE GAP

Shipment consolidation · logistics-cost domain · disposal economics · time value of deferred outlay · commitment-risk ownership.

---

# PART 3 — Q-07 final status, 4.1 → 4.9

| | Current meaning | Classification | Valid? | Rewrite? | Mechanism? | Detection only? | Exposure? | Retire? | Evidence required |
|---|---|---|---|---|---|---|---|---|---|
| **4.1** | Excess stock → capital release | Quantity/inventory | **Partly** — the concept is real, the framing is wrong | **Yes** | Future quantity mechanism | No | Creates stockout exposure | No | On-hand · consumption · **open orders + ETAs** · `A-18` · `F-08` · `F-22` |
| **4.2** | Slow-moving stock | — | **No — not a mechanism** | n/a | **No** | **Yes** | Shelf-life case only | **Yes** | Movement history · `A-18` · shelf lives |
| **4.3** | Dead/obsolete stock | Quantity/inventory | Partly — exclusion principle correct | **Yes** | Future quantity mechanism | No | No | No | Movement history · **disposal cost · recovery value · is space constrained?** |
| **4.4** | Purchase price variance | **Mechanism 02** | **Superseded** | Done | **Yes — locked** | No | May create concentration exposure | Renamed | `F-12`, `F-13`, `F-15`, `F-16`, `F-19`, `F-21` |
| **4.5** | Order consolidation | **Retired** (D-032) | Superseded | Done | Split across two + one gap | No | Concentration | **Retired** | Per destination |
| **4.6** | MOQ optimisation | Quantity/inventory | Partly | **Yes** | Future quantity mechanism | No | No | No | MOQ terms · requirement at order time · **price impact of MOQ reduction** |
| **4.7** | Reorder point / safety stock | Quantity/inventory | **Partly — prospective currency unreachable** | **Yes** | Future quantity mechanism | No | **Deepens stockout exposure** | No | **`F-01` expedite capture** · override history · `F-27` · escalation records |
| **4.8** | Expedite premium | **Mechanism 01** | **Superseded** | Done | **Yes — locked** | No | No | Renamed | `F-01`, `F-02`, `F-06`, `F-09` |
| **4.9** | Stockout avoidance | **→ `EXPOSURE / RISK`** | **Conclusion valid, class changes** | Reclassify | **No** | No | **Yes** | No | On-hand · consumption · **inbound ETA, location, port milestones** |

**Net:** two locked as mechanisms · one retired outright · one retired and redistributed · one reclassified as exposure · **four requiring conceptual rewrite** — and all four belong to a **quantity/inventory mechanism that does not yet exist.**

> ⚠ **That is the structural finding of Part 3:** 4.1, 4.3, 4.6 and 4.7 are homeless. They are not "future work" in the abstract — they are **four categories waiting on one undesigned mechanism.**

---

# PART 4 — DP-10 … DP-15

| | Recommended | Safe to lock now | Needs factory evidence | Needs architectural change | **What breaks if locked wrongly** |
|---|---|---|---|---|---|
| **DP-10** | Six intervention types; *one-time = level, recurring = policy*; principal is a **position**, never a release | **Structure** | `F-22`, `F-08`, `F-31`, `A-18`, expected price movement | No | **Lock the principal as a benefit and the headline overstates by roughly the reciprocal of the financing rate.** The most damaging single error available |
| **DP-11** | Retire 4.2; keep detection + shelf-life exposure | **Yes** | Shelf lives recorded? | No | Keeping it guarantees double counting with 4.1/4.3 |
| **DP-12** | Reclassify 4.9 as `EXPOSURE / RISK` | **Yes** | No | No | Leaving it as a "category that refuses to produce a number" keeps an incoherent shape in the taxonomy |
| **DP-13** | Prospective **indication**, retrospective **realization** | **Structure** | **`F-01` — gating** | No | **Lock the naive backtest and the system will recommend cutting safety stock on evidence that a planner's success erased.** Stockouts follow |
| **DP-14** | Three factory-facing roles + adjudicator distinct | **Structure** | Who owns data quality? | **D-011 amendment** | Collapse them and either the wrong person is asked to act, or nobody owns the data behind the number |
| **DP-15** | Component-level; excess ≠ dead; disposal does not release capital | **Principle** | **Is space constrained?** · finance rate's purpose | D-023 extension | **Lock a single average rate and 4.3's opportunity is overstated by roughly the capital component** — usually the largest |

---

# PART 5 — Master factory-data list *(deduplicated)*

**Duplicates resolved:** `N-07` ≡ `F-01` · `N-10` ≡ `F-08` · `N-01` overlaps `F-18` but is broader (contract vs existence). Listed once each.

| ID | What we need | Why | Used by | From ERP/Excel? | Must ask factory? |
|---|---|---|---|---|---|
| **F-01** | **Freight cost separable per shipment, attributable to PO lines** | Without it: event counts, no currency | **M01, 4.7, shipment gap** | Possibly — invoice structure | **Yes** |
| **F-02** | Customs demurrage/detention captured and attributable | May be the largest premium category | M01, 4.9 | Unlikely — separate invoices | **Yes** |
| F-03 | Contracted standard freight rates by lane/mode | Baseline tier A | M01 | Maybe | Yes |
| F-04 | Freight capitalised into stock value, or expensed? | Double-count risk | M01, 4.1 | Yes — finance | Yes |
| F-05 | Will buyers classify root cause at the time? | D-018 viability | M01 | No | **Yes — behavioural** |
| F-06 | How is an expedite recognised today? | Event identification | M01, 4.7 | Maybe | Yes |
| **F-07** | **FX rate history, source, effective-dating policy** | Tier 1 (D-024) | **All financial comparison** | Partly | **Yes — finance** |
| **F-08** | **Carrying-cost basis, by component, with purpose** | Most recurring figures | **4.1, 4.3, 4.6, 4.7, M01 offsets** | Maybe a rate — **purpose unlikely** | **Yes — finance** |
| **F-09** | **Lead-time master-data quality + actual receipt timing** | M01's defensible first slice | **M01, 4.7** | Yes | Verify |
| F-10 | Volume/purchase history for normalisation | Verification | M01, M02, 4.1 | Yes | — |
| F-11 | Who sets and approves material prices | Ownership, adjudication | M02, DP-14 | No | **Yes** |
| **F-12** | **Quotations recorded with dates and terms, including declined** | **No counterfactual without it** | **M02** | Unlikely | **Yes** |
| **F-13** | **Purchase contracts in structured form** | Strongest evidence tier | **M02** | Maybe | **Yes** |
| F-14 | Invoice price vs PO price | Price actually paid | M02 | Yes | — |
| F-15 | Incoterms per PO | Comparability gate | M02 | Maybe | Yes |
| F-16 | Payment terms per PO | Comparability gate (exclusion-first) | M02 | Maybe | Yes |
| F-17 | Historical supplier price lists | Baseline evidence | M02 | Unlikely | Yes |
| F-18 | Does finance compute accounting PPV, against what standard? | D-008 boundary; reconciliation | M02 | Yes | Yes |
| F-19 | Duty and clearing attributable to PO line | Landed-cost comparability | M02, 4.5 | Maybe | Yes |
| F-20 | Approved-supplier list; single-source items | Was the alternative permissible? | M02 | Maybe | Yes |
| F-21 | Specification/grade recorded | Equivalence | M02 | Yes | Verify |
| **F-22** | **Effective-dated cost-of-funds rate** | Deferral timing value | **DP-10** | Maybe | **Yes — finance** |
| F-23 | Advance payment / LC requirements and bank charges | Often the largest real price difference | M02 | Maybe | **Yes** |
| F-24 | Who could adjudicate comparability — independent? | DP-07 viability | M02, DP-14 | No | **Yes** |
| F-25 | Does that role have authority **and capacity**? | Independence without capacity is not a control | M02 | No | **Yes** |
| F-26 | Supplier price-break structures, thresholds, dates | Quantity mechanism input; capture is irreversible | 4.6, future | Maybe | Yes |
| F-27 | Substitute/alternate items identified | Cross-item contradiction; 4.7 backtest | D-029, 4.7 | Maybe | Yes |
| F-28 | Volume rebates / annual agreements with thresholds | DP-09 cases 2–3 | M02, 4.6 | Maybe | Yes |
| F-29 | Crystallised cost vs open exposure distinguishable | D-025 classes | All exposure | Maybe | Yes |
| F-30 | Penalty/shortfall clauses in volume agreements | Commitment risk | M02, W-36 | Maybe | Yes |
| **F-31** | **Ordering cost, finance-owned** | Temporal consolidation; 4.6 | **Future quantity mechanism** | Unlikely | **Yes — finance** |
| F-32 | Shipments linked to multiple POs | Shipment-consolidation gap | Future | Maybe | Yes |
| **F-33** | **Is warehouse space constrained?** *(new)* | **Decides whether the space component of carrying cost exists at all** | **4.1, 4.3, DP-15** | No | **Yes** |
| F-34 | Are shelf lives recorded? *(new)* | 4.2's shelf-life exposure | 4.2 | Maybe | Yes |
| F-35 | Are supplier escalations recorded in any form? *(new)* | DP-13 level B | 4.7 | Unlikely | **Yes** |
| F-36 | Manual order override history *(new)* | DP-13 level B | 4.7 | Maybe | Yes |
| F-37 | Who owns master/transactional data quality *(new)* | Evidence Gap ownership | DP-14 | No | **Yes** |
| F-38 | Disposal cost and recovery value *(new)* | 4.3's net | 4.3 | Unlikely | **Yes** |
| F-39 | Expected price movement over a deferral window *(new)* | ⚠ Deferral benefit can be **negative** | DP-10 | No | **Yes** |
| F-40 | Inventory taxes/duties on held stock *(new)* | Carrying component | DP-15 | Yes — finance | Yes |
| N-01 | Finance integration contract, **carrying F10 dimensions** | All financial work + decomposability | All | — | **Yes** |
| N-03 | Consumption captured against cost centre/line? | **Very hard to backfill** | Ledger | — | **Yes — urgent** |
| N-04 | Catch-weight items required? | Ledger-shaping | Ledger | Maybe | **Yes — urgent** |
| B-07 | Pilot factory and usable history | Everything | All | — | **Yes** |

**Nine are gating** (bold): F-01, F-07, F-08, F-09, F-12, F-13, F-22, F-31, F-33 — plus N-03 and N-04, which are urgent because they shape the ledger and cannot be backfilled.

---

# PART 6 — Contradiction and double-counting audit

| # | Interaction | Type | Recommend |
|---|---|---|---|
| 1 | **4.7 vs M01** — M01 raises reorder point, 4.7 lowers it | **Contradiction — but see refinement** | **C (rule)** — D-029 handles it. ⚠ They act on *different components* (lead-time demand vs safety stock) and may **compose**; treating them as inherently contradictory would suppress a legitimate combined correction |
| 2 | **4.1 vs M02 price break** | **Contradiction** | **C** — D-029 |
| 3 | **4.1 vs 4.7** | **Not double counting — temporal** | **A (decision)** — one-time correction vs recurring prevention. Q-07's original flag was a mis-read |
| 4 | 4.1 vs 4.6 | Double counting | **C** — D-020 attribution |
| 5 | 4.1 vs 4.3 | Boundary | **B** — `A-18` defines where excess ends and dead begins |
| 6 | 4.6 vs M02 | **Composition, opposed** | **E** — D-030 already handles; both disclosed |
| 7 | 4.7 → 4.9 | **Missing exposure link** *(will exist)* | **C** — D-031 `DEEPENS` |
| 8 | 4.1 → 4.9 | **Missing exposure link** | **C** — D-031 `DEEPENS` |
| 9 | **M01 → 4.9** — reorder-point rise **reduces** stockout exposure | ⚠ **Missing relationship type** | **A + C** — needs `MITIGATES`. **Currently M01's fix shows only its cost** |
| 10 | M02 → supplier concentration | Missing exposure link | **C** — D-031 `CREATES` |
| 11 | M02 vs finance's accounting PPV | **Misleading claim risk** | **B** — `F-18`. Not double counting, but a CFO seeing both will assume it |
| 12 | **4.1's "capital release"** | ⚠ **Misleading savings claim** | **A** — DP-10. Principal read as benefit |
| 13 | **4.3's carrying rate** | ⚠ **Misleading savings claim** | **A + B** — capital component may not apply at all |
| 14 | **4.7's prospective currency** | ⚠ **Misleading savings claim** | **A** — DP-13; only indication is defensible |
| 15 | **Any carrying rate containing obsolescence** | ⚠ **Rule violation** — smuggles a risk into a cost, which D-031 forbids netting | **A + C** — rate fitness |
| 16 | 4.1, 4.3, 4.6, 4.7 | **Missing ownership** | **D (future mechanism)** — all four await one undesigned quantity mechanism |
| 17 | O&SM → every mechanism | **Missing evidence** | **D** — enabler undesigned; **lead time *is* the order journey** |
| 18 | Cross-item contradiction | **Missing evidence** | **B** — `F-27`; **undetectable in Release 1** without it |

---

# PART 7 — Orders & Supply Movement

**Classification unchanged: `ENABLER`. Not turned into a mechanism.**

| Element | 1. Already required by | 2. Missing | 3. Domain model | 4. Eventual UI | 5. Future scope |
|---|---|---|---|---|---|
| Purchase order | M01, M02, 4.1, 4.6, 4.7, 4.9 | — | ● | | |
| Supplier | M01, M02, 4.6, 4.7 | — | ● | | |
| **Supplier location** | — | **Not yet required by anything** | ● | | ● |
| Order quantity | All | — | ● | | |
| Order value | M01, M02, 4.1, 4.6 | — | ● | | |
| Order date | M01, M02, 4.1, 4.7 | — | ● | | |
| Expected delivery | M01, 4.1, 4.7, 4.9 | — | ● | | |
| **ETA** *(maintained forecast)* | M01, 4.1, 4.7, 4.9 | **Basis `FORECAST` — D-002 applies** | ● | ● | |
| **Shipment status** | M01, 4.9 | **`F-01`, `F-32`** | ● | ● | |
| **Current location** | M01, 4.9 | **Carrier data — may not exist** | ● | ● | ● |
| **Port milestones** | M01, 4.9 | **`F-02`** | ● | ● | |
| **Customs / clearing** | M01 (demurrage) | **`F-02`, `F-19`** | ● | | |
| Actual receipt | All | — | ● | | |
| Delays | M01, 4.7 | Promised vs actual | ● | ● | |
| Movement history | 4.2, 4.3, 4.7 | — | ● | | |
| **Map** | — | **Nothing requires it** | | ● | ● |
| **Supplier → factory journey** | Conceptually all | **Undesigned** | ● | ● | |

**Two structural facts:** **lead time — 4.7's central input — *is* order date → receipt date**, so the enabler is a prerequisite for 4.7's backtest. And **stockout risk cannot be assessed without knowing where inbound stock physically is** — a shipment held at customs changes it materially.

**Honest note:** *supplier location* and *map* are **not required by any locked mechanism**. They are legitimate product scope but currently **UI ambition, not domain necessity** — recorded as such so effort is not spent on them ahead of things that gate mechanisms.

---

# PART 8 — Build readiness

## "If we started tomorrow, what would we be forced to guess?"

**Architecture:**
1. **The technology stack** (`A-19`) — nothing has been chosen
2. **Whether balances project synchronously or asynchronously** (`A-01`) — shapes the entire write path
3. **The permission model** (`A-20`) — two concrete requirements exist, no model
4. **Whether D-001 and D-002 are actually accepted** — sixteen locked decisions assume they are

**Ledger-shaping, and unbackfillable:**
5. Whether consumption is captured against a cost centre (`N-03`)
6. Whether catch-weight items exist (`N-04`)
7. Whether reservation is hard or soft (`A-02`)

**Financial:**
8. The carrying-cost basis, its components, **and its purpose** (`F-08`)
9. The FX source and effective-dating policy (`F-07`)
10. The cost-of-funds rate (`F-22`)
11. The ordering cost (`F-31`)
12. **Whether warehouse space is constrained** (`F-33`)

**Mechanism-gating:**
13. Whether freight is separably captured (`F-01`) — **gates M01 and 4.7**
14. Whether quotations and contracts are recorded (`F-12`, `F-13`) — **gates M02**
15. Whether lead-time master data is maintained (`F-09`)

**Product:**
16. How confidence is computed (`A-03`) — constrained by rule 15, formula undefined
17. Aging/excess/dead thresholds (`A-18`)
18. Whether there is a pilot factory at all (`B-07`)

**Eighteen items. Any of them guessed would be an invented fact.**

## Minimum set before implementation can safely begin

**Decisions (yours, no factory data needed):**
`A-19` stack · `A-01` projection strategy · **promote D-001 and D-002** · accept or reject DP-10 … DP-15 · the four architectural amendments

**Factory data (gating only):**
`N-03` · `N-04` · `F-01` · `F-07` · `F-08` · `F-09` · `F-33` · `B-07`

**Everything else can follow.** That is **six decisions and eight facts** — not eighteen.

---

# PART 9 — Recommended next five steps

### Step 1 — Promote D-001 and D-002 from `PROPOSED` to `LOCKED`
**Why now.** Sixteen locked decisions rest on them. They have survived five rounds of adversarial review unrevised. **Locking the roof before the foundation is the largest governance risk in the project.**
**Output.** Two status changes, and a re-verification that nothing above them assumed something they do not say.
**Unlocks.** Legitimacy for everything already locked.
**Do not.** Re-open their content — this is ratification, not redesign.

### Step 2 — Run a factory-evidence discovery against the Part 5 list
**Why now.** **Eight gating facts block everything**, and no amount of design removes them. Every further design round without them produces more work resting on unknowns.
**Output.** The Part 5 table with answers, and an Evidence Gap register for what does not exist.
**Unlocks.** Whether M01 and M02 produce currency or event counts. **The single largest uncertainty in the project.**
**Do not.** Design the quantity mechanism first — it depends on `F-08` and `F-33`.

### Step 3 — Decide DP-10 … DP-15 and the four architectural amendments
**Why now.** They are analysed, adversarially tested, and waiting. They also **block the quantity mechanism**, since 4.1/4.3/4.6/4.7 all depend on them.
**Output.** Decisions recorded; D-011, D-014 rule 10, D-031, D-023 amended with original text preserved.
**Unlocks.** Part 2.3.
**Do not.** Lock DP-13's naive form or DP-10's principal-as-benefit — both are actively harmful.

### Step 4 — Resolve `A-19` stack and `A-01` projection strategy
**Why now.** They gate U-01 and U-07, the first two build units. Neither needs factory data.
**Output.** Architecture decisions recorded.
**Unlocks.** The build plan becomes executable.
**Do not.** Choose a stack from preference — the F2 constraints (transactional integrity, exact decimals, fast projections) are the criteria.

### Step 5 — Only then, Part 2.3 — the quantity / inventory mechanism
**Why now.** **Four orphaned categories are waiting on it**, and it is the last major design gap in Circle 1.
**Output.** A locked mechanism absorbing 4.1, 4.3, 4.6, 4.7.
**Unlocks.** Q-07 closes completely.
**Do not.** Start before Steps 2 and 3 — it depends on `F-08`, `F-33`, DP-10, DP-13 and DP-15.

---

# PART 10 — Executive summary

### 1. What we know
The factory is Egyptian, single-site, mixed manufacturing, import-dependent. Finance owns valuation; we own quantity truth. The primary user is the inventory/warehouse manager. The North Star is Potential Annual Saving, and the discipline protecting it is now unusually well developed: **no invented constants, event-level counterfactuals, structurally separated finding classes, and a headline figure that declares its own weakest basis.**

### 2. What we have locked
**Nineteen decisions** (D-014, D-017 … D-032), **two mechanisms** (expedite premium, procurement price opportunity), **one new foundation** (F10 capture contract), and the finding model. Two mechanism lock documents exist, both design-complete.

### 3. What we don't know
**Eighteen things we would be forced to guess** — Part 8. The three that matter most: **the stack**, **whether freight and quotations are separably captured**, and **whether warehouse space is constrained**. Also unknown: whether there is a pilot factory at all (`B-07`).

### 4. What we need from the factory
**Eight gating facts:** `N-03` consumption capture · `N-04` catch-weight · `F-01` freight separability · `F-07` FX policy · `F-08` carrying basis **and its purpose** · `F-09` lead-time quality · `F-33` space constrained · `B-07` pilot factory. Forty items in total; the other thirty-two can follow.

### 5. What you personally need to decide
**Promote D-001 and D-002** *(the governance gap)* · DP-10 … DP-15 · four architectural amendments (D-011 owner split, rule-10 purpose, D-031 `MITIGATES`, D-023 fitness) · `A-19` stack · `A-01` projection strategy · whether to run factory discovery before Part 2.3.

### 6. What Claude should do next
**Wait.** Then, on your instruction, in this order: ratify D-001/D-002 · prepare the factory-evidence questionnaire from Part 5 · apply DP decisions and amendments · then Part 2.3.

### 7. What Claude must NOT do yet
Start Part 2.3 · write code, UI or schemas · lock DP-10 … DP-15 · amend D-011, D-014, D-023 or D-031 · design the quantity mechanism · **treat Orders & Supply Movement as a saving mechanism** · invent any rate, threshold, confidence value or factory fact · assume `F-08` yields a usable rate merely because finance has one.

---

**Nothing locked. Nothing rewritten. Two inconsistencies reported. Awaiting instruction.**
