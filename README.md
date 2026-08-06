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
| 3 | [`docs/open-questions.md`](docs/open-questions.md) | Everything undecided. Nothing here has been assumed elsewhere. |
| 4 | [`docs/decisions/decision-register.md`](docs/decisions/decision-register.md) | Architectural proposals with rationale, rejected alternatives, and costs. |
| 5 | [`context/`](context/) | The six-file working context system (Bible §52). |

---

## Where the project actually is

Phase 0 — product architecture. The Factory Operating Model exists in draft. **Seven blocking questions are unanswered**, and the build plan is deliberately empty until they are resolved.

The next move is not an engineering task. It is a set of business decisions: who the first user is, what the MVP boundary is, what kind of factory this serves, and whether this system owns inventory valuation.

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
│   └── 01-factory-operating-model.md
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
    └── 00-build-plan.md         Intentionally empty
```

## Working rules

1. Ambiguity becomes an open question. It is never silently assumed.
2. Architectural decisions are recorded with what was rejected and what it costs.
3. Documentation is updated in the same change as the decision it reflects.
4. No feature exists because ERP software usually has it.
5. The system never fakes certainty. If it does not know, it says so.
