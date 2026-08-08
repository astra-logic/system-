# 14 — Decision Closure & Build Readiness

> ## ⚠ ANALYSIS ONLY — NOTHING LOCKED, NOTHING REWRITTEN
> No locked decision modified. No factory fact, formula, threshold, rate or confidence value invented.
> **No code, no UI, no schemas.** **Date:** 2026-08-07
>
> **Label key:** `FACT` observed in project files · `ASSUMPTION` reasoning not yet confirmed · `DECISION` yours to make · `EVIDENCE GAP` unknowable without factory data · `OPEN QUESTION` unresolved · `FUTURE DOMAIN` deliberately deferred

---

# PHASE 1 — GOVERNANCE CLOSURE

## D-001 — Append-only movement ledger

### 1. What is currently proposed *(verbatim)*

> Stock truth is an immutable, double-entry ledger of movements. Balances are derived projections. Corrections are reversing entries, never edits.
> Buckets include real locations **and** virtual counterparties. No orphan movements — every movement cites a source document and reason code.

Minimum movement record: Movement ID · Item · Lot/serial · Quantity+UoM · From→To bucket · Effective date · Recorded date · Source document · Reason code · Actor · **Cost effect**.

### 2. Locked decisions that depend on it

| Decision | Dependency |
|---|---|
| **D-019** three-state ladder | Assesses evidence sufficiency **against ledger history** |
| **D-022** 12-month realization | Baseline and measurement both come from the ledger |
| **D-027** event-level counterfactual | The ledger **is** the event record |
| **D-011** opportunity lifecycle | Baselines captured at `APPROVED` from ledger state |
| **D-025** finding classes | `OBSERVED COST` is `ACTUAL` **because the ledger says so** |
| **D-028** F10 capture | Imposes dimensions **on movements** |
| Mechanism 01 | Consumption, receipts, stock position |
| Mechanism 02 | Receipt quantities; **not** PO/quotation records — see gap 2 |

### 3. Is it strong enough? — three gaps found

**⚠ GAP 1 — `FACT`. F2's minimum movement record does not satisfy F10's capture contract.**

F10 (D-028, locked) requires original amount · **currency** · **FX rate** · **rate date** · quantity · **unit basis** · UoM · period boundary. F2's record carries only *"Cost effect — value impact of this movement."*

The build plan's U-07 acceptance criteria already say *"Cost-bearing movements carry the F10 capture dimensions"* — **so the build plan knows, and the foundation spec does not.** Locking D-001 as written would lock a movement record that cannot satisfy a decision already locked above it.

**This must be resolved before D-001 is locked.** It is a one-line addition, not a redesign.

**⚠ GAP 2 — `FACT`. D-001 governs stock. Nothing governs documents.**

Mechanism 02 rests on PO lines, quotations, contracts and price changes — **none of which are stock movements**. D-012's U-12 requires *"post-send changes recorded as history, not mutations"*, but **no decision states that**. The immutability discipline that D-001 establishes for stock has an unstated twin for commercial documents.

`DECISION` — **a missing decision, not a flaw in D-001.** Options: extend D-001's scope, or a separate decision for document immutability. The second is cleaner — different objects, different lifecycle.

**⚠ GAP 3 — `ASSUMPTION`. Historical balance reconstruction is implied, not stated.**

4.7's backtest needs *"on-hand never fell below L over 12 months"* — a **balance curve**, not a current balance. Immutability plus double-entry make this derivable, and U-07's acceptance says balances equal the projection of full history. **But D-001 never names point-in-time reconstruction as a required capability.** A reader could implement a maintained current balance and satisfy the letter of D-001 while making 4.7 impossible.

### 4. Contradictions and dangerous assumptions

**No contradictions found.** `A-01` (sync vs async projection) remains open — **it does not block locking**, because *the ledger is truth* is separable from *how projections are maintained*.

### 5. Safe to lock?

> **Not as written. Yes after Gap 1 is closed.**

### 6. What decision is missing

1. **Add the F10 dimensions to F2's minimum movement record** — mandatory before locking.
2. **State point-in-time balance reconstruction as a required capability** — recommended; it is what 4.7 depends on.
3. **A separate decision on commercial-document immutability** — can follow, but must exist before Mechanism 02 is built.

---

## D-002 — Provenance envelope

### 1. What is currently proposed *(verbatim)*

> Every derived value carries `{value, unit, basis, as_of, inputs, assumptions, confidence, limitations}`. Basis degrades contagiously — anything computed from a forecast is at best a forecast, and an aggregate carries the **weakest** basis among its components. `INSUFFICIENT_DATA` is a designed state, not an error.
> **Amended:** eight basis values including `STALE_DATA`.

### 2. Locked decisions that depend on it

**D-025** (classes carry basis; `ACTUAL` vs `FORECAST` is the split) · **D-027** · **D-029** · **D-031** · **D-021** · **D-024** · **D-028** · **D-014 rule 15** · **D-019** · D-012.

**This is the most depended-upon proposal in the project.**

### 3. Is it strong enough? — three gaps, none fatal

**GAP 1 — `OPEN QUESTION`. Raw values.** D-002 says *"every **derived** value."* A PO price is raw. If raw values carry no basis field, an aggregate mixing raw and derived cannot compute a weakest basis. Either raw values carry `basis = ACTUAL`, or the contagion rule has a hole at its base. **Small, and needs one sentence.**

**GAP 2 — `OPEN QUESTION`. Two envelope fields have undefined semantics.** `confidence` is constrained by D-014 rule 15 but its formula is `A-03`, unresolved. `STALE_DATA`'s trigger threshold is `N-09`, unresolved. **The structure is lockable; two of its fields are not yet computable.** That is acceptable — a field can exist before its rule does — but it should be stated rather than discovered.

**GAP 3 — `FACT`, and worth stating explicitly. D-025 is stricter than D-002, and they could be misread as equivalent.**

- **D-002** says mixing `ACTUAL` and `FORECAST` **degrades** the aggregate to `FORECAST` — permitted, labelled.
- **D-025** (amended) says `ACTUAL` cost and `FORECAST` exposure are **never mixed** — forbidden.

They do not contradict; D-025 adds a prohibition where D-002 only degrades. **But an implementer reading D-002 alone would conclude mixing is fine if labelled.** The relationship should be named in one of them.

### 4. Contradictions and dangerous assumptions

**No contradictions.** One dangerous assumption: that a labelled number is a safe number. DP-15 disproved it — a carrying rate containing obsolescence is correctly labelled and still unusable, because D-031 forbids netting the risk inside it.

### 5. Safe to lock?

> **Yes — the structure. With Gap 1's one-sentence clarification, and Gaps 2–3 recorded as known.**

D-002 has survived six rounds of adversarial review unrevised and has correctly predicted or prevented several errors. **It is the strongest thing in the project.**

### 6. What decision is missing

Only Gap 1: do raw values carry `basis = ACTUAL`, or is the contagion rule scoped to derived values only?

---

# PHASE 2 — DECISION CLOSURE

## DP-10 … DP-15

| | Recommendation | Why | Evidence required | Decidable without factory data | Genuinely needs factory evidence | Changes a locked decision? | Downstream impact |
|---|---|---|---|---|---|---|---|
| **DP-10** | Four quantities separated: **position · one-time carrying · one-time financing · recurring (belongs to 4.7)**. Principal never in PAS, never called "release" | You cannot un-buy stock. For excess, outflow is **delayed, never avoided** | `F-22`, `F-08`, `F-39` | **The structure, the terminology, and the one-time/recurring rule** | Only the **values** | **No** — sharpens D-012 | Defines what 4.1 may ever claim. Gates the quantity mechanism |
| **DP-11** | Retire 4.2; keep detection signal + shelf-life exposure | Four attempts to find an independent intervention; three failed, the fourth is an exposure | `F-34` | **Entirely** | Only the shelf-life output | **No** | Removes a category. Eliminates a structural double-count |
| **DP-12** | Reclassify 4.9 as `EXPOSURE / RISK` | Forward-looking, no counterfactual, no valuation possible under D-007 | None | **Entirely** | None | **No** — fits D-025 as amended | Makes 4.9 the target of `DEEPENS` links |
| **DP-13** | **Prospective indication, retrospective realization** | Level C evidence is unreachable — production and demand suppression are unobservable | `F-01`, `F-35`, `F-36`, `F-27` | **The three-claim structure** | **`F-01` is gating** | **No** — uses D-019 and D-011 as-is | **Determines whether 4.7 can ever produce currency.** Currently: not prospectively |
| **DP-14** | Three factory-facing roles — finding · action · data — plus the adjudicator kept distinct | Tested against 4.1: three accountabilities do not collapse | `F-37` | **The structure** | Who fills them | **Yes — D-011 amendment** | Feeds `A-20`. Gives `EVIDENCE GAP` an owner |
| **DP-15** | Component-level; **excess ≠ dead**; disposal does not release capital | The marginal/average framing was wrong — the question is which components apply | `F-08`, `F-33`, `F-40` | **The component principle and the excess/dead distinction** | **`F-33` is gating** | **No** — sharpens D-023 | **May shrink 4.3 to near-zero.** Gates 4.1 and 4.3 |

**`FACT`: four of six are fully decidable now.** Only DP-13 and DP-15 have gating factory dependencies, and both are gated on facts already in the discovery pack.

## The four proposed amendments — necessary, or derivable?

### D-011 Owner split — **NECESSARY, and it is a field spec, not a new rule**

`DECISION` Nothing derives three accountabilities from one field. But this is an **amendment to an object definition**, not a new locked principle. Smallest form: replace `Owner` with `Finding Owner · Action Owner · Data Owner`, and note the adjudicator (DP-07) is a **reviewer, not an owner**.

### D-014 rule 10 "purpose" — **⚠ MAY BE DERIVABLE. Prefer the smaller change.**

`ASSUMPTION` D-002's envelope already carries **`limitations`** and **`assumptions`**. A rate's purpose — *"constructed for valuation, not for marginal decisions"* — **is a limitation.**

> If so, no new field is needed. What is needed is a **rule that rate imports must populate `limitations` meaningfully**, and that a blank `limitations` on an imported rate is itself an `EVIDENCE GAP`.

**This is a genuinely smaller change than adding a field to rule 10**, and per your rule 12 (*prefer the smallest defensible model*) it should be tested before the larger one is adopted. `DECISION` — which form?

### D-031 `MITIGATES` — **NECESSARY**

`FACT` `CREATES` and `DEEPENS` both mean *worsening*. Reduction is inexpressible with them. The failure is concrete: **Mechanism 01's reorder-point fix shows a cost and a quantified expedite reduction, while its stockout-risk reduction is invisible — so a correct action looks purely bad.**

Against your rule 7 (*no new decision unless it blocks correctness*): **misleading by omission that biases a decision toward rejecting a correct action is a correctness failure**, in the same class the asymmetric-valuation rule addresses.

### D-023 rate fitness — **NECESSARY, but it is the same concern as rule-10 purpose**

`FACT` **These two are one issue, not two.** Purpose is the *metadata*; fitness is the *rule that uses it*. They should be decided together.

Partially derivable: misapplying a rate arguably degrades basis to `ASSUMED` under D-002, which forces disclosure. **But disclosure is not enough** — DP-15's obsolescence case must **block**, because D-031 forbids netting a risk. So the **blocking behaviour is not derivable** and must be stated.

> **The four amendments reduce to three:** D-011 owner split · `MITIGATES` · rate purpose + fitness as one. And one of the three may shrink further if `limitations` can carry purpose.

---

# PHASE 3 — FACTORY DISCOVERY PACK

**Objective: discover the real factory's data structure. Not build a theoretical ERP.**

`FACT` — an important exclusion. **Some data does not exist yet because the application will create it.** Root-cause capture (D-018), override history going forward, escalation records going forward — **do not ask the factory for these.** Ask only whether they *could* be captured.

## A. MUST HAVE — before the quantity mechanism

| Field | Why it matters | Mechanism | Observable in a real factory? | Excel-importable? | Missing blocks currency, or reduces evidence? |
|---|---|---|---|---|---|
| **Is warehouse space constrained?** (`F-33`) | Decides whether the **space component of carrying cost exists at all** | 4.1, 4.3, DP-15 | **Yes — a manager knows this** | No — a question, not a file | **Blocks currency** for space-based claims |
| **Carrying-cost rate: components + what it was built for** (`F-08`) | Every recurring inventory figure | 4.1, 4.3, 4.6, 4.7 | Rate: likely. **Components and purpose: probably never asked** | Rate maybe | **Blocks currency** |
| **Freight cost separable per shipment → PO line** (`F-01`) | Gates M01 **and** 4.7's backtest | M01, 4.7 | Depends on invoice structure | Sometimes | **Blocks currency** for both |
| **Item master with UoM and base unit** | Nothing works without it | All | **Yes** | **Yes** | Blocks everything |
| **Stock movement / transaction history** | Ledger seed; consumption; balance curve | All | **Yes** | **Usually** | Blocks everything |
| **PO header + line history** (supplier, item, qty, price, currency, order date) | The spine of M01, M02, 4.1, 4.6 | All | **Yes** | **Usually** | Blocks currency |
| **Receipt records with dates and quantities** | Lead time = order → receipt | M01, 4.7 | **Yes** | Usually | **Blocks** 4.7 |
| **Lead time in master data** (`F-09`) | M01's most defensible slice | M01, 4.7 | Yes | Yes | Reduces evidence |
| **FX rate source and policy** (`F-07`) | Tier 1 — every cross-period comparison | All financial | Yes — finance | Partly | **Blocks currency** on comparisons |

**Nine fields. That is the minimum.**

## B. SHOULD HAVE

`F-12` quotations incl. declined · `F-13` contracts · `F-15` incoterms · `F-16` payment terms · `F-26` price-break structures · `F-28` volume rebates · `F-22` cost-of-funds rate · `F-31` ordering cost · `F-19` duty and clearing per line.

*These gate Mechanism 02 and parts of the quantity mechanism — but not the quantity mechanism's core.*

## C. NICE TO HAVE

`F-02` customs/demurrage · `F-27` substitutes · `F-34` shelf lives · `F-38` disposal cost and recovery · `F-40` inventory taxes · `F-23` LC/advance payment · `F-17` historical price lists.

## D. Collected later by the application

Root-cause classification (D-018) · expedite flags going forward · manual override history going forward · supplier escalation records · decision rationale · realization measurements · adjudication records.

> `FACT` **Nine of the forty items in the master list are genuinely gating. The rest can follow, and seven will be created by the product itself.**

---

# PHASE 4 — QUANTITY MECHANISM (workshop opening)

**Not assuming the old formulas. Not writing formulas.**

## 1. What economic intervention does each category actually represent?

| Category | Real intervention | Lever |
|---|---|---|
| **4.1** Excess | **Defer or reduce specific planned orders** | Order timing — *no policy change* |
| **4.7** Safety stock | **Change stock policy parameters** | Planning parameters |
| **4.6** MOQ | **Negotiate a lower minimum with a supplier** | **Supplier terms — a procurement act** |
| **4.3** Dead | **Dispose of specific lots** | Disposal |

## 2. Which are truly independent?

`FACT` **They are not four independent categories. They are three different levers and one non-lever.**

- **4.1 and 4.7 share a lever family** — both change how much stock is held through planning, one by timing and one by parameter.
- **4.6's lever is a supplier negotiation** — the same *act* as Mechanism 02, with an *inventory* benefit and a possible *price* cost.
- **4.3's lever is disposal** — neither planning nor procurement.

## 3. Which are duplicate signals?

4.2 (already recommended for retirement) is a detection signal for 4.1 and 4.3. **No duplication remains among 4.1 / 4.3 / 4.6 / 4.7** once DP-10's temporal split is applied — 4.1 is one-time correction, 4.7 is recurring prevention.

## 4. Which belong to the same mechanism?

`ASSUMPTION` — **the working hypothesis, to be tested, not assumed:**

| Grouping | Rationale |
|---|---|
| **Mechanism 03 — Inventory Level** = 4.1 + 4.7 | Same lever family, same evidence base (ledger history), same offsets (carrying cost, stockout exposure), same contradiction surface |
| **4.6 → composite with Mechanism 02** | The intervention is a supplier negotiation. Its price effect belongs to M02; its inventory effect to M03. **D-030 already says the two effects compose and must stay distinguishable** |
| **4.3 → separate candidate, may not survive materiality** | Different lever, different economics, and per DP-15 its benefit may be near zero |

## 5. Classifications

| | Class |
|---|---|
| 4.1 deferral benefit | `OPPORTUNITY` — one-time |
| 4.7 policy change | `OPPORTUNITY` — recurring |
| 4.6 forced excess | `OPPORTUNITY` — recurring, composite with M02 |
| 4.3 disposal | `OPPORTUNITY` — small, possibly immaterial |
| Stock above coverage policy | **Position, not a finding** — an operational fact |
| Stockout risk from any of the above | `EXPOSURE / RISK` — `DEEPENS` |
| Shelf-life risk (from 4.2) | `EXPOSURE / RISK` |
| Missing carrying components | `EVIDENCE GAP` |

## 6. What can be quantified defensibly — **the sobering answer**

| | Defensible today? |
|---|---|
| 4.1 deferral | **Timing value only** — needs `F-22`, and may be **negative** under EGP depreciation (`F-39`) |
| 4.7 | **Nothing prospectively** (DP-13). Retrospective only |
| 4.6 | Forced-excess **quantity** is countable; its **value** needs `F-08` |
| 4.3 | Carrying avoided — **possibly near zero** (DP-15); recovery and disposal need `F-38` |

> ⚠ `FACT` — **The quantity mechanism may produce almost no defensible currency in Release 1.** Its honest primary outputs would be **detection, evidence gaps, and exposure disclosure.**
>
> That is not a reason to abandon it. It **is** a reason not to build it before the discovery pack lands — because `F-08` and `F-33` decide whether it produces numbers or only findings.

## 7. What cannot be quantified without inventing assumptions

Stockout cost (D-007) · prospective safety-stock sufficiency (DP-13) · space cost without `F-33` · any carrying figure without `F-08` components · deferral value without `F-22` · partial mitigation severity.

## 8. Interaction with Mechanisms 01 and 02

| | |
|---|---|
| **M01** | ⚠ **Composes, does not simply contradict** — reorder point = lead-time demand + safety stock; M01 acts on the first, 4.7 on the second. D-029 still catches same-component opposition |
| **M02** | 4.6 is **composite with it**; 4.1 **contradicts** its price-break case (D-029) |
| **Both** | `F-01` gates M01 *and* 4.7. **One factory fact gates two mechanisms** |

## 9. How Orders & Supply Movement supplies evidence

Open and planned orders with ETAs (4.1's deferral counterfactual) · order date → receipt date (**4.7's lead-time input *is* the order journey**) · receipt quantities (all) · supplier terms including MOQ (4.6).

---

# PHASE 5 — ORDERS & SUPPLY MOVEMENT

**`ENABLER`. Not a saving mechanism. Not being turned into one.**

## Minimum domain responsibility

| Operational question | Class | Required by |
|---|---|---|
| What was ordered? | **A — Core** | All |
| From whom? | **A — Core** | All |
| For what item? | **A — Core** | All |
| How much? | **A — Core** | All |
| At what price (+ currency, FX rate, rate date)? | **A — Core** (F10) | M01, M02, 4.1, 4.6 |
| When was it ordered? | **A — Core** | M01, M02, 4.1, 4.7 |
| **Where is the supplier?** | **A — Core as a *lane identifier*** · **C — UI as coordinates** | M01's baseline is **per lane** |
| Where is the shipment now? | **B — Optional logistics** | M01, 4.9 |
| What transport mode? | **A — Core** | **M01 — the premium is a mode difference** |
| What port / customs milestone? | **B — Optional logistics** | M01 (demurrage), 4.9 |
| Expected arrival? | **A — Core** | M01, 4.1, 4.7, 4.9 |
| Current ETA? | **B — Optional**, basis `FORECAST` | 4.1, 4.9 |
| What actually arrived? | **A — Core** | All |
| What was delayed? | **A — Core** (promised vs actual) | M01, 4.7 |
| **Why** was it delayed? | **A — Core** — D-018 capture | M01 |
| What costs were incurred? | **A — Core** — freight, duty, demurrage, separable | M01, M02 |
| What evidence supports each event? | **A — Core** — D-002 provenance | All |

## The line that keeps the map honest

`FACT` **Supplier location is domain data as a *lane*, and UI data as *coordinates*.** M01's freight baseline is per-lane, so origin→destination is genuinely required. A map is a *rendering* of that, and requires nothing the domain does not already hold.

> **The map does not justify a logistics domain.** It justifies rendering data the saving engine already needs. **Product requirement preserved: supplier location · shipment movement · ETA · milestones · order status · delivery visibility.** None of it becomes a mechanism.

`FUTURE DOMAIN` — carrier integration, real-time tracking, route optimisation.

---

# PHASE 6 — BUILD READINESS BOARD

| Item | Status | Blocking condition |
|---|---|---|
| **FOUNDATION** | | |
| D-001 ledger | **NEEDS DECISION** | Close Gap 1 (F10 dimensions in the movement record), then lock |
| D-002 provenance | **NEEDS DECISION** | One clarification (raw values), then lock |
| Document immutability | **NEEDS DECISION** | Missing decision — required before M02 is built |
| **DOMAIN DECISIONS** | | |
| DP-10, DP-11, DP-12, DP-14 | **NEEDS DECISION** | Fully decidable now |
| DP-13 | **NEEDS DECISION + FACTORY DATA** | Structure decidable; `F-01` gates the outcome |
| DP-15 | **NEEDS DECISION + FACTORY DATA** | Principle decidable; `F-33`, `F-08` gate the outcome |
| D-011 owner split · `MITIGATES` · rate purpose+fitness | **NEEDS DECISION** | Three amendments, not four |
| **MECHANISMS** | | |
| Mechanism 01 | **BLOCKED** | `F-01`, `F-09` |
| Mechanism 02 | **BLOCKED** | `F-12`, `F-13` |
| Mechanism 03 (quantity) | **FUTURE** | Phases 1–3 first; `F-08`, `F-33` |
| **ENABLERS** | | |
| Orders & Supply Movement | **NEEDS DECISION** | Class A/B/C split above needs approval; then it is designable |
| Evidence capture (D-018) | **READY** | Design locked; build after foundations |
| Data import | **NEEDS FACTORY DATA** | Shape unknown until discovery |
| **ARCHITECTURE** | | |
| Stack (`A-19`) | **NEEDS DECISION** | No factory data required |
| Projection strategy (`A-01`) | **NEEDS DECISION** | No factory data required |
| Auditability | **READY** | D-001 + D-002 deliver it once locked |
| Provenance | **READY** | D-002, pending its clarification |

## The shortest path to *"the domain model is locked and safe to build"*

```
STEP 1  Close D-001 Gap 1 and D-002 Gap 1. Lock both.          ← no factory data
        Unlocks: legitimacy for the 19 decisions above them

STEP 2  Decide DP-10, DP-11, DP-12, DP-14 + the three          ← no factory data
        amendments. Structures only.
        Unlocks: the quantity mechanism's design constraints

STEP 3  Decide stack (A-19) and projection strategy (A-01).    ← no factory data
        Unlocks: U-01, U-01b, U-07 — the first build units

STEP 4  Run the nine-field discovery pack (Phase 3A).          ← FACTORY
        Unlocks: whether M01, M02 and M03 produce currency
                 or findings. Resolves DP-13 and DP-15 outcomes

STEP 5  Add the missing document-immutability decision.        ← no factory data
        Unlocks: Mechanism 02's build path

STEP 6  Design Mechanism 03 against real data.                 ← needs Step 4
        Unlocks: Q-07 closes completely
```

> **Steps 1, 2, 3 and 5 need no factory data at all — they are yours alone, and they are the majority of what stands between today and a lockable domain model.**
>
> **Step 4 is the only external dependency, and it is nine questions.**

## The ultimate test

> *Can this system eventually produce a defensible, auditable, factory-usable Potential Annual Saving number without manufacturing certainty?*

**`FACT` — Yes, conditionally, and the condition is narrower than it looks.**

The discipline is in place: no invented constants, event-level counterfactuals, structurally separated finding classes, a headline that declares its weakest basis, and realization measured rather than asserted. Two mechanisms are designed to that standard.

**What is not yet proven is whether the factory's data can feed it.** That is `F-01`, `F-12`, `F-13`, `F-08`, `F-33` — five facts.

`ASSUMPTION` — **the most likely outcome, stated honestly:** the first release produces a **small, defensible number** from expedite premium and contract-not-applied price cases, alongside a **larger set of evidence gaps and exposures**. That is a slower and less impressive start than a dashboard full of confident figures — and it is the only version that survives a finance manager reading it.

---

**Nothing locked. Nothing rewritten. Awaiting your decisions.**
