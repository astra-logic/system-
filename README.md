# Manufacturing & Inventory Operating System

> **Status: Planning. No application code exists, by design.**
>
> A manufacturing operating system that turns factory data into clear operational decisions, measurable financial outcomes, and controlled execution.

---

## Read in this order

| # | Document | What it is |
|---|---|---|
| 1 | [`docs/00-product-bible.md`](docs/00-product-bible.md) | The founding document. Vision, philosophy, principles, prohibitions. **Source of authority.** |
| 2 | [`docs/domain/01-factory-operating-model.md`](docs/domain/01-factory-operating-model.md) | The domain model. Nine foundations, fourteen domains, five challenges to the brief. |
| 3 | [`docs/domain/02-first-release-scope.md`](docs/domain/02-first-release-scope.md) | What the first release is, and the four consequences that reshape the product. |
| 4 | [`context/specs/00-build-plan.md`](context/specs/00-build-plan.md) | Twenty units, five stages, three milestones, with acceptance criteria. |
| 5 | [`docs/open-questions.md`](docs/open-questions.md) | Everything undecided. Nothing here has been assumed elsewhere. |
| 6 | [`docs/decisions/decision-register.md`](docs/decisions/decision-register.md) | Decisions with rationale, rejected alternatives, and costs. |
| 7 | [`context/`](context/) | The six-file working context system (Bible §52). |

---

## What this release is

> **A system that makes stock true, and turns that truth into better buying decisions with visible financial consequence.**

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
├── open-questions.md            Register of everything unresolved
├── domain/
│   ├── 01-factory-operating-model.md
│   └── 02-first-release-scope.md
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
