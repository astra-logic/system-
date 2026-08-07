# 00 — Build Plan

> **Status:** Draft 1, 2026-08-06. Written after the Tier 1 scoping questions were answered.
> **Scope:** `docs/domain/02-first-release-scope.md` — inventory + procurement + cost, single site, warehouse-first, mixed manufacturing, finance owns valuation.
> **North Star:** `docs/01-core-mission.md` — Potential Annual Saving. Saving model: `docs/domain/03-saving-opportunity-model.md`.
> **Still planning.** This is a sequence, not a licence to start coding. Implementation begins when this plan is approved *and* the stack question (A-19) is answered.

---

## How this plan is sequenced

Per Bible §50: dependencies first · security before protected functionality · data foundations before analytics · core transaction logic before intelligence.

Per Bible §49, every unit below has one objective, a defined boundary, known dependencies and explicit acceptance criteria, and is independently verifiable.

Per D-006 as amended by **D-013**, foundations are proven by a **narrow vertical slice** before they are widened — Stage 0 through Stage 2 built for *one item and one location type first*, then carried all the way through to **one quantified saving opportunity** for that material. The point is to discover a flaw in the ledger, and a flaw in the saving thesis, while both are still cheap.

**Every unit is classified** per core-mission §12: `CORE` (directly produces Potential Annual Saving) · `ENABLER` (required foundation) · `ADJACENT` · `OUTER`. Under D-011 the saving engine is CORE and operational management is ENABLER — but per Bible §50 and §56-03, **enablers still come first.** A saving engine over untrustworthy data produces confident nonsense.

**The unit sizes below are deliberately unequal.** U-07 is the largest thing in the release and should not be scheduled as though it were comparable to U-11.

---

## Milestones

| # | Milestone | Means |
|---|---|---|
| **M1** | **Stock is true** | The warehouse manager can trust what the system says is on hand. Usable on its own. |
| **M2** | **Inbound works** | Goods arrive through the system, including when the delivery is wrong. |
| **M3** | **Savings are discoverable and falsifiable** | The North Star produces a defensible number, and the system can show what it actually delivered. |

M1 is a genuinely useful product by itself. If the project stopped there, the pilot factory would still be better off — that is the test of whether the wedge was cut correctly.

---

## Stage 0 — Foundations *(nothing is built on sand)*

### U-01 · Provenance primitive `ENABLER`
**Objective.** Implement D-002's value envelope as a platform primitive.
**Boundary.** The type, its propagation rules, and basis degradation. No feature uses it yet.
**Depends on.** Stack decision (A-19).
**Acceptance.** A value computed from a `FORECAST` input cannot be represented as `ACTUAL`. `INSUFFICIENT_DATA` propagates rather than defaulting to zero. Degradation rules are property-tested.
**Note.** First for a reason. Retrofitting provenance means auditing every number in the system.

### U-02 · Identity, roles, permissions `ENABLER`
**Objective.** Authentication and the permission model.
**Boundary.** Roles relevant to this release only — warehouse operator, inventory manager, buyer, approver, administrator.
**Depends on.** A-20 (unresolved — **blocks this unit**).
**Acceptance.** Every protected operation checks authorisation. Approval limits are enforced server-side. No permission check exists only in the UI.

### U-03 · Site, calendar, time model `ENABLER`
**Objective.** Site scoping (D-004) and F5's effective/recorded time split.
**Acceptance.** Every event carries both timestamps. Backdating is permitted within a configured bound and is visible as backdated. Reports default to effective time.

### U-04 · Units of measure `ENABLER`
**Objective.** F6 — base UoM per item, per-item conversions, explicit rounding boundaries.
**Depends on.** N-04 (catch-weight) — **must be answered before this unit starts.**
**Acceptance.** Conversions are per item and versioned, never global constants. Round-tripping a quantity through conversions does not drift. Rounding occurs only at defined boundaries, never inside iteration.

---

## Stage 1 — Master data

### U-05 · Item master `ENABLER`
**Objective.** Items for mixed manufacturing per D-009.
**Boundary.** Identity, type, UoM, tracking policy, storage constraints, status lifecycle. **No BoM.**
**Depends on.** U-03, U-04.
**Acceptance.** A process material (kg, lot-tracked, fractional) and a discrete item (each, serial-tracked, integer-only) both behave correctly through the same paths. Item type carries behaviour — it is not a label. Integer-only is enforced as validation, not a separate code path.

### U-06 · Location topology `ENABLER`
**Objective.** Warehouse → zone → location, with typed locations.
**Boundary.** Includes virtual counterparty buckets (`Supplier`, `Customer`, `Scrap`, `Adjustment`, `Transit`) and `Quality Hold`.
**Depends on.** U-03. **Open:** A-10 (fixed vs arbitrary depth).
**Acceptance.** Location type governs behaviour — quality-hold stock is excluded from Available by the model, not by a UI filter.

---

## Stage 2 — The ledger *(M1)*

### U-07 · Movement ledger and balance projections `ENABLER`
**Objective.** D-001. The core of the entire product.
**Boundary.** Immutable double-entry movements, reversing entries, balance projections, the F3 quantity vocabulary.
**Depends on.** U-01, U-03, U-05, U-06. **Open:** A-01 (sync vs async projection) — **must be answered before this unit starts.**
**Acceptance.**
- Stock is conserved: every movement balances, property-tested.
- Balances always equal the projection of full history — verified by independent recomputation.
- No movement can be edited or deleted. Corrections are reversing entries.
- No movement exists without a source document and reason code.
- On hand, reserved, available, incoming, projected are each computed per F3's definitions and never conflated.
- Backdated movements produce correct balances at both effective and recorded time.

### U-08 · Lot and serial tracking `ENABLER`
**Objective.** F7 per-item tracking.
**Boundary.** Lot-level stock visibility. **Not** input→output genealogy — that needs production (A-06).
**Acceptance.** A lot-tracked item cannot move without a lot. Lot balances reconcile to item balances.

### U-09 · Manual movements `ENABLER`
**Objective.** Transfer, adjustment, scrap, and **issue-to-consumption** (D-010).
**Depends on.** U-07. **Open:** N-03 (cost centre capture) — **hard to backfill; answer before building.**
**Acceptance.** Every manual movement requires a reason code. Adjustments are attributable to a person and a reason, always.

### U-10 · Counting `ENABLER`
**Objective.** Cycle counting producing adjustment movements.
**Acceptance.** A count never overwrites a balance — it produces an adjustment movement with a variance and a reason. Count accuracy over time is a first-class, visible metric.

> **M1 reached.** Stock is true, traceable and countable.

---

## Stage 3 — Inbound *(M2)*

### U-11 · Supplier master `ENABLER`
**Boundary.** Identity, status lifecycle, per-item commercial terms (price, MOQ, lead time, order multiple). **No supplier scorecards yet** — see U-17 and A-12.

### U-12 · Purchase orders `ENABLER`
**Boundary.** Requisition → PO → approval → send. Change history on quantity, price and date.
**Acceptance.** Commitment is tracked separately from expenditure. Post-send changes are recorded as history, not mutations — supplier reliability metrics are meaningless otherwise.

### U-13 · Receiving `ENABLER`
**Boundary.** Arrival, count, discrepancy, quality hold, put-away, return to supplier.
**Depends on.** U-07, U-12. **Open:** A-15 (inspection policy).
**Acceptance.** Over-, short- and damaged receipts are handled as **normal paths, not error states**. A held receipt does not become available stock. Receipt price difference against the cost reference is recorded as a PPV *signal* (D-008), not a journal entry.

> **M2 reached.** Goods enter the system truthfully, including when reality disagrees with the paperwork.

---

## Stage 4 — Cost and decisions *(M3)*

### U-14 · Cost reference import `ENABLER`
**Objective.** D-008 — import item costs from finance.
**Depends on.** N-01 (**blocks this unit entirely**).
**Acceptance.** Imported costs carry basis `USER_DEFINED` with an `as_of` date. **Staleness is visible wherever a derived financial figure is shown** — not buried in a settings page.

### U-15 · Consumption history and projected availability `ENABLER`
**Objective.** The demand proxy of D-010, and projected available per F3.
**Acceptance.** Items with insufficient history return `INSUFFICIENT_DATA`, never a fabricated average.

### U-16 · Reorder-point planning `CORE`
**Boundary.** Reorder point / min–max on consumption history. **No MRP, no EOQ** — see P-08; EOQ's assumptions rarely hold and presenting it as an optimum when they fail violates §56-10.
**Depends on.** U-15. **Open:** N-06, P-06 (safety stock).
**Acceptance.** Every planning output shows inputs, logic, assumptions, output, confidence and limitations (§30). A run is a reproducible stored snapshot — same inputs, same result, forever.

### U-17 · Saving Opportunity object and lifecycle `CORE`
**Objective.** D-011 — the eighteen-field object and the `POTENTIAL → APPROVED → IN_PROGRESS → REALIZED` lifecycle, with `REJECTED` and `EXPIRED`.
**Depends on.** U-01. **Open:** A-03 (confidence rule), N-12 (ownership and approval).
**Acceptance.**
- One-time and recurring impact are **separate fields**, never summed together.
- Baselines are captured at `APPROVED`, never reconstructed at `REALIZED`.
- `REALIZED` is reachable only through observed measurement, never by assertion.
- Rejections record a reason and are analysable by category.

> **Built in the vertical slice (D-013), not deferred to here.** Listed at U-17 for dependency clarity; proven far earlier against one material.

### U-18 · Saving opportunity detectors `CORE`
**Objective.** The Circle 1 taxonomy of `docs/domain/03-saving-opportunity-model.md` §4.
**Depends on.** U-14, U-15, U-16, U-17. **Open:** N-07, N-08, N-10, N-11, A-18.
**Sequencing.** Start with **4.8 expedite/freight premium** — it measures money actually spent, needs no assumed carrying rate, and is the most defensible category to prove the mechanism with. Then price variance (4.4), then excess stock (4.1).
**Acceptance.**
- Each detector **refuses to produce a number** under its stated failure conditions, returning `INSUFFICIENT_DATA`.
- Dead stock does **not** claim stock value as saving (§4.3).
- Order consolidation nets the carrying-cost offset (§4.5).
- Safety-stock opportunities show the risk created, not only the capital released (§4.7).
- Stockout avoidance produces a **risk flag with no currency figure** (§4.9) — production impact is out of scope.

### U-18b · Aggregation and the headline figure `CORE`
**Objective.** D-012 — the North-Star number, computed honestly.
**Depends on.** U-18. **Open:** N-08, N-09.
**Acceptance.**
- Output is a **range**, not a point.
- Recurring only in the annual figure; one-time capital release reported separately.
- Overlapping opportunities deduplicated by subject, with the deduction shown.
- Aggregate carries the **weakest** basis among its inputs; any stale cost makes it `STALE_DATA`.
- Annualisation refuses below the minimum history window.
- The **realised-versus-identified ratio** is displayed alongside it.

> **M3 reached.** Saving opportunities are discovered, quantified honestly, and falsifiable.

---

## Stage 5 — Experience and integration

### U-19 · Warehouse command centre `ENABLER`
**Objective.** §40 adapted to the warehouse manager (scope doc §7): expected receipts, unresolved discrepancies, counts due, negative or blocked stock, items below reorder point, overdue POs — plus the saving opportunities awaiting approval.
**Depends on.** M1–M3. **Open:** N-05 (handheld vs desk), P-12 (design system), D4 (dark-only).
**Acceptance.** Passes the three-second rule (§9) with real pilot data. One dominant primary action per screen (§12). Every stock number states which quantity it is (F3) — an unlabelled figure is a defect.

### U-20 · Outbound movement feed to finance `ADJACENT`
**Depends on.** N-02. Deferred if release 1 is read-only against finance — which is probably right.

---

## What this plan does not include

No production, BoMs, routings, work centres, capacity, MRP, maintenance, CAPA, inspection plans, multi-site, multi-currency, executive dashboard, or AI features. These are **out of the first release**, not hidden in it. Per §38 and D-002, absent capability is stated plainly rather than implied.

---

## Blocked before implementation can start

| Blocker | Blocks |
|---|---|
| A-19 stack | Everything |
| A-20 permissions | U-02, and therefore anything protected |
| A-01 projection strategy | U-07 — the core unit |
| N-03 consumption capture | U-09 — very hard to backfill |
| N-04 catch-weight | U-04, U-07 — ledger-shaping |
| N-01 finance contract | U-14, U-18 — all financial impact |
| **N-10 carrying-cost rate** | **Most of the recurring saving taxonomy.** If this is an invented assumption, most of the North-Star number is `ASSUMED` |
| N-07 expedite/freight capture | U-18's most defensible detector |
| N-08 / N-09 annualisation window, cost staleness | U-18b, the headline figure |

The first three block the critical path. **They should be answered before any implementation is scheduled**, not discovered during it.
