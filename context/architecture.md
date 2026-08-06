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

`UNRESOLVED` (A-19). Depends on B-04 (single site / multi-site / multi-tenant).

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
| D-005 | Costing is per item; cost fixes at movement time | Makes financial reports reproducible |

## Cross-cutting foundations

F1 tenancy · F2 stock ledger · F3 quantity semantics · F4 provenance · F5 time · F6 units of measure · F7 lot/serial · F8 costing · F9 recommendations and realised impact.

Detail in `docs/domain/01-factory-operating-model.md` Part B. **F2, F4 and F8 must be settled before any implementation begins** — everything else depends on them.

---

## Known architectural risks

1. **Balance projection performance** under a ledger model (A-01).
2. **Provenance propagation** touching every calculation — cheap now, an audit of every number later (D-002).
3. **Breadth** — see challenge D1. The largest risk to the project is scope, not technology.
4. **Financial impact credibility** — see challenge D3. One exposed fake figure discredits every honest number beside it.
