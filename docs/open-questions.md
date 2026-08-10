# Open Questions Register

> Per the Product Bible: *"Any ambiguous requirement must be identified as an open question rather than silently invented."*
>
> Nothing in this register has been assumed anywhere else in the project. Where a question blocks work, it says so.

**Status key:** `OPEN` unanswered · `PROPOSED` recommendation awaiting a decision · `ANSWERED` / `CLOSED` decided and recorded in `docs/decisions/decision-register.md` · `LOCKED` settled by the product owner · `REQUIRES_FACTORY_DATA` cannot be reasoned into existence

---

## Tier 1 — Blocking. Product cannot be specified without these.

| ID | Question | Answer | Status |
|---|---|---|---|
| B-01 | Who is the primary user of the first release? | **Inventory / warehouse manager** | `ANSWERED` → D-007 |
| B-02 | What is the MVP boundary? | **Inventory + procurement + cost.** No production, maintenance, full quality, BoMs or MRP | `ANSWERED` → D-007 |
| B-03 | Discrete, process/batch, or mixed manufacturing? | **Mixed.** Item behaviour is per item, not per system | `ANSWERED` → D-009 |
| B-04 | Single site, multi-site, or multi-tenant? | **Single site**, records still site-scoped | `ANSWERED` → D-004 |
| B-05 | Is inventory truth an append-only movement ledger? | **Yes.** F2 — the foundation of traceability and §38 data trust | **`LOCKED` 2026-08-08 → D-001 (amended)** |
| B-06 | Does this system own valuation, or feed an existing finance system? | **Finance owns valuation.** This system owns quantity truth | `ANSWERED` → D-008 |
| B-07 | Is there a real pilot factory, and does it have usable historical data? | Determines whether reorder-point planning can function at go-live — see N-06 | `OPEN` |

---

## Tier 2 — Architectural. Needed before the relevant domain is built.

| ID | Question | Area | Status |
|---|---|---|---|
| A-01 | Balances projected synchronously or asynchronously? | F2 | `OPEN` |
| A-02 | Hard or soft reservation? | F3 | `OPEN` — **removed from the MVP blocking set 2026-08-08 by D-050**: nothing in the MVP can create a commitment, so `Reserved` is structurally zero. ⚠ **Re-verified 2026-08-10 (D-055):** Production Feasibility creates no commitment either, *because its answers are transient*. **If a feasibility answer were ever persisted as a plan, this question reopens as a class A blocker** |
| A-03 | How is confidence defined and computed? | F4 | **`DEFERRED SAFELY` 2026-08-08 → D-045.** Rule 15 constrains it; the formula is still `OPEN` — **so the MVP carries no synthesised confidence score at all.** It carries evidence strength (D-026) and **coverage facts stated plainly**. ⚠ A required field with no formula would have been synthesised by blending gate outcomes, which is the *"gates never become scores"* prohibition arriving as a UI necessity. **Not an MVP blocker; resolved by removal** |
| A-04 | Who may close/reopen an accounting period? | F5 | `OPEN` |
| A-05 | Are catch-weight items required? | F6 | `OPEN` — **likely yes** under mixed manufacturing (see N-04) |
| A-06 | Is full lot genealogy required at first release? | F7 | `OPEN` — narrowed: no production means no input→output genealogy in release 1. Lot-level stock visibility only |
| A-07 | Costing method(s) to support: standard, moving average, FIFO? | F8 | `CLOSED` — finance owns valuation (D-008). No costing engine here |
| A-08 | Is standard cost per site or global? | F1/F8 | `CLOSED` — single site; cost is imported (D-008) |
| A-09 | Multi-currency and FX at first release? | C1 | **`CLOSED` 2026-08-08 → D-042.** ⚠ Three documents said multi-currency was **out of scope** while D-024 made FX normalisation **Tier 1** — and the wrong reading sat in the document an engineer reads first. **Resolved as a distinction:** multi-currency *transacting* (ledgers, revaluation, translation) is **out**; multi-currency *capture and FX normalisation* are **in and Tier 1**. Each amount normalises at **its own effective date**, never at a single current rate. Remaining work is factory-side (`F-07`) |
| A-10 | Location hierarchy fixed-depth or arbitrary? | C2 | `OPEN` |
| A-11 | Who owns item master data? | C3 | `OPEN` |
| A-12 | Minimum sample size before a supplier metric is shown? | C4 | `OPEN` |
| A-13 | Is there real sales-order demand, or forecast only? | C5 | `CLOSED` — demand is observed consumption (D-010) |
| A-14 | Which planning methodologies at first release? | C6 | **`REOPENED and RE-ANSWERED` 2026-08-10 → D-054.** Previously `CLOSED` — *"reorder point / min–max only. No MRP (D-010)"*. **Planning is still reorder point / min–max only, and MRP as a planning method is still out.** Added: **Production Feasibility**, a read-only answer to a stated quantity. It maintains no plan and regenerates nothing, so it is not a planning methodology — recorded here because the original wording would otherwise exclude it |
| A-15 | Is incoming inspection mandatory, per-item, or per-supplier? | C8 | `OPEN` |
| A-16 | Backflush or explicit material issue? | C10 | **`DEFERRED`** — production execution out of scope. Release 1 uses issue-to-consumption (D-010). ⚠ **Status conflict resolved 2026-08-10 (Block 8 finding R-01):** Block 4's class D listed this as `RETIRED`, contradicting this line. **`DEFERRED` is correct** — the question becomes live when production execution is built, so it is not retired. D-054 does **not** make it live: feasibility consumes nothing |
| A-17 | Are labour/machine/overhead rates available, or is material cost the only real component? | C13 | `DEFERRED` to finance (D-008); relevant to N-01 granularity |
| A-18 | Thresholds defining aging, slow-moving, excess, dead stock, stockout risk | C9 | `OPEN` |
| A-19 | Technology stack and deployment architecture | Bible §54.21–22 | `OPEN` — **stack closed 2026-08-08 → D-047** (TypeScript · Next.js · PostgreSQL). **Deployment architecture remains open.** *(Annotation added 2026-08-10, Block 8 finding R-03; other closed items carried a pointer and this one did not)* |
| A-20 | Permission and role model | Bible §54.20, §44 | `OPEN` — **first concrete requirement received 2026-08-07**: adjudication authority must be role-based and configurable, and independent of the price decision for currency claims (DP-07) |

---

## Tier 3 — Product and data questions from Bible §54 not yet covered above

| ID | Question | Status |
|---|---|---|
| P-01 | What is the first production scenario we optimise for? | `OPEN` |
| P-02 | Which modules are required for the first real factory deployment? | `OPEN` |
| P-03 | What data must be imported from Excel? | `OPEN` |
| P-04 | What data must be entered manually? | `OPEN` |
| P-05 | What data must come from integrations? | `OPEN` |
| P-06 | How is safety stock calculated? | `OPEN` |
| P-07 | How is demand uncertainty represented? | `OPEN` |
| P-08 | When is EOQ appropriate — and when is it misleading? | **`CLOSED` 2026-08-08 → D-040.** **Never** as a source of a saving figure. It requires exactly the two inputs the project forbids inventing (`F-31`, `F-08`), its *no shortages* assumption is structurally inconsistent with safety stock existing, and it is a **prescriptive optimiser** where D-027 requires an **event-level counterfactual**. It may at most **propose a candidate quantity** for evaluation by the replay |
| P-09 | How is supplier reliability calculated? | `OPEN` — depends on A-12 |
| P-10 | Which financial metrics are authoritative? | `OPEN` |
| P-11 | Which AI capabilities are safe to introduce? | `OPEN` — depends on F4 |
| P-12 | What is the exact visual design system? | `OPEN` — see challenge D4 |
| P-13 | What user research / factory validation will be conducted? | `OPEN` |
| P-14 | What must be true before the first pilot factory can use the system? | `OPEN` |

---

## Tier 4 — New questions raised by the first-release scope

Full context in `docs/domain/02-first-release-scope.md`.

| ID | Question | Blocks | Status |
|---|---|---|---|
| N-01 | Finance integration contract — which system, cost granularity, refresh cadence, direction, **plus the F10 raw dimensions** (D-028) | All financial-impact work, and later decomposability | `OPEN` |
| N-02 | Is the outbound movement feed to finance in release 1, or are we read-only initially? | Integration scope | `OPEN` |
| N-03 | Is consumption captured against a cost centre / line, or item only? | Ledger capture design — **very hard to backfill** | `OPEN` |
| N-04 | Are catch-weight items required? | Ledger and UoM design — must be decided before the ledger is built | `OPEN` |
| N-05 | Handheld/tablet on the floor, or desk? | Interaction model, and the D4 dark-UI question | `OPEN` |
| N-06 | Does the pilot factory have usable consumption history? | Whether reorder-point planning functions at go-live | `OPEN` |
| N-07 | Are expedite flags and freight premiums captured on purchase orders? | Mechanism 01 entirely | `OPEN` — **= `F-01`, the single hardest blocker in the project** |
| N-08 | Minimum consumption history before annualisation is permitted? | Every annualised figure | `ANSWERED` — locked rule 11: 12 months usable history preferred minimum; below that, never a silent confident annual number |
| N-09 | Cost reference staleness threshold? | `STALE_DATA` transitions across all financial figures | `OPEN` |
| N-10 | What is the carrying-cost rate, and does finance own it? | Most of the recurring saving taxonomy | `POLICY LOCKED` → D-023 (finance-owned, no defaults). **Value still `REQUIRES_FACTORY_DATA`** (= `F-08`) |
| N-11 | Target service level for safety stock? | Safety-stock opportunities (4.7) | `OPEN` — **constrained 2026-08-08 by D-037 / D-040:** a service level is a **policy the factory states**, never a parameter we fit. **No statistical service-level model may be built**, and no saving may be derived from one |
| N-12 | Who owns and approves saving opportunities? | The opportunity lifecycle | `OPEN` |
| N-13 | Does an *intervention* need its own owner, distinct from the opportunity owner? | Raised by D-018's workflow capture — the classifier, the approver and the fixer may be three people | `OPEN` |

N-01 … N-06 come from `docs/domain/02-first-release-scope.md`; N-07 … N-12 from `docs/domain/03-saving-opportunity-model.md`.

**N-03 and N-04 are urgent because they shape the ledger** and are expensive to retrofit. **N-06** determines whether the planning layer returns real numbers or `INSUFFICIENT_DATA` for every item on day one.

**N-10 is the sharpest question in the register.** The carrying-cost rate underpins most recurring saving figures in the taxonomy. If the team invents it, most of the North-Star number is `ASSUMED` and must visibly say so. If finance owns a real rate, most of it becomes `CALCULATED`. This single input does more to determine the product's credibility than any feature in the build plan.

---

## Tier 5 — Mechanism 01 decision points — **ALL CLOSED 2026-08-07**

Locked by the product owner as D-017 … D-024. Full detail in `docs/domain/04-mechanism-01-expedite-premium.md` §16.

| ID | Decision | Why it cannot be defaulted | Status |
|---|---|---|---|
| M-01 | Avoidability weights by root cause | — | `CLOSED` → **D-017.** Categorical, never weighted. The weighting proposal is rejected outright |
| M-02 | Root cause captured at expedite time, or retrospectively? | — | `CLOSED` → **D-018.** In-workflow capture, structured categories |
| M-03 | Minimum event count for annualisation | — | `CLOSED` → **D-019.** No universal minimum; three-state evidence ladder |
| M-04 | Precedence between expedite premium and purchase price variance | — | `CLOSED` → **D-020.** Deduplicate at economic-mechanism level; independent effects may both be quantified |
| M-05 | Does customs demurrage count as expedite premium? | — | `CLOSED` → **D-021**, as amended: valid candidate; uncontrollable cost becomes **`OBSERVED COST`** if incurred or **`EXPOSURE / RISK`** if forward-looking |
| M-06 | Observation window before an opportunity may be `REALIZED` | — | `CLOSED` → **D-022.** 12 months default, early evidence distinguished |
| M-07 | Does the carrying-cost offset use finance's rate or an assumption? | — | `CLOSED (policy)` → **D-023.** Finance-owned, no defaults. **Value still `REQUIRES_FACTORY_DATA`** (F-08) |
| M-08 | Is FX normalisation mandatory before trending? | — | `CLOSED` → **D-024.** Tier 1, with four-way change decomposition |

All eight Part 2.1 decision points are closed. **What remains is factual, not judgmental** — questions about the factory that cannot be reasoned into existence.

### Requires factory data — `REQUIRES_FACTORY_DATA`

| ID | Question | Consequence if unanswered |
|---|---|---|
| F-01 | Does the factory record freight cost separably, per shipment, attributable to PO lines? (= `N-07`) | **Gates mechanism 01 entirely.** Without it: event counts, no currency |
| F-02 | Are customs demurrage/detention/storage charges captured, and attributable to a shipment? | May be the largest premium category; structure is **not assumed** |
| F-03 | Do contracted standard freight rates by lane and mode exist in maintained form? | Baseline falls from Tier A to trailing median |
| F-04 | Does finance capitalise freight into inventory value, or expense it? | Double-count risk against excess-stock valuation |
| F-05 | Will buyers reliably classify expedite root cause at the time of the event? | Low coverage degrades the mechanism to event counting |
| F-06 | How is an expedite recognised today — flag, mode field, reason code, or nothing? | Determines whether events are identifiable without inference |
| F-07 | FX rate history, source, and finance's effective-dating policy | Tier 1 (D-024). Without it, cross-period comparison is `INSUFFICIENT_DATA` |
| F-08 | Finance's authoritative carrying-cost rate — exists? owner? provenance? | Any intervention requiring more stock (= `N-10`) |
| F-09 | Master-data lead-time quality, and whether actual receipt timing is recorded well enough to compare | **The first slice (D-015) depends entirely on this** |
| F-10 | Volume and purchase history sufficient to normalise verification against demand changes | Confounder handling in realization |
| F-11 | Who sets and approves material prices? (mechanism 02) | Ownership of the opportunity |
| F-12 | **Are quotations recorded, with dates and terms — including declined ones?** | **Gates mechanism 02.** Without them there is no counterfactual |
| F-13 | **Do purchase contracts / price agreements exist in structured form?** | The strongest evidence tier for mechanism 02 |
| F-14 | Is invoice price captured separately from PO price? | Price actually paid |
| F-15 | Are incoterms recorded per PO? | Price comparability |
| F-16 | Are payment terms recorded per PO? | Price comparability in a high-interest environment |
| F-17 | Are historical supplier price lists retained? | Baseline evidence |
| F-18 | Does finance already compute accounting PPV, and against what standard? | Overlap with D-008 |
| F-19 | Are duty and clearing costs attributable to a PO line? | Landed-cost comparability |
| F-20 | Is there an approved-supplier list; are single-source items identified? | Whether an alternative was permissible |
| F-21 | Is specification / grade recorded well enough to establish equivalence? | Equivalence is the hard part |
| F-22 | Does Finance hold an **effective-dated** cost-of-funds rate, or a single scalar? | A scalar across a volatile 12 months is itself false precision |
| F-23 | Are advance-payment / LC requirements and bank charges recorded per PO? | Often the largest real price difference in Egyptian import trade |
| F-24 | Who could adjudicate comparability, and are they **independent** of the price decision? | Determines whether DP-07's model is operable at all |
| F-25 | Does any independent role have both the **authority and the capacity** to adjudicate at volume? | Independence without capacity is not a workable control |
| F-26 | **Are supplier price-break structures recorded**, with thresholds and effective dates? | Capture is irreversible (D-028 reasoning); the consuming mechanism does not exist yet |
| F-27 | Are substitute / alternate items identified in master data? | Without it, cross-item contradiction is **undetectable in release 1** and must be stated as a limit |
| F-28 | Are **volume rebates and annual-volume agreements** recorded, with thresholds and achievement to date? | Cases 2–3 of the DP-09 boundary test cannot be classified without it |
| F-29 | Can the factory distinguish a **crystallised** cost from an **open** exposure in its own records? | W-33 option D |
| F-30 | Do volume agreements carry **penalty or shortfall clauses**, and are those terms recorded? | W-36 |
| F-31 | Is **ordering cost** known, and does Finance own it? | **Gates Mechanism 03 subtype A entirely.** No default, by analogy with D-023 |
| F-32 | Are shipments recorded such that multiple POs on one shipment are identifiable? | W-35, shipment consolidation |
| **F-33** | **Is warehouse space constrained?** | **Decides whether the space component of carrying cost exists at all.** A manager knows this — it is a question, not a file |
| F-34 | Are shelf lives recorded? | §4.2's shelf-life trigger into §4.3 |
| F-35 | Are supplier escalations recorded in any form? | D-037 level-B evidence |
| F-36 | Manual order override history | D-037 level-B evidence |
| F-37 | Who owns master and transactional data quality? | The **Data Owner** field (D-011 as amended); `EVIDENCE GAP` ownership |
| F-38 | Disposal cost and recovery value | §4.3's net |
| **F-39** | **Expected price movement over a deferral window** | ⚠ **Deferral benefit can be negative.** Without it, §4.1's deferral is `INSUFFICIENT_DATA` — assuming zero is itself an invented assumption |
| F-40 | Inventory taxes / duties on held stock | A carrying component (D-035) |
| **F-41** | **Are partial receipts recorded as separate receipt events against the PO line?** | ⚠ **Without it Mechanism 03 subtype A computes from PO quantity and produces fictional findings** |
| F-42 | Will suppliers **accept** smaller, more frequent orders — and is there a **minimum order value** as well as a minimum quantity? | Subtype A's intervention may be unavailable in practice |
| **F-43** | **Does freight cost per shipment vary with order size, and is it borne by the factory?** | ⚠ Gates subtype A's net for imported items. **The offset belongs to the unowned logistics domain (D-032)** |
| F-44 | Are **order multiples / pack sizes** recorded, distinct from MOQ? | `Q′` may not be freely chosen |
| **F-46** | **Is inventory insurance value-based and adjusting, or a fixed annual declared value?** *(new, Block 7)* | Decides whether the `INSURANCE` component of the carrying offset applies at all (D-035). Unanswered ⇒ the whole offset is `INSUFFICIENT_DATA` |
| **F-47** | **Is warehouse handling labour marginal (overtime / per-move) or salaried below capacity?** *(new, Block 7)* | Not read by Mechanism 01 — throughput is unchanged — but required by Mechanism 03's order-frequency subtype (`Q-15`) |
| **F-45** | **Does the ERP record who raised and who approved each purchase order?** *(new, Block 6)* | ⚠ **DP-07's independence check cannot be fully verified without it** (`Q-13`). Gates full adjudicator independence for **Mechanism 02** |

`F-33` … `F-40` were raised by the DP-10 … DP-15 audit and the readiness audit but were never carried into this register. **Corrected 2026-08-08.** `F-41` … `F-44` are new from Part 2.3.

### Modelling questions raised by the lock — need confirmation before Part 2.2

| ID | Question | Recommendation |
|---|---|---|
| Q-01 | Is *quality rejection* a distinct root-cause category, or does it belong under *Supplier delay*? | Add it — different owner, different action |
| Q-02 | What test makes a counterfactual "defensible" for quantification? | The lead-time gap example is a *form*, not a validated rule. Needs real events |
| ~~Q-03~~ | `COST / EXPOSURE / RISK` — class or status? | **`LOCKED` → D-025**, **amended 2026-08-07**: findings separated by class — `FINDING → OPPORTUNITY \| OBSERVED COST \| EXPOSURE / RISK`, with `EVIDENCE GAP` outside. Only `OPPORTUNITY` is aggregable |
| ~~Q-04~~ | `EARLY_REALIZATION_EVIDENCE` — attribute or state? | **`LOCKED` → D-026.** Attribute. Core Mission §6 lifecycle unchanged |
| ~~Q-05~~ | Promote four-way change decomposition to foundation F10? | **`LOCKED` → D-028 (accepted as A′).** F10 is a **capture contract**, not an engine. Capture locked now; calculation deferred |
| **Q-08** | **When does the F10 capture contract become a decomposition *engine*?** | **`DEFERRED` by D-028.** Requires at least a second mechanism to validate the abstraction. Not a blocker |
| Q-06 | Does a lead-time correction create other costs not yet modelled? | Unknown; test during the vertical slice |
| ~~Q-07~~ | Categories 4.1–4.7 of the saving model predate D-017 and still describe weighted/threshold calculations | **`CLOSED` 2026-08-08.** §4.1, §4.2, §4.3, §4.6, §4.7 and §4.9 re-expressed as *intervention + counterfactual* (D-033 … D-039). §4.4 superseded by Mechanism 02; §4.5 retired by D-032. Superseded formulas retained as history |

### ⚠ Discovered during implementation — Block 7

| ID | Question | Status |
|---|---|---|
| **Q-14** | **Which observation window sizes the demand rate in the offset?** The offset's incremental quantity is `observed daily consumption × additional days of cover`. The rate could be drawn from all available history, or from the same twelve months D-046 uses for the gross. **Implemented as the twelve-month window**, because the two figures are subtracted from one another and must describe the same year — a rate from nineteen months netted against a twelve-month premium would be two periods wearing one number. **Derived from D-046 rather than chosen**, but recorded because it is a visible modelling choice | `OPEN` — recommendation: keep the twelve-month window |
| **Q-15** | **Does a permanent increase in the inventory *level* change handling cost?** The offset excludes `HANDLING` on the grounds that this correction changes *when* an order is placed, not how many orders or issues occur, so throughput is unchanged and marginal handling is zero. That reasoning is decision-specific and holds for **this** intervention; it does **not** generalise to Mechanism 03's order-frequency subtype, where order count genuinely changes | `OPEN` — must be re-tested per mechanism, never inherited |

### ⚠ Discovered during implementation — Block 6

| ID | Decision to be taken | Status |
|---|---|---|
| **Q-13** | **Independence is checkable against the root-cause classifier, and NOT against the purchasing decision itself.** DP-07 requires a currency claim to be adjudicated by someone independent of *"the price decision"*. Implementing the check revealed that the system records **who classified an expedite's root cause** (`expedite_events.classified_by`) but **not who raised or approved the purchase order**. So independence can be established against the judgement the claim rests on, and not against the purchase itself. **Alternatives:** (a) capture PO author and approver — a real capture obligation, and `F-45` asks whether the factory's ERP even records them; (b) rule that for Mechanism 01 the classifier *is* the relevant party, since the classification is what makes the premium attributable; (c) accept partial verification and disclose it. **Recommended: (b) for Mechanism 01, with (a) added before Mechanism 02**, whose claim genuinely rests on a price decision. **Implemented as (c) meanwhile** — the check runs against the classifier and the UI states plainly which parties could not be checked. **Nothing is asserted that was not verified** | `OPEN` — does not block the MVP; **must be resolved before Mechanism 02** |

### Decisions authorised by Block 1 and not yet taken — none blocks architecture

| ID | Decision to be taken | Status |
|---|---|---|
| **Q-09** | **Commercial-document immutability.** Mechanism 02 rests on PO lines, quotations, contracts and price changes; none are stock movements, and D-001 correctly never claimed document scope. U-12 already requires post-send changes as history, but **no decision states it** | `OPEN` — **required before Mechanism 02 is built.** Does not block architecture |
| **Q-10** | **In-transit ownership.** `In Transit` exists as a bucket; nothing says *whose stock is in it*. Under EXW/FOB it is ours and belongs in the ledger; under DDP it is the supplier's and is `Incoming` under F3 — **not a movement at all**. The same shipment is either a ledger entry or not, depending on the incoterm | `OPEN` — gated by `F-15` |
| **Q-11** | **Source-record drift.** D-001 requires a source document; it says nothing about the source **changing or being deleted** after import. The ledger stays immutable; its evidence does not | `OPEN` — interacts with import architecture (`A-19`) |
| **Q-12** | **Basis semantics.** Five D-002 gaps, better resolved as one decision than five patches: the `ESTIMATED`/`ASSUMED` boundary · a basis for **imported-unverified** and **third-party-asserted** data (a declined quotation is Mechanism 02's whole counterfactual — what basis does a counterparty's claim carry?) · source conflict resolution · `STALE_DATA` scope · whether inputs carry their own `as_of` | `OPEN` — refines D-002; no calculation depends on it |

**All shared-structure questions are now locked** — Q-03 → D-025, Q-04 → D-026, Q-05 → D-028. **Nothing in the design blocks Part 2.2.**

**Updated 2026-08-08.** `Q-07` is **closed** — the taxonomy is re-expressed. Remaining: the factual questions (`F-01` … `F-44`, `REQUIRES_FACTORY_DATA`), one deliberate deferral — `Q-08`, the decomposition engine, which now has its **second and third mechanisms** and could be revisited — and the four decisions Block 1 authorised, `Q-09` … `Q-12`, **none of which blocks architecture.**

---

## Future-domain gaps — acknowledged, unowned, deliberately not built

| Gap | Status |
|---|---|
| **Shipment consolidation** | Real economic effect — freight cost reduced by combining shipments. **Owned by no mechanism.** Mechanism 01 measures the *premium paid to compress time*; this measures *fixed-cost amortisation* — a different mechanism. **Not created** (D-032): gated by `F-01` anyway, materiality unmeasured. **Preserved, not deleted.** Revisit when `F-01` is answered |
| **Logistics-cost domain** | D-030's boundary separates *price* from *quantity* and does so correctly. Shipment consolidation revealed a **third economic domain** the boundary was never written to address. Not a defect in D-030; recorded so it is not rediscovered as a bug |
| ~~Disposal economics~~ | **`OWNED` 2026-08-08 → Mechanism 03 subtype C(f)** (D-033, D-035). Recovery value and disposal cost are one-time and require `F-38`. ⚠ **Disposal does not release capital** — the carrying avoided may be near zero. Only the **tax effect** remains unowned (`B2-03`) |
| ~~Time value of deferred outlay~~ | **`OWNED` 2026-08-08 → Mechanism 03 subtype C(b)** (D-033, D-036). It is the **single financing channel** for level-change interventions, requires `F-22`, needs `F-39`, and **may be negative** |
| **Logistics cost — freight per shipment** | ⚠ **Escalated 2026-08-08.** Previously "acknowledged, unowned"; it is now a **required offset** for Mechanism 03 subtype A on imported items, so the gap **blocks a currency claim** rather than merely existing. Recorded as `B3-02`. **Still not built** — creating a mechanism for an effect of unknown size is challenge D1's breadth risk |

---

## Tracked cross-cutting requirements — not designed, not blocking

| Requirement | Status | Detail |
|---|---|---|
| **Orders & Supply Movement** | `TRACKED REQUIREMENT` — recorded 2026-08-07. **Not a saving mechanism**; classified `ENABLER`. No workshop, no model, no decisions, no build-plan unit. **Classification re-tested and unchanged 2026-08-08.** ⚠ **It is now evidentially load-bearing:** Mechanism 03's position path is computed from **receipt** events including **partials** (`F-41`), and without them subtype A produces fictional findings | `docs/domain/06-orders-and-supply-movement-REQUIREMENT.md` |

---

## DP-10 … DP-15 — **ALL CLOSED 2026-08-08**

Workshopped in `10-Q07-saving-model-reconciliation.md`, adversarially tested in `11-…`, reconciled in `12-…`, re-opened adversarially in `16-BLOCK2-…`, and locked in `17-part-2.3-LOCK.md`.

| ID | Decision | Closed as |
|---|---|---|
| ~~DP-10~~ | Capital release | **D-033.** Six interventions. One-time = level change, recurring = policy change. Principal is never a saving. ⚠ **Excess with no pending order produces no Opportunity** — nothing to defer. Deferral needs `F-39` and may be **negative** |
| ~~DP-11~~ | Retire 4.2 | **D-034.** Retired as a saving category; preserved as a detection signal, a shelf-life trigger into §4.3, and an exposure |
| ~~DP-12~~ | Reclassify 4.9 | **D-034.** `EXPOSURE / RISK`. **No new class.** ⚠ Exposure and expedite counts are **not additive** |
| ~~DP-13~~ | Backtested safety stock | **D-037.** Prospective indication, retrospective realization. ⚠ The observed floor may **enshrine a lucky error**. Gated by `F-01` |
| ~~DP-14~~ | Ownership | **D-011 amendment.** Finding · Action · Data. Adjudicator stays a **reviewer**; mechanism owner is not factory-facing |
| ~~DP-15~~ | Carrying cost | **D-035.** Component-wise. ⚠ **A whole finance rate is almost certainly *invalid*, not merely imprecise** — it nets `EXPOSURE` into a saving. Disposal does not free capital |

### Category verdicts — **all applied 2026-08-08**

| Category | Applied |
|---|---|
| 4.1 excess stock | **Rewritten** → D-033. Capital release is cash-flow timing, never a benefit of its principal |
| 4.2 slow-moving | **Retired** → D-034 |
| 4.3 dead stock | **Rewritten** → D-033 (f), D-035. Disposal does not release capital |
| 4.6 MOQ | **Reshaped** → D-038 subtype D. ⚠ As written it had **no intervention** — an Opportunity only where an alternative is evidenced |
| 4.7 safety stock | **Rewritten** → D-037, D-039 |
| 4.9 stockout | **Reclassified** → D-034 |

---

## Block 2 questions — resolved or open

| ID | Question | Status |
|---|---|---|
| ~~B2-01~~ | Which channel claims the financing effect — deferral, or capital-in-carrying-cost? | **`CLOSED` → D-036.** ⚠ **Not a choice.** They are the same product over different windows; the intervention's recurrence determines which applies. Never both, never summed |
| **B2-02** | Does a class of items exist whose demand **cannot be rescheduled or suppressed** (maintenance spares, failure-driven demand), narrowing D-037's blind spots? | `OPEN` — `REQUIRES_FACTORY_DATA`. Recorded as a **question**, never applied as an assumption |
| **B2-03** | Does the disposal **tax effect** belong to finance entirely (D-008), or is it disclosable here? | `OPEN` — not claimed either way |
| **B2-04** | Where is *"excess without pending orders"* reported, given it is a **position and not an Opportunity**? | `OPEN` — a presentation question, not a monetary one |

## Block 3 / Part 2.3 questions

| ID | Question | Status |
|---|---|---|
| **B3-01** | Within subtype A, **temporal consolidation and order-quantity reduction contradict each other.** Which is right depends on the sign of `ordering cost + freight − carrying` | `OPEN` — resolvable only with `F-31`, `F-08` and `F-43`. Until then **both are `OPPORTUNITY DETECTED` without currency**, presented as an open question to the factory, never silently resolved |
| **B3-02** | **Freight per shipment is owned by no mechanism** (D-032's preserved logistics gap). It is now a required offset for subtype A on imported items | `OPEN` — ⚠ **the gap now blocks a currency claim** rather than merely being acknowledged |
| **B3-03** | **Materiality gate for quantity changes.** EOQ's cost curve is flat near the optimum, so small quantity changes produce savings inside the noise of the inputs | `OPEN` — the threshold is **finance-owned**, never chosen here. Stating the property is not the same as picking a number |

### Cross-cutting rules raised earlier — **now locked**

| Candidate | Locked as |
|---|---|
| A financial rate must be **fit for the decision** it is used in | **D-023 amendment** + **D-014 rule 10 `purpose`**. ⚠ Purpose must be **structured**, not free text — a mechanism cannot match against prose, and DP-15's obsolescence case demands **blocking**, not disclosure |
| **Asymmetric valuation** must be presented, not hidden | **D-041.** The net figure declares its own incompleteness, and the exclusion is always optimistic |
| **`MITIGATES`** relationship type | **D-031 second amendment.** Disclosure-only, never netted, no severity score |

---

## Answered

| ID | Question | Answer | Recorded in |
|---|---|---|---|
| B-01 | Primary user | Inventory / warehouse manager | D-007 |
| B-02 | MVP boundary | **Re-answered 2026-08-10 → D-054.** Inventory + procurement + cost **+ Production Feasibility (read-only, one level of product structure)**. Previously *"Inventory + procurement + cost"* with *"no production… BoMs or MRP"* | D-007 as amended by D-054 |
| B-03 | Manufacturing type | Mixed | D-009 |
| B-04 | Deployment scope | Single site, site-scoped records | D-004 |
| B-06 | Valuation ownership | Finance owns it; we own quantity truth | D-008 |
| N-08 | Annualisation minimum history | 12 months usable, preferred minimum | D-014 (locked rule 11) |

---

## BLOCK 4 — MVP classification, 2026-08-08

Full analysis: `docs/domain/18-BLOCK4-mvp-domain-freeze.md`. **Every unresolved item in this register is now classified.** Nothing remains as "future work."

**Test applied.** An item is `A — MUST RESOLVE BEFORE MVP` only if leaving it unresolved could produce a **false saving** · a **materially misleading recommendation** · **broken inventory or order truth** · a **provenance violation** · **double counting** · **contradictory recommendations** · or an **impossible MVP workflow.** Theoretical interest is not a criterion.

### A — MUST RESOLVE BEFORE MVP

| ID | Why it blocks — the specific failure |
|---|---|
| `A-19` stack | Nothing can be built. Criteria already fixed by F2: transactional integrity, exact decimals, fast projections |
| `A-01` projection strategy | ⚠ **Not merely "shapes the write path."** D-039 needs point-in-time reconstruction over long windows; async without **historical replay** makes every saving backtest impossible |
| `A-20` permission model | Currency claims need an adjudicator **independent of the underlying decision** (DP-07). Without roles, either a buyer approves their own saving or the workflow is impossible |
| `A-02` reservation, hard or soft | Determines whether `Available` is truthful (F3). A wrong `Available` breaks inventory truth |
| `A-18` excess ↔ dead boundary | ⚠ **Only this boundary blocks.** D-035 treats capital as *tied* for excess and *lost* for dead — an undefined boundary silently moves money between two different claims. **A factory policy; we may not choose it** |
| `N-03` consumption granularity | Ledger-shaping and **unbackfillable** |
| `N-04` catch-weight | Ledger-shaping. Retrofitting corrupts every historical quantity |
| `F-06` how an expedite is recognised | ⚠ **The MVP's detection trigger.** No events, no mechanism |
| `B-07` pilot factory | An MVP validated against no factory is unvalidated business logic (§47) |

**Fixed in Block 4, not carried forward:** `A-09` currency contradiction → D-042 · aggregation of uncomputable members → D-043 · the headline range's construction → D-044 · `A-03` confidence → D-045 · annualisation method → D-046 · §4.4's live formula · *"dedupe by subject"* in two documents.

### B — CAN RESOLVE DURING MVP BUILD

`N-01` finance contract and `U-14` *(⚠ the MVP mechanism's currency comes from **procurement documents**, not the cost reference)* · `A-04` period close · `A-10` location depth · `A-11` item-master ownership · `A-12` supplier sample *(constrains a display, not a claim)* · `A-15` inspection policy · `N-05` handheld vs desk · `N-12` opportunity ownership *(configuration of existing fields)* · `N-13` intervention owner *(**answered in substance** by the D-011 amendment)* · `P-12` design system · `Q-01` quality rejection *(a list entry in D-018's categories)* · `Q-02` defensible counterfactual *(**needs real events — it is MVP work**)* · `Q-06` other costs of a lead-time correction *(D-015 nominated the slice to test exactly this)* · `W-24` which contradiction resolution applies when · `W-32` who adjudicates a contradiction *(folds into `A-20`)*.

### C — CAN BE DEFERRED AFTER MVP

`P-01`…`P-07`, `P-09`…`P-14` · `A-05` catch-weight UoM elaboration *(the **requirement** is `N-04`, class A)* · `A-06` lot genealogy · `N-02` outbound feed · `N-06` history depth · `N-09` staleness threshold · `N-11` service level *(**constrained**: a policy the factory states, never a model)* · `Q-08` decomposition engine *(now has its 2nd and 3rd mechanisms)* · `Q-09` document immutability *(required before **Mechanism 02**, not before MVP)* · `Q-10` in-transit ownership · `Q-11` source drift · `Q-12` basis semantics · `W-02`, `W-07`, `W-08`, `W-10`, `W-11`, `W-13`, `W-14` *(Mechanism 02 refinements)* · `W-43`, `W-44` · `B2-02`…`B2-04` · `B3-01`…`B3-03` · **promotion of D-004, D-006, D-010, D-012, D-013, D-015**.

**Two that look blocking and are not.** `W-20` — does one unestablished comparability dimension block currency outright? A **Mechanism 02** question; the MVP has one mechanism and no comparability gates. `W-31` — is the signature dimension vocabulary locked or extensible? ⚠ **Part 2.3 answered it by demonstration** — Mechanism 03 added seven dimensions, so it must be extensible. Formalise at a fourth mechanism.

> ⚠ **On the six `PROPOSED` decisions.** **D-012 is amended by three *locked* decisions while itself unlocked.** Their substance is used consistently everywhere, so none blocks the MVP — but the audit trail says a locked decision amends an unlocked one. **Ratification, not redesign.** Deferred only because it changes nothing an engineer would build.

### D — RETIRED / NO LONGER NEEDED

`P-08` → D-040 · `Q-03`, `Q-04`, `Q-05`, `Q-07` → closed · `N-07` ≡ `F-01` and `N-10` ≡ `F-08` → duplicates · `N-08` → rule 11 · `A-07`, `A-08`, `A-13`, `A-14`, `A-16`, `A-17` → D-008 / D-010 · `B-01`…`B-06` → answered · `M-01`…`M-08` → D-017…D-024 · `DP-01`…`DP-15` → closed · `W-01`, `W-03`…`W-06`, `W-09`, `W-12`, `W-17`, `W-23`, `W-25`, `W-26`, `W-33`, `W-35`, `W-36`, `W-45`…`W-49` → closed by the locks · §4.2 · §4.5 · D-003 · D-005 · D-016 · **avoidability weights · minimum event counts · service-level models · EOQ** → rejected outright.

### E — BLOCKED BY FACTORY EVIDENCE

`F-01` … `F-44`. **Only four gate the MVP** — `F-06` detection · `F-41` correctness · `F-01` currency only · `F-07` currency only — plus `F-09` as a claim gate. The readiness matrix with source, evidence class, provenance and **fallback if missing** is Part E of file 18.

⚠ **Seven register items will be created by the product itself** — root-cause classification, expedite flags going forward, override history, escalation records, decision rationale, realization measurements, adjudication records. **Do not ask the factory for these.** Ask only whether they *could* be captured.

---

## BLOCK 8 — Production Feasibility, 2026-08-10

Decisions D-054 … D-058 admit the capability. Analysis: `docs/domain/21-BLOCK8-PRODUCTION-FEASIBILITY-DOMAIN-LOCK.md`.
Contract: `docs/domain/22-BLOCK8-DOMAIN-CONTRACT.md`.

**Taken under product-owner authorisation of 2026-08-10**, which directed that unavailable factory
facts be represented honestly with safe fallbacks rather than blocking progress. **Every fallback
below is conservative, disclosed in the product, and invents nothing.**

### New factory questions

| ID | Question | Class | Fallback in force until answered |
|---|---|---|---|
| **F-48** | **Do product recipes exist in recorded form** — and is any component itself made rather than bought? Also: **what word does the factory use** for a recipe? | **BLOCKING for real data · NOT blocking for build** | **Absence is represented, never filled.** An item with no recorded structure returns **⚪ CAN'T SAY**. The MVP ships one **`DEMO` recipe** against the seeded demo product, **visibly marked `DEMO` in the product**, so the contract is demonstrable before factory data exists. **No demo structure is ever presented as factory data**, and no real item silently inherits one |
| **F-49** | Does the recorded recipe quantity **include process loss / scrap**, or is it theoretical? | VALIDATION | The recorded quantity is used **exactly as recorded**. **No yield factor is applied or invented.** The answer states it used the recipe as recorded |
| **F-50** | Are supplier lead times **calendar or working days** — and what is the factory's working week and holiday calendar? | VALIDATION | **Calendar days, convention stated on the answer.** No weekend or holiday adjustment. Becomes **configuration, not migration**, when answered |
| **F-51** | Does the source system record **supplier acknowledgement**, distinct from "sent"? | VALIDATION | `SENT` counts as incoming and **the limit is disclosed**. One reason nothing un-received may produce 🟢 |
| **F-52** | For catch-weight items, is there a **stated expected weight per purchase unit**? | VALIDATION | Shortfall is stated in the stock unit; **the pack count is left to the buyer.** `actual_qty` is never invented (D-048) |
| **F-53** | Are any components **both made and bought** (make-or-buy)? | FUTURE | A component with its own recipe yields **⚪**, which is over-conservative if it is also purchased. Inferring make-or-buy from supplier terms would be a silent inference and is refused |

**Also worth asking, and not a data request:** *"walk me through the last time you couldn't produce something on time — what happened, and what would have helped?"* It validates the capability's shape better than any structured question.

### Reopened and re-answered

| ID | Was | Now |
|---|---|---|
| **B-02** | `ANSWERED` → D-007, *"no production… BoMs or MRP"* | **Re-answered** → D-054. Inventory + procurement + cost **+ Production Feasibility** |
| **A-14** | `CLOSED` — *"reorder point / min–max only. No MRP"* | **Re-answered** → D-054. **Planning is unchanged**; feasibility is not a planning methodology |

### Register inconsistencies found by Block 8 — now resolved

| # | Finding | Resolution |
|---|---|---|
| **R-01** | `A-16` carried two contradictory statuses — Tier 2 `DEFERRED`, Block 4 class D `RETIRED` | **`DEFERRED` is correct.** Annotated on the Tier 2 line |
| **R-02** | Code standard 13 governed manufacturing orders, a domain D-007 excludes | **Rewritten** to govern product-structure versioning in a feasibility answer. Original preserved; returns when production execution is built |
| **R-03** | `A-19` read `OPEN` with no pointer to D-047 | **Annotated.** Stack closed; deployment open |
| **R-04** | `A-02` read `OPEN` with no pointer to D-050 | **Annotated**, with the ⚠ that D-055's transience rule is what holds D-050 up |
| **R-05** | `20-PRODUCT-ARCHITECTURE-RECONCILIATION.md` overstated what Production Planning unblocks | **Withdrawn** for feasibility in `21-…§1.2 ⑦`. D-037's blind spots need production **execution**, not a question |

### Block 8 classification of what remains

**A — MUST RESOLVE BEFORE BLOCK 9:** *(none)* — all five decisions are locked and every unknown has a conservative fallback.

**B — RESOLVE DURING BUILD:** `F-48` for real factory data *(the demo structure carries the contract until then)*.

**C — DEFERRED:** `F-49` · `F-50` · `F-51` · `F-52` · `F-53` · multi-level explosion · MOQ and order multiples applied to a recommendation *(`F-42`, `F-44`)* · expired / shelf-life-constrained supply *(`F-34`)* · in-transit stock *(`Q-10`, gated on `F-15`)* · audit retention for answers · a `PRODUCTION_PLANNER` role *(D-058 — derivable only when production execution exists)*.

**D — NOT NEEDED:** a confidence score for feasibility *(D-045 already forbids it)* · a planning-horizon concept *(meaningless for one question at a time)* · safety stock in the feasibility calculation *(never — D-057, §16)* · a yield-factor decision *(`F-49` is a data field, not a decision)*.

**E — BLOCKED BY FACTORY EVIDENCE:** `F-48` **for real recipes only.** ⚠ **It does not block Block 9**, because the absence is represented as ⚪ and the demo structure exercises every path.
