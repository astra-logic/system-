# Decision Register

> Per the Product Bible: *"When a decision affects architecture, record it."*
>
> Every entry records what was decided, why, what was rejected, and what it costs. **No entry is `ACCEPTED` until a human accepts it.** Proposals below are recommendations from planning, not settled facts.

**Status:** `PROPOSED` · `ACCEPTED` · `REJECTED` · `SUPERSEDED`

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

**Decision.** Every derived value carries `{value, unit, basis, as_of, inputs, assumptions, confidence, limitations}`. Basis degrades contagiously — anything computed from a forecast is at best a forecast. `INSUFFICIENT_DATA` is a designed state, not an error.

**Why.** §38 is otherwise unenforceable. If provenance is a label features remember to attach, some feature eventually won't, and one confident wrong number discredits every honest one beside it.

**Rejected.** Per-feature provenance labelling. Cheaper; fails silently and unevenly.

**Cost.** Touches every calculation and every display component. Must exist from day one — retrofitting means auditing every number in the system.

---

## D-003 — Recommendations have a lifecycle and impact claims have states

**Status:** `PROPOSED` · **Area:** F9 · **Blocks:** §36, §37

**Decision.** Recommendations are stored objects moving `PROPOSED → ACCEPTED → ACTIONED → MEASURED → REALISED / NOT_REALISED`. Impact claims are typed `potential | forecast | avoided | realised`, and only realised claims may be reported as savings. Baselines are captured before action.

**Why.** This is the guard against the fake savings §47 explicitly forbids. It also makes the system self-auditing: a recommendation type dismissed 90% of the time is visibly broken.

**Rejected.** Stateless recommendations computed on demand. Simpler; unfalsifiable and unaccountable.

**Cost.** Storage and lifecycle management for something that could be a calculation. Slower to show impressive numbers — which is the point.

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
