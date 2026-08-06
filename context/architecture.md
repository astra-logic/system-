# Architecture

> **Phase:** Planning. Nothing here is implemented.
> Foundational modelling lives in `docs/domain/01-factory-operating-model.md` Part B. Decisions live in `docs/decisions/decision-register.md`. This file summarises architectural position and states plainly what is unknown.

---

## Technology stack

`UNRESOLVED` (A-19). No stack has been chosen. **The implementation agent must not assume one.**

Constraints the eventual stack must satisfy, derived from the domain model rather than preference:

- **Transactional integrity is non-negotiable.** The stock ledger (D-001) requires atomic, consistent writes. A store with weak transactional guarantees is disqualified.
- **Append-heavy, read-heavy workload.** Immutable movements written continuously; balances and analytics read constantly.
- **Derived projections must stay fast.** Stock screens cannot scan full history.
- **Auditability.** Effective vs recorded time, period locking, reversing entries.
- **Numeric exactness for money and quantity.** Floating-point currency is a defect, not a trade-off.

## Deployment architecture

`UNRESOLVED` (A-19) in its specifics. **Scope is settled: single site** (B-04). Records remain site-scoped per D-004 so multi-site stays open without a migration.

## Storage

`UNRESOLVED`. Shape is constrained by D-001: immutable movement log plus maintained balance projections. Whether projections are materialised synchronously or asynchronously is A-01.

## Auth and permissions

`UNRESOLVED` (A-20). Bible §44 lists eleven candidate roles and states the permission model is an open architectural decision. Per Bible §50, **security precedes protected functionality** — this must be resolved before any protected feature is built, not after.

---

## Architectural positions taken (proposed)

| # | Position | Rationale |
|---|---|---|
| D-001 | Inventory truth is an append-only double-entry movement ledger | Traceability and valuation become structural, not features |
| D-002 | Provenance is a platform primitive on every derived value | Bible §38 is otherwise unenforceable |
| D-003 | Recommendations have a lifecycle; impact claims are typed | Guards against the fake savings §47 forbids |
| D-004 | All operational records are site-scoped from day one | Retrofitting is an expensive, history-corrupting migration |
| D-007 | First release is the inventory + procurement + cost wedge | Breadth is the project's principal risk (challenge D1) |
| D-008 | We own quantity truth; finance owns valuation | Removes the largest, riskiest piece of scope; keeps the financial intelligence |
| D-009 | Mixed manufacturing: item behaviour is per item | Ledger numeric model is the hardest thing to change later |
| D-010 | Demand is observed consumption; planning is reorder-point, not MRP | MRP needs BoMs, which need production |

## Cross-cutting foundations

F1 tenancy · F2 stock ledger · F3 quantity semantics · F4 provenance · F5 time · F6 units of measure · F7 lot/serial · F8 costing · F9 recommendations and realised impact.

Detail in `docs/domain/01-factory-operating-model.md` Part B. F8 is now largely resolved by D-008 — this system holds a **cost reference**, not a costing engine. **F2 and F4 remain the load-bearing foundations** and are the first two units in the build plan.

## Integration boundary (new, from D-008)

An external finance system is the system of record for inventory valuation. This system:

- **imports** item costs (basis `USER_DEFINED`, with `as_of`) — `N-01` defines the contract
- **emits** a movement feed for finance to value — `N-02` decides whether this is in release 1
- **never** posts journal entries or computes inventory value
- **surfaces** price variances as decision signals, not accounting entries

Consequence to hold onto: the financial-impact engine's credibility is bounded by the freshness of imported cost, and **that bound must be visible in the product**.

---

## Known architectural risks

1. **Balance projection performance** under a ledger model (A-01) — blocks U-07, the core unit.
2. **Provenance propagation** touching every calculation — cheap now, an audit of every number later (D-002).
3. **Breadth** — see challenge D1. The largest risk to the project is scope, not technology.
4. **Financial impact credibility** — see challenge D3. One exposed fake figure discredits every honest number beside it. Now compounded by dependence on an external cost feed (D-008).
5. **Planning without demand foresight** (D-010). Reorder-point planning is reactive by construction; a demand step-change is invisible until it has happened. The product must not imply foresight it lacks.
