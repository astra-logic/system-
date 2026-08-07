# Progress Tracker

> Updated whenever meaningful progress or a decision occurs. Honest state only — no aspirational entries.

**Current phase:** Phase 0 — Product architecture
**Current activity:** Scope settled, North Star absorbed, saving model drafted. Awaiting stack and the critical-path answers.
**Code written:** None. Correctly so.

---

## Build phase status (Bible §51 — sequence itself under challenge, see D-006)

| Phase | Name | Status |
|---|---|---|
| 0 | Product architecture | **Largely complete** — scope, domain model, build plan drafted |
| 1 | Context + specifications | **In progress** — context files updated; unit specs not yet written |
| 2–21 | Factory model through advanced optimisation | Not started. Sequence superseded for release 1 by `context/specs/00-build-plan.md` |

---

## Completed

**Project scaffolding** — repository initialised, six-file context system created per Bible §52, Product Bible preserved as `docs/00-product-bible.md`.

**Factory Operating Model draft 1** — `docs/domain/01-factory-operating-model.md`. Nine cross-cutting foundations (F1–F9) and fourteen domains (C1–C14) mapped across the eight facets required by Bible §57. Five challenges to the brief raised.

**Open questions register** — `docs/open-questions.md`. 7 blocking, 20 architectural, 14 product questions. Bible §54's 25 questions absorbed and extended.

**Decision register** — `docs/decisions/decision-register.md`. Ten entries. **Four accepted** (D-007 scope, D-008 valuation ownership, D-009 mixed manufacturing, D-004 site scoping context), one superseded (D-005), five proposed.

**Scoping decisions taken** — mixed manufacturing, inventory/warehouse manager as primary user, inventory + procurement + cost wedge, single site, finance owns valuation. Consequences worked through in `docs/domain/02-first-release-scope.md`.

**First release scope** — `docs/domain/02-first-release-scope.md`. In/out by domain, plus the four consequences that reshape the product: finance owning valuation, procurement without production, mixed-mode inventory foundations, and warehouse-first navigation. Six new open questions raised.

**Build plan draft 1** — `context/specs/00-build-plan.md`. Units across five stages, three milestones, each with objective, boundary, dependencies and acceptance criteria per §49, now classified `CORE` / `ENABLER` / `ADJACENT`.

**Core mission absorbed** — `docs/01-core-mission.md` received. North Star is **Potential Annual Saving**. D-003 superseded by D-011; D-002 amended with `STALE_DATA`; D-012 (headline figure rules) and D-013 (slice extends to a saving opportunity) added.

**Saving Opportunity Model** — `docs/domain/03-saving-opportunity-model.md`. The object, lifecycle, a nine-category Circle 1 taxonomy with per-category calculation and refusal conditions, and the aggregation rules that stop the headline number being inflated. Six new open questions (N-07 … N-12).

---

## Blocked

Implementation cannot start. Critical path, in order of urgency:

| Blocker | Blocks |
|---|---|
| A-19 stack and deployment | Everything |
| A-20 permission model | U-02, and anything protected |
| A-01 balance projection strategy | U-07, the core ledger unit |
| N-03 consumption capture granularity | U-09 — very hard to backfill |
| N-04 catch-weight | U-04 and U-07 — ledger-shaping |
| N-01 finance integration contract | U-14, U-18 — all financial-impact work |
| **N-10 carrying-cost rate** | **Most of the recurring saving taxonomy** — determines whether the North-Star number is `CALCULATED` or `ASSUMED` |
| N-07 / N-08 / N-09 | The saving detectors and the headline figure |
| B-07 / N-06 pilot factory history | Whether planning returns real numbers at go-live |

---

## Next

1. Answer the six blockers above — the first three gate the critical path.
2. Domain model and scope doc reviewed by someone who knows the actual factory. A domain model validated only by its author is a hypothesis.
3. Remaining decision register proposals accepted or rejected — particularly D-001, the ledger.
4. Build plan approved.
5. Then: unit specifications, starting with U-01 and U-07.
6. Then, and only then: implementation.

---

## Log

**2026-08-06** — Project initialised. Product Bible received as the founding document. Factory Operating Model draft 1, open questions register, and decision register produced.

**2026-08-06** — Five of seven Tier 1 blocking questions answered: mixed manufacturing, inventory/warehouse manager as primary user, inventory + procurement + cost wedge, single site, finance owns valuation. D-005 superseded by D-008 — no costing engine is needed here, which is a significant scope reduction. First-release scope document and build plan draft 1 written. Six new scope-driven questions raised (N-01 … N-06). Still no code, per Bible §2 and §57.

**2026-08-06** — `01-core-mission.md` received and absorbed. North Star is Potential Annual Saving; operational management reclassified as ENABLER. Saving Opportunity Model written, including the aggregation guard that keeps the headline figure honest (range, weakest basis, deduplication, one-time separated from recurring, realised-versus-identified ratio). D-003 superseded, D-002 amended, D-011 … D-013 added. Build order unchanged — trust still precedes intelligence — but the vertical slice now extends to one quantified saving opportunity. Still no code.
