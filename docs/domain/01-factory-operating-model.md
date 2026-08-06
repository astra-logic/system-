# 01 — Factory Operating Model

> **Status:** Draft 1 — planning artifact. No code, no schema, no UI.
> **Source of authority:** `docs/00-product-bible.md`
> **Purpose:** Execute §57 of the Product Bible — map the real-world factory domain by domain, precisely enough that implementation becomes execution rather than improvisation.

Everything here is a **proposal for review**. Items marked `OPEN` are unresolved and must not be silently assumed. Items marked `PROPOSED` are recommendations with reasoning; they are decisions waiting for a human yes/no.

---

## Part A — How to read this document

For each domain the Bible asks eight questions. Every domain section below answers them in this fixed order:

| # | Facet | Meaning |
|---|-------|---------|
| 1 | **Exists** | What real-world thing this is |
| 2 | **Owner** | Which role is accountable for its correctness |
| 3 | **Data** | What it must know |
| 4 | **States** | The lifecycle it can be in |
| 5 | **Events** | What changes it |
| 6 | **Connects** | What it depends on / feeds |
| 7 | **Decisions** | What human decisions rely on it |
| 8 | **Financial** | What money it can move |

---

## Part B — Cross-cutting foundations

These are not modules. They are the physics of the system. Every domain in Part C sits on top of them. **If these are wrong, nothing above them can be trusted, and the entire "decision intelligence" and "financial impact" ambition collapses.** They are therefore the first things that must be settled.

---

### F1 — Organisational scope and tenancy

The Bible's model starts `Company → Factory/Site → Warehouse → Zone → Location`. The unresolved question is how far scoping goes.

`OPEN-01` **Is this one factory, many factories under one company, or many companies (SaaS)?**

`PROPOSED` Design every operational record as **site-scoped from day one**, even if the first deployment has exactly one site. Retro-fitting a site dimension onto stock, costs and documents is one of the most expensive migrations in this class of system, and it silently corrupts historical reporting when done late. Adding a company dimension later is comparatively cheap if sites are already discrete.

Consequences to settle now, not later:

| Question | Why it matters |
|---|---|
| Is a Product global or per-site? | Global product + per-site stock is standard and correct. Per-site products fragment the BoM and cost model. |
| Is a Supplier global or per-site? | Supplier identity global; commercial terms (price, lead time, MOQ) per site. Lead time from the same supplier genuinely differs by destination. |
| Is cost global or per-site? | `OPEN-02` — Standard cost is usually per-site because labour and overhead rates differ. This forks the costing design. |
| Can stock move between sites? | If yes, inter-site transfer is a two-step in-transit movement, not a teleport. Ownership during transit must be defined. |

---

### F2 — The Stock Ledger *(the single most important decision in the system)*

The Bible asks, in `OPEN-09`/`OPEN-10`, what the authoritative source of inventory truth is. This is the answer that everything else hangs from.

`PROPOSED` **Inventory truth is an append-only ledger of movements. Balances are derived projections, never authored values.**

Concretely:

- A **Movement** is immutable. Once recorded it is never edited or deleted.
- Every movement is **double-entry**: it has a source bucket and a destination bucket, and the quantity leaving one equals the quantity entering the other. Stock is conserved by construction.
- Buckets include real locations *and* **virtual counterparties**: `Supplier`, `Customer`, `Production`, `Scrap`, `Adjustment/Inventory Loss`, `In Transit`, `Quality Hold`.
- A correction is a **new reversing movement**, never a mutation of history.
- **No orphan movements.** Every movement cites a source document and a reason code.

Why this and not a mutable "quantity on hand" column:

1. *Traceability becomes free.* "Where did these 200 kg come from?" is a query, not an investigation. §38 (Data Trust) is unachievable without it.
2. *Reconciliation becomes a balance check.* If receipts minus issues does not equal counted stock, the discrepancy is itself a movement with a reason — which is exactly what a factory needs to argue about.
3. *Valuation attaches to movement.* Cost is a property of the event that moved the goods, so historical cost cannot silently rewrite itself when today's price changes.
4. *Backdating survives.* Factories record yesterday's consumption today. A ledger handles that; a mutable balance loses it.

The cost is real and should be stated honestly: **balances must be maintained as fast projections**, or every stock screen becomes a full-history scan. That is an implementation obligation, not a reason to abandon the model.

`OPEN-03` Are balances projected continuously (updated in the same transaction as the movement) or asynchronously? Continuous is simpler to reason about and avoids showing users stale stock; asynchronous scales further. This affects the whole write path.

**Minimum movement record**

| Field | Note |
|---|---|
| Movement ID | Immutable |
| Item | Product/material |
| Lot / serial | If the item is tracked (see F7) |
| Quantity + UoM | In the item's stock UoM (see F6) |
| From bucket → To bucket | Real location or virtual counterparty |
| Effective date | When it happened in the factory |
| Recorded date | When the system learned about it |
| Source document | PO receipt, MO consumption, transfer, count, adjustment |
| Reason code | Mandatory for anything not driven by a document |
| Actor | Human or system |
| Cost effect | Value impact of this movement (see F8) |

---

### F3 — Quantity semantics

Most enterprise systems lose user trust here, not in the maths. Users see two numbers that should agree and don't, because nobody defined the words. These definitions are binding across UI, API and reporting:

| Term | Definition |
|---|---|
| **On hand** | Physically present in a stock location now. Includes stock that is reserved. |
| **Reserved** | On-hand stock committed to a specific demand. Still physically present. |
| **Available** | On hand − Reserved. What can still be promised. |
| **Incoming** | Confirmed inbound supply not yet received (open PO lines, inbound transfers, planned MO output). |
| **Outgoing** | Confirmed outbound demand not yet fulfilled. |
| **Projected available at date _t_** | Available + Incoming due ≤ _t_ − Outgoing due ≤ _t_. |
| **Quality hold** | On hand but not usable. **Excluded from Available.** |

Two rules that follow, and must not be quietly broken later:

- Any screen showing a stock number must state **which of these it is**. "Stock: 14,200" is a defect.
- **Available may never be negative** in a well-formed system. If it is, that is an exception to surface, not a number to display flatly.

`OPEN-04` Is reservation **hard** (a claim on specific stock/lots, first-come-first-served) or **soft** (a planning-level netting that yields to priority)? This changes the allocation engine and how honest the "available" figure is. Hard reservation is more truthful and more rigid; soft is more flexible and more arguable.

---

### F4 — The provenance envelope *(makes §38 enforceable)*

§38 lists data states. For those to be real rather than decorative, provenance must be a **property carried by every derived value**, not a label a designer remembers to add.

Every non-raw number in the system travels as:

```
value          the number itself
unit           kg, hours, currency, %, days
basis          ACTUAL | CALCULATED | FORECAST | ESTIMATED |
               ASSUMED | USER_DEFINED | INSUFFICIENT_DATA
as_of          the moment it was true
inputs         what it was computed from (traceable references)
assumptions    explicit, named, and overridable
confidence     with a stated definition, not a vibe
limitations    what would make this wrong
```

Three consequences the team must accept up front:

1. `INSUFFICIENT_DATA` is a **first-class outcome**, not an error path. The system must render "we cannot tell you this yet, and here is why" as a normal, well-designed state. §38's example is the standard.
2. A value's basis is **contagious**. Anything computed from a `FORECAST` is at best a `FORECAST`. The system must degrade basis automatically rather than trusting each feature to remember.
3. **Confidence must have a definition.** "High/Medium/Low" with no rule behind it is exactly the fake certainty §56-10 forbids. `OPEN-05` — define the confidence rule (sample size? variance? data recency? all three?) before any recommendation ships.

---

### F5 — Time

Factories are not real-time systems. People write down what happened hours or days ago.

- Every event carries **effective date** (when it happened) and **recorded date** (when we learned). Reports default to effective date; audits use recorded date.
- **Periods close and lock.** After close, corrections are reversing entries in an open period. `OPEN-06` — who can close a period, and can it be reopened?
- Backdating must be **allowed but bounded and visible** — factories need it, and unbounded backdating destroys closed financials.

---

### F6 — Units of measure

Cheap to specify now, extremely expensive later — this is the classic source of silent, large inventory errors.

- Each item has one **base/stock UoM**. All ledger quantities are stored in it. Always.
- **Purchase UoM** and **consumption UoM** may differ (buy drums, stock kg, consume grams).
- Conversions are **per item**, versioned, and never global constants. Density varies by material and grade; a global litre→kg factor is a bug waiting to happen.
- **Rounding rules must be explicit** and applied at defined boundaries. Rounding inside a loop is how 14,200 kg becomes 14,197 kg with no explanation.

`OPEN-07` Are catch-weight items required (ordered in units, invoiced by actual weight)? Common in process manufacturing. If yes, it must be designed in from the start — it is not a later feature.

---

### F7 — Lot, batch and serial tracking

`PROPOSED` Traceability policy is **per item**, not global: `NONE | LOT | SERIAL`. Forcing lot tracking on consumables is bureaucracy; omitting it on regulated materials is a compliance failure.

If tracked, movements must carry the lot/serial, which yields genealogy: input lots → output lots. That genealogy is what makes a recall answerable ("which finished goods contain lot X?"), and it is also the backbone of quality root-cause analysis in §32.

`OPEN-08` Is full forward/backward genealogy required for the first release, or is lot-level stock visibility enough initially? Genealogy is a significant cost and should be a deliberate choice, not an accident.

---

### F8 — Costing

`OPEN-11`/`OPEN-12` from the Bible. The shape of the answer:

`PROPOSED` **Valuation is perpetual and attaches to ledger movements.** Costing method is configured **per item**, from `STANDARD | MOVING_AVERAGE | FIFO_LAYER`.

- **Standard cost** — predictable, makes variances explicit and analysable, requires disciplined maintenance and periodic revaluation. Best fit for a factory that wants to *manage* cost.
- **Moving average** — self-correcting, low maintenance, but hides variance in the average, which directly weakens §37's financial-impact ambition.
- **FIFO layers** — most faithful to physical flow, heaviest to implement and explain.

Variances are **posted explicitly, never absorbed silently**:

- **Purchase price variance** at receipt — PO price vs standard.
- **Production variance** at manufacturing-order close — material usage, labour, machine, overhead, yield, scrap.

The binding rule: **a movement's cost is fixed when it is recorded.** Later price changes never rewrite historical cost. Without this rule, no financial statement the system produces can be reproduced twice.

`OPEN-09` Does this system own valuation, or does an existing finance/ERP system own it and this one feeds it? This is a major architectural fork and must be answered before any costing work starts.

---

### F9 — Recommendations and realised impact *(the anti-fake-savings mechanism)*

§36 and §37 are the product's differentiators, and also its largest credibility risk. A recommendation engine that claims savings it never proves is precisely the "fake savings calculations" §47 forbids.

`PROPOSED` A **Recommendation** is a stored, first-class object with §36's structure — what, why, evidence, calculation, assumptions, expected impact, confidence, action — plus a lifecycle:

```
PROPOSED → ACCEPTED → ACTIONED → MEASURED → { REALISED | NOT_REALISED }
         ↘ DISMISSED (with reason)
         ↘ EXPIRED (assumptions no longer hold)
```

And an **Impact Claim** that is never allowed to skip states:

| Claim type | Meaning | May be reported as savings? |
|---|---|---|
| Potential | Modelled, no action taken | **No** |
| Forecast | Action taken, outcome not yet observable | **No** |
| Avoided cost | Counterfactual, method stated | Only with the method shown |
| Realised | Observed against a recorded baseline | **Yes** |

Two rules that make this real rather than cosmetic:

1. **Baselines are captured before the action, not reconstructed after it.** Reconstructed baselines are unfalsifiable.
2. **Dismissals are data.** A recommendation type that is dismissed 90% of the time is a broken recommendation type, and the system should be able to see that about itself.

---

## Part C — The domains

### C1 — Company / Site

**Exists** The legal and physical containers of operations. **Owner** System administrator. **Data** Identity, currency, calendar, working hours, timezone, address. **States** Active / inactive. **Events** Configuration change; site opened or closed. **Connects** Parent to every operational record. **Decisions** Scoping of nearly every report. **Financial** Sets reporting currency and the boundary of consolidation.

`OPEN-10` Multi-currency: is it needed at first release? Suppliers priced in a foreign currency force FX handling into procurement and costing immediately.

---

### C2 — Warehouse / Zone / Location

**Exists** The physical topology stock lives in.
**Owner** Warehouse manager.
**Data** Code, name, parent, type, capacity, restrictions, pickability, countability.
**States** Active / blocked / under count.
**Events** Created; blocked; capacity changed; counted.
**Connects** Every movement's from/to bucket.
**Decisions** Where to put goods, where to pick from, what to count next.
**Financial** Location holds valued stock; blocked locations trap capital invisibly, which is exactly the kind of thing §34 should surface.

`PROPOSED` Treat **location type** as behaviour-bearing, not cosmetic: `STOCK | STAGING | QUALITY_HOLD | PRODUCTION_LINE | SCRAP | TRANSIT | VIRTUAL_COUNTERPARTY`. Availability, valuation and counting rules all key off it. A "quality hold" that is only a label will leak unusable stock into available inventory.

`OPEN-11` Is the location hierarchy fixed at four levels, or arbitrary-depth? Arbitrary depth is more flexible and materially harder to make fast and legible.

---

### C3 — Product / Material

**Exists** Anything the factory buys, makes, stores, consumes or sells. The Bible's §27 list — raw materials, components, WIP, finished goods, packaging, consumables, spare parts — is the right coverage.
**Owner** Master-data owner. `OPEN-12` — which role actually is this? Undefined ownership of item master is a top cause of ERP data rot.
**Data** Identity, type, base UoM and conversions, tracking policy, costing method, planning parameters, quality requirements, shelf life, storage constraints, status.
**States** `DRAFT → ACTIVE → PHASE_OUT → OBSOLETE`. Obsolete items with stock are an exception, not a blocked state.
**Events** Created, approved, parameter changed, superseded, obsoleted.
**Connects** Everything. This is the spine of the system.
**Decisions** Buy/make, how much, when, where to store, what to inspect.
**Financial** Carries standard cost and valuation policy; drives inventory value.

The critical modelling point: **item type must not be a free-text category.** It determines legal behaviour — whether the item can be purchased, manufactured, sold, consumed, or held in WIP. Types with behaviour are a design decision; types as labels are a future data-quality incident.

---

### C4 — Supplier

**Exists** External source of purchased items. **Owner** Procurement manager. **Data** Identity, terms, currency, contacts, per-item commercial terms (price breaks, MOQ, lead time, order multiple), certifications. **States** `PROSPECT → APPROVED → ACTIVE → SUSPENDED → BLOCKED`. **Events** Approved, terms changed, delivery recorded, quality event recorded, suspended. **Connects** Procurement, receiving, quality, cost. **Decisions** Who to buy from, how much to trust their lead time, whether to dual-source. **Financial** Purchase price variance, carrying cost driven by MOQ, cost of unreliability.

§29 asks for supplier intelligence. The honest constraint: **most supplier metrics are statistically meaningless below a threshold of completed deliveries.** Lead-time variability from two deliveries is noise presented as insight. This is the exact scenario §38's example calls out, and it must be enforced by F4, not by good intentions.

`OPEN-13` What is the minimum sample size before a supplier metric is displayed as anything other than `INSUFFICIENT_DATA`? This needs a number, agreed once, applied everywhere.

---

### C5 — Demand

**Exists** Everything that consumes output — sales orders, forecasts, internal requirements, service parts.
**Owner** Planner / sales.
**Data** Item, quantity, required date, source, firmness, priority.
**States** `FORECAST → FIRM → RELEASED → FULFILLED / CANCELLED`.
**Events** Received, changed, consumed by actual orders, cancelled.
**Connects** Planning, production, inventory reservation.
**Decisions** What to make, what to buy, what to promise.
**Financial** Unmet demand is lost revenue; over-forecast becomes excess stock.

**Forecast consumption is the subtle part**: when a real order arrives, it must consume the forecast rather than add to it, or the system double-counts demand and over-orders — a failure mode that looks like the system working right up until the warehouse is full.

`OPEN-14` Is there real sales-order demand at first release, or is demand entirely forecast/manual? This determines whether planning is genuinely closed-loop or an estimation aid.

---

### C6 — Planning

**Exists** The engine that converts demand into supply proposals. **Owner** Production planner. **Data** Planning horizon, buckets, parameters, run results. **States** Planning runs are immutable snapshots: `RUNNING → COMPLETE → SUPERSEDED`. **Events** Run executed; proposal accepted, modified, rejected. **Connects** Demand, inventory, BoM, capacity, procurement, production. **Decisions** The core buy/make/when/how-much set. **Financial** Every planning decision moves capital and service level in opposite directions.

Non-negotiable per §30: **every planning output must show inputs, logic, assumptions, output, confidence and limitations.** A planning engine users cannot interrogate is a planning engine they will override and then distrust.

`PROPOSED` A planning run is a **stored, reproducible snapshot** — same inputs, same result, forever. Users must be able to ask "why did it say that last Tuesday?" and get an answer. Non-reproducible planning cannot be audited or trusted.

`OPEN-15` Which methodologies at first release — reorder point, min/max, MRP, or all? These are different engines wearing similar words, and the Bible's `OPEN-13`/`14`/`15` (methodologies, EOQ, safety stock) all live here. **EOQ in particular should be treated with suspicion**: its assumptions (stable demand, known ordering cost, no price breaks) rarely hold in a real factory, and presenting it as an optimum when its assumptions fail is a §56-10 violation.

---

### C7 — Procurement

**Exists** The path from need to inbound goods. **Owner** Procurement manager. **Data** Requisitions, RFQs, POs and lines, prices, delivery schedules, terms, approvals. **States** PO: `DRAFT → PENDING_APPROVAL → APPROVED → SENT → PARTIALLY_RECEIVED → RECEIVED → CLOSED`, with `CANCELLED` reachable before receipt. **Events** Raised, approved, sent, acknowledged, changed, received against, closed. **Connects** Planning, supplier, receiving, inventory, cost. **Decisions** What to order, from whom, at what price, when. **Financial** Committed spend; PPV; the primary lever over inventory capital.

Two things easy to get wrong and expensive to fix:

- **Commitment is not expenditure.** An approved PO commits capital before any money moves. Reporting that ignores commitments understates exposure and makes cash planning wrong.
- **PO changes after sending are ordinary**, not exceptional. Quantity, price and date revisions need first-class history, because supplier reliability metrics are meaningless if the promised date silently mutates.

---

### C8 — Receiving

**Exists** The transition from supplier ownership to factory ownership. **Owner** Warehouse manager. **Data** Receipt, PO reference, quantities, lots, condition, discrepancies. **States** `EXPECTED → ARRIVED → COUNTED → INSPECTED → PUT_AWAY / REJECTED`. **Events** Arrival, count, inspection result, put-away, return to supplier. **Connects** PO, quality, inventory ledger, cost. **Decisions** Accept/reject; where to put away; whether to claim against the supplier. **Financial** The moment inventory value and liability are created. PPV is recognised here.

**This is where truth enters the system.** Over/short/damaged receipts are normal, and how they are handled determines whether stock records match reality for the next twelve months. Receiving is not a formality to speed through; getting it wrong poisons everything downstream.

`OPEN-16` Is incoming inspection mandatory, per-item, or per-supplier? This determines whether received stock lands in `QUALITY_HOLD` or straight into available stock — a decision with direct consequences for both availability figures and quality risk.

---

### C9 — Inventory

Governed by F2, F3, F6 and F7. Here the domain-level view:

**Exists** The current and historical state of all physical stock. **Owner** Inventory / warehouse manager. **Data** Movements (authoritative) and balances (derived). **States** Stock state is a property of location and status: available, reserved, quality hold, in transit, blocked. **Events** Receipt, issue, transfer, adjustment, count, scrap, return. **Connects** Everything. **Decisions** Can we promise it, do we need to buy it, is capital trapped, what should we count. **Financial** The largest single balance-sheet item this system controls.

**Cycle counting** is the mechanism that keeps the ledger honest against reality. A count produces an adjustment movement with a reason code, never a silent overwrite. Count accuracy over time is itself the trust metric for the whole system, and should be treated as a headline number rather than a buried report.

The derived conditions §28 asks for — aging, slow-moving, excess, dead stock, stockout risk — are all **definitions before they are features**. "Excess" means nothing until someone says excess relative to what horizon and whose forecast. `OPEN-17` — define each of these thresholds explicitly; they are business policy, not engineering defaults.

---

### C10 — Production

**Exists** Conversion of materials into products via BoM and routing. **Owner** Production manager. **Data** Manufacturing orders, BoM version used, routing, operations, work centres, planned vs actual materials, labour, machine time, output, scrap, rework, downtime. **States** MO: `PLANNED → RELEASED → IN_PROGRESS → COMPLETED → CLOSED`, plus `CANCELLED` and `ON_HOLD`. **Events** Release, material issue, operation start/complete, output declaration, scrap, rework, downtime, close. **Connects** Planning, inventory, capacity, quality, cost. **Decisions** What to run, in what order, whether we can, what went wrong. **Financial** Where standard cost meets reality; production variance is recognised at close.

Modelling points that determine whether this is real or superficial:

- **A manufacturing order must freeze the BoM and routing version it was released with.** If engineering changes the BoM mid-run, the order must still know what it was actually built from — otherwise genealogy and variance analysis both become fiction.
- **WIP is inventory**, held in a production bucket. Materials issued to an order have left stores and not yet become output. Systems that skip WIP cannot explain where material went, and cannot value a half-finished order.
- **Scrap, rework and yield loss are distinct events** with distinct costs. Collapsing them into one "loss" figure destroys the ability to answer §34's "where are we losing yield?".
- Backflush (auto-consume on output) versus explicit issue is a real trade-off: backflush is fast and drifts from reality; explicit issue is accurate and slower on the floor. `OPEN-18` — which, and is it per item or per work centre?

---

### C11 — Quality

**Exists** Verification that materials and output meet specification, and the trail from defect to corrective action. **Owner** Quality manager. **Data** Specifications, inspection plans, sampling rules, results, defects, nonconformances, holds, dispositions, CAPA. **States** Inspection: `PENDING → IN_PROGRESS → PASSED / FAILED / CONDITIONAL`. Nonconformance: `OPEN → INVESTIGATING → DISPOSITIONED → CLOSED`. **Events** Inspection triggered, result recorded, hold placed/released, disposition decided, CAPA raised/closed. **Connects** Receiving, production, inventory (hold), supplier, cost. **Decisions** Accept, reject, rework, scrap, concede, return to supplier. **Financial** Quality cost — scrap, rework, returns, and the cost of the inspection itself.

The mechanism that makes quality real rather than a form: **a quality hold must actually make stock unavailable** (F3), and a disposition must produce a real inventory movement. Quality that only records opinions changes nothing on the floor.

---

### C12 — Maintenance

**Exists** Keeping equipment capable. **Owner** Maintenance manager. **Data** Equipment register, meters, PM schedules, work orders, parts used, labour, downtime records. **States** Equipment: `RUNNING → DOWN → UNDER_MAINTENANCE → RETIRED`. Work order: `REQUESTED → SCHEDULED → IN_PROGRESS → COMPLETED`. **Events** Failure, PM due, work order raised/completed, parts consumed, downtime recorded. **Connects** Work centres and capacity, spare-parts inventory, production. **Decisions** What to service, when, whether to run to failure. **Financial** Maintenance cost, spare-parts capital, and the much larger cost of unplanned downtime.

The connection that gives this its value, per §33: **downtime consumes capacity, and lost capacity has a production and financial consequence.** Maintenance modelled in isolation is a work-order tracker; maintenance connected to capacity is operational intelligence. Spare parts must be ordinary inventory items in the same ledger — a parallel parts system is a duplicate inventory system with all the same problems and none of the same rigour.

---

### C13 — Cost

Governed by F8. Domain view: **Exists** The monetary shadow of every operational event. **Owner** Finance / cost analyst. **Data** Cost elements, rates, standards, actuals, variances. **States** Cost periods open/closed. **Events** Any valued movement; period close; standard revision. **Connects** Everything valued. **Decisions** Pricing, sourcing, make/buy, process improvement priorities. **Financial** This *is* the financial layer.

`OPEN-19` Are labour, machine and overhead rates available at first release, or is material cost the only reliable component? **If only material cost is real, then "product cost" must be labelled as material cost only** — presenting a partial cost as a full one is exactly the fabrication §38 forbids, and it would undermine trust in every other number the system shows.

---

### C14 — Financial outcomes

**Exists** The aggregate business consequence of operations — inventory capital, cost trends, variance, margin impact, savings.
**Owner** Finance, consumed by executives.
**Data** Derived entirely from the domains above, through F4 and F9.
**Events** Recalculation on underlying change.
**Decisions** Where to direct attention and capital.
**Financial** By definition.

The discipline that protects this layer: **no financial outcome may be presented without provenance, and no potential saving may be presented as realised.** This is where a system of this kind either earns lasting credibility or quietly loses it — usually by being impressive first and wrong later.

---

## Part D — Challenges to the brief

§"FINAL DIRECTIVE" invites challenge where a proposal conflicts with the philosophy. Five conflicts are worth raising now, while they are still cheap to resolve.

**D1 — "Compete with Oracle and Odoo breadth" conflicts with §47's ban on feature bloat.**
Oracle SCM and Odoo Manufacturing represent thousands of person-years. Matching their breadth *and* exceeding their UX quality is not achievable simultaneously by a small team, and attempting both usually produces a system that is shallow everywhere. The Bible's own §5 test — does a capability improve control, decisions, financial performance, trust? — is the right filter, but it needs to be applied ruthlessly to *entire domains*, not just to features within them. **Recommendation:** compete on depth in a narrow wedge (inventory truth + procurement decisions + cost consequence) and treat manufacturing execution, quality and maintenance as later expansions. Breadth is the failure mode here, not the goal.

**D2 — The 21-phase sequence in §51 delays validation dangerously.**
It is a dependency-correct order, and it is also a waterfall: real workflow validation arrives around Phase 13, by which point twelve phases of assumptions are load-bearing. **Recommendation:** keep the dependency logic, but drive a **thin vertical slice** early — one material, from supplier through receipt, stock, consumption, to cost — exercising F2, F4 and F8 end to end. That slice is what proves the foundations before they carry weight, and it does not violate §50's principle that dependencies come first.

**D3 — The financial impact engine is the highest-risk feature in the product.**
§37 is the differentiator and the most likely source of the "fake savings" §47 prohibits. Impact figures are easy to compute, easy to make impressive, and very hard to defend. F9's realisation ledger is the proposed guard; without something equivalent, this feature should not ship at all. It is better to have no savings number than an indefensible one — a single exposed fake figure discredits every honest number beside it.

**D4 — Dark-only (§18) is a constraint that should be tested, not assumed.**
Dark technical workspaces are excellent on the right screens and genuinely poor in bright shop-floor environments and on projected screens, where washed-out contrast makes dense tables hard to read. §46 also names accessibility as a quality bar. **Recommendation:** build semantic tokens (which §18 already requires) so a light theme remains possible, and validate against the real environments the system will actually be used in before committing to dark-only.

**D5 — AI at Phase 20 risks being architecturally late.**
§56-03 is right that trust precedes intelligence, and §51 correctly sequences AI last. But if F4 provenance is not designed in from the start, the intelligence layer will have nothing trustworthy to reason over and will end up re-deriving facts. **Recommendation:** keep AI *features* last, and treat the provenance layer as foundational infrastructure from day one. That is the thing that makes AI both possible and safe later.

---

## Part E — What must happen next

1. **Resolve F1, F2 and F8.** Tenancy, the stock ledger, and costing ownership. Nothing meaningful can be specified before these three, and all three are business decisions, not engineering preferences.
2. **Answer the scoping questions in `docs/open-questions.md`** — particularly the primary user, factory type, and MVP boundary.
3. **Then, and only then**, write the context files properly and the build plan.

Per the Bible: the code comes later.
