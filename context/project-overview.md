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

Proposed but **not yet accepted**: append-only stock ledger, provenance envelope, recommendation lifecycle, site-scoping, per-item costing, vertical-slice build order. See `docs/decisions/decision-register.md`.

---

## Not yet decided

`UNRESOLVED` — **Primary user** of first release (B-01)
`UNRESOLVED` — **MVP boundary** (B-02)
`UNRESOLVED` — **Manufacturing type**: discrete / process / mixed (B-03)
`UNRESOLVED` — **Deployment scope**: single site / multi-site / multi-tenant (B-04)
`UNRESOLVED` — **Pilot factory** and availability of real data (B-07)
`UNRESOLVED` — **Goals, success metrics, scope, feature list** — all depend on the above

Full register: `docs/open-questions.md`. These are business decisions, not engineering preferences, and they are not for the implementation agent to assume.

---

## Definition of success

Per Bible §55, success is not feature count. It is:

> **"The factory operates better because this system exists."**
