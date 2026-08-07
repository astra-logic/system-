# Progress Tracker

> Updated whenever meaningful progress or a decision occurs. Honest state only — no aspirational entries.

**Current phase:** Phase 0 — Product architecture
**Current activity:** Parts 2.1 and 2.2 **LOCKED**. DP-10 … DP-15 adversarially tested — **nothing locked**, awaiting review. Part 2.3 not started.
**Code written:** None. Correctly so.

---

## Build phase status (Bible §51 — sequence itself under challenge, see D-006)

| Phase | Name | Status |
|---|---|---|
| 0 | Product architecture | **Largely complete** — scope, domain model, build plan drafted |
| 1 | Context + specifications | **In progress** — mechanisms 01 and 02 locked; unit specs not yet written |
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

**2026-08-07** — Second Part 2.2 reconciliation. DP-03 reconciled to exclusion-first, so the mechanism can operate honestly with no financing rate in existence anywhere; `F-16` becomes a gate rather than an enhancement.

Five investigations returned. **Price breaks:** the boundary is drawn at the wrong object — it is not "price break" (a supplier term) but "does the counterfactual change quantity" (an economic property). Three price-break-shaped cases involve no quantity change at all, including *break earned but not applied*, which is the strongest evidence case in the whole mechanism; moving it out would exile it to a mechanism that does not exist. Recorded as `DP-09`, requiring resolution before lock. **Evidence model:** three independent gates with confidence computed separately, so no label ever becomes a number; an unestablished dimension is explicitly not a pass. **Evidence gap:** represented outside the Opportunity hierarchy entirely, leaving D-025 untouched — and it retroactively gives mechanism 01's `F-01` somewhere to live. **Contradiction control:** `(item, site, period)` tested and found insufficient on five counts; replaced with a typed intervention signature — subject, affected dimensions, direction per dimension, effect window. **Exposure:** the flooding problem partly self-solves under DP-04's own rule, since systemic movement offers no per-item alternative and is therefore one finding about a cause rather than thousands about items. Surfaced a late consequence of D-025: exposure has nothing to approve, so whether it carries the D-011 lifecycle is now open. **Adjudication:** independence scales with the claim — detection needs the buyer's context, currency quantification needs someone independent of the price decision. Where no independent adjudicator exists, self-adjudication recorded as a factual confidence condition is permitted by rule 15 and requires no org-chart cooperation. First concrete role requirement produced for `A-20`.

**2026-08-07** — Final Part 2.2 reconciliation. **W-25:** contradiction control is architecture C — mechanism-specific control is not merely weaker but structurally impossible, since a mechanism cannot see the other side of a cross-mechanism contradiction. Universal: the invariant, signature vocabulary, detection test, allowed resolutions. Local: populating the signature. D-020 extended by cross-reference, not amended. A distinguishing principle emerged for placement — F-series foundations govern what must be *captured from reality*; the saving model governs what may be *asserted about it* — so this is not a new F-foundation.

**W-26:** recommend splitting into Observed Cost (historical, `ACTUAL`, no lifecycle) and Exposure/Risk (forward-looking, `FORECAST`/`ESTIMATED`, may carry mitigation). The decisive argument is a provenance defect rather than taxonomy preference: one class mixing actual past spend with forecast future risk makes any aggregate `FORECAST` under D-002's weakest-basis rule, understating the certainty of the historical half invisibly. **This touches D-025 and is not being done** — recorded as `W-33` requiring explicit amendment.

**DP-09:** adversarial test across all twelve cases — boundary survives 12/12, and surfaced four refinements. Quantity must be scoped to a *window* not an order, or volume rebates and annual agreements are ambiguous. The boundary classifies which mechanism; the comparability gates still decide whether anything is quantifiable — they compose rather than compete. Taxonomy §4.5 "consolidation" is ambiguous, spanning supplier consolidation (mechanism 02) and temporal consolidation (quantity mechanism), and needs splitting. And annual-volume agreements create **commitment risk** — neither price nor inventory, owned by no mechanism.

**2026-08-07** — W-25 locked as **D-029** (contradiction control as a cross-cutting saving-model rule, not an F-foundation; D-020 gains a cross-reference, substance unchanged) and DP-09 locked as **D-030** (mechanism boundary is the counterfactual's effect on quantity over the relevant window; boundary determines mechanism, gates determine quantifiability).

Formal decision report written for W-33, W-36 and W-35. **No locked decision amended — D-025 stands exactly as locked.**

The report's central finding: **W-33's alternatives B and C are not competing options but orthogonal axes.** B asks where these objects sit relative to `Opportunity`; C asks whether Cost and Exposure are one thing or two. Each fixes a different defect — B fixes lifecycle inheritance, C fixes meaningless aggregation — so only their composition (option D) closes both. Alternative A fails by D-025's own principle: avoiding a meaningless aggregate under A requires a discipline, and D-025 exists precisely because discipline eventually fails. Option D is a **hardening** of D-025 rather than a relaxation, since exposure moves further from Potential Annual Saving.

W-36 resolves to Exposure/Risk with no new mechanism, and produced a clarification of D-014 rule 6's scope: certain incremental costs are netted, uncertain future obligations are disclosed as linked exposure — netting a probability against a certainty would require inventing a probability. W-35 found a **third** meaning of "consolidation" — shipment consolidation, whose economic effect is freight cost and which sits adjacent to mechanism 01. Both W-36 and W-35 surfaced the same pattern (`W-45`): an Opportunity may create an Exposure that must be disclosed rather than netted.

**2026-08-07** — W-33 and W-36 accepted. Proposed D-025 amendment written with verbatim before/after text and a verified impact inventory across five decisions and seven documents. **Nothing applied — D-025 stands exactly as locked.**

One thing blocks the amendment and was surfaced rather than assumed: the accepted tree shows three children of `FINDING`, but W-18 placed `EVIDENCE GAP` outside the Opportunity hierarchy and it is absent from that tree. Three readings are possible and materially different — fourth child of `FINDING`, outside `FINDING` entirely, or inadvertent omission. Recorded as `W-46`; the amendment is drafted for the first reading and marked as such.

**W-35** produced a correction to my own earlier recommendation. "Split §4.5 into three" was wrong phrasing — the analysis shows **two homes and one gap**. Supplier consolidation is a counterfactual shape inside mechanism 02, not a new mechanism; temporal consolidation belongs to the future quantity mechanism and is currently the least quantifiable of the three, depending on two unresolved finance-owned inputs; shipment consolidation is genuinely unowned but **not yet justified as a mechanism**, being gated by `F-01` anyway and of unmeasured materiality. It also revealed that D-030's boundary does not classify logistics cost — not a defect, since D-030 was locked to separate price from quantity and does that correctly.

**W-45** tested 5/5 valid across supplier concentration, commitment, inventory, logistics disruption and FX. Two instructive results: a price-break intervention produces both a *nettable* certain cost and a *disclosable* uncertain risk, so netting and disclosure coexist rather than competing; and FX exposure exists independently of any opportunity, proving the link is optional on the exposure side. Recommended as a saving-model rule establishing a linked-finding relationship. Exposure carries **no** intervention signature — which follows from the already-accepted principle that a mitigation with a defensible counterfactual *becomes* an Opportunity.

**2026-08-07** — W-46 resolved as option (ii): `EVIDENCE GAP` sits **outside** the Finding hierarchy, because it is a claim about whether the system has sufficient evidence to make a financial claim rather than a claim about the factory's money.

**D-025 amendment applied.** The original decision block and binding consequence are **preserved verbatim inside the entry**, quoted and labelled, with the amendment stated explicitly alongside — history is not rewritten. Propagated to D-021 (customs now has two destinations: demurrage already paid is a bill settled, forward congestion risk is a condition carried), D-012, the saving model, mechanism 01, code standards, the build plan and architecture.

**D-031** locks the Opportunity → Exposure linked-finding relationship with `CREATES` cardinality, disclosure never netting, and no probability scores. **D-032** retires and redistributes taxonomy §4.5 without creating a new mechanism; shipment consolidation is preserved as a **future-domain gap** rather than deleted, and the logistics-cost domain is recorded so it is not later rediscovered as a defect in D-030.

W-47 and W-48 resolved. W-47: the Exposure record is **never created until the intervention is actioned** — before that the prospective consequence is an attribute of the Opportunity's disclosure, which avoids orphans and avoids deletion, and preserves the useful history that a recommendation was declined partly because of the risk it would create. W-48: each Opportunity creates its **own** record and *current exposure* is a derived view, exactly as balances are projections of the ledger — merging would destroy which action caused what.

**W-49 remains open and is the only outstanding decision.** Recommended as a distinct `DEEPENS` relationship type, mandatory. It **extends** the accepted cardinality — an exposure gains 0..n deepening Opportunities alongside 0..1 creating — so it was flagged rather than applied. D-031 carries `CREATES` only.

**2026-08-07 — PART 2.2 LOCKED.** `docs/domain/09-part-2.2-LOCK.md` is the authoritative statement. W-49 accepted and applied: `DEEPENS` added to D-031 as a distinct relationship type, never counted as `CREATES`, carrying no probability, percentage, threshold or monetary value.

A consistency audit was run **before** locking rather than after, and found **six genuine stale references** — not a rubber stamp. D-021's decision body still read as a single destination despite its amendment note; the Q-03 and M-05 resolutions in the open-questions register still described the pre-amendment class model; two rows in mechanism 01 still named the old class; and the mechanism-02 workshop carried a dozen pre-amendment references. All fixed, except the workshop, which received a superseded-by header rather than a rewrite — its references are correct as a record of what was thought at the time, and the same discipline that preserved D-025's original text applies to it.

Verified clean: no uncertain Exposure/Risk can reach Potential Annual Saving; no probability, threshold, confidence constant or invented monetary value exists anywhere in mechanism 02; shipment consolidation remains a future-domain gap and has not become a mechanism; and every amended decision preserves its original text verbatim, quoted and labelled.

`Q-07` is called out in the lock as **growing debt** — categories 4.1–4.7 still carry percentage-over-total formulas, and each new mechanism designed under D-027 widens the gap.

**2026-08-07 — Q-07 audit.** Every remaining taxonomy category audited against D-027 and the two locked mechanisms. `docs/domain/10-Q07-saving-model-reconciliation.md`. **Nothing rewritten, nothing locked.**

**No category passes as written.** 4.9 comes closest — its conclusion survives, its classification changes.

Three findings go beyond the expected formula problem. **4.1's "working capital release" is a cash-flow timing effect, not a benefit of its principal**: you cannot un-buy stock, so the real intervention is deferring future purchase, and the actual value is the financing cost over the deferral period plus carrying avoided — not the 200,000 EGP headline. D-012 already keeps the principal out of Potential Annual Saving, but it is still displayed as a magnitude, and a magnitude reads as a benefit. **4.3 applies an average carrying rate to a marginal decision**: if the warehouse is not full, the marginal storage cost of dead stock may be near zero, and finance's average rate assumes an alternative use of space that may not exist. **4.7 has a materially stronger form available** — backtested rather than modelled safety stock, checkable against recorded history event by event, needing no service-level assumption and no distributional one.

**4.2 is not a mechanism at all.** It has no independent intervention — the answer is always 4.1's or 4.3's — so left as a category it would either produce nothing or double-count. Recommended for retirement as a detection signal.

D-029 and D-031 both earned their keep on categories they were not designed for: the 4.7-versus-mechanism-01 contradiction is the exact case predicted in Part 2.1 §8, and D-031 turns 4.7's advisory warning about hidden stockout risk into a structurally enforced disclosure.

Orders & Supply Movement confirmed as a dependency of **every remaining category except 4.2** — and lead-time variability, 4.7's central input, *is* the order journey.

**2026-08-07 — DP-10 … DP-15 adversarial decision report.** `docs/domain/11-DP10-DP15-adversarial-decision-report.md`. Nothing locked, no rate or threshold invented.

**DP-13 was the important one, and the naive backtest did not survive.** *"Stock never fell below L"* proves nothing on its own — the floor may have been propped up by expedites, escalations, manual overrides, production rescheduling, substitutions, or demand suppression. Several of those are wholly unobservable in release 1: production is out of scope, and **there is no record of an order never placed**. The honest claim is therefore *"no stockout occurred and no recorded intervention explains the floor"* — absence of evidence of insufficiency, not evidence of sufficiency. It also exposed a dependency: **4.7's backtest is worthless without Mechanism 01's expedite capture**, so `F-01` gates both.

**DP-10 corrected my own framing twice.** For excess stock the outflow is **delayed, never avoided** — permanent cancellation only applies to stock that will never be consumed, which is dead stock, not excess. And the benefit is **one-time, not recurring**: you can only reduce the same excess once. Recurring benefit belongs to fixing the policy that created it, which is 4.7. That resolves the 4.1/4.7 relationship, which was flagged as double counting but is really a temporal distinction — one-time correction versus recurring prevention.

**DP-15 showed the marginal-versus-average framing was wrong.** Carrying cost is not one thing; the question is which *components* apply to a given decision. And **disposing of dead stock does not free capital** — the money was spent when it was bought, and if the stock is worthless the capital is gone rather than tied up. Since capital is usually the largest component of any carrying rate, **4.3 may be a far smaller opportunity than it appears.**

Three candidate cross-cutting rules surfaced: a financial rate must be *fit for the decision*, extending D-023 from "never invent" to "never misapply"; asymmetric valuation must be presented rather than hidden, since a quantified gain beside an unvaluable risk biases the decision structurally; and D-031 may need a `MITIGATES` type, since an Opportunity that reduces an exposure currently has no way to say so.

⚠ **D-011's single `Owner` field is demonstrably insufficient** — finding, action and data ownership are three distinct accountabilities. Flagged, not changed.
