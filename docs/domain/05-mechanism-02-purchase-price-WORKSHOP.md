# 05 — Saving Mechanism 02: **Procurement Price Opportunity** — WORKSHOP DRAFT

> ## ⚠ THIS IS NOT A LOCK DOCUMENT
> **Status:** `WORKSHOP DRAFT` — reconciled against the preliminary DP-01 … DP-08 decisions of 2026-08-07. Nothing here is locked.
> **Name:** approved as **Procurement Price Opportunity** (DP-01). Taxonomy §4.4's title *"Purchase price variance"* is superseded.
> Decision points at the end are **deliberately unanswered**. The Part 2.2 locked document will be created only after review.
>
> **No code, no UI, no schema, no formulas implemented.**
> **Governed by:** D-014 (16 financial-trust rules), D-017 … D-028.

---

## Mechanism identification — from the approved taxonomy, not invented

The taxonomy specifies this mechanism. Two sources agree:

**`docs/domain/03-saving-opportunity-model.md` §4.4** — *"Purchase price variance"*, listed as a Circle 1 category.

**`context/specs/00-build-plan.md`, U-18 sequencing** — verbatim:
> *"Start with **4.8 expedite/freight premium** … Then price variance (4.4), then excess stock (4.1)."*

Mechanism 01 was 4.8. **Mechanism 02 is therefore §4.4.** No invention required.

### ⚠ The taxonomy's own definition of 4.4 is now invalid

`03-saving-opportunity-model.md` §4.4 currently reads:

> **Calculation:** ~~`(current price − best comparable price) × annual volume`~~

**This violates D-027.** It is a category-level calculation applied to a total — precisely the shape the standing principle forbids. It is the same error as the rejected avoidability weights in mechanism 01, in a different costume: it looks like arithmetic and is actually an assumption that every unit of annual volume could have been bought at the better price.

This is `Q-07` arriving concretely. **Part of this workshop's job is to replace that formula with an event-level counterfactual.** Recorded as workshop finding **W-01**.

---

## The 15-point report

### 1. Mechanism name

**Taxonomy name:** *Purchase price variance* (§4.4).

**⚠ The name is ambiguous, and the ambiguity is dangerous.** It conflates two different things:

| Reading | Meaning | Who owns it |
|---|---|---|
| **(a) Accounting PPV** | Actual purchase price vs standard cost | **Finance** — per D-008, finance owns valuation |
| **(b) Procurement price opportunity** | Paid more than a defensible alternative that was actually available | **This system** |

D-008 is explicit that this system owns quantity truth and finance owns valuation. **Reading (a) is not ours to claim.** If finance already computes accounting PPV, a saving claimed on the same money would be a second set of books.

This mechanism should almost certainly be about **(b)**. That is a naming decision, not a detail — see `DP-01`.

### 2. Business problem it represents

The factory pays more per unit for a material than it needed to, and does not notice — because price drifts slowly, buying is fragmented across people and suppliers, contracts are not consistently applied, and in an EGP environment a genuine price change is hard to distinguish from a currency movement.

Unlike expedite premium, which is episodic and visible, **price leakage is structural and quiet.** It repeats on every purchase and nobody receives an alarm.

### 3. Why it belongs inside Potential Annual Saving

- **Material cost is typically the largest controllable cost line** in a manufacturing factory.
- The effect is **purely recurring** and **volume-multiplied** — it repeats on every unit bought, every period.
- It has **no one-time working-capital component** in its base form, which makes it clean under D-012's one-time/recurring split. (The price-break variant is the exception — see §12.)
- The intervention is often executable without capital expenditure.

### 4. What economic leakage it is intended to identify

> The gap between the price paid and the price of an **equivalent, actually-available** alternative supply at the time of the order.

Both qualifiers carry the whole weight:

- **Equivalent** — same specification, quality, incoterm, payment terms, quantity, delivery reliability. A price difference that ignores these is not a saving; it is a comparison error.
- **Actually available** — evidenced by a contract in force, a concurrent purchase, or a dated quotation. Not a price seen later, not a theoretical market price, not a price at a quantity never offered.

### 5. Who in a real Egyptian factory would own the problem

`REQUIRES_FACTORY_DATA` — the following is a hypothesis about a typical structure, not a claim about this factory.

| Candidate owner | Notes |
|---|---|
| Procurement / purchasing manager | The default assumption |
| Sourcing or category specialist | Only in larger operations |
| **Factory owner / General Manager** | In many Egyptian SMEs, key raw-material prices are negotiated personally by the owner. If so, the "owner of the problem" is also the approver, which changes the workflow and the politics of the recommendation entirely |
| Finance | Often owns price approval above a threshold, and owns FX and payment-terms policy |

`F-11` — who actually sets and approves material prices here?

### 6. What operational events create it

- Purchase order issued at a price
- Supplier quotation received (or received and not recorded)
- Contract or price agreement signed, renewed, or lapsed
- Supplier price-increase notification, accepted or challenged
- Invoice received at a price differing from the PO
- The same item ordered concurrently from two suppliers at different prices
- An order placed just below a price-break quantity
- FX movement changing the effective EGP cost of an unchanged foreign price
- Import duty, clearing or landed-cost changes
- Payment terms changed (which is a price change in substance)

### 7. What data would be required

| Data | Note |
|---|---|
| PO line: item, supplier, quantity, unit price, date | The anchor |
| **Currency, FX rate, rate date** | F10 capture contract (D-028). Decisive in Egypt |
| **Incoterm** | A price without an incoterm is not comparable |
| **Payment terms** | A price without terms is not comparable — see §8 |
| Invoice price actually paid, where it differs from PO | |
| **Evidence of the alternative**: contract price, concurrent PO, or dated quotation | **The gate — see §15** |
| Price-break / MOQ structure | For the price-break variant |
| Volume purchased per period | For annualization eligibility only |
| Specification / quality grade | Equivalence |
| Approved-supplier status | Whether the alternative was permissible |
| Duty, clearing and landed-cost components | Whether the compared prices are like-for-like |

### 8. What could make the cost legitimate rather than avoidable

**This is the section that determines whether the mechanism is credible.** Paying more is frequently correct:

- **Higher specification, grade or certification** — not the same product
- **Better payment terms.** At Egyptian interest rates, 90-day terms carry real financing value. A higher headline price at longer terms may be genuinely cheaper. **Comparing headline prices without terms is misleading**
- **Delivery reliability** — the cheaper supplier fails, and a stockout costs more
- **Deliberately smaller quantity** — buying less at a worse unit price to avoid excess stock. *This is another mechanism's saving* (see §13)
- **Different incoterm** — the higher price includes freight and duty
- **Single-source or customer-mandated supplier** — technical or contractual lock-in
- **Security of supply / strategic relationship** — allocation priority in a shortage
- **Genuine market movement** — input costs rose for everyone
- **FX movement** — the foreign price never changed at all
- **The cheaper quote was never tested** by an actual delivery
- **Import licence, local-content, or regulatory constraints**

Under D-025, several of these produce a **`COST / EXPOSURE / RISK`** record — real money, visible, not claimable as saving. Market-driven price increases are the clearest example: worth showing, never a saving opportunity.

### 9. What could make it genuinely avoidable

Ordered by strength of evidence:

| Case | Why it is defensible |
|---|---|
| **Contract price exists and was not applied** | Countable at event level, no assumption. The alternative was contractually guaranteed |
| **Concurrent split buying** — same item, same period, same terms, two suppliers, different prices | The alternative is evidenced by an actual purchase, not a quote |
| **Dated quotation declined without recorded reason**, terms equivalent | Weaker — a quote is an offer, not a proven supply |
| **Price increase accepted without challenge** where no index or FX movement explains it | Requires an external reference to be defensible |
| **Price break available at a marginally higher quantity, not taken** | Defensible on price, **but creates inventory** — see §12 |

**The contract-not-applied case is to mechanism 02 what lead-time correction was to mechanism 01**: the one place where cause, counterfactual, intervention and verification all sit inside our own data with no assumed rate.

### 10. What the proposed intervention would be

Cause-specific, never "negotiate harder":

| Cause | Intervention | Creates cost? |
|---|---|---|
| Contract not applied | Enforce contract price at PO creation | No |
| Split buying | Consolidate to the better-priced qualified supplier | Supply-security risk |
| Price break missed | Adjust order quantity | **Yes — inventory** |
| Unchallenged increase | Renegotiate or re-tender | Relationship / allocation risk |
| Single source | Qualify a second supplier | **Yes — qualification project** |
| Terms mispriced | Renegotiate terms rather than price | Financing effect |

### 11. What the counterfactual would look like

Event-level, per D-027. In shape:

> *"For these N identified PO lines, an equivalent qualified supply was available at price P at the time of ordering — evidenced by [contract in force / concurrent PO #### / quotation dated ##]. **At the quantities actually purchased**, and after FX normalisation to a stated policy rate, the difference is X."*

Three constraints that make it honest:

1. **At the quantities actually purchased.** No assuming a larger consolidated volume would have been offered the same price.
2. **Equivalence must be evidenced, not asserted** — spec, incoterm, payment terms, approved-supplier status.
3. **FX-normalised** before any comparison across dates (D-024).

**Not** `(current price − best price) × annual volume`. That assumes every unit could have been bought better, which is the assumption the counterfactual is supposed to test.

### 12. What costs might be created by the intervention

| Intervention | Cost created |
|---|---|
| **Price-break quantity increase** | **Carrying cost + one-time working-capital increase.** Mandatory offset, same discipline as D-014 rule 6 |
| Supplier switch | Qualification, first-article testing, possible transition scrap, quality risk |
| Consolidation | Loss of dual-source security; concentration risk |
| Renegotiation | Relationship cost; possible loss of allocation priority in shortage |
| Trading terms for price | Financing cost — requires finance's cost of capital, not an invented rate |

The carrying-cost offset depends on `N-10` / `F-08`, unresolved. Per D-023, **no default rate may be invented**; without it the *net* figure is not calculable even where the gross difference is `ACTUAL`.

### 13. What could cause double counting

**The richest overlap surface of any mechanism so far.**

| Against | Nature | Note |
|---|---|---|
| **Mechanism 01** (4.8 expedite) | **Already resolved by D-020** — emergency-purchase lines are excluded from price variance, because the difference is explained by urgency, not sourcing | The only overlap already settled |
| **4.5 Order consolidation** | Consolidating orders to obtain a better price is claimable by both. **Same money** | Component relationship |
| **4.6 MOQ optimisation** | Price breaks and MOQ are the same lever viewed from two sides | Likely one mechanism, not two |
| **⚠ 4.1 Excess stock** | **Direct opposition.** Buying more to get a better price *creates* the excess stock 4.1 exists to eliminate. One mechanism's saving is another's cost | See below |
| **4.7 Reorder point** | Order-quantity changes ripple into stock policy | Netting required |
| **F10 / FX** | An apparent price change that is entirely currency movement must not be claimed **at all** | Not a deduplication issue — a validity issue |
| **Finance's accounting PPV** | If finance already reports PPV, claiming the same money is a second set of books (D-008) | See `DP-01` |

**The 4.1 conflict deserves emphasis.** Price optimisation and inventory optimisation pull in opposite directions, structurally. A system that reports both as savings without netting them per item is internally contradictory and will be caught by the first finance manager who reads it. This is the same shape as D-020's expedite/safety-stock netting, and probably needs the same treatment.

### 14. What evidence would be required before quantifying

Nothing below is optional:

1. **Dated evidence of the alternative** — contract, concurrent PO, or timestamped quotation. A remembered price is not evidence
2. **Equivalence evidence** — spec, incoterm, payment terms, approved-supplier status
3. **FX normalisation** to a stated policy rate (D-024, `F-07`)
4. **Quantity actually purchased** — not a hypothetical volume
5. **Confirmation the alternative was available at that time and quantity**
6. **Incremental-cost inputs** where the intervention creates cost (`N-10`)
7. Per D-019, sufficiency for annualization is assessed separately from detection

### 15. What requires actual factory data rather than design reasoning

**And here is the finding that may reshape this mechanism.**

Mechanism 01's evidence — a freight invoice — **exists by necessity**: the factory had to pay it. Mechanism 02's evidence — the alternative that was *not* chosen — **exists only if someone chose to record it.**

Quotations that were declined are exactly the documents least likely to be systematically retained, and in Egyptian SME practice negotiation frequently happens by phone or WhatsApp with no structured record at all.

**If declined quotes and contracts are not recorded, this mechanism has no counterfactual**, and collapses to "price changed over time" — which is far weaker, heavily FX-contaminated, and closer to `COST / EXPOSURE / RISK` than to a saving opportunity.

| ID | Requires factory data |
|---|---|
| `F-11` | Who sets and approves material prices? |
| `F-12` | **Are quotations recorded, with dates and terms? Including declined ones?** ← the gate |
| `F-13` | **Do purchase contracts / price agreements exist in structured form, or informally?** |
| `F-14` | Is invoice price captured separately from PO price? |
| `F-15` | Are incoterms recorded per PO? |
| `F-16` | Are payment terms recorded per PO? |
| `F-17` | Are historical supplier price lists retained? |
| `F-18` | Does finance already compute accounting PPV, and against what standard? |
| `F-19` | Are duty and clearing costs attributable to a PO line? |
| `F-20` | Is there an approved-supplier list, and are single-source items identified? |
| `F-21` | Is specification / grade recorded well enough to establish equivalence? |

---

## A. Mechanism overview

A recurring, volume-multiplied leakage in the price paid for materials, detectable only where an **equivalent and evidenced alternative** existed at the time of purchase. Strongest where a contract was in force and not applied; weakest — and possibly not a saving at all — where the only evidence is a price that moved over time.

## B. Factory workflow

```
Requirement identified
   → Supplier selection            ← price decision often made here, invisibly
   → Quotation / contract reference ← the evidence, if it is recorded at all
   → PO issued at a price
   → Supplier confirms
   → Goods received
   → Invoice received               ← price may differ from PO
   → Payment at agreed terms        ← terms are part of the real price
```

Two points where evidence is created and commonly lost: **supplier selection** (why this supplier, at this price?) and **quotation** (what else was available?).

## C. Economic mechanism

Recurring cost differential per unit × units purchased. No one-time component in the base case; the price-break variant adds a one-time working-capital increase, which is a **cost**, not a saving.

## D. Data required

Per §7 above, with the F10 capture contract applying in full — original amount, currency, FX rate and date, quantity, unit basis, period — **as applicable, never invented where absent** (D-028).

## E. Potential counterfactuals

| Strength | Counterfactual |
|---|---|
| **Strongest** | Contract in force specified price P; PO issued at higher price. Difference on identified lines |
| **Strong** | Same item bought concurrently from another approved supplier at P, equivalent terms |
| **Moderate** | Dated quotation at P, equivalent terms, from an approved supplier, at the quantity ordered |
| **Weak** | Price rose over time with no external explanation — **candidate for `COST / EXPOSURE / RISK`, not saving** |
| **Not a counterfactual** | A better price observed later · a price at a quantity never offered · an unqualified supplier · a price ignoring incoterm, terms or FX |

## F. Candidate interventions

Per §10. The contract-enforcement case is the only one requiring no incremental cost and no assumed rate.

## G. Risks of false saving

1. **FX mistaken for price** — the dominant risk in Egypt
2. **Ignoring payment terms** — cheap money is part of the price
3. **Ignoring incoterm** — comparing EXW to DDP
4. **Assuming the alternative scales** — a quote for 5 tonnes is not a price for 50
5. **Quote treated as proven supply** — offers are not deliveries
6. **Spec drift** — cheaper because it is not the same material
7. **Annualising a one-off negotiation**
8. **Claiming market movement as failure** — exposure, not opportunity
9. **Ignoring the inventory cost** of price-break buying (§13)

## H. Double-counting risks

Per §13. **4.1 excess stock is the structural conflict**; 4.5 and 4.6 are component relationships; mechanism 01 is already resolved by D-020.

## I. Evidence requirements

Per §14. The binding gate is `F-12` / `F-13` — without recorded quotations or structured contracts, there is no counterfactual to test.

## J. Open questions

| ID | Question |
|---|---|
| `W-01` | §4.4's existing formula violates D-027 and must be replaced. Does replacing it here close `Q-07` for this category, or is a separate taxonomy pass required? |
| `W-02` | Is a declined quotation sufficient evidence of availability, or must there be an executed purchase? |
| `W-03` | How is payment-terms value expressed without inventing a discount rate? Finance's cost of capital is not yet known |
| `W-04` | Is "price increased over time" ever a `SAVING_OPPORTUNITY`, or always `COST / EXPOSURE / RISK`? |
| `W-05` | Are 4.5 (consolidation), 4.6 (MOQ) and the price-break variant genuinely three mechanisms, or one? |
| `W-06` | How are price and inventory opportunities netted per item, given they oppose each other? |
| `W-07` | What establishes "equivalence" concretely, and who adjudicates it? |
| `W-08` | Does an unrecorded negotiation leave any usable trace at all? |

## K. Decision points — **deliberately unanswered**

Per instruction, no recommendations are offered. Each requires business judgment.

| ID | Decision | What is at stake |
|---|---|---|
| **DP-01** | **Is this mechanism accounting PPV, or procurement price opportunity?** | D-008 gives valuation to finance. Choosing wrongly either duplicates finance's books or leaves the mechanism without a home. Also determines the mechanism's name |
| **DP-02** | **What evidence tier is sufficient to quantify?** Contract only · contract + concurrent PO · also declined quotes | Sets the mechanism's size and its defensibility. The stricter the tier, the smaller and more survivable the number |
| **DP-03** | **How are payment terms handled in comparison?** Ignore · adjust using a finance-owned rate · exclude non-equivalent-terms comparisons | Ignoring them produces false savings in a high-interest environment; adjusting requires a rate finance must own |
| **DP-04** | **Is a market-driven price increase `COST / EXPOSURE / RISK` or excluded entirely?** | Determines whether the product speaks about price exposure at all |
| **DP-05** | **Are price-break opportunities part of this mechanism, or of 4.6 MOQ?** | Prevents double counting; determines where the carrying-cost offset lives |
| **DP-06** | **How are price and inventory opportunities netted per item?** | They pull in opposite directions. Unnetted, the product contradicts itself |
| **DP-07** | **Who adjudicates equivalence?** System rule · buyer at capture time · reviewer at approval | Equivalence cannot be inferred from transactional data alone |
| **DP-08** | **Does the mechanism proceed if `F-12`/`F-13` are negative** — no recorded quotes, no structured contracts? | If evidence does not exist, this may be a *capture* project before it is a saving mechanism — as root-cause capture was for mechanism 01 |

---

**Stop point.** Awaiting review, challenge, and answers before any Part 2.2 locked document is created.


---
---

# PART 2.2 RECONCILIATION — preliminary decisions DP-01 … DP-08

> Reconciled 2026-08-07. **Still not a lock document.** Challenges below are raised as required, not as objections to authority.

## Definition, as reconciled

> **Procurement Price Opportunity** identifies a defensible opportunity where the factory paid more for an equivalent procurement outcome than an available or contractually achievable alternative at the relevant time.

**Accounting Purchase Price Variance is explicitly out of scope** and remains Finance's under D-008.

---

## DP-01 — Scope

**1. Compatible with locked rules?** Yes. It resolves the D-008 boundary conflict raised in the workshop. Nothing in D-014 … D-028 conflicts.

**2. Contradiction.** ⚠ **One real contradiction in existing text.** D-020 (locked) states deduplication precedence using the term *PPV*: *"a PO line flagged as an emergency purchase is excluded from PPV."* That reference now points at a mechanism that no longer carries the name, and — worse — "PPV" now unambiguously means **Finance's** metric. **D-020's wording must be amended** to say *Procurement Price Opportunity*, or the locked rule reads as though we are excluding lines from Finance's accounting variance, which is not ours to exclude anything from.

**3. Hidden assumptions.**
- **"Equivalent procurement outcome"** is broader than "equivalent price". If *outcome* includes reliability, quality and continuity of supply, equivalence becomes multi-dimensional and often unresolvable from transactional data alone. This is the correct framing and it makes the mechanism substantially harder — DP-07 exists because of it.
- **"available OR contractually achievable"** merges two different evidentiary standards. *Available* means someone would have sold it. *Contractually achievable* means we held a right to it. The second is far stronger. Merging them in one sentence blurs exactly the distinction DP-02's hierarchy is trying to draw.

**4. Factory evidence required.** `F-18` — does Finance already compute accounting PPV, and against what standard? Needed not to copy it but to **explain the difference** when both numbers reach the same CFO.

**5. Double-counting risk.** Not logical, but **perceptual and real**: Finance's PPV and our Procurement Price Opportunity may describe the same PO line with different numbers. Nobody is double counting, but a CFO seeing both will assume someone is. Needs a stated reconciliation position.

**6. Terminology changes.** Taxonomy §4.4 title · D-020's use of "PPV" · every "purchase price variance" reference in `03-saving-opportunity-model.md` and the build plan U-18 sequencing line.

**7. New open questions.** `W-19` — how is our figure explained alongside Finance's accounting PPV so the two are not read as competing?

---

## DP-02 — Evidence hierarchy

**1. Compatible?** Yes in intent. The refusal to fix minimum thresholds is exactly D-019's discipline, and the three outcome bands (currency / indication / insufficient) map cleanly onto the locked ladder.

**2. Contradiction.** ⚠ **Latent conflict with D-014 rule 15.** If a tier *label* determines confidence, the tier becomes a category constant — the precise thing rule 15 forbids and the precise error D-017 corrected. **Tier must gate eligibility, never supply confidence.**

**3. Hidden assumption — the hierarchy is one-dimensional, and the problem is two-dimensional.**

The proposed tiers order evidence by **provenance** (contract > concurrent > quote > historical). But equivalence quality is an **orthogonal axis**:

```
                    EQUIVALENCE QUALITY
                    poor  →→→→→→→→→→  exact
 PROVENANCE   contract   ▢  ▢  ▢  ▢  ▣
 STRENGTH     concurrent ▢  ▢  ▢  ▣  ▣
      ↑       quotation  ▢  ▢  ▣  ▣  ▣
              historical ▢  ▢  ▢  ▢  ▢
```

A Tier B concurrent PO with mismatched incoterms and a different quantity is **weaker** than a Tier C quotation matched exactly on spec, terms, incoterm and volume. A single ordered list cannot express that, and will license the wrong comparisons.

**4. Factory evidence.** `F-12` / `F-13` must establish not only *whether* quotations and contracts exist, but **which axis is actually the constraint here** — is the factory short of alternatives, or short of the equivalence attributes needed to compare them? Those imply different products. Add: `F-15` incoterms, `F-16` payment terms, `F-21` specification — these are the equivalence axis, and without them even Tier A evidence cannot be used.

**5. Double-counting risk.** None introduced.

**6. Terminology.** "Tier" implies a single ladder. If the two-axis view is accepted, *evidence class* (provenance) and *comparability grade* (equivalence) would be clearer.

**7. New open questions.** `W-09` two-axis model? · `W-10` can Tier D historical comparison **ever** license currency, given DP-04 already excludes market movement? · `W-11` is Tier E a `COST/EXPOSURE/RISK` record, or **nothing at all**?

`W-11` matters more than it looks: DP-04's market movement produces a *visible cost with no alternative* — that is exposure. Tier E produces *no comparison at all* — which is not exposure, it is silence. Conflating them would fill the product with empty records.

---

## DP-03 — Payment terms

**1. Compatible?** Yes, and strongly aligned with D-023.

**2. Contradiction.** None.

**3. Hidden assumptions.**
- **That a single finance-owned rate exists.** The economically correct rate is the factory's marginal cost of funds *at the time of the decision*. In Egypt that has moved sharply. A scalar "finance rate" applied across a 12-month window is itself a false precision — it must be **effective-dated**, which makes it an F10 capture concern, not a settings value.
- **That terms are the only financing dimension.** In Egyptian import trade, **advance payment and letter-of-credit requirements** are frequently a larger economic difference than the headline price, and they carry observable bank charges. A supplier demanding 100% advance against one offering 60 days is not comparable on price at all.

**4. Factory evidence.** `F-16` terms per PO · new `F-22` does Finance hold an effective-dated cost-of-funds rate, or a single scalar? · new `F-23` are advance-payment / LC requirements and bank charges recorded per PO?

**5. Double-counting risk.** ⚠ If LC and financing costs are later treated as their own leakage category, and terms adjustment is also applied here, the same financing cost could be claimed twice. Flag now, before either is designed.

**6. Terminology.** "Payment terms" understates it. **"Payment and financing conditions"** covers terms, advance requirements and LC.

**7. New open questions — and a challenge to the decision's default.**

> **Challenged as instructed: can payment terms be treated as comparability without a Finance model?**
>
> **Yes — in one mode, and it is the more defensible one.** Terms can be used as a **gate**: if terms differ materially, the comparison is *non-equivalent* and no saving is claimed. That requires **no rate at all**, invents nothing, and is fully defensible.
>
> A rate is needed only to **adjust** rather than **exclude**. DP-03 as written treats adjustment as the goal and exclusion as fallback. **I would argue the reverse should be the default**: exclude first, adjust only where Finance supplies an effective-dated rate. Exclusion loses opportunities; adjustment risks manufacturing them. Given D-014's posture, losing a defensible opportunity is the cheaper error.

`W-12` exclusion-first or adjustment-first? · `W-13` LC/advance payment as a comparability dimension or a future mechanism?

---

## DP-04 — Market price movement

**1. Compatible?** Yes, with D-021 and D-025.

**2. Contradiction.** None — but the decision's **heading and rule differ in emphasis**, and the rule is the correct one. The heading says *"a market-driven price increase alone is NOT a saving opportunity."* The rule says *"if there is no defensible alternative available at the relevant time, classify as COST / EXPOSURE / RISK."*

**The classification trigger is the absence of an alternative, not the presence of market movement.** These come apart in a case worth naming: if the market rose *and* a fixed-price contract was available and not taken, an alternative existed — and the increase becomes evidenced opportunity, not exposure. Keying the rule on "market movement" would wrongly exclude it. Keying it on "no defensible alternative" handles it correctly.

**3. Hidden assumption — and the challenge you asked for.**

> **Challenged as instructed: is `COST / EXPOSURE / RISK` the correct classification for market movement?**
>
> **Correct in kind, dangerous in volume.** The classification is right. But consider what happens on a large EGP devaluation: **every imported item simultaneously generates an exposure record.** The product fills with alarming, correct, and entirely unactionable findings, and the signal from genuine procurement failures is buried under macroeconomics.
>
> Exposure records need their own **materiality and aggregation discipline** — which we have not designed. D-025 established the class and forbade it entering the headline; it said nothing about how much of it to show, or whether ten thousand FX exposure records should roll up into one statement rather than ten thousand.

**4. Factory evidence.** `F-07` FX source and policy — without it, "market movement" and "currency movement" cannot even be separated, and both would land in the same bucket for the wrong reason.

**5. Double-counting risk.** None into savings. But FX exposure could be reported both here and by any future FX mechanism.

**6. Terminology.** State the rule as **"no defensible alternative available at the relevant time"**, with market movement as the common *instance*, not the test.

**7. New open questions.** `W-14` exposure materiality and aggregation — how does the product avoid drowning in correct-but-unactionable exposure after a devaluation?

---

## DP-05 — Price breaks

**1. Compatible?** Yes with D-020 and D-014 rule 6. The insistence that price benefit cannot be evaluated apart from inventory consequence is correct and matches the mechanism-01 discipline.

**2. Contradiction.** None.

**3. Hidden assumption — and the challenge you asked for.**

> **Challenged as instructed: do price breaks truly belong in this mechanism?**
>
> **They are a different economic mechanism wearing the same clothes.**
>
> - Procurement price opportunity: *we paid more than necessary **for the quantity we bought***
> - Price break: *we could pay less **by buying a different quantity***
>
> The first is a **sourcing** decision, owned by the buyer, with no inventory consequence. The second is a **quantity** decision, owned by whoever sets stock policy, whose entire cost sits in inventory. Same currency, different cause, different owner, different intervention, different offset.
>
> Keeping it "part of" this mechanism is workable — but it creates an opportunity that **can never be evaluated by this mechanism's own rules**, and therefore one that someone will eventually evaluate by the price rule alone because they did not read the caveat. That is exactly the failure mode D-025 was locked to prevent, in a different place.
>
> **The structural-safety-consistent alternative:** make it a distinct **composite sub-type** — `PRICE_BREAK_OPPORTUNITY` — that is *composite by construction* and structurally cannot be presented without both sides. Same reasoning as class-versus-status: enforce it in the model, not in the caveat.

**4. Factory evidence.** `F-08` carrying-cost basis · price-break structures recorded per supplier item (`F-17` extended) · consumption rate and current stock policy per item.

**5. Double-counting risk.** ⚠ High, and against **4.6 MOQ specifically** — a minimum order quantity and a price break are frequently the *same supplier term* viewed from two ends. If both mechanisms exist, they will claim the same money.

**6. Terminology.** "Price break" should be distinguished from "price opportunity" in name, whatever the structural answer.

**7. New open questions.** `W-15` distinct composite sub-type, or a sub-case with a caveat? · `W-05` (existing) becomes sharper: are 4.5, 4.6 and price break one mechanism or three?

---

## DP-06 — Netting

**1. Compatible?** Yes, and it correctly refuses an invented carrying-cost rate.

**2. Contradiction.** None.

**3. Hidden assumption — the most important finding of this reconciliation.**

> DP-06 asks for a **double-counting control**. Double counting is not the worst failure here.
>
> - **Double counting** = mechanism 02 and mechanism 4.1 both claim the same 100,000 EGP. The headline inflates. Bad, and D-020 already addresses it.
> - **Contradiction** = mechanism 02 says *"buy more of item X, save on price"* while mechanism 4.1 says *"you hold excess of item X, buy less."* Both computed independently, both correct by their own rules, both displayed.
>
> **Nothing in the locked decisions prevents the second.** D-020 controls attribution of a shared benefit; it does not detect opposed recommendations on the same subject. And contradiction is the more damaging failure: double counting inflates a number that a reviewer may or may not audit, while a self-contradicting recommendation pair **destroys credibility instantly and visibly**, in front of the exact user the product needs to convince.

**4. The exact cross-mechanism dependency and control required.**

**Dependency chain for any price-break or quantity-affecting opportunity:**
```
PRICE_BREAK / quantity-affecting opportunity
  requires → finance-owned carrying-cost basis        (F-08 / N-10)
  requires → item consumption rate                     (F-10, mechanism 01 register)
  requires → current stock policy for the item
  requires → 4.1's excess-stock threshold definitions  (A-18)
```

**Control, proposed in two parts:**

- **Deduplication control** — shared **subject key `(item, site, period)`**. Any opportunity affecting an item's order quantity is netted against every other opportunity on the same key before presentation, per D-020, with attribution explained.
- **Contradiction control (new, not yet covered by any locked decision)** — opportunities on the same subject key carry a **direction** (increase / decrease order quantity or stock). **Opposed directions on one subject may not both be presented as open opportunities.** They must resolve to a single netted recommendation, or both suspend pending adjudication.

**5. Double-counting risk.** Addressed above; the contradiction risk is the addition.

**6. Terminology.** Distinguish **"double-counting control"** from **"contradiction control"**. They are different failures needing different mechanisms.

**7. New open questions.** `W-16` — is contradiction control a new locked rule, and does it belong in the saving model rather than in either mechanism?

---

## DP-07 — Human adjudication

**1. Compatible?** Yes, and consistent with D-018's in-workflow capture.

**2. Contradiction.** None.

**3. Hidden assumptions — and the strongest practical risk in this mechanism.**

- **The buyer confirming comparability is the person who made the original decision.** Mechanism 01 asked *"why did this happen?"*, which is blame-free and answerable. This asks, in substance, *"was there a better alternative you did not take?"* — a self-incriminating question. Buyers may systematically reject comparability, and unlike mechanism 01, **rejection here directly suppresses the saving.**
- **The reviewer may not be independent.** If the procurement manager reviews their own team, the conflict moves up one level. If `F-11` shows the **owner or GM personally negotiates prices** — common in Egyptian SMEs — then the adjudicator *is* the person whose decision is being questioned. There is then no independent adjudicator anywhere in the organisation.
- **Rejection rates become gameable**, and are the mechanism's own integrity metric. D-011 already requires rejections to be data; here that requirement is load-bearing rather than nice-to-have.

**4. Factory evidence.** `F-11` who negotiates and approves prices · new `F-24` who could adjudicate comparability, and are they independent of the price decision?

**5. Double-counting risk.** None.

**6. Terminology.** "Adjudicates" is right and worth keeping — it signals judgment, not data entry.

**7. New open questions.** `W-17` — what happens when no independent adjudicator exists? Options include escalation outside procurement, a recorded-but-unadjudicated state, or accepting that this mechanism cannot be quantified in owner-negotiated categories.

---

## DP-08 — Insufficient evidence

**1. Compatible?** Yes with D-019. Refusing both fabrication and abandonment is right.

**2. Contradiction.** ⚠ **A structural one, against D-025.**

D-025 locked **exactly two classes**: `SAVING_OPPORTUNITY` and `COST / EXPOSURE / RISK`. A **capture recommendation** — *"start recording declined quotations for these twelve high-spend items"* — is **neither**. It has no currency, it is not money being spent, and it is not an opportunity with a value.

Forcing it into `SAVING_OPPORTUNITY` with `INSUFFICIENT_DATA` would place an object with no economic content inside the class the North Star aggregation consumes — precisely the structural risk D-025 was locked to eliminate. Forcing it into `COST / EXPOSURE / RISK` would misrepresent it as money at risk.

**This needs resolution before the Part 2.2 lock**, because it touches a locked decision.

**3. Hidden assumptions.**
- **That recommending capture is costless.** It is administrative burden on buyers with no immediate payoff to them. *"Improve your record-keeping"* is the least motivating output a saving engine can produce, and it is the **first thing this mechanism would say** if `F-12`/`F-13` are negative.
- **A circularity:** the system would be asking for effort to discover whether there is anything worth discovering. Mitigation available and defensible — **prioritise capture requests by spend**, which we can observe, rather than by suspected opportunity, which we cannot. High-spend items are where capture would pay off *if* anything is there, and that ordering needs no assumption about what is there.

**4. Factory evidence.** `F-12` / `F-13` are the trigger for this entire branch.

**5. Double-counting risk.** None.

**6. Terminology.** *"Evidence capture recommendation"* rather than *"saving opportunity"*, whatever class it lands in.

**7. New open questions.** `W-18` — does DP-08 require a **third object class** outside D-025's two? If so, D-025 needs an explicit amendment rather than a silent reinterpretation.

---

## Challenges you asked for that cut across the DPs

**Can procurement price opportunity be quantified without an actually available alternative?**
**No — by definition, and this should be a hard rule.** If no alternative existed, there was no opportunity; there was only a price. `NO ALTERNATIVE → NO OPPORTUNITY.` DP-04's exposure classification and DP-02's Tier E both follow from this single rule rather than standing as separate judgments.

**Are concurrent POs genuinely comparable?**
**Not automatically.** A concurrent PO proves *a supplier sold at that price*, not *we could have bought our volume at that price*. Concurrent orders routinely differ in quantity, urgency (which is mechanism 01's territory, already excluded by D-020), destination, terms and spec. If the cheaper concurrent PO was small and ours was large, the supplier may never have honoured that price at volume. **Concurrent POs need the same equivalence gate as quotations**; their only advantage is that the transaction actually occurred.

**Can historical price ever support a saving claim?**
**Rarely, and effectively never alone.** It would require showing the same supplier would still have sold at the old price at the relevant time — a counterfactual about supplier behaviour we cannot observe — while FX contamination sits on top of it. Position: historical price supports **detection and indication**; it should not license **currency quantification** unless paired with contract or concurrent evidence. This is the substance of `W-10`.

**Interaction with future inventory / MOQ mechanisms.**
Covered in DP-05 and DP-06. The essential points: price breaks and MOQ are frequently the same supplier term; price and inventory optimisation pull in opposite directions; and **contradiction control is missing from every locked decision so far**.
