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
| A-02 | Hard or soft reservation? | F3 | `OPEN` |
| A-03 | How is confidence defined and computed? | F4 | `CONSTRAINED` — locked rule 15: from evidence/data coverage, never category constants. Exact formula still `OPEN` |
| A-04 | Who may close/reopen an accounting period? | F5 | `OPEN` |
| A-05 | Are catch-weight items required? | F6 | `OPEN` — **likely yes** under mixed manufacturing (see N-04) |
| A-06 | Is full lot genealogy required at first release? | F7 | `OPEN` — narrowed: no production means no input→output genealogy in release 1. Lot-level stock visibility only |
| A-07 | Costing method(s) to support: standard, moving average, FIFO? | F8 | `CLOSED` — finance owns valuation (D-008). No costing engine here |
| A-08 | Is standard cost per site or global? | F1/F8 | `CLOSED` — single site; cost is imported (D-008) |
| A-09 | Multi-currency and FX at first release? | C1 | **`TIER 1` — escalated 2026-08-07 by D-024.** FX normalisation is mandatory for any cross-period financial comparison. Remaining work is the factory-data side (`F-07`) |
| A-10 | Location hierarchy fixed-depth or arbitrary? | C2 | `OPEN` |
| A-11 | Who owns item master data? | C3 | `OPEN` |
| A-12 | Minimum sample size before a supplier metric is shown? | C4 | `OPEN` |
| A-13 | Is there real sales-order demand, or forecast only? | C5 | `CLOSED` — demand is observed consumption (D-010) |
| A-14 | Which planning methodologies at first release? | C6 | `CLOSED` — reorder point / min–max only. No MRP (D-010) |
| A-15 | Is incoming inspection mandatory, per-item, or per-supplier? | C8 | `OPEN` |
| A-16 | Backflush or explicit material issue? | C10 | `DEFERRED` — production out of scope. Release 1 uses issue-to-consumption (D-010) |
| A-17 | Are labour/machine/overhead rates available, or is material cost the only real component? | C13 | `DEFERRED` to finance (D-008); relevant to N-01 granularity |
| A-18 | Thresholds defining aging, slow-moving, excess, dead stock, stockout risk | C9 | `OPEN` |
| A-19 | Technology stack and deployment architecture | Bible §54.21–22 | `OPEN` |
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
| B-02 | MVP boundary | Inventory + procurement + cost | D-007 |
| B-03 | Manufacturing type | Mixed | D-009 |
| B-04 | Deployment scope | Single site, site-scoped records | D-004 |
| B-06 | Valuation ownership | Finance owns it; we own quantity truth | D-008 |
| N-08 | Annualisation minimum history | 12 months usable, preferred minimum | D-014 (locked rule 11) |
