# 15 — BLOCK 1: Foundation & Governance Closure

> ## ⚠ ANALYSIS ONLY — NOTHING LOCKED, NOTHING APPLIED
> No locked decision modified. No amendment applied. No factory evidence invented. No assumption converted to fact.
> **No code, no UI, no schemas. Block 2 not started.** **Date:** 2026-08-07

---

# PHASE 1 — Source of truth

Read from the repository, not from memory. Dependencies established **by search** (`grep` across the register, code standards, build plan and domain documents), not by recall.

**D-001 verbatim:**
> Stock truth is an immutable, double-entry ledger of movements. Balances are derived projections. Corrections are reversing entries, never edits.

**D-002 verbatim:**
> Every derived value carries `{value, unit, basis, as_of, inputs, assumptions, confidence, limitations}`. Basis degrades contagiously — anything computed from a forecast is at best a forecast, and an aggregate carries the *weakest* basis among its components. `INSUFFICIENT_DATA` is a designed state, not an error.
> *Amended:* eight basis values including `STALE_DATA`.

Both `PROPOSED`. Both cited directly by code standards. Both depended on by locked decisions.

---

# PHASE 2 — ADVERSARIAL TEST: D-001

Twenty-two scenarios. **Fourteen pass cleanly. Eight expose something.**

## Passes without ambiguity

| Scenario | Why it holds |
|---|---|
| Inventory movements | The core case |
| Receipts | `Supplier` virtual counterparty → stock location |
| Issues | Stock → `Production` / consumption bucket (D-010) |
| Adjustments | Stock ↔ `Adjustment` bucket, reason code mandatory |
| Transfers | Location → location |
| Partial receipts | One movement for the received quantity; the PO stays open |
| Partial orders | Same — the open remainder is a document state, not a ledger state |
| Late-arriving events | Effective vs recorded date, both in the movement record |
| Backdated events | Explicitly named in D-001's rationale |
| Multi-site | `In Transit` bucket exists; D-004 supplies the site dimension |
| Closing balances | A projection at a point in time |
| Actual vs projected | On-hand from the ledger; projected needs documents — consistent with F3 |
| Purchases | A PO is a *commitment*, not a movement. Correctly produces no ledger entry |
| Cancellations (unreceived) | Nothing moved, nothing to record |

## ⚠ FINDING A — Opening balances have no counterparty. **BLOCKING.**

`FACT` D-001's bucket list is `Supplier · Customer · Production · Scrap · Adjustment/Inventory Loss · In Transit · Quality Hold`.

On go-live the factory already holds stock. In a **double-entry** ledger that stock must come *from* somewhere. The only available bucket is `Adjustment` — and using it means **every item shows a large day-one adjustment**.

That is not cosmetic. D-001's own rationale makes **count accuracy over time the trust metric for the whole system**. Seeding via `Adjustment` poisons that metric at birth and makes the first year of adjustment analytics meaningless.

**A migration/opening counterparty is required.** The system cannot go live without one.

## ⚠ FINDING B — No idempotency. **BLOCKING.**

`FACT` D-001 is append-only and accepts every well-formed movement. If the same receipt is recorded twice — a re-run Excel import, a double scan, a re-sent integration message — **the ledger accepts both, and both are individually valid.**

The correction is a reversing entry, but D-001 provides **no mechanism to detect the duplicate in the first place**. Stock is silently overstated, and the discrepancy surfaces only at the next physical count — as an "adjustment", which is the same metric Finding A already threatens.

`FACT` The project's stated import path is **Excel** (`P-03`). Re-importing a corrected spreadsheet is the single most likely operational event in the first months of use.

**A movement needs a source-system natural key and a duplicate-rejection rule.** Without it, append-only guarantees the *preservation* of corruption rather than protection from it.

## ⚠ FINDING C — Source-record drift. **Should fix; not blocking.**

`FACT` D-001 requires every movement to **cite a source document**. It says nothing about what happens when that source **changes or is deleted** after import.

An ERP row edited later, or a spreadsheet re-issued with different values, leaves an immutable movement pointing at a source that no longer says what it said. **The ledger stays immutable; its evidence does not.**

`ASSUMPTION` The fix is likely to capture the source as an **immutable snapshot at import**, not a live reference. Not proposed as the answer — it is one option, and the choice interacts with import architecture.

## ⚠ FINDING D — In-transit ownership is undefined. **Should fix; needs `F-15`.**

`FACT` `In Transit` exists as a bucket, but D-001 does not say **whose stock is in it.**

Under EXW/FOB, ownership passes at origin — the goods are ours in transit and belong in the ledger. Under DDP, they remain the supplier's until delivery — they are *Incoming* under F3, **not a movement at all**.

**The same physical shipment is either a ledger entry or not, depending on the incoterm.** That is a real accounting fork with a real balance-sheet consequence, and it is currently unstated.

`EVIDENCE GAP` — `F-15` (incoterms recorded per PO) determines whether this is even answerable per shipment.

## ⚠ FINDING E — Return versus reversal. **Should fix; not blocking.**

`FACT` D-001 says *"corrections are reversing entries, never edits."*

A **return to supplier is not a correction.** The receipt was right; the goods physically went back. Recording it as a reversal asserts the receipt was erroneous, which corrupts both receipt history and supplier-performance evidence.

The distinction is available — a return is `stock → Supplier` with its own reason code — but **D-001 does not draw it**, and the wording invites the wrong reading.

## ⚠ FINDING F — F10 dimensions absent from the movement record. **BLOCKING.**

`FACT` — previously reported, restated because it blocks this lock.

F2's minimum movement record carries `Cost effect — value impact of this movement`. **D-028 (LOCKED) requires** original amount · currency · FX rate · rate date · quantity · unit basis · UoM · period boundary.

The build plan's U-07 acceptance already demands them. **Locking D-001 as written would lock a movement record that cannot satisfy a decision already locked above it.**

## ⚠ FINDING G — Commercial documents are ungoverned. **Missing decision; not blocking D-001.**

`FACT` Mechanism 02 rests entirely on PO lines, quotations, contracts and price changes. **None are stock movements.** D-012's U-12 requires *"post-send changes recorded as history, not mutations"* — but no decision states it.

D-001 is **not wrong** here; it never claimed document scope. The gap is a **missing decision**, and it must exist before Mechanism 02 is built.

## ⚠ FINDING H — Point-in-time reconstruction implied, not stated. **Should fix.**

`FACT` 4.7's backtest requires a **balance curve** — *"on-hand never fell below L over 12 months"* — not a current balance. Immutability plus double-entry make it derivable, and U-07's acceptance criteria assert it. **D-001 itself never names it as a required capability**, so a maintained-current-balance implementation could satisfy D-001's letter and make 4.7 impossible.

## Verdict on the question D-001 exists to answer

> **Does D-001 truly provide the authoritative source of inventory truth?**

**Yes for the model; not yet for the implementation contract.** The double-entry immutable design is sound and survived twenty-two scenarios without a structural failure. What it lacks is **three operational guarantees** — an origin for opening stock, protection against duplicate ingestion, and the capture dimensions a locked decision above it already requires.

---

# PHASE 3 — ADVERSARIAL TEST: D-002

Eighteen sources tested.

## ⚠ FINDING I — Raw values have no basis. **BLOCKING.**

`FACT` D-002 says *"every **derived** value carries…"*. A PO price is raw. An imported on-hand figure is raw.

If raw values carry no `basis`, then **an aggregate mixing raw and derived cannot compute a weakest basis** — the contagion rule has a hole at its own base. Every mechanism aggregates raw with derived.

## ⚠ FINDING J — `as_of` is ambiguous. **BLOCKING.**

`FACT` F5 establishes **two** timestamps — effective time and recorded time. The envelope carries **one** `as_of`.

Which is it? The answer determines whether a figure can be **reproduced**. *"Potential Annual Saving as at 30 June"* means different things under each, and D-014 rule 10 requires effective date on financial inputs — implying effective — while `as_of` reads naturally as recorded.

**Reproducibility is the point of provenance.** An ambiguous timestamp defeats it.

## ⚠ FINDING K — Imported and third-party-asserted data have no home in the basis list

`FACT` Two distinct cases, neither covered:

| Case | Problem |
|---|---|
| **Imported, unverified** — an Excel row asserting *"on hand = 1,200"* | It is a **claim by the factory**, not an observation by us. Is it `ACTUAL` or `USER_DEFINED`? |
| **Third-party asserted** — a supplier's quoted lead time, or a **declined quotation** | Mechanism 02 treats declined quotations as evidence of availability. **What basis does a supplier's claim carry?** |

The second matters more than it looks: M02's entire counterfactual can rest on a quotation, and the basis list has no value expressing *"asserted by a counterparty, unverified by us."*

## ⚠ FINDING L — `ESTIMATED` and `ASSUMED` have no stated boundary

`FACT` Both exist in the eight-value list. **Nothing anywhere defines what separates them.** An implementer would guess, and two implementers would guess differently — which is precisely the failure D-002 exists to prevent.

## ⚠ FINDING M — No conflict-resolution concept

`FACT` The envelope has `inputs` but **no precedence.** When the ERP says on-hand 1,200 and a count says 1,150, D-001 resolves it for stock — the ledger is truth, the count creates an adjustment. **For non-stock data there is no equivalent.** Two price sources disagreeing have no defined winner.

## ⚠ FINDING N — `STALE_DATA` scope is unclear

`FACT` D-002's amendment introduces `STALE_DATA` in the context of the **cost reference** ageing past `N-09`. It does not say whether staleness is a **general** property of any aged value or a **cost-specific** one. Both readings are defensible from the text.

## ⚠ FINDING O — Whether inputs carry their own `as_of` is unstated

`FACT` The Saving Opportunity object specifies **`Data freshness` — age of the oldest input**. That is computable **only if each input carries its own `as_of`.** The envelope gives `as_of` to the value and `inputs` as references. Whether references carry their own envelopes is not stated.

## The honest verdict on the question D-002 exists to answer

> **Does D-002 actually prevent unsupported financial claims?**

**It prevents mislabelling. It does not prevent misuse.**

| Prevented | Not prevented |
|---|---|
| Unlabelled numbers | A **correctly-labelled** number built on a **misapplied input** — DP-15's carrying rate is `ACTUAL`, finance-owned, and the wrong instrument |
| Forecast silently presented as fact | **Conflicting sources** silently resolved (Finding M) |
| Zero substituted for unknown | **Unverified imports** presented as observed (Finding K) |
| Aggregation laundering | A defensible-looking basis chain resting on a **counterparty's claim** |

`FACT` **This limitation is why the rate-fitness question exists at all.** It is not a flaw to be fixed inside D-002 — provenance answers *what a number is*, not *whether using it here is appropriate*. But it must be stated, or D-002 will be trusted to do a job it was never designed for.

---

# PHASE 4 — DEPENDENCY AUDIT

Established by search. **Nothing is invalidated.**

## D-001 dependency surface

| Dependent | Cited or inferred | Verdict |
|---|---|---|
| Code standards rules 1, 2 | **Cited** | **Compatible** |
| D-006 vertical slice | **Cited** | **Compatible** |
| D-028 F10 | **Cited** — *"expands the movement record (F2)"* | ⚠ **Needs amendment** — Finding F |
| D-031 (W-48 derived view) | **Cited** — *"as balances are projections of the ledger"* | **Compatible** |
| D-019 evidence ladder | Inferred | **Needs clarification** — depends on Finding H |
| D-022 realization window | Inferred | **Needs clarification** — baseline needs point-in-time |
| D-025 `OBSERVED COST` is `ACTUAL` | Inferred | **Needs clarification** — Finding K bears on whether imported cost is `ACTUAL` |
| Mechanism 01 | Consumption, receipts | **Compatible** |
| Mechanism 02 | ⚠ Rests on **documents, not movements** | **Needs a new decision** — Finding G |
| Build plan U-07, U-09, U-10 | Acceptance criteria | **Compatible** — U-07 already anticipates F10 |

## D-002 dependency surface

| Dependent | Cited or inferred | Verdict |
|---|---|---|
| Code standards rules 7, 10b | **Cited** | **Compatible** |
| D-012 | **Cited** — *"Depends on: D-002, D-011"* | **Compatible** |
| D-014 rules 10, 13 | **Cited** — extends and confirms | ⚠ **Needs clarification** — rule 10 implies effective-dating; Finding J |
| D-024 FX | **Cited** — Area F4 | **Compatible** |
| D-025 amendment | **Cited** | **Compatible** — D-025 is *stricter*, which is intended |
| D-028 F10 | **Cited** — *"Reconciles: D-024, D-012, D-002"* | **Compatible** |
| D-021, D-027, D-029, D-031 | Inferred | **Compatible** |
| Saving Opportunity `Data freshness` | Object field | ⚠ **Needs clarification** — Finding O |
| Build plan U-01 | Acceptance criteria | **Compatible** |

**`FACT` — no dependency is invalidated by any finding. Seven need clarification; one (D-028 vs F2) needs amendment; one (documents) needs a decision that does not yet exist.**

---

# PHASE 5 — FACTORY REALITY TEST

| Finding | A · domain logic | B · factory evidence | C · technical architecture | D · undecidable yet |
|---|:--:|:--:|:--:|:--:|
| A Opening balances | ● | | | |
| B Idempotency | ● | partly — what key the source provides | ● | |
| C Source drift | ● policy | ● do they edit/re-issue? | ● | |
| D In-transit ownership | ● policy | ● **`F-15` incoterms** | | |
| E Return vs reversal | ● | | | |
| F F10 dimensions | ● already decided | | | |
| G Documents | ● | | | |
| H Point-in-time | ● | | ● | |
| I Raw basis | ● | | | |
| J `as_of` | ● | | | |
| K Imported / asserted basis | ● | | | |
| L `ESTIMATED` vs `ASSUMED` | ● | | | |
| M Conflict resolution | ● policy | ● which sources exist | | |
| N `STALE_DATA` scope | ● | | | |
| O Inputs carry `as_of` | ● | | | |

> **`FACT` — thirteen of fifteen findings are decidable from domain logic alone. Only two require factory evidence at all, and only one (`F-15`) is genuinely gating for its finding.**
>
> **The foundations can be closed almost entirely without the factory.** That is the most useful result of this block.

---

# PHASE 6 — LOCK READINESS

## D-001 — **NEEDS REVISION**

Not blocked by factory evidence. **Three blocking findings; five follow-on.**

### Proposed amendment — additive only, core decision unchanged. **NOT APPLIED.**

The decision sentence — *"Stock truth is an immutable, double-entry ledger of movements. Balances are derived projections. Corrections are reversing entries, never edits."* — **is not altered.** Everything below is added.

```
ADD to the bucket list:
    OPENING BALANCE / MIGRATION
    — the counterparty for stock existing at go-live or at data migration.
    Never used for operational events. Segregated from ADJUSTMENT so that
    count-accuracy analytics are not polluted at birth.

ADD to the minimum movement record:
    Source-system natural key   — the identity of the originating record,
                                  used to reject duplicate ingestion
    F10 capture dimensions      — original amount · currency · FX rate ·
                                  rate date · quantity · unit basis · UoM ·
                                  period boundary, AS APPLICABLE to the event
                                  and never invented where absent (D-028)

ADD as a stated capability:
    Point-in-time reconstruction — the balance of any item at any past
    instant is derivable from the ledger. A maintained current balance
    alone does not satisfy this decision.

ADD as a clarification:
    A RETURN is a movement (stock → Supplier), not a reversal. Reversals
    assert that a recorded event was wrong; returns assert that goods
    physically went back. The two must not be conflated.

CROSS-REFERENCE:
    F5 period locking governs where a backdated correction may be posted.
```

### Deliberately excluded from the amendment

| | Why |
|---|---|
| **In-transit ownership** (Finding D) | Depends on `F-15`. **Should be its own decision**, not guessed inside this one |
| **Source-record drift** (Finding C) | Interacts with import architecture, which is undecided. Its own decision |
| **Commercial documents** (Finding G) | Different objects, different lifecycle. **Its own decision, required before Mechanism 02** |

## D-002 — **NEEDS REVISION**

Not blocked by factory evidence. **Two blocking findings; five follow-on.**

### Proposed amendment — additive only. **NOT APPLIED.**

```
CLARIFY scope:
    Every value the system asserts carries the envelope — not only derived
    values. A raw value carries basis ACTUAL (observed) or USER_DEFINED
    (asserted), so that contagion has a defined floor.

CLARIFY as_of:
    as_of is the EFFECTIVE time of the value, per F5. Recorded time is
    carried separately. Reproducibility depends on this distinction.

STATE the limitation explicitly:
    Provenance establishes WHAT a number is. It does not establish whether
    using that number in a given calculation is APPROPRIATE. A correctly
    labelled value may still be the wrong instrument for a decision.
```

### Deliberately excluded from the amendment

`ESTIMATED` vs `ASSUMED` boundary · imported/third-party-asserted basis values · conflict resolution · `STALE_DATA` scope · whether inputs carry their own `as_of`.

**Each is a real gap.** None blocks the lock, because each concerns *which* value to use rather than *whether the envelope exists*. `ASSUMPTION` — they are better resolved as a single follow-on decision on **basis semantics** than by five separate patches.

---

# PHASE 7 — GOVERNANCE CLOSURE

**Neither foundation is safe to lock as written. Both are safe to lock after the amendments above, and neither is blocked by factory evidence.**

## Propagation surface, if the amendments are approved

| Target | Change |
|---|---|
| `docs/domain/01-factory-operating-model.md` F2 | Bucket list + minimum movement record + point-in-time + return clarification |
| `docs/domain/01-factory-operating-model.md` F4 | Scope, `as_of`, stated limitation |
| Decision register D-001, D-002 | Status → `LOCKED`, amendments recorded with original text preserved |
| `context/code-standards.md` | New rules: no duplicate ingestion · opening-balance bucket is never operational · return ≠ reversal |
| `context/specs/00-build-plan.md` U-07 | Add duplicate rejection and opening-balance seeding to acceptance criteria |
| `context/architecture.md` | D-001, D-002 move from proposed to locked positions |
| `docs/open-questions.md` | Three new decisions recorded; `F-15` linked to in-transit ownership |

## Stale references found

`FACT` **One**, previously reported and still present: **D-031's status line does not record its own W-49 amendment** while its body does. Unlike D-025's, which says `AMENDED` explicitly. **Not corrected** — reported.

## Requires new decisions (do not exist today)

1. **Commercial-document immutability** — required before Mechanism 02 is built
2. **In-transit ownership** — incoterm-driven; needs `F-15`
3. **Source-record drift** — interacts with import architecture
4. **Basis semantics** — the five D-002 follow-on gaps as one decision

---

# EXIT REPORT

## A. D-001 verdict

> **NEEDS REVISION.** Not blocked by factory evidence.

The double-entry immutable model **survived twenty-two adversarial scenarios without a structural failure** — it is sound. Three operational guarantees are missing and are blocking: **an origin for opening stock**, **duplicate-ingestion protection**, and **the F10 capture dimensions a locked decision above it already requires**. All three are additive; the core decision sentence does not change.

## B. D-002 verdict

> **NEEDS REVISION.** Not blocked by factory evidence.

Two blocking gaps: **raw values have no basis**, leaving contagion without a floor; and **`as_of` is ambiguous** between effective and recorded time, which defeats reproducibility — the point of provenance.

And one limitation that must be **stated rather than fixed**: **D-002 prevents mislabelling, not misuse.**

## C. Decisions requiring amendment

| | |
|---|---|
| **D-001** | Three blocking additions |
| **D-002** | Two blocking clarifications + one stated limitation |
| **D-031** | Status line does not record its own amendment — cosmetic, breaks audit trail |
| **F2 / F4** in the factory operating model | Must receive the same amendments |

## D. Decisions remaining valid

**All of D-014, D-017 … D-032 remain valid.** No locked decision is invalidated by any finding. Seven need clarification once the foundations are amended; **none needs re-deciding.**

D-006, D-012, D-031 and the build plan are compatible as written.

## E. Factory evidence required

> **Almost none — and this is the block's most useful finding.**

**Thirteen of fifteen findings are decidable from domain logic alone.** Only two touch the factory:

- **`F-15` incoterms** — gates in-transit ownership (excluded from this lock deliberately)
- **Do they edit or re-issue source records?** — informs source-drift policy

## F. Technical consequences

Duplicate rejection requires a **natural key** on ingestion — an import-architecture requirement, not just a rule. Point-in-time reconstruction constrains the **projection strategy** (`A-01`) — an async projection must still support historical replay. The opening-balance bucket must be **structurally incapable** of use by operational events, or it will drift into being another adjustment channel.

## G. Exact actions you must approve

1. **Approve or revise the D-001 amendment** — three additions, one clarification, one cross-reference
2. **Approve or revise the D-002 amendment** — two clarifications, one stated limitation
3. **Approve promotion of both to `LOCKED`** once amended
4. **Authorise four new decisions** to be opened: document immutability · in-transit ownership · source drift · basis semantics
5. **Decide whether to correct D-031's status line** — cosmetic, reported not fixed

## H. Exact next step for Block 2

**Do not start Block 2 until items 1–3 above are approved.**

`FACT` — Block 2 (whatever its content) inherits a **corrected, locked foundation** only if this block closes. If Block 2 begins with D-001 and D-002 still `PROPOSED`, it repeats the governance gap this block exists to close, one layer higher.

**On approval, the propagation surface in Phase 7 is executed — and nothing else.**

---

**Nothing locked. Nothing applied. Awaiting your approval.**
