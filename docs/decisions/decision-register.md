# Decision Register

> Per the Product Bible: *"When a decision affects architecture, record it."*
>
> Every entry records what was decided, why, what was rejected, and what it costs. **No entry is `ACCEPTED` until a human accepts it.** Proposals below are recommendations from planning, not settled facts.

**Status:** `PROPOSED` · `ACCEPTED` · `LOCKED` (settled by the product owner; not revisited without a new decision) · `REJECTED` · `SUPERSEDED`

---

## D-001 — Inventory truth is an append-only movement ledger

**Status:** `LOCKED` 2026-08-08 · **AMENDED 2026-08-08** (Block 1) · **Area:** F2 · **Blocks:** everything in inventory, cost, traceability

**Decision — unchanged, preserved verbatim.** Stock truth is an immutable, double-entry ledger of movements. Balances are derived projections. Corrections are reversing entries, never edits.

**Why.** Traceability, reconciliation, valuation and §38 data trust all become properties of the model rather than features to build. Stock is conserved by construction. Backdated entries — normal in factories — are handled natively.

**Rejected.** A mutable on-hand quantity per item/location. Simpler and faster to build; loses history, cannot explain discrepancies, and makes §38 unachievable.

**Cost.** Balance projections must be maintained or every stock screen scans history. Higher write complexity. More storage.

### Amendment 2026-08-08 — additive only (Block 1, `docs/domain/15-BLOCK1-foundation-governance-closure.md`)

The decision sentence above is **not altered.** Twenty-two adversarial scenarios found no structural failure in the model and three missing operational guarantees. All three are additions.

```
ADD to the bucket list:
    OPENING BALANCE / MIGRATION
    — the counterparty for stock existing at go-live or at data migration.
    Never used for operational events. Segregated from ADJUSTMENT so that
    count-accuracy analytics are not polluted at birth.

ADD to the minimum movement record:
    Source-system natural key   — the identity of the originating record,
                                  used to reject duplicate ingestion
    F10 capture dimensions      — original amount · currency · FX rate ·
                                  rate date · quantity · unit basis · UoM ·
                                  period boundary, AS APPLICABLE to the event
                                  and never invented where absent (D-028)

ADD as a stated capability:
    Point-in-time reconstruction — the balance of any item at any past
    instant is derivable from the ledger. A maintained current balance
    alone does not satisfy this decision.

ADD as a clarification:
    A RETURN is a movement (stock → Supplier), not a reversal. Reversals
    assert that a recorded event was wrong; returns assert that goods
    physically went back. The two must not be conflated.

CROSS-REFERENCE:
    F5 period locking governs where a backdated correction may be posted.
```

**Why each is blocking.** Without an opening-balance counterparty, go-live stock can only enter through `Adjustment`, which poisons the count-accuracy metric this decision names as the trust metric for the whole system. Without a natural key, a re-imported spreadsheet — the single most likely operational event in the first months (`P-03`) — is silently accepted twice, and append-only then guarantees the *preservation* of corruption rather than protection from it. Without the F10 dimensions, this decision would lock a movement record that cannot satisfy D-028, which is already locked above it.

**Point-in-time reconstruction is stated rather than implied** because a maintained-current-balance implementation satisfies the original letter and makes every backtest in the saving engine impossible.

**Deliberately excluded from this amendment**, each opened as its own decision rather than guessed inside this one: in-transit ownership (`Q-10`, needs `F-15`) · source-record drift (`Q-11`, interacts with import architecture) · commercial-document immutability (`Q-09`, required before Mechanism 02 is built).

---

## D-002 — Provenance is a platform primitive, not a UI convention

**Status:** `LOCKED` 2026-08-08 · **AMENDED 2026-08-08** (Block 1) · **Area:** F4 · **Blocks:** analytics, recommendations, AI

**Decision — as originally written, preserved verbatim.** Every derived value carries `{value, unit, basis, as_of, inputs, assumptions, confidence, limitations}`. Basis degrades contagiously — anything computed from a forecast is at best a forecast, and an aggregate carries the *weakest* basis among its components. `INSUFFICIENT_DATA` is a designed state, not an error.

**Amended 2026-08-06** (`docs/01-core-mission.md` §7): basis has **eight** values, adding `STALE_DATA` — `ACTUAL · CALCULATED · FORECAST · ESTIMATED · ASSUMED · USER_DEFINED · INSUFFICIENT_DATA · STALE_DATA`. This matters most under D-008: cost is imported from finance, so when that import ages past its threshold (`N-09`), every financial figure resting on it changes basis, and contagion carries that upward through every aggregate.

**Why.** §38 is otherwise unenforceable. If provenance is a label features remember to attach, some feature eventually won't, and one confident wrong number discredits every honest one beside it.

**Rejected.** Per-feature provenance labelling. Cheaper; fails silently and unevenly.

**Cost.** Touches every calculation and every display component. Must exist from day one — retrofitting means auditing every number in the system.

### Amendment 2026-08-08 — additive only (Block 1)

```
CLARIFY scope:
    Every value the system asserts carries the envelope — not only derived
    values. A raw value carries basis ACTUAL (observed) or USER_DEFINED
    (asserted), so that contagion has a defined floor.

CLARIFY as_of:
    as_of is the EFFECTIVE time of the value, per F5. Recorded time is
    carried separately. Reproducibility depends on this distinction.

STATE the limitation explicitly:
    Provenance establishes WHAT a number is. It does not establish whether
    using that number in a given calculation is APPROPRIATE. A correctly
    labelled value may still be the wrong instrument for a decision.
```

**Why the first two are blocking.** *"Every **derived** value"* left raw values — a PO price, an imported on-hand figure — outside the envelope, so an aggregate mixing raw with derived had no weakest basis to compute; the contagion rule had a hole at its own base, and every mechanism aggregates raw with derived. And F5 establishes **two** timestamps while the envelope carries one `as_of`; reproducibility is the point of provenance, and an ambiguous timestamp defeats it.

**Why the third is stated rather than fixed.** D-002 prevents **mislabelling**, not **misuse.** A correctly-labelled, finance-owned, authoritative rate can still be the wrong instrument — which is exactly the failure DP-15 found and D-023's amendment now governs. Provenance answers *what a number is*, never *whether using it here is appropriate*. Left unstated, D-002 would be trusted to do a job it was never designed for.

**Deliberately excluded, opened as one follow-on decision (`Q-12`, basis semantics):** the `ESTIMATED` / `ASSUMED` boundary · a basis value for imported-unverified and third-party-asserted data · source conflict resolution · `STALE_DATA` scope · whether inputs carry their own `as_of`. Each is a real gap; none blocks the lock, because each concerns *which* value to use rather than *whether the envelope exists*.

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

### Amendment 2026-08-08 — the `Owner` field splits into three (Block 2, closes `DP-14`)

> *Original field, preserved:* `Owner — the person accountable.`

**As amended.** One field held three accountabilities that do not collapse. Replaced by three **factory-facing** fields:

| Field | Accountable for | Test that proves it distinct |
|---|---|---|
| **Finding Owner** | The finding **being addressed** — *"whose problem is this?"* | 4.1: inventory detects the excess |
| **Action Owner** | **Executing** the intervention | 4.1: **purchasing** defers the order |
| **Data Owner** | **Input data quality.** The natural owner of an `EVIDENCE GAP` | An evidence gap's fix belongs to whoever owns the data, not whoever owns the finding |

**Mechanism Owner is not a field on a finding.** Accountability for the *detector's* correctness — its counterfactual logic, refusal conditions and evidence gates — is internal product governance, not factory-facing.

⚠ **The adjudicator (DP-07) is a reviewer, not an owner**, and must not be collapsed into Finding Owner. Approval of a currency claim belongs to an adjudicator independent of the underlying decision; folding that into ownership silently loses the independence requirement.

**Configurable, and one person may hold several.** Distinct *fields* do not require distinct *people* — common in an SME. **No organisational structure is invented by defining a field.** Where no suitable owner exists the finding is **unowned and visibly so**, never hidden: an unowned finding is itself the signal that nobody is accountable for that class of problem.

**Affected.** Saving Opportunity object (`03-saving-opportunity-model.md` §2) · build plan U-17 · code standards · `A-20` — this is the second concrete requirement the saving engine has produced for the permission model. **No calculation changes.**

---

## D-012 — The headline saving figure is a range, deduplicated, split by impact type

**Status:** `PROPOSED` · **Area:** F9 · **Depends on:** D-002, D-011

**Decision.** The Potential Annual Saving figure must: be expressed as a **range**, not a point; carry the **weakest basis** among its inputs; **deduplicate overlapping opportunities** and show the deduction; report **recurring impact only** in the annual figure, with one-time capital release stated separately; and refuse to annualise below a minimum history window (`N-08`). Alongside it the system displays its own **realised-versus-identified ratio**.

**Amended 2026-08-07 by D-020.** The original deduplication rule — *"key = (item, PO line, period); any PO line contributes to at most one currency claim"* — is **withdrawn as too blunt.** Deduplication happens at the **economic-mechanism** level: genuinely independent effects on the same transaction may both be quantified, and attribution must be explainable. All other provisions of D-012 stand unchanged.

**Amended 2026-08-07 by D-021, and again by the D-025 amendment.** **Non-`OPPORTUNITY` findings** — `OBSERVED COST`, `EXPOSURE / RISK`, and `EVIDENCE GAP` (which sits outside the Finding hierarchy entirely) — never enter this aggregate and must be structurally incapable of doing so.

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

### Amendment 2026-08-08 — rule 10 gains `purpose` (Block 2; one amendment with D-023)

> *Rule 10 as locked, preserved:* financial inputs carry **source · owner · effective date · freshness · status.**

**As amended,** the provenance list for a financial rate gains one field:

```
purpose  — what this rate was CONSTRUCTED FOR, stated by whoever owns it.
           STRUCTURED, not free text.

A mechanism declares the purpose it requires.
Mismatch BLOCKS currency quantification and raises an EVIDENCE GAP.
```

**Why it must be structured — a conclusion changed on re-test.** Block 1 recorded that purpose *might* be derivable from D-002's `limitations`. It is not: `limitations` is **free text**, and a mechanism cannot **match** against free text. If the requirement were disclosure only, free text would suffice. But DP-15's obsolescence case demands **blocking** — disclosure does not prevent netting a risk into a saving, which D-031 forbids. Blocking requires a machine-comparable field.

**Nothing is invented.** No universal rate is created and no purpose is inferred; the purpose is **stated by the rate's owner**, and where they have never been asked, that is an `EVIDENCE GAP` (`F-08`), not a default.

**Affected calculations.** Every figure using carrying cost, cost of funds, ordering cost or an FX policy rate.

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

**Decision.** Customs demurrage, detention and clearance costs are valid candidates for the taxonomy. Root cause is classified. A financial opportunity is quantified **only where causality and avoidability are sufficiently defensible**. Where they are not, the amount is presented as **`OBSERVED COST`** (already incurred) or **`EXPOSURE / RISK`** (forward-looking) — never as a saving opportunity. *(Originally worded as a single `COST / EXPOSURE / RISK` destination; split by the D-025 amendment of 2026-08-07.)* Customs data structure and availability are **not assumed** — marked `REQUIRES_FACTORY_DATA`.

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

### Amendment 2026-08-08 — extended from *never invent* to *never misapply* (Block 2)

> *Original scope, preserved:* a rate must never be invented, and must be authoritative and finance-owned.

**As amended,** three genuinely distinct requirements, the third of which was covered nowhere:

| | Requirement | Was it covered? |
|---|---|---|
| 1 | Never invent a rate | Yes — as originally locked |
| 2 | Use an authoritative, owned rate | Implied by 1 |
| 3 | **Use a rate appropriate to the decision** | **No** |

**Two demonstrations that 3 is distinct** — both pass 1 and 2 and produce a wrong answer:

- A finance **valuation** rate is authoritative and **inappropriate for a marginal decision**.
- A carrying rate **containing obsolescence** is authoritative and **contains a risk we are forbidden to net** (D-031).

**Operational test.** A rate carries its `purpose` (D-014 rule 10 as amended). A mechanism declares the purpose it requires. **Mismatch blocks currency quantification and raises an `EVIDENCE GAP`.**

**Rejected.** *Leave fitness to mechanism authors* — this is the failure mode that already occurred twice in the DP-10 … DP-15 audit. *Maintain per-decision rates ourselves* — creates rates we do not own, which is D-023's original prohibition re-entering through the back door.

**Hidden assumption surfaced.** That a rate's purpose is knowable. **It requires asking finance a question they may never have been asked** — recorded as a factory fact under `F-08`, not assumed.

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

## D-025 — Findings are separated by class; only Opportunity is saving-eligible

**Status:** `LOCKED` 2026-08-07 · **AMENDED 2026-08-07** by W-33 / W-46 · **Area:** F9, saving engine structure · **Closes:** `Q-03`, `W-26`, `W-33`, `W-46` · **Reinforces:** D-021, D-012, D-002

### As originally locked — preserved verbatim, not rewritten

> **Decision.** Opportunity records are one of two **distinct classes**:
>
> ```
> Opportunity
> ├── SAVING_OPPORTUNITY
> └── COST / EXPOSURE / RISK
> ```
>
> The North Star financial aggregation may consume **only `SAVING_OPPORTUNITY` records.**

**The original intent is preserved in full:** exposure must be structurally incapable of entering Potential Annual Saving. The amendment **hardens** that guarantee; it does not relax it.

### As amended

```
FINDING
├── OPPORTUNITY          ← the only class eligible to contribute to Potential
│                          Annual Saving. Carries the D-011 lifecycle:
│                          POTENTIAL → APPROVED → IN_PROGRESS → REALIZED
│
├── OBSERVED COST        ← historical ACTUAL financial fact.
│                          No lifecycle. Observation state only.
│                          No mitigation — it already happened.
│
└── EXPOSURE / RISK      ← forward-looking FORECAST / ESTIMATED condition.
                           No lifecycle. May carry mitigation.

EVIDENCE GAP             ← OUTSIDE the Finding hierarchy entirely (W-46).
                           A statement about the quality and completeness of
                           our own data and evidence — not a claim about the
                           factory's money.
```

The North Star financial aggregation may consume **only `OPPORTUNITY` records.**

**Binding principles.**

1. `EXPOSURE / RISK` is **never approved** as an Opportunity.
2. `EXPOSURE / RISK` is **never realized** as an Opportunity.
3. A **mitigation that creates a defensible counterfactual becomes a new Opportunity**. The exposure itself is neither approved nor realized.
4. A direction change **supersedes** the previous exposure. Historical truth is never mutated.
5. When an exposure materialises, the exposure record is **preserved as historical evidence** and a **linked `OBSERVED COST` is created**. The object does not transform.
6. Uncertain `EXPOSURE / RISK` is **never netted** against Potential Annual Saving.
7. `ACTUAL` historical cost and `FORECAST` / `ESTIMATED` exposure are **never mixed in a financial aggregate**.

**`EVIDENCE GAP` (W-46).** Outside the Finding hierarchy, because it is a claim about whether the system has sufficient evidence to make a financial claim — not a claim about money. It must never contribute to Potential Annual Saving, be treated as an Opportunity, enter financial aggregation, inherit Opportunity lifecycle semantics, or carry opportunity value. It **may** carry observed spend exposure strictly as an `ACTUAL` fact where supported — **and that spend is not itself an Evidence Gap value.**

**Why — structural safety, not taxonomy tidiness.** As a status, a record could become a saving through a status change or an aggregation accident: one filter forgotten, one join widened, one `WHERE status IN (…)` extended by someone who did not know the rule. As a distinct class it is **structurally impossible** for exposure to enter Potential Annual Saving. The guarantee lives in the model rather than in every query written afterwards.

This is the same reasoning as D-002: a rule enforced by structure survives, a rule enforced by discipline eventually does not.

**Rejected.** A status on a single Opportunity type. Simpler model, one table, less duplication — and one careless aggregation away from inflating the number the whole product is judged on.

**Cost.** Two classes to model and present, with some shared fields. Reporting that spans both must join deliberately rather than filter casually — which is the intent.

**Amendment rationale (W-33, W-46).** The original decision was correct about aggregation safety and **silent about lifecycle**. Two independent defects surfaced later:

- **Lifecycle inheritance** — placing the class under `Opportunity` made *"realized exposure"* expressible, implying exposure had become a saving.
- **Meaningless aggregation** — one class holding `ACTUAL` past spend and `FORECAST` future risk permits a sum that is meaningless however it is labelled. Avoiding it required a convention, and D-025 exists precisely because a rule enforced by discipline eventually is not.

**Mitigation is the decisive behavioural evidence for the split**: impossible for cost, which already happened, and the entire point of exposure. One class cannot coherently define an attribute impossible for half its members.

**Binding consequence — as amended.** No status transition, migration, reclassification or aggregation path may convert any non-`OPPORTUNITY` finding into an `OPPORTUNITY`. If a previously undefensible cost or exposure later becomes defensibly avoidable, a **new** `OPPORTUNITY` is raised with its own evidence — the original record is **preserved, never promoted**. The same applies to exposure materialisation: a linked `OBSERVED COST` is created; the exposure is not converted.

> *Original binding consequence, preserved:* "No status transition, migration, reclassification or aggregation path may convert a `COST / EXPOSURE / RISK` record into a `SAVING_OPPORTUNITY`. If a previously undefensible cost later becomes defensibly avoidable, a **new** `SAVING_OPPORTUNITY` is raised with its own evidence — the exposure record is not promoted." 

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


---

## D-031 — An Opportunity may create or deepen a linked Exposure / Risk

**Status:** `LOCKED` 2026-08-07 · **AMENDED 2026-08-07** by `W-49` (`DEEPENS`) · **AMENDED 2026-08-08** by Block 2 (`MITIGATES`) · **Area:** saving model · **Closes:** `W-45` · **Clarifies:** D-014 rule 6

> *Status-line correction 2026-08-08.* The W-49 amendment was applied to this decision's body on 2026-08-07 but never recorded on its status line, unlike D-025's. Reported in Block 1, corrected here. **No substance changed by the correction.**

### As originally locked (`CREATES` only) — preserved

> **Decision.** A **saving-model rule establishing a linked-finding relationship**:
>
> ```
> OPPORTUNITY  ──may create 0..n──▶  EXPOSURE / RISK
> EXPOSURE / RISK  ──has 0..1 originating──▶  OPPORTUNITY
> ```

### As amended 2026-08-07 by `W-49` — `DEEPENS` added

**Decision.** Two **distinct** linked-finding relationship types:

```
OPPORTUNITY
    ├── CREATES ──▶  EXPOSURE / RISK    introduces a new exposure that did not
    │                                    previously exist in the relevant context
    └── DEEPENS ──▶  EXPOSURE / RISK    increases or worsens an already-existing
                                         exposure

Cardinality:
    OPPORTUNITY      ──creates 0..n──▶  EXPOSURE / RISK
    OPPORTUNITY      ──deepens 0..n──▶  EXPOSURE / RISK
    EXPOSURE / RISK  ──has 0..1 creating Opportunity
    EXPOSURE / RISK  ──has 0..n deepening Opportunities
```

**Binding rules.**

1. `CREATES` and `DEEPENS` **remain distinct relationship types**.
2. **`DEEPENS` is never treated as `CREATES`** for aggregation or counting purposes.
3. `EXPOSURE / RISK` carries **no intervention signature** (D-029).
4. `DEEPENS` is a **relationship and factual finding, not a financial valuation**.
5. **No probability, percentage, threshold or monetary value is assigned to `DEEPENS`** unless a future mechanism establishes a defensible basis under the existing locked rules.
6. `DEEPENS` is **never silently netted** against Potential Annual Saving.
7. An Opportunity that deepens an Exposure **must disclose that relationship to the reviewer**.

**Worked example — note what is deliberately absent.**

```
Opportunity              "Move purchasing to lower-price supplier B"
Potential Annual Saving  +1,200,000 EGP
Existing Exposure        "Foreign-currency purchasing exposure"
Relationship             DEEPENS
```

**No monetary value is invented for the FX exposure merely because the Opportunity deepens it.** The saving stands at its evidenced figure; the deepening is disclosed as a fact, unvalued.

**Why the distinction is load-bearing.** `CREATES` brings a risk into existence; `DEEPENS` adds to one that already exists. Different remediation, different ownership — and conflating them would corrupt aggregation, since a deepening link counted as a creation would appear as a new exposure that does not exist.

**Disclosure, never netting.** D-014 rule 6 nets **certain incremental costs**. An uncertain future obligation is **disclosed alongside the Opportunity, never subtracted from it** — netting a probability against a certainty would require inventing a probability, which D-017 and D-023 forbid.

**No probability scores, thresholds, or risk-value calculations.**

**Validated across five instances:** supplier concentration · commitment risk · logistics disruption · inventory risk · FX exposure.

Two results shaped the rule:

- **Inventory risk shows netting and disclosure coexist.** A price-break intervention produces both a *certain* carrying cost (netted under rule 6) and an *uncertain* obsolescence risk (disclosed). Not alternatives — one intervention, two rules side by side.
- **FX shows the link is optional on the exposure side.** FX exposure exists whether or not any Opportunity created it.

**`EXPOSURE / RISK` carries no intervention signature.** This follows from D-025's amended principle 3: a mitigation with a defensible counterfactual **becomes an Opportunity**, and that Opportunity carries the signature. Two confirming cases — two Exposures cannot contradict, being observations rather than recommendations; and an Opportunity that *worsens* an existing Exposure is a **disclosure relationship, not a contradiction**.

> **D-029 governs opposed actions. D-031 governs an action that creates or deepens a risk.** Distinct and complementary.

**When the link comes into being (`W-47`).** The Exposure record is **not created until the intervention is actioned**. Before that, the prospective consequence is an **attribute of the Opportunity's disclosure** — visible to the reviewer, but not yet a standalone record. A rejected Opportunity therefore leaves no orphan exposure, and nothing is deleted.

**Multiple Opportunities on one exposure (`W-48`).** Each creates its **own record**; *current exposure on a subject* is a **derived view**, exactly as balances are projections of the ledger (D-001). Merging into one mutable record would destroy which action caused what. This **confirms** the 0..1 creating cardinality rather than changing it.

### As amended 2026-08-08 by Block 2 — `MITIGATES` added

**Decision.** A **third** linked-finding relationship type, **disclosure-only**:

```
OPPORTUNITY
    ├── CREATES   ──▶  EXPOSURE / RISK   introduces a new exposure
    ├── DEEPENS   ──▶  EXPOSURE / RISK   worsens an existing exposure
    └── MITIGATES ──▶  EXPOSURE / RISK   reduces an existing exposure

Cardinality:  OPPORTUNITY ──mitigates 0..n──▶ EXPOSURE / RISK
              EXPOSURE / RISK ──has 0..n mitigating Opportunities
```

**Binding rules.**

1. The exposure **must already exist** — that is precisely what separates `MITIGATES` from `CREATES`.
2. **Never netted into Potential Annual Saving.** Mitigating an unvaluable exposure yields an unvaluable benefit; netting it would require valuing the exposure, which this decision forbids.
3. **No probability, percentage, severity score or monetary value.** Partial mitigation is stated **qualitatively only** — quantifying "partial" requires a severity measure that D-017 and D-023 forbid.
4. The relationship carries **no intervention signature**; the Opportunity carries one (D-029).
5. Verification is by **supersession** — a later exposure observation at a lower level, per D-025 principle 4. Nothing is mutated.
6. If the exposure later becomes valuable, the mitigation acquires a defensible counterfactual and **becomes an Opportunity in its own right** (D-025 principle 3) — never a netted benefit on the mitigating Opportunity.

**The case that requires it.** Mechanism 01's reorder-point fix carries an incremental carrying cost, a quantified expedite reduction — and a **reduction in stockout exposure that is otherwise invisible.** Without `MITIGATES`, an Opportunity whose main justification is risk reduction **shows only its cost and looks purely bad.** Symmetry independently supports it: if disclosing a risk *increase* is mandatory, disclosing a risk *reduction* is equally informative.

**Re-tested against a cheaper alternative, and it survives.** Could supersession alone express this — a new observation at a lower level, with the chain showing the reduction? **That works retrospectively and fails prospectively.** The problem is at *decision time*, before the action is taken and before any new observation exists. **Supersession handles verification; it does not handle disclosure.**

**Rejected.** *Omit it* — leaves risk-reducing Opportunities looking unjustified, biasing the factory against correct actions. *Model it as a negative `DEEPENS`* — a signed relationship invites arithmetic on something deliberately unvalued.

**Affects no calculation.** It is disclosure, not arithmetic.

**Placement.** Saving Opportunity Model, per D-029's principle — *F-series foundations govern what must be captured from reality; the saving model governs what may be asserted about it.*

---

## D-032 — Taxonomy §4.5 "consolidation" is retired and redistributed

**Status:** `LOCKED` 2026-08-07 · **Area:** saving taxonomy · **Closes:** `W-35` · **Applies:** D-030

**Decision.** §4.5 held three distinct economic mechanisms under one name. It is **retired and redistributed** — **no new mechanism is created.**

| Case | Destination |
|---|---|
| **Supplier consolidation** — same total quantity over the relevant window, volume concentrated among fewer suppliers | **Mechanism 02.** A counterfactual shape, **not** a new mechanism. **Landed-cost comparability required.** May create a supplier-concentration `EXPOSURE / RISK` (D-031) |
| **Temporal / order consolidation** — order quantity and frequency change | **Future quantity / inventory mechanism** |
| **Shipment consolidation** — same purchase quantity, shipments combined to reduce freight | **Real economic effect, acknowledged. Currently unowned. NOT a mechanism in current scope.** Retained as a **future-domain gap**, not deleted. Not built, not quantified |

**Why no shipment mechanism now.** The effect is genuinely unowned — mechanism 01 measures the *premium paid to compress time*, this measures *fixed-cost amortisation*. But it is **gated by `F-01`** (the same separable-freight question), and its materiality is unmeasured. Creating a mechanism for an effect of unknown size is the breadth risk of challenge D1.

**Note on D-030.** This case revealed that D-030's boundary does not classify **logistics cost**. That is **not a defect** — D-030 was locked to separate price from quantity and does so correctly. Shipment consolidation sits in a third economic domain the boundary was never written to address.

**Also recorded:** *ordering cost* (`F-31`) is an unknown of the same class as the carrying-cost rate — **finance-owned, no invented default**, by analogy with D-023.

---

# Block 1 / Block 2 closure and Part 2.3 lock — 2026-08-08

Decisions D-033 … D-041 were locked following the Block 1 and Block 2 closures and the Part 2.3
workshop. Full analysis: `docs/domain/15-BLOCK1-foundation-governance-closure.md`,
`docs/domain/16-BLOCK2-monetary-boundaries.md`, `docs/domain/17-part-2.3-LOCK.md`.

---

## D-033 — Inventory position correction: six interventions, and what each may claim

**Status:** `LOCKED` 2026-08-08 · **Area:** saving taxonomy, F9 · **Closes:** `DP-10` · **Sharpens:** D-012

**Decision.** "Excess stock" is not one opportunity. It is **six interventions with different counterfactuals, different offsets and different one-time/recurring profiles.**

| Intervention | Changes | One-time | Recurring | May enter Potential Annual Saving |
|---|---|:--:|:--:|---|
| (a) Cancel a future purchase | An order is never placed | ● | | **Nothing recurring.** Collapses into (b) unless the quantity will *never* be consumed — in which case the existing stock is **dead, not excess** |
| (b) Delay a future purchase | Timing only | ● | | **Nothing.** Financing value of the timing only, and it **may be negative** |
| (c) Reduce future order quantity | Average stock falls; order count rises | | ● | Carrying reduction **net of** the ordering-cost increase |
| (d) Reduce reorder point | Average stock falls permanently | ● | ● | **Recurring carrying only.** The one-time step-down is a **position change, not a saving** |
| (e) Reduce safety stock | As (d), harder counterfactual | ● | ● | Recurring carrying only, and only after D-037's evidence bar |
| (f) Dispose of stock never to be consumed | Stock leaves; recovery and disposal cost | ● | ● | **Carrying avoided only. Never the stock value** |

**The unifying rule.**

> **One-time benefits come from changing a stock *level*. Recurring benefits come from changing a *policy*.**

**Binding consequences.**

1. **The principal is never a saving and is never called a "release."** You cannot un-buy stock. For excess, the outflow is **delayed, never avoided.**
2. ⚠ **Excess stock with no pending order produces no Opportunity at all.** The deferral counterfactual requires *something to defer*. Stock that will be consumed over a horizon so long that no order exists to move is a **position, not a finding** — reported as such (`B2-04`), never as an Opportunity.
3. **Deferral benefit is `INSUFFICIENT_DATA` without an expected-price-movement input (`F-39`).** Assuming zero movement is itself an invented assumption, and in a high-inflation, devaluing-currency economy it is *known* to be wrong in a predictable direction. A deferral opportunity that ignores expected price movement is not conservative — it is wrong.
4. Counting both a cancellation and the policy error that caused it **double counts** (D-020).

**Rejected.** Treating all six as one "excess stock" mechanism — different counterfactuals, different offsets, different recurrence. Collapsing them is what produced the original invalid formula in §4.1.

**Hidden assumption surfaced.** *That reducing stock is always beneficial.* In a devaluing currency it may not be.

**Open.** `B2-03` — whether a disposal **tax effect** belongs entirely to finance (D-008) or is disclosable here. Not claimed either way.

---

## D-034 — Taxonomy closure: §4.2 retired, §4.9 reclassified

**Status:** `LOCKED` 2026-08-08 · **Area:** saving taxonomy · **Closes:** `DP-11`, `DP-12`

### §4.2 slow-moving stock — **retired as a saving category**

Four attempts to find an independent intervention; all four fail.

| Attempt | Result |
|---|---|
| Slow but appropriately stocked | No intervention. Coverage is right; the item will be used |
| Slow as a sourcing signal | That is temporal consolidation, not a category of its own |
| Slow as an inventory-turns KPI | Analytics, not a mechanism |
| **Slow relative to shelf life** | ⚠ **A genuine counterfactual** — *"sold or returned today, recovery is X; held to expiry, zero"* — but it is **§4.3's disposal decision triggered earlier**, not an independent mechanism |

**Preserved, not deleted.** §4.2 survives as (i) a **detection signal** feeding §4.1 and §4.3, (ii) a **trigger** that advances §4.3's disposal decision for shelf-life items (`F-34`), and (iii) an **`EXPOSURE / RISK`** where no action is available.

**Why retiring it matters structurally.** Its entire risk profile was borrowed from §4.1 and §4.3 — it would have claimed their money under a third name. Retirement removes a structural double count. And its turnover cut-off is a threshold (`A-18`): tolerable for a *detection signal*, **not** tolerable for anything producing currency — a further argument for retirement rather than repair.

### §4.9 stockout — **reclassified as `EXPOSURE / RISK`. No new class.**

Every existing class was tested before creating anything:

| Class | Fits? |
|---|---|
| `OPPORTUNITY` | **No** — no counterfactual. *"You are at risk"* is a projection, not a foregone alternative |
| `OBSERVED COST` | **No** — a past stockout has no attributable cost in Release 1 (D-007 removes production impact; there is no sales module) |
| `EVIDENCE GAP` | **No** — it is a claim about the factory, not about our data |
| **`EXPOSURE / RISK`** | **Yes** — forward-looking, `FORECAST`-derived, may carry mitigation |

⚠ **Recorded consequence — exposure counts and expedite counts are not additive.** Mechanism 01 measures the premium paid **to avoid** a stockout; §4.9 measures the **risk of** one. Where an expedite occurred the stockout did not happen: the exposure was mitigated before it was ever recorded and **leaves no trace**. Not a defect, but anyone reading the two figures together must be told they do not sum.

**Even a mitigation cannot be valued.** Expediting has a knowable cost and an unvaluable benefit. That asymmetry is a human decision, not a system quantification (D-041).

---

## D-035 — Carrying cost is component-wise; a whole rate is invalid for a marginal decision

**Status:** `LOCKED` 2026-08-08 · **Area:** F8, F9 · **Closes:** `DP-15` · **Sharpens:** D-023

**Decision.** No carrying-cost figure is ever produced from a single supplied rate. Each component is classified independently, and only components that are `ACTUAL` or defensibly `CALCULATED` **and generate incremental cash flow** may enter a currency claim.

| Component | Classification | Reasoning |
|---|---|---|
| **Capital** | **`CALCULATED`** — never `ACTUAL` | An opportunity cost, not an invoice. Governed by D-036's single-channel rule |
| **Space** | `ACTUAL` if external storage is rented · **NOT VALID** for an owned, unconstrained warehouse (`F-33`) | No incremental cash flow when the building is paid for and half empty |
| **Handling** | `ACTUAL` if overtime or per-move contracted · **NOT VALID** if salaried staff below capacity | Marginal labour cost may genuinely be zero |
| **Insurance** | `ACTUAL` if value-based and adjusting · **NOT VALID** if a fixed annual declared value | A fixed premium does not move with stock |
| **Obsolescence** | **`EXPOSURE / RISK`** | Not a cost at all. Inside a rate it would be **netted — which D-031 forbids** |
| **Shrinkage / damage** | **Splits** — past shrinkage is `ACTUAL` (a ledger adjustment); future shrinkage is **`EXPOSURE`** | A rate conflates the two |
| **Disposal** | `ACTUAL` when incurred — **and it is a cost of the intervention, not a carrying cost** (`F-38`) | Misclassified if placed inside a carrying rate |
| **Inventory taxes / duties** | Jurisdiction-dependent (`F-40`) | Factory fact required |

**The conclusion this forces.**

> **A typical finance carrying-cost rate contains at least two `EXPOSURE` components (obsolescence, future shrinkage) and frequently two that are NOT VALID for a marginal decision (own-warehouse space, salaried handling). Used whole, it is almost certainly invalid for these mechanisms** — it would net a risk into a saving and claim costs that generate no incremental cash flow.

This is a harder line than "possibly unfit," and it is better supported: the failure is structural, not a matter of precision.

**Excess is not dead.** For **excess** stock, capital is **tied**. For **dead** stock, capital is **lost, not tied** — only recovery value remains at stake. ⚠ **Disposal does not release capital.** Scrapping converts a book asset into a book loss: an accounting event, not a cash event. §4.3 may therefore be far smaller than it appears.

**Requires.** `F-08` must return **components and their construction purpose**, not a single number. Without it, the dependent output is `INSUFFICIENT_DATA` (D-023).

**Rejected.** A single average rate — rejected. A single *marginal* rate — **also rejected**: not observable, and the question was never *which rate* but *which components apply.*

---

## D-036 — The financing effect has exactly one channel

**Status:** `LOCKED` 2026-08-08 · **Area:** F9, all quantity mechanisms · **Closes:** `B2-01` · **Depends on:** D-020, D-033, D-035

**The contradiction this resolves.** The financing value of a deferred outlay (D-033 (b)) and the capital component of carrying cost (D-035) are **the same economic quantity.** Cost of capital *is* the financing cost of tied-up money. Prior analysis treated them as independent; claiming both counts the financing twice.

**The identity is exact, not approximate.** Deferring an outlay of value `V` by `D` days has financing value `V × r × D/365`. Over any window `W ⊇ D`, that same deferral lowers average inventory value by `V × D/W`, whose capital cost over `W` is `(V × D/W) × r × W/365` — **the same product.** Two framings of one quantity.

**Decision.**

> **The financing effect is claimed exactly once, through the channel determined by the intervention's own recurrence — never both, and never summed.**

```
LEVEL-CHANGE intervention (defer, cancel)
    → ONE-TIME financing value over the deferral window
    → no recurring carrying claim, because no policy changed

POLICY-CHANGE intervention (order quantity, reorder point, safety stock)
    → RECURRING capital component of carrying cost over the annualisation window
    → the one-time step-down is a POSITION CHANGE, NOT A SAVING (D-033)
```

⚠ **This corrects Block 2's own characterisation.** Block 2 recorded `B2-01` as *"a genuine choice between two valid channels."* On derivation it is **not a choice** — it is determined by the intervention type, and the two framings converge on the same number. The rule is therefore a derivation from locked material rather than a preference, which is a stronger result and a narrower one.

**What makes it structurally safe.** The one-time step-down of a policy change is already excluded by D-033, so a policy change **cannot** also claim a deferral value for the transition. And a pure deferral changes no policy, so it **cannot** claim a recurring carrying reduction. The two channels are mutually exclusive **by construction**, not by discipline — the same reasoning as D-025.

**Requires.** `F-22` — an **effective-dated** cost-of-funds rate. A single scalar across a volatile twelve months is itself false precision. Absent it, the financing component is `INSUFFICIENT_DATA` in **both** channels.

---

## D-037 — Safety stock: prospective indication, retrospective realization

**Status:** `LOCKED` 2026-08-08 · **Area:** saving taxonomy, F9 · **Closes:** `DP-13` · **Uses:** D-019, D-011 unchanged

**Decision.** A backtest of the observed inventory floor supports a **prospective indication** and **never a prospective currency claim.** The saving becomes measurable only **retrospectively**, after the reduction is made and observed.

**The three claims, precisely separated.**

```
CAN CLAIM     "On-hand for item X never fell below L in the observed window."
              ACTUAL. Available from the ledger. No claim about sufficiency.

CAN CLAIM     "...and no recorded intervention explains that floor."
              Stronger. Still absence of evidence of insufficiency.

CANNOT CLAIM  "L would have been sufficient."
              Requires ruling out interferences that are structurally
              unobservable in Release 1.
```

**The full interference set, and its observability.**

| Interference | Observable in Release 1? |
|---|---|
| Expedites / emergency purchases | **Only via Mechanism 01's capture** (`F-01`, `F-06`) — so `F-01` gates this decision too |
| Manual order overrides | Only with override history (`F-36`) |
| Supplier escalation | **Usually unrecorded** (`F-35`) |
| Substitution | Needs `F-27` — likely unavailable |
| Production rescheduling | **No — out of scope (D-007)** |
| **Demand suppression** | **Structurally unrecordable.** No record exists of an order never placed |
| **Missing orders** | Detectable only if planned-vs-actual ordering is reconstructable |
| Managed demand | Invisible — a good planner's success erases the evidence of how close it came |

⚠ **The floor is not neutral in either direction.** Prior analysis listed only interferences that propped the floor **up**. The opposite case exists: a planner **misses a reorder**, stock runs unusually low, demand happens to be quiet, no stockout occurs. **Backtesting to that floor sets the target at a level reached by mistake and validated by luck.**

**The resolution, and why it is a good one.** If safety stock is reduced and twelve months later there are no stockouts and no recorded interventions, that is **observed evidence, not a model.** The claim that cannot be made prospectively can be **verified retrospectively.** This maps exactly onto structures already locked — D-019's ladder (`OPPORTUNITY DETECTED` without currency) and D-011's realization discipline (baseline captured at `APPROVED`, measured afterwards). **No new machinery.**

**When evidence is insufficient**, the system states the level reached and **names what could not be ruled out** — a specific list, never a hedge.

**Rejected.** Statistical service-level modelling — unfalsifiable, and it requires exactly the assumed probabilities D-017 and D-023 forbid. Naive backtesting — already rejected.

**Open, not assumed.** `B2-02` — for items whose demand is **failure-driven or externally fixed**, production cannot be resequenced around them and demand cannot be quietly suppressed, so the two fatal blind spots shrink materially. Whether such a class exists in this factory is an `EVIDENCE GAP`. The carve-out is recorded as a **question**, not applied as an assumption.

---

## D-038 — Mechanism 03: Quantity & Inventory Economics, and its four subtypes

**Status:** `LOCKED` 2026-08-08 · **Area:** saving taxonomy · **Applies:** D-030 · **Closes:** the "future quantity / inventory mechanism" referenced by D-032

**Decision.** Part 2.3's mechanism is:

> **Mechanism 03 — Quantity & Inventory Economics** identifies a defensible opportunity where a **change to the quantity, timing or frequency of purchase, or to the inventory level held**, produces a defensible economic consequence at unchanged material requirement.

**It is one mechanism with four subtypes, not four mechanisms.** The reason is structural, not aesthetic: **D-020 deduplicates at the economic-mechanism level.** Subtypes A, B and C all lower average inventory and would all claim the capital component; as separate mechanisms, the same money could be claimed twice with nothing structurally preventing it. As subtypes of one mechanism sharing **one quantification base**, the double count is impossible by construction.

| | Subtype | Intervention | Position effect | Recurrence |
|---|---|---|---|---|
| **A** | **Order policy** | Change order quantity / frequency | **Lowers the peak. Trough unchanged** | Recurring |
| **B** | **Buffer policy** | Change reorder point / safety stock | **Lowers the trough** | Recurring |
| **C** | **Position correction** | Defer · cancel · dispose | One-off level change | One-time |
| **D** | **Quantity–price coupling** | MOQ · price breaks · volume commitments | Either | **Composes with Mechanism 02** |

**The peak/trough separation is the load-bearing result** and is locked as D-039.

**Boundary — what is *in*.** Order quantity · order frequency · lot and batch sizing · temporal consolidation (D-032's redistribution lands here) · reorder point · safety stock · excess-stock position correction · dead-stock disposal · MOQ · price breaks and volume commitments *(quantity side only)*.

**Boundary — what is *not* a mechanism and must never become a category.**

| | Why not |
|---|---|
| **Lead time · lead-time variability · demand variability · annual volume · unit cost** | **Inputs**, not opportunities. Never a finding of their own |
| **Ordering cost · carrying cost** | **Cost components** (`F-31`, `F-08`), consumed by the calculation. Not findings |
| **Service level** | A **policy parameter** the factory sets (`N-11`, `P-06`). We never invent one, and we never derive a saving from one |
| **Stockout risk** | **`EXPOSURE / RISK`** (D-034). Never an Opportunity, never valued |
| **Slow-moving stock** | **Retired** (D-034). A detection signal only |
| **Supplier minimums** | A **constraint** on the counterfactual, not an opportunity. Becomes one only when an alternative is evidenced |
| **Supplier consolidation** | **Mechanism 02** (D-032). Same quantity, fewer suppliers |
| **Shipment consolidation** | **Unowned future-domain gap** (D-032). Logistics cost, not quantity economics |
| **Dead stock** | A **state**, not an intervention. The intervention is disposal — subtype C(f) |

**Rejected.** *One flat "inventory optimisation" mechanism* — the four subtypes have different evidence bars, and merging them would let subtype A's defensible claims inherit subtype B's unreachable ones. *Four separate mechanisms* — breaks D-020's structural dedup, as above.

### ⚠ Two findings that shape the mechanism

**1. Mechanism 03 has two products, not one.** It produces Opportunities **and** an **inventory cost model** consumed by other mechanisms. Mechanism 01's reorder-point fix and Mechanism 02's price-break case both need an incremental carrying cost to net under D-014 rule 6, and that number comes from here. **Mechanism 03 is therefore load-bearing for M01 and M02 even where it produces no Opportunity of its own** — and the reverse also holds: an intervention that *raises* safety stock to avoid expedites is a **Mechanism 01 Opportunity consuming Mechanism 03's cost model**, not a Mechanism 03 finding.

**2. It is the first mechanism whose subtypes can contradict each other.** Temporal consolidation (fewer, larger orders) and order-quantity reduction (smaller, more frequent) oppose on the same dimension for the same subject. M01 and M02 had no such property. **D-029 handles it unchanged**, but the mechanism must run contradiction detection **over its own outputs** before presenting them — a requirement no previous mechanism had.

---

## D-039 — Quantification is a counterfactual replay; peak and trough are separate claims

**Status:** `LOCKED` 2026-08-08 · **Area:** F9, Mechanism 03 · **Applies:** D-027, D-037 · **Depends on:** D-001 point-in-time reconstruction

**Decision — one method for all subtypes.**

> **The inventory position path under the counterfactual is obtained by replaying the recorded issue events against the counterfactual ordering policy. It is never obtained from a formula.**

`Q/2`, average-inventory approximations and service-level models are **forbidden**: each assumes smooth depletion and instantaneous replenishment, which is exactly the invented-constant failure D-017 and D-027 exist to prevent. The replay is a **backtest over recorded events**, which is what D-027 requires.

**This is why D-001's point-in-time reconstruction had to be locked.** Without it there is no observed position path to replay against.

### The separation that makes subtype A defensible

Under a reorder-point policy, the two parameters act on **different parts of the position path**:

```
trough  =  reorder point  −  demand during lead time      ← set by the BUFFER
peak    =  trough  +  order quantity                       ← set by ORDER QUANTITY
```

> **Order quantity moves the peak. The reorder point moves the trough.**

**Binding consequence.**

| | Claim | Evidence bar |
|---|---|---|
| **A counterfactual path that never falls below the observed floor** | Makes **no claim about stockout sufficiency** | Quantifiable — D-037's bar does not apply |
| **A counterfactual path that lowers the floor** | Claims the lower level would have sufficed | **Inherits D-037 in full. Prospective indication only** |

**This gives Mechanism 03 a defensible first slice for the same reason D-015 gave Mechanism 01 one:** subtype A's counterfactual is testable entirely inside recorded data.

**Required gate.** The counterfactual order quantity must be **at least the maximum observed lead-time demand over the window**. Below that the item would reorder again before the first order arrives, the trough falls, and D-037 applies after all. Not a threshold we invent — it is read from recorded lead times and issues.

### ⚠ The offset a naive model hides

Reducing order quantity **increases the number of replenishment cycles**, and therefore the number of occasions on which the item is exposed to lead-time variability — **even at an unchanged reorder point.** The trough is unchanged; the frequency of approaching it is not.

**This is disclosed as `DEEPENS` on the stockout exposure (D-031), qualitatively.** No probability, no expected-stockout count, no severity score — those would require exactly the invented probability D-017 forbids. **Direction is stated; magnitude is not.**

---

## D-040 — EOQ may generate a hypothesis; it may never generate a number

**Status:** `LOCKED` 2026-08-08 · **Area:** C6, Mechanism 03 · **Closes:** `P-08` · **Confirms:** build plan U-16

**Decision.** Classical EOQ is **not a saving method in this product**, in any release. It may at most **propose a candidate order quantity** for evaluation by D-039's replay. **The saving figure always comes from the replay, never from the formula.**

**Assumption-by-assumption test.**

| EOQ assumption | Observable? | Verdict |
|---|---|---|
| Stable, known, continuous demand | Consumption is observed (D-010); **stability is falsifiable from history, never confirmable** | Testable, usually violated |
| **Known ordering cost `S`** | `F-31` — unknown; **no invented default** (D-032, by analogy with D-023) | **BLOCKS** |
| **Known holding cost `H`** | `F-08` — and D-035 proves a *whole* rate is invalid, so `H` must be built component-wise | **BLOCKS** |
| Constant lead time | Measurable order-date → receipt-date | Falsifiable, usually violated |
| **No shortages permitted** | — | ⚠ **Structurally inconsistent with safety stock existing at all.** EOQ and safety stock are two models bolted together, not one theory |
| No quantity discounts | `F-26` price breaks | Violated wherever breaks exist — the EOQ answer is then simply wrong |
| Instantaneous replenishment | Violated for every import | Affects the position path directly |
| Fixed unit cost | Violated — EGP depreciation and supplier increases (`F-39`) | Violated |
| No capacity constraint | `F-33` | Unknown |

**Two independent grounds for refusal.** Its two required inputs are precisely the two the project has already forbidden inventing. And it is a **prescriptive optimiser** where D-027 requires an **event-level counterfactual**: *"the optimum is 437 units"* is a model output, not evidence about what happened.

### ⚠ EOQ's own mathematics argues against small quantity claims

The total-cost curve is **flat near the optimum** — a substantial deviation from `Q*` changes total relevant cost only slightly. That is a property of the formula, not a factory fact, and it cuts one way:

> **Small quantity changes produce savings inside the noise of the inputs.** A materiality gate is therefore required before any subtype A claim is presented.

**The gate's threshold is not invented here.** It is a finance-owned materiality question, recorded as `B3-03`. Stating the property is not the same as choosing a number.

**Rejected.** *EOQ with assumed `S` and `H`* — produces a large, confident, indefensible number faster than any honest method, which is exactly the failure D-027 was elevated to prevent. *EOQ as a "direction indicator" only* — still needs both blocked inputs to point anywhere.

---

## D-041 — The net figure declares its own incompleteness

**Status:** `LOCKED` 2026-08-08 · **Area:** F9, all mechanisms · **Extends:** D-002, D-012, D-031

**Decision.** Every Opportunity presents three **separately-typed** components:

```
BENEFIT                measurable, evidenced
CERTAIN COST / OFFSET  netted (D-014 rule 6)
EXPOSURE / RISK        disclosed, never netted (D-031)
```

> **Where an exposure exists and cannot be valued, the net figure must itself declare that it excludes an unvalued risk — and that the exclusion is always in the optimistic direction.**

**Why the last clause is the whole rule.** Linking the exposure is not sufficient. A reader can see `benefit − cost = net` and take the net at face value while the linked risk sits elsewhere on the page. **The number itself must carry its own incompleteness**, and its **direction**: what is excluded is always a cost or a risk, so the net is optimistic, never pessimistic.

**Why it matters most here.** Every subtype A and B claim is a quantified benefit standing beside an **unvaluable** stockout exposure (D-034). Without this rule the presentation is **structurally biased toward cutting inventory** — the single most dangerous failure mode available to a mechanism of this kind.

**No new machinery.** It is the same discipline as D-002's basis: **a number that carries what is wrong with it.**

**Rejected.** *Present the risk beside the number* — proximity is not a property of the number. *Suppress the number where risk is unvalued* — discards defensible benefit.

**Hidden assumption surfaced.** That readers integrate adjacent information. **They read the number.**
