# Code Standards

> **Phase:** Planning. No code exists.
>
> Language- and framework-specific standards cannot be written before the stack is chosen (A-19). What follows are **domain-level rules that hold regardless of stack**, derived from the domain model. They are binding on any future implementation.

---

## Non-negotiable domain rules

1. **Never mutate a recorded movement.** Corrections are reversing entries. (D-001)
1a. **A return is a movement, not a reversal.** `stock → Supplier` with its own reason code. A reversal asserts the record was wrong; a return asserts the goods went back. (D-001 as amended)
1b. **Reject duplicate ingestion at the door.** Every movement carries a source-system natural key; a second movement bearing a key already recorded is **refused**, not accepted and corrected later. (D-001 as amended)
1c. **`Opening Balance / Migration` is a distinct counterparty and is structurally incapable of use by operational events.** Go-live stock never enters through `Adjustment`. (D-001 as amended)
2. **Never write a balance directly.** Balances are projections of the ledger. (D-001)
2a. **Point-in-time reconstruction is required.** The balance of any item at any past instant must be derivable. A maintained current balance alone does not satisfy D-001, and every saving backtest depends on this. (D-001 as amended, D-039)
3. **No orphan movements.** Every movement cites a source document and a reason code.
4. **Money and quantity use exact decimal types.** Never floating point.
5. **Store quantities in the item's base UoM.** Convert at boundaries, and only at boundaries. (F6)
6. **Rounding happens at defined boundaries only** — never inside iteration.
7. **Every value the system asserts carries its provenance envelope** — not only derived values. A raw value carries `ACTUAL` (observed) or `USER_DEFINED` (asserted), so contagion has a floor. No exceptions, no "temporarily". (D-002 as amended)
7a. **`as_of` is the effective time, never the recorded time.** Recorded time is carried separately. (D-002 as amended, F5)
7b. **Provenance never establishes fitness.** A correctly-labelled, authoritative rate may still be the wrong instrument. Use rule 10d-1. (D-002 as amended)
8. **Basis degrades contagiously.** Anything computed from a forecast is at best a forecast.
9. **`INSUFFICIENT_DATA` is a normal return value**, designed and rendered, never an error or a zero.
10. **Never present a potential saving as realised.** (D-011) `REALIZED` is reachable only through measurement against a baseline captured at `APPROVED` — never by assertion.
10a. **One-time and recurring impact are never summed.** Potential Annual Saving contains recurring impact only; capital release is reported separately. (D-012)
10b. **Aggregates carry the weakest basis among their inputs**, including `STALE_DATA`. (D-002 as amended)
10b-1. **Contagion applies to the inputs of a value; exclusion applies to the members of a set.** A member that cannot be computed is **excluded and disclosed** — count, observed magnitude where known, and the statement that the total is a lower bound. **Never treat `INSUFFICIENT_DATA` as zero inside a sum**, and never let one uncomputable member make the whole aggregate uncomputable. (D-043)
10b-2. **The headline range is an evidence partition, not a confidence interval.** Lower bound = findings whose every input is `ACTUAL`/`CALCULATED`; upper bound = that plus findings carrying an `ESTIMATED`/`ASSUMED` input, each disclosed. **No probability, no interval width, no standard deviation.** (D-044)
10b-3. **No synthesised confidence score exists until `A-03` defines one.** Carry evidence strength (D-026) and **coverage facts stated plainly**. Blending gate outcomes into a score is forbidden — gates are never averaged. (D-045)
10b-4. **Annualisation is the observed figure over a stated twelve-month window, never a scaled partial one.** Below twelve months there is no annual figure at all. The window used is shown. **One-time impacts are never annualised.** Rule 11's twelve months (history minimum) and D-022's twelve months (verification window) are **two different clocks**. (D-046)
10b-5. **FX-normalise each historical amount at the rate effective on its own effective date**, never at a single current rate. Absent `F-07`, there is **no cross-period comparison at all** — single-period observed spend only. **Multi-currency capture and normalisation are in scope; multi-currency transacting is not.** (D-042, D-024)
10c. **No numerical avoidability weights**, anywhere, in any form. Avoidability is categorical. Quantification requires a specific intervention and a testable counterfactual over identified events. (D-017)
10d. **No default carrying-cost rate.** Not 15%, not 20%, not any value. Finance owns it; absent it, the dependent output is `INSUFFICIENT_DATA`. (D-023)
10d-1. **A financial rate must be fit for the decision it is used in — never invent, and never misapply.** Every financial rate carries a **structured `purpose`**; a mechanism declares the purpose it requires; **mismatch blocks currency quantification and raises an `EVIDENCE GAP`.** Free text does not satisfy this — a mechanism cannot match against prose. (D-014 rule 10 as amended, D-023 as amended)
10d-2. **Never use a whole carrying-cost rate.** Carrying cost is assembled component-wise, and only from components that are `ACTUAL` or defensibly `CALCULATED` **and** generate incremental cash flow. Obsolescence and future shrinkage are `EXPOSURE`, never cost — inside a rate they would be netted, which 10e-3 forbids. A missing applicable component yields `INSUFFICIENT_DATA`, never a partial number presented as complete. (D-035)
10d-3. **The financing effect is claimed exactly once.** A level-change intervention claims a one-time deferral value; a policy-change intervention claims the recurring capital component. **Never both, never summed** — they are the same quantity measured over different windows. (D-036)
10d-4. **No default ordering cost.** Finance owns it (`F-31`); absent it, the dependent output is `INSUFFICIENT_DATA`. (D-032, by analogy with D-023)
10e. **Findings are separated by class.** `FINDING → OPPORTUNITY | OBSERVED COST | EXPOSURE / RISK`, with `EVIDENCE GAP` **outside** the hierarchy. Only `OPPORTUNITY` is eligible for North Star aggregation. No transition, migration or aggregation path converts a non-Opportunity finding into an Opportunity. (D-021, D-025 as amended)
10e-1. **`ACTUAL` historical cost and `FORECAST`/`ESTIMATED` exposure are never mixed in a financial aggregate.** (D-025 as amended)
10e-2. **Exposure is never approved and never realized.** A mitigation with a defensible counterfactual becomes a new Opportunity. Direction changes supersede; materialisation preserves the exposure and creates a linked `OBSERVED COST`. (D-025 as amended)
10e-3. **An Opportunity may `CREATES`, `DEEPENS` or `MITIGATES` a linked Exposure — disclosed, never netted.** The three are **distinct types**; `DEEPENS` is never counted as `CREATES`. **No probability, percentage, threshold, severity score or monetary value** is assigned to any of them. `MITIGATES` requires the exposure to already exist, is verified only by supersession, and partial mitigation is stated **qualitatively only**. Exposure carries **no** intervention signature. The Exposure record is not created until the intervention is actioned. (D-031 as amended twice)
10e-4. **The net figure declares its own incompleteness.** Where an Opportunity carries an exposure that cannot be valued, the number itself states that it excludes an unvalued risk **and that the exclusion is optimistic**. Placing the risk beside the number is not sufficient — readers read the number. (D-041)
10e2. **Evidence strength is an attribute, never a lifecycle state.** Workflow state and evidence strength are orthogonal; the Core Mission §6 lifecycle is not extended. (D-026)
10f-0. **Preserve the F10 capture dimensions on financial events** — original amount, currency, FX rate and date, quantity, unit basis, UoM, period — **as applicable to that event. Never invent a field the event does not have.** (D-028)
10f-1. **Do not build a decomposition engine.** F10 is a capture contract; the calculation is deferred (`Q-08`).
10f. **No cross-period financial comparison without FX normalisation.** Where the operational/price/FX/volume-mix decomposition cannot be performed reliably, mark it — never fabricate it. (D-024)
10g. **Deduplication is at the economic-mechanism level**, and attribution must be explainable — never a silent filter. (D-020)
10g-1. **Every Opportunity declares an intervention signature** — typed subject, affected dimensions, direction per dimension, effect window. An Opportunity without one **cannot be presented**. (D-029)
10g-2. **Contradiction control is separate from deduplication.** Opposed directions on intersecting subject, dimension and window must resolve — net, suspend, supersede or adjudicate — before presentation. (D-029)
10g-3. **Mechanism boundaries follow the counterfactual's effect on quantity over the relevant window**, never supplier terminology. Boundary determines mechanism; gates determine quantifiability. (D-030)
10g-4. **Contradiction detection runs over a mechanism's own outputs, not only across mechanisms.** Mechanism 03's subtypes can oppose each other. (D-038, D-029)
10i. **Inventory position paths are replayed from recorded events, never computed from a formula.** `Q/2`, average-inventory approximations, service-level models and EOQ are forbidden as sources of any figure. Compute the path from **receipt** events, never from purchase-order quantities. (D-039, D-040)
10i-1. **A counterfactual path that lowers the observed floor makes a stockout-sufficiency claim and is not quantifiable prospectively.** Order quantity moves the peak; the reorder point moves the trough. Only peak-side claims carry currency before realization. (D-039, D-037)
10i-2. **Inputs, cost components, policy parameters and states are never saving categories.** Lead time, demand variability, annual volume, ordering cost, carrying cost, service level, MOQ and "slow-moving" are none of them findings. (D-038)
10i-3. **A price advantage earned on quantity purchased is claimed only on quantity consumed** within the evidenced horizon; beyond it, `INSUFFICIENT_DATA`. (D-038)
10h. **A single event may detect an opportunity but not support an annual figure.** OPPORTUNITY DETECTED · ANNUALIZATION ELIGIBLE · VERIFIED REALIZATION are distinct. (D-019)
10h-1. **Gates are pass / fail / unestablished. They are never averaged and never become scores — and an unestablished dimension is never a pass.** Treating unknown as equivalent is the likeliest route to a manufactured saving, and it presents as a data bug rather than a financial one. *(Promoted from the Mechanism 02 lock to cross-cutting, 2026-08-08 — every mechanism has gates.)*
10h-2. **A baseline is a stored snapshot of inputs and method, not only an output.** Captured at `APPROVED`, never reconstructed at `REALIZED`, and recomputable later to the same result. A stored number cannot be re-verified. (D-011, U-16's reproducibility rule generalised)
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
