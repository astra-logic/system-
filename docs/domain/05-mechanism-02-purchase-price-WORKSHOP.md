# 05 — Saving Mechanism 02: Purchase Price Variance — **WORKSHOP DRAFT**

> ## ⚠ THIS IS NOT A LOCK DOCUMENT
> **Status:** `WORKSHOP DRAFT` — for review, challenge and revision. Nothing here is decided.
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
