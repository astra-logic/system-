# Manufacturing & Inventory Operating System

> **Status: Planning. No application code exists, by design.**
>
> A manufacturing operating system that turns factory data into clear operational decisions, measurable financial outcomes, and controlled execution.

---

## Read in this order

| # | Document | What it is |
|---|---|---|
| 1 | [`docs/00-product-bible.md`](docs/00-product-bible.md) | The founding document. Vision, philosophy, principles, prohibitions. **Source of authority.** |
| 2 | [`docs/01-core-mission.md`](docs/01-core-mission.md) | The North Star: Potential Annual Saving. Mind map, concentric circles, feature classification. |
| 3 | [`docs/domain/01-factory-operating-model.md`](docs/domain/01-factory-operating-model.md) | The domain model. Nine foundations, fourteen domains, five challenges to the brief. |
| 4 | [`docs/domain/02-first-release-scope.md`](docs/domain/02-first-release-scope.md) | What the first release is, and the four consequences that reshape the product. |
| 5 | [`docs/02-handoff-part1-locked.md`](docs/02-handoff-part1-locked.md) | Part 1 locked. The 16 financial-trust rules that govern every saving figure. |
| 6 | [`docs/domain/03-saving-opportunity-model.md`](docs/domain/03-saving-opportunity-model.md) | The saving taxonomy, calculation rules, and the guard on the headline figure. |
| 7 | [`docs/domain/04-mechanism-01-expedite-premium.md`](docs/domain/04-mechanism-01-expedite-premium.md) | **Mechanism 01 — Part 2.1 locked.** Expedited freight / emergency purchase premium. |
| 8 | [`docs/domain/09-part-2.2-LOCK.md`](docs/domain/09-part-2.2-LOCK.md) | **Mechanism 02 — Part 2.2 LOCKED.** Procurement Price Opportunity. |
| 9 | [`docs/domain/17-part-2.3-LOCK.md`](docs/domain/17-part-2.3-LOCK.md) | **Mechanism 03 — Part 2.3 LOCKED.** Quantity & Inventory Economics. |
| 10 | [`docs/domain/06-orders-and-supply-movement-REQUIREMENT.md`](docs/domain/06-orders-and-supply-movement-REQUIREMENT.md) | Tracked requirement — **not designed, not a saving mechanism.** |
| 11 | [`context/specs/00-build-plan.md`](context/specs/00-build-plan.md) | Units, stages, milestones, acceptance criteria. |
| 12 | [`docs/open-questions.md`](docs/open-questions.md) | Everything undecided. Nothing here has been assumed elsewhere. |
| 13 | [`docs/decisions/decision-register.md`](docs/decisions/decision-register.md) | Decisions with rationale, rejected alternatives, and costs. |
| 14 | [`context/`](context/) | The six-file working context system (Bible §52). |

### Working record — retained, superseded by the locks above

| Document | What it is |
|---|---|
| [`05-mechanism-02-purchase-price-WORKSHOP.md`](docs/domain/05-mechanism-02-purchase-price-WORKSHOP.md) | Mechanism 02 workshop. Superseded by doc 09, retained as history. |
| [`07-decision-report-W33-W36-W35.md`](docs/domain/07-decision-report-W33-W36-W35.md) · [`08-decision-report-D025-amendment-W35-W45.md`](docs/domain/08-decision-report-D025-amendment-W35-W45.md) | D-025 amendment reports. |
| [`10-Q07-saving-model-reconciliation.md`](docs/domain/10-Q07-saving-model-reconciliation.md) · [`11-DP10-DP15-adversarial-decision-report.md`](docs/domain/11-DP10-DP15-adversarial-decision-report.md) · [`12-final-reconciliation-monetary-boundaries.md`](docs/domain/12-final-reconciliation-monetary-boundaries.md) | The DP-10 … DP-15 workshop, adversarial test and reconciliation. |
| [`13-FINAL-READINESS-AUDIT.md`](docs/domain/13-FINAL-READINESS-AUDIT.md) · [`14-DECISION-CLOSURE-AND-BUILD-READINESS.md`](docs/domain/14-DECISION-CLOSURE-AND-BUILD-READINESS.md) | Readiness audit and closure pass. |
| [`15-BLOCK1-foundation-governance-closure.md`](docs/domain/15-BLOCK1-foundation-governance-closure.md) | **Block 1** — D-001 / D-002 adversarial test. Amendments now applied. |
| [`16-BLOCK2-monetary-boundaries.md`](docs/domain/16-BLOCK2-monetary-boundaries.md) | **Block 2** — monetary boundaries re-opened adversarially. Verdicts now locked. |

---

## North Star

> **How much money could the factory save per year, and where is that saving coming from?**

Primary KPI: **Potential Annual Saving.** Operational management is the layer that makes those savings discoverable, executable and sustainable — an `ENABLER`, not the goal.

## What this release is

Single site. Mixed manufacturing. Primary user is the **inventory / warehouse manager**. Covers inventory, procurement and cost consequence — **not** production, BoMs, MRP, maintenance or full quality. An external finance system owns valuation; this system owns quantity truth.

## Saving mechanisms

| # | Mechanism | Status |
|---|---|---|
| 01 | Expedited freight / emergency purchase premium | **LOCKED** (Part 2.1) |
| 02 | Procurement Price Opportunity | **LOCKED** (Part 2.2) |
| 03 | Quantity & Inventory Economics — order policy · buffer policy · position correction · quantity–price coupling | **LOCKED** (Part 2.3) |

None is buildable until its factory-data dependencies are answered. That is a data problem, not a design one.

Mechanism 03 also supplies the **inventory cost model** that Mechanisms 01 and 02 consume to net their incremental carrying cost — it is load-bearing for both even where it produces no opportunity of its own.

## Where the project actually is

**Domain design is complete and locked.** All three saving mechanisms are designed; the two foundations (D-001 ledger, D-002 provenance) are locked and amended; the monetary boundaries are closed. No code is written.

**What remains before architecture is not a design question.** Three answers block the critical path — the technology stack, the permission model, and the balance-projection strategy for the ledger — and eight factory facts decide whether the saving engine produces numbers or only findings. See `docs/open-questions.md` and §G of the Part 2.3 lock.

## Why there is no code

The Product Bible is explicit (§2, §48, §56-09, and its final directive): the product is defined before it is implemented, and an AI agent is never allowed to implement an undefined system. The purpose of this phase is a domain model precise enough that implementation becomes execution rather than improvisation.

**The code comes later.**

---

## Repository layout

```
docs/
├── 00-product-bible.md          Founding document — do not edit casually
├── 01-core-mission.md           North Star — do not edit casually
├── 02-handoff-part1-locked.md   16 locked financial-trust rules
├── open-questions.md            Register of everything unresolved
├── domain/
│   ├── 01-factory-operating-model.md
│   ├── 02-first-release-scope.md
│   ├── 03-saving-opportunity-model.md
│   ├── 04-mechanism-01-expedite-premium.md
│   ├── 05-mechanism-02-purchase-price-WORKSHOP.md   (superseded, retained)
│   ├── 06-orders-and-supply-movement-REQUIREMENT.md
│   ├── 07-decision-report-W33-W36-W35.md
│   ├── 08-decision-report-D025-amendment-W35-W45.md
│   ├── 09-part-2.2-LOCK.md
│   ├── 10-Q07-saving-model-reconciliation.md
│   ├── 11-DP10-DP15-adversarial-decision-report.md
│   ├── 12-final-reconciliation-monetary-boundaries.md
│   ├── 13-FINAL-READINESS-AUDIT.md
│   ├── 14-DECISION-CLOSURE-AND-BUILD-READINESS.md
│   ├── 15-BLOCK1-foundation-governance-closure.md
│   ├── 16-BLOCK2-monetary-boundaries.md
│   └── 17-part-2.3-LOCK.md
└── decisions/
    └── decision-register.md

context/                         Bible §52 six-file system
├── project-overview.md
├── architecture.md
├── code-standards.md
├── ai-workflow-rules.md
├── ui-context.md
├── progress-tracker.md
└── specs/
    └── 00-build-plan.md         Draft 1 — approved plan required before any code
```

## Working rules

1. Ambiguity becomes an open question. It is never silently assumed.
2. Architectural decisions are recorded with what was rejected and what it costs.
3. Documentation is updated in the same change as the decision it reflects.
4. No feature exists because ERP software usually has it.
5. The system never fakes certainty. If it does not know, it says so.
6. Potential is never presented as realised, and the headline saving figure is never a single confident point.
7. No constant is invented to make a calculation complete — no avoidability weights, no default carrying-cost rate, no ordering cost, no service level, no minimum event count, no materiality threshold. A missing input yields `INSUFFICIENT_DATA`.
8. Capture is irreversible, computation is reversible — so raw financial dimensions are preserved at event time, while calculation methods are deferred until the abstraction is validated.
9. An authoritative number can still be the wrong instrument. A financial rate carries the purpose it was built for, and a mismatch blocks the claim rather than degrading it.
10. Counterfactuals are replayed against recorded events, never computed from a formula. No EOQ, no service-level model, no average-inventory shortcut.
11. Where a benefit is measurable and its risk is not, the number itself says so — and says that the omission is optimistic.
