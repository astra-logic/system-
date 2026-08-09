# 19 — BLOCK 6: MVP Completion Readiness & Block 5 Verification

> ## 🔍 READ-ONLY AUDIT — 2026-08-09
> **No code modified. No feature created. No UI redesigned. No domain rule invented.**
> Findings come from inspecting the repository, the schema, the tests and the running database — **not** from the Block 5 report, which was deliberately set aside and then checked against reality.

**Four material findings, three of which contradict the Block 5 report.** They are in §1.1.

---

# 1. VERIFICATION OF BLOCK 5

## 1.1 ⚠ The four findings that matter

### FINDING 1 — `verifyProjection` is a tautology. MVP acceptance criterion 4 is **not** verified.

```ts
export async function verifyProjection(itemId, at) {
  const recomputed = await balanceAt(itemId, at);          // sums +to, −from over ALL buckets
  const rows = await db.select(...).from(balances).where(eq(balances.itemId, itemId));
  const projected = rows.reduce(...);                       // sums balances across ALL locations
  return { agreed: projected.equals(recomputed), ... };
}
```

`balanceAt` without `onHandOnly` adds the quantity for the destination and subtracts it for the source, over every movement — so **it is identically zero by construction**. `projected` sums the balance rows across every location — **also zero, by the same conservation**. The function compares zero to zero.

**Measured, on the live demo database:**

```
item     balanceAt(no opts)   sum(balances)   agreed
CP-001            0                 0          true
RM-001            0                 0          true
RM-002            0               0.0          true
RM-003            0                 0          true
RM-004            0                 0          true
RM-005            0                 0          true
```

**It would return `true` even if every balance row were wrong**, provided they still summed to zero — which they must, since `applyToBalance` always writes a matched pair.

**Worse, the historical claim is untested.** `balances` has columns `item_id, location_id, qty, uom, updated_at` — **no time dimension**. The `at` parameter is passed to `balanceAt` and then compared against a *current-state* projection. The docstring says *"at any historical instant, not only at the present"*; the function cannot test that, and no test does.

> **The Block 5 report listed acceptance criterion 4 as met. It is not.** `positionAt` and `balanceAt` are genuinely correct and genuinely tested (the point-in-time tests in `ledger.test.ts` are real and do exercise history). What is not verified is the **agreement between the stored projection and history** — which is the actual U-07 criterion.

**Status: TECHNICAL DEBT — and a false green light.** The ledger is probably correct; the test that is supposed to prove it proves nothing.

### FINDING 2 — Every finding-model table is empty. Findings are transient.

**Measured:**

```
opportunities 0 · exposures 0 · observed_costs 0 · evidence_gaps 0 · gate_results 0
decisions 0 · baselines 0 · outcomes 0 · contradictions 0
signature_dimensions 0 · finding_links 0 · audit_events 0
```

`grep` for insert sites across `lib/`, `app/` and `scripts/` returns **zero** for all twelve. Opportunities are computed in memory by `runDetection` on every page request and discarded.

**What this actually costs:**

| Locked requirement | Consequence |
|---|---|
| D-011 lifecycle `POTENTIAL → APPROVED → IN_PROGRESS → REALIZED` | **Impossible.** There is no record to transition |
| D-011 baseline captured at `APPROVED` | **Impossible.** Nothing to attach it to |
| D-022 12-month verification | **Impossible.** No baseline, no outcome |
| DP-07 adjudication | **Impossible.** No decision record |
| Capability 11 auditability | **Partial.** The ledger is auditable; the *findings* are not — there is no record of what the system claimed, when, or on what evidence |

> The Block 5 report said *"tables and rules exist; no approval UI."* That understated it. **The system of record for findings does not exist.** The engine is real; its output is ephemeral.

**Status: NOT IMPLEMENTED** (persistence layer), **VERIFIED COMPLETE** (computation layer).

### FINDING 3 — The import pipeline is never called outside tests. The journey does not start where the diagram says.

`recordBatch`, `readSheet` and `parseFile` appear **nowhere** in `app/` or `scripts/`. The demo seed performs **30 direct writes** via `db.insert` and `postMovement`. The UI contains **no form, no server action, no POST** — it is entirely read-only.

**No spreadsheet has ever passed through the importer into the ledger.** The parsers are correct and well tested in isolation (11 tests); they are not wired to anything.

**Status: PARTIALLY IMPLEMENTED — unit-tested, unwired.**

### FINDING 4 — Contradiction detection cannot fire in the live engine.

`m01-leadtime.ts` emits one opportunity per item, with `id: m01:${itemId}` and `subject: { type: "ITEM", itemId }`. `detectContradictions` requires **the same subject**. With exactly one mechanism producing at most one opportunity per item, **two opportunities never share a subject**.

The logic is correct and unit-tested (5 tests, including the important negative cases). It is **structurally unreachable in production** until a second mechanism exists.

**Status: VERIFIED COMPLETE as logic · UNREACHABLE in the live path.** Not a defect — a consequence of a one-mechanism MVP, and worth stating so nobody mistakes "0 contradictions" for evidence that the control works.

## 1.2 Full claim-by-claim verification

| Block 5 claim | Reality | Status |
|---|---|---|
| 34 TypeScript files | 34 tracked `.ts`/`.tsx` | **VERIFIED COMPLETE** |
| 5,598 lines | 5,580 tracked (report counted 18 lines of untracked config) | **VERIFIED** — immaterial |
| 68 tests passing | 68 pass, 3 files | **VERIFIED COMPLETE** |
| typecheck clean | `tsc --noEmit` silent | **VERIFIED COMPLETE** |
| app builds and renders | 5 routes, all HTTP 200 | **VERIFIED COMPLETE** |
| Ledger implemented | Conservation, immutability, duplicate refusal, opening-balance segregation, return≠reversal, catch-weight — all enforced and tested | **VERIFIED COMPLETE** |
| — its projection verification | Tautological (Finding 1) | **TECHNICAL DEBT** |
| Provenance implemented | Envelope, contagion, floor, exclusion, `INSUFFICIENT_DATA` as designed state | **VERIFIED COMPLETE** |
| Exact decimal arithmetic | Branded types, runtime rejection of `number`, driver returns strings, round-trip test | **VERIFIED COMPLETE** |
| Catch-weight dual quantity | Enforced both ways; balances on actual; refuses to post without weight | **VERIFIED COMPLETE** |
| FX normalisation | Per-amount effective date, verified across the demo devaluation | **VERIFIED COMPLETE** |
| Mechanism 01 lead-time slice | 7 gates, event-level counterfactual, derived correction | **VERIFIED COMPLETE** (computation) |
| Aggregation | Evidence-partition range, exclusion disclosed, one-time separated | **VERIFIED COMPLETE** |
| Contradiction detection | Correct; unreachable live (Finding 4) | **VERIFIED / UNREACHABLE** |
| Import pipeline | Parsers correct, unwired (Finding 3) | **PARTIALLY IMPLEMENTED** |
| Demo corpus | 6 items, 8 POs, 5 expedites, partials, catch-weight, devaluation | **MOCKED / DEMO ONLY** — correctly marked |
| UI pages | 5, read-only | **PARTIALLY IMPLEMENTED** |
| Financial adversarial tests | 39, all pass | **VERIFIED COMPLETE** |
| Audit trail | `audit_events` never written (Finding 2) | **NOT IMPLEMENTED** |
| Roles / permissions | Enum and users exist; **no auth, no enforcement anywhere** | **NOT IMPLEMENTED** |
| Approval / decision / outcome | No write path (Finding 2) | **NOT IMPLEMENTED** |

---

# 2. THE A-18 CONTRADICTION — RESOLVED

## 2.1 The evidence

`A-18` appears **exactly once in the entire codebase**, and it is in a comment:

```ts
// lib/engine/run.ts:117-127
/**
 * ⚠ Not yet determinable from recorded data.
 * Whether correcting a lead time requires holding more inventory depends on
 * the factory's coverage policy, which is A-18 / N-11 and unanswered. …
 */
requiresAdditionalInventory: null,
```

- **No code reads A-18.** No query, no threshold, no branch.
- **No schema column exists** for a coverage policy, an excess/dead threshold or a service level.
- `requiresAdditionalInventory` is a **hardcoded `null`** at the single call site. There is no computation that attempts to determine it and fails.

## 2.2 The answers

| Question | Answer |
|---|---|
| **Does Mechanism 01 require A-18?** | **No.** A-18 is the excess ↔ dead-stock boundary. Mechanism 01 never classifies stock as excess or dead |
| **Does the current net calculation require A-18?** | **No.** It requires knowing whether the correction raises average inventory, and if so its carrying cost. Neither is A-18 |
| **Is A-18 a Mechanism 03 dependency only?** | **Yes.** D-035 gives excess and dead different capital treatment; only Mechanism 03 reads that boundary |
| **Why does the live engine return `INSUFFICIENT_DATA`?** | Because `requiresAdditionalInventory` is passed as `null`, the `OFFSET_DETERMINABLE` gate reports `UNESTABLISHED`, and the net is refused |
| **What exact missing fact causes it?** | ⚠ **None. No fact is missing.** The value is `null` because **nothing computes it** |
| **Genuine MVP blocker, or one calculation?** | **Neither a factory blocker nor a domain blocker. It is an unimplemented computation** — the last unbuilt step of the MVP's only mechanism |

## 2.3 ⚠ The contradiction, named

> **The code comment is wrong, and it is the sole source of the apparent contradiction.**
>
> It attributes an **implementation gap** to a **factory-data gap**. Statement A of the Block 5 report ("A-18/N-11 is blocking the net") was written from that comment and inherited its error. **D-053 is correct and governs.**

**This matters beyond tidiness.** A blocker labelled *"waiting on the factory"* goes on the factory request pack and waits. A blocker labelled *"not built"* goes in the next build. **The mislabel would have sent the team to ask the factory a question that could not have unblocked anything.**

## 2.4 What would actually determine it — stated, not built

Whether correcting the master lead time from 18 to 38 days raises average inventory is answerable **entirely from recorded data**:

```
reorder point = lead-time demand + safety stock
```

Correcting an understated lead time raises lead-time demand, which raises the reorder point. Whether the **trough** rises depends on whether the factory was already, in practice, running below its intended buffer — which the **observed position path** shows, and which D-039 already specifies how to obtain (replay recorded issues against the counterfactual policy).

⚠ **The domain is itself conditional here, and that is not a defect.** D-015 says lead-time correction *"may reduce future expedites **without** requiring additional inventory"* because it makes existing policy behave as intended. Mechanism 01 §8 says *"most interventions work by holding more stock — raising a reorder point, adding safety stock, **ordering earlier**"* and that this carries a cost. **Both are true of different items**, which is precisely why the answer must be computed per item rather than assumed either way.

**Recommendation: the code comment must be corrected and the computation built. Neither is done in this block.**

---

# 3. LOCKED RULES — RULE → IMPLEMENTATION → TEST → STATUS

| Rule | Implementation | Test | Status |
|---|---|---|---|
| **No invented savings** | `m01-leadtime.ts` — 7 gates, each returning a named reason; correction value derived as observed maximum, never chosen | Q1 · 5 tests, incl. root-cause-vs-evidence disagreement | **HOLDS** |
| **Missing evidence ≠ equivalence** | `gates.ts` — `eligibleForCurrency` requires every gate `PASS`; no `score`, `weight` or `average` export exists | Q5 · 5 tests, one asserting those exports are absent | **HOLDS** |
| **No exposure in Potential Annual Saving** | `findings.ts` separate types; `aggregate.ts` filters on `class`, `assertAggregable` throws; no `promoteExposure` exists anywhere | Q3 · 5 tests | **HOLDS — structurally.** ⚠ Untested against a *persisted* exposure, because none can exist (Finding 2) |
| **No forecast promoted to actual** | `provenance.ts` — `derive` takes the weakest basis and caps at `CALCULATED`; `value()` refuses `INSUFFICIENT_DATA` | Q4 · 4 tests | **HOLDS** |
| **No inappropriate financial rate** | `rate.ts` — `requireRate` blocks on purpose mismatch, `UNSTATED`, expiry, non-`ACTIVE`; `classifyComponent` puts obsolescence in `EXPOSURE` | Q6 · 8 tests | **HOLDS** — ⚠ and never exercised live: no rate is consumed, because the offset is unbuilt |
| **No principal as recurring benefit** | `aggregate.ts` — `oneTimeSeparate` computed apart and never added; `refuseToAnnualiseOneTime` exists | Q8 · 3 tests | **HOLDS** |
| **No double counting** | `aggregate.ts` dedupe entries carry `explanation` and `amountRemoved`; independent effects on one subject are preserved | Q2 · 2 tests | **HOLDS** — ⚠ dedupe input is a caller-supplied parameter; **no automatic detector exists** |
| **Contradiction control** | `signature.ts` — 4-way intersection; `assertPresentable` refuses signature-less opportunities | Q7 · 5 tests, incl. 3 negative cases | **HOLDS — unreachable live** (Finding 4) |
| **Provenance contagion** | `derive`, `weakestBasis`, `partitionForAggregate` | Q4 + Q5 · 6 tests | **HOLDS** |
| **Exact decimal arithmetic** | `decimal.ts` branded types, runtime `number` rejection, `numeric` columns, string round-trip | Float guard · 2 tests + ledger drift test | **HOLDS** |
| **Append-only ledger** | `post.ts` — no update or delete path; `reverseMovement` posts a new row; unique index on natural key | `ledger.test.ts` · 18 tests | **HOLDS** — ⚠ projection agreement is not actually verified (Finding 1) |
| **Catch-weight integrity** | Refuses to post without an actual weight; refuses an actual on a non-catch-weight item; balances on actual | Ledger · 3 tests | **HOLDS** |
| **Effective-dated FX** | `fx.ts` — `rateOn` selects the latest rate **on or before** the amount's own date; never a later or current one | Q6 · 2 tests | **HOLDS** |

> `FACT` **No locked rule has been weakened by the implementation.** Three carry an asterisk — projection verification, exposure aggregation, and the automatic dedupe detector — and all three are **gaps in verification or completeness, not violations**.

---

# 4. THE LIVE DEMO JOURNEY — TRACED

I reconciled the engine's output against an **independent SQL query** written specifically not to reuse engine code.

| Step | Where the number comes from | Mocked? |
|---|---|---|
| **DATA** | ⚠ **`scripts/seed-demo.ts`, 30 direct `db.insert` / `postMovement` calls.** The importer is bypassed | **The journey does not start at import** |
| **LEDGER** | Real. Every movement posted through `postMovement`, all validations enforced, balances projected in-transaction | No |
| **DETECTION** | Real. `runDetection` queries `po_lines`, `receipts`, `expedite_events` | No |
| **EVIDENCE GATES** | Real. 7 gates evaluated from those rows. Live result: 6 `PASS`, 1 `UNESTABLISHED` | No |
| **COUNTERFACTUAL** | Real, event-level. Observed lead times **33, 36, 31, 38** days vs master **18** | No |
| **COST / OFFSET** | ⚠ **Hardcoded `null`.** The single unbuilt step | **Not mocked — unimplemented** |
| **AGGREGATION** | Real. Excluded, disclosed, marked lower bound | No |
| **OPPORTUNITY** | Real — **and transient.** Never persisted (Finding 2) | No |
| **UI** | Real. Server-rendered from the same call | No |

## 4.1 The arithmetic, reconciled to source rows

```
PO       ordered     received   lead  root cause            premium   FX rate      EGP
PO-1001  2025-09-01  2025-10-04   33  INCORRECT_LEAD_TIME   9,800 USD  30.90    302,820
PO-1002  2026-01-05  2026-02-10   36  INCORRECT_LEAD_TIME  11,200 USD  30.95    346,640
PO-1007  2026-02-10  2026-03-12   30  (unclassified)        5,400 USD  47.60    257,040
PO-1003  2026-05-04  2026-06-04   31  INCORRECT_LEAD_TIME   9,400 USD  47.60    447,440
PO-1004  2026-09-07  2026-10-15   38  INCORRECT_LEAD_TIME  12,600 USD  48.50    611,100
```

**Independent sum of all four attributed events: 1,708,000 EGP. The engine reports 1,405,180 EGP.**

The difference is **exactly PO-1001's 302,820** — its expedite occurred 2025-10-04, **outside the twelve-month window** ending at the as-of date. `346,640 + 447,440 + 611,100 = 1,405,180`. ✓

> **Every number reconciles.** Each premium is FX-normalised at **its own** effective date — 30.90, 30.95, 47.60, 48.50 — not at a single current rate. Had the current rate been applied to all four, the total would have been materially higher and the growth would have been pure currency movement. **This is D-042 working on live data.**

## 4.2 ⚠ One presentation inconsistency

The counterfactual sentence cites **four** observed lead times *(33, 36, 31, 38)*; the figure covers **three** events. The window is disclosed in the coverage facts but **not in the counterfactual sentence**, so a reader counting events against the number will not reconcile them.

**Minor, real, and cheap to fix. Not fixed here.**

## 4.3 Verdict

> **The demo is genuinely end-to-end from the ledger onward. It is not end-to-end from a file.** One step is unimplemented (the offset) and one is bypassed (import). Nothing between them is faked.

---

# 5. REMAINING WORK, IN FOUR SEPARATE CATEGORIES

## A. REQUIRED TO DEMO THE MVP

1. **Compute the offset** — the one unbuilt calculation. Without it every claim ends at `INSUFFICIENT_DATA`, and a manager sees no number at all.
2. **Persist findings** — opportunities, gates, signatures, evidence gaps. Without persistence there is no lifecycle to show and no record of what was claimed.
3. **Wire the importer to a real upload** — the journey must start at a spreadsheet, because that is what a factory will hand over.
4. **Fix `verifyProjection`** — the trust page currently displays a green tick earned by a tautology. Showing that to a finance manager is worse than showing nothing.
5. **Disclose the annualisation window in the counterfactual** (§4.2).

## B. REQUIRED TO VALIDATE WITH A REAL FACTORY

`F-06` how an expedite is recognised · `F-01` freight separability · `F-09` lead-time quality · `F-07` FX policy and rate history · `F-41` partial receipts · `F-05` will buyers classify root cause · `B-07` the pilot dataset itself.

**None of these can be built. They can only be asked for** — see §7.

## C. REQUIRED FOR PRODUCTION

Authentication (none exists) · role enforcement, including the DP-07 adjudicator-independence check (modelled, unenforced) · `audit_events` writing · migrations rather than `db-push` · connection-pool and error handling · backup and restore · rate limiting · secrets management · the `next build` extensionless-import constraint.

## D. FUTURE DOMAIN / MECHANISM WORK

Mechanism 02 · Mechanism 03 · `Q-08` decomposition engine · `A-18` excess/dead boundary · `Q-09`…`Q-12` · the automatic double-counting detector · the logistics-cost domain (`B3-02`).

**None of these should delay the MVP.**

---

# 6. THE MINIMUM NEXT BUILD

## BLOCK 7 — CLOSE THE LOOP

**Objective.** Take the MVP from *"the engine is right and produces no number"* to *"a factory manager can upload a spreadsheet, see a defensible figure or a named reason there isn't one, and act on it."*

### Exact features — five, no more

| # | Feature | Why it is in the minimum |
|---|---|---|
| 1 | **Offset determination** — compute whether the correction raises average inventory, from the observed position path; consume `F-08` components through `requireRate` where it does | The only reason no number exists today |
| 2 | **Finding persistence** — write opportunities, gate results, signatures and evidence gaps on each run, keyed for idempotency | Without it there is no lifecycle, no baseline, no audit |
| 3 | **Approve / reject** — the `POTENTIAL → APPROVED` transition, a decision record, a baseline snapshot of **inputs and method**, and the adjudicator-independence check | The journey's "USER DECISION" step, currently absent |
| 4 | **Upload screen** — file → existing parsers → ledger, showing the existing rejection report | Makes the journey start where the diagram says |
| 5 | **Real projection verification** — compare per-location balances against per-location recomputation, at a historical instant | Removes a false green light |

### Files likely affected

`lib/engine/offset.ts` *(new)* · `lib/engine/persist.ts` *(new)* · `lib/engine/run.ts` · `lib/engine/mechanisms/m01-leadtime.ts` *(call site only)* · `lib/ledger/post.ts` *(`verifyProjection`)* · `app/import/page.tsx` *(new)* · `app/opportunities/page.tsx` · `lib/audit.ts` *(new)* · `tests/offset.test.ts`, `tests/persist.test.ts`, `tests/journey.test.ts` *(new)*.

### Tests required

Offset returns a determination or a named refusal, never a default · a rate whose purpose is `INVENTORY_VALUATION` is **blocked** for the offset · re-running detection does not duplicate findings · `APPROVED` without an independent adjudicator records the conflict rather than hiding it · a baseline recomputes to the same output · **`verifyProjection` fails when a balance row is deliberately corrupted** *(the test that cannot pass today)* · a spreadsheet flows end to end into balances · a malformed spreadsheet is rejected with the reason and imports nothing.

### Acceptance criteria

1. A manager uploads a file and sees stock, orders and receipts.
2. Detection produces **either** a net figure **or** a named missing input — never a silent zero.
3. Opportunities survive a restart and carry their lifecycle.
4. Approval captures a baseline that recomputes identically.
5. Corrupting one balance row makes `verifyProjection` **fail**.
6. All 68 existing tests still pass.

### Intentionally unfinished after Block 7

Authentication · realization measurement (needs 12 elapsed months) · Mechanisms 02 and 03 · automatic dedupe · `audit_events` beyond decisions · production hardening · every item in category D.

---

# 7. FACTORY DATA REQUEST PACK

> ⚠ **We have a pilot factory and no dataset.** Everything in the running system is demo fixtures, marked `isDemo` at the data layer. **No figure produced so far is a claim about any real business.**

## 7.1 MANDATORY FOR THE CURRENT MVP

### Files — four spreadsheets

| File | Columns required | Why |
|---|---|---|
| **Items** | `code · name · kind` (process/discrete) `· stock_uom · catch_weight` (Y/N) `· nominal_uom` (if catch-weight) `· lead_time_days` | Nothing matches without codes; lead time is the parameter the mechanism tests |
| **Stock movements** *(24 months if available)* | `natural_key · item_code · from_location · to_location · quantity · uom · actual_quantity` (catch-weight) `· effective_date · reason_code · document_type · document_id · cost_centre` | The ledger seed and the consumption history |
| **Purchase orders** *(lines)* | `po_number · line_no · supplier_code · item_code · quantity · uom · unit_price · currency · ordered_date · promised_date · expedited · freight_mode` | The spine. **`ordered_date` is non-negotiable** — lead time cannot be measured without it |
| **Receipts** | `natural_key · po_number · line_no · sequence · received_date · quantity · uom · actual_quantity` | ⚠ **`sequence` matters most.** A three-instalment delivery recorded as one receipt makes the position path wrong |

### Dates and units — non-negotiable

**All dates ISO `YYYY-MM-DD`.** `03/04/2026` is rejected, not guessed — in a year with a devaluation, a month's error changes the FX rate applied and therefore the money.

**Every quantity carries its unit.** Catch-weight items need both the ordering unit and the weighing unit.

### Business answers — seven questions, no files needed

| | Question | Ref |
|---|---|---|
| 1 | **How do you record that an order was expedited today** — a flag, a freight-mode field, a reason code, or not at all? | `F-06` — ⚠ **without this the mechanism has no events** |
| 2 | Does your freight invoice show cost **per shipment**, and can it be attributed to PO lines? | `F-01` — decides currency vs event counts |
| 3 | Who maintains lead times in the item master, and when were they last reviewed? | `F-09` |
| 4 | What FX rate does Finance use, from what source, and do you keep **rate history**? | `F-07` — ⚠ a single current rate is not usable |
| 5 | Would buyers classify **why** an expedite happened, at the time, from a short list? | `F-05` — behavioural, not a data question |
| 6 | Who could approve a saving claim **independently of the person who made the purchasing decision**? | `F-24`/`F-25`, DP-07 |
| 7 | Who owns data quality for the item master and for transactions? | `F-37` |

### Evidence — supporting documents

FX rate history for the covered period · one sample freight invoice · one sample PO and its receipts · the current item-master extract.

## 7.2 USEFUL LATER — **do not delay the MVP for these**

Supplier terms *(MOQ, order multiple, incoterms, payment terms — `F-15`, `F-16`, `F-44`)* · quotations including **declined** ones *(`F-12` — gates **Mechanism 02**)* · purchase contracts *(`F-13`)* · price-break structures and volume rebates *(`F-26`, `F-28`)* · carrying-cost **components and the purpose each was built for** *(`F-08` — ⚠ ask what the rate was constructed for, not just its value)* · cost-of-funds rate, effective-dated *(`F-22`)* · ordering cost *(`F-31`)* · is warehouse space constrained *(`F-33`)* · customs and demurrage charges *(`F-02`)* · shelf lives *(`F-34`)* · disposal cost and recovery value *(`F-38`)* · substitute items *(`F-27`)*.

---

# 8. FINAL OUTPUT

## 1. CURRENT STATE

A **correct, well-tested economic engine with an ephemeral output and a disconnected front door.** 5,580 lines, 68 tests, typecheck clean, five routes rendering. The ledger, provenance, arithmetic, FX and gate logic are genuinely production-shaped. Findings are computed and thrown away; spreadsheets cannot get in; no number reaches a manager.

## 2. VERIFIED COMPLETE

Ledger *(conservation, immutability, duplicate refusal, opening-balance segregation, return≠reversal, catch-weight, point-in-time reconstruction)* · provenance envelope with contagion and exclusion · exact decimal arithmetic with runtime float rejection · effective-dated FX normalisation · Mechanism 01's counterfactual and seven gates · annualisation windowing · evidence-partition range with disclosed exclusions · contradiction logic *(unreachable live)* · import parsers *(unwired)* · 39 adversarial financial tests · demo corpus, structurally marked.

## 3. INCOMPLETE

**Offset determination** *(hardcoded `null`)* · **finding persistence** *(12 empty tables, zero write paths)* · **import wiring** *(never called outside tests)* · **`verifyProjection`** *(tautology)* · approval, baseline, outcome · audit-event writing · authentication and role enforcement · counterfactual window disclosure.

## 4. BLOCKED

**Nothing is blocked by the factory for the MVP's *correctness*.** Factory data gates **currency**, not the build: `F-06` gates detection · `F-01` and `F-07` gate currency · `F-09` gates the claim · `F-41` gates accuracy · `B-07` gates validation. **`F-08` is not on the MVP path**, because Mechanism 01's slice was chosen to avoid it — and it becomes relevant only for items whose correction turns out to require more stock.

## 5. CONTRADICTIONS FOUND

**Three, all in the Block 5 report, none in the domain.**

1. ⚠ **The A-18 mislabel.** `run.ts`'s comment attributes an unimplemented computation to a missing factory fact. **D-053 governs: A-18 is not an MVP dependency.** Nothing in the code reads it. The correct statement is *"the offset is not built."* Left uncorrected in this audit; **must be fixed in Block 7.**
2. ⚠ **Acceptance criterion 4 was reported met and is not.** `verifyProjection` compares zero to zero.
3. ⚠ **"Tables and rules exist; no approval UI" understated Finding 2.** Twelve tables have no write path at all.

**One conditional tension inside the domain, which is not a defect:** D-015 says a lead-time correction *may* need no extra inventory; Mechanism 01 §8 says ordering earlier carries a carrying cost. **Both hold for different items** — which is why the offset must be computed per item rather than assumed.

## 6. NEXT BLOCK

**BLOCK 7 — CLOSE THE LOOP.** Five features: offset determination · finding persistence · approve/reject with baseline and adjudicator independence · upload screen · real projection verification. Full specification in §6.

## 7. FACTORY DATA REQUEST

**Four spreadsheets, seven questions, ISO dates, units on every quantity** — §7.1. The single most important item is **question 1**: how the factory records an expedite today. Without it the mechanism has no events, and everything downstream is moot. **Everything in §7.2 is for Mechanisms 02 and 03 and must not delay the MVP.**

## 8. DO NOT BUILD YET

Mechanism 02 · Mechanism 03 · the decomposition engine · the automatic double-counting detector · realization measurement *(needs twelve elapsed months)* · the executive dashboard · maps, current location and supplier location *(read by no mechanism)* · AI features · multi-site · multi-currency transacting · production hardening beyond what Block 7 needs · **and no economic mechanism, of any kind, during implementation.**

---

**Audit complete. No code modified. Nothing implemented.**
