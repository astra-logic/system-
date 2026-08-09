# 18 — BLOCK 4: Remaining Domain Closure & MVP Scope Freeze

> ## ✅ MVP DOMAIN CONTRACT — FROZEN 2026-08-08
> Built by reading the repository, not prior summaries. Every unresolved item in the project is classified below; **nothing remains as "future work."**
> **No code, no UI, no schemas.** No rate, threshold, probability, confidence value, service level or factory fact invented.

**Four live defects were found that would each have produced a false financial result. All four are fixed in this block.** They are in Part H.

---

# PART A — COMPLETE DOMAIN INVENTORY

## A1. Mechanisms

| | Mechanism | Status | Currency gated by |
|---|---|---|---|
| **01** | Expedited freight / emergency purchase premium | **LOCKED** — Part 2.1 | `F-01` freight separability |
| **02** | Procurement Price Opportunity | **LOCKED** — Part 2.2 | `F-12` / `F-13` quotations and contracts |
| **03** | Quantity & Inventory Economics (4 subtypes) | **LOCKED** — Part 2.3 | `F-31`, `F-08` components, `F-43` freight |

**No proposed mechanism exists.** No mechanism is duplicated: each has a distinct counterfactual, and D-020 deduplicates at mechanism level.

> ⚠ `FACT` **Every mechanism's *currency* is gated by a factory fact that may not exist. None of its *correctness* is.** This single sentence shapes the entire MVP definition — see Part C1.

## A2. Retired and redistributed

| | Was | Now |
|---|---|---|
| §4.2 slow-moving | A saving category | **Retired** (D-034). Detection signal · shelf-life trigger into §4.3 · exposure where no action exists |
| §4.4 purchase price variance | A category with a formula | **Redistributed** → Mechanism 02. ⚠ **Its formula was still live text — fixed in Part H** |
| §4.5 order consolidation | One category holding three mechanisms | **Retired and redistributed** (D-032): supplier → M02 · temporal → M03 subtype A · shipment → unowned gap |
| §4.6 MOQ | A category computing a cost | **Reshaped** (D-038). ⚠ It had **no intervention** — an Opportunity only where an alternative is evidenced |
| §4.8 expedite premium | A category | **Redistributed** → Mechanism 01 |
| §4.9 stockout | A category that refuses to produce a number | **Reclassified** as `EXPOSURE / RISK` (D-034) |
| D-003 · D-005 · D-016 | Decisions | **Superseded** by D-011 · D-008 · D-024 |

## A3. Unowned economic effects

| Effect | Owner | MVP consequence |
|---|---|---|
| **Shipment consolidation / logistics-cost domain** | **None** (D-032, preserved) | ⚠ Blocks M03 subtype A's net for imported items (`B3-02`) |
| **Disposal tax effect** | Probably finance (D-008) | `B2-03`. Not claimed either way |
| **Stockout cost** | None — needs production (D-007) | Permanently unvaluable in this release. By design |
| **Production-side outcomes** | None — D-007 | ⚠ The operating chain is **broken at *Actual Outcome***. Every realization claim inherits this |
| **Commitment penalty valuation** | Deliberately unvalued (D-031) | Disclosed as exposure, never scored |

## A4. Contradictions governed

Handled structurally by D-029 (opposed actions), D-020 (shared benefit), D-031 (created / deepened / mitigated risk). Part 2.3 added the first **intra-mechanism** case. **No ungoverned contradiction exists** — the four *live document* contradictions found in this block are specification defects, not model gaps, and are in Part H.

## A5. Foundations

F1 tenancy · **F2 stock ledger (D-001 `LOCKED`)** · F3 quantity semantics · **F4 provenance (D-002 `LOCKED`)** · F5 time · F6 UoM · F7 lot/serial · F8 costing (finance-owned, D-008) · F9 recommendations · **F10 financial change decomposition capture contract (D-028)**.

---

# PART B — CLASSIFICATION OF EVERY UNRESOLVED ITEM

**Test applied.** An item is **A — MUST RESOLVE BEFORE MVP** only if leaving it unresolved could produce a false saving · a materially misleading recommendation · broken inventory or order truth · a provenance violation · double counting · contradictory recommendations · or an impossible MVP workflow. **Everything else is deferred.** Theoretical interest is not a criterion.

## A — MUST RESOLVE BEFORE MVP

| Item | Why it blocks — the specific failure |
|---|---|
| **`A-19` stack** | Nothing can be built. Selection criteria are already fixed by F2: transactional integrity, exact decimals, fast projections |
| **`A-01` projection strategy** | ⚠ **Not merely "shapes the write path."** D-039 requires point-in-time reconstruction over long windows; an async projection without historical replay makes the ledger unable to support any saving backtest. Choosing wrongly is a rewrite of U-07, the largest unit |
| **`A-20` permission model** | The MVP's currency claims require an **adjudicator independent of the underlying decision** (DP-07). Without a role model, either the check is skipped — and a buyer approves their own saving — or the workflow is impossible. Three concrete requirements now exist |
| **`N-03` consumption capture granularity** | Ledger-shaping and **cannot be backfilled.** Getting it wrong means re-capturing history the factory no longer has |
| **`N-04` catch-weight** | Ledger-shaping. Quantity semantics differ per item; retrofitting corrupts every historical quantity |
| **`A-02` hard or soft reservation** | Determines whether `Available` is truthful (F3). A wrong `Available` breaks inventory truth, which every mechanism reads |
| **`A-18` excess / dead thresholds** | ⚠ **Only the excess↔dead boundary blocks.** D-035 gives excess and dead **different capital treatment** — capital is *tied* for excess and *lost* for dead. An undefined boundary silently moves money between two different economic claims |
| **`F-06` how an expedite is recognised today** | Without it the MVP mechanism **has no events to detect.** Not a currency gate — a detection gate |
| **`B-07` pilot factory** | An MVP validated against no factory is unvalidated business logic (§47) |
| **Multi-currency contradiction** | ⚠ **Fixed in this block — D-042.** Three documents said multi-currency is out of scope while D-024 makes FX normalisation Tier 1 |
| **Aggregation of uncomputable members** | ⚠ **Fixed — D-043.** Nothing said what an aggregate does with a member returning `INSUFFICIENT_DATA` |
| **Construction of the headline range** | ⚠ **Fixed — D-044.** D-012 required a range and never said what its bounds are. An engineer would invent an interval |
| **`A-03` confidence formula** | ⚠ **Resolved by removal — D-045.** The object carries a `Confidence` field with no defined rule. Rule 15 forbids category constants, so an engineer would invent a formula. **The MVP does not carry a synthesised confidence score** |
| **Annualisation method** | ⚠ **Fixed — D-046.** Rules 11 and 12 set the history bar and never said what the annual figure *is* |
| **§4.4's live formula · "dedupe by subject" · both fixed in Part H** | Each would have been implemented as written |

**Fifteen items. Nine are decisions or facts you must supply; six were specification defects fixed here.**

## B — CAN RESOLVE DURING MVP BUILD

| Item | Why it does not block |
|---|---|
| `N-01` finance integration contract, `U-14` cost reference | ⚠ **The MVP mechanism's currency comes from procurement documents, not the cost reference.** Where a figure does rest on imported cost and the import is absent, the locked rules already force `INSUFFICIENT_DATA`. Needed before any inventory-value display, not before the MVP claim |
| `A-04` period close authority | Affects where a backdated correction may post. Fails safe by locking nothing initially |
| `A-10` location depth · `A-11` item master ownership · `A-15` inspection policy | Local design choices with no financial consequence |
| `A-12` minimum supplier sample | Constrains a *display*, not a claim. D-019 already refuses to reduce sufficiency to a count |
| `N-05` handheld vs desk · `P-12` design system | Interaction design. No financial consequence |
| `N-12` who owns and approves opportunities | Configuration of D-011's three owner fields — the fields exist, the assignment is data |
| `N-13` distinct intervention owner | **Answered in substance** by the D-011 amendment. Closable as configuration |
| `Q-01` quality rejection as a root cause | A list entry in D-018's structured categories. Adding one is data, not design |
| `Q-02` what makes a counterfactual defensible | Needs real events. **Discovered during the MVP, not before it** |
| `Q-06` does lead-time correction create other costs | D-015 nominated the slice precisely to test this. It *is* MVP work |
| `W-24` which contradiction resolution applies when | The four resolutions are locked; the selection rule can be decided on the first real conflict |
| `W-32` who adjudicates a contradiction | Folds into `A-20`'s role model |

## C — CAN BE DEFERRED AFTER MVP

`P-01`…`P-07`, `P-09`…`P-14` product questions · `A-05` catch-weight *(the **requirement** is `N-04`, class A; the UoM elaboration is not)* · `A-06` lot genealogy *(needs production)* · `N-02` outbound feed *(read-only first is probably right)* · `N-06` consumption history depth *(a fact, not a decision — feeds `B-07`)* · `N-09` cost-reference staleness threshold *(needed when U-14 lands, not before)* · `N-11` service level *(constrained: a policy the factory states, never a model)* · `Q-08` decomposition engine *(now has its second and third mechanisms — revisit after MVP)* · `Q-09` document immutability *(required before **Mechanism 02**, not before MVP)* · `Q-10` in-transit ownership *(gated by `F-15`)* · `Q-11` source-record drift · `Q-12` basis semantics · `W-02`, `W-07`, `W-08`, `W-10`, `W-11`, `W-13`, `W-14` *(all Mechanism 02 refinements)* · `W-43`, `W-44` *(shipment consolidation, ordering-cost ownership)* · `B2-02`, `B2-03`, `B2-04` · `B3-01`, `B3-02`, `B3-03` *(all Mechanism 03)* · **promotion of D-004, D-006, D-010, D-012, D-013, D-015** — see the note below.

> ⚠ **On the six `PROPOSED` decisions.** Reported in Part 2.3 and unchanged: **D-012 is amended by three *locked* decisions while itself unlocked.** Their *substance* is used consistently everywhere, so none blocks the MVP — but the audit trail says a locked decision amends an unlocked one. **Ratification, not redesign.** Deferred only because it changes nothing an engineer would build.

### Two structural questions that look blocking and are not

| | Why it is C, not A |
|---|---|
| **`W-20`** — does one unestablished comparability dimension block currency outright, or only for the comparisons it touches? | A **Mechanism 02** question. The MVP has one mechanism and no comparability gates |
| **`W-31`** — is the intervention-signature dimension vocabulary locked or extensible? | ⚠ **Part 2.3 answered it by demonstration** — Mechanism 03 added seven dimensions, so it *must* be extensible. Formalise when a fourth mechanism arrives |

## D — RETIRED / NO LONGER NEEDED

`P-08` EOQ → **closed by D-040** · `Q-03`, `Q-04`, `Q-05`, `Q-07` → closed · `N-07` ≡ `F-01`, `N-10` ≡ `F-08` → duplicates, one entry each · `N-08` → answered by rule 11 · `A-07`, `A-08`, `A-13`, `A-14`, `A-16`, `A-17` → closed by D-008 / D-010 · `B-01`…`B-06` → answered · `M-01`…`M-08` → D-017…D-024 · `DP-01`…`DP-15` → all closed · `W-01`, `W-03`, `W-04`, `W-05`, `W-06`, `W-09`, `W-12`, `W-17`, `W-23`, `W-25`, `W-26`, `W-33`, `W-35`, `W-36`, `W-45`…`W-49` → closed by the locks · §4.2 · §4.5 · D-003 · D-005 · D-016 · **avoidability weights, minimum event counts, service-level models, EOQ** → rejected outright.

## E — BLOCKED BY FACTORY EVIDENCE

`F-01`…`F-44`. Full matrix in Part E. **Only four are MVP blockers**, and only one of those blocks currency.

---

# PART C — MVP DEFINITION

## C1. The reframing that makes the MVP definable

`FACT` **Every mechanism's currency is contingent on a factory fact that may not exist.** M01 needs `F-01`, M02 needs `F-12`/`F-13`, M03 needs `F-31` and `F-08`'s components.

> **Therefore the MVP cannot be defined as "produces a saving number." It must be defined as "produces a defensible finding" — with correct provenance, gates, disclosure and audit — whether or not that finding carries currency.**

This is not a lowering of ambition. It is the only definition that does not create pressure to invent an input when the factory turns out not to record one — which is the single most likely route to a false financial result in this project.

**Corollary, and it is the MVP's most important acceptance criterion:**

> **An MVP that returns `INSUFFICIENT_DATA` for every opportunity, with each gap named and each observed spend shown, is a PASSING MVP.** It is not a broken one, and it must not be treated as one.

## C2. The MVP mechanism — one, and which one

**Mechanism 01, lead-time-correction slice** (D-015, reinforced by D-017).

| Why this one | |
|---|---|
| Needs **no carrying-cost rate** | The intervention may require no additional inventory — so `F-08` is **not an MVP blocker** |
| Cause, intervention, counterfactual and verification **all inside our own data** | No external baseline |
| Measures **money actually spent**, not money hypothetically saveable | The most defensible claim available |
| Its capture (`F-01`, `F-06`) **also gates D-037** | Building it first unlocks the most downstream work |
| Realization is **entirely procurement-side** | The chain is broken at *Actual Outcome*; this slice does not cross the break |

**Mechanisms 02 and 03 are not in the MVP.** Not because they are unfinished — both are locked — but because one mechanism is sufficient to prove all eleven capabilities, and a second proves none of them again.

⚠ **The offset gate is still required, even though the offset is expected to be zero.** D-015 says the intervention *may* require no additional inventory. The MVP must **check**, and must **refuse** where the intervention does require more stock and the offset cannot be valued. Removing the check because the expected value is zero would be the exact failure D-014 rule 6 exists to prevent.

## C3. The eleven capabilities, and what each requires

| # | Capability | MVP requires | Locked source |
|---|---|---|---|
| **1** | **Ingest factory data** | Item master · movement history · PO header and lines · **receipt events including partials** · supplier master. **Source-system natural key; duplicates refused at the door.** Opening stock enters through `Opening Balance / Migration` | D-001 as amended |
| **2** | **Establish provenance** | The envelope on **every value the system asserts**, raw or derived. `as_of` = effective time. Contagion with a defined floor. `INSUFFICIENT_DATA` as a designed, rendered state. F10 capture dimensions on financial events, **never invented where absent** | D-002 as amended, D-028 |
| **3** | **Establish inventory / order truth** | Immutable double-entry ledger · balances as projections · **point-in-time reconstruction** · reversing entries · returns as movements · F3 quantity vocabulary · PO change history as history, not mutation | D-001, U-07, U-12 |
| **4** | **Detect a valid opportunity** | Expedite events identified (`F-06`) · root cause captured **in the workflow at event time**, structured categories · lead-time master data compared against actual receipt timing | D-018, D-015 |
| **5** | **Apply evidence gates** | Gates are **pass / fail / unestablished**, never averaged, never scores. **Unestablished is never a pass.** D-019's three-state ladder | D-019, M02 lock item 8 — **promoted to cross-cutting in this block** |
| **6** | **Calculate defensible economic value** | Event-level counterfactual over identified events. **No category percentage.** FX normalisation at each amount's own effective date. Annualisation per D-046. **`INSUFFICIENT_DATA` where `F-01` is absent — and that is a pass** | D-027, D-024, D-042, D-046 |
| **7** | **Disclose costs and exposures** | Certain incremental cost **netted**; uncertain exposure **disclosed, never netted**; `CREATES` / `DEEPENS` / `MITIGATES` as three distinct unvalued types; **the net figure declares its own incompleteness and its optimistic direction** | D-014 rule 6, D-031, D-041 |
| **8** | **Recommend an action** | A stated intervention specific enough to be tested · an **intervention signature** · three owner fields · an adjudicator **independent of the underlying decision** for any currency claim | D-027, D-029, D-011 as amended, DP-07 |
| **9** | **Track the resulting order / supply movement** | PO · supplier · quantity · price · terms · promised date · **receipt including partials** · delay · expedite flag. **Nothing else** — see Part D | Part D |
| **10** | **Record actual procurement-side outcome** | Baseline captured at `APPROVED` as **a snapshot of inputs and method, not only an output** · 12-month window · evidence strength as an attribute · confounders considered | D-011, D-022, D-026 |
| **11** | **Preserve auditability** | Every number traces to the movements and documents that produced it. Every refusal names what was missing. Every superseded record is preserved, never mutated | D-001, D-002, D-025 |

## C4. What the MVP explicitly does NOT include

Mechanism 02 · Mechanism 03 · MRP · BoMs · EOQ · service-level models · production · maintenance · full quality · multi-site · a costing engine · an executive dashboard · AI features · a decomposition **engine** (`Q-08`) · **maps, current location, supplier location and port milestones** (Part D) · a synthesised confidence score (D-045) · any inventory-value display until `U-14` lands.

**These are out of the MVP, not hidden in it.** Absent capability is stated plainly (§38).

---

# PART D — ORDERS & SUPPLY MOVEMENT: FINAL DOMAIN REQUIREMENTS

**Classification unchanged: `ENABLER`.** It produces no saving and is not a mechanism.

## D1. The test

> **An element is a DOMAIN REQUIREMENT if and only if a locked mechanism's counterfactual, gate, offset or realization check reads it. Everything else is PRODUCT SCOPE.**

Applied without exception below.

## D2. The separation

| Element | Domain requirement? | Read by | MVP? |
|---|:--:|---|:--:|
| **Supplier** — identity, per-item commercial terms | **DOMAIN** | M01, M02, M03 | ● |
| **Purchase order** — header and line, with change history | **DOMAIN** | All | ● |
| **Order quantity** | **DOMAIN** | All | ● |
| **Price** — PO price, and invoice price where separable | **DOMAIN** | M02, M03 subtype D | ● |
| **Ordered date** | **DOMAIN** | Lead time = ordered → received | ● |
| **Promised date** | **DOMAIN** | Delay; lead-time variability | ● |
| **Terms** — incoterm, payment terms | **DOMAIN** | M02 comparability gates | ○ Not MVP |
| **Receipt · actual arrival** | **DOMAIN — the spine** | Everything | ● |
| **⚠ Partial receipt** | **DOMAIN — and MVP-critical** | M03's position path; **lead time per instalment** | ● |
| **Delay** — promised vs actual | **DOMAIN** | M01 root cause; M03 variability | ● |
| **Expedite** — flag, mode or reason code (`F-06`) | **DOMAIN — the MVP's detection trigger** | M01 | ● |
| **Shipment** | **DOMAIN**, narrowly — only as the unit freight attaches to (`F-01`) | M01's premium | ● |
| **Movement status** | **DOMAIN, minimally** — only enough to distinguish **ordered / shipped / received**. Intermediate states are read by nothing | M01 | ○ |
| **ETA** as a maintained forecast | **DOMAIN** — basis `FORECAST`, and it degrades everything computed from it | M03 subtype C's deferral counterfactual; §4.9 | ○ Not MVP |
| **Port milestone** | **DOMAIN** — but only for **customs demurrage** (`F-02`), M01's second premium category | M01 (not the MVP slice) | ○ |
| **Current location** | ⚠ **PRODUCT SCOPE.** Read by no locked mechanism | — | ✗ |
| **Supplier location** | ⚠ **PRODUCT SCOPE.** Read by no locked mechanism | — | ✗ |
| **Map / journey visualisation** | ⚠ **PRODUCT SCOPE.** Read by no locked mechanism | — | ✗ |

## D3. The honest statement about the last three

`FACT` **Current location, supplier location and the map are legitimate product ambition and real operational value. They are not domain requirements, and no locked mechanism degrades without them.**

They are recorded here so that effort is not spent on them ahead of the things that gate mechanisms — not because they are unwelcome. **The economic engine does not read them.** When the order journey is eventually designed, these are its feature set; they are not part of the MVP domain contract.

⚠ **One caveat worth keeping.** *Stockout risk cannot be fully assessed without knowing where inbound stock physically is* — a shipment held at customs changes it materially. That is a real dependency, and it is a dependency of **§4.9 exposure**, which carries no currency in any release (D-034). So it strengthens a disclosure, never a number.

## D4. What Orders & Supply Movement now is, evidentially

⚠ **Upgraded from the 2026-08-07 record.** It was described as *"not wholly additive"* — true of the fields. **Evidentially it is now load-bearing**: a partial-receipt gap does not degrade Mechanism 03's output, it **falsifies** it (`F-41`). That is a different class of dependency.

**Still not designed. Still no workshop, no entities, no states, no screens.** This section records dependency, not model.

---

# PART E — FACTORY DATA READINESS MATRIX

**Deduplicated.** `N-07` ≡ `F-01`; `N-10` ≡ `F-08`. Forty-four entries; the twelve that decide the MVP are shown first.

## E1. MVP-relevant

| Field | Why needed | Mechanism | Source | Req / Opt | Evidence class | Provenance | MVP blocker? | Fallback if missing |
|---|---|---|---|---|---|---|:--:|---|
| **Item master + base UoM** | Nothing works without it | All | ERP / Excel | **Required** | Master data | `USER_DEFINED` on import | **YES — build** | None. Blocks everything |
| **Stock movement history** | Ledger seed · consumption · position path | All | ERP / Excel | **Required** | Transactional | `ACTUAL` if observed; `USER_DEFINED` if asserted (`Q-12`) | **YES — build** | Seed via `Opening Balance / Migration`; history begins at go-live and every backtest returns `INSUFFICIENT_DATA` until 12 months accrue |
| **PO header + lines** (supplier · item · qty · price · currency · ordered date) | The spine of every mechanism | All | ERP / Excel | **Required** | Transactional | `ACTUAL` | **YES — build** | None |
| **Receipt records with dates and quantities** | Lead time = ordered → received | M01, M03 | ERP / Excel | **Required** | Transactional | `ACTUAL` | **YES — build** | None. The MVP's detection is a lead-time comparison |
| **`F-41` partial receipts as separate events** | ⚠ Position path and per-instalment lead time | M03; **lead-time accuracy in M01** | ERP | **Required** | Transactional | `ACTUAL` | **YES — correctness** | If receipts are only recorded in full, **state the limit**: lead time is measured to first or final receipt, and which one must be declared |
| **`F-06` how an expedite is recognised today** | ⚠ **The MVP's detection trigger.** No events, no mechanism | M01 | ERP / interview | **Required** | Operational fact | — | **YES — detection** | Capture it going forward (D-018). The MVP then detects **nothing historical** and must say so, not estimate |
| **`N-03` consumption capture granularity** | Ledger-shaping, **unbackfillable** | All | Decision | **Required** | Design fact | — | **YES — ledger** | Item-level only, and cost-centre analysis is permanently unavailable. State it |
| **`N-04` catch-weight** | Ledger-shaping | All | Interview | **Required** | Design fact | — | **YES — ledger** | Assume no, and accept that adding it later corrupts historical quantities |
| **`A-18` excess ↔ dead boundary** | ⚠ Different capital treatment either side (D-035) | M03 | Factory policy | **Required** | Policy | `USER_DEFINED` | **YES — correctness** | None. **We may not choose it** — it is a factory policy, and inventing it moves money between two economic claims |
| **`F-01` freight separable per shipment → PO line** | The premium itself | M01, M03 | Invoice structure | **Required for currency** | Financial | `ACTUAL` | **CURRENCY ONLY** | ⚠ **The MVP produces event counts, root causes and evidence gaps — and no currency. That is a passing MVP** |
| **`F-09` lead-time master data quality** | The MVP's counterfactual | M01 | ERP | Required for the claim | Master data | `USER_DEFINED` | **Claim gate** | `INSUFFICIENT_DATA`. Never a default lead time |
| **`F-07` FX rate history, source, effective-dating policy** | Tier 1. Freight is often USD, reporting EGP | All financial | Finance | **Required for currency** | Financial policy | `USER_DEFINED`, effective-dated | **CURRENCY ONLY** | ⚠ **No cross-period comparison at all.** Single-period observed spend only. Never a current-rate shortcut (D-042) |

## E2. Not MVP — gated to Mechanisms 02 and 03

| Field | Mechanism | Blocker for | Fallback |
|---|---|---|---|
| `F-08` carrying components **and purpose** | M03, offsets | M03 currency; any offset | `INSUFFICIENT_DATA`. **Never a whole rate** (D-035) |
| `F-31` ordering cost | M03 subtype A | Subtype A entirely | `INSUFFICIENT_DATA`. No default (D-032) |
| `F-43` freight per shipment vs order size | M03 subtype A | Subtype A's net on imports | `INSUFFICIENT_DATA`, not a smaller number with a caveat |
| `F-33` is warehouse space constrained | M03, §4.3 | The space component's existence | Component **excluded**, not estimated |
| `F-22` effective-dated cost of funds | M03 subtype C | The single financing channel | `INSUFFICIENT_DATA` in **both** channels (D-036) |
| `F-39` expected price movement | M03 subtype C | Deferral | `INSUFFICIENT_DATA`. ⚠ **Assuming zero is an invented assumption** |
| `F-12` quotations incl. declined · `F-13` contracts | M02 | M02 entirely — no counterfactual | Evidence Gap, prioritised by observed spend |
| `F-15` incoterms · `F-16` payment terms · `F-19` duty · `F-20` approved supplier · `F-21` specification | M02 | Comparability gates | **Unestablished, never equivalent** |
| `F-26` price breaks · `F-28` volume rebates · `F-30` penalty clauses · `F-44` order multiples | M03 subtype D | Quantity–price coupling | No claim |
| `F-02` customs · `F-03` freight rates · `F-04` freight capitalisation · `F-05` will buyers classify · `F-10` volume history | M01 beyond the MVP slice | Wider M01 | Narrower claims |
| `F-11` who sets prices · `F-24` / `F-25` adjudicator independence and capacity · `F-37` data-quality ownership | Ownership, adjudication | `A-20`; owner fields | Unowned finding, **visibly so** |
| `F-14` invoice vs PO price · `F-17` price lists · `F-18` finance's PPV · `F-23` LC and advance payment | M02 | Evidence tiers | Weaker tier |
| `F-27` substitutes · `F-32` shipment-to-PO · `F-34` shelf lives · `F-35` escalations · `F-36` overrides · `F-38` disposal cost · `F-40` inventory taxes · `F-42` will suppliers accept smaller orders | M03, D-037 | Evidence levels | **Named limits, never assumed absent** |
| `N-01` finance integration contract | `U-14` | Inventory-value displays | Not an MVP blocker — see Part B |
| `B-07` pilot factory | Everything | Validation | ⚠ **No fallback.** An MVP validated against no factory is unvalidated business logic |

> `FACT` **Twelve fields decide the MVP. Eight block the build; two block only currency; two are claim gates.** The other thirty-two follow. **Seven items in the register will be created by the product itself** — root-cause classification, expedite flags going forward, override history, escalation records, decision rationale, realization measurements, adjudication records. **Do not ask the factory for these.** Ask only whether they *could* be captured.

---

# PART F — Q-07: RESOLVED

**Verdict: FIXED — not partially, not deferred, and it was one defect away from being an MVP blocker.**

| Category | State |
|---|---|
| §4.1 · §4.3 · §4.6 · §4.7 | **Re-expressed** as intervention + counterfactual (D-033 … D-039) |
| §4.2 | **Retired** (D-034) |
| §4.5 | **Retired and redistributed** (D-032) |
| §4.9 | **Reclassified** as `EXPOSURE / RISK` (D-034) |
| §4.8 | **Superseded** by the Mechanism 01 lock |
| **§4.4** | ⚠ **Was still carrying `(current price − best comparable price) × annual volume` as live text.** Part 2.3 recorded it as *"superseded by Mechanism 02"* and **did not rewrite the formula.** Fixed in Part H |

**Why §4.4 was the dangerous one.** It is a **rate applied to a total** — the precise error D-017 rejected, D-027 elevated to a standing principle, and the price-break trap in Part 2.3 repeated in a new costume. It sat in the taxonomy document an engineer would read first, under a heading that looked live. **A superseded formula with no superseded marker is worse than a wrong one, because it reads as current.**

**Verification performed.** Every remaining formula in the taxonomy was checked against D-027. **No percentage-of-total, category-weighted or rate-on-total calculation survives anywhere in the specification.**

---

# PART G — THE FINAL DOMAIN GATE

## G1. Complete domain map

```
                          THE FACTORY (reality)
                                   │
   F1…F10 FOUNDATIONS              │  govern what must be CAPTURED
   F2 ledger (D-001 LOCKED) · F4 provenance (D-002 LOCKED) · F10 capture
                                   ↓
   ENABLERS       Ledger · Item master · Supplier master
                  Orders & Supply Movement  ← evidentially load-bearing,
                                               never a mechanism
                                   ↓
   MECHANISMS     01 expedite premium   ← THE MVP
                  02 procurement price
                  03 quantity & inventory  ─┬─▶ also supplies the
                                            │   INVENTORY COST MODEL
                                            └──▶ consumed by 01 and 02
                                   ↓
   FINDINGS   ┌───────────────────────────────────────────────┐
              │ OPPORTUNITY ─CREATES/DEEPENS/MITIGATES─▶ EXPOSURE/RISK
              │      │                                  OBSERVED COST
              │      │                            EVIDENCE GAP (outside)
              └──────┼───────────────────────────────────────┘
                     ↓  only OPPORTUNITY
   POTENTIAL ANNUAL SAVING   range · weakest basis · deduplicated at
                             mechanism level · recurring only ·
                             excluded members disclosed
                     ↓
   Decision → Action → Measurement → REALIZED   (procurement-side only)
```

**Governing distinction, unchanged:** *F-series foundations govern what must be captured from reality; the saving model governs what may be asserted about it.*

## G2. MVP-blocking decisions

**Yours to supply — nine:** `A-19` stack · `A-01` projection strategy *(with historical replay)* · `A-20` permission model · `A-02` reservation · `A-18` excess↔dead boundary · `N-03` consumption granularity · `N-04` catch-weight · `F-06` expedite recognition · `B-07` pilot factory.

**Fixed in this block — six:** D-042 currency · D-043 aggregation exclusion · D-044 headline range · D-045 confidence removed · D-046 annualisation · plus the three document defects in Part H.

## G3. Non-blocking decisions

Twelve items in class B, resolvable while building. **None affects a financial figure.**

## G4. Deferred items

Everything in class C — thirty-one items, each with a named reason and a named owner. **Not one is "future work."**

## G5. Retired items

Listed in Part B-D. **Twenty-three closures, five retirements, three supersessions, four outright rejections** (avoidability weights, minimum event counts, service-level models, EOQ).

## G6. Factory data required

Part E. **Twelve decide the MVP; thirty-two follow; seven the product creates itself.**

## G7. Orders & Supply Movement final requirements

Part D. **Thirteen domain requirements, nine of them MVP. Three elements are product scope and read by nothing.**

## G8. Final saving-engine requirements

1. Only `OPPORTUNITY` reaches Potential Annual Saving — **structurally**, not by filter
2. Recurring only in the headline; one-time reported separately; **never summed**
3. Range, not a point — **constructed per D-044**
4. Weakest basis by contagion; **excluded members disclosed per D-043**
5. Deduplication at **economic-mechanism level**, explainable, never a silent filter
6. Annualisation per D-046; never below the rule-11 bar
7. Every figure is an **event-level counterfactual**; no category percentage anywhere
8. FX-normalised **at each amount's own effective date** (D-042)
9. No invented rate, threshold, weight, probability, service level, materiality number or confidence constant
10. `INSUFFICIENT_DATA` is a **designed, rendered, passing** outcome
11. The realised-versus-identified ratio is displayed alongside the headline
12. Every refusal **names what was missing**

## G9. Final contradiction / exposure requirements

1. Every Opportunity declares an **intervention signature**; one without it **cannot be presented**
2. Conflict requires **all four** to intersect — subject, dimension, opposed direction, window
3. Resolutions: net · suspend · supersede · adjudicate. **Before presentation**
4. Detection runs **over a mechanism's own outputs**, not only across mechanisms
5. `CREATES` · `DEEPENS` · `MITIGATES` are **three distinct types**, none valued, none netted, none scored
6. Exposure carries **no** intervention signature and **no** lifecycle
7. The exposure record is **not created until the intervention is actioned**
8. Certain cost is **netted**; uncertain exposure is **disclosed**
9. **The net figure declares its own incompleteness and its optimistic direction**
10. `ACTUAL` cost and `FORECAST` exposure are **never mixed in an aggregate**

## G10. Exact build contract

> **Build the ledger, the provenance primitive, and one mechanism — Mechanism 01's lead-time-correction slice — end to end, such that it can produce a defensible finding with correct provenance, gates, disclosure and audit, whether or not that finding carries currency.**

**Units, in order:** `U-01` provenance · `U-01b` F10 capture · `U-02` identity and permissions · `U-03` time and site · `U-04` UoM · `U-05` item master · `U-06` locations · **`U-07` ledger** · `U-09` manual movements · `U-11` supplier master · `U-12` purchase orders · `U-13` receiving *(including partials)* · `U-15` consumption history · `U-17` Saving Opportunity object · `U-18` **one detector only** · `U-18b` aggregation.

**Deferred from the MVP:** `U-08` lot/serial *(unless the pilot needs it)* · `U-10` counting · `U-14` cost reference · `U-16` reorder-point planning · `U-19` command centre · `U-20` finance feed.

**Acceptance is binary on these five:**
1. **No number exists without a provenance envelope.** Not one, not temporarily.
2. **No invented constant exists anywhere in the codebase.** A missing input returns `INSUFFICIENT_DATA`.
3. **Every figure traces to the movements and documents that produced it**, and every refusal names what was missing.
4. **Balances equal the projection of history at any past instant**, verified by independent recomputation against a historical instant.
5. **A duplicate ingestion is refused**, not accepted and corrected.

---

# PART H — FINAL ADVERSARIAL AUDIT

> **"If we gave this specification to an engineering team tomorrow, what could they still misunderstand that would cause the system to produce a false financial result?"**

Ten failures were found. **Six are real and fixed below.** Four were tested and found already governed — recorded so they are not re-raised.

## ⚠ H1. Multi-currency is listed as out of scope while FX normalisation is Tier 1 — **FIXED, D-042**

**The misunderstanding.** An engineer reads `02-first-release-scope.md` §3 and the build plan's exclusion list — both say **multi-currency is out of scope** — and builds a single-currency system. D-024 makes FX normalisation **Tier 1** and D-028 requires currency, FX rate and rate date on every financial event.

**The false result.** Freight invoiced in USD, recorded as an EGP number at whatever rate was used that day, compared against a prior year across an EGP devaluation. **A premium that is entirely currency movement presents as an operational deterioration** — the precise failure D-016 and D-024 exist to prevent, arriving through a scope document.

**This is the most dangerous defect in the audit**, because both readings are supported by current text and the wrong one is stated in the document an engineer would read first.

**The fix — the smallest reconciliation, and it is a distinction, not a new capability:**

```
OUT of the first release   multi-currency TRANSACTING
                           multi-currency ledgers, revaluation, currency
                           translation, reporting in more than one currency

IN, and Tier 1             multi-currency CAPTURE and FX NORMALISATION
                           original amount + currency + rate + rate date on
                           every financial event (already locked by D-028),
                           normalised for comparison to a finance-owned
                           policy rate
```

**And the rule an engineer would otherwise get wrong:** each historical amount is normalised using **the rate effective at that amount's own effective date** — never a single current rate applied to history. Using today's rate erases exactly the effect normalisation exists to isolate.

## ⚠ H2. Nothing says what an aggregate does with an uncomputable member — **FIXED, D-043**

**The misunderstanding.** D-002's contagion rule governs the **inputs of one value**. An aggregate over a **set** is a different operation, and nothing addresses it. An engineer summing forty opportunities where twelve return `INSUFFICIENT_DATA` will do one of two things, and **both are wrong**:

| | What they'd do | Why it is false |
|---|---|---|
| **(a)** | Treat `INSUFFICIENT_DATA` as zero and sum the rest | A confidently-stated headline that **silently omits twelve opportunities**. The number looks complete and is not |
| **(b)** | Apply contagion literally — any member `INSUFFICIENT_DATA` makes the aggregate `INSUFFICIENT_DATA` | The headline is **permanently uncomputable**, since some member always fails. The product has no North Star number, ever |

**The fix.**

> **Contagion applies to the inputs of a value. Exclusion applies to the members of a set — and an excluded member must be disclosed, never silently dropped.**
>
> An aggregate over findings states: the computed total · **the count of excluded members** · **their observed magnitude where any is known** · and **that the total is therefore a lower bound.**

This invents nothing — it is D-041's rule (*the number declares its own incompleteness*) applied to aggregation, and the direction is the same: **the omission is always optimistic.**

## ⚠ H3. D-012 requires a range and never says what its bounds are — **FIXED, D-044**

**The misunderstanding.** *"Expressed as a range, not a point"* is locked. **No construction is specified.** An engineer must produce two numbers, and the available moves are ±20%, a confidence-derived interval, or a standard deviation — **every one of them an invented constant**, forbidden by rule 15 and D-017.

**This is the number the entire product is judged on.**

**The fix — a range whose bounds are each themselves defensible figures, requiring no probability:**

```
LOWER BOUND   findings passing every gate whose every input is
              ACTUAL or CALCULATED

UPPER BOUND   the lower bound PLUS findings passing every gate that
              carry an ESTIMATED or ASSUMED input, each disclosed

Neither bound is a confidence interval. Both are sums of real claims,
partitioned by evidence class. Below both: excluded members, per D-043.
```

**Why this rather than a statistical interval.** It answers *"how much of this is solid?"* — which is the question a finance manager actually asks — rather than *"how uncertain is this number?"*, which cannot be answered without inventing a distribution. It is a **construction from locked material** (D-002's basis values, D-019's gates), not a new constant.

## ⚠ H4. `Confidence` is a required field with no defined rule — **FIXED, D-045**

**The misunderstanding.** The Saving Opportunity object carries **Confidence**, described as *"per a defined rule (`A-03`), never a judgement call."* **`A-03` is unanswered.** Rule 15 forbids category constants. An engineer facing a required field with no formula will synthesise one — most likely a weighted blend of gate outcomes, which is precisely the *"gates are never averaged and never become scores"* prohibition.

**The fix — resolution by removal, not by invention.**

> **The MVP carries no synthesised confidence score.** It carries **evidence strength** (D-026 — already defined, already an attribute) and **coverage facts stated plainly**: *"root cause classified on 7 of 9 events" · "lead-time sample: 11 receipts over 14 months" · "cost reference age: 9 days."*
>
> A `Confidence` value is introduced only when `A-03` defines one.

**A stated coverage fact is more useful to a finance manager than a synthesised score, and it cannot be wrong.** This is a genuine scope reduction that removes the most likely single source of an invented constant.

## ⚠ H5. Rules 11 and 12 set the history bar and never say what the annual figure *is* — **FIXED, D-046**

**The misunderstanding.** With twelve months of history an engineer computes an annual figure. With eighteen, they must choose a window; with fourteen, they may scale. `sum × (12 / months_observed)` is the obvious move and it is **extrapolation wearing arithmetic's clothing.**

**The fix.**

> **Annualisation is a claim that the intervention prevents recurrence — not a claim that the past repeats, and never a scaling of a partial window.**
>
> The annual figure is the **observed figure over a stated twelve-month window**, FX-normalised per D-042, with the window explicitly declared. Where more than twelve months exist, the most recent twelve are used unless the intervention's evidence spans longer, and **which window was used is shown**. Below twelve months: **no annual figure at all** — `OPPORTUNITY DETECTED` without currency (rule 12, D-019).

**And a distinction that will otherwise be conflated:** rule 11's twelve months is a **history minimum**; D-022's twelve months is a **verification window**. Two different twelves, two different clocks.

## ⚠ H6. Two documents still carried the superseded deduplication rule — **FIXED in this block**

`03-saving-opportunity-model.md` §5 and build plan `U-18b` both said **"deduplicated by subject."** D-020 replaced that with **economic-mechanism level** — because a single subject can carry two genuinely independent effects, and subject-level deduplication **suppresses one of them**.

**The false result.** Understatement, silently. An air-freight premium and a spot-price premium on the same PO line are different economic mechanisms; deduplicating by subject discards one and **misdirects the fix**.

**Also fixed:** §4.4's live `(current price − best comparable price) × annual volume` formula (Part F).

## H7–H10. Tested and found already governed

| Candidate misunderstanding | Why it does not survive |
|---|---|
| *"An Opportunity without a signature can't be presented — so suppress exposures too"* | D-031 rule 3 and standard 10e-3 state exposure carries **no** signature. Unambiguous |
| *"`INSUFFICIENT_DATA` is an error path"* | Stated as a designed, rendered state in D-002, standard 9, and U-01's acceptance. Three places |
| *"Corrections mean editing"* | D-001 as amended now distinguishes reversal from return explicitly, and standards 1, 1a, 2 cover it |
| *"Round inside the loop"* | Standards 4 and 6 are explicit about exact decimals and rounding boundaries |

## H11. One promotion, from the audit

**"Unestablished is never a pass"** existed only inside the Mechanism 02 lock. It is a general property of every gate in every mechanism, and Mechanism 01's MVP slice has gates. **Promoted to a cross-cutting code standard.** Treating unknown as equivalent is the likeliest route to a manufactured saving, and it would present as a data bug rather than a financial one.

---

# EXIT

> ### **The MVP domain contract is frozen enough to build without inventing economic rules during implementation.**

**What that statement rests on.** Every unresolved item in the project is classified — nothing is "future work." Every MVP-blocking item is either a decision only you can make, a fact only the factory has, or a defect fixed in this block. **Six specification gaps that would each have produced a false financial result are closed.** No formula, rate, threshold, weight, probability, service level, materiality number or confidence constant remains undefined anywhere an engineer would need one.

**What it does not claim.** That the MVP will produce a saving figure. It cannot — that depends on `F-01`, `F-06` and `F-07`, and **an MVP that returns `INSUFFICIENT_DATA` for every opportunity, with each gap named, is a passing MVP.**

**Nine decisions and twelve facts stand between this contract and a build.** None of them is a design question.
