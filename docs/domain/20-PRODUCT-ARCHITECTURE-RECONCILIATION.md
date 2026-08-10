# 20 — Product Architecture Reconciliation

> ## 📐 PLANNING AND ANALYSIS ONLY — 2026-08-09
> **No code written. No schema changed. No UI designed. No locked decision modified. Block 8 not started.**
> Everything below is read from the repository as it stands after Blocks 1–7.

**The headline finding is in §4.** Production Planning collides head-on with two locked decisions, and the collision is not a detail — **it inverts the system's model of demand.** It is resolvable, but only by explicit amendment, and this document stops at the proposal.

---

# 1. CURRENT SYSTEM REALITY

**34+ TypeScript files · 163 tests passing · typecheck clean · production build clean · 7 routes rendering.**

| Layer | State |
|---|---|
| **Exact arithmetic** | Money and quantity are branded `Decimal`s; the constructors **reject a JS number at runtime**; `numeric` columns are never parsed to float |
| **Ledger (D-001)** | Immutable, double-entry by construction, point-in-time reconstruction, duplicate ingestion refused at the door, opening balance segregated, returns distinguished from reversals, catch-weight dual quantity |
| **Ledger verification** | Per-`(item, location)`, projection recomputed by independent SQL aggregation. Ten adversarial cases prove the invariant has content |
| **Provenance (D-002)** | Envelope on every asserted value, contagion, exclusion as a separate operation, `INSUFFICIENT_DATA` as a designed state |
| **FX (D-042)** | Each amount normalised at **its own effective date** |
| **Rate fitness (D-023)** | Structured `purpose`; mismatch **blocks**. Two active rates for one component also block |
| **Mechanism 01** | Lead-time-correction slice. Seven gates, event-level counterfactual, derived correction value |
| **The offset (Block 7)** | Incremental carrying cost derived from the observed position path, component-wise |
| **Aggregation** | Evidence-partition range, exclusions disclosed, one-time never summed |
| **Persistence** | Findings, gates, signatures, evidence, gaps — durable, superseded never overwritten |
| **Review** | Approve / reject, baseline at `APPROVED`, adjudicator independence with conflict recorded. **No path to `REALIZED`** |
| **Import** | Spreadsheet → parse → validate → ledger, through the same `postMovement` as everything else |
| **Contradiction** | Service over persisted findings; blocks release of both sides |

**Live figure on the demo corpus:** gross **1,405,180.00 EGP** · offset **21,311.33** · net **1,383,868.67**, basis `USER_DEFINED`.

## 1.1 Tables defined with no write path

`uom_conversions` · `po_line_changes` · `observed_costs` · `exposures` · `finding_links` · `outcomes`.

Four of these are **correct absences**: Mechanism 01 produces no observed cost and no exposure record *yet* (D-031 W-47 says the exposure record is not created until the intervention is actioned), and `outcomes` cannot exist until D-022's twelve months elapse. **Two are genuine gaps:** `po_line_changes` (U-12 requires change history) and `uom_conversions` (F6 requires per-item conversions).

---

# 2. LOCKED DOMAIN FOUNDATION — what must not be casually changed

| | Why it is load-bearing |
|---|---|
| **D-001** ledger | Every backtest, every position path, every verification rests on it |
| **D-002** provenance | The contagion floor is what stops a forecast presenting as a fact |
| **D-007** scope | ⚠ **Production, BoMs, MRP and capacity are OUT.** See §4 |
| **D-008** finance owns valuation | Removes the largest piece of original scope |
| **D-010** demand is observed consumption | ⚠ **"No MRP." Synthesising demand is fabrication.** See §4 |
| **D-014** the 16 rules | Every saving figure |
| **D-017 / D-027** event-level counterfactual | No category percentage may ever return |
| **D-019** evidence ladder | Currency only at `ANNUALIZATION_ELIGIBLE` |
| **D-020 / D-029** dedup and contradiction | Two separate controls, different failure modes |
| **D-025** finding classes | Structural, not a status — exposure cannot become a saving |
| **D-031** `CREATES` / `DEEPENS` / `MITIGATES` | Disclosure, never netting |
| **D-035** carrying cost component-wise | A whole rate is **invalid**, not imprecise |
| **D-036** one financing channel | Deferral and capital are the same quantity |
| **D-041** the net declares its own incompleteness | |
| **D-042** FX at each amount's own date | |
| **D-043 / D-044 / D-046** exclusion · range · annualisation | The headline's construction |
| **D-047 / D-048** stack and catch-weight | Ledger-shaping |

> **These are not preferences.** Each was reached adversarially and several were reached by finding the opposite conclusion first.

---

# 3. CURRENT PRODUCT SURFACE

## 3.1 Dashboard *(currently `/` — "Today")*

| | |
|---|---|
| **Purpose** | Answer *"what needs my attention, and what is it worth?"* in one screen |
| **Primary user** | Inventory / warehouse manager (D-007), with the finance manager as second reader |
| **Jobs-to-be-done** | See the headline and **what it excludes** · see what is blocked · see what needs a decision · see what data is missing and what that costs |
| **Inputs** | Persisted findings · evidence gaps · contradictions · ledger counts |
| **Outputs** | Headline range with basis and caveats · excluded findings with reasons · attention counts |
| **Dependencies** | Persistence · aggregation · contradiction service |
| **Status** | **Implemented.** Reads persisted findings, survives restart |

## 3.2 Inventory

| | |
|---|---|
| **Purpose** | Make stock **true**, and make every number say which quantity it is |
| **Primary user** | Warehouse / inventory manager |
| **Jobs-to-be-done** | Trust the on-hand figure · see available vs held vs reserved · reconstruct any past instant · see catch-weight items in their real unit |
| **Inputs** | Ledger movements · item master · locations |
| **Outputs** | On hand · reserved *(structurally zero, shown)* · quality hold · available · master lead time |
| **Dependencies** | Ledger · F3 vocabulary |
| **Status** | **Implemented, read-only.** No counting UI, no manual movement UI |

## 3.3 Orders & Supply

| | |
|---|---|
| **Purpose** | The evidence spine — what was ordered, promised, shipped, received, delayed, expedited |
| **Primary user** | Buyer / procurement |
| **Jobs-to-be-done** | See what is in flight and when it is really expected · see instalments separately · see delay against promise · see which orders were expedited and why |
| **Inputs** | POs, lines, receipts *(including partials)*, shipments, ETAs, port milestones |
| **Outputs** | Order journey · measured lead time · delay flags · ETA **as a forecast, labelled** |
| **Dependencies** | The ledger for receipt movements |
| **Status** | **Implemented, read-only.** No PO creation, no receiving workflow, no change history |

## 3.4 Production Planning

| | |
|---|---|
| **Purpose** | ⚠ **Undetermined. See §4.** |
| **Primary user** | Production planner — **a role the system does not currently model** (D-051 has five roles; planner is not one) |
| **Status** | **Not implemented, not designed, and not currently permitted by D-007 and D-010** |

## 3.5 Analytics

| | |
|---|---|
| **Purpose** | Answer *"is this working?"* — realisation vs identification, where money goes, where evidence is thin |
| **Primary user** | Management / finance |
| **Jobs-to-be-done** | See realised vs identified · see spend by root cause · see which evidence gaps cost the most · see supplier reliability |
| **Inputs** | Findings, decisions, outcomes, expedite events, receipts |
| **Outputs** | Trends, ratios, distributions |
| **Dependencies** | ⚠ **`outcomes` has no write path**, and D-022's twelve months have not elapsed for any finding |
| **Status** | **Not implemented.** The realised-vs-identified ratio exists on the dashboard; nothing else |

## 3.6 Profile

| | |
|---|---|
| **Purpose** | Who am I, what may I do, what is mine to act on |
| **Jobs-to-be-done** | See my role(s) · see findings where I am Finding / Action / Data owner · see what awaits my adjudication |
| **Dependencies** | ⚠ **Authentication does not exist.** `adjudicator` is a typed name, not a session |
| **Status** | **Not implemented** |

## 3.7 Settings

| | |
|---|---|
| **Purpose** | Where the factory's *answers* live — not where the system's behaviour is configured |
| **Jobs-to-be-done** | Record factory facts (`F-33`, `F-40`, `F-46`) · record finance rates **with their purpose** · map import columns · assign roles and owners · see which registered questions are still unanswered |
| **Outputs** | ⚠ **An "unanswered questions" list is arguably the most valuable screen in the product** — it tells the factory exactly what to go and find out, priced by observed spend |
| **Status** | **Not implemented.** `factory_facts` and `financial_rates` are written only by the seed |

---

# 4. PRODUCTION PLANNING RECONCILIATION

## 4.1 ⚠ The collision, stated plainly

Two locked decisions say, in terms:

> **D-007:** *"Production, maintenance, full quality, BoMs, MRP and capacity are out."*
> **Scope §3:** *"**BoMs are out, and this is load-bearing.** Without them there is no material requirements calculation, which is why planning is reorder-point based rather than MRP."*
> **D-010:** *"The demand signal is historical consumption. Planning is reorder point / min–max… **No MRP.** **Rejected:** synthesising demand from forecasts the factory has not made — fabrication, and forbidden by §47."*

**Production Planning as normally understood requires all three of the things these decisions exclude:** a bill of materials, forward demand, and a requirements explosion.

⚠ **This cannot be added quietly.** It requires an explicit amendment to D-007 and D-010, presented and approved — exactly as D-001, D-002, D-011, D-014, D-023 and D-031 were amended.

## 4.2 The deeper consequence — it inverts the demand model

This is the part that matters more than the scope line.

```
TODAY          demand is OBSERVED        backward-looking     basis ACTUAL
WITH PLANNING  demand is PLANNED         forward-looking      basis FORECAST
```

Under D-002's contagion rule, **anything computed from a production plan is at best `FORECAST`.** And D-044 partitions the headline range on exactly that boundary: the lower bound is claims whose every input is `ACTUAL` or `CALCULATED`.

> ⚠ **Introducing planned demand would move a class of findings out of the headline's lower bound and into its upper bound.** Not wrong — but it would change the number the product is judged on, and it must be a decision rather than a side effect.

## 4.3 What Production Planning could mean — four levels, not one

**Do not assume.** These are genuinely different products with different data requirements.

| Level | What it is | Requires | Compatible today? |
|---|---|---|---|
| **L0 — Feasibility check** | *"Can I build X units of this finished good with what I have and what is coming?"* A **read-only question**, not a plan | **BoM structure only** | ⚠ Needs the BoM amendment. Needs nothing else |
| **L1 — Requirements planning** | Net requirements → purchase suggestions, time-phased | BoM + **forward demand** + lead times | Needs BoM **and** the demand amendment |
| **L2 — Scheduling / capacity** | Sequence on machines, finite capacity | Routings, work centres, calendars | ⚠ **A different product.** Not recommended |
| **L3 — Execution** | Work orders, backflush, WIP | All of the above + shop-floor capture | ⚠ **A different product.** Not recommended |

**`RECOMMENDATION` — L0 first, then L1, and stop there.** L0 is the smallest thing that answers a real planner question, needs one new concept (BoM structure), invents no demand, and produces no forecast-based saving claim. **It is a question the system answers, not a plan the system makes.**

## 4.4 The relationship chain, classified

| Relationship | Class | Note |
|---|---|---|
| Production Planning → **Demand / requirements** | **F — new domain decision** | Where does forward demand come from? Sales orders? A planner's stated plan? **Never a forecast we synthesise** (§47, D-010) |
| Demand → **Finished goods** | **C — missing** | The item master has no finished-good concept, no distinction from raw material |
| Finished goods → **BoM / materials** | **C + F** | ⚠ **The load-bearing exclusion.** No BoM exists anywhere in schema or code |
| BoM → **Raw materials** | **A — already supported** | The item master already handles process and discrete materials (D-009) |
| Raw materials → **Inventory** | **A — already supported** | The ledger, position path, F3 vocabulary |
| Inventory → **Safety stock** | **B — partially** | Reorder point exists as an item field concept; **no safety-stock parameter is modelled**; `N-11` service level is constrained to *policy the factory states* |
| Safety stock → **Lead times** | **A — supported, and measured** | Mechanism 01 already compares master lead time to observed reality |
| Lead times → **Purchase requirements** | **C — missing** | No requirement object exists |
| Purchase requirements → **Purchase orders** | **B — partially** | POs exist and are read; **nothing creates them** |
| POs → **Supplier availability** | **E — factory data** | `F-20` approved-supplier list, `F-42` will suppliers accept changed patterns |
| POs → **Orders & Supply Movement** | **A — already supported** | Receipts, partials, shipments, ETAs, delays |
| → **Production feasibility** | **C — missing, and it is L0** | The one genuinely new *capability* worth building |
| → **Costs** | **B — partially** | Cost reference exists (D-008); **no BoM roll-up**, and rolling up cost would edge toward the valuation D-008 gave finance |
| → **Potential Annual Saving** | **D — architecturally unclear** | ⚠ See §4.5 |
| → **Risks / Exposure** | **B — partially** | `EXPOSURE` class exists and is unwritten; production planning would create the first genuine exposure producer |
| → **Analytics** | **C — missing** | No analytics surface exists |
| → **Dashboard decisions** | **A — supported** | The finding → decision loop works today |

## 4.5 ⚠ Is Production Planning a saving mechanism?

**`ASSUMPTION` — no, and this should be decided explicitly rather than drifting.**

By the same reasoning that classified Orders & Supply Movement: it produces no counterfactual of its own. It is an **`ENABLER`** — but an unusually powerful one, because of what it *unblocks*:

| Currently blocked | Why | What production data would do |
|---|---|---|
| **§4.9 stockout valuation** | D-007 removes production impact, so a stockout has no attributable cost | Would make it **valuable** — the single largest unvalued exposure in the model |
| **D-037's blind spots** | Production rescheduling and demand suppression are structurally unobservable | Rescheduling becomes **observable**; suppression partially so |
| **Verification at *Actual Outcome*** | The operating chain is broken there (D-007) | Would **repair the chain**, enabling production-side realisation |
| **M03 subtype C deferral** | "Excess with no pending order produces no Opportunity" (D-033) | Forward requirements mean there is always something to defer against |
| **`B2-02`** | Is there a class of items whose demand cannot be rescheduled? | Directly answerable |

> ⚠ **This is the strategic finding of the review.** Production Planning is not a seventh module competing for effort. It is the **key that unlocks the most currently-blocked domain in the system** — and it does so as an enabler, without becoming a saving mechanism itself.

**It should not be built for that reason alone.** The client asked for it as a capability; that it also unblocks the exposure model is a consequence to note, not a justification to expand scope.

## 4.6 A dormant inconsistency, reported not fixed

**Code standard 13 reads:** *"A manufacturing order freezes its BoM and routing version at release. (C10)"*

C10 is production, which D-007 excludes. **The standard governs a domain that does not exist.** Harmless today; worth knowing it is already there, because it is the correct rule and it pre-dates the exclusion.

---

# 5. CROSS-MODULE INFORMATION FLOW

```
                        ┌──────────── SETTINGS ────────────┐
                        │ factory facts · finance rates    │
                        │ (with purpose) · column maps     │
                        │ roles & owners                   │
                        └───────────┬──────────────────────┘
                                    │ answers, never defaults
                                    ▼
   IMPORT ──▶ LEDGER ──▶ INVENTORY ──┬──▶ DETECTION ──▶ FINDINGS ──▶ DASHBOARD
   (files)    (truth)   (position)   │    (mechanisms)   (durable)    (attention)
                  ▲                  │          ▲             │
                  │                  │          │             ▼
          ORDERS & SUPPLY ───────────┘──────────┘         REVIEW ──▶ BASELINE
          (evidence spine)                                   │
                  ▲                                          ▼
                  │                                      OUTCOMES ──▶ ANALYTICS
        ┌─────────┴──────────┐                          (12 months)   (is it working?)
        │ PRODUCTION PLANNING│  ⚠ proposed, not permitted
        │ requirements       │
        └────────────────────┘
                                 PROFILE ──▶ what is mine to act on
```

**Rules the diagram encodes:**

- **Nothing reaches the ledger except through `postMovement`.** Import has no fast path.
- **Settings supplies answers, never defaults.** An absent answer blocks; it never becomes "no".
- **Detection reads; it never writes to the ledger.**
- **Findings are durable and versioned.** The dashboard reads what was recorded, not a fresh computation.
- **Analytics is downstream of outcomes**, which are downstream of a twelve-month window that has not elapsed.

---

# 6. DECISION FLOW

```
DATA          import → validate → refuse or post → ledger        [ACTUAL]
   ↓
DETECTION     replay recorded events against a counterfactual    [event-level, D-027]
   ↓
EXPLANATION   gates: PASS / FAIL / UNESTABLISHED, each with a reason
              — unestablished is never a pass
   ↓
RECOMMENDATION  stated intervention + testable counterfactual
                + net that declares its own incompleteness       [D-041]
   ↓
USER DECISION   adjudicator independent of the underlying decision
                — or the conflict is recorded, never hidden      [DP-07]
   ↓
ACTION          baseline captured BEFORE the action              [D-011]
                — inputs AND method, so it can be recomputed
   ↓
OUTCOME         measured over 12 months, confounders considered  [D-022]
                ⚠ NOT YET REACHABLE — and structurally so
   ↓
LEARNING        realised vs identified · which gates block most
                · which evidence gaps cost most
```

⚠ **The loop is complete in design and open in practice at *Outcome*.** That is correct: no finding this system has produced is twelve months old. **Analytics cannot be honest until that window closes for at least one finding** — which is a fact about time, not a gap to close by building.

---

# 7. WHAT IS ALREADY BUILT — mapped to product areas

| Area | Built | Not built |
|---|---|---|
| **Dashboard** | Headline with caveats, exclusions, attention counts, evidence gaps | Trends, drill-through, per-user view |
| **Inventory** | Position at any instant, F3 vocabulary, catch-weight, verification | Counting, manual movements, lot/serial views, item master editing |
| **Orders & Supply** | Order journey, partials, measured lead time, ETA as forecast, milestones | PO creation, receiving workflow, change history, supplier scorecards |
| **Production Planning** | — | Everything |
| **Analytics** | Realised-vs-identified ratio only | Everything else |
| **Profile** | — | Everything — no authentication exists |
| **Settings** | Tables exist; seed writes them | Every screen |
| **Engine** *(not a user area)* | Mechanism 01 end to end, offset, aggregation, contradiction, persistence, review, baseline | Mechanisms 02 and 03 |

---

# 8. WHAT IS MISSING

## 8.1 Implementation gaps *(we can build these; nothing blocks)*

Authentication and role enforcement · `po_line_changes` write path *(U-12 requires it)* · `uom_conversions` write path *(F6)* · counting and manual movements · PO creation and receiving workflow · Settings screens · Profile · Analytics surface · `outcomes` write path *(usable only after 12 months)* · exposure records at action time *(D-031 W-47)*.

## 8.2 Factory-data gaps *(only the factory can close these)*

`F-01` freight separability · `F-06` how an expedite is recognised · `F-07` FX history · `F-08` carrying components **with purpose** · `F-09` lead-time quality · `F-41` partial receipts · `F-45` PO author and approver · `F-46` insurance basis · `F-47` handling marginality · `N-01` finance contract · `N-09` staleness threshold · `B-07` a real dataset.

## 8.3 Domain questions open

`Q-09`…`Q-12` *(Block 1)* · `Q-13` adjudicator independence · `Q-14` demand window · `Q-15` handling on a level change · `B2-02`…`B2-04` · `B3-01`…`B3-03` · `A-02` reservation · `A-03` confidence · `A-18` excess↔dead.

**Plus the new Production Planning decisions in §12.**

## 8.4 Architecture gaps

**No authentication layer** — the largest single gap, and it gates Profile, Settings and any real adjudication.
**No background execution** — detection runs synchronously in a request; acceptable at this scale, not forever.
**No migration discipline beyond `db-push`** — fine now, not fine with a live factory.
**Six `PROPOSED` decisions** *(D-004, D-006, D-010, D-012, D-013, D-015)* still sit beneath locked ones. ⚠ **D-010 is one of them — and it is precisely the decision Production Planning must amend.**

## 8.5 Future product scope *(deliberately not now)*

Mechanisms 02 and 03 · the decomposition engine `Q-08` · multi-site · the logistics-cost domain · AI features · executive dashboard · maps and supplier location.

---

# 9. ODOO / ORACLE GAP ANALYSIS

**Not feature count.** Each advantage below is a specific workflow where the traditional product fails a factory manager, and each states what backend capability it needs and whether we have it.

### 9.1 A number that carries what is wrong with it

**Traditional problem.** Odoo shows inventory valuation and a stock-ageing report as plain numbers. Oracle shows a KPI with a target. Neither states what the figure rests on, how old the underlying cost is, or what it omits. A finance manager cannot tell a solid number from a fragile one.
**Ours.** Every value carries basis, `as_of`, coverage facts and limitations; the headline is an **evidence partition** — the lower bound is what is solid, the upper adds what is estimated.
**Why simpler.** The reader stops asking "can I trust this?" because the number answers it.
**Backend.** Provenance envelope with contagion. **EXISTS.** **MVP.**

### 9.2 Refusal as a feature

**Traditional problem.** A missing carrying-cost rate becomes a config default; a missing lead time becomes zero or a system-wide default. The report still produces a number, and nobody knows it was invented.
**Ours.** `INSUFFICIENT_DATA` is a designed, rendered state that **names what was missing**. No default exists anywhere — not 15%, not 20%, not any value.
**Why simpler.** One less category of silent error to audit for.
**Backend.** `requireRate`, gates, `INSUFFICIENT_DATA` propagation. **EXISTS.** **MVP.**

### 9.3 Root cause captured at the moment, not reconstructed later

**Traditional problem.** Both systems record that a PO was expedited and what it cost. Neither records **why**. Six months later nobody can say whether it was a supplier failure, a planning error or a wrong lead time — so the cost total is not actionable.
**Ours.** Root cause is a structured field captured **in the buyer's workflow at the event**, and classification coverage is a measured input to evidence strength.
**Why simpler.** One dropdown at the moment of the decision replaces a quarterly forensic exercise.
**Backend.** `expedite_events.root_cause`, D-018 categories. **EXISTS in the model; the capture UI does not.** **MVP — this is the workflow change that makes Mechanism 01 work.**

### 9.4 Lead time measured against reality, not maintained by hand

**Traditional problem.** In every ERP, lead time is a master-data field somebody typed years ago. Both systems plan from it and neither checks it. A wrong lead time silently generates expedites forever.
**Ours.** The system compares the master value to observed order-to-receipt, proposes the smallest correction covering every attributed event, and shows the events that justify it.
**Why simpler.** The planner is handed a specific number and the evidence for it, instead of a report to interpret.
**Backend.** Mechanism 01. **EXISTS, end to end.** **MVP.**

### 9.5 Contradiction control across recommendations

**Traditional problem.** Odoo's reordering rules can argue for a larger order quantity to hit a supplier discount while its ageing report argues to cut the same stock. Both are "correct"; they live on different screens; **nobody reconciles them.** The buyer picks one and the other silently loses.
**Ours.** Every recommendation declares an intervention signature. Opposed directions on the same subject, dimension and window **block release of both sides** until resolved.
**Why simpler.** The system refuses to hand a user two instructions that cannot both be followed.
**Backend.** Signatures + contradiction service over persisted findings. **EXISTS.** **MVP.**

### 9.6 Duplicate ingestion refused at the door

**Traditional problem.** Re-importing a corrected spreadsheet is the most common real operation in the first months of any ERP deployment, and it double-posts. You discover it at the next stock count, weeks later.
**Ours.** Every movement carries a source-system natural key; a second movement bearing a recorded key is **refused**, not accepted and corrected. Enforced by the database.
**Why simpler.** Re-uploading is safe, so the user can fix and retry without fear.
**Backend.** Natural key + unique index + import path. **EXISTS.** **MVP.**

### 9.7 FX at each amount's own date

**Traditional problem.** ERPs revalue at period rates for accounting, but operational comparisons quietly use a current or average rate. In an economy with EGP depreciation, a premium that is entirely currency movement presents as an operational deterioration — and someone gets blamed for it.
**Ours.** Each historical amount is normalised at the rate effective on **its own** effective date; where no rate exists on or before that date, there is **no comparison at all**.
**Why simpler.** Trends mean what they appear to mean.
**Backend.** Effective-dated FX with per-amount lookup. **EXISTS.** **MVP.**

### 9.8 Approval is not realisation

**Traditional problem.** Savings-tracking modules mark a saving "realised" when a manager approves it. The reported number is a record of optimism.
**Ours.** There is **no code path** from approval to `REALIZED`. It requires measurement against a baseline captured *before* the action, over twelve months, with confounders considered.
**Why simpler.** The realised figure is worth reading.
**Backend.** Lifecycle guard, baseline snapshot, outcome window. **EXISTS except the outcome measurement**, which cannot run until twelve months elapse. **MVP for the guard; next phase for measurement.**

### 9.9 Evidence gaps as a first-class, priced output

**Traditional problem.** ERPs are silent about what they cannot tell you. The blank cell and the zero look identical.
**Ours.** An `EVIDENCE GAP` is a first-class finding, outside the saving hierarchy, **prioritised by observed spend** — a fact we can see — never by suspected opportunity, which we cannot.
**Why simpler.** The factory is handed a ranked list of *what to go and find out*, with the money already at stake attached.
**Backend.** `evidence_gaps` with observed spend. **EXISTS; the Settings surface does not.** **MVP.**

### 9.10 An audit trail of the claim, not only the transaction

**Traditional problem.** Both systems audit records. Neither versions a *conclusion*: what the system claimed, on what evidence, and what changed when it claimed something different.
**Ours.** Findings are versioned and superseded, never overwritten; each carries its gates, evidence references and signature; a decided finding is never silently replaced by a re-run.
**Why simpler.** "Why did this number change?" is a query.
**Backend.** Finding persistence with supersession. **EXISTS.** **MVP.**

### 9.11 What we should NOT try to beat them at

Accounting and period close · payroll, HR, CRM, e-commerce · manufacturing execution and finite scheduling · multi-entity consolidation · localisation breadth. **D-008 already gave valuation to finance. That was the right trade and it should stay made.**

---

# 10. SIMPLICITY ARCHITECTURE

## 10.1 Complexity that must stay invisible

| Internal | Why the user must never meet it |
|---|---|
| Basis contagion, weakest-basis propagation | The user needs *"how solid is this?"*, not an eight-value enum |
| The evidence-partition construction | They need a range and what it excludes, not D-044 |
| Intervention signatures, dimension vocabulary | They need *"these two can't both be done"* |
| Deduplication at mechanism level | They need the deduction shown, not the rule |
| Component-wise carrying assembly | They need *"we can't price this yet, because X"* |
| Supersession chains, natural keys, run ids | They need *"this changed on the 4th, here's why"* |
| Gate names, ladder states | They need *"not enough evidence to put a number on it — here's what's missing"* |
| FX effective-dating mechanics | They need *"currency movement is excluded"* |
| Ledger double entry, projections | They need a number they can trust |

## 10.2 Complexity that MUST be surfaced

**Non-negotiable, because hiding it is how the product becomes a liar:**

1. **That a number is a range**, and what sits between its bounds.
2. **That something was excluded**, how many, and that the total is therefore a lower bound.
3. **That a net excludes an unvalued risk**, and that the omission is optimistic.
4. **That data is demo**, wherever a demo-derived figure appears.
5. **What is missing** when the system refuses — named, not "insufficient data".
6. **That a recommendation conflicts with another.**
7. **That an adjudicator was not independent**, where that is so.
8. **That approved is not realised.**
9. **That an ETA is a forecast.**

> **The rule:** hide the *machinery*, surface the *honesty*. Every item above is a fact about the number's reliability, and a user who is not told it will make a worse decision.

## 10.3 The language test

Every user-facing string should survive: *"would a warehouse manager with no ERP training understand this sentence, and know what to do next?"* — **"Unestablished comparability dimension"** fails. **"We can't compare these two prices because the delivery terms aren't recorded"** passes.

---

# 11. PRODUCT PRINCIPLES

1. **A number carries what is wrong with it.** If it cannot, it is not shown.
2. **Refusing is a feature.** Name what is missing; never default, never zero.
3. **Every claim traces to recorded events.** No category percentages, ever.
4. **The engine may be complex; the screen may not.** Hide machinery, surface honesty.
5. **One obvious next action per screen.**
6. **Potential is never presented as realised.**
7. **Demo data is structurally distinguishable from factory data**, at the data layer, not by a badge.
8. **A rule enforced by structure survives; a rule enforced by discipline eventually does not.**
9. **The factory's answers live in Settings; the system's behaviour does not.**
10. **No feature exists because ERP software usually has it** — it must help discover, quantify, execute, verify or sustain a saving, or supply the foundation that does.
11. **When a screen would need a paragraph of explanation, the model is wrong, not the copy.**
12. **What the system cannot know is as valuable as what it can** — and is ranked by the money already at stake.

---

# 12. PRE-BLOCK-8 DECISIONS

## 12.1 Production Planning — must be decided before any of it is built

| ID | Decision | Why it cannot be defaulted |
|---|---|---|
| **PP-01** | **Amend D-007 to admit BoM *structure*?** Structure only — parent, component, quantity per, effectivity. Explicitly **not** routings, work centres or capacity | D-007 calls the BoM exclusion *"load-bearing"*. Admitting it is the single largest scope change since D-007 was locked |
| **PP-02** | **Where does forward demand come from?** (a) sales / customer orders · (b) a planner's stated production plan · (c) a factory-supplied forecast · (d) none — L0 feasibility only, driven by an ad-hoc question | ⚠ **D-010 rejects synthesising demand as fabrication (§47).** Any option except (d) requires amending D-010, and (c) requires the forecast to be **the factory's**, never ours |
| **PP-03** | **What basis does planned demand carry, and what does contagion then do to the headline?** | `FORECAST` propagates. Findings resting on it leave D-044's lower bound. **This changes the number the product is judged on** |
| **PP-04** | **Is Production Planning an `ENABLER` or a mechanism?** | Recommended `ENABLER`, by the same reasoning as Orders & Supply Movement. Deciding it late invites a saving claim with no counterfactual |
| **PP-05** | **Which level do we build — L0, L1, L2, L3?** | Recommended **L0, then L1, stop.** L2/L3 are a different product |
| **PP-06** | **Does the ledger gain a WIP bucket and a production order as a source document?** | Ledger-shaping (D-001). Cheap now, expensive later |
| **PP-07** | **Is production consumption backflushed or explicitly issued?** *(`A-16`, currently `DEFERRED`)* | Determines whether *Actual Outcome* is observable — the thing that would repair the broken verification chain |
| **PP-08** | **Does a "production planner" role exist?** *(D-051 has five; planner is not one)* | Affects `A-20` and the owner model |
| **PP-09** | **Does BoM-based cost roll-up happen here, or is it finance's?** | ⚠ Rolling up component cost to a finished good edges toward the valuation **D-008 gave finance**. Recommended: **no roll-up** |

## 12.2 Non-production decisions that should be settled first

| ID | Decision |
|---|---|
| **A-19 · A-20** | Stack is chosen (D-047); **the permission model is not.** Authentication gates Profile, Settings and real adjudication |
| **Promote the six `PROPOSED` decisions** | D-004, D-006, **D-010**, D-012, D-013, D-015. ⚠ **D-010 must be settled before it can be amended for planning** |
| **Q-13** | Adjudicator independence vs the purchasing decision *(needs `F-45`)* |
| **Q-14 · Q-15** | Demand window; handling on a level change |
| **A-18** | Excess ↔ dead boundary — needed for Mechanism 03, not for the MVP |
| **N-09** | Cost staleness threshold — currently the system states age and declines to classify |

---

# 13. RECOMMENDED BUILD ORDER

**Principle: close the loop for one factory before widening the surface for any factory.**

| # | Block | Why here |
|---|---|---|
| **1** | **Authentication, roles and Settings** | ⚠ Everything downstream needs a real user. **Settings is also where the factory's answers land** — and without them the offset, and much of the engine, correctly refuses to compute. It is the highest-leverage screen in the product |
| **2** | **Capture workflows** — expedite root cause, receiving, PO change history | Mechanism 01's evidence is only as good as its capture. **This is the workflow change D-018 always required**, and it is what turns a cost total into an action |
| **3** | **Factory discovery + real data** | `B-07`. Everything after this is guesswork without it. The system should meet real data **before** it grows a fourth module |
| **4** | **Production Planning L0** — feasibility only, *after* PP-01…PP-09 are decided | Smallest coherent answer to the client's requirement. Read-only, invents no demand |
| **5** | **Analytics** | Only meaningful once outcomes exist, or at least once real findings accumulate |
| **6** | **Production Planning L1** — requirements → purchase suggestions | Only after L0 proves the BoM model against real data |
| **7** | **Mechanism 03**, then Mechanism 02 | M03 supplies the cost model M02's price-break case needs |
| **8** | **UI/UX phase** | See §14 |

⚠ **Deliberately not first: the UI.** Not because it does not matter — it is a stated differentiator — but because designing screens for a domain that is about to gain BoMs, forward demand and a `FORECAST` basis class would mean designing twice.

---

# 14. UI/UX PHASE GATE

**The dedicated UI/UX phase should begin when all of the following are true.** Fewer than all, and the design is drawn against a moving model.

| # | Gate | Status |
|---|---|---|
| 1 | **Every product area's *purpose and primary user* is decided** — including Production Planning's level | ⚠ **Not met.** PP-05 open |
| 2 | **The domain object set is stable** — no new first-class concept expected | ⚠ **Not met.** BoM, requirement, production order are all pending PP-01 |
| 3 | **The basis vocabulary is final** — including whether `FORECAST`-based findings enter the headline | ⚠ **Not met.** PP-03 |
| 4 | **Authentication and roles exist** — screens differ by who is looking | ⚠ **Not met.** |
| 5 | **The system has met real factory data at least once** | ⚠ **Not met.** `B-07` |
| 6 | **At least one complete decision loop has run end to end with a real user** | ⚠ **Not met.** |
| 7 | **The "what must be surfaced" list (§10.2) is agreed** | ⚠ **Proposed here, not agreed** |

> **`RECOMMENDATION`** — the gate opens after **build-order steps 1–4**: authentication and Settings, capture workflows, real factory data, and Production Planning L0. At that point the object model is stable, the users are real, and the honesty requirements are settled. **Designing before that is designing twice.**

**One exception worth allowing:** the *language* work — replacing engine vocabulary with factory vocabulary — can start now and does not depend on any gate. It is content, not layout, and it is where a great deal of the perceived quality lives.

---

# 15. FINAL READINESS STATUS

## Ready

The financial core. Ledger, provenance, exact arithmetic, FX, rate fitness, Mechanism 01 with a computed offset, aggregation, contradiction control, persistence, review and baseline — **163 tests, a clean build, and a demo journey that survives a restart.** The engine is production-shaped.

## Blocked

**Authentication** blocks Profile, Settings and real adjudication.
**`B-07`** blocks validation of everything.
**Production Planning is blocked by decision, not by capability** — D-007 and D-010 must be amended first, and that is yours to approve.
**Analytics is blocked by time** — no finding is twelve months old.

## Unknown

Which level of Production Planning the client actually needs *(PP-05 — and this should be asked, not inferred)* · where forward demand would come from *(PP-02)* · whether the factory records PO authorship, insurance basis, handling marginality *(`F-45`…`F-47`)* · whether real factory data resembles the import contract at all.

## What should happen next

**`RECOMMENDATION` — two things, in this order, and neither is code.**

**First, ask the client one question:** *when they say Production Planning, do they mean "can I build this order?" (L0), "what do I need to buy and when?" (L1), or "which machine runs what on Tuesday?" (L2)?* **These are three different products**, and the answer changes PP-01 through PP-09 and the entire build order. **It should not be inferred from the phrase.**

**Second, decide PP-01 and PP-02.** They are the gate. Everything else in Production Planning follows from whether BoM structure is admitted and where forward demand legitimately comes from — and D-010 forbids the easy answer to the second.

⚠ **The one thing that must not happen** is Production Planning arriving as an implementation detail. It changes the demand model from observed to planned, and under D-002 that changes the basis of everything computed from it. **That is a decision about the number the product is judged on, and it belongs to you.**

---

**Analysis complete. Nothing implemented. No locked decision modified. Awaiting review.**
