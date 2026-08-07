# Progress Tracker

> Updated whenever meaningful progress or a decision occurs. Honest state only — no aspirational entries.

**Current phase:** Phase 0 — Product architecture
**Current activity:** Part 2.1 **LOCKED**. Part 2.2 workshop reconciled against preliminary DP-01 … DP-08; awaiting resolution of two items that touch locked decisions.
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

**Locked financial-trust rules adopted** — the 16 rules of `docs/02-handoff-part1-locked.md`, recorded as D-014. They close N-08 (12-month annualisation minimum) and constrain A-03 (confidence from coverage, not constants).

**Mechanism 01 workshop** — `docs/domain/04-mechanism-01-expedite-premium.md`. Expedited freight / emergency purchase premium designed against all twelve required questions, stopping at eight business decision points. Key findings: the premium is a symptom with a price tag, not waste; most fixes require *more* stock, so the carrying-cost offset is mandatory; root cause is not in transactional data and needs a capture step in the procurement workflow; and in an Egyptian import context, un-normalised FX will manufacture large false opportunities (D-016).

**Part 2.1 decision lock reconciled** — D-017 … D-024 recorded. All eight Part 2 decision points closed. `04-mechanism-01-expedite-premium.md` rewritten; `03-saving-opportunity-model.md` reconciled; D-012 amended (deduplication), D-015 strengthened, D-016 superseded by D-024. The structural change: **avoidability weights rejected, so quantification moves from category level to intervention level** — a testable counterfactual over identified events, not a percentage over a total.

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
| **N-07 / F-01 separable freight capture** | **Gates mechanism 01 entirely** — without it, event counts rather than currency |
| ~~M-01 … M-08~~ | **CLOSED** by D-017 … D-024 |
| **A-09 FX — now Tier 1** (D-024) | Every financial comparison across periods |
| **F-01 … F-10 factory data** | Mechanism 01 cannot be quantified without them. `F-01` and `F-09` are the sharpest |
| ~~Q-03 / Q-04 / Q-05~~ | **ALL LOCKED** by D-025 / D-026 / D-028. Nothing in the design blocks Part 2.2 |

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

**2026-08-06** — Handoff `02-handoff-part1-locked.md` received. The 16 financial-trust rules adopted as D-014; they confirm D-011/D-012 and close N-08. Part 2 workshop executed for mechanism 01 (expedite premium): full design across the twelve required questions, stopping at eight decision points requiring business judgment. D-015 proposes lead-time correction as the defensible first slice — no assumed rates, no carrying-cost offset, no FX exposure in the causal claim, and verification entirely inside our own data. D-016 raises FX normalisation as mandatory and recommends escalating A-09 to Tier 1. Still no code.

**Note on missing inputs:** the handoff references `02-potential-annual-saving-engine-plan.md` and existing product audit/critique documents. Neither has been provided. `docs/domain/03-saving-opportunity-model.md` covers adjacent ground but is this project's own derivation, not the referenced source.

**2026-08-07** — Part 2.1 decision lock received and reconciled. Eight decisions recorded (D-017 … D-024), all eight Part 2 decision points closed. The largest change: numerical avoidability weights rejected — correctly, since they conflicted with already-locked rule 15 (confidence from evidence, never category constants). Quantification consequently moves from the category level to the intervention level: a testable counterfactual over identified events replaces a percentage over a total. Also new: `COST / EXPOSURE / RISK` as a first-class output that can never aggregate into Potential Annual Saving; the three-state evidence ladder; mechanism-level deduplication (amending D-012); and FX decomposition escalated to Tier 1.

Three conflicts flagged rather than silently resolved: `EARLY REALIZATION EVIDENCE` vs the locked Core Mission §6 lifecycle (`Q-04`); `COST / EXPOSURE / RISK` as class vs status (`Q-03`); and saving-model categories 4.1–4.7, which predate D-017 and still describe weighted calculations (`Q-07`). Part 2.1 design is ready to lock; the mechanism is not buildable until `F-01` … `F-10` are answered. Still no code.

**2026-08-07** — Q-03 and Q-04 locked as D-025 and D-026. `COST / EXPOSURE / RISK` becomes a distinct class rather than a status, so exposure cannot reach the North Star aggregation through a status change or a careless join. Evidence strength becomes an attribute alongside the lifecycle rather than a seventh state, preserving the Core Mission §6 vocabulary and keeping workflow state and belief strength orthogonal. D-027 elevates event-level counterfactual reasoning from a mechanism-01 correction to a standing design principle of the whole engine, which makes Q-07 mandatory rather than advisory.

Q-05 (promote four-way financial change decomposition to foundation F10) is **reported for decision, not decided**. Part 2.2 not started.

**2026-08-07** — Q-05 accepted as A′ and locked as D-028. **F10 — Financial Change Decomposition Capture Contract** added as a tenth cross-cutting foundation, deliberately scoped to capture only. The split follows the asymmetry that capture is irreversible while computation is reversible: dimensions not preserved at event time cannot be reconstructed, but an algorithm fixed from a single mechanism is premature abstraction. The universal decomposition calculation, formula and UI are deferred as `Q-08` pending a second mechanism. D-024 and D-012 reconciled; F10 added to the factory operating model, the build plan (new U-01b in Stage 0), and the finance integration contract (`N-01` must now carry the raw dimensions). Terminology is deliberate — it is a *capture contract*, never described as an engine.

Part 2.1 is ready for final lock. Part 2.2 not started. Still no code.

**2026-08-07** — Part 2.1 approved and locked by the product owner. Q-07, Q-08 and F-01 … F-10 retained as tracked non-blocking items.

**2026-08-07** — Part 2.2 workshop opened. Mechanism 02 identified from the approved taxonomy as **§4.4 purchase price variance** — specified, not invented, and confirmed by the U-18 sequencing line in the build plan. Workshop draft written to `docs/domain/05-mechanism-02-purchase-price-WORKSHOP.md`; **not a lock document**, and DP-01 … DP-08 are deliberately unanswered.

Three findings worth carrying into review: §4.4's existing formula `(current price − best comparable price) × annual volume` violates D-027 and must be replaced with an event-level counterfactual (W-01); the mechanism name conflates accounting PPV, which D-008 gives to finance, with procurement price opportunity, which is ours (DP-01); and unlike mechanism 01, whose evidence exists by necessity, this mechanism's evidence is the alternative that was *not* chosen — which exists only if someone recorded it (F-12, F-13). Eleven new factory-evidence requirements recorded (F-11 … F-21).

**2026-08-07** — Part 2.2 preliminary decisions DP-01 … DP-08 reconciled and challenged. Mechanism renamed **Procurement Price Opportunity**; accounting PPV stays with Finance under D-008.

Two findings touch locked decisions and must be settled before the Part 2.2 lock. **W-16:** D-020 controls double counting but nothing controls *contradiction* — mechanism 02 saying "buy more, save on price" while 4.1 says "you hold excess, buy less". Contradiction is the more damaging failure, because double counting inflates a number a reviewer may not audit while a self-contradicting recommendation pair destroys credibility on sight. **W-18:** D-025 locked exactly two object classes, and an evidence-capture recommendation is neither — it carries no currency at all.

Also flagged: D-020's locked text uses "PPV" for the mechanism now renamed, which under DP-01 reads as Finance's metric; amendment required rather than silent edit. Three challenges returned against the decisions themselves — payment terms should probably be exclusion-first rather than adjustment-first; price breaks are arguably a different economic mechanism needing a composite sub-type; and exposure records need materiality discipline or a devaluation will drown the product in correct, unactionable findings.

**Orders & Supply Movement** recorded as a tracked cross-cutting requirement, classified `ENABLER`, explicitly not a saving mechanism, not designed, not blocking.
