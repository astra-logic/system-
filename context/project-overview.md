# Project Overview

> **Phase:** Planning. No code, no schema, no UI.
> **Authority:** `docs/00-product-bible.md` is the source of truth for vision and principles. This file records what has been *decided*, not what is aspired to.

---

## What this is

A manufacturing and inventory operating system: a rebuild from zero, intended to turn factory data into clear operational decisions, measurable financial outcomes, and controlled execution.

## What it is not

Not an ERP clone. Not a dashboard-first product. Not a collection of modules. See Bible §47 for the full prohibition list — it is binding.

## One-sentence vision

> Build a manufacturing operating system that turns factory data into clear operational decisions, measurable financial outcomes, and controlled execution.

## The six questions the product must answer

What is happening? · Why is it happening? · What matters? · What should I do? · What will happen if I do it? · What is the financial impact?

---

## Decided so far

| Area | Decision | Ref |
|---|---|---|
| Documentation model | Six-file context system + domain docs + decision register + open questions | Bible §52 |
| Planning discipline | Ambiguity is recorded as an open question, never silently invented | Bible §2 |
| Domain model | First draft complete | `docs/domain/01-factory-operating-model.md` |
| **Primary user** | **Inventory / warehouse manager** | D-007 |
| **First release scope** | **Inventory + procurement + cost.** No production, BoMs, MRP, maintenance, full quality | D-007 |
| **Manufacturing type** | **Mixed** — process and discrete, per-item behaviour | D-009 |
| **Deployment** | **Single site**, records still site-scoped | D-004 |
| **Valuation** | **Finance owns it.** This system owns quantity truth | D-008 |
| **North Star** | **Potential Annual Saving** | D-011 |
| Core object | Saving Opportunity, with one-time and recurring impact separated | D-011 |
| Headline figure | A range, deduplicated, weakest-basis, with realised ratio | D-012 |
| Build plan | Draft 1 written | `context/specs/00-build-plan.md` |

Proposed but **not yet accepted**: append-only stock ledger, provenance envelope, recommendation lifecycle, vertical-slice build order, consumption-based planning. See `docs/decisions/decision-register.md`.

---

## What the product is, in one line

> **A system that discovers, quantifies and verifies how much money the factory could save per year — supported by the operational management that makes those savings executable and sustainable.**

**North Star KPI: Potential Annual Saving** (`docs/01-core-mission.md`). Operational management is the `ENABLER`; the saving engine is `CORE`. This does not reorder the build — trust precedes intelligence (Bible §56-03) — but it sets what the first release must demonstrate.

Scope: `docs/domain/02-first-release-scope.md`. Saving model: `docs/domain/03-saving-opportunity-model.md`.

---

## Not yet decided

`UNRESOLVED` — **Technology stack and deployment architecture** (A-19) — blocks all implementation
`UNRESOLVED` — **Permission and role model** (A-20) — blocks anything protected
`UNRESOLVED` — **Balance projection strategy**, sync or async (A-01) — blocks the ledger, the core unit
`UNRESOLVED` — **Consumption capture granularity** (N-03) — very hard to backfill
`UNRESOLVED` — **Catch-weight items** (N-04) — ledger-shaping
`UNRESOLVED` — **Finance integration contract** (N-01) — blocks all financial-impact work
`UNRESOLVED` — **Carrying-cost rate** (N-10) — underpins most of the North-Star number
`UNRESOLVED` — **Pilot factory and its consumption history** (B-07, N-06)

Full register: `docs/open-questions.md`. These are business decisions, not engineering preferences, and they are not for the implementation agent to assume.

---

## Definition of success

Per Bible §55, success is not feature count. It is:

> **"The factory operates better because this system exists."**
