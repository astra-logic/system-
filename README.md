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
| 8 | [`docs/domain/05-mechanism-02-purchase-price-WORKSHOP.md`](docs/domain/05-mechanism-02-purchase-price-WORKSHOP.md) | Mechanism 02 — **workshop draft, not locked.** Purchase price variance. |
| 9 | [`docs/domain/06-orders-and-supply-movement-REQUIREMENT.md`](docs/domain/06-orders-and-supply-movement-REQUIREMENT.md) | Tracked requirement — **not designed, not a saving mechanism.** |
| 9b | [`docs/domain/07-decision-report-W33-W36-W35.md`](docs/domain/07-decision-report-W33-W36-W35.md) | Decision report — W-33, W-36, W-35. |
| 9c | [`docs/domain/08-decision-report-D025-amendment-W35-W45.md`](docs/domain/08-decision-report-D025-amendment-W35-W45.md) | **Proposed D-025 amendment — NOT APPLIED.** Plus W-35 and W-45 analysis. |
| 10 | [`context/specs/00-build-plan.md`](context/specs/00-build-plan.md) | Units, stages, milestones, acceptance criteria. |
| 11 | [`docs/open-questions.md`](docs/open-questions.md) | Everything undecided. Nothing here has been assumed elsewhere. |
| 12 | [`docs/decisions/decision-register.md`](docs/decisions/decision-register.md) | Decisions with rationale, rejected alternatives, and costs. |
| 13 | [`context/`](context/) | The six-file working context system (Bible §52). |

---

## North Star

> **How much money could the factory save per year, and where is that saving coming from?**

Primary KPI: **Potential Annual Saving.** Operational management is the layer that makes those savings discoverable, executable and sustainable — an `ENABLER`, not the goal.

## What this release is

Single site. Mixed manufacturing. Primary user is the **inventory / warehouse manager**. Covers inventory, procurement and cost consequence — **not** production, BoMs, MRP, maintenance or full quality. An external finance system owns valuation; this system owns quantity truth.

## Where the project actually is

Phase 0 largely complete. Scope is settled, the domain model and build plan exist in draft, no code is written.

**Implementation is blocked on six answers**, three of them on the critical path: the technology stack, the permission model, and the balance-projection strategy for the ledger. See `docs/open-questions.md`.

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
│   ├── 05-mechanism-02-purchase-price-WORKSHOP.md
│   └── 06-orders-and-supply-movement-REQUIREMENT.md
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
7. No constant is invented to make a calculation complete — no avoidability weights, no default carrying-cost rate, no minimum event count. A missing input yields `INSUFFICIENT_DATA`.
8. Capture is irreversible, computation is reversible — so raw financial dimensions are preserved at event time, while calculation methods are deferred until the abstraction is validated.
