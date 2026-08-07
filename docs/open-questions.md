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
| B-05 | Is inventory truth an append-only movement ledger? | F2 — the foundation of traceability and §38 data trust | `PROPOSED` — yes → D-001 |
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
| P-08 | When is EOQ appropriate — and when is it misleading? | `OPEN` — see C6; treat with suspicion |
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
| N-11 | Target service level for safety stock? | Safety-stock opportunities (4.7) | `OPEN` |
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
| F-31 | Is **ordering cost** known, and does Finance own it? | W-35, temporal consolidation |
| F-32 | Are shipments recorded such that multiple POs on one shipment are identifiable? | W-35, shipment consolidation |

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
| Q-07 | Categories 4.1–4.7 of the saving model predate D-017 and still describe weighted/threshold calculations | Re-express each as *intervention + counterfactual* before specification |

**All shared-structure questions are now locked** — Q-03 → D-025, Q-04 → D-026, Q-05 → D-028. **Nothing in the design blocks Part 2.2.**

Remaining: factual questions (`F-01` … `F-10`, `REQUIRES_FACTORY_DATA`) and two deliberate deferrals — `Q-07` (re-express saving-model categories 4.1–4.7 under D-027) and `Q-08` (the decomposition engine, awaiting a second mechanism).

---

## Future-domain gaps — acknowledged, unowned, deliberately not built

| Gap | Status |
|---|---|
| **Shipment consolidation** | Real economic effect — freight cost reduced by combining shipments. **Owned by no mechanism.** Mechanism 01 measures the *premium paid to compress time*; this measures *fixed-cost amortisation* — a different mechanism. **Not created** (D-032): gated by `F-01` anyway, materiality unmeasured. **Preserved, not deleted.** Revisit when `F-01` is answered |
| **Logistics-cost domain** | D-030's boundary separates *price* from *quantity* and does so correctly. Shipment consolidation revealed a **third economic domain** the boundary was never written to address. Not a defect in D-030; recorded so it is not rediscovered as a bug |
| **Disposal economics** | **New, from the Q-07 audit.** Recovery value and disposal cost — required by 4.3, owned by no mechanism, unavailable |
| **Time value of deferred outlay** | **New, from the Q-07 audit.** 4.1's real financial benefit is the financing cost over the deferral period (`F-22`), not the principal. No mechanism claims it |

---

## Tracked cross-cutting requirements — not designed, not blocking

| Requirement | Status | Detail |
|---|---|---|
| **Orders & Supply Movement** | `TRACKED REQUIREMENT` — recorded 2026-08-07. **Not a saving mechanism**; classified `ENABLER`. No workshop, no model, no decisions, no build-plan unit. Not blocking anything | `docs/domain/06-orders-and-supply-movement-REQUIREMENT.md` |

---

## Q-07 audit — decision points awaiting review (2026-08-07)

Full analysis in `docs/domain/10-Q07-saving-model-reconciliation.md`. **Nothing rewritten, nothing locked.**

| ID | Decision | Status |
|---|---|---|
| **DP-10** | Is "working capital release" reported as a magnitude, and how labelled so a principal is not read as a benefit? | `OPEN` |
| **DP-11** | Retire **4.2 slow-moving** as a saving category, keeping it as a detection signal? | `OPEN` |
| **DP-12** | Reclassify **4.9 stockout avoidance** as `EXPOSURE / RISK`? | `OPEN` |
| **DP-13** | Accept **backtested** safety stock as the re-expression of 4.7, replacing the modelled form? | `OPEN` |
| **DP-14** | Which domain owns **4.1** — detected in inventory, acted on through purchasing? | `OPEN` |
| **DP-15** | Is an **average** carrying rate acceptable for a **marginal** disposal decision (4.3)? | `OPEN` |

### Category verdicts

| Category | Verdict |
|---|---|
| 4.1 excess stock | Rewrite. **Capital release is a cash-flow timing effect, not a benefit of its principal** |
| 4.2 slow-moving | **Retire as a category** — no independent intervention; detection signal only |
| 4.3 dead stock | Rewrite. Exclusion principle survives; **average-rate-on-marginal-decision** problem |
| 4.6 MOQ | Rewrite. Composes with M02 **in the opposite direction** |
| 4.7 safety stock | Rewrite. **Backtested form is materially stronger than modelled** |
| 4.9 stockout | **Reclassify** as `EXPOSURE / RISK` — conclusion survives, home changes |

### New factory-data dependencies

Disposal cost · recovery value · marginal vs average storage cost basis · requirement-at-order-time · price impact of MOQ reduction · `A-18` coverage policy (blocks 4.1 and 4.3).

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
