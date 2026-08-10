# The Interface Contract

**Date:** 2026-08-10 · **Status:** `LOCKED` · **Governs:** every screen built from here onward
**Preceded by:** `21-BLOCK8-…`, `22-BLOCK8-DOMAIN-CONTRACT.md` (feasibility), Block 10 audit
**Nature:** this document constrains the interface. It changes no domain decision and no calculation.

> **COMPLEXITY BELONGS IN THE ENGINE. CLARITY BELONGS IN THE INTERFACE.**
>
> The goal is not a beautiful system. It is an **obvious** one. A manager should finish
> every screen thinking *"I know what is happening, I know what matters, I know what to do,
> and I understand why"* — without ever learning how the engine works.

---

## 1. Executive summary

### 1.1 What Block 11 re-verified

Every Block 10 finding was re-checked against the running application at commit `af599d3`. **The working tree is clean and nothing has changed.** All findings stand:

| Verified | Result |
|---|---|
| Routes | **8 page files, 7 routes.** Analytics, Profile, Settings **do not exist** |
| Vocabulary leaks | **29**, across six of seven pages. `/produce` = **0** |
| Loading / error / not-found files | **0** |
| Client components (search, filter, sort) | **0** |
| Layout media queries in the whole product | **1** |
| Charts of any kind | **0** |

### 1.2 One finding sharper than Block 10 recorded

Block 10 reported *"two pages render 21-decimal currency."* The real defect is more specific and more useful:

```
lib/core/decimal.ts   formatMoney() and formatQty() EXIST and round correctly.

/produce              uses formatQty            ✅ correct
/                     uses .toFixed(2) inline   ⚠ bypasses the helper
/opportunities        renders the raw JSONB     🔴 no formatting at all
/opportunities/[id]   renders the raw JSONB     🔴 no formatting at all
```

**Three different money-rendering paths exist in one product, and the correct one is used on one page.** The problem is not a missing helper — it is that **no formatting boundary is enforced**. §20 is written to close exactly that.

### 1.3 The diagnosis this contract answers

The engine is finished and correct. The interface was written *by the system, about itself*. Six of seven screens state facts rather than consequences, and the one screen that does not is the one built to a written contract with a tested vocabulary rule.

**That is the entire thesis of this document: the method already worked once. This contract generalises it.**

---

## 2. Product interface law

Ten laws. Each is derived from a specific failure found in the running product, and each carries a **test that can fail a review**. A law without a test is decoration.

---

### LAW 1 — The answer comes before the explanation

**Rule.** The first thing on any screen, and the first thing in any card, is the conclusion — not the method, not the inputs, not the caveats.

**Why.** The dashboard currently opens with a figure, then three paragraphs of methodology, then counters. A manager arriving at 7am needs to know what is on fire. Provenance is the *reason the number can be trusted*, not the reason they came.

**Violation looks like.** Any screen whose first paragraph explains how something was computed. Any card whose top line is a label rather than a state.

**Test.** Read the first sentence aloud. If it is not something a manager could act on or conclude, the law is broken.

---

### LAW 2 — No internal vocabulary reaches a user-facing string

**Rule.** Decision IDs, factory-question refs, mechanism enums, lifecycle enums, basis values, and table or column names never appear in the primary or secondary interface.

**Why.** `(D-044)` on the home screen tells the user the system has a private world they are not part of. It is the single loudest ERP signal in the product.

**Violation looks like.** `basis USER_DEFINED` · `M01_EXPEDITE_PREMIUM_LEADTIME` · `F-09` · `ANNUALIZATION ELIGIBLE` · `evidence partition`.

**Test.** The Block 9 vocabulary guard runs against **every rendered page**, not one. It already exists (`lib/feasibility/language.ts`) and already passes on `/produce`. Today it would report **29 violations**.

---

### LAW 3 — Unknown never looks like No

**Rule.** ⚪ *can't say* is visually and verbally distinct from 🔴 *no*, on every surface, always. ⚪ is **neutral**, never red, never alarming.

**Why.** A manager who sees red goes and buys material. If the truth was *"we don't have your recipe"*, they just spent money for nothing. **"No" and "I don't know" are different instructions to a human being.** Collapsing them is the specific lie traditional ERP tells.

**Violation looks like.** Rendering a missing value as zero. Styling an unknown state with the error colour. A dash where a sentence should say why.

**Test.** Every unknown state renders a **reason**, not a placeholder. Grep for `—` and `0` used where the value is absent rather than genuinely zero.

---

### LAW 4 — Risk appears on the row it belongs to

**Rule.** If the system knows something is late, held, short, or at risk, that fact appears **on the object it concerns** — not in a separate table, not on another page.

**Why.** PO-1008 is held in customs, past its promised date, with a once-revised ETA. Its flags column reads `SEA`. The user must join three tables by eye to find the most urgent fact in the corpus.

**Violation looks like.** Any risk the user must assemble from two or more places.

**Test.** For each risk the engine can compute, ask: *can the user see it without scrolling to another table or navigating?* If not, the law is broken.

---

### LAW 5 — Lists are ordered by what needs attention

**Rule.** Default sort is urgency. Alphabetical and chronological are *filters the user chooses*, never the default.

**Why.** Inventory sorts by item code; Orders sorts by date. Both bury the thing that matters. A manager who must re-sort the list to find the problem will rebuild the list in Excel.

**Violation looks like.** A default sort that is a property of the record rather than a property of its urgency.

**Test.** The first row of any list is the one a manager should look at first. If the first row is `CP-001` because C comes early in the alphabet, the law is broken.

---

### LAW 6 — Every recommendation states its consequence

**Rule.** An action is incomplete until the interface says what happens if it is not taken.

**Why.** The product currently answers *what* and *why* well, and never answers *so what*. Without a consequence a manager cannot triage a list of five actions.

**Violation looks like.** *"Order 4,500 kg of RM-001."* — true, actionable, and gives no basis for choosing it over the other four things on the screen.

**Test.** Every action carries a consequence clause, or an explicit statement that the consequence is not known. **Neither may be invented** (§18).

---

### LAW 7 — Detail is one interaction away and zero interactions in the way

**Rule.** A correct decision is reachable without opening anything. Full evidence is reachable in exactly one interaction.

**Why.** This is the load-bearing compromise. The engine's rigour must remain reachable — it is the competitive advantage — without it standing between the user and the answer.

**Violation looks like.** Evidence gates, provenance and raw identifiers printed inline above a recommendation. Equally: burying the *reason* so deep the recommendation looks arbitrary.

**Test.** Cover everything below the first card. Can a manager still act correctly? Then open one disclosure. Can an auditor still verify? Both must be yes.

---

### LAW 8 — The system never shows a blank screen or an unstyled error

**Rule.** Every route has a loading state and an error boundary. Every error says what happened and what to do next.

**Why.** Zero exist. Every page is a server component doing real database work; a slow query renders **white**. The product's whole thesis is that it says what it does not know — an unhandled crash is the loudest possible violation of that promise.

**Violation looks like.** A blank page. A Next.js stack trace. A spinner with no context.

**Test.** `loading.tsx` and `error.tsx` exist for every route. Kill the database and load each page: every one must degrade into a sentence.

---

### LAW 9 — Numbers are rounded at a single enforced boundary

**Rule.** No value reaches the interface except through the shared formatter. Precision is a property of the unit, not of the storage.

**Why.** `1383868.667808219178082191781 EGP` signals a machine that does not know what matters. It undermines exactly the credibility the figure was engineered to earn — and the formatter to prevent it **already exists and is bypassed on three of four surfaces**.

**Violation looks like.** `.toFixed()` in a component. A JSONB value interpolated straight into JSX.

**Test.** Grep the `app/` tree: **no arithmetic, no `.toFixed`, no raw envelope `.value` in any component.** Formatting happens in one module.

---

### LAW 10 — A counter must earn its place; zero is not a metric

**Rule.** A card that will read zero for months is removed, not displayed. Statistics about the database are never shown to a manager.

**Why.** *"Contradictions 0"* is meaningless to a factory manager and will be zero until a second mechanism exists. *"Items · movements 8 · 50"* is a database statistic wearing a KPI's clothes. Five counters is how a KPI wall begins.

**Violation looks like.** Any card whose value does not change what the user does today.

**Test.** For each counter ask: *if this number doubled, would the user do anything differently?* If no, delete it.

---

## 3. Global interface principles

Three principles that are not testable as laws but govern how the laws are applied.

**Speak as a competent operations advisor, not as a database.** The system has read everything and understood it. It should sound like a colleague who has already done the work — *"you're 4,500 kg short of resin, and the order that would cover it is stuck in customs"* — not like a query result.

**Simple language is not less information.** It is a simple primary statement with the precise one available on demand. Never simplify away meaning; move it down a layer.

**When clarity and accuracy conflict, accuracy wins and the interface finds another way to be clear.** Every request to "just show a number" is a request to break this. A rounded, smoothed or defaulted figure that reads better and means less is a defect.

---

## 4. The four-layer model

The model is already proven on `/produce`. This section makes it global.

```
LAYER 1 — ANSWER          What is the situation?
                          One state, one sentence.
                          NO numbers, NO item codes, NO dates, NO sources.

LAYER 2 — ACTION + REASON What should I do, and why?
                          One line per subject. Quantities and deadlines allowed.
                          Plus any warning that would CHANGE what the user does.

LAYER 3 — EVIDENCE        What is this built on?
                          Stock, incoming, lead times, deliveries, consumption,
                          suppliers, dates. Always visible, never leading.

LAYER 4 — TECHNICAL       How exactly was this derived?
                          Behind a deliberate disclosure. Never required.
                          Basis, provenance, gates, identifiers, raw records.
```

### 4.1 The binding rules

1. **Layer 1 is reachable in under five seconds and requires no domain knowledge.**
2. **A correct decision is reachable at Layer 2.** If a user must open Layer 3 to decide, the screen has failed.
3. **Layer 4 is never required, never automatic, and never partially inlined.** It is one interaction, or it is not there.
4. **The user is never forced through a lower layer to reach a higher one.**

### 4.2 The placement rule — the one that settles arguments

> **If a fact would change what the user does, it belongs at Layer 2.
> If it would only change how much they trust the answer, it belongs at Layer 3.
> If it would only let them audit the answer, it belongs at Layer 4.**

Worked examples, from the real product:

| Fact | Layer | Why |
|---|---|---|
| 🟡 At risk | 1 | It is the answer |
| "Order 4,500 kg by Tue 18 Aug" | 2 | It is the action |
| "The last 4 deliveries took longer than the 30 days on file" | **2** | It changes whether they trust that date — and therefore what they do |
| "There is an open saving opportunity on this material" | **2** | They must not order more without knowing |
| "This uses a DEMO recipe" | **2** | It changes whether they act at all |
| "You have 3,200 kg and 4,000 kg is on the way" | 3 | Supporting evidence |
| "Dates are in calendar days; your calendar is not configured" | 3 | A limitation, not a decision change |
| `basis USER_DEFINED`, gates, provenance | 4 | Audit material |

### 4.3 Layer 1 vocabulary is closed

Layer 1 may use exactly four state words, and the marks that carry them:

```
🟢  Yes / Healthy / On track
🟡  At risk
🔴  No / Critical
⚪  Can't say
```

Every area maps its own situation onto these four. **No area invents a fifth state.** This is what makes the product feel like one system rather than seven modules.

---

## 5. Language contract

### 5.1 Style

Short sentences. Second person — *"you're short"*, not *"a shortfall exists"*. Active voice. Name things by what the user recognises. State the consequence, not the classification. **The factory's own words** where they are known (`F-48` will confirm whether a recipe is called a recipe, a formula, or a batch card).

### 5.2 Placement of every disputed term

The prompt asks where each belongs, not whether to ban it. Nothing here is banned outright — everything is placed.

| Term | Primary (L1–2) | Evidence (L3) | Audit (L4) | Say instead, in primary |
|---|---|---|---|---|
| Finding | 🔴 | 🔴 | ✅ | **Saving** or **Issue** |
| Opportunity | 🔴 | ⚠ as a heading | ✅ | **Saving** |
| Mechanism | 🔴 | 🔴 | ✅ | *(name the cause: "rush shipping")* |
| `D-044`, `D-012` | 🔴 | 🔴 | ✅ | *(never shown; register only)* |
| `F-09`, `N-09` | 🔴 | 🔴 | ✅ | **What is missing**, named plainly |
| `USER_DEFINED` | 🔴 | ⚠ | ✅ | **Based on figures you entered** |
| `ACTUAL` | 🔴 | ✅ | ✅ | **Measured** |
| `CALCULATED` | 🔴 | ✅ | ✅ | **Worked out from your records** |
| `FORECAST` | 🔴 | ✅ | ✅ | **Estimate, not confirmed** |
| PAS / Potential Annual Saving | 🔴 | ✅ | ✅ | **Money you could save each year** |
| EOQ | 🔴 | 🔴 | ✅ | *(never surfaces; D-040 forbids the number)* |
| Projected available | 🔴 | ✅ | ✅ | **What you'll have by then** |
| Provenance | 🔴 | 🔴 | ✅ | **Where this comes from** |
| Adjudicator | 🔴 | ⚠ role label | ✅ | **Approver** |
| Exposure | 🔴 | ✅ | ✅ | **Risk we can't put a number on** |
| Basis | 🔴 | ⚠ as a phrase | ✅ | **How solid is this** |
| Contradiction | 🔴 | ✅ | ✅ | **These two suggestions conflict** |
| Evidence gap | 🔴 | ✅ | ✅ | **Missing information that's costing you** |
| Ladder | 🔴 | 🔴 | ✅ | **How solid is this** |
| Reserved | ⚠ only when non-zero | ✅ | ✅ | **Set aside** |
| Quality hold | ✅ | ✅ | ✅ | **Waiting on inspection** |
| Lead time | ✅ | ✅ | ✅ | **Usual delivery time** |
| In flight | 🔴 | ✅ | ✅ | **Not arrived yet** |
| Catch-weight | ⚠ | ✅ | ✅ | **Sold by the bag, weighed on arrival** |

**✅ allowed · ⚠ allowed with care · 🔴 never**

### 5.3 The permitted exception

> **"We don't have enough information to answer this."**

This is not terminology leaking. It is the most trust-building sentence the product can say, and the one no competitor will say. **It stays exactly as written.**

### 5.4 Two sentences to keep verbatim

Both already exist and both are the product's sharpest differentiators:

```
"We don't have the recipe for this product yet."
"The last 4 deliveries of RM-001 took longer than the 30 days on file (31–38 days)."
```

---

## 6. User-question architecture

### 6.1 Primary navigation — five items, each a question

```
Today        What needs my attention?
Stock        What do I have, and what should I worry about?
Incoming     What's coming, what's late, what needs chasing?
Make         Can I produce what I need?
Money        Where are we losing it, and where can we save?
```

**Rationale for each decision.**

- **Five, not seven.** A manager should name every item's purpose without training. Against the current seven, most people could name two.
- **"Stock" not "Inventory."** Shorter, and it is what people say.
- **"Incoming" not "Orders & supply."** The question is about arrival, not about documents. Order *history* lives inside it, not as a peer.
- **"Make" not "Production."** The current label *"Can I produce it?"* is the best in the product but too long for a nav item; the page keeps that as its title.
- **"Money" not "Analytics" or "Opportunities."** *Opportunity* is an internal finding class exposed as a menu label. *Analytics* promises charts. **Money** promises what the user wants.

### 6.2 Secondary — behind an account menu

**Settings · Profile · Import · Data health.**

⚠ **Import and Data health leave primary navigation.** They are set-up and diagnostic tools used weekly at most, and today they occupy positions three and four — ahead of everything used daily.

### 6.3 The naming law

> **A primary navigation item is a question the user asks, never a noun the system contains.**
> If an item can be renamed to a database table, it is wrong.

---

## 7. Decision-first experience

### 7.1 The universal pattern

Every operational problem, anywhere in the product, is presented in this shape:

```
WHAT          The situation, in the user's terms.
HOW IMPORTANT One of the four states. Never a score, never a percentage.
WHAT TO DO    A specific action, or an honest statement that none is known.
WHY           The cause, in one sentence.
IF I DON'T    The consequence — or an explicit statement that it is unknown.
```

### 7.2 The worked example this contract is calibrated against

The single sharpest failure in the audit, rendered as this contract requires:

```
🔴  Curing agent may stop production

    Chase PO-1008 with Adriatic Polymers.

    Why       5,000 kg has been held at Alexandria customs since 28 December.
              The carrier has already moved the arrival date once.

    If you    You have 27,000 kg on hand — about 6 weeks' cover. If this order
    don't     slips another three weeks you will run out before it lands.
```

**Every fact in that block already exists in the database today.** It is spread across three tables on one page, and the user performs the join. This contract exists to make that arrangement a defect rather than a style.

### 7.3 The binding rule

> **The user must never open a second page to understand one problem.**
> If a problem's *what*, *why* and *consequence* live in different places, the interface has failed regardless of how correct each place is.

---

## 8. Dashboard contract

### 8.1 What the dashboard is

**A decision centre.** It answers exactly one question: *what needs my attention right now?*

### 8.2 What it must communicate

| Priority | Content |
|---|---|
| **1** | What is at risk this week, as sentences, in the §7.1 shape |
| **2** | The top actions — **at most three**, each with subject, action and consequence |
| **3** | The money: one credible figure, with its range one interaction away |
| **4** | A single honest line about data quality, only when it is blocking something |

### 8.3 Maximum three primary decisions above the fold

**The number is derived, not chosen.** Three is the count of distinct questions a manager arrives with (§7 of the Block 10 audit): *will anything stop production · what must I order · where am I losing money*. A fourth card competes with the three that matter, and there is no fourth question. **When more than three things need attention, the dashboard shows the three most urgent and a count of the rest** — never a longer list.

### 8.4 Above the fold

State of the factory · the top actions · the saving figure as one number.

### 8.5 Below the fold

The remaining attention items · data-quality detail · links into the five areas.

### 8.6 Never on the dashboard

Methodology paragraphs · decision or factory-question IDs · basis labels · counters that read zero · database statistics (item counts, movement counts) · charts · a navigation grid disguised as cards · anything that does not change what the user does today.

### 8.7 How the saving figure is presented

> **One number, credible, with the range one interaction away.**

⚠ The current headline reads `0.00 – 1383868.67 EGP`. The lower bound is a rigorous statement about evidence class — and to a manager *"0.00 – 1.38M"* reads as **"we found nothing, maybe."** It is the most damaging first impression in the product.

**The rule:** lead with the figure the system can defend, describe the rest in words, and keep the partition intact underneath.

```
Money you could save each year          about 1.38M EGP
                                        1 saving found. See what it rests on →
```

The evidence partition (D-044) is **not weakened** — it is moved to Layer 3, where it is stated as: *"We can prove none of this yet — it rests on figures you entered rather than measured. Here's what would make it provable."* **The rigour survives; the leading impression changes.**

### 8.8 When nothing is urgent

The dashboard says so plainly and states what it checked. **It does not manufacture content.**

```
🟢  Nothing needs your attention today.

    Checked: 8 materials, 3 incoming orders, 2 products.
    Last data update: this morning.
```

An empty dashboard that says *"I looked, here is what I looked at"* builds more trust than one that fills the space.

---

## 9. Inventory contract

### 9.1 The question

*What do I have, and what should I worry about?*

Today the page answers only the first half. It is an excellent, disciplined quantity ledger and it is **silent on risk**.

### 9.2 Primary view — one line per material, ordered by urgency

Each line must communicate, without interaction:

| Element | Note |
|---|---|
| **State** | One of the four. Derived from cover, not from a threshold we invented |
| **What it is** | Name first, code second |
| **How much you have** | One number, one unit |
| **How long that lasts** | ⚠ Only where consumption history exists. Otherwise **stated as unknown** |
| **What's already coming** | Quantity and arrival — the answer to "have I already dealt with this?" |
| **What to do** | Only where an action is genuinely known |

### 9.3 The state definitions — derived, never invented

⚠ **This is the hardest rule in this section and it must not be softened.**

`A-18` — the thresholds defining low, excess, and dead stock — is **an open factory policy the system may not choose** (D-035, D-053). There is no minimum-stock field in the schema, and `N-11` states that a service level is *"a policy the factory states, never a parameter we fit."*

**Therefore inventory states are derived from observation only:**

```
🔴 Critical   A stated requirement cannot be met from stock and incoming supply.
              Comes from a real feasibility question, never from a guessed level.

🟡 At risk    Cover is shorter than the usual delivery time for this material.
              Both numbers are observed. No threshold is invented.

🟢 Healthy    Neither of the above.

⚪ Can't say  No consumption history, or no delivery time on record.
              STATED, never rendered as healthy.
```

**Excess is not a state until `A-18` is answered.** Where stock is unusually high the interface may state the observation — *"27,000 kg, about 6 weeks' cover"* — and must not label it excess. **Stating a fact is permitted; classifying against an unowned threshold is not.**

### 9.4 Item detail

Movement history · lot and serial detail where tracked · unit conversions · quality-hold breakdown · the full supply picture · saving opportunities on this material.

### 9.5 Advanced

Ledger reconstruction · basis and provenance · natural keys and source documents · catch-weight nominal/actual reconciliation.

### 9.6 The `Reserved` column

⚠ Currently eight rows read `0.000` with the note *"no source of commitment."* The reasoning is correct — D-050 requires the vocabulary stay complete. **But eight identical zeros with an internal explanation teaches users to stop reading the table.**

> **Rule: a column that is structurally constant is a footnote, not a column.** State it once beneath the table. It returns as a column the day a commitment source exists.

---

## 10. Orders contract

### 10.1 The question

*What's coming, what's late, and what needs chasing?*

### 10.2 The mandatory connection

> **ORDER → RISK → REASON → ACTION must appear together, on the order.**

This is Law 4 applied to supply, and it is the audit's sharpest failure. The four parts:

| Part | Source | Example |
|---|---|---|
| **Order** | The PO | PO-1008, 5,000 kg curing agent, Adriatic Polymers |
| **Risk** | Computed | Late — promised 25 Dec, not arrived |
| **Reason** | Milestones + ETA | Held at Alexandria customs since 28 Dec; arrival already revised once |
| **Action** | Derived | Chase the supplier · or: nothing to do, it is moving |

**None of this is new capability.** All four exist in the database today, on three separate tables.

### 10.3 Structure

**Open orders and order history are separated.** Today three open orders are mixed into eight completed ones and sorted by date. *"What's coming"* is the page's entire job, and 73% of its rows are archive.

Open orders sort by **risk, then by arrival date**. History is a secondary view, sorted by date, and exists for the question *"how does this supplier actually behave?"*

### 10.4 Risk states

```
🔴 Late        Past its expected arrival and not received.
🟡 At risk     Held, revised, or arriving after a stated need.
🟢 On track    Expected, not yet due.
⚪ Unknown     No expected date recorded. STATED, never shown as on track.
```

### 10.5 What must be stated, not implied

- **`SENT` is not supplier-confirmed.** The schema has no acknowledgement state (`F-51`). Where this matters — and it always matters for a 🟡 — the interface says *"we've sent this order; we don't record whether the supplier confirmed it."*
- **A promised date and a carrier ETA that disagree are both shown.** Neither overrides (D-056).
- **An expedited order carries its cost.** Five orders are flagged `expedited AIR` — the exact events worth 1.38M EGP a year. Today the flag and the saving live on different pages. **The two halves of the product's best story must be connected.**

---

## 11. Production contract

`/produce` is the reference implementation. **It passes this contract today.** This section records what it establishes, so other areas inherit it rather than reinventing it.

### 11.1 The interaction

```
Choose product → How many? → When (optional) → Check
```

Three fields. No configuration, no run, no planning horizon. **Adding a fourth field requires a decision, not a design.**

### 11.2 The four states, and what each rests on

Already locked by D-057 and unchanged here. The interface obligations:

- **🟢 is not manufactured.** Where a material is consumed regularly, the answer is 🟡 with the reason stated — the cap that keeps the exclusion from running optimistic (D-041).
- **⚪ names the missing thing**, in the factory's language: *"FG-100 is made in-house, so we can't see what it needs yet."*
- **Rejected input is not ⚪.** ⚪ means *we* lack information; a malformed request means the question was not asked. They render differently.

### 11.3 Gap versus shortfall — the distinction most systems collapse

```
GAP        what is NOT on the shelf right now      → "what's missing"
SHORTFALL  what must be ORDERED after supply       → "what to do"
```

At 🟡 the gap is positive and the shortfall is zero: **material is missing and an order already covers it.** Showing zero there would be true and useless. The interface shows *"305 kg short — already on order, make sure it arrives."*

**Every area that nets a requirement against supply inherits this distinction.**

### 11.4 Dates

- A deadline is **never invented**. With no need-by date the answer states the earliest defensible arrival instead.
- With no lead time on record, **no date is produced** and the answer says why.
- Where ordering today still arrives late, that is a **first-class answer**, not an edge case.
- The calendar convention is **stated** while the factory calendar is unconfigured (`F-50`).

### 11.5 Demo data

Marked at Layer 2 — the layer the user reads to act — **once per answer, never once per material.**

### 11.6 What is still missing, and belongs to the UI phase

The answer stops one step short of useful: there is no path from *"order 4,500 kg"* to a draft order, and no way to save or share an answer. **§16 governs how that path must behave when built.**

---

## 12. Analytics contract

### 12.1 The finding

**There is no Analytics area.** No route, no chart, no charting code. Against the seven questions analytics must answer, the product answers **one and a half** — and, unusually, **the hard half is already built.** Most products can draw charts and cannot defend a number. This one can defend every number and cannot yet present one.

### 12.2 Questions before visualisations

**No chart may be designed until the question it answers is written down.** Ranked by value:

| # | Question | Status | Note |
|---|---|---|---|
| 1 | Where can we save? | ✅ Built | The engine's strength. Needs presentation, not capability |
| 2 | What is costing us? | ⚠ Partial | One finding on one material |
| 3 | What needs action? | 🔴 | Findings carry a lifecycle but there is no queue or owner view |
| 4 | How much is at stake, and how solid is it? | ✅ Built | Rigorously — in language nobody outside the team can read |
| 5 | What changed, and why? | 🔴 | No period comparison exists anywhere |
| 6 | Are our recommendations any good? | 🔴 | The realised-vs-identified ratio exists and is never surfaced usefully |

### 12.3 The presentation law

> **Never make the user interpret a chart when the system can state the conclusion.**

A chart is justified only when the **shape** carries information the sentence cannot — a trend, a distribution, a comparison across many items. A chart that could be replaced by one sentence **must be** replaced by that sentence.

### 12.4 Proven versus estimated

D-044's partition is the honest core and must survive translation:

```
What we can prove       claims resting on measured records
What we estimate        claims resting on figures you entered
What we can't count     named, with what would make them countable
```

Three plain headings. **No basis vocabulary, no probability, no confidence score** (D-045).

---

## 13. Profile contract

### 13.1 The question

*Who am I, and what am I allowed to do?*

### 13.2 Contents

Who you are · your role, in plain words · what that lets you do and what it does not · your recent activity — including **the feasibility questions you asked** (the audit trail exists and has no surface).

### 13.3 Constraint

⚠ **Authentication does not exist.** `A-19`/`A-20` are open and D-051's five roles are an MVP subset. Profile is **blocked until authentication exists** and must not be faked with a hardcoded user.

### 13.4 One rule

Roles are described by **what they let you do**, never by their enum name. `ADJUDICATOR` is *"can approve savings."*

---

## 14. Settings contract

### 14.1 What Settings is — and it is not configuration

> **Settings is where the factory states the values the system refuses to invent.**
> **It is a trust surface, not a preferences page.**

This follows directly from the domain's deepest constraint. D-017, D-023, D-040, `N-11` and D-057 all forbid the system from choosing thresholds, rates, service levels or calendars. Every one of those refusals creates a value the factory must supply — **and today they have nowhere to live.**

### 14.2 What belongs here

| Setting | Why it exists | Consequence of leaving it unset |
|---|---|---|
| Working calendar and week | Dates are in calendar days until set (`F-50`) | Recommended dates can land on a weekend |
| Which lead time is authoritative | Three sources disagree (`F-09`) | Dates derive from master data alone |
| Which arrival date to trust | Promise vs carrier ETA (`F-51`) | Both are shown, neither wins |
| Minimum stock per material | Never invented (`N-11`, D-037) | No 🔴 low-stock state exists |
| Expected weight per pack | Catch-weight, never invented (`F-52`, D-048) | Order quantities stay in kg |
| Does the recipe include scrap? | Never assumed (`F-49`) | Requirements are the recorded figure |
| Cost reference freshness | `N-09` unanswered | Age is stated, staleness is not classified |

### 14.3 The presentation rule — what makes it a trust surface

> **Every unset value states what the system cannot do until it is supplied.**

Not *"Working calendar: not set."* Instead:

```
Working calendar          Not set
                          Order-by dates are counted in calendar days, so they
                          can land on your weekend. Set this and we'll skip
                          non-working days.                        [ Set it up ]
```

**This turns configuration from a chore into an obvious gain**, and it is the single strongest expression of the product's honesty. It is also the exact opposite of an ERP settings tree.

### 14.4 Access

Ordinary users **read** these values and see their consequences — this is how the limits of an answer become understandable. Only an administrator changes them. **Every change is a decision with a consequence, so every change is recorded and attributed.**

### 14.5 Never in Settings

Feature toggles for incomplete work · database or performance tuning · anything an engineer would set · anything with no stated consequence.

---

## 15. Cross-system journeys

> **The user must never feel they are moving between modules.** Every navigation carries its subject and its question forward.

### 15.1 The journey map

| From → To | Trigger | Carries | Lands on | Never lost |
|---|---|---|---|---|
| **Today → Stock** | A material is at risk | The material, the risk | That material, expanded | Why it was flagged |
| **Today → Incoming** | An order is late | The order, the risk | That order, with reason and action | The consequence |
| **Today → Make** | Production may be blocked | Product and quantity if known | The question, pre-filled | The originating concern |
| **Stock → Incoming** | *"Is this already handled?"* | The material | Open orders **for that material only** | The shortfall that prompted it |
| **Stock → Make** | *"Can I still produce?"* | The material | Products using it | Which material raised the question |
| **Make → Stock** | A material is short | The material and the shortfall | That material | **The quantity needed** |
| **Make → Incoming** | Supply is late | The material and the need-by date | Orders for it, with lateness against **that date** | The production request |
| **Make → Money** | An opportunity conflicts | The material | The saving on it | That an order was being considered |
| **Incoming → Stock** | *"What will this give me?"* | The material and arrival | Position with the arrival marked | The order |
| **Money → operations** | *"Where does this come from?"* | The material and cause | The material, or the orders that generated the cost | The saving being examined |

### 15.2 The three binding rules

1. **Context carries.** Arriving at Stock from a feasibility shortfall shows *that* material with *that* shortfall — never an unfiltered list.
2. **The originating question is visible and returnable.** A breadcrumb that states the question, not the page name: *"← back to: can I make 10,000 of FG-100?"*
3. **A filtered view says it is filtered, and can be widened in one interaction.** A user who cannot tell they are looking at a subset will mistrust the numbers.

### 15.3 The connection that matters most

```
Money  ←→  Incoming
```

Five orders carry `expedited AIR`. That flag *is* the 1.38M EGP saving. Today they sit on different pages with no link. **Connecting them turns an abstract finding into five orders a manager remembers placing** — and that is what makes the number believable.

---

## 16. Progressive disclosure

### 16.1 The classification

| Information | Primary | Secondary | Advanced |
|---|---|---|---|
| State (🟢🟡🔴⚪) | ✅ | | |
| What it is (name) | ✅ | | |
| Recommended action | ✅ | | |
| Consequence of inaction | ✅ | | |
| Quantity you have | ✅ | | |
| Quantity short | ✅ | | |
| Deadline | ✅ | | |
| Warning that changes the action | ✅ | | |
| Demo marking | ✅ | | |
| Reason (one sentence) | ✅ | | |
| Supplier | | ✅ | |
| Lead time | | ✅ | |
| Incoming quantity and arrival | | ✅ | |
| Consumption history | | ✅ | |
| Recent delivery performance | | ✅ | |
| Quality hold, unit conversions | | ✅ | |
| Assumptions and stated limits | | ✅ | |
| The calculation | | | ✅ |
| Basis and provenance | | | ✅ |
| Evidence gates | | | ✅ |
| Decision and factory-question IDs | | | ✅ |
| Mechanism identifiers | | | ✅ |
| Raw records, UUIDs, natural keys | | | ✅ |
| Audit trail | | | ✅ |

### 16.2 The anti-dump rule

> **A card shows what the decision needs, never what the record contains.**
> Adding a field to a card requires naming the decision it changes.

This exists because the failure mode is specific and predictable: an engineer holding a rich object renders all of it. `ComponentResult` has 24 fields; the feasibility card shows six.

---

## 17. State model

Eleven states, each with a **distinct meaning, treatment and voice**. The four distinctions in §17.2 are the ones that must never blur.

| State | Meaning | Treatment | Voice |
|---|---|---|---|
| **Loading** | Working | Skeleton of the shape being loaded — never a bare spinner | *"Checking your stock…"* |
| **Success** | Done | Confirm what happened and what changed | *"Recipe added. 12 materials."* |
| **Empty** | Nothing to show, correctly | Neutral. State, cause, next action | *"No orders on the way."* |
| **Error** | We failed | Neutral, not alarming. What happened, what to do | *"We couldn't load this. Nothing was changed."* |
| **Unknown** | We can't determine it | ⚪ **Neutral.** Names what is missing | *"We don't have the recipe yet."* |
| **Unavailable** | Not built yet | Honest about the limit | *"We don't track this yet."* |
| **Demo** | Not your data | Persistent, unmissable, never dismissible | *"DEMO — not your factory's data."* |
| **Warning** | Attention, not urgent | 🟡 Amber, inline | *"This may not last until the delivery."* |
| **Critical** | Act now | 🔴 Red, top of the list, with consequence | *"This will stop production."* |
| **Stale** | Real but aged | Neutral + the age | *"Cost figures are 101 days old."* |
| **Insufficient data** | Can't compute | ⚪ Names the missing input | *"No delivery history for this supplier yet."* |

### 17.2 The four distinctions that must never blur

```
UNKNOWN ≠ NO
  ⚪ is neutral; 🔴 is red. ⚪ names what is missing; 🔴 names the shortfall.
  A manager who sees red buys material. If the truth was "no recipe", they
  spent money for nothing.

INSUFFICIENT DATA ≠ ZERO
  A missing value NEVER renders as 0. "—" is permitted only beside a stated
  reason. Zero means we measured zero.

DEMO ≠ REAL
  Structural, carried in the data, never a badge someone remembers to render.
  Persistent and never dismissible.

WARNING ≠ CRITICAL
  Amber says "watch this." Red says "act now, or production stops."
  If everything is red, nothing is.
```

### 17.3 Consistency rule

A state's colour, mark and voice are **identical across all five areas**. 🟡 means the same thing on Stock, Incoming, Make and Money. **This is what makes the product feel like one system.**

---

## 18. Action model

### 18.1 Every recommendation has four parts

```
WHAT      the verb and the object      "Order polymer resin"
HOW MUCH  the quantity, in its unit    "4,500 kg"
WHEN      the deadline                 "by Tuesday 18 August"
WHY       the cause, one sentence      "stock plus incoming won't cover it"
```

### 18.2 When a part is not known — the invention rules

> **A missing part is stated. It is never invented, and it never silently disappears.**

| Missing | Behaviour |
|---|---|
| **How much** | No action is offered. State the situation instead — a recommendation without a quantity is not actionable |
| **When** | Say why: *"we don't have a delivery time on file, so we can't say when to order"* — never a default, never "ASAP" |
| **Why** | **Blocking.** An unexplained recommendation must not be shown |
| **Consequence** | Show the action and state that the impact is not known. Never imply severity that has not been established |

### 18.3 Urgency is derived, never assigned

Urgency comes from an observed relationship — *arrival is after the need date*, *cover is shorter than delivery time*. **No priority score, no ranking constant, no "high/medium/low" that is not traceable to two observed numbers** (D-014 rule 15, D-017).

### 18.4 The system recommends; the human commits

No action executes on its own. No purchase order is created automatically. **A recommendation may pre-fill a form; it may never submit one.** This is D-011's classification of operational management as `ENABLER`, expressed in the interface.

### 18.5 Actions the system may not recommend

Supplier selection (needs Mechanism 02's comparability gates) · order splitting · material substitution (`F-27`) · **expediting** — recommending one asserts the premium is worth paying, which requires a stockout valuation that D-034 says cannot be made. **The interface states the fact and lets the buyer decide.**

---

## 19. Information density

Every number below is derived from something real. **None is a design constant.**

### 19.1 The counts

| Limit | Value | Derivation |
|---|---|---|
| Primary decisions above the fold | **3** | The count of distinct questions a manager arrives with. There is no fourth question |
| Primary actions per card | **1** | A card is about one subject; two competing actions means it is two cards |
| Layer-2 lines per subject | **1 action + warnings that change it** | More than that is evidence, and evidence is Layer 3 |
| Fields on a summary card | **≤ 6** | The feasibility card carries six of a 24-field object and is complete. Six is the observed sufficiency, not a rule of thumb |
| Interactions to full evidence | **1** | Law 7 |

### 19.2 When each form is justified

**A sentence** — the default. Anything the system can conclude is stated, not drawn.

**A card** — one subject, one state, one action. Justified when the user acts on subjects individually.

**A table** — justified only when the user genuinely **compares across rows** on the same dimensions. A table of one is a card. A table nobody compares across is a list. **A table the user must join to another table is a defect** (Law 4).

**A chart** — justified only when the **shape** carries information the sentence cannot: a trend, a distribution, a comparison across many items. The bar is deliberately high; the product currently has none and needs none until Analytics has a written question.

**An expansion** — for evidence a decision does not need, on a subject already visible.

**A separate page** — when the subject changes, or when the detail is a genuine second task.

### 19.3 The overload test

> **Count the things on screen that could change what the user does next.**
> **More than three, and the screen has failed to prioritise.**

---

## 20. Formatting contract

### 20.1 The single boundary — this is the structural fix

> **Values reach the interface only through the shared formatter.**
> **No component performs arithmetic, calls `.toFixed()`, or renders a raw stored value.**

⚠ **Why this is stated so strongly.** `formatMoney()` and `formatQty()` already exist in `lib/core/decimal.ts` and round correctly. `/produce` uses them. The dashboard calls `.toFixed(2)` inline. The two opportunity pages interpolate the **raw JSONB string**, which is why `1383868.667808219178082191781` reaches a user.

**The helper was never the problem. The absence of an enforced boundary was.**

### 20.2 The rules

| Kind | Primary | Detail |
|---|---|---|
| **Currency, large** | `1.38M EGP` — 3 significant figures | Exact value, 2 dp |
| **Currency, normal** | `21,311 EGP` — thousands separated, no decimals | 2 dp |
| **Quantity** | Unit-aware: whole units for countable items, sensible precision for weights. Thousands separated | Full recorded precision |
| **Percentages** | ⚠ **Rare.** Only for genuinely proportional facts, never for confidence | — |
| **Dates** | `Tue 18 Aug` — weekday included, because it changes whether it is actionable | Full date |
| **Relative time** | `3 days late`, `about 6 weeks' cover` | Exact dates |
| **Negative** | Explicit and worded — *"12 days late"*, not `-12` | Signed value |
| **Unavailable** | Never `0`, never a bare `—`. A reason, or `—` beside one | The reason |
| **Ranges** | Words in primary: *"about 1.38M"*. The partition at Layer 3 | Both bounds with what separates them |

### 20.3 Units are never dropped and never assumed

Every quantity states its unit. F3's rule stands: *"Stock: 14,200" is a defect.* For catch-weight, the unit shown is the one the user acts in.

### 20.4 Rounding never enters arithmetic

Formatting is presentation only. A rounded value is a display string and is never fed back into a calculation. The engine keeps full precision; **the interface never sees it.**

---

## 21. Trust model

### 21.1 The thesis

The competitive advantage is not automation. **It is that a recommendation can be trusted, and that the system says when it cannot be.**

Traditional ERP renders a physical count, a two-year-old master-data field and a forecast as identical black text. The user cannot tell them apart, learns to distrust all of it, and runs the real plan in Excel beside a fully-implemented ERP. **This product has provenance in the foundation of every value — a property of construction, not a feature, and not retrofittable.**

### 21.2 How trust is expressed — without bureaucracy

> **Trust information appears in the primary layer only when it changes the decision.**

| Situation | Layer | Why |
|---|---|---|
| Observed performance contradicts the number we used | **2** | It changes whether they trust the date, so it changes what they do |
| A conflicting recommendation exists | **2** | They must not act without it |
| This is demo data | **2** | It changes whether they act at all |
| The answer rests on a figure they entered | 3 | Changes confidence, not action |
| A stated limitation (calendar, scrap, confirmation) | 3 | Bounds the answer without changing it |
| Basis, gates, provenance chain | 4 | Audit material |

### 21.3 The four things the interface must be able to say

```
"We measured this."                    observed records
"We worked this out from your records." derived
"You told us this."                    user-supplied
"We don't know this, and here's why."   absent
```

**In those words** — not `ACTUAL`, `CALCULATED`, `USER_DEFINED`, `INSUFFICIENT_DATA`.

### 21.4 The bureaucracy test

> **If a trust statement does not change what the user does or how much they rely on the answer, it belongs at Layer 4.**

The current dashboard fails this three times over. Every one of those sentences is true, hard-won, and load-bearing — and aimed at a finance auditor, printed where a manager looks for what to do this morning.

---

## 22. ERP differentiation

### 22.1 The experience, stated as a sequence

```
USER ASKS A QUESTION        in their own words, in three fields
SYSTEM UNDERSTANDS          no configuration, no run, no planning horizon
SYSTEM ANALYSES             recipe, stock, supply, timing, history, conflicts
SYSTEM ANSWERS              one state, one sentence
SYSTEM RECOMMENDS           what, how much, when — or says why it can't
SYSTEM EXPLAINS             one sentence, with evidence one click away
USER DECIDES                the system never commits on their behalf
```

**Traditional ERP inverts this**: the user learns the module structure, navigates to the right screen, configures a run, executes it, and interprets the output.

### 22.2 Where we differ, and the mechanism

| Their pattern | Ours | The mechanism |
|---|---|---|
| Module navigation (Odoo) | Question navigation | Nav items are questions; an item renameable to a table is wrong (§6.3) |
| Data dump across screens (Oracle) | Problem assembled in one place | Law 4 + §7.3 — the user never joins |
| Spreadsheet grids | Lists ordered by urgency | Law 5 — if they must re-sort to find the problem, they'll rebuild it in Excel |
| Every number looks identical | Four honest states, everywhere | Provenance in the value model — **not retrofittable** |
| Confident numbers over stale inputs | *"We don't know, and here's why"* | ⚪ as a designed state (D-002) |
| Master data assumed correct | *"Your data says 30 days; the last 4 took 38"* | Both numbers exist; we show both |
| Config before value | 7 questions, then answers | Deliberately small first data request |
| Precision as rigour | Rounded, with exact one click away | Law 9 |

### 22.3 The honest limits

We do **not** claim breadth. Odoo and Oracle have modules this product does not and will not have. **The claim is narrow and defensible: for the questions this product answers, it answers them better, faster, and more honestly.** Any comparison claiming general superiority will lose the first serious evaluation.

### 22.4 The single sentence

> **Traditional ERP tells you what it computed.
> This tells you what to do, why, and how much of it we actually know.**

---

## 23. Implementation gate

> **An engineer may begin UI implementation only when every box below is ticked for the screen in question.**

### 23.1 Product-wide — must be true before any screen

- [ ] The four-layer model is understood and applied per screen (§4)
- [ ] The vocabulary guard runs against **every** rendered page, not one (Law 2)
- [ ] The formatting boundary is enforced — no arithmetic or raw values in components (Law 9, §20)
- [ ] The eleven states have a defined treatment and voice (§17)
- [ ] The four never-blur distinctions are implementable and tested (§17.2)
- [ ] Navigation is the five questions; Import and Data health have moved to secondary (§6)
- [ ] Loading and error states exist for every route (Law 8)

### 23.2 Per screen — before that screen is built

- [ ] The **user question** it answers is written in one sentence
- [ ] Its **Layer 1** answer is written, in the four-state vocabulary
- [ ] Its **Layer 2** actions are defined, with the §18.2 rules for missing parts
- [ ] Its **Layer 3** evidence is listed
- [ ] Its **Layer 4** boundary is drawn
- [ ] Its **default sort** is urgency, and urgency is derived from observed values (Law 5, §18.3)
- [ ] Its **empty, loading, error and unknown** states are written as sentences
- [ ] Its **incoming and outgoing journeys** are mapped, with what context carries (§15)
- [ ] Its **primary decision count** is ≤ 3 (§19)
- [ ] **No term** on it appears in the 🔴 column of §5.2
- [ ] Every **number** on it passes §20
- [ ] Every **action** on it has what · how much · when · why — or states which is unknown

### 23.3 Blocked, and honestly so

- **Profile** is blocked on authentication (`A-19`, `A-20`).
- **Settings** can be designed now and cannot be *enforced* until authentication exists — an unauthenticated user must not change a factory policy.
- **Analytics** is blocked on having more than one finding to analyse. Designing a comparison view over a single row would produce a layout that breaks on contact with real data.

---

## 24. Acceptance criteria

How to know this contract is being honoured. Each is testable, and several can be automated with mechanisms that already exist.

### 24.1 Automatable now

| # | Criterion | Method |
|---|---|---|
| 1 | Zero vocabulary violations across all pages | The Block 9 guard, extended. **29 today** |
| 2 | No component performs arithmetic or renders a raw stored value | Source-tree assertion, as the D-055 firewall test already does |
| 3 | No rendered figure exceeds its unit's precision | Regex over rendered output |
| 4 | Every route has a loading and error state | File existence |
| 5 | The saving headline is unchanged by any interface work | Snapshot comparison — **already passing** at `0.00 – 1,383,868.67` |

### 24.2 Reviewable per screen

| # | Criterion |
|---|---|
| 6 | Read the first sentence aloud: it is actionable or conclusive |
| 7 | Cover everything below the first card: a correct decision is still reachable |
| 8 | The first row of every list is the one to look at first |
| 9 | Every unknown renders a reason, never a zero or a bare dash |
| 10 | Every action states what, how much, when, why — or which is unknown and why |
| 11 | No problem requires two pages to understand |
| 12 | Every counter would change behaviour if it doubled |

### 24.3 The five-second test — the one that matters

> **Show any screen to someone who has never seen the product.
> Within five seconds they must be able to say what the situation is and what they would do.**

Today one screen of seven passes. **This contract is honoured when all of them do.**

---

## 25. What this contract does not do

- It **changes no domain decision.** D-001 through D-058 are untouched.
- It **changes no calculation.** Every figure the engine produces is unchanged; only its presentation is governed.
- It **does not design anything.** No layout, no component, no colour beyond the four state marks the domain already locked.
- It **does not weaken any honesty rule.** Every provenance, basis and evidence obligation survives — relocated by layer, never removed. Where this contract moves the evidence partition off the dashboard headline, **the partition itself is unchanged and remains one interaction away.**

---

*Interface contract locked 2026-08-10. Governs the UI/UX phase. Amendable only by a recorded decision.*
