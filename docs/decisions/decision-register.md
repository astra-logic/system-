# Decision Register

> Per the Product Bible: *"When a decision affects architecture, record it."*
>
> Every entry records what was decided, why, what was rejected, and what it costs. **No entry is `ACCEPTED` until a human accepts it.** Proposals below are recommendations from planning, not settled facts.

**Status:** `PROPOSED` · `ACCEPTED` · `LOCKED` (settled by the product owner; not revisited without a new decision) · `REJECTED` · `SUPERSEDED`

---

## D-001 — Inventory truth is an append-only movement ledger

**Status:** `PROPOSED` · **Area:** F2 · **Blocks:** everything in inventory, cost, traceability

**Decision.** Stock truth is an immutable, double-entry ledger of movements. Balances are derived projections. Corrections are reversing entries, never edits.

**Why.** Traceability, reconciliation, valuation and §38 data trust all become properties of the model rather than features to build. Stock is conserved by construction. Backdated entries — normal in factories — are handled natively.

**Rejected.** A mutable on-hand quantity per item/location. Simpler and faster to build; loses history, cannot explain discrepancies, and makes §38 unachievable.

**Cost.** Balance projections must be maintained or every stock screen scans history. Higher write complexity. More storage.

---

## D-002 — Provenance is a platform primitive, not a UI convention

**Status:** `PROPOSED` · **Area:** F4 · **Blocks:** analytics, recommendations, AI

**Decision.** Every derived value carries `{value, unit, basis, as_of, inputs, assumptions, confidence, limitations}`. Basis degrades contagiously — anything computed from a forecast is at best a forecast, and an aggregate carries the *weakest* basis among its components. `INSUFFICIENT_DATA` is a designed state, not an error.

**Amended 2026-08-06** (`docs/01-core-mission.md` §7): basis has **eight** values, adding `STALE_DATA` — `ACTUAL · CALCULATED · FORECAST · ESTIMATED · ASSUMED · USER_DEFINED · INSUFFICIENT_DATA · STALE_DATA`. This matters most under D-008: cost is imported from finance, so when that import ages past its threshold (`N-09`), every financial figure resting on it changes basis, and contagion carries that upward through every aggregate.

**Why.** §38 is otherwise unenforceable. If provenance is a label features remember to attach, some feature eventually won't, and one confident wrong number discredits every honest one beside it.

**Rejected.** Per-feature provenance labelling. Cheaper; fails silently and unevenly.

**Cost.** Touches every calculation and every display component. Must exist from day one — retrofitting means auditing every number in the system.

---

## D-003 — Recommendations have a lifecycle and impact claims have states

**Status:** `SUPERSEDED` by D-011 (2026-08-06) · **Area:** F9

Proposed a recommendation object with lifecycle `PROPOSED → ACCEPTED → ACTIONED → MEASURED → REALISED / NOT_REALISED` and typed impact claims. Correct in principle but under-specified against `docs/01-core-mission.md` §5–§6, which defines a richer object and canonical lifecycle vocabulary. See D-011 and `docs/domain/03-saving-opportunity-model.md`.

Carried forward intact: **baselines are captured before the action**, and **only measured outcomes may be reported as realised**.

---

## D-004 — Site-scoped records from day one

**Status:** `PROPOSED` · **Area:** F1 · **Context:** B-04 answered — deployment is single site

**Decision.** All operational records carry a site dimension, even in a single-site deployment. Products and suppliers are global; stock, cost and commercial terms are site-scoped.

**Why.** Retrofitting a site dimension onto stock, cost and documents is among the most expensive migrations in this class of system, and it corrupts historical reporting when done late.

**Rejected.** Single-site simplicity now, multi-site later.

**Cost.** Minor ongoing overhead in every query and screen.

---

## D-005 — Costing method is per item; cost is fixed at movement time

**Status:** `SUPERSEDED` by D-008 (2026-08-06) · **Area:** F8

Proposed a three-method per-item valuation engine (`STANDARD | MOVING_AVERAGE | FIFO_LAYER`) owned by this system. Superseded when B-06 was answered: **an external finance system owns valuation.** This system does not compute inventory value, so it does not need a costing engine. See D-008.

The one principle worth carrying forward: **a movement's cost signal is fixed when recorded and never rewritten retroactively.** That is what makes any figure this system shows reproducible twice.

---

## D-006 — Thin vertical slice before broad phase build-out

**Status:** `PROPOSED` · **Area:** build sequence · **Challenges:** Bible §51

**Decision.** Keep §51's dependency order, but validate foundations early with one material travelling supplier → PO → receipt → stock → consumption → cost, exercising D-001, D-002 and D-008 end to end.

**Why.** §51 as written defers real workflow validation to roughly Phase 13, by which point twelve phases of assumptions are load-bearing. A vertical slice tests the foundations while they are still cheap to change, without violating §50's dependencies-first principle.

**Rejected.** Strict phase-by-phase completion.

**Cost.** Some rework as the slice widens. Far cheaper than discovering a ledger flaw at Phase 13.

---

## D-007 — First release is the inventory + procurement + cost wedge, warehouse-first

**Status:** `ACCEPTED` 2026-08-06 · **Area:** scope · **Answers:** B-01, B-02

**Decision.** First release covers inventory truth, procurement, and cost consequence, for a single site, with the **inventory / warehouse manager** as primary user. Production, maintenance, full quality, BoMs, MRP and capacity are out. Detail in `docs/domain/02-first-release-scope.md`.

**Why.** Directly answers challenge D1: breadth is this project's principal risk. This wedge is the narrowest scope that still delivers the product's actual differentiator — operational truth connected to financial consequence — rather than a stock-tracking tool. Warehouse-first sequencing means the data foundation is earned by the person accountable for it before anything is built on top of it.

**Rejected.** *Inventory only* — defensible but doesn't demonstrate the product thesis. *Adding production* — roughly triples scope and delays validation. *Full breadth* — the failure mode D1 describes.

**Cost.** No MRP, no requirements explosion, no production visibility. These are real capability gaps that must be stated plainly to users rather than disguised.

---

## D-008 — This system owns quantity truth; finance owns valuation

**Status:** `ACCEPTED` 2026-08-06 · **Area:** F8, integration · **Answers:** B-06 · **Supersedes:** D-005

**Decision.** This system is authoritative for *what stock exists, where, and in what state*. An external finance system is authoritative for what it is worth. Consequently this system: holds an **imported cost reference** (basis `USER_DEFINED`, with an `as_of` date), never a computed valuation; emits a movement feed to finance rather than posting entries; and surfaces variances as **signals for decisions**, not journal entries.

**Why.** Removes the largest and riskiest piece of the original scope — a full valuation engine with period close — while preserving the financial intelligence of §37, which needs cost *reference* rather than cost *ownership*.

**Rejected.** Owning valuation. More self-contained and far larger; also duplicates a system of record the business already has, which is how two sets of books get created.

**Cost.** The financial-impact engine now depends on an integration, and its credibility is bounded by the freshness of imported cost. **That bound must be visible in the product.** A stale cost import makes every financial figure stale, and per D-002 the system must say so rather than presenting confident numbers over aged inputs.

---

## D-009 — Mixed manufacturing: item behaviour is per item, not per system

**Status:** `ACCEPTED` 2026-08-06 · **Area:** F3, F6, F7 · **Answers:** B-03

**Decision.** The item master supports process materials (continuous quantity, weight/volume, density conversions) and discrete goods (countable units, serials) as first-class alongside each other. Tracking policy (`NONE | LOT | SERIAL`), UoM conversions and rounding rules are all **per item**. Ledger quantities are decimal throughout; integer-only items are a validation rule, not a separate code path.

**Why.** The factory is genuinely mixed. A system that assumes one mode forces the other into workarounds, and workarounds in inventory become inaccuracy. Per-item polymorphism costs little at design time and is very expensive to introduce later.

**Rejected.** Process-first with discrete bolted on later — would compromise the ledger's numeric model, the hardest thing to change afterwards.

**Cost.** Every quantity-handling path must be correct for both modes, and tested for both.

---

## D-010 — Demand is observed consumption; planning is reorder-point, not MRP

**Status:** `PROPOSED` · **Area:** C5, C6 · **Follows from:** D-007

**Decision.** With production out of scope, material leaves stock via an **issue-to-consumption** movement carrying a reason code and (proposed) a consuming cost centre. The demand signal is historical consumption. Planning is reorder point / min–max plus projected availability. **No MRP.**

**Why.** MRP requires BoMs, which require production. Reorder-point planning on real consumption history is well-understood, honest, and sufficient for the buying decisions this release targets.

**Rejected.** Synthesising demand from forecasts the factory has not made — fabrication, and forbidden by §47.

**Cost.** Planning is reactive. New items have no history and must return `INSUFFICIENT_DATA` or accept user-defined values. Demand step-changes are invisible until they have happened. **The product must not imply foresight it does not have.**


---

## D-011 — Potential Annual Saving is the North Star; the Saving Opportunity is the core object

**Status:** `ACCEPTED` 2026-08-06 · **Area:** F9, product framing · **Supersedes:** D-003 · **Source:** `docs/01-core-mission.md`

**Decision.** The primary business KPI is **Potential Annual Saving**. The Saving Opportunity replaces the recommendation object, carrying the eighteen fields of core-mission §5 — including **separate one-time and recurring impact** — and the canonical lifecycle `POTENTIAL → APPROVED → IN_PROGRESS → REALIZED`, with `REJECTED` and `EXPIRED`. Measurement against a pre-captured baseline gates entry to `REALIZED`.

Operational management is reclassified as `ENABLER`. The saving engine is `CORE`.

**Why.** The core mission document is explicit that this is not an ERP measured by module count but an intelligence system measured by savings discovered and verified. The object must match that, and the one-time/recurring split is the single field most often collapsed — conflating them overstates the headline figure by roughly an order of magnitude.

**Rejected.** Keeping D-003's simpler structure. Cheaper; loses root cause, data freshness, owner, and the one-time/recurring distinction, all of which the North Star depends on.

**Cost.** A richer object to populate, and opportunities that cannot fill it honestly must return `INSUFFICIENT_DATA` rather than a partial figure.

**Does not change the build order.** Bible §56-03 and §50 still hold: a saving engine over untrustworthy stock data produces confident nonsense. Foundations first.

---

## D-012 — The headline saving figure is a range, deduplicated, split by impact type

**Status:** `PROPOSED` · **Area:** F9 · **Depends on:** D-002, D-011

**Decision.** The Potential Annual Saving figure must: be expressed as a **range**, not a point; carry the **weakest basis** among its inputs; **deduplicate overlapping opportunities** and show the deduction; report **recurring impact only** in the annual figure, with one-time capital release stated separately; and refuse to annualise below a minimum history window (`N-08`). Alongside it the system displays its own **realised-versus-identified ratio**.

**Amended 2026-08-07 by D-020.** The original deduplication rule — *"key = (item, PO line, period); any PO line contributes to at most one currency claim"* — is **withdrawn as too blunt.** Deduplication happens at the **economic-mechanism** level: genuinely independent effects on the same transaction may both be quantified, and attribution must be explainable. All other provisions of D-012 stand unchanged.

**Amended 2026-08-07 by D-021.** `COST / EXPOSURE / RISK` amounts never enter this aggregate and must be structurally incapable of doing so.

**Why.** This is the number the entire product is judged on, and it is the easiest to inflate invisibly — through double counting, one-time/recurring conflation, thin-history annualisation, or basis laundering by aggregation. It will be audited by a finance manager, and it must survive that.

**Rejected.** A single confident headline number. More impressive; collapses under the first audit, and takes every other number in the product with it.

**Cost.** A less striking dashboard. Per Bible §56-10, that is the correct trade — and per §47, the alternative is prohibited outright.

---

## D-013 — The vertical slice extends to a quantified saving opportunity

**Status:** `PROPOSED` · **Area:** build sequence · **Amends:** D-006

**Decision.** D-006's slice ran supplier → PO → receipt → stock → consumption → cost. It now runs one step further: **to a single defensible saving opportunity for one material.**

**Why.** Under D-011 the saving engine is the product. A slice that stops at cost proves the enabler and never tests the thesis. Extending it exercises D-002, D-008, D-011 and D-012 together while they are still cheap to change — and it surfaces the aggregation and basis problems early, when they are design questions rather than credibility incidents.

**Rejected.** Keeping the slice at cost and deferring the saving engine wholesale to Stage 4. Lower risk per unit; defers the product's central risk to the point where it is most expensive to discover.

**Cost.** One saving category must be built earlier than its stage would suggest. Recommended: **expedite/freight premium (4.8)** — it measures money actually spent, needs no assumed carrying rate, and is therefore the most defensible thing to prove the mechanism with.

---

## D-014 — The 16 financial-trust rules are locked project law

**Status:** `ACCEPTED` 2026-08-06 (locked by the user) · **Area:** F9, financial integrity · **Source:** `docs/02-handoff-part1-locked.md`

**Decision.** The sixteen financial-trust rules of the handoff are adopted verbatim as binding constraints on every saving figure the product produces. They confirm and extend D-011 and D-012.

**Questions they close:**

| Rule | Closes |
|---|---|
| 11 — 12 months usable history as preferred minimum for demand-based annualisation | `N-08` |
| 12 — below that, never a silent confident annual number | `N-08` |
| 15 — confidence from evidence and data coverage, never category constants | Constrains `A-03` |
| 10 — financial inputs carry source, owner, effective date, freshness, status | Extends the D-002 envelope for imported financial inputs |
| 13 — missing data yields `INSUFFICIENT_DATA` / `CANNOT_CALCULATE`, never zero | Confirms D-002 |
| 16 — generated or demo data is never presented as real factory transactions | Confirms Bible §47 |

**Why.** These were already the direction of travel in D-011 and D-012; being locked by the product owner makes them law rather than recommendation. Rule 15 in particular removes a temptation that would otherwise have crept in — assigning confidence by category because it is easier than computing coverage.

**Cost.** None beyond what D-012 already imposed. They make the product slower to show impressive numbers, which is the intent.

---

## D-015 — Expedite premium is the first mechanism; its defensible core is lead-time correction

**Status:** `PROPOSED` · **Area:** saving taxonomy · **Detail:** `docs/domain/04-mechanism-01-expedite-premium.md`

**Decision.** Build the expedited-freight / emergency-purchase premium mechanism first, and take as its first deliverable the narrowest fully defensible slice: **items whose master-data lead time is demonstrably wrong, evidenced by repeated expedites, where the fix is a parameter correction the system can verify within its own data.**

**Why.** It needs no assumed carrying-cost rate, no external baseline, and carries no FX exposure in the causal claim. Cause, action and verification all sit inside the system. It is the cleanest available end-to-end proof that the saving loop works, and it fits D-013's vertical slice exactly.

**Rejected.** Building the full premium taxonomy at once — most of it depends on unresolved capture (`N-07`), unratified avoidability weights, and the carrying-cost rate (`N-10`).

**Cost.** A modest first claim. That is the correct trade for the first number the factory ever sees from this product.

**Blocked by.** `N-07` / `F-01` (separable freight capture). Without it the mechanism yields event counts, not currency.

**Strengthened 2026-08-07 by D-017.** With numerical avoidability weights rejected, quantification requires a testable counterfactual over identified events. Lead-time correction is the case where such a counterfactual is genuinely computable *and* where the intervention may require no additional inventory — so it is now the first slice for two independent reasons, not one.

---

## D-016 — FX normalisation is mandatory before any financial trending

**Status:** `SUPERSEDED` by D-024 (2026-08-07) — the proposal was accepted, locked at Tier 1, and extended with the four-way change decomposition · **Area:** F4, F8, all saving mechanisms

**Decision.** All financial comparison, trending and annualisation must be FX-normalised to a stated finance-owned policy rate before figures are compared across periods. `A-09` (multi-currency) is escalated from an ordinary architectural question toward a foundational one.

**Why.** The factory is in Egypt and import-dependent. Freight and imported material are commonly USD/EUR-denominated while reporting is EGP. Following the EGP devaluations, a premium or price that appears to have grown substantially year-on-year may be **entirely currency movement with no operational change**. Without normalisation the saving engine will generate large, confident, wholly false opportunities — the exact failure the locked rules exist to prevent.

**Rejected.** Treating multi-currency as a later feature. Defensible for a domestic factory; not for this one.

**Cost.** FX policy, rate source and effective-dating must be settled early, and every historical comparison carries a normalisation step.

**Requires.** Finance to own the policy rate and its effective dates (locked rule 8).

---

# Part 2.1 Decision Lock — 2026-08-07

Decisions D-017 … D-024 were locked by the product owner in response to the eight decision points raised by `docs/domain/04-mechanism-01-expedite-premium.md`. They close Tier-5 questions M-01 … M-08.

---

## D-017 — Avoidability is categorical, never weighted

**Status:** `LOCKED` 2026-08-07 · **Area:** F9, mechanism 01 · **Closes:** M-01 · **Corrects:** the draft-1 proposal in mechanism 01 §5

**Decision.** Avoidability is classified from evidence into `HIGH` · `LOW` · `NOT AVOIDABLE` · `UNKNOWN`. **No numerical avoidability weights are to be invented**, in any form, unless observed evidence later supports them. `HIGH` avoidability does **not** mean 100% saving. The system must permanently distinguish *opportunity identified* from *financial saving that can be safely quantified*.

**What changed and why.** Draft 1 proposed `avoidable premium = Σ (premium × weight per cause)`. That proposal was wrong, and it conflicted with an already-locked rule: **D-014 rule 15 forbids confidence derived from category constants**, and an avoidability weight is precisely a category constant. It manufactured false precision in the shape of a formula — a weight of 0.8 on "wrong lead time" looks rigorous and is invented.

**Consequence — the structural change.** Quantification moves from the **category level** to the **intervention level**. The system cannot say "80% of wrong-lead-time premium is recoverable." It can say "if item X's lead time were corrected from 18 to 32 days, these four identified events would not have triggered, and here is what they cost." A countable counterfactual over specific events replaces a percentage over a total.

**Rejected.** Weighted avoidability. Easier to compute, produces a bigger and more confident-looking number, and would not survive a finance audit.

**Cost.** Fewer quantified opportunities, and quantification requires a stated intervention rather than a classification alone. That is the intended trade.

---

## D-018 — Root cause is captured in the operational workflow

**Status:** `LOCKED` 2026-08-07 · **Area:** mechanism 01, procurement workflow · **Closes:** M-02

**Decision.** Root cause is captured at the moment of the expedite event, not reconstructed later, via structured categories: supplier delay · incorrect lead time · late PO release · unexpected demand · production change · stock policy issue · material master issue · logistics/customs issue · other (requires explanation).

**Why.** Root cause is absent from transactional data. Without capture, the mechanism produces a cost total rather than an actionable opportunity. Structured categories rather than free text keep the burden low and the data analysable. This makes concrete the Core Mission's claim that management is the operating layer of the saving engine.

**Cost.** A change to how procurement works, not only to software. Classification coverage becomes a measured input to confidence (D-014 rule 15).

**Open against this decision.** `Q-01` — *quality rejection* was identified in draft 1 as a distinct cause with its own owner and action, and is not in the locked list. `Limitation` — *production change* is capturable but not analysable in release 1, since production is out of scope (D-007). The limit must be visible in the product.

---

## D-019 — Three-state evidence ladder; no universal minimum event count

**Status:** `LOCKED` 2026-08-07 · **Area:** F9 · **Closes:** M-03 · **Supersedes:** the minimum-event-count proposal in mechanism 01 draft 1 §7

**Decision.** No universal minimum event count. A single event may identify an opportunity but generally may not support a defensible recurring annual saving. Three states are held apart: **OPPORTUNITY DETECTED** → **ANNUALIZATION ELIGIBLE** → **VERIFIED REALIZATION**.

**Reconciles with D-014 rule 11.** Rule 11 sets the *time window* (12 months usable history preferred). D-019 refuses to reduce *sufficiency* to a counted threshold. Complementary, not competing.

**Why.** A counted threshold is another category constant. Evidence sufficiency is assessed per case.

**Scope note.** This ladder is not mechanism-specific. It is a general concept of the saving engine and should govern every mechanism — recorded against `docs/domain/03-saving-opportunity-model.md`.

---

## D-020 — Deduplication happens at the economic-mechanism level

**Status:** `LOCKED` 2026-08-07 · **Area:** F9 · **Closes:** M-04 · **Amends:** D-012

**Decision.** One economic benefit has one financial owner. Deduplication is performed at the **economic-mechanism** level, not merely at transaction level. Genuinely independent effects may both be quantified; where one effect is a component or consequence of another, deduplicate. **The system must be able to explain why an amount belongs to a particular mechanism.**

**What changed and why.** D-012 stated *"deduplication key = (item, PO line, period); any PO line contributes to at most one currency claim."* Too blunt. A single PO line can carry two genuinely independent effects — an air-freight premium (logistics cost, fixed by planning) and a spot-price premium (procurement cost, fixed by sourcing). Suppressing one understates reality and misdirects the fix. **D-012's one-claim-per-line rule is amended accordingly**; its other provisions (range, weakest basis, one-time separated from recurring, realised ratio) stand unchanged.

**New requirement.** Attribution must be **explainable**, not a silent filter.

**Cross-reference added 2026-08-07 by D-029 (not an amendment — D-020's substance is unchanged).** This decision governs **double counting** — attribution of a shared economic benefit. It does **not** cover **contradiction** — opposed interventions on an intersecting subject. Those are separate controls with different tests and different failure modes. See D-029.

**⚠ Terminology conflict raised 2026-08-07, not yet resolved.** This decision's text uses **"PPV"** for the mechanism from which emergency-purchase lines are excluded. Under the preliminary DP-01 decision, "PPV" now unambiguously means **Finance's accounting purchase price variance**, which is not ours under D-008 — so the sentence currently reads as though we exclude lines from Finance's metric. **D-020's wording requires amendment to "Procurement Price Opportunity"** when Part 2.2 is locked. Flagged rather than silently edited, because D-020 is a locked decision.

---

## D-021 — Customs cost is in scope; uncontrollable cost is exposure, not saving

**Status:** `LOCKED` 2026-08-07 · **Area:** saving taxonomy · **Closes:** M-05

**Decision.** Customs demurrage, detention and clearance costs are valid candidates for the taxonomy. Root cause is classified. A financial opportunity is quantified **only where causality and avoidability are sufficiently defensible**. Where they are not, the amount is presented as **`COST / EXPOSURE / RISK`**, never as a saving opportunity. Customs data structure and availability are **not assumed** — marked `REQUIRES_FACTORY_DATA`.

**Why this is a genuine addition.** It gives the product a way to be *useful about money it cannot claim*. "You spent 340,000 EGP on demurrage last year — 60% from port congestion you cannot control, 40% from documentation delays you can" is valuable in both halves, and honest about which is which.

**Binding consequence.** `COST / EXPOSURE / RISK` amounts **never aggregate into Potential Annual Saving** and must be structurally incapable of leaking into it.

**Generalises.** Same posture already taken for stockout risk (`03-saving-opportunity-model.md` §4.9). The pattern is now consistent.

**Open.** `Q-03` — distinct object class, or a status on Saving Opportunity? **Recommend distinct class**, so aggregation cannot reach it.

---

## D-022 — 12-month realization window, with early evidence distinguished

**Status:** `LOCKED` 2026-08-07 · **Area:** F9 · **Closes:** M-06

**Decision.** Default verification window is **12 months**. Useful early evidence is not hidden: **EARLY REALIZATION EVIDENCE** (visible improvement, not yet sufficient for a full annual claim) is distinguished from **STRONG / VERIFIED REALIZATION**. The system must not claim a verified annual saving because cost dropped for a short period. Verification must consider confounders: demand, volume, FX, freight rates, supplier changes, seasonality, production changes, other operational changes.

**Governing principle.** *A reduction in premium is evidence of improvement, not automatically proof of causation.*

**Conflict flagged.** Core Mission §6 locks the lifecycle as `Potential → Approved → In Progress → Realized` (+ `Rejected`, `Expired`). `EARLY REALIZATION EVIDENCE` must **not** silently become a seventh state. `PROPOSED` — model it as an **evidence-strength attribute on `IN_PROGRESS`**, preserving the locked lifecycle. Recorded as `Q-04`, requires confirmation.

---

## D-023 — Carrying-cost rate is finance-owned; no developer defaults

**Status:** `LOCKED` 2026-08-07 · **Area:** F8, F9 · **Closes:** M-07 (policy) · **Sharpens:** N-10

**Decision.** Any carrying-cost rate used in a financial calculation is **finance-owned**. **No hidden developer defaults** — not 15%, not 20%, not 25%, not any value. The authoritative input carries provenance: value · source · owner · effective date · currency/basis · last updated · status. If unavailable, it is **not silently invented**; the dependent output is `INSUFFICIENT_DATA`. Any financial output materially dependent on an assumed rate must **visibly disclose that dependency**.

**Why.** This rate underpins most recurring saving figures. A default buried in code would silently determine the product's headline number, and would be indefensible the first time anyone asked where it came from.

**Status split.** The *policy* is locked. The *value* remains `REQUIRES_FACTORY_DATA` (`F-08`).

**Reinforces.** D-015's nomination of lead-time correction as the first slice — it is the case that may need no carrying-cost input at all.

---

## D-024 — FX normalisation is Tier 1; financial change is decomposed, never assumed

**Status:** `LOCKED` 2026-08-07 · **Area:** F4, F8, all mechanisms · **Closes:** M-08 · **Supersedes:** D-016 (proposal now locked and extended)

**Decision.** FX normalisation is a **Tier-1 requirement** for multi-currency financial comparison. Changes in EGP-denominated cost must not be interpreted as purely operational when FX may explain part of the movement. Conceptually, where data allows:

```
Observed financial change = operational effect + price/rate effect + FX effect + volume/mix effect
```

**The decomposition is never fabricated.** Where it cannot be performed reliably, the conclusion is marked `INSUFFICIENT_DATA` / `ASSUMED` / `LIMITED_CONFIDENCE`.

**Scope is wider than one mechanism.** This governs every financial trend the product shows — price variance, carrying cost, excess-stock value, the headline figure itself.

**Open.** `Q-05` — promote to cross-cutting foundation **F10 — Financial change decomposition** in `01-factory-operating-model.md`? **Recommended.**

**Consequence.** `A-09` (multi-currency) is **escalated to Tier 1**.

**Requires.** Finance to own FX policy, rate source and effective dating (`F-07`).

---

## D-025 — `COST / EXPOSURE / RISK` is a distinct class, not a lifecycle status

**Status:** `LOCKED` 2026-08-07 · **Area:** F9, saving engine structure · **Closes:** `Q-03` · **Reinforces:** D-021, D-012

**Decision.** Opportunity records are one of two **distinct classes**:

```
Opportunity
├── SAVING_OPPORTUNITY
└── COST / EXPOSURE / RISK
```

The North Star financial aggregation may consume **only `SAVING_OPPORTUNITY` records.**

**Why — structural safety, not taxonomy tidiness.** As a status, a record could become a saving through a status change or an aggregation accident: one filter forgotten, one join widened, one `WHERE status IN (…)` extended by someone who did not know the rule. As a distinct class it is **structurally impossible** for exposure to enter Potential Annual Saving. The guarantee lives in the model rather than in every query written afterwards.

This is the same reasoning as D-002: a rule enforced by structure survives, a rule enforced by discipline eventually does not.

**Rejected.** A status on a single Opportunity type. Simpler model, one table, less duplication — and one careless aggregation away from inflating the number the whole product is judged on.

**Cost.** Two classes to model and present, with some shared fields. Reporting that spans both must join deliberately rather than filter casually — which is the intent.

**Binding consequence.** No status transition, migration, reclassification or aggregation path may convert a `COST / EXPOSURE / RISK` record into a `SAVING_OPPORTUNITY`. If a previously undefensible cost later becomes defensibly avoidable, a **new** `SAVING_OPPORTUNITY` is raised with its own evidence — the exposure record is not promoted.

---

## D-026 — Evidence strength is an attribute, never a lifecycle state

**Status:** `LOCKED` 2026-08-07 · **Area:** F9 · **Closes:** `Q-04` · **Amends:** D-022 · **Preserves:** Core Mission §6

**Decision.** The lifecycle stays exactly as Core Mission §6 locks it:

```
POTENTIAL → APPROVED → IN_PROGRESS → REALIZED    (+ REJECTED, EXPIRED)
```

`EARLY_REALIZATION_EVIDENCE` is **not** a lifecycle state. Evidence strength is a **separate attribute** carried alongside the state:

```
Lifecycle:         IN_PROGRESS
Evidence strength: EARLY
```
```
Lifecycle:         IN_PROGRESS
Evidence strength: STRONG
```

`REALIZED` remains the lifecycle state representing **sufficiently verified financial realization** under the existing Core Mission rules.

**Why.** Workflow state and evidence strength are orthogonal concerns that answer different questions — *where is this in the process?* versus *how well do we believe it?* Collapsing them into one enum means every future refinement of either concept multiplies the states of both, and the locked §6 vocabulary erodes by accretion. Keeping them separate also lets evidence strength apply wherever it is meaningful without inventing a parallel state machine.

**Rejected.** A seventh lifecycle state. Fewer concepts on the surface; extends a locked list, conflates two dimensions, and makes the lifecycle unstable over time.

**Cost.** Two fields to reason about instead of one. UI must present them together without implying one is a sub-state of the other.

---

## D-027 — Evidence-based, event-level counterfactual reasoning is a core design principle

**Status:** `LOCKED` 2026-08-07 · **Area:** F9, whole saving engine · **Generalises:** D-017 · **Scope:** every mechanism, present and future

**Decision.** Elevated from a mechanism-01 correction to a **standing design principle of the Saving Intelligence engine**:

> **Prefer evidence-based, event-level counterfactual reasoning over arbitrary category percentages.**

Never:
> ~~"60% of this cost is avoidable."~~

Instead:
> *"These specific events are attributable to this specific root cause, and this intervention would have prevented them under this stated counterfactual."*

Any financial quantification requires, where applicable:

1. **Stated intervention** — specific enough to be tested, not "improve planning"
2. **Testable counterfactual** — assessed event by event against recorded evidence
3. **Reliable incremental-cost inputs** — per D-023, no invented defaults
4. **Appropriate FX normalisation** — per D-024
5. **Sufficient evidence** — per D-019's ladder

**Never manufacture precision from weak evidence.**

**Why it is elevated.** The failure it prevents is not specific to expedite premium. Every category in the taxonomy invites the same shortcut — a plausible percentage applied to a total produces a large, confident, indefensible number faster than any honest method. As a principle it also governs mechanisms not yet designed, so the error cannot re-enter through a category nobody has written yet.

**Cost.** Fewer quantified opportunities, and each requires more evidence. Categories that cannot meet the bar report `OPPORTUNITY DETECTED` with `INSUFFICIENT_DATA` for the figure — which is the honest outcome, not a degraded one.

**Consequence.** `Q-07` becomes mandatory rather than advisory: saving-model categories 4.1–4.7 predate this principle and must each be re-expressed as intervention plus counterfactual before specification.

---

## D-028 — F10 is a Financial Change Decomposition **Capture Contract**, not an engine

**Status:** `LOCKED` 2026-08-07 · **Area:** new cross-cutting foundation · **Closes:** `Q-05` · **Reconciles:** D-024, D-012, D-002 · **Accepted as option A′**

**Decision.** Promote financial change decomposition to a cross-cutting foundation, **F10**, scoped for now to the **capture contract only**.

> **F10 — Financial Change Decomposition Capture Contract**

It is **not** a universal decomposition calculation engine, and must not be called one. It may later evolve into *F10 — Financial Change Decomposition Engine*, but **only after multiple mechanisms validate the abstraction.**

**Why the split.** Capture and computation have opposite risk profiles:

```
CAPTURE      = irreversible
COMPUTATION  = reversible
```

Dimensions not preserved at event time cannot reliably be reconstructed later — a record holding only `freight cost = 45,000 EGP` is permanently undecomposable, whatever algorithm arrives afterwards. Capture must therefore be standardised now. Conversely, fixing a universal algorithm after a single mechanism is premature abstraction, and an abstraction chosen from `N=1` is the kind everything afterwards has to fight.

**Locked now — the capture contract.** Where relevant to a financial event or value, preserve, *as applicable to that event*: original amount · currency · FX rate · FX rate date / effective date · quantity · unit basis · unit of measure · time period / period boundary · source / provenance · reference transaction or event · any other raw dimension required to reconstruct the change.

**The constraint that keeps this honest.** *Do not invent fields the source event does not actually have.* This sits in real tension with "capture everything because it is irreversible," and resolves one way: **preserve what the event genuinely carries; never manufacture placeholders.** A domestic single-currency transaction has no FX dimension, and an empty FX field on it records nothing while implying something.

**Deferred explicitly.** The universal decomposition algorithm · the universal formula · any decomposition UI · mechanism-specific decomposition behaviour beyond what current evidence requires. Recorded as `Q-08`.

**Rejected.** *Full foundation now* — would force an engine designed from one mechanism. *Per-mechanism rules* — divergent capture across mechanisms, requiring a migration touching every cost-bearing record. *Extend F4 instead* — F4 describes what a value **is**; F10 preserves what a value was **made of** so a change between two values can be explained. Perfect provenance on both endpoints still cannot say how much of a change was FX. *Defer entirely* — loses capture irreversibly.

**Cost.** Expands the movement record (F2) and the finance import contract (`N-01`). Adds a Stage 0 obligation to the build plan. Some captured dimensions may prove unnecessary once the engine is designed — an acceptable price for an irreversible risk.

**Consequences.**
- `N-01` (finance integration contract) now must specify that imported cost arrives carrying these dimensions; otherwise figures derived from it cannot be decomposed.
- Build plan gains **U-01b**, and U-07 / U-12 / U-13 / U-14 acquire capture obligations.
- D-024's FX Tier-1 status is unchanged; its decomposition requirement is now split into *captured* and *deferred* halves.

---

## D-024 — amendment note (2026-08-07)

Following D-028, D-024 is read in two parts:

| Part | Status |
|---|---|
| FX normalisation is Tier 1 for multi-currency financial comparison | `LOCKED` — unchanged |
| Raw dimensions preserved to permit later decomposition | `LOCKED` — now the F10 capture contract (D-028) |
| The universal four-way decomposition **calculation** | **`DEFERRED`** — `Q-08`, pending a second mechanism |
| Never fabricate a decomposition where data is unavailable | `LOCKED` — unchanged |

The four-way model (`operational + price/rate + FX + volume/mix`) remains the **target shape**, not an implemented method.

---

## D-012 — amendment note (2026-08-07)

Cross-mechanism aggregation depends on **consistent capture** under F10. Inconsistent capture would reintroduce the basis-laundering D-012 forbids — aggregating figures whose FX and price treatment differ, producing a total that looks precise and is not. F10's capture contract is therefore a precondition of D-012's weakest-basis rule holding across mechanisms, not merely a convenience.


---

## D-029 — Contradiction control is a cross-cutting saving-model rule

**Status:** `LOCKED` 2026-08-07 · **Area:** F9 / saving model · **Closes:** `W-16`, `W-25` · **Cross-references:** D-020 (unchanged)

**Decision.** Universal rule:

> **Every Opportunity must expose an intervention signature sufficient to determine whether it conflicts with another Opportunity.**

Minimum signature: **typed subject · affected dimensions · direction per dimension · effect window.** The originating mechanism populates it.

**Double counting and contradiction are separate controls.** D-020 governs attribution of shared benefit; D-029 governs executability of opposed actions.

**Explicitly not a new F-series foundation.** The distinguishing principle: **F-series foundations govern what must be captured from reality; the saving model governs what may be asserted about it.** Contradiction control imposes no capture obligation on operational events — it is a property of derived findings.

**Why architecture C.** Mechanism-specific control is not merely weaker but **structurally impossible** — a mechanism cannot detect a conflict with another mechanism because it never sees the other side. A wholly universal rule is under-specified, since only the originating mechanism knows what its intervention does to quantity, stock or supplier share; it would have to guess, which is inventing.

**Placement.** Invariant, signature vocabulary, detection test and allowed resolutions → Saving Opportunity Model. Enforcement rule → code standards. Cross-reference → F9 and D-020.

**Cost.** Every Opportunity gains required structure. A mechanism that cannot declare a signature cannot be integrated — which is the enforcement, and it is structural rather than procedural.

---

## D-030 — The mechanism boundary is the counterfactual's effect on quantity

**Status:** `LOCKED` 2026-08-07 · **Area:** saving taxonomy · **Closes:** `DP-09`

**Decision.** Mechanism boundaries are determined by **whether the counterfactual changes the quantity purchased over the relevant defined window** — never by supplier terminology such as "price break".

| Case | Mechanism |
|---|---|
| Same quantity + better defensible price | **Mechanism 02** |
| Changed quantity | Quantity / inventory economics |
| Contract or price condition not applied at unchanged quantity | **Mechanism 02** |
| Quantity-driven price advantage | May **compose** across both, with the two economic effects kept distinguishable |

**Also locked:** **"Boundary determines mechanism; gates determine quantifiability."** The boundary answers *which mechanism*; the evidence and comparability gates answer *whether anything may be quantified*. They compose — the boundary alone never licenses a claim.

**Quantity is interpreted over the relevant defined window**, not a single order. Volume rebates and annual-volume agreements aggregate across a period.

**Why.** Validated against twelve adversarial cases; all twelve classify. Keying on the counterfactual — the object D-027 made central — rather than on a supplier term is what makes it robust.

**Open, deliberately unresolved:** `W-35` (consolidation taxonomy) and `W-36` (commitment risk).
