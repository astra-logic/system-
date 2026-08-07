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
10c. **No numerical avoidability weights**, anywhere, in any form. Avoidability is categorical. Quantification requires a specific intervention and a testable counterfactual over identified events. (D-017)
10d. **No default carrying-cost rate.** Not 15%, not 20%, not any value. Finance owns it; absent it, the dependent output is `INSUFFICIENT_DATA`. (D-023)
10e. **Findings are separated by class.** `FINDING → OPPORTUNITY | OBSERVED COST | EXPOSURE / RISK`, with `EVIDENCE GAP` **outside** the hierarchy. Only `OPPORTUNITY` is eligible for North Star aggregation. No transition, migration or aggregation path converts a non-Opportunity finding into an Opportunity. (D-021, D-025 as amended)
10e-1. **`ACTUAL` historical cost and `FORECAST`/`ESTIMATED` exposure are never mixed in a financial aggregate.** (D-025 as amended)
10e-2. **Exposure is never approved and never realized.** A mitigation with a defensible counterfactual becomes a new Opportunity. Direction changes supersede; materialisation preserves the exposure and creates a linked `OBSERVED COST`. (D-025 as amended)
10e-3. **An Opportunity may `CREATES` or `DEEPENS` a linked Exposure — disclosed, never netted.** The two are **distinct types**; `DEEPENS` is never counted as `CREATES`. **No probability, percentage, threshold or monetary value** is assigned to either. Exposure carries **no** intervention signature. The Exposure record is not created until the intervention is actioned. (D-031 as amended)
10e2. **Evidence strength is an attribute, never a lifecycle state.** Workflow state and evidence strength are orthogonal; the Core Mission §6 lifecycle is not extended. (D-026)
10f-0. **Preserve the F10 capture dimensions on financial events** — original amount, currency, FX rate and date, quantity, unit basis, UoM, period — **as applicable to that event. Never invent a field the event does not have.** (D-028)
10f-1. **Do not build a decomposition engine.** F10 is a capture contract; the calculation is deferred (`Q-08`).
10f. **No cross-period financial comparison without FX normalisation.** Where the operational/price/FX/volume-mix decomposition cannot be performed reliably, mark it — never fabricate it. (D-024)
10g. **Deduplication is at the economic-mechanism level**, and attribution must be explainable — never a silent filter. (D-020)
10g-1. **Every Opportunity declares an intervention signature** — typed subject, affected dimensions, direction per dimension, effect window. An Opportunity without one **cannot be presented**. (D-029)
10g-2. **Contradiction control is separate from deduplication.** Opposed directions on intersecting subject, dimension and window must resolve — net, suspend, supersede or adjudicate — before presentation. (D-029)
10g-3. **Mechanism boundaries follow the counterfactual's effect on quantity over the relevant window**, never supplier terminology. Boundary determines mechanism; gates determine quantifiability. (D-030)
10h. **A single event may detect an opportunity but not support an annual figure.** OPPORTUNITY DETECTED · ANNUALIZATION ELIGIBLE · VERIFIED REALIZATION are distinct. (D-019)
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
