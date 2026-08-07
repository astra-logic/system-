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
| Confidence | Per a defined rule (`A-03`), never a judgement call |
| **One-time impact** | Working capital released, cash freed. Happens once. |
| **Recurring impact** | Annual cost reduction. Repeats yearly. |
| Potential Annual Saving | Derived — see the aggregation rules in §5 |
| Required action | The concrete next step |
| Owner | The person accountable |
| Status | Per the lifecycle in §3 |
| Outcome | What actually happened |

**The one-time / recurring split is the field that matters most, and the one most often collapsed.** Releasing €200,000 of working capital from excess stock is a one-time event. Reducing carrying cost by €18,000 per year is recurring. Presenting the first as an annual saving overstates the number by roughly an order of magnitude. They must be separate fields, separately aggregated, and separately displayed — never summed into one figure.

---

## 2a. Reconciliation with the Part 2.1 lock *(2026-08-07)*

Three concepts introduced while designing mechanism 01 are **general to the saving engine**, not specific to that mechanism, and govern this model:

**1. The three-state evidence ladder (D-019).** No universal minimum event count anywhere in the taxonomy. Every category holds these apart:

```
OPPORTUNITY DETECTED  →  ANNUALIZATION ELIGIBLE  →  VERIFIED REALIZATION
```

A single event may detect an opportunity while its annual saving remains `INSUFFICIENT_DATA`. This complements — does not replace — D-014 rule 11's 12-month preferred window: rule 11 sets the *time* bar, D-019 refuses to reduce *sufficiency* to a counted threshold.

**2. `COST / EXPOSURE / RISK` is a distinct class (D-021, D-025 `LOCKED`).** Money the factory is spending or exposed to, where causality and avoidability are not defensible enough to claim a saving.

```
Opportunity
├── SAVING_OPPORTUNITY          ← the only class the North Star aggregation may consume
└── COST / EXPOSURE / RISK      ← never aggregable, structurally
```

Not a status — a **class**. As a status it is one careless filter away from inflating the headline; as a class that is structurally impossible. **No transition, migration or aggregation path converts one into the other.** If an undefensible cost later becomes defensibly avoidable, a *new* `SAVING_OPPORTUNITY` is raised with its own evidence; the exposure record is not promoted.

This generalises what §4.9 already required for stockout risk, and it makes the product useful about money it cannot claim.

**3. Evidence-based, event-level counterfactual reasoning (D-017, elevated to a standing principle by D-027 `LOCKED`).** No category in this taxonomy may compute a saving by applying a percentage to a total.

> Never *"60% of this cost is avoidable."*
> Instead *"these specific events are attributable to this specific root cause, and this intervention would have prevented them under this stated counterfactual."*

Financial quantification requires, where applicable: **stated intervention · testable counterfactual · reliable incremental-cost inputs · appropriate FX normalisation · sufficient evidence.** Never manufacture precision from weak evidence. This governs every category below and every mechanism not yet designed.

**4. FX normalisation, and the F10 capture contract (D-024, D-028 `LOCKED`).** Every figure in §4 that compares across periods must be FX-normalised. Raw dimensions permitting later decomposition — original amount, currency, FX rate and rate date, quantity, unit basis, period — are **captured now** under **F10 — Financial Change Decomposition Capture Contract**, *as applicable to each event and never invented where absent*.

The universal decomposition **calculation** (`operational + price/rate + FX + volume/mix`) is **deferred** until a second mechanism validates the abstraction (`Q-08`). Capture is irreversible; computation is reversible. Where a decomposition cannot be performed reliably, the conclusion is marked rather than presented with false precision — it is never fabricated.

**Consistent capture across mechanisms is a precondition of §5's aggregation rules.** Inconsistent capture would reintroduce basis laundering: aggregating figures whose FX and price treatment differ produces a total that looks precise and is not.

**5. Deduplication is at the economic-mechanism level (D-020).** Not per transaction. Genuinely independent effects may both be quantified; attribution must be explainable.

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

### 4.1 Excess stock → working capital release
**Impact:** one-time (capital) + recurring (carrying cost avoided)
**Inputs:** on-hand, consumption rate, lead time, target coverage policy, unit cost
**Calculation:** `excess qty = on-hand − (target coverage × consumption rate)`; value at unit cost
**Refuses when:** consumption history below the `A-12` threshold · cost reference stale · item flagged seasonal without a seasonal profile

### 4.2 Slow-moving stock
**Impact:** recurring (carrying cost)
**Refuses when:** movement history shorter than the aging window

### 4.3 Dead / obsolete stock
**Impact:** recurring (carrying cost avoided) + space recovered
**⚠ Deliberate exclusion:** the *value of the stock itself is not a saving.* Writing off dead stock is loss recognition — money already spent. Counting it as saving would be one of the most misleading figures the system could produce. The saving is the avoided future carrying cost, nothing more.

### 4.4 Purchase price variance
**Impact:** recurring
**Inputs:** price history, alternative supplier prices, annual volume
**Calculation:** `(current price − best comparable price) × annual volume`
**Refuses when:** below `A-12` delivery sample · prices not genuinely comparable (differing MOQ, quality, terms, incoterms). **Comparability is the hard part, and a price difference that ignores it is not a saving.**

### 4.5 Order consolidation
**Impact:** recurring
**Calculation:** `(orders avoided × ordering cost) − additional carrying cost incurred`
**Refuses when:** ordering cost is unknown
**⚠** The carrying-cost offset is **mandatory**, not optional. Consolidating orders raises average stock. An un-netted figure is inflated by construction.

### 4.6 MOQ optimisation
**Impact:** one-time + recurring
**Calculation:** excess forced by MOQ, valued and carried
**Refuses when:** MOQ not recorded on the supplier's item terms

### 4.7 Reorder point / safety stock optimisation
**Impact:** one-time (capital) + recurring (carrying)
**Inputs:** consumption variability, lead-time variability, service-level target
**Refuses when:** lead-time sample below `A-12` · service-level target undefined (`P-06`)
**⚠** Reducing safety stock trades capital against stockout risk. **An opportunity that presents only the capital gain and hides the risk it creates is dishonest.** Both sides must be shown.

> **4.1 – 4.7 note (2026-08-07):** the calculations below predate the Part 2.1 lock. None may compute a saving by weighting a category. Each must be re-expressed as *intervention + testable counterfactual* before it is specified, per D-017. Recorded as `Q-07`.

### 4.8 Emergency purchasing / expedited freight premium
**Impact:** recurring
**Calculation:** `premium paid over standard price/freight`, summed and annualised
**Refuses when:** expedite flag or freight premium is not captured (`NEW-07`)
**✓ The most defensible category in the release** — it measures money actually spent, not money hypothetically saveable.
**→ Fully designed in `docs/domain/04-mechanism-01-expedite-premium.md` (Part 2.1).** That document supersedes this summary for this category.

### 4.9 Stockout avoidance
**Impact:** avoided cost
**Status in release 1: NOT QUANTIFIABLE.**
Costing a stockout requires production interruption cost — lost capacity, idle labour, late delivery. Production is out of scope (D-007). The system may **flag stockout risk**, which is operationally valuable, but it may not attach a currency figure to it. Attaching one would require inventing a production-impact model the system has no data for.

---

## 5. The aggregation problem *(the highest-risk part of this product)*

A single headline figure — *"Potential Annual Saving: €487,000"* — is the most seductive number this system can display, and the easiest to get catastrophically wrong. Four failure modes, each of which produces a number that is confidently, invisibly inflated:

**1. Double counting.** Reducing excess stock of Material A and optimising its reorder point both release capital from the same stock. Summed naively, the same euro is claimed twice. **Rule:** opportunities are deduplicated by subject before aggregation; overlaps are netted and the deduction is shown.

**2. One-time treated as annual.** A €200,000 working-capital release is not €200,000 per year. **Rule:** one-time and recurring impacts are aggregated separately and displayed separately. "Potential Annual Saving" contains recurring impact only. Capital release is reported as its own figure, labelled as one-time.

**3. Annualising from thin history.** Two months of consumption multiplied by six is not an annual figure — it is a guess wearing a precise number's clothing. **Rule:** annualisation requires a minimum history window (`NEW-08`); below it, the opportunity returns `INSUFFICIENT_DATA`.

**0. Exposure leaking into saving.** `COST / EXPOSURE / RISK` amounts (D-021) are not opportunities and must be structurally incapable of entering this aggregate — not merely filtered out by convention.

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
