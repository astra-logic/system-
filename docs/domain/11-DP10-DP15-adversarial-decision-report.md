# 11 — Adversarial Decision Report: DP-10 … DP-15

> ## ⚠ NOTHING LOCKED. NOTHING REWRITTEN.
> No rate, percentage, threshold, probability or factory fact invented. The Q-07 report is untouched.
> **No code, no UI, no schemas. Part 2.3 not started.** **Date:** 2026-08-07

---

# DP-10 — Capital release

### 1. Current proposal

Capital release is a cash-flow timing effect; its value is the financing cost over the deferral period, not the principal.

### 2. Alternatives

| | Option |
|---|---|
| A | Display principal as "working capital release", keep it out of PAS |
| B | Display nothing until a financing rate exists |
| C | **Display the principal as a *position*, not a *benefit*, and separate the four quantities** |

### 3. Adversarial test — *what would the factory actually do differently?*

Running the counterfactual honestly produces a result that **corrects my own earlier framing twice.**

**First: the outflow is delayed, never avoided.**

| Case | What actually happens |
|---|---|
| Defer a planned order | Cash outflow delayed by D days. **The order still happens later.** Benefit = financing value over D days + carrying avoided over D days |
| Cancel permanently | Only valid if the material will **never** be consumed — which makes it **dead stock (4.3), not excess (4.1)** |

> **This gives a clean boundary the taxonomy lacked: excess = will be consumed, just later. Dead = will never be consumed.**
> For 4.1 proper, **the outflow is always delayed, never avoided.**

**Second — and more serious: the benefit is one-time, not recurring.**

Once excess is worked down to target coverage, there is no more excess to remove. **You can only reduce the same excess once.** Annualising it would overstate it by however many years it is projected across.

But the *cause* is different from the *stock*:

```
Working down existing excess     →  ONE-TIME transition benefit
Fixing the policy that created it →  RECURRING — and that is 4.7, not 4.1
```

**This sharpens the 4.1 / 4.7 boundary that Q-07 flagged as double counting.** They are not two views of one saving; they are a one-time correction and a recurring prevention.

### 4. Hidden assumptions

- That "release" is a meaningful event. **It is not** — the stock is *held*, not released. What could be released is future outlay. **The phrase itself is misleading language**, and it survived from the original model unexamined.
- That a magnitude displayed beside a saving will be read as context. It will be read as a **comparable benefit**, and it is usually the larger number.

### 5. Factory facts required

`F-22` effective-dated financing rate (for the timing value) · `F-08` carrying basis · `A-18` coverage policy · **open and planned orders with quantities, prices and ETAs** (Orders & Supply Movement).

### 6. Interaction with locked decisions

**D-012** already excludes the principal from PAS — this does not change that, it explains *why* more precisely. **D-002** — the timing value inherits `ASSUMED` from `F-22`. **D-019** — a one-time transition benefit is not annualisable at all, which the ladder already supports.

### 7. Recommendation

Four quantities, never merged:

| Quantity | Treatment |
|---|---|
| **Inventory value above stated coverage** | **A position, labelled as such.** `ACTUAL`. **Never called "release", never called an opportunity** |
| **Carrying cost avoided by working it down** | **One-time transition benefit.** Requires `F-08` |
| **Financing value of deferred outlay** | **One-time per deferral event.** Requires `F-22` |
| **Recurring saving** | **Belongs to the policy fix (4.7), not to 4.1** |

**No portion of the principal enters Potential Annual Saving.**

### 8. Safe to lock?

**The structure, yes. The values, no** — `F-08` and `F-22` are unavailable. Locking requires accepting the excess/dead boundary and the one-time framing.

---

# DP-11 — Retire 4.2

### 1. Current proposal

4.2 has no independent intervention; retire as a saving category, keep as a detection signal.

### 2–3. Adversarial test — four attempts to find a genuine mechanism

| Attempt | Result |
|---|---|
| **Slow but appropriate** — a spare part with low, steady demand, correct coverage | You would not reduce it (coverage is right) and not dispose (it will be used). **No intervention.** Confirms retirement |
| **Slow as a sourcing signal** — buy smaller, more often | That is 4.6 / temporal consolidation. **Not its own mechanism** |
| **Slow as an inventory-turns metric** | An analytics KPI. **Enabler, not a mechanism** |
| **⚠ Slow relative to shelf life** | **A genuine find — see below** |

### ⚠ The one case that is genuinely different

An item that **moves slowly relative to its shelf life** will expire before it is consumed. That is:

- **forward-looking** — it has not happened yet
- **not a duplicate** of 4.1 (coverage may be correct) or 4.3 (it is not dead yet)
- **not a saving** — there is no defensible counterfactual value

> **It is an `EXPOSURE / RISK` finding**, not a saving mechanism.

So 4.2 retires as a *saving category* while legitimately producing **two non-saving outputs**: a detection signal feeding 4.1 and 4.3, and — for shelf-life-constrained items — an exposure finding.

### 4. Hidden assumptions

That "slow-moving" is definable without a threshold. **It is not** — any turnover cut-off is a threshold (`A-18`). As a *detection signal* that is tolerable, because it triggers investigation rather than producing currency. **It would not be tolerable if 4.2 produced a number.** This is an additional argument for retirement.

### 5. Factory facts required

**New:** does the factory hold shelf-life-constrained items, and are shelf lives recorded? · `A-18` aging window.

### 6. Interaction with locked decisions

**D-025** — the shelf-life output fits `EXPOSURE / RISK` cleanly. **D-020** — retirement removes a structural double-counting risk rather than merely managing it.

### 7. Recommendation

**Retire 4.2 as a saving category.** Preserve as a detection signal; add the shelf-life exposure output as a separate, non-saving finding.

### 8. Safe to lock?

**Yes** — with the shelf-life nuance recorded. It removes a category rather than adding one, and depends on no missing input.

---

# DP-12 — Reclassify 4.9 as EXPOSURE / RISK

### 1–2. Proposal and alternatives

Reclassify as `EXPOSURE / RISK`. Alternatives: keep as a category that refuses to produce a number · treat as operational data outside the finding model.

### 3. Adversarial test — the six required questions

**What is the underlying observation?** *"Projected available for item X falls below zero before the next confirmed supply arrives."* Derived from on-hand (`ACTUAL`), consumption rate (`CALCULATED`), and incoming supply with ETA (`FORECAST`). **It is a projection, not an observation.**

**Historical or forward-looking?** **Forward-looking by construction.** ✓ fits.

> **⚠ But there is also a historical form**, and it fits none of the four classes: *"we had 4 stockouts last quarter"* is not an Opportunity, not an `OBSERVED COST` (no `ACTUAL` money — D-007 blocks valuation), not `EXPOSURE / RISK` (not forward-looking), not an Evidence Gap.
>
> **Resolution, and it is not a conflict with D-025:** the FINDING hierarchy is about **money**. A stockout count is an **operational metric**, not a financial finding. It belongs to the operational layer and serves as **evidence for** findings — notably as evidence that safety stock was too low. Worth stating explicitly, because otherwise someone will read it as a gap in the model.

**Does it have a counterfactual?** **No** — "you are at risk" is a projection, not a claim about a foregone alternative. ✓ consistent with it not being an Opportunity.

**Can it ever enter PAS?** **No.** A mitigation might — but valuing avoided stockout requires production-impact data (D-007, out of scope). **Note the asymmetry:** a mitigation such as expediting has a **knowable cost** and an **unvaluable benefit**. That is a human decision, not a system quantification.

**D-031 interaction?** 4.7 and 4.1 both **`DEEPENS`** it. But Mechanism 01's fix — raising the reorder point — **reduces** it, and **D-031 has no relationship type for that.**

> **⚠ Genuine gap: an Opportunity that reduces an existing Exposure has no way to say so.** `CREATES` and `DEEPENS` cover worsening only. Whether a `MITIGATES` type is needed is a real question — disclosing risk *reduction* is as honest as disclosing risk increase. **Flagged, not assumed.**

**Can it become an Opportunity later?** **Yes in principle** (D-025 principle 3), **no in release 1** — the counterfactual needs production data.

### 4. Hidden assumptions

That "projected available below zero" needs no threshold. Below *zero* needs none; below a *buffer* does (`A-18`).

### 5. Factory facts required

Ledger on-hand and consumption · **inbound supply: open POs, ETAs, current location, port and customs milestones.** A shipment stuck at port changes stockout risk materially and is invisible without movement visibility.

### 6. Interaction with locked decisions

**D-025** — clean fit, no conflict. **D-007** — confirms non-valuation. **D-031** — reveals the missing `MITIGATES` type.

### 7. Recommendation

**Reclassify.** Record two findings alongside: historical stockout events are **operational data, not findings**; and D-031 may need a **`MITIGATES`** type.

### 8. Safe to lock?

**The reclassification, yes.** The `MITIGATES` question needs a separate decision.

---

# DP-13 — Backtested safety stock

> **The most important test in this report. The naive backtest does not survive it.**

### 1. Current proposal

*"On-hand never fell below L in 12 months, so reducing safety stock to L would not have caused a stockout."*

### 3. Adversarial test — what propped up the observed floor?

| Hidden intervention | Observable in release 1? |
|---|---|
| **Emergency purchase** | **Only if Mechanism 01's capture exists** (`F-01`, `F-06`) |
| **Expedite event** | **Same — M01's gates** |
| Supplier escalation (a phone call) | **Usually not recorded at all** |
| Manual override of an order | Only if override history is kept |
| **Production rescheduled to match available material** | **Invisible — production is out of scope (D-007)** |
| **Substitution with an alternate material** | Requires alternate-item data (`F-27`) — likely invisible |
| **Demand suppression** — an order not taken because material was short | **Structurally unrecordable. There is no record of an order never placed** |
| Luck — demand simply did not spike | Unobservable by definition |

### The two claims the user asked to separate

```
"No observed stockout"
    an ACTUAL fact, always available from the ledger

"Evidence that the proposed intervention would not have caused a stockout"
    requires ruling OUT every intervention above
```

**Some can never be ruled out in release 1.** Production changes, substitutions and demand suppression are wholly or largely unobservable.

> **Therefore the honest output is weaker than I proposed.** The backtest supports:
>
> *"No stockout occurred, and no **recorded** intervention explains the floor."*
>
> That is **absence of evidence of insufficiency** — not **evidence of sufficiency.**

### The dependency this exposes

**4.7's viability depends on Mechanism 01's capture existing.** Without expedite and emergency-purchase records, the largest and most likely propping intervention is invisible, and the backtest is worthless. `F-01` gates 4.7 as well as M01.

### ⚠ A second problem: asymmetric valuation

Reducing safety stock produces a **valued** capital and carrying benefit and an **unvaluable** stockout exposure (4.9, D-007). Presenting a hard number for the gain beside nothing for the risk **biases the decision toward reduction**, structurally.

D-031 requires disclosure, which helps — but a disclosed-but-unvalued risk beside a quantified gain is not a neutral presentation. This deserves explicit treatment.

### 4. Hidden assumptions

That the recorded floor reflects unmanaged demand. It frequently reflects **managed** demand — that is what a good planner does, and their success erases the evidence of how close it was.

### 5. Factory facts required

`F-01` / `F-06` expedite capture · manual override history · `F-27` substitutes · **new:** are supplier escalations recorded in any form? · lead-time history from **order date → receipt date** (Orders & Supply Movement).

### 6. Interaction with locked decisions

**D-019** — maps cleanly: the backtest supports `OPPORTUNITY DETECTED`; currency requires ruling out interventions. **D-027** — the counterfactual is genuinely event-level, which is why it is still the right direction. **D-031** — the deepened exposure must be disclosed.

### 7. Recommendation

**Adopt the backtested approach — it remains far stronger than the modelled one — but with the claim correctly weakened.** It supports **detection**; currency quantification requires ruling out recorded interventions, and **4.7 may be permanently limited to indication** unless production and demand-suppression data become available.

### 8. Safe to lock?

**The approach, yes. The claim strength, only with the weakening above.** Locking the naive form would license an unsafe number.

---

# DP-14 — Ownership

### 1–2. Proposal and alternatives

Detection in Inventory, action through Purchasing. Alternatives: mechanism owner · finding owner · action owner · data owner — one, some, or all.

### 3. Adversarial test — are these genuinely distinct?

Tested against 4.1: data comes from the ledger (inventory), the finding concerns stock levels, the action is deferring a purchase order (purchasing). **Three different accountabilities, and they do not collapse.**

| Role | Distinct? | Note |
|---|---|---|
| **Mechanism owner** | **Not factory-facing** | Who owns the detector's correctness is internal to the product. **Should not be a field on a finding** |
| **Finding owner** | **Yes** | Accountable for the finding being addressed |
| **Action owner** | **Yes** | Executes the intervention. For 4.1, purchasing — not inventory |
| **Data owner** | **Yes** | Accountable for input quality. **This is the natural owner of an `EVIDENCE GAP`** |

### ⚠ Conflict with an existing decision

**D-011's Saving Opportunity object carries a single `Owner` field.** That is now demonstrably insufficient — three distinct accountabilities exist, and collapsing them means either the wrong person is asked to act, or nobody owns the data quality behind the number.

**Flagged, not changed.**

### 4. Hidden assumptions

That these roles exist as job titles. **They may not** — in an Egyptian SME one person may hold all three. The **fields** are structural; **who fills them is factory-configurable**. No organisational role is invented by defining a field.

### 5. Factory facts required

`F-11` who sets prices · `F-24` / `F-25` adjudicator independence and capacity · **new:** who owns master and transactional data quality?

### 6. Interaction with locked decisions

**D-011** — the single `Owner` field needs splitting. **A-20** — this is the **second** concrete requirement the saving engine has produced for the permission model; the first was adjudication independence. **D-025** — `EVIDENCE GAP` needs a data owner specifically.

### 7. Recommendation

**Three owner roles — finding, action, data — all configurable.** Mechanism owner is internal and not a finding field.

### 8. Safe to lock?

**The structure, yes.** It requires an explicit amendment to D-011's field list, which should be presented before being applied.

---

# DP-15 — Carrying cost

> The user's warning is correct: **do not conclude marginal is right merely because average may be misleading.**

### 3. Adversarial test — carrying cost is not one thing

| Component | Genuinely incremental? |
|---|---|
| **Cost of capital** | Yes — proportional to value, independent of warehouse fullness |
| **Storage / space** | **Only if space is constrained.** A half-empty owned warehouse saves nothing in rent when stock falls |
| **Handling** | Roughly proportional to volume and movements |
| **Insurance** | Usually proportional to value |
| **Obsolescence / shrinkage** | **Arguably not a cost at all — it is a risk.** Under D-025 it belongs in `EXPOSURE / RISK`, not inside a cost rate |
| **Taxes** | Jurisdiction-dependent |

> **The marginal-versus-average debate is wrongly framed.** The question is not *which rate* — it is **which components apply to this decision.**

### ⚠ The finding that changes 4.3's size

**Disposing of dead stock does not free capital.** The money was spent when the stock was bought; unless it is *sold*, nothing is recovered. And if the stock is worthless, capital is not *tied up* in it — it is **gone**.

So for dead stock the **capital component may not apply at all**, and it is usually the largest component of any carrying rate.

What genuinely remains: space (only if constrained), handling (it is still counted during cycle counts), insurance (if still insured at value).

> **The carrying cost avoided by disposing of dead stock may be very small — possibly near zero if space is unconstrained. 4.3 may be a far smaller opportunity than it appears.**

Applying a finance average rate to it would produce a confident figure that is wrong in a direction nobody would notice.

### Can a finance-provided average rate ever legitimately be used?

**Yes — for decisions it fits.** An average rate is built for *valuation and policy*, where stock is treated as a fungible pool. It is legitimate where the decision concerns the **pool** — for example a portfolio-wide coverage policy. It is **not** legitimate for a **specific marginal decision** about specific stock, which is what 4.1 and 4.3 are.

**So both rates are valid for different questions.** The error is applying either to the wrong one.

### Can the marginal cost actually be observed?

**Rarely directly.** It can sometimes be *evidenced* — external storage being rented, receipts refused for space, overflow arrangements. Those are factory facts we do not have.

### 4. Hidden assumptions

That finance holds a rate suitable for marginal decisions. **Finance typically holds one built for valuation.** Asking for "the carrying-cost rate" may yield a number that is authoritative, finance-owned, and **still the wrong instrument.**

### 5. Factory facts required

**Is warehouse space constrained?** · does finance own a rate, and **for what purpose was it constructed?** · are components separable? · is external storage rented? · `F-08`, `F-22`.

### 6. Interaction with locked decisions

**D-023** — reinforced and sharpened: not only must no rate be invented, **the provided rate must be fit for the decision.** **D-002** — a component-wise figure carries the weakest basis among its components. **D-025** — obsolescence belongs in exposure, not in a cost rate.

### 7. Recommendation — evaluating the four options on merit

| Option | Assessment |
|---|---|
| Remain qualitative | True but unactionable |
| **Become an Evidence Gap** | **Yes — for the missing components.** Tells the factory precisely what is needed |
| Partial calculation | **Dangerous if presented as a total.** Acceptable **only** component-wise and labelled |
| **Blocked from currency quantification** | **Yes — for any single headline figure while applicable components are missing** |

**Recommended: component-level treatment.** Show components that are available and finance-owned, name those that are not, block any single headline figure until all applicable components exist, and raise an `EVIDENCE GAP` for the missing ones.

The stock's **quantity and value remain displayable as `ACTUAL` facts** — those need no rate at all, and give the factory something real without inventing anything.

### 8. Safe to lock?

**The component-wise principle, yes.** Which components apply to which decision requires factory facts, above all whether space is constrained.

---

# Orders & Supply Movement — dependency map

**Classification unchanged: `ENABLER`, not a saving mechanism.**

| Element | M01 | M02 | 4.1 | 4.3 | 4.6 | 4.7 | 4.9 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Purchase order | ● | ● | ● | | ● | ● | ● |
| Supplier | ● | ● | | | ● | ● | |
| Order quantity | ● | ● | ● | | ● | ● | ● |
| Agreed price | ● | ● | ● | | ● | | |
| Order date | ● | ● | ● | | | ● | |
| Promised delivery date | ● | | ● | | | ● | ● |
| Shipment | ● | | | | | | ● |
| Freight | ● | ● | | | ● | | |
| Port / customs milestone | ● | | | | | | ● |
| Current location | ● | | | | | | ● |
| ETA | ● | | ● | | | ● | ● |
| Receipt date | ● | ● | ● | ● | | ● | |
| Actual received quantity | ● | ● | ● | ● | ● | ● | |
| Actual outcome | ● | ● | ● | ● | ● | ● | |

**Preserved operating loop — a domain requirement, not a UI request:**

```
Saving Opportunity → Decision → Order → Supplier → Supply Movement
                   → Receipt → Actual Outcome → Verification / Learning
```

**Two structural observations.** Lead time — 4.7's central input — **is** order date → receipt date. And 4.9's risk cannot be assessed without knowing **where inbound stock physically is**: a shipment held at customs changes stockout risk materially and is invisible without this enabler.

---

# Summary

## A. Decisions ready to lock

| | |
|---|---|
| **DP-11** | Retire 4.2 as a saving category; preserve detection signal + shelf-life exposure output |
| **DP-12** | Reclassify 4.9 as `EXPOSURE / RISK` *(the `MITIGATES` question is separate)* |
| **DP-10** | **Structure only** — four quantities separated, principal never in PAS, benefit is one-time |
| **DP-15** | **Principle only** — component-level treatment, no single figure while components are missing |

## B. Decisions requiring factory data

| | Needs |
|---|---|
| DP-10 values | `F-22` financing rate · `F-08` · `A-18` |
| **DP-13** | **`F-01`/`F-06` expedite capture — 4.7's backtest is worthless without Mechanism 01's evidence** |
| **DP-15** | **Is warehouse space constrained?** · what purpose was finance's rate built for? |
| DP-11 shelf-life output | Are shelf lives recorded? |

## C. Decisions requiring another architectural question

| | Question |
|---|---|
| **DP-12** | Does D-031 need a **`MITIGATES`** type? An Opportunity that *reduces* an exposure currently cannot say so |
| **DP-14** | **D-011's single `Owner` field must split** into finding / action / data owner |
| **DP-13** | How is an **asymmetrically valued** decision presented — quantified gain beside unvaluable risk? |

## D. New contradictions discovered

1. **4.1 and 4.7 are not two views of one saving** — one is a **one-time correction**, the other **recurring prevention**. The Q-07 double-counting flag was partly a mis-read; the real distinction is temporal.
2. **"Working capital release" is misleading language** inherited unexamined. Nothing is released; the stock is held.
3. **A finance-owned average rate can be authoritative and still be the wrong instrument** — a failure mode D-023 does not currently cover.
4. **Disposal does not free capital**, so the largest component of any carrying rate may not apply to 4.3 at all.
5. **Historical stockout events fit none of the four finding classes** — resolved as operational data, not a model gap, but worth stating.

## E. New cross-cutting rules, if any

| Candidate | Note |
|---|---|
| **A financial rate must be fit for the decision it is used in** | Extends D-023 beyond "never invent" to "never misapply". Genuinely cross-cutting |
| **Asymmetric valuation must be presented, not hidden** | A quantified benefit beside an unvaluable risk biases the decision structurally. Affects 4.7, 4.1, and any future mechanism trading certainty against risk |
| `MITIGATES` relationship type | Would extend D-031 a second time |

---

**Nothing locked. Awaiting review.**
