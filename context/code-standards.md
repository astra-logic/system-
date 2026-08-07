# Code Standards

> **Phase:** Planning. No code exists.
>
> Language- and framework-specific standards cannot be written before the stack is chosen (A-19). What follows are **domain-level rules that hold regardless of stack**, derived from the domain model. They are binding on any future implementation.

---

## Non-negotiable domain rules

1. **Never mutate a recorded movement.** Corrections are reversing entries. (D-001)
2. **Never write a balance directly.** Balances are projections of the ledger. (D-001)
3. **No orphan movements.** Every movement cites a source document and a reason code.
4. **Money and quantity use exact decimal types.** Never floating point.
5. **Store quantities in the item's base UoM.** Convert at boundaries, and only at boundaries. (F6)
6. **Rounding happens at defined boundaries only** — never inside iteration.
7. **Every derived value carries its provenance envelope.** No exceptions, no "temporarily". (D-002)
8. **Basis degrades contagiously.** Anything computed from a forecast is at best a forecast.
9. **`INSUFFICIENT_DATA` is a normal return value**, designed and rendered, never an error or a zero.
10. **Never present a potential saving as realised.** (D-011) `REALIZED` is reachable only through measurement against a baseline captured at `APPROVED` — never by assertion.
10a. **One-time and recurring impact are never summed.** Potential Annual Saving contains recurring impact only; capital release is reported separately. (D-012)
10b. **Aggregates carry the weakest basis among their inputs**, including `STALE_DATA`. (D-002 as amended)
11. **Every event carries effective time and recorded time.** (F5)
12. **Quality hold stock is excluded from Available.** (F3)
13. **A manufacturing order freezes its BoM and routing version at release.** (C10)
14. **Stock quantity words mean exactly what F3 says.** On hand ≠ available ≠ projected. Never used loosely, in code or UI.

## Naming

The vocabulary in `docs/domain/01-factory-operating-model.md` is **the** vocabulary. Code, API, UI and conversation use the same words for the same things. Divergent naming between layers is how a domain model quietly dies.

## Testing expectations

- Ledger invariants are property-tested: **stock is conserved**; every movement balances; balances always equal the projection of history.
- Costing is tested against **worked examples with known answers**, not snapshots.
- Provenance propagation is tested — including that basis degrades correctly.
- Backdated and reversing entries are tested explicitly. They are normal, not edge cases.

## Documentation

Per Bible §49, every implementation unit has one objective, a defined boundary, known dependencies, explicit acceptance criteria, independent verifiability, and no unrelated changes. When a decision changes, the decision register and the affected context file are updated **in the same change**.

---

`UNRESOLVED` — language, formatting, linting, project structure, error-handling idiom, API conventions. All follow A-19.
