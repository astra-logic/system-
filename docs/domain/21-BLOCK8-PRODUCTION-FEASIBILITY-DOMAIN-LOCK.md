# Block 8 — Production Feasibility: domain resolution, adversarial challenge, reconciliation

**Date:** 2026-08-10 · **Status:** analysis complete; **nothing locked by this document**
**Preceded by:** `20-PRODUCT-ARCHITECTURE-RECONCILIATION.md` · **Blocks:** Block 9 implementation

> **This document contains no code, no schema, no route, no component and no migration.**
> It amends no decision. It proposes amendments and records what must be authorised.

---

## 1. Executive summary

### 1.1 What was verified, not assumed

Every claim below was checked against the repository, not carried forward from a previous report.

| Checked | Result |
|---|---|
| BoM anywhere in code | **None.** `grep` over `lib/ app/ tests/` returns nothing |
| BoM in documentation | **Five places say it is out:** D-007 · `02-first-release-scope.md` ×2 (incl. *"load-bearing"*) · `00-build-plan.md` ×2 |
| Reservation model | **`D-050` LOCKED — none exists.** `Available = On hand − Quality hold` |
| Safety-stock / minimum-stock field | **None in `items` or anywhere in `lib/db/schema.ts`** |
| Working-calendar concept | **None anywhere** |
| Lead-time sources | **Three:** `items.leadTimeDays`, `supplierItemTerms.leadTimeDays`, observed-from-receipts |
| Expected-date sources | **Two:** `poLines.promisedDate` (`USER_DEFINED`), `etaForecasts.etaDate` (pinned `FORECAST`) |
| PO lifecycle | `DRAFT · APPROVED · SENT · PARTIALLY_RECEIVED · RECEIVED · CANCELLED` — **no supplier-acknowledgement state** |
| UoM conversions | `uom_conversions` exists, **versioned, per item — still no write path** |
| Mechanism 01's lead-time correction | **Observed maximum**, not an average — `m01-leadtime.ts:224` |

### 1.2 The seven findings that changed the proposal

**① The netting model is already locked, and it is not new.**
`01-factory-operating-model.md` F3 defines **`Projected available at date t = Available + Incoming due ≤ t − Outgoing due ≤ t`**. That *is* the feasibility calculation. Production Feasibility does not introduce a new inventory concept — it applies a locked F3 definition to a BoM-exploded requirement. This materially reduces the risk of the capability and is the single strongest argument that it belongs in this system.

**② The stated product experience is under-specified, and the gap is load-bearing.**
The example input — *"I need to produce 10,000 units"* — **contains no date.** The example output — *"Order 4,500 kg of Material X by Tuesday"* — **contains a deadline.** A deadline is `need-by date − lead time`. With no need-by date there is no anchor, and **"Tuesday" is not derivable from the stated input.** This is reported rather than papered over; §18.1 gives the resolution.

**③ D-050's reasoning depends on nothing in the MVP being able to create a commitment.**
D-050 dissolves `A-02` (hard vs soft reservation — a **class A, must-resolve-before-MVP** item) on the grounds that *"the MVP has no sales orders and no manufacturing orders, so nothing can create a commitment; `Reserved` is structurally always zero."* **If a feasibility request were persisted as anything a calculation reads, it becomes the first commitment source in the system and `A-02` reopens as a class A blocker.** The transience of the request is not a stylistic preference — it is what holds a locked decision up.

**④ Amending D-007 and D-010 reopens two questions recorded as closed.**
`B-02` (*"What is the MVP boundary?"*) is `ANSWERED → D-007` with the words *"no production… BoMs or MRP."* `A-14` (*"Which planning methodologies at first release?"*) is `CLOSED` with *"reorder point / min–max only. No MRP (D-010)."* Both must be reopened and re-answered, not silently left stale.

**⑤ Catch-weight breaks the recommendation, and D-048 says so explicitly.**
For a catch-weight item, balances and consumption are in **actual**, order fulfilment is in **nominal**. A shortfall computed in kg cannot become a purchase quantity in supplier units without an expected nominal→actual relationship, **which is recorded nowhere** — and D-048's binding rule is *"`actual_qty` is never invented."* §11 resolves this without inventing a conversion.

**⑥ No role in D-051 can ask this question.**
D-051 locks five roles: `WAREHOUSE_OPERATOR · INVENTORY_MANAGER · BUYER · ADJUDICATOR · ADMINISTRATOR`. A production feasibility question is asked by a production manager or planner. **The capability currently has no user in the locked role model.** This is the one item this block judges genuinely `NOT READY TO LOCK`.

**⑦ A correction to this project's own prior document.**
`20-PRODUCT-ARCHITECTURE-RECONCILIATION.md` claimed Production Planning *"is the key that unblocks the most currently-blocked domain — stockout valuation, D-037's blind spots, verification at Actual Outcome."* **That claim is wrong for the capability now proposed.** D-037's blind spots are unobservability of *what actually happened* — demand suppression, rescheduling, missed orders. Only production **execution** (L3) observes those. **L0+ observes nothing; it asks a question.** The claim holds for L3 and is withdrawn for L0+.

### 1.3 Verdict on the four decisions

| | Survives attack? | Lock readiness |
|---|---|---|
| **D-054** scope | **Yes**, with the boundary tightened in three places | `READY` — **pending product-owner authorisation of a scope change** |
| **D-055** object status | **Yes**, and strengthened by D-050 | `READY TO LOCK` |
| **D-056** timing | **Yes**, with a new required input (need-by date) | `READY TO LOCK` |
| **D-057** verdict | **Yes**, with the aggregation rule now *derived* rather than chosen | `READY TO LOCK` |
| **D-058** *(new, forced)* | The capability has no user role | **`NOT READY`** — requires a D-051 extension |

**Factory questions: one blocking, down from seven.** Every other question acquired a defined fallback during the analysis, which is what a fallback is for.

---

## 2. Current architecture reconciliation

### 2.1 Decisions this capability touches, and how

| Decision | Status | Interaction | Outcome |
|---|---|---|---|
| **D-001** append-only ledger | `LOCKED` | Feasibility **writes no movement** | ✅ Untouched |
| **D-002** provenance envelope | `LOCKED` | The verdict *is* the basis partition rendered | ✅ Enabler, not obstacle |
| **D-004** site-scoped | `PROPOSED` | Requirement, BoM and stock are all one site | ✅ Untouched |
| **D-007** MVP wedge, *"BoMs… are out"* | `ACCEPTED` | **Direct conflict** | ⚠ **Amendment required** |
| **D-008** finance owns valuation | `ACCEPTED` | A BoM invites cost roll-up | ⚠ **Must be excluded explicitly** |
| **D-009** per-item behaviour | `ACCEPTED` | Explosion must handle integer-only + catch-weight | ⚠ **Governs §11, §12** |
| **D-010** demand is observed consumption | `PROPOSED` | **Conflict, narrower than it appears** | ⚠ **Amendment required** |
| **D-011** PAS North Star; ops = `ENABLER` | `ACCEPTED` | Feasibility is an `ENABLER` by construction | ✅ No new class |
| **D-012** headline range | `PROPOSED` | **Leakage risk** | ⚠ **Firewall required (D-055)** |
| **D-014** 16 trust rules, esp. rule 15 | `ACCEPTED` | Forbids invented category constants | ✅ **Governs D-057** |
| **D-017** categorical, never weighted | `LOCKED` | Forbids scoring the verdict | ✅ **Governs D-057** |
| **D-019** three-state evidence ladder | `LOCKED` | Feasibility is **not even at rung one** | ✅ Confirms "not a Finding" |
| **D-023** rate purpose-fitness | `LOCKED` | Feasibility uses **no rate at all** | ✅ Untouched |
| **D-025** finding classes | `LOCKED` | Provides the "outside the hierarchy" precedent (`EVIDENCE GAP`) | ✅ **Pattern reused** |
| **D-029** intervention signature | `LOCKED` | *"Order more"* vs *"order less"* is a real collision | ⚠ **Resolved in D-055** |
| **D-030** mechanism boundary | `LOCKED` | Its text could capture feasibility | ⚠ **Must be excluded explicitly** |
| **D-035** component-wise carrying cost | `LOCKED` | **No money in a feasibility answer** | ✅ Untouched |
| **D-037** safety stock | `LOCKED` | Different question — see §16 | ✅ **Must not be imported** |
| **D-041** the net declares incompleteness | `LOCKED` | **Pattern reused** for the 🟢 cap | ✅ Precedent |
| **D-042** FX / multi-currency | `LOCKED` | No currency in the answer | ✅ Untouched |
| **D-044** headline range = evidence partition | `LOCKED` | **The construction D-057 reuses** | ✅ **Precedent** |
| **D-046** annualisation | `LOCKED` | Nothing annualised | ✅ Untouched |
| **D-047** stack | `LOCKED` | — | ✅ Untouched |
| **D-048** catch-weight two quantities | `LOCKED` | **Binds §11 hard** | ⚠ **Governs §11** |
| **D-049** synchronous projection | `LOCKED` | Feasibility reads; consistency guaranteed | ✅ Beneficial |
| **D-050** no reservation; `Available` defined | `LOCKED` | ⚠ **Its premise is at risk** — finding ③ | ⚠ **Constrains D-055** |
| **D-051** five roles | `LOCKED` | **No role can ask the question** | ⚠ **`NOT READY` — D-058** |
| **D-052** cost-centre dimension | `LOCKED` | Unrelated | ✅ Untouched |

**Twelve decisions untouched · nine constrain the design · four require amendment or extension.**

### 2.2 Documents that must move together

Amending D-007 without these leaves an engineer reading a contradiction:

| File | Text |
|---|---|
| `docs/decisions/decision-register.md` D-007 | *"Production, maintenance, full quality, BoMs, MRP and capacity are out."* |
| `docs/domain/02-first-release-scope.md:49` | *"…MRP · capacity planning · BoMs · routings…"* |
| `docs/domain/02-first-release-scope.md:68` | *"**BoMs are out, and this is load-bearing.**"* |
| `docs/domain/02-first-release-scope.md:108` | *"MRP is genuinely absent, not deferred UI."* |
| `context/specs/00-build-plan.md:76` | *"Identity, type, UoM, tracking policy… **No BoM.**"* |
| `context/specs/00-build-plan.md:224` | *"No production, BoMs, routings…"* |
| `docs/open-questions.md` `B-02` | `ANSWERED` — *"No production… BoMs or MRP"* |
| `docs/open-questions.md` `A-14` | `CLOSED` — *"reorder point / min–max only. No MRP"* |

### 2.3 Register inconsistencies found — reported, not fixed

Per the project rule that inconsistencies are reported rather than quietly corrected:

| # | Inconsistency | Evidence |
|---|---|---|
| **R-01** | **`A-16` carries two contradictory statuses in one file.** Tier 2 line 44: `DEFERRED`. Block 4 class D line 335: **`RETIRED`** → D-008/D-010 | `docs/open-questions.md` |
| **R-02** | **Code standard 13 governs a domain D-007 excludes.** *"A manufacturing order freezes its BoM and routing version at release."* No manufacturing order exists in scope | `context/code-standards.md:63` |
| **R-03** | **`A-19` still reads `OPEN` in Tier 2** though D-047 locked the stack. Other closed items were annotated; this one was not | `docs/open-questions.md:47` |
| **R-04** | **`A-02` reads `OPEN` in Tier 2 with no pointer to D-050**, which removed it from the MVP blocking set | `docs/open-questions.md:30` |
| **R-05** | **`20-PRODUCT-ARCHITECTURE-RECONCILIATION.md` overstates what Production Planning unblocks** — finding ⑦ | This document §1.2 |

**None of these blocks Block 9.** R-01 and R-02 should be corrected when D-007 is amended, since both concern the same boundary.

---

## 3. D-054 analysis — the scope boundary

### 3.1 Proposed decision

> **Production Feasibility is admitted as a bounded, read-only capability.**
>
> **D-007 is amended additively** to admit **BoM structure** — parent item · component item · quantity per · UoM · effective-from — for the sole purpose of answering a stated feasibility question.
>
> **D-010 is amended additively** to distinguish two demand channels:
>
> ```
> PLANNING DEMAND SIGNAL   historical consumption; reorder point / min–max.
>                          UNCHANGED by this decision.
>
> FEASIBILITY INPUT        a single quantity a human states in order to ask
>                          a question. USER_DEFINED. Transient. Never read
>                          by any calculation other than the answer it
>                          produced. NOT demand.
> ```
>
> **Excluded, and these exclusions do not move:** routings · work centres · capacity · scheduling · finite loading · work orders · WIP · backflush · shop-floor reporting · MRP regeneration · master production scheduling · pegging · time fences · lot-sizing engines · **BoM cost roll-up** · **persistent production plan** · automatic PO creation · supplier selection · order splitting · alternate-material substitution.

### 3.2 Adversarial attack

**Attack 1 — "Admitting BoM structure violates D-007, and D-007 calls the exclusion load-bearing."**

Correct on the first clause. The second is worth reading precisely: `02-first-release-scope.md:68` says *"BoMs are out, and this is load-bearing. **Without them there is no material requirements calculation, which is why planning is reorder-point based rather than MRP.**"* The load-bearing consequence D-007 identifies is **that planning must be reorder-point rather than MRP** — and D-054 leaves that consequence completely intact. Reorder point remains the planning method. What is admitted is a *question-answering* structure, not a *planning* structure.

D-007's own **Cost** clause anticipated this: *"No MRP, no requirements explosion, no production visibility. These are real capability gaps that must be stated plainly to users rather than disguised."* A gap stated plainly is a gap the product owner may later choose to close. **Survives — but the amendment must be explicit, and B-02 must be reopened.**

**Attack 2 — "A user-entered production requirement is exactly the demand D-010 forbids."**

D-010's rejection reads: *"Rejected: **synthesising** demand from forecasts the factory has not made — fabrication, and forbidden by §47."* Three words carry the prohibition: **synthesising**, **forecasts**, **the factory has not made**. A manager typing 10,000 fails all three tests of the prohibition — nothing is synthesised, it is not a forecast, and the factory made it.

**But the attack has a second edge that does land.** D-010's *"the demand signal is historical consumption"* is a statement about what the system's planning **reads**. If a feasibility input were ever read by planning, D-010 is violated in substance regardless of who typed the number. **The prohibition is therefore not on the input's existence but on its reach**, and D-054's amendment must be written that way. **Survives, with the amendment worded as a reach constraint rather than a source constraint.**

**Attack 3 — "Is a user-entered requirement actually demand?"**

Test against F3's own vocabulary. F3 defines **Outgoing** as *"confirmed outbound demand not yet fulfilled."* A feasibility input is not confirmed, not outbound, and creates no obligation. It does not meet F3's definition of demand and therefore does not enter `Projected available`'s `Outgoing` term. **It is a query parameter, not a demand record.** Survives cleanly.

**Attack 4 — "Does feasibility need historical consumption?"**

Only for the 🟢 cap (§8.4), and there it reads consumption **as an observed fact about the past**, not as a forward demand signal. That is the identical use D-010 already sanctions. **No conflict.**

**Attack 5 — "Can feasibility accidentally become MRP?"**

Yes, by exactly one route, and it is worth naming so it can be guarded: **persisting the plan.** MRP is not defined by having a BoM; it is defined by maintaining a time-phased plan that must be regenerated when inputs change. The moment a stored feasibility answer needs refreshing because a PO moved, the system is maintaining a plan. **The guard is D-055's transience rule, not a scope sentence.**

**Attack 6 — "Can feasibility accidentally become a saving mechanism?"**

D-030 locks *"mechanism boundaries are determined by whether the counterfactual changes the quantity purchased over the relevant defined window."* A feasibility recommendation changes quantity purchased. **A future engineer could read D-030 and route feasibility through Mechanism 03.** The reason this is wrong: D-030 governs mechanisms that make **counterfactual** claims — *"had you done X instead, you would have spent Y less."* Feasibility makes no counterfactual claim, compares to no baseline, and asserts no alternative history. It has no counterfactual, so D-030's test never engages. **D-054 must state this explicitly**, because D-030's text alone does not.

**Attack 7 — "Is one-level explosion honest?"** → §10. **Survives with the ⚪ rule.**

**Attack 8 — "Can this be built without changing the saving architecture?"**

Verified positively: no mechanism file, no gate, no finding class, no aggregate and no envelope rule requires modification. Feasibility **reads** `balances`, `movements`, `po_lines`, `receipts`, `items`, `uom_conversions`, and one new BoM structure. It **writes** nothing the engine reads. **Yes.**

### 3.3 Hidden assumption surfaced

> **D-054 assumes the finished good the user names is a distinct item that the factory does not also purchase.**

If a finished good is both made and bought, "can I produce it" and "can I get it" are different questions with different answers, and the product would answer only one. Not fatal — but it is an assumption, and it is recorded as `F-53` rather than built in.

### 3.4 Verdict

**D-054 SURVIVES.** Three tightenings are required and are incorporated above: the D-010 amendment is worded as a **reach** constraint; **D-030 non-applicability is stated explicitly**; **cost roll-up is excluded by name** to protect D-008.

`READY TO LOCK — pending product-owner authorisation`, because it changes published scope and reopens `B-02` and `A-14`. That authorisation is not mine to give.

---

## 4. D-055 analysis — what a feasibility answer *is*

### 4.1 Proposed decision

> A Production Feasibility Answer is **not a Finding**. It is outside the D-025 hierarchy entirely, in the same way `EVIDENCE GAP` is.
>
> ```
> FINDING
> ├── OPPORTUNITY        ← PAS-eligible
> ├── OBSERVED COST
> └── EXPOSURE / RISK
>
> EVIDENCE GAP           ← outside the hierarchy (D-025, W-46)
> FEASIBILITY ANSWER     ← outside the hierarchy. NEW.
> ```
>
> **Five binding rules:**
> 1. **Never PAS-eligible.** No table, column or join permits it to reach D-012's aggregate.
> 2. **Never demand.** No calculation other than the answer that produced it may read a feasibility input or answer. This includes reorder point, projected availability, and every mechanism.
> 3. **Never a counterfactual.** D-030's boundary test does not engage; feasibility is not a mechanism.
> 4. **Never a commitment.** It creates no reservation, allocation or `Outgoing`. **D-050 depends on this.**
> 5. **It must not contradict the system's own advice.** When the answer recommends ordering an item, the system displays any open `OPPORTUNITY` on that item. This is a **read at answer time**, not a stored signature.

### 4.2 Test A — could it inflate the headline?

Only if it became an `OPPORTUNITY`. D-025 already guarantees this structurally for `OBSERVED COST` and `EXPOSURE / RISK`, with stated reasoning: *"as a status, a record could become a saving through a status change or an aggregation accident: one filter forgotten, one join widened."* **The identical protection applies, by the identical mechanism — a separate structure, not a status.** ✅

### 4.3 Test B — could a recommendation be read as a saving?

**This is the sharpest version of the leakage attack, and it needs a real answer.** *"Order 4,500 kg by Tuesday, and you avoid a stockout"* looks like an avoided cost. Three independent reasons it is not, each traceable to a locked decision:

- **D-034 reclassified stockout as `EXPOSURE / RISK`**, and D-025 rule 6 forbids netting uncertain exposure against PAS. An avoided stockout was never claimable.
- **D-019's ladder** requires `OPPORTUNITY DETECTED → ANNUALIZATION ELIGIBLE`. A feasibility answer is a single forward-looking question with no observed event, so it cannot reach rung one.
- **D-046** permits an annual figure only from an observed twelve-month window. A feasibility answer observes nothing.

**A feasibility answer is structurally incapable of being annualised, and therefore incapable of contributing to PAS, even if someone tried.** ✅

### 4.4 Test C — the contradiction case

> Feasibility: *"Order 4,500 kg of Material X."*
> Mechanism 03: *"Material X is excess — defer or reduce."*

Run **D-029's own four-part test**: subject (Material X) **intersects** · dimension (quantity, timing) **intersects** · direction **opposed** · window **overlapping**. **D-029's test is satisfied exactly.** The contradiction is real and the existing engine would not see it, because feasibility answers are not Findings and carry no signature.

**Two candidate resolutions:**

| | Approach | Assessment |
|---|---|---|
| **(a)** | Not a Finding ⇒ D-029 does not apply. Do nothing | Structurally clean; produces a product that visibly contradicts itself to the same user on the same day. **Rejected on product grounds** |
| **(b)** | Display any open `OPPORTUNITY` on the same item beside the recommendation | Requires **no new financial mechanism, no stored signature, no schema change** — it is a read of existing `opportunities` rows filtered by item |

**Recommended: (b).** It is deliberately the smaller idea. The previous document framed this as *"signature without finding-hood,"* which was architectural elegance; the honest description is **a lookup**. The user sees:

> Order 4,500 kg of Material X by Tuesday.
> ⚠ There is an open saving opportunity on this material that recommends holding less of it. Ordering this quantity will work against it.

**No new mechanism. No financial claim. No netting. D-029, D-020 and D-031 are all untouched.** ✅

### 4.5 Test D — persistence, decomposed

The prompt is right that these are five different things:

| What | Permitted? | Why |
|---|---|---|
| The user's **question** (who, what, when, `as_of`) | ✅ **Yes — audit only** | An `audit_events` row. Answers *"why did we buy that?"* six months later |
| The **answer** (verdict, shortfalls, recommendation) | ✅ **Yes — audit only, immutable, snapshot** | Same row. Carries its own `as_of` and its inputs' bases |
| As **demand** | 🔴 **Forbidden** | Violates D-010 in substance |
| As a **production plan** | 🔴 **Forbidden** | This is the MRP seed — §3.2 attack 5 |
| As a **saved scenario** | 🔴 **Forbidden for the MVP** | The tempting middle. A scenario that must be refreshed when a PO moves *is* a maintained plan |

**The binding structural test, stated so an engineer can apply it without judgement:**

> **No calculation may join to the feasibility record.** It is written by the answer path and read only by a human reading an audit trail. If any query outside the audit view references it, the rule is broken.

**And the reason this is not merely tidiness:** D-050 dissolves `A-02` — a **class A, must-resolve-before-MVP** question — because *"nothing in the MVP can create a commitment."* A persisted, refreshable feasibility plan **is** a commitment source. It would reopen `A-02` as a blocker and make `Available` untruthful, which D-050 identifies as breaking inventory truth. **Transience is load-bearing.** ✅

### 4.6 Test E — showing Opportunities without becoming one

Yes, and it is one direction only: **feasibility reads `opportunities`; nothing reads feasibility.** The dependency is acyclic, so no aggregation path can be created by accident. ✅

### 4.7 Verdict

**D-055 SURVIVES, and is strengthened by D-050.** `READY TO LOCK`.

---

## 5. D-056 analysis — supply timing

### 5.1 The lead-time problem, stated precisely

Three sources exist. All three are real; none is authoritative today.

| Source | Basis | Notes |
|---|---|---|
| `items.leadTimeDays` | `USER_DEFINED` | Master data. **Mechanism 01 exists because it is often wrong** |
| `supplierItemTerms.leadTimeDays` | `USER_DEFINED` | Supplier's quote, per supplier-item, effective-dated |
| Observed (receipt − order date) | `ACTUAL` | Computed. `m01-leadtime.ts` uses the **observed maximum** for its correction |

### 5.2 Attack — "use the observed value; it is `ACTUAL` and it is true"

Superficially compelling and **wrong**, for a reason that matters.

An observed *history* is `ACTUAL`. A single number extracted from that history to predict the future is a **chosen statistic** — mean, median, max, 90th percentile — and choosing one is precisely the category constant D-014 rule 15 and D-017 forbid. Mechanism 01 can legitimately use the observed **maximum** because its claim is a bounded counterfactual (*"had master been ≥ L′, these specific events would not have triggered"*), where the maximum is forced by the requirement to cover every observed case. **A forward recommendation has no such forcing constraint**, so any statistic would be ours.

### 5.3 Decision

> **The recommended date is computed from `items.leadTimeDays`.** One source, stated basis, no statistic chosen.
>
> **`supplierItemTerms.leadTimeDays` overrides it where a supplier is identified on the shortfall** — this is not a statistic but a more specific stated value, effective-dated, and F6's per-item principle already establishes that specific beats general.
>
> **Observed lead time is never substituted into the calculation. It is displayed as a counted fact** whenever observations exist and any of them exceeds the value used:
>
> > *"Order by Tue 18 Aug — based on the recorded 30-day lead time.
> > 6 of the last 6 deliveries of this material took longer (38–44 days)."*
>
> **A count is categorical (D-017-compliant). No threshold, no "materially differs", no average.**
>
> **If no lead time exists in any source: no date is produced.** The answer states the shortfall and says *"no lead time is recorded for this material, so an order-by date cannot be calculated."* **A date is never inferred from observation alone.**

### 5.4 Expected dates

> **Incoming supply's expected date is the most recently observed statement of it**, with its source and basis named. Where `promisedDate` and the latest `etaForecasts.etaDate` disagree, **both are shown**; neither overrides the other.
>
> **This choice cannot affect 🟢.** Nothing un-received produces 🟢 (§7.3), so the date choice affects only 🟡 vs 🔴 and the printed date. *(This corrects a claim in the Block 8 preparatory analysis, which said the date choice decided 🟢 vs 🟡.)*
>
> **If a supply has no expected date at all:** it counts toward quantity, contributes 🟡 not 🟢, and is disclosed as *"expected date unknown."* It **never** produces ⚪ for the whole request — an unknown date on one delivery does not make the requirement unanswerable.

### 5.5 Calendar

> **The system does not invent a calendar.** No Egyptian weekend, no public holidays, no factory shutdown, no supplier calendar is assumed.
>
> **MVP behaviour:** the date is computed in **calendar days** and the answer **states that convention explicitly**. No weekend or holiday adjustment is applied.
>
> **When `F-50` is answered**, the convention becomes configuration and the date shifts to working days. **Until then the stated convention is the disclosure**, per §38 — a capability limit stated rather than disguised.

**Attack — "a date that may land on a Friday is worse than no date."** Considered and rejected. A stated *"order by 18 Aug (calendar days; your working calendar is not configured)"* is actionable and honest. **Withholding a date the user could act on, in order to avoid a two-day imprecision we have disclosed, is over-caution that helps nobody.** The user knows their own weekend.

### 5.6 The under-specification — need-by date

**Finding ② in full.** *"I need to produce 10,000 units"* has no date; *"by Tuesday"* requires one.

> **Decision.** The need-by date is an **optional input with a defined consequence**:
>
> ```
> NEED-BY DATE GIVEN
>     Verdict considers timing. Recommendation carries a date.
>     "Order 4,500 kg by Tue 18 Aug."
>
> NEED-BY DATE ABSENT
>     Verdict considers quantity only, and says so.
>     Recommendation carries NO deadline and states earliest arrival.
>     "You need 4,500 kg more. Ordering today, the earliest it
>      arrives is 9 Sept."
> ```
>
> **A deadline is never fabricated from an absent need-by date.**

**This is a correction to the stated product experience and requires product-owner confirmation.** The recommended resolution keeps the experience simple: the user may ask without a date and still get a useful answer; supplying a date makes the answer sharper. It never demands a date as a precondition.

### 5.7 A case the target experience omits — the recommendation can be impossible

If `need-by date − lead time < today`, then even ordering now arrives late. The correct answer is not a deadline in the past:

> 🔴 **No.** You need 4,500 kg of Material X by 20 Aug. Ordering today, the earliest arrival is 9 Sept — **20 days after you need it.**

**This is one of the most useful answers the product can give** and it falls out of the model with no extra machinery.

### 5.8 Verdict

**D-056 SURVIVES.** `READY TO LOCK`, subject to product-owner confirmation of §5.6.

---

## 6. D-057 analysis — the verdict model

### 6.1 The decision

```
🔴 NO          A shortfall exists at the need-by date even when every
               open supply is counted at its expected date.
               Deterministic — no forecast can rescue it.

🟡 AT RISK     Sufficient only because supply that has not yet been
               received is counted.

🟢 YES         Sufficient from stock already on hand.
               CAP: if the material shows consumption in the observed
               history unrelated to this request, the verdict is 🟡,
               with the reason stated. Never 🟢.

⚪ CAN'T SAY   An input required to decide is absent:
               no BoM · a component with its own BoM · UoM
               unconvertible · requirement not computable.
```

### 6.2 Why not a percentage

Every threshold construction — *green above 95%, amber 80–95%* — embeds three invented category constants in the product's most visible element. **D-014 rule 15 and D-017 forbid exactly this**, and D-045 records that an engineer facing a required field with no formula *will synthesise one*. The partition above is a **construction from locked material**: D-002's basis values and D-044's evidence-partition pattern. **No probability, percentage or score appears anywhere in it.**

### 6.3 Mutual exclusivity and exhaustivity — tested

| Property | Result |
|---|---|
| **Mutually exclusive** | ✅ The tests are ordered and disjoint: *(can I decide?)* → *(shortfall with all supply?)* → *(sufficient on-hand alone?)* → 🟡. Exactly one branch is reached |
| **Collectively exhaustive** | ✅ ⚪ is the complement of decidability; the other three partition decidable outcomes |
| **State transitions are monotone and meaningful** | ✅ Receiving supply moves 🟡 → 🟢. A delay moves 🟡 → 🔴. Supplying a BoM moves ⚪ → any. **No transition is undefined** |

### 6.4 Aggregation across components — derived, not chosen

> **Precedence: 🔴 ▸ ⚪ ▸ 🟡 ▸ 🟢.** The overall verdict is the highest-precedence state among components.

**🔴 outranks ⚪ and this is derived, not preferred.** Component X's shortfall does not depend on component Y's missing BoM. Resolving the unknown cannot remove the known blocker, and exploding a deeper BoM can only *add* requirements, never subtract them. **A known blocker is dispositive regardless of an unrelated unknown.** *(Test 20.)*

**⚪ outranks 🟡 and 🟢** because an unknown component could be a blocker, and presenting 🟢 while a component is unevaluated is precisely the partial-answer-as-complete failure §11 of the prompt forbids.

> **Per-component detail is always shown, even when the overall verdict is ⚪.** Withholding nine known answers because the tenth is unknown discards information the user needs. **The overall verdict is honest; the detail is complete.**

### 6.5 Attack — "🟡 will swallow everything"

Nearly every material has some open PO, so nearly every answer is amber. **The risk is real and is accepted, for three reasons:** it is true — factory feasibility genuinely does depend on inbound arriving; the amber card names *what* it depends on and *what would make it green*, converting a weak verdict into a specific watch-item; and if amber proves useless in pilot, **the fix is better disclosure, never a threshold.**

### 6.6 Attack — "four states is one more than a manager wants"

Rejected on **user** grounds, not architectural ones. A manager who sees 🔴 goes and buys material. If the truth was *"we don't have your BoM for this item,"* they just spent money for nothing. **"No" and "I don't know" are different instructions to a human being.** Collapsing them is not simplification — it is the specific lie traditional ERP tells, and it costs the user money.

### 6.7 Verdict

**D-057 SURVIVES**, with the aggregation rule now derived rather than asserted. `READY TO LOCK`.

---

## 7. Adversarial findings — consolidated

| # | Finding | Severity | Resolution |
|---|---|---|---|
| **AF-01** | Target experience has no need-by date but produces a deadline | **High** | §5.6 — optional input, defined consequence. **Needs owner confirmation** |
| **AF-02** | Persisting a feasibility plan reopens `A-02` (class A) via D-050 | **High** | §4.5 — audit-only; no calculation may join to it |
| **AF-03** | No D-051 role can ask the question | **High** | §23 — D-058. **`NOT READY`** |
| **AF-04** | Catch-weight shortfall cannot become a purchase quantity | **High** | §11 — state in stock unit; never invent the conversion |
| **AF-05** | D-030's text could capture feasibility as a mechanism | Medium | §3.2 — explicit non-applicability in D-054 |
| **AF-06** | `SENT` ≠ supplier-confirmed; the schema cannot distinguish them | Medium | §13.2 — disclosed limitation; `F-51` |
| **AF-07** | Amending D-007/D-010 reopens `B-02` and `A-14` | Medium | §22 — reopen explicitly |
| **AF-08** | The recommendation itself can be impossible (arrives after need) | Medium | §5.7 — a first-class answer |
| **AF-09** | Rounding up per component compounds across a large BoM | Low | §12 — round once, at the final requirement only |
| **AF-10** | A make-or-buy component makes ⚪ over-conservative | Low | `F-53`; ⚪ remains correct until answered |
| **AF-11** | Recommending an expedite creates the cost Mechanism 01 measures | Medium | §18.4 — state the fact, do not recommend the expedite |
| **AF-12** | Doc 20 overstated what Production Planning unblocks | Low | §1.2 ⑦ — withdrawn for L0+ |

**Nothing broke that could not be resolved without inventing a rule. One item (AF-03) could not be resolved at all and is reported as `NOT READY`.**

---

## 8. Final verdict model

### 8.1 Decision procedure

```
FOR THE REQUEST
  ├─ requirement quantity ≤ 0                    → REJECT INPUT (§17, tests 22–23)
  ├─ finished good integer-only, qty fractional  → REJECT INPUT (test 24)
  └─ no BoM for the finished good                → ⚪  (test 1)

FOR EACH COMPONENT
  ├─ component has its own BoM                   → ⚪  (component)
  ├─ BoM UoM ≠ stock UoM, no conversion          → ⚪  (component)
  ├─ requirement ≤ on-hand available
  │     └─ AND no unrelated consumption observed → 🟢
  │     └─ AND unrelated consumption observed    → 🟡  (§8.4 cap)
  ├─ requirement ≤ on-hand + open supply
  │        arriving by need-by date              → 🟡
  └─ otherwise                                    → 🔴

OVERALL = highest precedence present:  🔴 ▸ ⚪ ▸ 🟡 ▸ 🟢
```

### 8.2 Available — inherited, not redefined

Per **F3 as constrained by D-050**:

```
Available = On hand − Quality hold          (Reserved is structurally 0)
```

Only locations with `counts_as_on_hand = true` contribute. **Quality-hold exclusion is by the model, not a UI filter** (F3). In-transit stock is **excluded**, because `Q-10` (in-transit ownership under incoterm) is `OPEN` and gated on `F-15`.

### 8.3 Incoming — F3's definition, narrowed

F3 defines **Incoming** as *"open PO lines, inbound transfers, planned MO output."* For the MVP: **open PO lines only.** Inbound transfers do not exist (single site, D-004). **Planned MO output does not exist and must not be created** — it is production, excluded by D-054.

### 8.4 The 🟢 cap

D-041 establishes that our exclusions run **optimistic**, and that a number must declare its own incompleteness. The same danger applies here: 🟢 computed from today's on-hand ignores that the same material is consumed by everything else the factory makes, and **no reservation model exists to net it out** (D-050).

> If the material shows consumption in the observed history that is unrelated to this request, the verdict is **🟡, not 🟢**, and the answer says: *"you have enough today, but this material is used regularly — 340 kg/month over the last year — so it may not still be there when you need it."*

**This invents nothing.** It uses existing `movements` data, it is a stated observed fact, and it is conservative by construction. It is the only defensible option that does not require either a reservation model or a chosen forward-demand window.

---

## 9. Material requirement rules

### 9.1 The core calculation

```
Gross requirement (component)  = Q × R
    Q = stated production quantity      basis USER_DEFINED
    R = BoM quantity per finished unit  basis USER_DEFINED

Requirement in stock UoM       = convert(Gross, BoM UoM → stock UoM)
                                 per item, versioned (F6). No global constants.

Net requirement                = Requirement − Available − Incoming(≤ need-by)

Basis of every derived figure  = weakestBasis of its inputs  (D-002)
                                 ⇒ never better than USER_DEFINED
```

**Consequence stated plainly:** because the user's quantity is `USER_DEFINED`, **no feasibility figure is ever `ACTUAL`.** It must not be presented as though it were.

### 9.2 Classification of every factor in prompt §8

| Factor | Classification | Rule |
|---|---|---|
| **UoM conversion** | **MVP required** | Per item, versioned (F6). Missing conversion ⇒ ⚪ for that component. **Never a global default** |
| **Catch-weight** | **MVP required** | §11 |
| **Nominal vs actual** | **MVP required** | D-048's authority table, unchanged |
| **Integer-only** | **MVP required** | §12 |
| **Rounding** | **MVP required** | §12 — up, once, at the final requirement |
| **Scrap / yield / process loss** | **MVP excluded, disclosed** | The BoM quantity is used **as recorded**. No factor is applied or invented. The answer states the requirement is the recorded BoM quantity. `F-49` |
| **Alternative materials** | **MVP excluded** | `F-27` says substitutes are likely absent from master data |
| **Substitutes** | **MVP excluded** | As above |
| **Multiple locations** | **MVP required** | Sum locations where `counts_as_on_hand`; single site (D-004) |
| **Existing reservations** | **Impossible — dissolved** | D-050: `Reserved` is structurally zero |
| **Already-allocated stock** | **Impossible — dissolved** | As above. Partially mitigated by the 🟢 cap (§8.4) |
| **Open purchase orders** | **MVP required** | §13 |
| **Partial receipts** | **MVP required** | Open qty = ordered − Σ receipts. `F-41` already establishes the need |
| **Overdue POs** | **MVP required** | §13.3 — counted, flagged, never 🟢 |
| **Duplicate supplies** | **MVP required** | Idempotency already exists at ingestion; feasibility sums PO lines, so no double count |
| **Expired supplies** | **Future** | Requires shelf life on incoming; `items.shelfLifeDays` exists but `F-34` is unanswered |
| **Cancelled orders** | **MVP required** | Excluded — `CANCELLED` contributes nothing |
| **Multi-level BoM** | **MVP excluded, honestly** | §10 — ⚪, never a silent partial |

---

## 10. BoM boundary

### 10.1 What is admitted

```
parent item · component item · quantity per · UoM · effective-from
```

**Nothing else.** No routing, no operation, no work centre, no scrap field, no cost, no phantom, no alternate, no co-product, no by-product.

**Structure supports recursion** (a component may itself be a parent) **because the shape is identical either way** — the table is the same whether one level or many is traversed. **v1 traverses one level.** This costs nothing now and avoids a migration later; it is not scope creep because no code walks the second level.

### 10.2 A component with its own BoM — the four candidates

| | Behaviour | Assessment |
|---|---|---|
| (a) | Direct components only, note *"deeper BoM not evaluated"* | 🔴 **Rejected.** Treats a manufactured item as purchasable and may recommend buying something the factory makes — a *wrong* recommendation, worse than none |
| (b) | **⚪ for the overall verdict, naming the component; per-component detail still shown** | ✅ **Recommended** |
| (c) | Partial answer | 🔴 **Rejected** — the prompt's own §11 forbids it, and correctly |
| (d) | Block the answer entirely, show nothing | 🔴 **Rejected** — discards nine known answers to protect one unknown |

**(b) is the only option that is both honest and useful.** The overall verdict admits it cannot decide; the detail shows everything that *is* known.

> ⚪ **I can't say.**
> Component B is itself manufactured, so I can't tell what raw materials it needs. Everything else checks out — see below.

**Attack — "what if B is also purchased?"** Then ⚪ is over-conservative. **We cannot know without asking**, and inferring make-or-buy from the presence of supplier terms would be exactly the kind of silent inference this project forbids. Recorded as `F-53`. **⚪ remains correct until answered.**

---

## 11. Catch-weight rules

### 11.1 The problem, precisely

D-048's authority table is binding and unambiguous:

| Question | Quantity |
|---|---|
| Stock balance, coverage, position path | **actual** |
| Order fulfilment, MOQ, order multiples | **nominal** |
| Consumption / demand history | **actual** |

So for a catch-weight component: the requirement and the shortfall are in **actual** (kg), and a purchase order is placed in **nominal** (coils, drums, bags). **Converting 500 kg into a number of coils requires an expected kg-per-coil**, which exists nowhere — and D-048's binding rule is: **"`actual_qty` is never invented."**

### 11.2 Decision

> **The BoM requirement is expressed in the component's stock UoM — `actual` for a catch-weight item.**
> **Netting is on `actual`**, per D-048. Unchanged.
> **The recommendation states the shortfall in `actual`** and **does not compute a nominal purchase quantity** unless a factory-stated expected nominal→actual relationship exists for that item (`F-52`).
>
> Without `F-52`:
>
> > You need **500 kg more** of Material X.
> > This material is bought by the drum and weighed on arrival, so **the number of drums is yours to set** — we don't have a recorded average weight per drum.
>
> With `F-52` answered, the nominal quantity is computed **from the factory's stated relationship, never from a statistic we fit** — the same posture D-023 takes to carrying-cost rates and `N-11` takes to service levels: *a policy the factory states, never a model we fit.*

### 11.3 The example in the prompt

The prompt's illustration — *"Need 4,500 kg actual → Recommended purchase 4,750 kg nominal"* — **is not produceable in the MVP**, and the reason is not a limitation of effort. That 4,750 encodes an expected yield relationship the system does not hold. **Deriving it from receipt history would mean choosing a statistic (mean? median?), which is the D-017 violation.** Reported rather than quietly produced.

**When `F-52` is answered, the explanation is one plain sentence** — *"drums average 47.5 kg, so 100 drums covers 4,500 kg with the usual variance"* — and the user needs no accounting model to read it.

### 11.4 A receipt short on actual

D-048 already handles it: *"a receipt can be complete on nominal and short on `actual`… reported separately."* For feasibility, **open supply is measured on `actual` where the item is catch-weight**, so a weight-short receipt correctly leaves a residual requirement. **No new rule needed.**

---

## 12. Integer-only rules

> **A requirement on an `integerOnly` item rounds UP, to the next whole unit, exactly once, at the final net requirement.**

**Why up.** The default must never create an under-supply. Rounding 4,500.3 down to 4,500 produces a recommendation that is definitionally insufficient — the system would compute a shortfall and then recommend covering less than it.

**Why once, and at the end (AF-09).** Rounding at the gross requirement, again after conversion, and again after netting compounds the overstatement across a large BoM. **One rounding, applied to the final net figure**, bounds the overstatement at under one unit per component — immaterial, and always in the safe direction.

**Adversarial consequence tested.** For a component costing a great deal per unit, rounding up one unit is a real cost. **Accepted**, because the alternative is a recommendation that is knowingly short, and because the overstatement is visible: the answer shows the exact requirement and the rounded order quantity.

**The user's own quantity is never rounded.** If a user asks for 10,000.5 units of an integer-only finished good, the **input is rejected** with a plain request for a whole number. Silently rounding a person's stated intent is a different and worse act than rounding a derived figure. *(Test 24.)*

---

## 13. Supply rules

### 13.1 What counts

| PO status | Counts as incoming? | Why |
|---|---|---|
| `DRAFT` | 🔴 **No** | Not sent. An intention, not supply |
| `APPROVED` | 🔴 **No** | Internally approved but **the supplier does not know** |
| `SENT` | ✅ **Yes** — open qty | The supplier has it |
| `PARTIALLY_RECEIVED` | ✅ **Yes** — remaining open qty | `ordered − Σ receipts` |
| `RECEIVED` | ➖ n/a | Already in `Available` |
| `CANCELLED` | 🔴 **No** | — |

**Open quantity is always `ordered − Σ receipts`, never the PO quantity.** `F-41` exists precisely because computing from PO quantity produces fictional results.

### 13.2 The confirmation gap (AF-06)

F3 defines **Incoming** as *"**confirmed** inbound supply not yet received."* **The schema has no supplier-acknowledgement state** — `SENT` means we sent it, not that the supplier accepted it.

> **MVP behaviour:** `SENT` is treated as incoming, and **the limitation is disclosed** — *"this counts orders we've sent; we don't record whether the supplier has confirmed them."*
>
> This is why **🟡 is doing more work than it appears**, and why nothing un-received may produce 🟢. Recorded as `F-51`.

### 13.3 Overdue POs

An open PO whose expected date has passed **counts toward quantity and is flagged as overdue.**

**Rejected: excluding overdue POs.** Excluding requires a rule for *how* overdue — and any number is an invented threshold. **Including with a flag needs no threshold and states a fact.** Since nothing un-received can produce 🟢 in any case, an overdue PO cannot manufacture a false green. *(Test 18.)*

### 13.4 Stock elsewhere

| | Treatment |
|---|---|
| Another location, same site | ✅ Counted if `counts_as_on_hand` |
| Quality hold | 🔴 Excluded — F3, by the model |
| In transit | 🔴 **Excluded** — `Q-10` is `OPEN`, gated on `F-15` |
| Another site | ➖ Does not arise — single site (D-004) |
| Transfer orders | ➖ Do not exist in the MVP |
| Reserved elsewhere | ➖ **Structurally zero** (D-050) |

---

## 14. Timing rules

Consolidated from §5:

```
LEAD TIME FOR THE RECOMMENDED DATE
    supplierItemTerms.leadTimeDays  (where a supplier is identified)
    ELSE items.leadTimeDays
    ELSE no date is produced, and the answer says why

OBSERVED LEAD TIME
    Never substituted. Displayed as a COUNT whenever any observation
    exceeds the value used:  "6 of the last 6 took longer (38–44 days)"

EXPECTED ARRIVAL OF OPEN SUPPLY
    The most recently observed statement, with source and basis named.
    promisedDate and etaForecasts disagree ⇒ both shown, neither wins.
    No expected date at all ⇒ counts toward quantity, contributes 🟡,
    disclosed. NEVER ⚪ for the whole request.

NEED-BY DATE
    Optional. Absent ⇒ verdict on quantity only; recommendation states
    earliest arrival instead of a deadline. A deadline is never fabricated.

ORDER-BY DATE
    need-by − lead time. If that is before today ⇒ 🔴 with the shortfall
    in days stated (§5.7).
```

---

## 15. Calendar rules

> **No calendar is invented.** Not the Egyptian working week, not public or religious holidays, not factory shutdowns, not supplier calendars.
>
> **MVP:** calendar days, **convention stated on the answer.**
> **On `F-50`:** working days against the factory's stated calendar. Configuration, not migration.
>
> **The stated convention is the disclosure**, per §38 — an absent capability stated plainly rather than disguised.

**Why a date is still produced rather than withheld:** the imprecision is bounded, disclosed, and the user knows their own weekend. **Withholding an actionable date to avoid a disclosed two-day imprecision helps nobody.**

---

## 16. Minimum-stock treatment

### 16.1 The two questions are different, and must not be merged

| | Question | Owner |
|---|---|---|
| **Feasibility** | *"Can I physically produce this?"* | Production |
| **Saving (D-037)** | *"Can I hold less without unacceptable risk?"* | Inventory / finance |

**D-037's machinery must not be imported.** D-037 governs whether a *prospective currency claim* may be made from a backtested inventory floor — it explicitly forbids one. That has no bearing on whether material physically exists.

### 16.2 Decision

> **Feasibility is computed on physical availability. Minimum stock is never subtracted from `Available`.**
>
> **MVP:** no minimum-stock field exists, so nothing is subtracted and nothing is implied. The answer does not assert that consuming all stock is safe.
>
> **When a factory-stated minimum exists:** it is a **disclosed consequence, never a term in the verdict** —
>
> > 🟢 Yes — you have enough.
> > ⚠ This would take Material X down to 200 kg, below the 500 kg minimum you've set.
>
> **No statistical service-level model may be built**, and no safety stock may be computed — `N-11`, as constrained by D-037 and D-040: *a policy the factory states, never a parameter we fit.*

**Why disclosure rather than subtraction.** Subtracting turns "can I produce this?" into "can I produce this without breaching policy?" — a different question, answered without being asked. The user would see 🔴 on something physically achievable. **One question, one answer, consequences disclosed.** This is D-041's discipline applied to quantity instead of money.

**Answering the prompt's options: A for the MVP (no data exists), C thereafter — warning, never subtraction. Never B.**

---

## 17. Production request semantics

### 17.1 What it is

> A **transient, user-asserted feasibility input.** Basis `USER_DEFINED`. Not demand, not a forecast, not a plan, not a scenario, not a work order.

### 17.2 What may be stored

| | Permitted | Form |
|---|---|---|
| Question asked (who, what, when) | ✅ | Audit event, immutable |
| Answer produced, with `as_of` and input bases | ✅ | Audit event, immutable snapshot |
| As demand / plan / scenario | 🔴 | **Forbidden** — §4.5 |

> **Structural test: no calculation may join to the feasibility record.** Written by the answer path; read only by a human reading an audit trail.

### 17.3 Input validation

| Input | Behaviour |
|---|---|
| Quantity ≤ 0 | **Rejected**, plainly. Not ⚪ — ⚪ means *we* lack information; this is a malformed request *(tests 22–23)* |
| Fractional qty of integer-only finished good | **Rejected**, asking for a whole number *(test 24)* |
| Item that is not a parent in any BoM | **⚪**, stating no BoM is recorded *(test 1)* |

### 17.4 Answers are snapshots, never live

An answer carries `as_of` and is **never updated in place.** Re-asking recomputes and produces a **new** answer; the previous one remains as history. This mirrors D-001's append-only discipline and prevents the failure where a saved answer silently changes beneath a user who has already acted on it. *(Tests 32–36.)*

---

## 18. Recommendation rules

### 18.1 When a recommendation is permitted

| Output | Permitted when |
|---|---|
| **Shortfall quantity** | BoM, UoM conversion, position and supply are all known for that component |
| **Order quantity** | Shortfall is known **and** the item is not catch-weight without `F-52` |
| **Order-by date** | Need-by date given **and** a lead time exists in master or supplier terms |
| **"Order now"** | Shortfall known, no need-by date — with earliest arrival stated |
| **"Date unavailable"** | Shortfall known, no lead time recorded — **stated, never inferred** |
| **Nothing** | Verdict is ⚪ for that component. **A shortfall is never guessed** |

### 18.2 What the MVP must not recommend

| | Why |
|---|---|
| **Supplier selection** | Requires Mechanism 02's comparability gates — `F-15`, `F-16`, `F-21` |
| **Order splitting** | No basis. Would need ordering cost (`F-31`) and freight (`F-43`) |
| **Alternate material** | `F-27` — substitutes are likely absent from master data |
| **Automatic PO creation** | **The system recommends; the human commits** |
| **Expediting an existing order** | §18.4 |

### 18.3 MOQ and order multiples

`supplierItemTerms.moq` and `orderMultiple` exist and `F-44` establishes they are distinct. **The MVP states the raw shortfall.** Applying MOQ and rounding to an order multiple is a small, honest improvement, but it interacts with `F-42` (*will suppliers accept smaller orders; is there a minimum order value?*) — **deferred, not excluded.**

### 18.4 Expedite — a deliberate refusal (AF-11)

When an open PO exists but arrives after the need-by date, expediting is the obvious suggestion. **The MVP states the fact and does not recommend the action:**

> Your order for 4,000 kg is expected 9 Sept — **12 days after you need it.**

**Why not "expedite it".** Recommending an expedite asserts the premium is worth paying — a financial judgement requiring a comparison against the cost of not producing, which is a **stockout valuation**, and D-034 reclassified stockout as `EXPOSURE / RISK` precisely because it cannot be valued. **Recommending the expedite would create the financial claim D-034 forbids.**

There is a second reason, and it is a good demonstration of D-055 rule 5 working: **Mechanism 01 measures expedite premium as an avoidable cost.** A product that reports 1.4M EGP of avoidable expedite premium on one screen and recommends an expedite on another, silently, is incoherent. **Under D-055 rule 5 the two are shown together, and the buyer decides with both facts visible.**

---

## 19. UX contract

**This is a domain contract, not a design.** No screen, no component, no layout.

### 19.1 The four layers

| Layer | Contains | Never contains |
|---|---|---|
| **1 — ANSWER** | The verdict and one sentence. *"🟡 At risk"* | Numbers, component names, dates, sources |
| **2 — ACTION** | What to do, in one sentence per material. *"Order 4,500 kg of Material X by Tue 18 Aug."* | Derivations, bases, alternative dates |
| **3 — REASON** | Why, in the user's terms. *"You have 3,200 kg; you need 7,700 kg. An order for 4,000 kg is expected 9 Sept."* | Formulas, basis labels, table joins |
| **4 — DETAIL** | Requirement · available · incoming with sources · BoM lines · UoM conversions applied · timing basis · lead-time comparison · assumptions · missing data · source records | — |

> **A correct decision must be reachable at Layer 2.** Layer 4 is available in one interaction and required for none.
> **Every number at Layer 3 or 4 resolves to its source record** — D-002 made visible, and the structural advantage no ERP can retrofit.

### 19.2 Where the disclosures live

D-056 and D-057 add real content — two lead times, two dates, a conflicting opportunity, a calendar caveat. **This pulls against consumer-grade simplicity, and the resolution is placement, never omission:**

| Disclosure | Layer |
|---|---|
| Verdict, and 🟡's one-line dependency | 1 |
| Quantity, material, deadline | 2 |
| Observed-vs-master lead time count | **2 — a plain warning sentence** |
| Conflicting open Opportunity | **2 — the user must not act without it** |
| Calendar-days convention | 3 |
| Basis, `as_of`, weakest-basis chain | 4 |
| Excluded stock (quality hold, in transit) | 4, **and 3 when it changes the verdict** |

> **If a disclosure would change what the user does, it is Layer 2. Otherwise it is Layer 3 or 4.** That is the whole rule, and it is testable.

### 19.3 Vocabulary

| Say | Never say |
|---|---|
| "You need 4,500 kg more." | "Net material deficit = 4,500 kg" |
| "This delivery is expected Friday." | "Expected supply event has ETA = Friday" |
| "I can't say — I don't have your recipe for this product." | "⚪ INSUFFICIENT_DATA — BoM null" |
| "You have enough today, but this material gets used regularly." | "🟢 suppressed by unrelated-consumption cap" |
| "Component B is made in-house, so I can't see what it needs." | "Multi-level explosion not supported" |
| "Based on the 30-day lead time on file. The last 6 deliveries took longer." | "Master lead time USER_DEFINED; observed exceeds" |

**Banned from every user-facing string:** MRP · BoM explosion · net requirement · provenance · basis · envelope · contagion · mechanism · gate · counterfactual · annualisation · intervention signature · evidence partition · `INSUFFICIENT_DATA` · `USER_DEFINED` · finding · opportunity class · D-numbers.

> **"BoM" itself is banned.** The user's word is **recipe**, **formula**, or **what it's made of** — whichever the factory uses. `F-48` should capture their term.

**One permitted exception:** *"I don't have enough information to answer this."* That is not terminology leaking — it is the most trust-building sentence the product can say, and no competitor says it.

---

## 20. The 36 adversarial tests

**Invariant across all 36, verified individually:** no test creates a financial claim · no test creates a Finding · no test changes the headline · every test is deterministic given its inputs. **Exceptions are marked ⚠ — there are none.**

| # | Scenario | Verdict | Why | Data required |
|---|---|---|---|---|
| 1 | No BoM | ⚪ | Requirement not computable. **Not 🔴** — absence of a recipe is not absence of material | `F-48` |
| 2 | Incomplete BoM | ⚪ | We cannot know a BoM is incomplete; we can only see what is recorded. **Handled as: the components present are evaluated, and the answer states it used the recorded recipe.** ⚠ *This is the one case the system cannot self-detect* | `F-48` |
| 3 | Nested BoM | ⚪ overall | §10.2 (b); component detail shown | `F-53` improves |
| 4 | UoM conversion unavailable | ⚪ (component) | F6 forbids a global default | — |
| 5 | Catch-weight material | Verdict normal; **recommendation in `actual` only** | §11; nominal needs `F-52` | `F-52` |
| 6 | Integer-only material | Verdict normal; requirement rounds **up, once** | §12 | — |
| 7 | Enough stock on hand | 🟢 *(or 🟡 under the §8.4 cap)* | Sufficient on `ACTUAL` alone | — |
| 8 | Short, no incoming | 🔴 | Deterministic; no forecast can rescue it | — |
| 9 | Short, confirmed incoming covers it | 🟡 | Rests on un-received supply | — |
| 10 | Incoming arrives **after** need-by | 🔴 | Not available when required. Answer states the gap in days (§5.7) | need-by date |
| 11 | Incoming arrives **before** need-by | 🟡 | Still un-received | — |
| 12 | `promisedDate` conflicts with ETA | 🟡 | **Both shown, neither wins** (§5.4) | — |
| 13 | Master lead time conflicts with observed | Verdict unaffected | Date from master; observed shown as a **count** (§5.3) | `F-09` |
| 14 | Lead time missing entirely | Verdict normal; **no date** | Shortfall stated; *"no lead time recorded"* | — |
| 15 | Factory calendar missing | Verdict normal; date in **calendar days, stated** | §15 | `F-50` |
| 16 | Partial receipt | Normal | Open qty = ordered − Σ receipts | `F-41` |
| 17 | Cancelled PO | Normal, PO excluded | Contributes nothing | — |
| 18 | Overdue PO | 🟡 at best, **flagged overdue** | Counted; excluding needs a threshold (§13.3) | — |
| 19 | Components with different verdicts | Highest precedence | 🔴 ▸ ⚪ ▸ 🟡 ▸ 🟢 | — |
| 20 | One ⚪, one 🔴 | 🔴 | **Derived:** an unrelated unknown cannot remove a known blocker (§6.4) | — |
| 21 | Open Opportunity says reduce X | Verdict unchanged; **both shown** | D-055 rule 5. A lookup, not a mechanism (§4.4) | — |
| 22 | Requirement = 0 | **Input rejected** | Not ⚪ — malformed request, not missing data | — |
| 23 | Requirement negative | **Input rejected** | As above | — |
| 24 | Fractional qty, integer-only finished good | **Input rejected** | The user's stated intent is never silently rounded (§12) | — |
| 25 | Requirement exceeds all supply | 🔴 | With shortfall and earliest-arrival stated | — |
| 26 | A component has its own BoM | ⚪ overall | Same as test 3 | `F-53` |
| 27 | No minimum-stock policy | Verdict on physical availability | Nothing subtracted, nothing implied (§16) | — |
| 28 | Minimum-stock policy exists | Verdict **unchanged**; consequence **disclosed** | Never subtracted (§16.2) | factory-stated |
| 29 | Stock in another location | Counted if `counts_as_on_hand` | Quality hold and in-transit excluded (§13.4) | — |
| 30 | Stock reserved elsewhere | **Cannot arise** | D-050: `Reserved` ≡ 0. Partly mitigated by the §8.4 cap | `A-02` when reopened |
| 31 | Duplicate incoming supply | Normal | Ingestion idempotency; feasibility sums PO lines | — |
| 32 | Same request repeated | **Recomputed** | Answers are snapshots, never cached or deduped (§17.4) | — |
| 33 | 10,000 → 20,000 | **New request, new answer** | Prior answer preserved as history | — |
| 34 | Requirement changed after an answer was shown | Old answer is **stale, not wrong** | Carries `as_of`; never updated in place | — |
| 35 | PO becomes received after the answer | Old answer stale; re-ask moves 🟡 → 🟢 | **Must not silently update** — worse than stale | — |
| 36 | PO delayed after the answer | Old answer stale; re-ask may move 🟡 → 🔴 | As above | — |

**Test 2 is the only case the system cannot self-detect**, and it is recorded as a permanent, disclosed limitation rather than solved: *nothing in the data distinguishes a recipe that is complete from one that is missing a line.* The answer therefore always states that it used the recipe as recorded.

---

## 21. Factory data requirements

**Challenged against the seven previously proposed. Four acquired defined fallbacks during this analysis and are therefore no longer blocking.**

### BLOCKING — cannot implement the domain honestly without it

| ID | Question | Why it blocks |
|---|---|---|
| **F-48** | **Do BoMs / recipes exist in recorded form — and are components ever themselves made rather than bought?** *(Also capture the factory's own word for a BoM.)* | Without recipes the capability cannot exist at all. **This is the only genuinely blocking question**, and the answer may be *"they're in people's heads,"* which is itself the finding |

### VALIDATION — needed to validate the engine, not to build it

| ID | Question | Fallback if unanswered |
|---|---|---|
| **F-49** | Does the recorded BoM quantity include process loss / scrap? | Requirement uses the recorded quantity; the answer states so (§9.2) |
| **F-50** | Calendar or working days — and the factory's working week and holidays? | Calendar days, convention stated (§15) |
| **F-51** | Does the ERP record supplier acknowledgement, distinct from "sent"? | `SENT` counts; limitation disclosed (§13.2) |
| **F-52** | For catch-weight items, is there a stated expected weight per unit? | Shortfall in `actual` only; no nominal quantity (§11.2) |

### FUTURE — real, not needed for the MVP

| ID | Question |
|---|---|
| **F-53** | Are any components both made and bought (make-or-buy)? *(Improves ⚪ in §10.2)* |
| — | Minimum stock per item *(§16 — disclosure only, so not blocking)* |

### Already in the register — do not ask again

`F-09` lead-time quality · `F-27` substitutes · `F-41` partial receipts · `F-42` supplier acceptance of smaller orders · `F-44` order multiples vs MOQ · `F-15` incoterms *(gates `Q-10`)* · `F-34` shelf life · `N-11` service level *(constrained: stated, never fitted)*.

> **One blocking question, down from seven.** Every other question earned a defined fallback — which is what makes it non-blocking. **The size of the first data request is a positioning statement**: a product that asks for one thing is a different product from one that asks for seventy.

**Also ask, open-endedly, and not as a data request:** *"walk me through the last time you couldn't produce something on time — what happened, and what would have helped?"* It will validate whether this capability is the right shape better than any structured question.

---

## 22. Existing decisions affected

### Require amendment

| Decision | Status | Amendment | Downstream |
|---|---|---|---|
| **D-007** | `ACCEPTED` | Additive: admit BoM **structure** for feasibility only; exclusions restated | `02-first-release-scope.md` ×3 · `00-build-plan.md` ×2 · **`B-02` reopens** · code standard 13 (**R-02**) |
| **D-010** | `PROPOSED` | ⚠ **Must be decided and promoted with the amendment inside it** — never amended after locking. Worded as a **reach** constraint | **`A-14` reopens** · `A-13` re-verified · D-013 |

### Require extension

| Decision | Extension |
|---|---|
| **D-051** | ⚠ **No role can ask this question** (AF-03). Either add a role or rule that `INVENTORY_MANAGER` asks it. `A-20` remains `OPEN` regardless |

### Constrain the design but do not change

**D-002 · D-008 · D-009 · D-012 · D-014 · D-017 · D-019 · D-025 · D-029 · D-030 · D-034 · D-037 · D-041 · D-044 · D-048 · D-050** — sixteen decisions govern this capability. **None requires a word changed.**

### Untouched entirely

**D-001 · D-004 · D-011 · D-023 · D-035 · D-036 · D-039 · D-040 · D-042 · D-043 · D-045 · D-046 · D-047 · D-049 · D-052 · D-053.**

### Should be retired

**None.** No existing decision becomes wrong.

---

## 23. New decisions required

| ID | Decision | Recommendation | Affects |
|---|---|---|---|
| **D-054** | Admit Production Feasibility as a bounded read-only capability; amend D-007 and D-010 | **As §3.1** | scope · data model · engine |
| **D-055** | A feasibility answer is not a Finding; audit-only persistence; conflicting Opportunity displayed | **As §4.1** | engine · data model · UX |
| **D-056** | Supply-timing inputs, calendar behaviour, and the need-by date | **As §5** | engine · UX |
| **D-057** | The four-state verdict as an evidence partition; precedence 🔴 ▸ ⚪ ▸ 🟡 ▸ 🟢 | **As §6** | engine · UX |
| **D-058** | ⚠ **Who asks a feasibility question?** D-051's five roles do not include a production planner or manager | **Not taken.** Either extend D-051 by one role or rule that `INVENTORY_MANAGER` asks it. **The capability has no user until this is decided** | scope · security · UX |

**Also required, administratively:** promote **D-010** and **D-012** out of `PROPOSED` — D-010 because D-054 amends it, D-012 because D-055's firewall references it.

---

## 24. Deferred decisions

Deferrable because **none changes the data-model shape or the verdict rule** — that is the test applied, not relative importance.

Multi-level explosion · MOQ and order multiples applied to the recommendation *(`F-42`, `F-44`)* · reservations *(`A-02`, reopens only if D-055 is broken)* · safety stock in the calculation *(never — §16)* · substitutes *(`F-27`)* · yield factors in the arithmetic *(`F-49`)* · expired / shelf-life-constrained supply *(`F-34`)* · in-transit stock *(`Q-10`, gated on `F-15`)* · WIP ledger bucket and production orders *(PP-06)* · backflush vs explicit issue *(PP-07, and note **R-01**)* · audit retention period for answers · supplier delivery-day calendars · make-or-buy resolution *(`F-53`)*.

---

## 25. Explicit non-goals

**Never, or not for years:** finite capacity scheduling · routings and work centres · Gantt or sequencing boards · work orders · WIP tracking · backflush · shop-floor terminals · MRP regeneration · master production scheduling · rough-cut capacity · pegging · where-used explosion · firm planned orders · time fences · planning bills · lot-sizing engines · forecast consumption · available-to-promise / capable-to-promise for customer quoting · multi-plant netting · alternate and phantom BoMs · co-products and by-products · BoM cost roll-up.

**Two that will be requested and must still be refused in the MVP:**

- **Automatic PO creation.** The moment the system creates orders, it owns the consequence of every wrong lead time and stale recipe. It also converts the product from advisory to operational, contradicting D-011's classification of operational management as `ENABLER`.
- **A saved production plan.** It looks like a small convenience. It is the MRP seed (§3.2 attack 5), and it breaks D-050 (§4.5).

---

## 26. Implementation contract for Block 9

**An engineer may implement exactly the following, and must invent no business rule.** Every rule below has a section reference.

### 26.1 Permitted

| | Capability | Rule |
|---|---|---|
| 1 | BoM structure: parent · component · qty per · UoM · effective-from | §10.1 |
| 2 | One-level explosion; **⚪ overall if a component is itself a parent**, with component detail still shown | §10.2 |
| 3 | UoM conversion per item, versioned; **⚪ for that component if unavailable** | §9.2, F6 |
| 4 | `Available = On hand − Quality hold`, `counts_as_on_hand` only | §8.2, D-050 |
| 5 | Incoming = open qty on `SENT` / `PARTIALLY_RECEIVED`, = `ordered − Σ receipts` | §13.1 |
| 6 | Netting per F3's `Projected available at date t` | §8.1 |
| 7 | Four-state verdict; precedence 🔴 ▸ ⚪ ▸ 🟡 ▸ 🟢 | §6.4 |
| 8 | 🟢 cap on observed unrelated consumption | §8.4 |
| 9 | Round **up, once, at the final net requirement**, integer-only items | §12 |
| 10 | Catch-weight: net on `actual`; **no nominal purchase qty without `F-52`** | §11.2 |
| 11 | Date from supplier-specific → master lead time; **none ⇒ no date** | §14 |
| 12 | Observed lead time **displayed as a count**, never substituted | §5.3 |
| 13 | Calendar days, **convention stated** | §15 |
| 14 | Need-by date **optional**, with §5.6's defined consequence | §5.6 |
| 15 | Impossible-recommendation case as a first-class answer | §5.7 |
| 16 | Open `OPPORTUNITY` on the same item **displayed** beside the recommendation | §4.4 |
| 17 | Audit-only persistence; **no calculation may join to it** | §4.5 |
| 18 | Four-layer answer structure and the vocabulary rules | §19 |

### 26.2 Forbidden — a violation is a defect, not a preference

- Any percentage, threshold, score or confidence in the verdict — **§6.2, D-014 r15, D-017, D-045**
- Any invented calendar, holiday, yield factor, safety stock, service level or nominal→actual conversion — **§11, §15, §16**
- Any statistic derived from observed lead time and used **in** a calculation — **§5.2**
- Any write path from feasibility into `opportunities`, or any join from a calculation to a feasibility record — **§4.5**
- Any reservation, allocation or `Outgoing` row — **D-050, §4.5**
- Any silent update of a previously shown answer — **§17.4**
- Any partial calculation presented as a complete verdict — **§10.2**
- Any BoM cost roll-up — **D-008, §3.1**
- Any of §25's non-goals

### 26.3 Preconditions before Block 9 opens

1. **D-054 authorised** by the product owner — it changes published scope.
2. **D-010 promoted** with its amendment inside it.
3. **D-058 decided** — the capability has no user until it is.
4. **§5.6 confirmed** — the need-by date correction changes the stated experience.
5. **`F-48` answered** — if recipes are not recorded, Block 9 builds against nothing.

---

## 27. Lock readiness

Assessed against §21's ten conditions. **Not forced.**

| Decision | Scope | Boundary | Inputs | Output states | Missing-data behaviour | Contradictions | Locked-decision interaction | User meaning | Hidden constants | Engineer would invent? | **Status** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **D-054** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ none | ✅ no | **`READY` — pending owner authorisation** |
| **D-055** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ none | ✅ no | **`READY TO LOCK`** |
| **D-056** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ none | ✅ no | **`READY TO LOCK`** — subject to §5.6 confirmation |
| **D-057** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ none | ✅ no | **`READY TO LOCK`** |
| **D-058** | ✅ | ✅ | — | — | — | — | ⚠ D-051 | 🔴 **unknown** | — | 🔴 **yes** | 🔴 **`NOT READY`** |

**D-058 fails two conditions.** *"The user-facing meaning is explicit"* — we do not know who asks the question. *"No engineer would need to invent a business rule"* — an engineer building the entry point must decide who may reach it, and would invent a permission rule. **It is small, and it is genuinely unresolved.**

> **Four of five are ready. One is not, and it is not being forced.**

---

*End of Block 8 analysis. Nothing in this document is locked. No code, schema, route, component or migration was created. No existing decision was modified.*
