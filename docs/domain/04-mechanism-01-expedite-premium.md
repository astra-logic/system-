# 04 — Saving Mechanism 01: Expedited Freight / Emergency Purchase Premium

> **Status:** Product-design workshop. **No code, no formulas implemented, no schema, no UI.**
> **Task source:** `docs/02-handoff-part1-locked.md`
> **Governed by:** the 16 locked financial-trust rules (adopted as D-014)
> **Labels used:** `PROPOSED` (recommended, not accepted) · `UNKNOWN` (undetermined) · `REQUIRES FACTORY DATA` (cannot be answered from reasoning)

This is the first saving mechanism because it measures **money that was actually spent**, not money hypothetically saveable. It needs no assumed carrying-cost rate to state the observed fact, and its evidence is a document the factory already possesses. If any mechanism can be made defensible, this is the one.

---

## 1. What economic mechanism are we measuring?

**The premium paid to compress time.**

When material is needed sooner than the normal supply process delivers, the factory buys speed. It buys it in one of two forms:

- **Freight premium** — a faster shipping mode than standard for that lane (air instead of sea, courier instead of road, dedicated instead of consolidated).
- **Emergency purchase premium** — buying from a non-preferred source, in a smaller quantity, or at spot price, because the preferred source cannot deliver in time.

The measured quantity is the **difference between what was paid and what the standard path would have cost.**

### The critical framing

**The premium is not the waste. The premium is a symptom with a price tag attached.**

The causal chain is:

```
Root condition          →  Shortage risk  →  Expedite decision  →  Premium paid
(late reorder,
 understated lead time,
 supplier miss,
 quality rejection,
 demand spike,
 customs delay)
```

Paying the premium was very often the *correct* decision at the moment it was made — the alternative was a line stoppage costing more. **The saving is never "stop expediting."** The saving is removing the conditions that made expediting necessary.

This distinction determines whether this mechanism is credible or embarrassing. A system that tells a procurement manager "you wasted 400,000 EGP on air freight" will be dismissed immediately and correctly, because they know each of those decisions was defensible. A system that says "of your 400,000 EGP in expedite premium, 260,000 traces to four items whose lead times are wrong in the master data" is telling them something true and actionable.

---

## 2. What data is required?

### Per expedite event

| Data | Notes |
|---|---|
| PO and PO line reference | The anchor for deduplication |
| Item, quantity | |
| **Freight cost actually paid, separable from material cost** | The gate. See below. |
| **Shipping mode actually used** | Air / sea / road / courier / dedicated |
| **Standard mode for that item, supplier and lane** | Needed for the baseline |
| Unit price paid vs preferred-source price | For emergency *purchase* premium |
| Date ordered · date required · date received | |
| Standard lead time for that item and supplier | Also the thing most often wrong |
| Expedite authorisation — who, when | |
| **Stated reason / root cause** | See §5. Usually not derivable from data. |

### The gating question

`REQUIRES FACTORY DATA` — **Does the factory currently record freight cost separably, per shipment, and can it be attributed to PO lines?**

This is `N-07`, and it is binary for this mechanism:

- **If yes** → the mechanism produces `ACTUAL`-based figures and is the strongest category in the taxonomy.
- **If no** → it produces **event counts without currency values**. Still useful ("11 expedited shipments last quarter, 7 on the same three items"), but it cannot contribute to Potential Annual Saving until the capture exists.

There is no honest middle path. Estimating freight cost from an average when the invoice was never separated manufactures the number.

### Allocation

`PROPOSED` — When a shipment carries multiple PO lines and only some were urgent, the premium is attributed to **the lines that drove the mode decision**, not spread across all lines by weight or value. Spreading it dilutes the signal and misattributes cause. `UNKNOWN` — how the factory would identify the driving line; may require capture at the time of the decision.

---

## 3. What counts as evidence?

Evidence quality is tiered, and the tier drives confidence (locked rule 15 — confidence from data coverage, not category constants):

| Tier | Evidence | Produces |
|---|---|---|
| **A** | Freight invoice with mode, attributable to PO line, **plus** a contracted or matched-history standard-mode benchmark for the same lane and period | `ACTUAL` / `CALCULATED` currency figure |
| **B** | Expedite flag and separable freight cost, but benchmark is an unmatched average | `ESTIMATED`, range widened |
| **C** | Expedite flag recorded, cost not separable | **Event count only. No currency figure.** |
| **D** | No flag; expedite inferred from compressed lead time | `PROPOSED` as a *detection* signal to prompt human classification. **Must not produce a currency figure.** |

Tier D deserves emphasis. Inferring "this was expedited because it arrived faster than usual" is a reasonable way to *find candidate events for a human to confirm*. It is not evidence of a premium, because fast delivery is not proof of extra payment. Treating inference as evidence is how a saving engine starts fabricating.

---

## 4. What baseline is needed?

Premium = actual cost − baseline cost. Everything depends on what the baseline is.

`PROPOSED` — a **precedence ladder**, taking the first that is available:

1. **Contracted standard rate** for that lane and mode, from finance or procurement. Strongest.
2. **Trailing median actual cost** for the same item/supplier/lane at standard mode, within a matched period. Self-maintaining; requires a minimum sample.
3. **Finance-provided standard freight rate.**
4. `CANNOT_CALCULATE`.

**A blanket average across all shipments is explicitly rejected.** Lanes differ, modes differ, and periods differ.

### Matching requirements — all mandatory

- **Same lane or item.** Air freight from Shanghai is not comparable to air freight from Alexandria.
- **Same period.** Freight rates move violently. A 2026 spot air rate against a 2024 sea contract rate is not a premium, it is a market movement.
- **Same incoterm.** EXW versus DDP shifts which costs sit where.
- **Same currency, FX-normalised.** See §13.

### For emergency purchase premium

Baseline is **the preferred/contracted supplier's price at the time of the event** — not the lowest price ever recorded, and not today's price. `PROPOSED`.

---

## 5. What is actually avoidable?

**This is the decisive question of the entire mechanism**, and the one most likely to be got wrong in a way that destroys credibility.

Not all premium is avoidable. `PROPOSED` — every expedite event carries a **root-cause classification**, and avoidability follows from it:

| Root cause | Avoidability | Why |
|---|---|---|
| Lead time understated in master data | **High** | Cause, fix and verification all sit inside our own data |
| Reorder triggered late | **High** | Planning parameter correction |
| Reorder point set too low | **High** — but see §6 | Fixing it *increases* stock |
| Supplier delivered late | **Partial** | Supplier management or buffer; not unilaterally ours |
| Quality rejection forced re-buy | **Partial** | Supplier quality; largely out of release-1 scope |
| Demand spike, unforecastable | **Low** | Reorder-point planning is reactive by construction (D-010) |
| Customer-driven rush order | **None as loss** | May carry commercial premium — we lack the revenue data to judge |
| Customs, port, force majeure | **Low** | See §13 |

`PROPOSED` — Avoidable premium = Σ (event premium × avoidability weight for its root cause).

**The weights are a business decision, not an engineering default.** See Decision Point 1.

### The uncomfortable structural consequence

**Root cause is almost never present in transactional data.** It requires a human to say why the expedite happened. This means:

> The saving engine requires a capture step inside the operational workflow — the buyer classifies the reason at the moment of expediting.

That is not an analytics feature. It is a change to how procurement works, and it makes concrete the core mission's claim that *management is the operating layer of the saving engine*. Retrospective classification is possible but lossy, and its coverage must feed confidence (§9).

`UNKNOWN` — whether the factory's buyers will reliably classify. If coverage is low, this mechanism degrades to event counting.

---

## 6. One-time vs recurring

**Expedite premium is purely recurring.** It is operating expense that repeats. There is **no working-capital release component**, which makes it one of the cleanest contributors to the annual headline (locked rules 3 and 4).

### But the offset is mandatory

Most fixes for avoidable expedites work by **holding more stock** — raising a reorder point, adding safety stock, ordering earlier. That carries a cost:

```
Net recurring benefit  =  avoidable premium avoided
                        − additional carrying cost of the buffer required to avoid it

Plus, separately:       a one-time WORKING CAPITAL INCREASE
                        (negative, not a saving)
```

This is the mirror image of the order-consolidation trap in locked rule 6, and it must be applied with the same discipline. **Claiming the full premium as recurring saving while ignoring the stock increase needed to achieve it overstates the benefit and, in the worst case, recommends an action that loses money.**

Depends on `N-10` (carrying-cost rate). If that rate is assumed rather than owned by finance, then the *net* figure is `ASSUMED` even though the gross premium is `ACTUAL`. Per D-002 contagion, the weakest basis wins.

**Exception worth noting:** the *lead-time correction* fix is unusual and valuable — correcting a wrong master-data lead time reduces expedites **without necessarily increasing stock**, because the planning system was working from a false input. Where root cause is "lead time understated," the offset may be zero or small. `PROPOSED` — treat this cause as the highest-quality opportunity in the category.

---

## 7. How does annualization work?

Governed by locked rules 11, 12 and 13.

Expedite events are **lumpy and seasonal**. Annualising a short window is how this mechanism produces its most embarrassing errors.

`PROPOSED` — a tiered treatment:

| Usable history | Treatment | Basis |
|---|---|---|
| **≥ 12 months** | Annualise on trailing 12 months of actual events | `CALCULATED` |
| **6–12 months** | Range only, explicitly widened, coverage stated | `ESTIMATED` |
| **< 6 months** | **No annual figure.** `INSUFFICIENT_DATA` | — |

### The distinction the product should exploit

Even below the threshold, there is a true and useful statement available:

> *"Observed expedite premium, last 5 months: 180,000 EGP (ACTUAL). Not enough history to project an annual figure."*

That is honest, defensible, and still valuable to a procurement manager. **The system can report observed spend as fact without claiming an annual saving.** This is exactly the posture locked rule 12 demands, and it should be a designed state rather than an empty screen.

### Event count, not just time

`PROPOSED` — a minimum **event count** as well as a time window. Twelve months containing three events does not support a stable annual figure, and a single large customs incident must never be annualised into a recurring pattern.

`UNKNOWN` — what that minimum count should be. See Decision Point 3.

### Seasonality

`REQUIRES FACTORY DATA` — Egyptian factories commonly see demand and logistics seasonality (Ramadan, year-end, port congestion cycles, pre-devaluation stockpiling). A trailing-12 window absorbs these; a shorter window does not. This reinforces the 12-month preference rather than being a separate rule.

---

## 8. What must Finance own?

Per locked rule 8, and consistent with D-008 (finance owns valuation, this system owns quantity truth):

| Finance owns | Why it matters here |
|---|---|
| **Standard / contracted freight rates by lane and mode** | The Tier-A baseline. Without it we fall to trailing median. |
| **Carrying-cost rate** (`N-10`) | The §6 offset. Determines whether net benefit is `CALCULATED` or `ASSUMED`. |
| **FX policy** — which rate, at which date | See §13. Decisive in Egypt. |
| **Whether freight is capitalised into inventory value or expensed** | See §10 — creates a real double-count risk. |
| Definition of what qualifies as premium for their reporting | So our figure reconciles to theirs rather than competing with it |

Every one of these carries the metadata locked rule 10 requires: **source, owner, effective date, freshness, status.**

`REQUIRES FACTORY DATA` — whether any of these currently exist in a maintained form. `UNKNOWN` — if standard freight rates do not exist, whether finance is willing to own them, or whether the trailing-median baseline is the permanent answer.

---

## 9. How is uncertainty represented?

Per locked rules 2, 9 and 15 — confidence derives from **evidence and data coverage**, never from a per-category constant.

`PROPOSED` — confidence is computed from measurable coverage:

| Input | Effect |
|---|---|
| % of expedite events with separable freight cost | Primary driver |
| % of events with root cause classified | Drives the §5 avoidability figure |
| Baseline tier achieved (A / B / C) | Drives comparison quality |
| Length of usable history | Per §7 |
| Event count | Stability |
| FX volatility across the window | Egypt-specific; see §13 |

Output is a **range**, and the range is widened by whichever of these is weakest. The dominant source of width will almost always be the **avoidability weights** — they are the softest input and they multiply everything.

**Basis reporting:** the gross observed premium may be `ACTUAL`. The avoidable portion is at best `ESTIMATED` and, while the weights are unratified, `ASSUMED`. The net-of-carrying-cost figure inherits from `N-10`. Per D-002 contagion, **the headline contribution carries the weakest of these** — which, realistically, will be `ASSUMED` at launch. That must be shown, not softened.

---

## 10. How is duplicate counting prevented?

Locked rule 14. Four real overlap risks, all of which double-count actual money:

**1. Against purchase price variance (taxonomy 4.4).**
An emergency purchase at a higher unit price will also look to a PPV detector like "paying above best available price." Same money, two claims.
`PROPOSED` — **precedence to this mechanism.** A PO line flagged as an emergency purchase is *excluded* from PPV, because the price difference is explained by urgency, not by poor sourcing. Attributing it to sourcing would also misdirect the action.

**2. Against reorder-point / safety-stock optimisation (taxonomy 4.7).**
These two act on the same lever in opposite directions — one wants more stock to avoid expediting, the other wants less stock to release capital.
`PROPOSED` — for a given item, expedite-driven and capital-release opportunities are **evaluated as one combined, netted opportunity**, never summed as two. Presenting both separately would be internally contradictory and would expose the engine as naive.

**3. Against excess-stock valuation, if freight is capitalised.**
If finance capitalises freight into unit cost, the premium is already inside the stock value used elsewhere. Small, but real — and it is why §8 asks the question.

**4. Same event surfacing under both freight premium and emergency purchase premium.**
A rushed order from an alternative supplier shipped by air is one event with two premium components. They are components of one claim, not two claims.

`PROPOSED` — **deduplication key: (PO line, period).** Any PO line contributes to **at most one currency claim** across the entire taxonomy. Overlaps are netted before aggregation and the deduction is shown, per D-012.

---

## 11. How is the action defined?

The action is never "expedite less." It is cause-specific:

| Root cause | Action | Quality |
|---|---|---|
| Lead time understated | Correct the master-data lead time | **Best.** Cause, action and verification all inside our data. Little or no stock increase. |
| Reorder triggered late | Fix the trigger or the review cadence | Good |
| Reorder point too low | Raise it — **with the carrying-cost offset shown** | Good, but see §6 |
| Supplier late | Supplier conversation, dual-source, or buffer | Partial; needs supplier performance data (`A-12`) |
| Quality rejection | Supplier quality action | Largely outside release 1 |
| Demand spike | **No opportunity created** | Honest refusal |

`PROPOSED` — **the lead-time correction is the first action the product should support.** It is the only one where the system observes the cause, proposes the fix, applies it, and verifies the result entirely within its own data — no external assumptions, no carrying-cost rate, no offset. It is the cleanest possible proof that the saving loop works.

`UNKNOWN` — owner. Buyer or procurement manager (`N-12`).

---

## 12. How is the saving realized and verified?

Per D-011: `POTENTIAL → APPROVED → IN_PROGRESS → REALIZED`, with measurement gating entry to `REALIZED`.

**Baseline captured at `APPROVED`** — never reconstructed afterwards:
- Trailing-12-month expedite premium for the item/supplier
- Event count and root-cause distribution
- Current planning parameters (lead time, reorder point, safety stock)
- Purchase volume over the baseline period
- Freight rate index for the lane, if available

**Measured after the observation window:**
```
Net realized  =  (baseline premium − observed premium)   ← normalised by volume
               − additional carrying cost actually incurred
```

### Verification hazards — to be stated in the product, not hidden

**Confounding is the central problem.** Premium can fall because the fix worked, or because demand fell, or because freight rates dropped, or because someone stopped recording it. A reduction is **not proof**.

`PROPOSED` — mitigations, each partial and each declared:
- **Normalise by purchase volume** (premium per unit purchased) so a demand drop does not read as success.
- **Report lane rate movement alongside** the result so a market change is visible.
- **Compare against unaffected items** as a weak control.

`UNKNOWN` — whether a genuine control group is achievable. **Probably not.** The honest position is that realization here is *evidence-supported attribution*, not proof, and the product should say exactly that rather than claiming certainty it does not have.

**The observation window is long.** For a lumpy phenomenon, detecting a real change needs enough events — plausibly 6–12 months. A saving declared `REALIZED` after three weeks on a category producing four events a year is not verified; it is asserted.

This is uncomfortable and it is correct. **A slow honest verification cycle is the price of a number that survives audit** — and per the core mission, the realised-versus-identified ratio is the product's own credibility metric. Inflating it early destroys the thing it exists to measure.

---

## 13. Egypt-specific factors *(directly material to this mechanism)*

Raised because they change the calculation, not as general context.

**1. FX is the largest distortion risk.**
Freight and imported material are commonly denominated in USD or EUR while cost reference and reporting are in EGP. Following the EGP devaluations, **a premium that appears to have grown 40% year-on-year may be entirely currency movement with no operational change at all.**

`PROPOSED` — **all premium trending and annualisation must be FX-normalised** to a stated policy rate before comparison. Without this the engine will manufacture large, confident, entirely false opportunities — precisely the failure mode the locked rules exist to prevent.

**This escalates `A-09` (multi-currency).** I had it as an ordinary open question. For an import-dependent Egyptian factory it is closer to foundational: it affects the baseline (§4), annualisation (§7), and verification (§12). It should be reconsidered as a Tier 1 question.

**2. Customs is a distinct premium type, possibly larger than air freight.**
Demurrage, detention, storage and clearance-expediting charges are common, material, and frequently arrive as **separate invoices never attached to the PO**.
`REQUIRES FACTORY DATA` — are these captured, and can they be attributed to a shipment? If they can, they may be the single largest recoverable category. If they cannot, this mechanism is measuring the smaller half of the problem.
`UNKNOWN` — whether customs delay is classified as avoidable. Partly it is documentation quality, which *is* addressable; partly it is port conditions, which are not.

**3. Pre-devaluation stockpiling is rational behaviour that looks like waste.**
Buying ahead of an expected devaluation is a sound hedge. A naive excess-stock detector will flag it as capital waste. Not this mechanism's problem directly, but it affects taxonomy 4.1 and should be recorded before that detector is designed.

---

## 14. Decision points — product/business judgment required

Stopping here, per the handoff instruction. Each of these is a business decision and **must not be defaulted by an engineer or an agent.**

| # | Decision | Why it cannot be defaulted |
|---|---|---|
| **1** | **Avoidability weights by root cause** (§5) | Multiplies every figure in this mechanism. The single largest driver of the headline contribution and of the range width. |
| **2** | **Is root cause captured at expedite time, or retrospectively?** (§5) | A workflow change to procurement, not a software choice. Determines whether this mechanism produces currency or only event counts. |
| **3** | **Minimum event count for annualisation** (§7) | Trades coverage against stability. A business tolerance, not a formula. |
| **4** | **Precedence between expedite premium and PPV** (§10) | Recommended to this mechanism, but it changes which team is told to act. |
| **5** | **Does customs demurrage count as expedite premium?** (§13) | May be the largest component. Affects scope and data capture. |
| **6** | **Observation window before `REALIZED`** (§12) | Trades credibility against speed of visible wins. Reputationally the most consequential choice here. |
| **7** | **Does the carrying-cost offset use finance's rate or an assumption?** (§6) | Determines whether net benefit is `CALCULATED` or `ASSUMED`. |
| **8** | **Is FX normalisation mandatory before trending?** (§13) | Recommended strongly. Escalates `A-09`. |

---

## 15. Summary position

**This mechanism is worth building first, and its honest form is narrower than it first appears.**

- The gross observed premium can be `ACTUAL` — genuinely defensible, and rare in this product.
- The *avoidable* portion is `ESTIMATED` at best and `ASSUMED` until the weights are ratified.
- The *net* benefit depends on the carrying-cost offset, and therefore on `N-10`.
- Without separable freight capture (`N-07`), it produces **event counts, not currency**.
- Without root-cause capture, it produces **a total, not an opportunity**.
- In Egypt, without FX normalisation, it produces **confident fiction**.

The strongest first deliverable is narrow and fully defensible: **items whose master-data lead time is demonstrably wrong, evidenced by repeated expedites, where the fix is a parameter correction the system can verify itself.** No assumed rates, no carrying-cost offset, no FX exposure in the causal claim. That is the cleanest available proof that the saving loop works end to end — and per D-013 it is exactly what the vertical slice should carry.
