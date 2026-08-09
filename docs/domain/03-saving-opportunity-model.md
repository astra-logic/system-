# 03 — Saving Opportunity Model

> **Status:** Draft 1, reconciled 2026-08-07 against the Part 2.1 decision lock (D-017 … D-028). Planning only.
> **Source of authority:** `docs/01-core-mission.md` (North Star), `docs/00-product-bible.md` (§36, §37, §38).
> **Supersedes:** the recommendation structure in D-003, which is now under-specified.

The core mission document names **Potential Annual Saving** as the primary business KPI. This document makes that operational: what a saving opportunity *is*, how each type is calculated, which types are defensible in the first release, and — most importantly — the rules that stop the headline number from becoming the single most damaging fake figure in the product.

---

## 1. The inversion, and what it changes

`01-core-mission.md` reframes the product. Previously the working description was:

> *A system that makes stock true, and turns that truth into better buying decisions with visible financial consequence.*

The North Star restates the priority:

> **A system that discovers, quantifies and verifies how much money the factory could save per year — supported by the operational management that makes those savings executable and sustainable.**

Inventory truth has not become less important. It has been **reclassified**: under §12 of the core mission it is an `ENABLER`, not `CORE`. The saving engine is `CORE`.

**This does not reorder the build plan**, and it must not be allowed to. The Bible is explicit that trust precedes intelligence (§56-03) and that data foundations precede analytics (§50). A saving engine computing over untrustworthy stock data produces confident nonsense — the exact failure §47 prohibits. The dependency order stands.

**What it does change** is three things:

1. **The vertical slice extends further.** D-006's slice previously ran supplier → PO → receipt → stock → consumption → cost. It now runs one step further, to **a single quantified saving opportunity for one material**. That proves the product thesis end to end while the foundations are still cheap to change.
2. **The first release's definition of done changes.** It is no longer "stock is true and purchasing is supported." It is "the factory can see a defensible saving opportunity and act on it."
3. **The product test changes.** Every unit is now measured against §13 of the core mission: *if we removed this, would the system become less capable of discovering, explaining, executing or sustaining Potential Annual Saving?*

---

## 2. The Saving Opportunity object

Replaces D-003's recommendation structure. Every opportunity carries:

| Field | Notes |
|---|---|
| Opportunity | What could be saved |
| Category | From the taxonomy in §4 |
| Factory area | Inventory · Procurement · Replenishment · Consumption |
| Subject | The item, supplier or location it concerns |
| Root cause | *Why* the money is being lost — not just that it is |
| Evidence | References a user can open and inspect |
| Source data | Which records the figure rests on |
| Data freshness | Age of the oldest input. Drives `STALE_DATA`. |
| Calculation | The transparent working, per §5 of the core mission |
| Assumptions | Named, explicit, overridable |
| ~~Confidence~~ | ~~Per a defined rule (`A-03`), never a judgement call~~ — ⚠ **removed from the MVP 2026-08-08 by D-045.** `A-03` is unanswered and rule 15 forbids category constants, so a required field with no formula would be **synthesised** — most plausibly by blending gate outcomes, which is exactly the *"gates are never averaged and never become scores"* prohibition arriving as a UI necessity |
| **Evidence strength** | `EARLY` / `STRONG` per D-026. An attribute, never a lifecycle state |
| **Coverage facts** | Stated plainly, not compressed into a score: *"root cause classified on 7 of 9 events" · "lead-time sample: 11 receipts over 14 months" · "cost reference age: 9 days."* **An observation cannot be wrong; a score has to be explained, and the explanation is always the facts** |
| **One-time impact** | Working capital released, cash freed. Happens once. |
| **Recurring impact** | Annual cost reduction. Repeats yearly. |
| Potential Annual Saving | Derived — see the aggregation rules in §5 |
| Required action | The concrete next step |
| ~~Owner~~ | ~~The person accountable~~ — **split 2026-08-08 by the D-011 amendment** |
| **Finding Owner** | Accountable for the finding **being addressed**. *"Whose problem is this?"* |
| **Action Owner** | **Executes** the intervention. Often a different person — inventory detects excess, **purchasing** defers the order |
| **Data Owner** | Accountable for **input data quality**. The natural owner of an `EVIDENCE GAP` |
| Status | Per the lifecycle in §3 |
| Outcome | What actually happened |

**On the three owner fields (D-011 as amended).** One field held three accountabilities that do not collapse. They are **configurable**, and **one person may hold several** — distinct fields do not require distinct people, and **no organisational structure is invented by defining a field**. Where no suitable owner exists the finding is **unowned and visibly so**: an unowned finding is itself the signal that nobody is accountable for that class of problem.

⚠ **The adjudicator is a reviewer, not an owner.** Approval of a currency claim belongs to an adjudicator independent of the underlying decision (DP-07). Collapsing that into Finding Owner silently loses the independence requirement. **Mechanism Owner** — accountability for the detector's own correctness — is internal product governance and is **not a field on a finding**.

**The one-time / recurring split is the field that matters most, and the one most often collapsed.** Releasing €200,000 of working capital from excess stock is a one-time event. Reducing carrying cost by €18,000 per year is recurring. Presenting the first as an annual saving overstates the number by roughly an order of magnitude. They must be separate fields, separately aggregated, and separately displayed — never summed into one figure.

---

## 2a. Reconciliation with the Part 2.1 lock *(2026-08-07)*

Three concepts introduced while designing mechanism 01 are **general to the saving engine**, not specific to that mechanism, and govern this model:

**1. The three-state evidence ladder (D-019).** No universal minimum event count anywhere in the taxonomy. Every category holds these apart:

```
OPPORTUNITY DETECTED  →  ANNUALIZATION ELIGIBLE  →  VERIFIED REALIZATION
```

A single event may detect an opportunity while its annual saving remains `INSUFFICIENT_DATA`. This complements — does not replace — D-014 rule 11's 12-month preferred window: rule 11 sets the *time* bar, D-019 refuses to reduce *sufficiency* to a counted threshold.

**2. Findings are separated by class (D-025 as amended 2026-08-07).**

```
FINDING
├── OPPORTUNITY          ← the only class the North Star aggregation may consume.
│                          Carries the §3 lifecycle.
├── OBSERVED COST        ← historical ACTUAL fact. No lifecycle. No mitigation.
└── EXPOSURE / RISK      ← forward-looking FORECAST/ESTIMATED. No lifecycle.
                           May carry mitigation.

EVIDENCE GAP             ← OUTSIDE the Finding hierarchy (W-46). A statement about
                           our data, never about the factory's money.
```

Classes, not statuses. As statuses they would be one careless filter away from inflating the headline; as classes that is structurally impossible.

**Binding:** exposure is never approved and never realized · a mitigation with a defensible counterfactual **becomes a new Opportunity** · direction changes **supersede**, never mutate · a materialised exposure is **preserved** and creates a **linked `OBSERVED COST`** · uncertain exposure is **never netted** against Potential Annual Saving · `ACTUAL` cost and `FORECAST` exposure are **never mixed in an aggregate**.

This generalises what §4.9 already required for stockout risk, and it makes the product useful about money it cannot claim.

**3. Evidence-based, event-level counterfactual reasoning (D-017, elevated to a standing principle by D-027 `LOCKED`).** No category in this taxonomy may compute a saving by applying a percentage to a total.

> Never *"60% of this cost is avoidable."*
> Instead *"these specific events are attributable to this specific root cause, and this intervention would have prevented them under this stated counterfactual."*

Financial quantification requires, where applicable: **stated intervention · testable counterfactual · reliable incremental-cost inputs · appropriate FX normalisation · sufficient evidence.** Never manufacture precision from weak evidence. This governs every category below and every mechanism not yet designed.

**4. FX normalisation, and the F10 capture contract (D-024, D-028 `LOCKED`).** Every figure in §4 that compares across periods must be FX-normalised. Raw dimensions permitting later decomposition — original amount, currency, FX rate and rate date, quantity, unit basis, period — are **captured now** under **F10 — Financial Change Decomposition Capture Contract**, *as applicable to each event and never invented where absent*.

The universal decomposition **calculation** (`operational + price/rate + FX + volume/mix`) is **deferred** until a second mechanism validates the abstraction (`Q-08`). Capture is irreversible; computation is reversible. Where a decomposition cannot be performed reliably, the conclusion is marked rather than presented with false precision — it is never fabricated.

**Consistent capture across mechanisms is a precondition of §5's aggregation rules.** Inconsistent capture would reintroduce basis laundering: aggregating figures whose FX and price treatment differ produces a total that looks precise and is not.

**5. Deduplication is at the economic-mechanism level (D-020).** Not per transaction. Genuinely independent effects may both be quantified; attribution must be explainable.

**6. Contradiction control is separate from deduplication (D-029 `LOCKED`).**

> Every Opportunity must expose an **intervention signature** sufficient to determine whether it conflicts with another Opportunity.

Minimum: **typed subject · affected dimensions · direction per dimension · effect window.** The originating mechanism populates it.

**Detection:** two open opportunities conflict when their subjects intersect, their affected dimensions intersect, their directions oppose, **and** their effect windows overlap. All four must hold — so *"reduce safety stock"* and *"get a better price"* on one item correctly coexist.

**Allowed resolutions:** net · suspend · supersede · adjudicate.

| | Double counting (D-020) | Contradiction (D-029) |
|---|---|---|
| Question | Same money twice? | Can both actions be taken? |
| Failure | Headline inflates | Recommendations unexecutable |
| Visibility | **Invisible unless audited** | **Immediately visible** |

**6a. An Opportunity may create or deepen a linked Exposure/Risk (D-031 `LOCKED`).**

```
OPPORTUNITY
    ├── CREATES   ──▶  EXPOSURE / RISK    introduces a new exposure
    ├── DEEPENS   ──▶  EXPOSURE / RISK    worsens an existing exposure
    └── MITIGATES ──▶  EXPOSURE / RISK    reduces an existing exposure
                                          (added 2026-08-08, disclosure-only)

OPPORTUNITY      ──creates 0..n──▶ · ──deepens 0..n──▶ · ──mitigates 0..n──▶
EXPOSURE / RISK  ──has 0..1 creating · 0..n deepening · 0..n mitigating
```

**`MITIGATES` (D-031 as amended 2026-08-08).** The exposure **must already exist** — that is what separates it from `CREATES`. It is **never netted** into Potential Annual Saving: mitigating an unvaluable exposure yields an unvaluable benefit, and netting would require valuing the exposure. **Partial mitigation is stated qualitatively only.** Verification is by **supersession** — a later observation at a lower level (D-025 principle 4). If the exposure ever becomes valuable, the mitigation acquires a defensible counterfactual and **becomes an Opportunity in its own right**, never a netted benefit on the mitigating Opportunity.

*Why it was needed:* Mechanism 01's reorder-point fix shows a cost and an expedite reduction while its **stockout-risk reduction is invisible** — so a correct action looks purely bad. Supersession handles verification; it does not handle **disclosure at decision time**.

`CREATES`, `DEEPENS` and `MITIGATES` are **distinct types**. **`DEEPENS` is never counted as `CREATES`** for aggregation. `DEEPENS` is a **factual relationship, not a financial valuation** — **no probability, percentage, threshold or monetary value** is assigned to it, and it is never silently netted. An Opportunity that deepens an Exposure **must disclose it to the reviewer**.

The Exposure record is **not created until the intervention is actioned** (`W-47`); before that the prospective consequence is an attribute of the Opportunity's disclosure. Where several Opportunities affect one subject, **each carries its own record** and current exposure is a **derived view** (`W-48`).

**Disclosed alongside the Opportunity, never subtracted from it.** Rule 6 nets *certain* incremental costs; an *uncertain* future obligation is disclosed — netting a probability against a certainty would require inventing one. **No probability scores, thresholds or risk-value calculations.**

Validated across supplier concentration · commitment risk · logistics disruption · inventory risk · FX exposure. Note that **netting and disclosure coexist**: a price break produces both a certain carrying cost (netted) and an uncertain obsolescence risk (disclosed).

`EXPOSURE / RISK` **carries no intervention signature** — a mitigation with a defensible counterfactual becomes an Opportunity, and that carries it. **D-029 governs opposed actions; D-031 governs an action that creates or deepens a risk.**

**7. Mechanism boundaries follow the counterfactual (D-030 `LOCKED`).** Boundaries are set by whether the counterfactual changes the **quantity purchased over the relevant defined window** — never by supplier terminology. And: **boundary determines mechanism; gates determine quantifiability.**

---

## 3. Lifecycle

Adopting the core mission's §6 vocabulary as canonical (per `code-standards.md`: the domain vocabulary is *the* vocabulary):

```
POTENTIAL → APPROVED → IN_PROGRESS → REALIZED
          ↘ REJECTED  (reviewed and declined, with reason)
          ↘ EXPIRED   (assumptions no longer hold)
```

With one addition carried over from D-003, because it is the gate that makes the whole thing falsifiable:

**Amended 2026-08-07 (D-022, D-026 `LOCKED`).** The default verification window is **12 months**. Verification strength is a **separate attribute**, never a lifecycle state — workflow state and evidence strength are orthogonal and must not be mixed:

```
Lifecycle:         IN_PROGRESS          Lifecycle:         IN_PROGRESS
Evidence strength: EARLY                Evidence strength: STRONG
```

The Core Mission §6 lifecycle above stands unchanged. `REALIZED` remains the state representing sufficiently verified financial realization under the existing rules.

**Between `IN_PROGRESS` and `REALIZED` sits measurement.** An opportunity may not enter `REALIZED` by assertion. It enters when an outcome is observed against a baseline captured *before* the action. An action taken whose measured outcome does not materialise resolves to `EXPIRED` or is re-opened — never silently to `REALIZED`.

Two supporting rules:

- **Baselines are captured at `APPROVED`, not reconstructed at `REALIZED`.** A reconstructed baseline is unfalsifiable, and an unfalsifiable saving claim is a fake saving claim.
- **Rejections are data.** A category rejected 90% of the time is a broken category, and the system should be able to see that about itself. This is the `LEARN` step of the core product loop (§9).

---

## 4. Taxonomy and calculation rules

Scoped to **Circle 1** (inventory, procurement, replenishment, consumption, supplier, cost, working capital). Circles 2–5 are out of the first release.

Each category below states its inputs, its impact type, and — critically — **the conditions under which it must refuse to produce a number**.

> **§4.1 – §4.9 were re-expressed 2026-08-08 under D-027**, paying down `Q-07`. Each is now stated as *intervention + testable counterfactual*, and the original formulas — every one of which applied a rate to a total — are recorded as superseded rather than deleted. **All quantity-side interventions now belong to Mechanism 03** (`docs/domain/17-part-2.3-LOCK.md`).

### 4.1 Excess stock → **position correction** *(rewritten; D-033)*
**Not one category — six interventions:** cancel · delay · reduce order quantity · reduce reorder point · reduce safety stock · dispose. Each has a different counterfactual, different offsets and a different recurrence.
**The unifying rule:** **one-time benefits come from changing a stock *level*; recurring benefits come from changing a *policy*.**
**Impact:** one-time = **financing value of deferred outlay only**, over the deferral window. Recurring = carrying reduction, and only where a **policy** changed.
**⚠ The principal is never a saving and is never called a "release."** You cannot un-buy stock. For excess, the outflow is **delayed, never avoided**.
**⚠ Excess with no pending order produces no Opportunity at all** — there is nothing to defer. It is a **position**, reported as such (`B2-04`).
**Refuses when:** no pending order · `F-39` expected price movement unavailable — *assuming zero is itself an invented assumption, and in a devaluing currency it is known to be wrong* · `F-22` cost of funds unavailable · `A-18` coverage policy undefined · cost reference stale.
> *Superseded formula, retained as history:* `excess qty = on-hand − (target coverage × consumption rate)`, valued at unit cost. It presented the **principal** as a benefit, which reads magnitude as value.

### 4.2 Slow-moving stock — **RETIRED AS A SAVING CATEGORY** *(D-034)*
Four attempts to find an independent intervention; all four fail. Slow-but-appropriately-stocked has no intervention · slow-as-a-sourcing-signal is temporal consolidation · slow-as-a-KPI is analytics · **slow-relative-to-shelf-life is §4.3's disposal decision triggered earlier**, not an independent mechanism.
**Preserved, not deleted:** a **detection signal** feeding §4.1 and §4.3 · a **trigger** advancing §4.3 for shelf-life items (`F-34`) · an **`EXPOSURE / RISK`** where no action is available.
**Why retirement matters structurally:** its entire risk profile was borrowed from §4.1 and §4.3 — it would have claimed their money under a third name. Its turnover cut-off is also a threshold (`A-18`), tolerable for a signal and **not** tolerable for anything producing currency.

### 4.3 Dead / obsolete stock → **disposal** *(rewritten; D-033 (f), D-035)*
**Intervention:** dispose of stock with no movement since date `D` and no open requirement recorded.
**⚠ Counterfactual weakness, stated rather than hidden:** *"will never be consumed"* is forward-looking; D-010 gives only observed consumption. The claim the system may make is the weaker, honest one.
**Impact:** recovery value and disposal cost are **one-time** (`F-38`); carrying avoided is recurring — and per D-035 **possibly near zero**.
**⚠ Deliberate exclusion, unchanged:** the *value of the stock itself is not a saving.* Writing off dead stock is loss recognition — money already spent.
**⚠ Added by D-035:** **disposal does not release capital.** For dead stock capital is **lost, not tied**; scrapping converts a book asset into a book loss — an accounting event, not a cash event. Only recovery received and ongoing costs no longer incurred are cash effects.
**Refuses when:** `F-38` disposal cost / recovery value unavailable · `F-33` (is space constrained?) unanswered, which decides whether the space component exists at all.

### 4.4 Purchase price variance — **SUPERSEDED BY MECHANISM 02** *(D-030, Part 2.2 lock)*

> ⚠ **This category's original formula was a rate applied to a total and is INVALID.** It is retained below, struck through, as history — never as a specification. `docs/domain/09-part-2.2-LOCK.md` is authoritative for this category.
>
> **Also renamed.** *"Purchase price variance"* now unambiguously means **Finance's accounting PPV**, which is not ours under D-008. Ours is **Procurement Price Opportunity**.

**As locked:** an opportunity exists where the factory paid more for an **equivalent procurement outcome** than an **available or contractually achievable alternative at the relevant time**. Quantification is **event-level and counterfactual** (D-027), gated by evidence class → comparability → factual conditions, and **unestablished is never a pass**.

#### Original entry (superseded — do not implement)

~~**Inputs:** price history, alternative supplier prices, annual volume~~
~~**Calculation:** `(current price − best comparable price) × annual volume`~~
~~**Refuses when:** below `A-12` delivery sample · prices not genuinely comparable.~~

**Why it is invalid.** A price difference multiplied by an annual total is **a rate applied to a total** — the precise error D-017 rejected and D-027 elevated to a standing principle. It assumes the alternative was available for the whole year, at that price, for that quantity, on equivalent terms. **Comparability is the hard part, and a price difference that ignores it is not a saving.**

### 4.5 Order consolidation — **RETIRED AND REDISTRIBUTED** (D-032)

> This category held **three** distinct economic mechanisms under one name. Retired 2026-08-07. **No new mechanism was created.**
>
> - **Supplier consolidation** → **Mechanism 02**. Same total quantity over the window; **landed-cost comparability required**; may create a supplier-concentration exposure (D-031)
> - **Temporal / order consolidation** → **future quantity / inventory mechanism**. Changes ordering quantity and frequency economics
> - **Shipment consolidation** → **future-domain gap.** Real effect, currently unowned, **not a mechanism in current scope**, gated by `F-01`, materiality unmeasured. Preserved, not deleted
>
> The original text below is retained for history. Its formula is separately invalid under D-027 (`Q-07`).

#### Original entry (superseded)
**Impact:** recurring
**Calculation:** `(orders avoided × ordering cost) − additional carrying cost incurred`
**Refuses when:** ordering cost is unknown
**⚠** The carrying-cost offset is **mandatory**, not optional. Consolidating orders raises average stock. An un-netted figure is inflated by construction.

### 4.6 MOQ — **reshaped, not retired** *(D-038 subtype D)*
**⚠ As previously written it had no intervention.** *"Excess forced by MOQ, valued and carried"* computed a cost against an action that does not exist. If the MOQ cannot be changed, the carrying cost of the forced excess is **the price of doing business with that supplier** — an `OBSERVED COST` at most, never an Opportunity. This is the same defect that retired §4.2.
**It becomes an Opportunity only where an alternative is evidenced:** a negotiated lower MOQ · an alternative supplier with a lower one (`F-20`) · a smaller order multiple (`F-44`).
**Composes with Mechanism 02 in the opposite direction** — M02's price break argues for buying *more*.
**Refuses when:** MOQ not recorded · no alternative evidenced · `F-08` carrying components unavailable.

### 4.7 Reorder point / safety stock → **buffer policy** *(rewritten; D-037, D-039)*
**⚠ The reorder point decomposes**, and this changes who owns what:
```
reorder point  =  lead-time demand  +  safety stock
                        ↑                    ↑
              Mechanism 01's lever     this category's lever
```
The two act on **different components of the same parameter**, so they **compose** rather than automatically contradicting.
**What may be claimed prospectively: nothing in currency.** A backtest supports *"on-hand never fell below `L`, and no recorded intervention explains that floor"* — **absence of evidence of insufficiency, not evidence of sufficiency.** *"`L` would have been sufficient"* requires ruling out production rescheduling and demand suppression, which are **structurally unobservable** in Release 1.
**⚠ The floor is not neutral in either direction.** A missed reorder plus quiet demand produces a floor reached **by mistake and validated by luck**. Backtesting to it would enshrine the error.
**Realization is retrospective:** reduce, wait twelve months, observe. The claim that cannot be made prospectively **can be verified retrospectively** (D-019, D-011, D-022 — no new machinery).
**⚠ Evidence for *increasing* a buffer is strictly stronger than for reducing one** — a recorded expedite is a fact; an avoided stockout is a counterfactual over unobservable interventions. A buffer **increase** is a **Mechanism 01 Opportunity** consuming Mechanism 03's cost model, carrying `MITIGATES`.
**⚠ Both sides must be shown**, and per D-041 **the net figure must itself declare that it excludes an unvalued risk** — proximity on the page is not enough.
**Refuses when:** `F-01`/`F-06` expedite capture unavailable *(gates the level-B claim)* · `F-35` escalations, `F-36` overrides, `F-27` substitutes unavailable · any prospective currency claim, always.
**No service-level model.** `N-11` is a **policy the factory states**, never a parameter we fit.

> **`Q-07` is now paid down for §4.1, §4.2, §4.3, §4.6, §4.7 and §4.9** (2026-08-08). §4.4 was superseded by Mechanism 02 and §4.5 retired by D-032. The superseded formulas are retained above as history, not deleted.

### 4.8 Emergency purchasing / expedited freight premium
**Impact:** recurring
**Calculation:** `premium paid over standard price/freight`, summed and annualised
**Refuses when:** expedite flag or freight premium is not captured (`NEW-07`)
**✓ The most defensible category in the release** — it measures money actually spent, not money hypothetically saveable.
**→ Fully designed in `docs/domain/04-mechanism-01-expedite-premium.md` (Part 2.1).** That document supersedes this summary for this category.

### 4.9 Stockout — **RECLASSIFIED as `EXPOSURE / RISK`** *(D-034)*
**Not an Opportunity, and not a new class.** Every existing class was tested first: `OPPORTUNITY` fails (no counterfactual — *"you are at risk"* is a projection, not a foregone alternative) · `OBSERVED COST` fails (a past stockout has no attributable cost in Release 1) · `EVIDENCE GAP` fails (it is a claim about the factory, not about our data). **`EXPOSURE / RISK` fits** — forward-looking, `FORECAST`-derived, may carry mitigation.
**Status in release 1: NOT QUANTIFIABLE**, and not merely unquantified. Costing a stockout requires production interruption cost; production is out of scope (D-007).
**⚠ Exposure counts and expedite counts are not additive.** Mechanism 01 measures the premium paid **to avoid** a stockout; this measures the **risk of** one. Where an expedite occurred, the stockout did not happen — the exposure was mitigated before it was ever recorded and **leaves no trace**. Anyone reading the two figures together must be told they do not sum.
**Even a mitigation cannot be valued.** Expediting has a knowable cost and an unvaluable benefit. That asymmetry is a human decision, not a system quantification.
**Receives `DEEPENS`** from §4.1 and §4.7, and from Mechanism 03 subtype A — smaller, more frequent orders increase the number of replenishment cycles and therefore the **occasions of exposure**, even at an unchanged trough. **Direction only; never a probability.**

### 4.10 Quantity & inventory economics — **Mechanism 03**
`docs/domain/17-part-2.3-LOCK.md` is authoritative for every quantity-side intervention above. It supersedes §4.1, §4.3, §4.6 and §4.7 as the design of record, and it supplies the **inventory cost model** that Mechanisms 01 and 02 consume to net their incremental carrying cost under D-014 rule 6.

---

## 4a. The asymmetric-valuation rule *(D-041)*

Every Opportunity presents three **separately-typed** components:

```
BENEFIT                measurable, evidenced
CERTAIN COST / OFFSET  netted (D-014 rule 6)
EXPOSURE / RISK        disclosed, never netted (D-031)
```

> **Where an exposure exists and cannot be valued, the net figure must itself declare that it excludes an unvalued risk — and that the exclusion is always in the optimistic direction.**

Linking the exposure is not sufficient. A reader can see `benefit − cost = net` and take the net at face value while the linked risk sits elsewhere on the page. **The number itself must carry its own incompleteness.** This matters most in §4.1 and §4.7, where a quantified benefit always stands beside an **unvaluable** stockout exposure — without this rule the presentation is structurally biased toward cutting inventory.

Same discipline as D-002's basis: **a number that carries what is wrong with it.**

---

## 5. The aggregation problem *(the highest-risk part of this product)*

A single headline figure — *"Potential Annual Saving: €487,000"* — is the most seductive number this system can display, and the easiest to get catastrophically wrong. Four failure modes, each of which produces a number that is confidently, invisibly inflated:

**1. Double counting.** Reducing excess stock of Material A and optimising its reorder point both lower average stock on the same material. Summed naively, the same money is claimed twice.

**Rule (D-020 — corrected 2026-08-08).** Deduplication is performed at the **economic-mechanism level**, not by subject. ~~*Superseded: "deduplicated by subject before aggregation."*~~ **Subject-level deduplication is wrong and understates**: a single PO line can carry two genuinely independent effects — an air-freight premium fixed by planning, and a spot-price premium fixed by sourcing — and deduplicating by subject **discards one of them and misdirects the fix**. Genuinely independent effects may both be quantified; where one effect is a component or consequence of another, deduplicate. **Attribution must be explainable, never a silent filter.**

**2. One-time treated as annual.** A €200,000 working-capital release is not €200,000 per year. **Rule:** one-time and recurring impacts are aggregated separately and displayed separately. "Potential Annual Saving" contains recurring impact only. Capital release is reported as its own figure, labelled as one-time.

**3. Annualising from thin history.** Two months of consumption multiplied by six is not an annual figure — it is a guess wearing a precise number's clothing. **Rule:** annualisation requires a minimum history window (`NEW-08`); below it, the opportunity returns `INSUFFICIENT_DATA`.

**0. Non-Opportunity findings leaking into saving.** `OBSERVED COST` and `EXPOSURE / RISK` (D-021, D-025 as amended), and `EVIDENCE GAP` (outside the hierarchy entirely), must be structurally incapable of entering this aggregate — not merely filtered out by convention. **`ACTUAL` cost and `FORECAST` exposure are never mixed**, in this aggregate or any other.

**4. Basis laundering by aggregation.** Summing an `ACTUAL`-based opportunity with an `ASSUMED`-based one yields a total that looks precise and is not. **Rule:** per D-002's contagion rule, an aggregate carries the *weakest* basis among its components. A total containing any `ASSUMED` input is `ASSUMED`. A total containing any stale cost is `STALE_DATA`.

### The headline figure, stated correctly

Given the above, the North-Star number is **a range with a stated basis, not a point**:

```
Potential Annual Saving (recurring)
€310,000 – €420,000

Basis: CALCULATED, partly ASSUMED
Weakest input: carrying-cost rate (assumed 18%, not confirmed by finance)
Cost reference age: 14 days
Overlap deducted: €31,000

Separately — one-time working capital release: €180,000 – €240,000
```

This is less impressive than a single confident number. **That is the point.** Per §56-10 of the Bible: never fake certainty. A range that survives scrutiny is worth more than a point figure that collapses the first time a finance manager audits it — and it will be audited, because it is the number the whole product is judged on.

### The credibility ratio

Alongside the headline, the system should display its own track record:

> *Realized this year: €96,000 of €412,000 identified (23%)*

This is the honesty mechanism that makes the North Star trustworthy over time, and it is what turns the core product loop's `LEARN` step into something real. A system that only ever shows potential is unfalsifiable. A system that shows what it actually delivered earns the right to be believed about what it promises.

---

## 6. Data trust addition

The core mission adds **`STALE_DATA`** to the Bible's §38 list. The provenance envelope (D-002) now carries eight basis values:

`ACTUAL · CALCULATED · FORECAST · ESTIMATED · ASSUMED · USER_DEFINED · INSUFFICIENT_DATA · STALE_DATA`

This matters more here than anywhere else in the system, because of D-008: **cost is imported from finance.** Every financial figure the product shows rests on that import. When it ages past its threshold, the figures do not merely carry a caveat — they change basis to `STALE_DATA`, and per contagion every aggregate above them does too.

`NEW-09` — what is the staleness threshold for the cost reference? It is a business decision, and it sets the point at which the product's headline number stops claiming currency.

---

## 7. New open questions

| ID | Question | Blocks |
|---|---|---|
| N-07 | Are expedite flags and freight premiums captured on purchase orders? | 4.8 — the most defensible saving category |
| N-08 | Minimum consumption history before annualisation is permitted? | All annualised figures |
| N-09 | Cost reference staleness threshold? | `STALE_DATA` transitions, every financial figure |
| N-10 | What is the carrying-cost rate, and does finance own it? | 4.1–4.7. Currently the weakest input in the entire model. |
| N-11 | What is the target service level for safety stock? | 4.7 |
| N-12 | Who owns and approves saving opportunities? | The lifecycle in §3 |

**N-10 is the sharpest.** The carrying-cost rate underpins most recurring saving figures in this taxonomy. If it is an assumption the team invents, then most of the North-Star number is `ASSUMED` — and that must be visible rather than buried. If finance owns a real rate, most of the number becomes `CALCULATED`. **This single input does more to determine the product's credibility than any feature in the build plan.**
