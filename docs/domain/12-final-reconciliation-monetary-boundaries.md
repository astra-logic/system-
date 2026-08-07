# 12 — Final Reconciliation: Monetary Claim Boundaries & Remaining Architecture

> ## ⚠ NOTHING LOCKED. NO LOCKED DECISION AMENDED.
> No rate, percentage, threshold, probability or severity score invented. No organisational structure assumed.
> **No code, no UI, no schemas. Part 2.3 not started.** **Date:** 2026-08-07

---

# 1. DP-10 — The six intervention types, tested separately

## (a) Cancel a future purchase

**What changes.** An order that would have been placed is not placed. Material never arrives.
**Counterfactual required.** *"This order served a requirement already covered by existing stock, and the quantity will not be needed within the planning horizon."*
**One-time or recurring.** **One-time.**
**Avoided or delayed.** ⚠ **This is the decisive test, and it collapses the category.**

> If the quantity **will** be consumed within the horizon, cancelling only means ordering later — **that is (b) delay wearing a different name.**
> If it will **never** be consumed, the stock was over-ordered against true demand — **and the existing stock is then dead, not excess (4.3).**

**Offsets.** Supplier cancellation penalty · relationship cost · possible forfeiture of a price break already earned · stockout risk if demand was underestimated.
**Enters PAS.** **Nothing recurring.** The avoided outflow is a one-time cash effect. ⚠ And it is the **first instance** of whatever policy error caused the over-order — so counting both the cancellation and the policy fix **double counts**.
**Separate magnitude.** Avoided outflow, one-time, labelled as cash effect.

## (b) Delay a future purchase

**What changes.** Timing only.
**Counterfactual.** *"Existing stock covers the requirement for D further days; this specific order can move by D days without breaching stated coverage."*
**One-time or recurring.** **One-time per deferral event.**
**Avoided or delayed.** **Purely delayed. Nothing is avoided.**
**Offsets.** Stockout risk · price break loss · ⚠ **and one that is specific to this factory:**

> **In an inflationary or devaluing environment, deferring a purchase may increase the price paid.** With EGP depreciation and imported material, the deferral benefit can be **negative**. A deferral opportunity that ignores expected price movement is not conservative — it is wrong in a predictable direction.

**Enters PAS.** **Nothing.** Only the financing value of the timing — one-time, requires `F-22`, and may be net negative after price movement.

## (c) Reduce future order quantity

**What changes.** Smaller orders, more often. **Total quantity consumed is unchanged**; average inventory falls.
**Counterfactual.** *"Order quantity Q exceeded requirement over the coverage window; Q′ would have sufficed on these specific orders."*
**One-time or recurring.** **Recurring** — a policy change affects every future order.
**Avoided or delayed.** **Neither.** Purchases over time are unchanged; what falls is **average stock held**.
**Offsets.** **More ordering transactions** (`F-31`, unknown) · possible price-break loss (**Mechanism 02 interaction**) · higher freight per unit on smaller shipments.
**Enters PAS.** **Recurring carrying-cost reduction, net of the ordering-cost increase.** Both inputs currently unknown → **not quantifiable today.**

## (d) Reduce reorder point

**What changes.** Replenishment triggers later; average stock falls permanently.
**One-time or recurring.** **Both** — a one-time step-down as the level works through, plus recurring lower carrying cost.

### ⚠ A decomposition that refines an earlier finding

Reorder point has **two components**:

```
reorder point  =  lead-time demand  +  safety stock
                        ↑                    ↑
              Mechanism 01's lever      4.7's lever
              (lead-time correction)   (buffer reduction)
```

**Mechanism 01 and 4.7 act on *different components of the same parameter*.** The earlier report recorded them as a **contradiction**; at component level they **compose**. If lead time was understated *and* safety stock overstated, correcting both may net to any direction.

**This does not remove the need for contradiction control** — D-029 still catches the case where both touch the same component in opposite directions. But it means the pairing is **not automatically contradictory**, and treating it as such would suppress a legitimate combined correction.

**Enters PAS.** Recurring carrying reduction (needs `F-08`). The one-time capital step-down is a **position change, not a saving**.

## (e) Reduce safety stock

Same shape as (d), but the counterfactual is the hard one — see §2.
**Distinction from (d):** safety stock is a *component* of reorder point, not a separate parameter. Reducing it reduces the reorder point; correcting lead time also reduces (or raises) it, independently.
**Offsets.** **Stockout exposure — unvaluable** (4.9, D-007). Disclosed, never netted.
**Enters PAS.** Recurring carrying reduction only, and only once §2's evidence bar is met.

## (f) Dispose of stock that will never be consumed

**What changes.** Stock leaves; recovery may occur; disposal cost is incurred.
**Counterfactual.** *"These lots have had no movement since date D and no requirement is evidenced."*
⚠ **Weakness:** *"no requirement"* is forward-looking, but D-010 gives us only observed consumption. The evidence is a **backward-looking proxy for a forward-looking claim.**
**One-time or recurring.** Recovery and disposal cost are one-time; carrying avoided is recurring — but per §3, **possibly near zero**.
**Avoided or delayed.** **Neither.** Loss recognition plus a small ongoing avoidance.
**Enters PAS.** **Recurring carrying avoided only**, and only for components that genuinely apply. **Never the stock value.**

## Summary — the pattern that emerges

> **One-time benefits come from changing a stock *level*. Recurring benefits come from changing a *policy*.**

| Intervention | One-time | Recurring | PAS-eligible |
|---|:--:|:--:|---|
| (a) Cancel | ● | | Nothing recurring; double-counts with the policy fix |
| (b) Delay | ● | | Nothing; financing value only, possibly negative |
| (c) Reduce order quantity | | ● | Carrying reduction net of ordering cost |
| (d) Reduce reorder point | ● | ● | Recurring carrying only |
| (e) Reduce safety stock | ● | ● | Recurring carrying only, after §2's bar |
| (f) Dispose | ● | ● | Carrying avoided only, possibly near zero |

**Alternatives considered.** Treating all six as one "excess stock" mechanism — **rejected**: they have different counterfactuals, different offsets, and different one-time/recurring profiles. Collapsing them is what produced the original invalid formula.
**Hidden assumption found.** That reducing stock is always beneficial. **In a devaluing currency it may not be** — see (b).
**Interaction with locked decisions.** D-012 one-time/recurring split — sharpened. D-019 — one-time transition benefits are not annualisable. D-030 — (c)–(e) change quantity, so they are quantity-domain; (a)/(b) do not change *total* quantity and sit closer to procurement (`DP-14`).
**Factory data.** `F-22` · `F-08` · `F-31` · `A-18` · expected price movement over a deferral window · supplier cancellation terms.
**Safe to lock.** **The taxonomy of six and the one-time/recurring rule: yes.** Values: no.

---

# 2. DP-13 — Minimum evidence for a defensible historical counterfactual

## The three claims, precisely separated

| | Claim | Evidence required | Available in Release 1? |
|---|---|---|---|
| **A** | **No observed stockout** — on-hand never failed to satisfy an issue, and never fell below level L | Ledger only | **Yes**, if the ledger exists |
| **B** | **No recorded intervention prevented a stockout** | Per intervention type — see below | **Partially** |
| **C** | **The proposed lower level would not have caused a stockout** | A **and** B **and** ruling out unrecordable interventions | **No — unreachable** |

## Intervention-by-intervention

| Intervention | Evidence needed | Release 1 |
|---|---|---|
| Expedite / emergency purchase | Expedite capture — **Mechanism 01's `F-01`, `F-06`** | **Only if M01's capture exists** |
| Manual order override | PO change history (already required by U-12) | Likely yes |
| Supplier escalation | A record of informal escalation | **Usually none** — new capture would be required |
| Substitution | Alternate-item master + issue records showing the substitute (`F-27`) | **Likely not** |
| Production rescheduling | Production order and schedule history | **No — out of scope (D-007)** |
| Demand suppression | A record of an order not taken for want of material | **Structurally unrecordable** |

## What the system can honestly say

```
Level 1 (A)        "On-hand for item X never fell below L in the last 12 months."
                   ACTUAL. No claim about sufficiency.

Level 2 (A + partial B)
                   "...and no expedite, emergency purchase or order override is
                    recorded in that period."
                   Stronger evidence. Still not proof.

Level 3 (A + full B)
                   UNREACHABLE. Escalation and substitution are usually unrecorded;
                   production rescheduling and demand suppression cannot be observed.
```

## The resolution — and it is a good one

> **4.7 produces a prospective *indication*, never a prospective *currency claim*. The saving becomes measurable only retrospectively, after the reduction is made.**

If safety stock is reduced and twelve months later there are **no stockouts and no recorded interventions**, that is **observed evidence** — not a model. The claim that could not be made prospectively can be **verified retrospectively**.

This maps exactly onto structures already locked: D-019's ladder (`OPPORTUNITY DETECTED` without currency) and D-011's realization discipline (baseline captured at `APPROVED`, measured afterwards).

**When evidence is insufficient**, the system states the level reached and **names what could not be ruled out** — not a hedge, a specific list.

**Alternatives.** Statistical service-level modelling — **rejected**, unfalsifiable and requires assumptions we forbid. Naive backtest — **rejected**, already.
**Hidden assumption found.** That the recorded floor reflects unmanaged demand. **It usually reflects *managed* demand — a good planner's success erases the evidence of how close it came.**
**Interaction with locked decisions.** D-019 ladder · D-011 realization · D-027 event-level · **D-031** (the deepened exposure is disclosed) · **`F-01` now gates 4.7 as well as M01**.
**Factory data.** `F-01`/`F-06` · override history · `F-27` · **new:** are supplier escalations recorded in any form?
**Safe to lock.** **Yes — the three-level structure and the prospective-indication / retrospective-realization split.**

---

# 3. DP-15 — Carrying cost, component by component

| Component | Recurring | Incremental | Observable | Finance owns basis | Usable in a counterfactual | Belongs |
|---|:--:|---|---|:--:|---|---|
| **Capital** | Yes | **Excess: yes.** **Dead: NO** — capital is lost, not tied | Rate from finance; amount from ledger × cost reference | Usually | Yes, for excess | Benefit in the deferral counterfactual; PAS-eligible recurring only if the **policy** changes |
| **Storage / space** | Yes | **Only if space is constrained.** A half-empty owned warehouse saves nothing | Only via constraint evidence — external storage rented, receipts refused | Rent yes; **per-item allocation no** | Only with constraint evidence | PAS-eligible **only when constraint is evidenced**. Otherwise **nowhere** |
| **Handling** | Yes | Partly — a dead item is still counted; but marginal labour may be zero if staff are salaried and below capacity | Rarely | No | Rarely | **Usually nowhere in Release 1** |
| **Insurance** | Yes | Yes **if** value-based and adjusting; often semi-fixed with an annual declared value, so marginal effect is lagged or zero | Yes, from the policy | Yes | Yes, if value-based | Offset / benefit. Small |
| **Obsolescence** | — | ⚠ **Not a cost. A risk** | — | — | **No** | **`EXPOSURE / RISK`** (D-025) |
| **Shrinkage / damage** | — | Same as obsolescence | — | — | No | **`EXPOSURE / RISK`** |
| **Taxes / duties on held stock** | Jurisdiction-dependent | Unknown | Unknown | Possibly | Unknown | **Factory fact required** |

## ⚠ The finding that constrains any supplied rate

> **A standard carrying-cost rate that includes obsolescence is not usable as supplied.**

It smuggles a **risk** inside a **cost**. Netting it against a saving would net a risk — which **D-031 forbids**. So even an authoritative, finance-owned rate may require **decomposition before use**.

This is the strongest concrete argument for the fitness-for-purpose rule in §7.

## Excess versus dead

| Component | Excess stock | Dead stock |
|---|---|---|
| Capital | **Tied** — genuinely incremental | **Lost, not tied.** Only recovery value remains at stake |
| Space | If constrained | If constrained |
| Handling | Yes | Yes |
| Insurance | If value-based | If still insured at value — may already be written down |
| Obsolescence | A risk ahead | **Already materialised — it *is* the obsolescence** |

> **Disposal does not release capital.** Scrapping converts a book asset into a book loss — an **accounting event, not a cash event**. The only cash effects are recovery value received and ongoing space, handling and insurance no longer incurred.

**Alternatives.** Single average rate — rejected. Single marginal rate — **also rejected**: not observable, and the question was never which rate.
**Hidden assumption found.** That asking finance for "the carrying-cost rate" yields a usable input. It typically yields a **valuation** rate, built for a different purpose and containing a risk component.
**Interaction with locked decisions.** D-023 — sharpened. D-002 — a component-wise figure carries the weakest basis among components. D-025 — obsolescence belongs in exposure. **D-031 — a rate containing risk cannot be netted.**
**Factory data.** **Is warehouse space constrained?** · what purpose was finance's rate built for, and are components separable? · is external storage rented? · are inventory taxes applicable?
**Safe to lock.** **The component-level principle and the excess/dead distinction: yes.** Which components apply: requires factory data.

---

# 4. DP-14 — Ownership architecture

## Operational definitions

| Concept | Means operationally | Factory-facing? |
|---|---|---|
| **Mechanism Owner** | Accountable for the **detector's correctness** — its counterfactual logic, refusal conditions, evidence gates | **No — product/engineering.** Should **not** be a field on a finding shown to a factory user |
| **Finding Owner** | Accountable for the finding **being addressed**. *"Whose problem is this?"* | Yes |
| **Action Owner** | **Executes** the intervention | Yes |
| **Data Owner** | Accountable for **input data quality**. The natural owner of an `EVIDENCE GAP` | Yes |

## Collapse test

| Pair | Distinct? | Evidence |
|---|:--:|---|
| Finding vs Action | **Yes** | 4.1: inventory detects, **purchasing acts** |
| Finding vs Data | **Yes** | An evidence gap's fix belongs to whoever owns the data, not to whoever owns the finding |
| Action vs Data | **Yes** | Independent |
| Mechanism vs the rest | **Yes, and not factory-facing** | Internal governance |

## ⚠ A fifth accountability already exists

**DP-07 established an *adjudicator*** — independent of the price decision for currency claims. That is a **reviewer** role, not an owner. **It must not be collapsed into Finding Owner**, or the independence requirement is silently lost.

## The required determinations

**Configurable?** **Yes, necessarily** — `F-11` and `F-24` may differ between factories.
**One person, multiple roles?** **Yes** — common in an SME. Distinct *fields* do not require distinct *people*. No organisational structure is invented by defining a field.
**No suitable owner?** The finding is **unowned, and that is visible** — never hidden. An unowned finding is itself a signal that nobody is accountable for that class of problem.
**Affects approval, action, or accountability?** Action Owner → execution. Finding Owner → accountability. **Approval belongs to the adjudicator**, per DP-07 — not automatically to the Finding Owner.

**Interaction with locked decisions.** ⚠ **D-011's single `Owner` field is insufficient** — flagged, **not amended**. `A-20` — this is the **second** concrete requirement the saving engine has produced for the permission model.
**Factory data.** Who owns master and transactional data quality? · `F-11`, `F-24`, `F-25`.
**Safe to lock.** **The three factory-facing roles plus the adjudicator distinction: yes.** Requires an explicit D-011 amendment, presented before applying.

---

# 5. MITIGATES

| Test | Result |
|---|---|
| **Distinct from CREATES / DEEPENS?** | **Yes — opposite direction.** Those worsen; this improves |
| **Needs the same intervention signature?** | **No.** The *Opportunity* carries one (D-029); the relationship does not |
| **Changes the Exposure lifecycle?** | **No.** Exposure has none (D-025). A mitigated exposure is **superseded by a new observation at a lower level**, per D-025 principle 4 |
| **Must the Exposure already exist?** | **Yes, by definition** — you cannot mitigate what does not exist. This is precisely what separates it from `CREATES` |
| **Can mitigation be partial?** | **Yes — but only qualitatively.** Quantifying "partial" needs a severity measure, which is forbidden |
| **Can it be verified?** | **Yes** — by observing the exposure afterwards. The superseding observation *is* the evidence |
| **Can it be netted into PAS?** | **No.** Mitigating an unvaluable exposure yields an unvaluable benefit; netting would require valuing the exposure, which D-031 forbids |

## The case that shows it is needed

**Mechanism 01's reorder-point fix** carries a carrying-cost increase, a quantified expedite reduction — and a **reduction in stockout exposure that is currently invisible.**

> Without `MITIGATES`, an Opportunity whose main justification is risk reduction shows **only its cost**. It looks purely bad.

Symmetry also matters: if disclosing risk *increase* is mandatory, disclosing risk *reduction* is equally informative.

**And if the exposure later becomes valuable** — say production data arrives and stockout cost becomes computable — the mitigation acquires a defensible counterfactual and **becomes an Opportunity in its own right** (D-025 principle 3). Not a netted benefit on the mitigating Opportunity. Clean.

**Alternatives.** Omit it — rejected, leaves risk-reducing Opportunities looking unjustified. Model it as a negative `DEEPENS` — rejected, a signed relationship invites arithmetic on something unvalued.
**Hidden assumption.** That mitigation is binary. It is not, and partial mitigation can only be stated qualitatively.
**Interaction.** D-031 — a **third** relationship type. D-025 — supersession handles the exposure's change. D-029 — unaffected.
**Factory data.** None new.
**Safe to lock.** **Yes**, as a **disclosure-only relationship that can never be netted.**

---

# 6. Asymmetric valuation — the minimum rule

## The three components

```
BENEFIT                measurable, evidenced
CERTAIN COST / OFFSET  netted (D-014 rule 6)
EXPOSURE / RISK        disclosed, never netted (D-031)
```

## The rule, minimally stated

> **Every Opportunity presents benefit, certain cost and uncertain exposure as three separately-typed components. Where an exposure exists and cannot be valued, the net figure must declare that it excludes an unvalued risk.**

## Why the last clause is the whole rule

Linking the exposure is not sufficient. A reader can still see `benefit − cost = net` and take the net at face value while the linked risk sits elsewhere on the page.

> **The number itself must carry its own incompleteness** — and its **direction**: the net is optimistic, never pessimistic, because what is excluded is always a cost or a risk.

This is the same discipline as D-002's basis: **a number that carries what is wrong with it.** No new machinery — an extension of a principle already locked.

**Alternatives.** Present the risk beside the number — rejected, proximity is not a property of the number. Suppress the number where risk is unvalued — rejected, discards defensible benefit.
**Hidden assumption.** That readers integrate adjacent information. They read the number.
**Interaction.** D-002, D-012, D-031 — all extended, none contradicted.
**Safe to lock.** **Yes.** It is a one-sentence rule resting entirely on locked principles.

---

# 7. Financial-rate fitness

## Three genuinely distinct requirements

| | Requirement | Status |
|---|---|---|
| 1 | **Never invent a rate** | Locked, D-023 |
| 2 | **Use an authoritative, owned rate** | Implied by D-023 |
| 3 | **Use a rate appropriate to the decision** | **Not covered anywhere** |

## Is 3 distinct? Two demonstrations

- A finance **valuation** rate is authoritative and **inappropriate for a marginal decision** (§3).
- A carrying rate **containing obsolescence** is authoritative and **contains a risk we are forbidden to net** (§3, D-031).

Both pass requirements 1 and 2 and produce a wrong answer.

## What "fit" means operationally — a minimal, non-inventive test

> **A rate carries its *purpose* as metadata: what it was constructed for. A mechanism declares the purpose it requires. Mismatch blocks currency quantification and raises an `EVIDENCE GAP`.**

This adds **one field** — *purpose* — to D-014 rule 10's provenance list (source · owner · effective date · freshness · status). **No universal rate is created**, and nothing is invented: the purpose is stated by whoever owns the rate.

**Alternatives.** Leave it to mechanism authors — rejected, it is the failure mode that already occurred twice in this audit. Maintain per-decision rates — rejected, creates rates we do not own.
**Hidden assumption.** That a rate's purpose is knowable. **It requires asking finance a question they may not have been asked before** — a factory fact, recorded as such.
**Interaction.** D-023 — extended from *never invent* to *never misapply*. D-014 rule 10 — one field added. D-002 — a rate used outside its purpose degrades basis.
**Safe to lock.** **The principle: yes.** The metadata field requires a rule-10 amendment, presented before applying.

---

# 8. Orders & Supply Movement — evidence provided, and what is unobservable

**Classification unchanged: `ENABLER`.**

| Consumer | Evidence it provides |
|---|---|
| **Excess stock** | Open and planned orders · quantities · prices · order dates · **ETAs** — the deferral counterfactual needs to know *what is already coming and when* |
| **Safety stock** | **Lead time = order date → receipt date** — the central input · promised vs actual delivery for variability · receipt dates for the backtest |
| **Expedite premium** | Shipment · freight · mode · port and customs milestones · promised vs actual delivery · receipt · **the root-cause capture point** |
| **Purchase price opportunity** | PO lines · supplier · quantity · agreed price · **landed-cost components** · receipt quantity · invoice vs PO price |

## The operating chain, and what Release 1 cannot see

```
Saving Opportunity → Decision → Order → Supplier → Supply Movement
                   → Receipt → Actual Outcome → Verification / Learning
```

| Stage | Release 1 |
|---|---|
| Saving Opportunity | Observable |
| **Decision** | **Only if captured** — D-018 does this for M01's root cause; nothing else captures decision rationale |
| Order · Supplier | Observable |
| **Supply Movement** | **Partially** — current location and port milestones depend on `F-02` and on whether carrier data exists at all |
| Receipt | Observable |
| **Actual Outcome** | ⚠ **Materially limited.** Production consumption detail is out of scope (D-007), so *what the material actually did* is invisible |
| **Verification / Learning** | ⚠ **Constrained by the above** — and by **demand suppression, which is structurally unrecordable** |

> **The chain is broken at "Actual Outcome" in Release 1.** Verification is possible for procurement-side outcomes — price paid, freight paid, delivery timing — and **not** for production-side outcomes. Every mechanism's realization discipline inherits that limit.

**Safe to lock.** Classification and dependency map: **yes**. The observability limits are factual findings, not decisions.

---

# Classification

## A. READY TO LOCK

| | |
|---|---|
| **DP-10** | The six intervention types; **one-time = level change, recurring = policy change**; cancel/delay boundary; principal never in PAS |
| **DP-13** | Three-claim structure; **prospective indication, retrospective realization** |
| **DP-14** | Three factory-facing owner roles + adjudicator kept distinct; mechanism owner not factory-facing |
| **MITIGATES** | As a **disclosure-only** relationship, never netted |
| **Asymmetric valuation** | The one-sentence rule — **the net figure declares its own incompleteness** |
| **DP-15** | Component-level principle; **excess ≠ dead**; disposal does not release capital |
| **Rate fitness** | The principle |
| **Orders & Supply Movement** | Classification, dependency map, observability limits |

## B. REQUIRES FACTORY DATA

**Is warehouse space constrained?** · what purpose was finance's carrying rate built for, and are components separable? · `F-22` financing rate · `F-31` ordering cost · `F-01`/`F-06` expedite capture *(gates DP-13)* · are supplier escalations recorded? · expected price movement over a deferral window · supplier cancellation terms · inventory taxes · who owns data quality?

## C. REQUIRES ARCHITECTURAL DECISION

| | |
|---|---|
| **D-011 `Owner` field** | Must split into finding / action / data. **Amendment to be presented before applying** |
| **D-014 rule 10** | Add **purpose** to the provenance list for financial rates |
| **D-031** | Add **`MITIGATES`** as a third relationship type |
| **D-023** | Extend from *never invent* to *never misapply* |

## D. NOT YET JUSTIFIED

| | |
|---|---|
| Any currency figure for 4.7 prospectively | Evidence bar unreachable in Release 1 |
| Any single carrying-cost figure | Components unavailable |
| Quantified partial mitigation | Requires a severity measure, which is forbidden |
| Valuing stockout exposure | Requires production impact — out of scope (D-007) |
| Production-side verification | Chain broken at *Actual Outcome* |

---

**Nothing locked. Awaiting review.**
