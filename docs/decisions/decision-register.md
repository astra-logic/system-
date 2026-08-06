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

**Status:** `PROPOSED` · **Area:** F1

**Decision.** All operational records carry a site dimension, even in a single-site deployment. Products and suppliers are global; stock, cost and commercial terms are site-scoped.

**Why.** Retrofitting a site dimension onto stock, cost and documents is among the most expensive migrations in this class of system, and it corrupts historical reporting when done late.

**Rejected.** Single-site simplicity now, multi-site later.

**Cost.** Minor ongoing overhead in every query and screen.

---

## D-005 — Costing method is per item; cost is fixed at movement time

**Status:** `PROPOSED` · **Area:** F8 · **Depends on:** B-06, A-17

**Decision.** Support `STANDARD | MOVING_AVERAGE | FIFO_LAYER` configured per item, standard cost first. A movement's cost is fixed when recorded and never rewritten retroactively. Variances (PPV at receipt, production variance at MO close) are posted explicitly.

**Why.** Explicit variance is what makes §37's financial intelligence possible — moving average hides exactly the signal the product exists to surface. Fixing cost at movement time is what makes any financial report reproducible twice.

**Rejected.** Single global method. Simpler; forces the wrong method onto some item classes.

**Cost.** Three valuation paths to implement and explain. Deferred until B-06 answers whether this system owns valuation at all.

---

## D-006 — Thin vertical slice before broad phase build-out

**Status:** `PROPOSED` · **Area:** build sequence · **Challenges:** Bible §51

**Decision.** Keep §51's dependency order, but validate foundations early with one material travelling supplier → PO → receipt → stock → consumption → cost, exercising D-001, D-002 and D-005 end to end.

**Why.** §51 as written defers real workflow validation to roughly Phase 13, by which point twelve phases of assumptions are load-bearing. A vertical slice tests the foundations while they are still cheap to change, without violating §50's dependencies-first principle.

**Rejected.** Strict phase-by-phase completion.

**Cost.** Some rework as the slice widens. Far cheaper than discovering a ledger flaw at Phase 13.
