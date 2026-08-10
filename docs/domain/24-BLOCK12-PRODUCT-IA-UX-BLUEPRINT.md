# Product Information Architecture & UX Blueprint

**Date:** 2026-08-10 · **Status:** proposal for review · **Verified against:** commit `54f4545`, clean tree
**Governed by:** `23-INTERFACE-CONTRACT.md` · **Preceded by:** Blocks 8–11
**Nature:** planning only. No code, schema, route, component or styling is created or modified.

> **COMPLEXITY BELONGS IN THE ENGINE. CLARITY BELONGS IN THE INTERFACE.**

---

## 1. Executive summary

### 1.1 The finding that shapes this entire blueprint

Block 11's inventory contract defined states derived from observation: **🟡 when cover is shorter than the usual delivery time**, both numbers observed, no threshold invented. I queried the actual data to see how much of the product that classifies.

```
Items with BOTH consumption history AND a lead time:   1 of 8   (RM-001)
Items that would render ⚪ CAN'T SAY:                   7 of 8
```

**An Inventory screen built exactly to contract would be seven-eighths grey on day one.** That is honest, it is correct, and as a product it is unusable — a manager opening it would conclude the system knows nothing.

**The resolution is not to lower the bar. It is to make ⚪ productive.**

> **⚪ is not a dead end. It is the product's onboarding mechanism.**
>
> Each grey item states the *one thing* that would make it answerable, and offers the action
> that supplies it. Seven greys become seven specific, closeable gaps — not seven shrugs.

This is a structural advantage no ERP has. Traditional systems ship empty and expect configuration; the user discovers what was needed only when a report comes out wrong. **This product can say, per item, exactly what it needs and what that unlocks.** §9.4 develops it, and §21 argues it is the single sharpest differentiator in the blueprint.

### 1.2 What else the verification found

| Checked | Result |
|---|---|
| Working tree | Clean at `54f4545`. Nothing changed since Block 11 |
| Live findings for Analytics | **1 opportunity · 0 outcomes · 0 observed costs · 0 exposures · 1 run** |
| Items with a lead time | 4 of 8 |
| Items with consumption history | 2 of 8 |
| Open orders | 3 |

**Analytics has one row to analyse.** §12 designs it as a queue and a translation surface rather than a comparison surface, because a comparison view over one row breaks on contact with real data.

### 1.3 Two conflicts with locked scope — recorded, not resolved

**C-01 — the executive user is out of scope.** The brief asks me to consider a *management / executive user*. `02-first-release-scope.md:162` states: *"The executive experience (§41) is **explicitly deferred**. Building it now over data that has not yet earned trust would produce precisely the 'dashboard-first fake ERP' §47 prohibits."* The build plan lists *executive dashboard* as out of the first release.

**I have not designed for an executive user.** The dashboard is a warehouse command centre answering *"what needs my attention today?"* — per `02-first-release-scope.md:160`. Recorded as a conflict for the product owner.

**C-02 — the production manager has no role.** The brief lists a *factory / production manager*. D-051 locks five roles and D-058 explicitly declined to create `PRODUCTION_PLANNER`, because production execution is out of scope and no accountability exists to hang a role on. Feasibility is permitted to whoever may already read stock.

**Consequence for this blueprint:** the Make screen is designed for the **inventory manager and buyer**, who are the users the domain recognises. If a production manager is a real user, D-051 needs extending — a decision, not a design.

### 1.4 The navigation recommendation, in one line

**Five outcome-first primary items, two secondary, one utility group** — with the reasoning in §5, including why I moved off part of Block 11's proposal.

---

## 2. Product UX philosophy

### 2.1 The sentence the product must earn

> *"I can immediately understand what is happening and what I should do."*

Not *"I need to understand the system before I can use the system."*

### 2.2 What "better than Odoo and Oracle" means here

It is a claim about **the number of things a user must do before the system becomes useful**, and about **who does the thinking**.

| | Traditional ERP | This product |
|---|---|---|
| Who finds the problem | The user, by searching | The system, by telling |
| Who joins the data | The user, across screens | The engine, before rendering |
| Who decides what matters | The user, by interpreting | The system, by ranking on observed facts |
| Who commits the action | The system, if configured to | **Always the human** |
| What "I don't know" looks like | A zero, or a confident wrong number | A named gap with a way to close it |

**We are not competing on breadth and must never claim to.** Odoo and Oracle have modules this product will not have. The claim is narrow: *for the questions this product answers, it answers them faster, more clearly, and more honestly.*

### 2.3 The three tensions this blueprint resolves

**Honesty versus usefulness.** ⚪ is honest and, repeated eight times, useless. Resolved by making every ⚪ carry its remedy (§1.1).

**Rigour versus simplicity.** The engine's evidence apparatus is the competitive advantage and it cannot lead. Resolved by the four-layer model, with the placement rule from the Interface Contract §4.2.

**Completeness versus focus.** Everything the engine knows could be shown. Resolved by a single test applied throughout: **if it would not change what the user does, it is not primary.**

---

## 3. User mental models

### 3.1 What the user actually thinks

A manager never thinks *"show me the inventory ledger."* They think in **questions with deadlines**:

```
Morning        "Is anything going to stop me this week?"
Before a run   "Can I actually make this?"
Weekly         "What do I need to order?"
When chasing   "Where is that delivery, and does it still work for me?"
Monthly        "Where are we losing money?"
When surprised "Why is the system telling me this?"
```

### 3.2 The mental model of the system itself

The user should hold exactly one model:

> **"It watches my stock and my orders, it knows what my products are made of,
> and it tells me when something is going to be a problem — and what to do about it."**

Everything else — ledgers, provenance, gates, mechanisms, evidence classes — is machinery they should never need to know exists. **If a user has to learn a second concept to use the product, the interface has failed.**

### 3.3 The vocabulary the user brings

They say **stock**, not *inventory position*. **Order**, not *purchase order line*. **Recipe** or **formula**, not *bill of materials*. **Late**, not *variance to promised date*. **Running out**, not *below reorder point*. **Rush shipping**, not *expedite premium*.

⚠ `F-48` will confirm the factory's own word for a recipe. **Until then the interface uses "recipe" and the term is a placeholder, not a decision.**

---

## 4. Primary user jobs

Only the users the domain recognises (D-051, as extended by D-058). C-01 and C-02 record the two the brief adds.

### 4.1 Warehouse operator

**Job:** record what physically happened, accurately, quickly, often on a phone in an aisle.
**Question:** *"What do I need to record, and did it go through?"*
**Needs immediately:** confirmation that a movement was accepted; what is expected today.
**Worst mistake the interface could cause:** a movement recorded against the wrong item or location because codes look alike. **Names lead, codes follow — everywhere.**
**Never has to:** understand basis, provenance, or why a refusal happened in engine terms.

### 4.2 Inventory manager — the primary user (D-007)

**Job:** keep material available without tying up cash.
**Question:** *"What needs my attention, and what do I order?"*
**Needs immediately:** what is at risk, with the action and the consequence.
**Worst mistake:** a false 🟢 that leads to a stockout — which is why D-057's cap exists and why the interface must never manufacture green.
**Never has to:** calculate cover, join stock to incoming, or work out how much to order.

### 4.3 Buyer

**Job:** place and chase orders; keep suppliers honest.
**Question:** *"What must I order, and what am I chasing?"*
**Needs immediately:** what to order with quantity and deadline; which open orders are late or at risk, and why.
**Worst mistake:** ordering more of a material an open saving says to hold less of — **which is why D-055's opportunity-context read exists and must be surfaced at Layer 2.**
**Never has to:** join a PO to a shipment to a customs milestone to discover a problem.

### 4.4 Adjudicator

**Job:** approve or reject a currency claim, independently of the decision it rests on (DP-07).
**Question:** *"Is this saving real, and am I allowed to judge it?"*
**Needs immediately:** the claim, the intervention, the evidence, and **whether their independence is established** — `Q-13` records that today it can be checked against the classifier and not against the purchase.
**Worst mistake:** approving a claim they are not independent of. **The interface must state which parties could not be checked** — it already does in the engine and must keep doing so.
**Never has to:** read the decision register to understand what they are approving.

### 4.5 Administrator

**Job:** get the factory's facts into the system and keep them current.
**Question:** *"What does the system still need from me, and what does each thing unlock?"*
**Needs immediately:** what is missing and what it blocks — **stated as consequence, never as a form label.**
**Worst mistake:** supplying a value casually that the engine treats as authoritative. **Every setting states what it changes** (§14).
**Never has to:** guess a threshold the system should have derived, or supply a value nobody asked for.

---

## 5. Navigation recommendation

### 5.1 The three options, tested

**A · Module-first** — Dashboard · Inventory · Orders · Production · Analytics · Settings · Profile.
Familiar to anyone who has used an ERP, and it encodes the system's structure rather than the user's question. **Rejected**: it is the pattern Block 10 found the product already drifting into, and it makes *"what needs my attention"* a module rather than the point.

**B · Outcome-first** — Today · Stock · Incoming · Make · Money.
Matches the mental model in §3.1. **Risk:** invented words the user must learn, and a real discoverability problem — a manager looking for a purchase order does not obviously look under *Money* or *Incoming*.

**C · Hybrid** — outcome-first labels over recognisable nouns, with utilities demoted.

### 5.2 Testing against the criteria

| Criterion | A | B | C |
|---|---|---|---|
| Matches the user's mental model | ✗ | ✓ | ✓ |
| Understandable with no training | ✓ | ⚠ *"Money"* is ambiguous | ✓ |
| Frequency-ordered | ✗ admin ranks high | ✓ | ✓ |
| Survives the product growing | ✓ | ⚠ where does a new area go? | ✓ |
| Fits current capability | ✓ | ⚠ *Money* over-promises with 1 finding | ✓ |
| Fits future feasibility work | ✓ | ✓ | ✓ |

### 5.3 Recommendation

```
PRIMARY — five items, ordered by frequency of use

  Today        What needs my attention?
  Stock        What do I have, and what's running out?
  Orders       What's coming, and what's late?
  Make         Can I produce what I need?
  Savings      Where are we losing money, and where can we save?

SECONDARY — an account menu

  Settings     How does my factory work?
  Profile      Who am I, and what can I do?

UTILITY — inside Settings, not in navigation

  Import data
  Data health
```

### 5.4 Where I moved off Block 11's proposal, and why

| Block 11 | Now | Reason |
|---|---|---|
| **Incoming** | **Orders** | *Incoming* is a better description of the question and a worse **word to look for**. A buyer chasing PO-1008 looks for "orders". The page's *title* can still ask the question; the nav label must be findable. Discoverability beats elegance in a nav item. |
| **Money** | **Savings** | *Money* implies costing, invoices and margins — none of which this product owns (D-008 gave valuation to finance). *Savings* describes what is actually there and does not over-promise. |
| Import + Data health as secondary | **Inside Settings** | They are not peers of Settings; they are things an administrator does *while* configuring. Putting them in the account menu still gives four items to scan. |

**Kept from Block 11:** *Today*, *Stock*, *Make*; five primary items; utilities out of primary navigation.

### 5.5 The naming law, retained

> **A primary navigation item is a question the user asks, or the noun they would search for.**
> **It is never a database table, an internal class, or a capability name.**
> If *Opportunities* or *Data health* returns to primary navigation, this law has been broken.

---

## 6. Global information hierarchy

The four-layer model from the Interface Contract §4 applies unchanged. This section records how each area maps onto it, so no screen re-derives it.

| Area | Layer 1 — Answer | Layer 2 — Action | Layer 3 — Explanation | Layer 4 — Evidence |
|---|---|---|---|---|
| **Today** | What needs attention, or that nothing does | Top 3 actions with consequences | Why each was raised | Per-item drill-through |
| **Stock** | Per material: one of four states | Order / chase / nothing | Cover, incoming, usage | Movements, conversions, lots |
| **Orders** | Per order: on track · late · at risk · unknown | Chase / nothing / re-plan | Where it is, what moved | Shipment, milestones, ETA history |
| **Make** | 🟢🟡🔴⚪ + one sentence | What's missing, what to order | Requirement vs stock vs incoming | Recipe, conversions, sources |
| **Savings** | One figure, one line on how solid | Approve / reject / investigate | The intervention and counterfactual | Gates, evidence, provenance |
| **Settings** | What is set, what is missing | Supply the missing value | What each unlocks | Where the value is used |
| **Profile** | Who you are, what you can do | — | — | Your recent activity |

**The invariant:** Layer 1 uses only the four state words. **No area invents a fifth state.**

---

## 7. Global interaction patterns

Only patterns that materially improve *this* product. Deliberately not a generic UI checklist.

### 7.1 Progressive disclosure — one mechanism, used everywhere

Two disclosure levels, and no more:

```
"Why?"              reveals Layer 3 in place, inline, no navigation
"Show the numbers"  reveals Layer 4 in place, inline, no navigation
```

**Both are inline expansions, never modals and never new pages.** A modal loses the context that made the question worth asking; a new page loses the list the user was scanning. **This is the "one-click deep dive" of §15 of the brief, and it is one pattern reused, not a family.**

### 7.2 Deep linking is mandatory

Every expansion, filter and selected item is addressable by URL. A buyer must be able to send *"look at this"* to a colleague. **This is the cheapest collaboration feature in existence and ERPs routinely lack it.**

### 7.3 Search

**One search, addressing materials, orders and products by name or code.** Not per-page search boxes. A user looking for RM-001 should not have to know which page owns it.

### 7.4 Filters and sorting

**Default sort is always urgency** (Interface Contract Law 5). Filters are **few, named as questions** — *"only what needs attention"*, *"only what I'm waiting for"* — never a column-by-column filter builder.

**A filtered view says it is filtered and can be cleared in one interaction.** A user who cannot tell they are looking at a subset will mistrust every number on the screen.

### 7.5 Pagination

**Avoided in favour of urgency-ranked lists with a clear tail.** *"12 more materials, all healthy"* is better than page 2 of 4 — it tells the user they can stop reading. Pagination returns only if a real factory list makes the page slow, which is a measurement, not an assumption.

### 7.6 Actions and feedback

Every action states what will happen before it happens and what happened after. **Destructive or outward-facing actions confirm; reversible ones do not.** Today the product has no destructive action — the ledger is append-only and a correction is a new movement (D-001), which is a genuine simplicity to preserve.

### 7.7 Notifications

**Not built.** *Today* is the notification surface. A separate notification system would create a second inbox competing with the dashboard for the same job. Revisit only when a user is expected to act while not looking at the product.

### 7.8 Navigation memory and return

Every drill-down offers a **return that states the question, not the page name**: *"← back to: can I make 10,000 of FG-100?"* Context carries in both directions (§17).

### 7.9 Keyboard and accessibility

Every action reachable by keyboard; visible focus; state never carried by colour alone — **the four states carry a mark and a word as well as a colour**, which is already true in the engine's `VERDICT_MARK`/`VERDICT_WORD` pairing and must remain so.

### 7.10 Responsive

**The warehouse operator is a phone user in an aisle** and is a first-class case, not a degradation. Below the tablet breakpoint, tables become one card per subject carrying Layer 1 and 2 only; Layers 3 and 4 remain reachable by expansion. **Nothing is removed on small screens — only re-laid-out.**

---

## 8. Dashboard architecture — *Today*

### 8.1 The one question

> **"What do I need to know or do today?"**

Per `02-first-release-scope.md:160`, this is a **warehouse command centre**, not an executive dashboard (C-01).

### 8.2 What it must know internally

Production risk · stock risk · order risk · savings needing a decision · data gaps that are **blocking an answer the user has asked for** · what changed since yesterday.

### 8.3 What it shows — the hierarchy

```
1  STATE OF THE FACTORY   one line. Either what is wrong, or that nothing is.
2  WHAT NEEDS DOING       at most THREE items, each: what · action · consequence
3  MONEY                  one figure, one line on how solid, one way in
4  WHAT I STILL NEED      only when it blocks something, phrased as a gain
```

### 8.4 Why at most three

**Derived, not chosen.** Three is the count of distinct questions a manager arrives with (§3.1 morning-tier). A fourth card competes with three that matter and answers no question anyone asked. **When more than three things need attention, show the three most urgent and a count of the rest** — never a longer list.

### 8.5 What must never appear

Methodology · decision or factory-question IDs · basis labels · counters that read zero · database statistics · charts · a navigation grid disguised as cards · **any number that would not change what the user does today**.

### 8.6 The nothing-urgent state

```
🟢  Nothing needs your attention today.

    Checked 8 materials, 3 incoming orders and 2 products.
    Stock data is current as of this morning.
```

**Stating what was checked is what makes the reassurance credible.** An empty dashboard that shows nothing invites the user to distrust it.

### 8.7 The degraded state — and it is the common one

⚠ With 7 of 8 items unclassifiable, the dashboard will often have **little to say and much it cannot say.** It must not fill that space with counters.

```
🟡  I can only watch 1 of your 8 materials properly.

    Polymer resin is the only one where I know both how fast you use it
    and how long it takes to arrive. For the other 7, I can show what you
    have but I can't warn you before you run out.

    → See what each material needs
```

**This is the honest version and it is also the persuasive one.** It states a real limitation, attributes it to missing facts rather than missing capability, and offers exactly one way forward.

---

## 9. Inventory architecture — *Stock*

### 9.1 The question

> **"What do I have, and what should I worry about?"**

### 9.2 Default view

**One line per material, ordered by urgency**, not by code. Each line carries, without interaction:

```
STATE       one of four
WHAT        name first, code second
HOW MUCH    one number, one unit
HOW LONG    cover in days — ONLY where computable; otherwise stated as unknown
COMING      quantity and arrival, so "have I already handled this?" is answered
DO          the action, only where genuinely known
```

### 9.3 The state model — derived only, and unchanged from Block 11

⚠ **This is the constraint that must not be softened.** `A-18` — the thresholds defining low, excess and dead stock — is an **open factory policy the system may not choose** (D-035, D-053). There is no minimum-stock field. `N-11` states a service level is *"a policy the factory states, never a parameter we fit."*

```
🔴 Critical   A stated requirement cannot be met from stock and incoming supply.
              Comes from a real question asked in Make — never from a guessed level.

🟡 At risk    Cover is shorter than the usual delivery time. Both observed.

🟢 Healthy    Neither of the above, and both inputs are known.

⚪ Can't say  No usage history, or no delivery time on record. STATED, with the
              specific missing input named. NEVER rendered as healthy.
```

**Excess is not a state until `A-18` is answered.** The interface may state the observation — *"27,000 kg, about 6 weeks of cover"* — and must not label it excess. **Stating a fact is permitted; classifying against an unowned threshold is not.**

### 9.4 The ⚪ design — the most important part of this blueprint

**Today this rule yields ⚪ for 7 of 8 materials.** The design obligation is therefore not to hide that, but to make each grey **specific, attributable and closeable**:

```
⚪  Mineral filler                             2,094 kg
    I can't warn you about this one — no delivery time on record.
    → Add it in Settings, and I'll tell you when to reorder

⚪  Pump assembly                                  3 EA
    I can't warn you about this one — you've never issued any, so I
    don't know how fast you use it.
    → Nothing to do. I'll learn this as stock moves.
```

**Three rules make this work:**

1. **Name the missing input, never the state.** *"No delivery time on record"* — never *"insufficient data"*.
2. **Distinguish fixable from waiting.** A missing lead time is a **five-second fix**. Absent usage history is **time passing**, and telling the user to fix it would be dishonest.
3. **State what closing it unlocks.** *"…and I'll tell you when to reorder."* A gap with a stated gain is an onboarding step; a gap without one is a complaint.

> ⚪ **is the difference between a system that shipped empty and a system that is telling you how to switch it on.**

### 9.5 Item detail

Movement history · lot and serial where tracked · unit conversions · quality-hold breakdown · **the full supply picture for this material** · **savings on this material** (D-055's context read, both directions) · what the system knows and does not know about it.

### 9.6 Search, filter, sort, group

**Search** by name or code. **Filter** by question — *only what needs attention*, *only what I can't judge*. **Sort** defaults to urgency; alphabetical and quantity are user choices. **Grouping** is deliberately **not** offered: grouping by supplier or type is a report, and this is a worklist.

### 9.7 Table or cards

**A table**, because a manager genuinely compares materials across the same dimensions — the one case §19 of the Interface Contract says justifies one. **One card per material on small screens.**

### 9.8 The `Reserved` column

Removed from the list and stated once beneath it. Eight identical zeros with an internal note teaches users to stop reading (D-050 keeps the vocabulary; the column returns when a commitment source exists).

---

## 10. Orders architecture — *Orders*

### 10.1 The question

> **"What am I waiting for, and what could hurt me?"**

### 10.2 The mandatory unit of information

> **One incoming order is one thing, and it carries its own risk, reason and action.**

The user must never join a PO to a shipment to a milestone to an ETA. All four already exist in the database; today they sit on three separate tables and the user performs the join.

```
WHAT        material, quantity, supplier
WHERE       where it physically is, when known
WHEN        expected arrival — with what that is based on
STATE       on track · late · at risk · unknown
WHY         the cause, in one sentence
AFFECTS     what it blocks, when we can compute it
DO          chase · re-plan · nothing
```

### 10.3 Structure

**Open orders and history are separate views.** *"What's coming"* is the page's whole job, and today 8 of 11 rows are archive. Open orders sort by risk then arrival. **History exists to answer one different question — *"how does this supplier actually behave?"*** — and is reached deliberately.

### 10.4 Risk states

```
🔴 Late        Past expected arrival, not received.
🟡 At risk     Held, revised, or arriving after a stated need date.
🟢 On track    Expected, not yet due.
⚪ Unknown     No expected date recorded. STATED, never shown as on track.
```

### 10.5 What must be said, not implied

- **`SENT` is not supplier-confirmed** (`F-51`). Where it matters, the interface says so.
- **A promised date and a carrier ETA that disagree are both shown**; neither overrides (D-056).
- **An ETA is a forecast and is never allowed to look like an arrival** (D-002, already enforced in the engine).

### 10.6 What is not built, and must not be implied

⚠ **No logistics capability is invented.** There is no tracking integration, no map, no carrier feed. The product shows **milestones the factory recorded** and nothing more. `currentLocation` exists in the schema and is read by no mechanism — **it may be displayed as a recorded fact and must never be presented as live tracking.**

### 10.7 The connection that pays for this page

Five orders carry `expedited AIR`. **That flag is the 1.38M EGP saving.** Today the flag and the finding live on different pages. Connecting them turns an abstract number into five orders the buyer remembers placing — **which is what makes the figure believable** (§17).

---

## 11. Make architecture — *Make*

`/produce` is the reference implementation and **passes the Interface Contract today**. This section records what it establishes so other areas inherit rather than reinvent.

### 11.1 The interaction

```
What do you want to make? → How many? → When do you need it? (optional) → Check
```

Three fields. **A fourth requires a decision, not a design.**

### 11.2 What the user never needs to understand

Recipes as a data structure · unit conversion · lead-time arithmetic · supply projection · provenance · gate logic · the peak/trough model · any decision ID. **All of it is engine.**

### 11.3 The distinctions the interface must preserve

**Gap versus shortfall** — the one most systems collapse:

```
GAP        what is NOT on the shelf now       → "what's missing"
SHORTFALL  what must be ORDERED after supply  → "what to do"
```

At 🟡 the gap is positive and the shortfall zero: **material is missing and an order already covers it.** Showing zero there would be true and useless.

**Dates:** a deadline is never invented; without a need-by date the answer states the earliest defensible arrival. Without a lead time, **no date is produced and the answer says why**. Ordering today and still arriving late is a **first-class answer**.

**⚪ names the missing thing** in the factory's language. **Rejected input is not ⚪** — ⚪ means *we* lack information; a malformed request means the question was not asked.

### 11.4 Connections without duplication

| To | Carries | Why it does not duplicate |
|---|---|---|
| **Stock** | The material and **the quantity short** | Stock owns the position; Make owns the requirement. Make links, never restates |
| **Orders** | The material and **the need-by date** | Orders shows lateness against *that date* — context Orders cannot have on its own |
| **Today** | A 🔴 answer becomes tomorrow's attention item | ⚠ Only if the request is persisted, which **D-055 forbids** (§25, O-01) |
| **Savings** | An open opportunity on a material being ordered | **D-055 rule 5.** A read at answer time, never a new finding |

⚠ **The contradiction guard is a hard requirement, not a nicety.** Without it, the product can tell a buyer to order more of a material while a live saving says to hold less. **The engine already computes this; the interface must show it at Layer 2.**

### 11.5 What is missing and belongs to the UI phase

There is no path from *"order 4,500 kg"* to a draft order, and no way to save or share an answer. §16 Journey 3 defines how that must behave. **It stops one step short of useful today.**

---

## 12. Analytics architecture — *Savings*

### 12.1 The verified reality

```
live opportunities  1        outcomes  0
observed costs      0        exposures 0
```

**One row.** Designing comparisons, trends or breakdowns over one row produces a layout that breaks the moment real data arrives. **This blueprint therefore designs Savings as a queue and a translation surface, not a comparison surface.**

### 12.2 Questions before visualisations

**No chart is designed until the question it answers is written down.**

| # | Question | Buildable now? |
|---|---|---|
| 1 | What can we save, and how solid is it? | ✅ The engine's strength — needs translation, not capability |
| 2 | What needs a decision from me? | ✅ Lifecycle exists; there is no queue view |
| 3 | Where does this come from? | ✅ Evidence exists; needs the one-click path |
| 4 | Did our decisions work? | 🔴 **Blocked** — 0 outcomes, and D-022 requires a 12-month window |
| 5 | What changed, and why? | 🔴 **Blocked** — no period comparison exists |
| 6 | What is costing us? | ⚠ Partial — observed costs exist as a class with no rows |

### 12.3 The presentation law

> **Never make the user interpret a chart when the system can state the conclusion.**

A chart earns its place only when the **shape** carries information a sentence cannot. **With one finding, no chart is justified.** The first chart in this product should appear when a real question needs one — not when the area is built.

### 12.4 Proven versus estimated

D-044's partition is the honest core and must survive translation into three plain headings:

```
What we can prove        claims resting on measured records
What we estimate         claims resting on figures you entered
What we can't count yet  named, with what would make them countable
```

**No basis vocabulary, no probability, no confidence score** (D-045).

### 12.5 The decision queue

The one genuinely missing capability: findings carry a lifecycle (`POTENTIAL → APPROVED → IN_PROGRESS → REALIZED`) and there is nowhere to act on it. **Savings is primarily a queue** — *here is what needs your decision* — and secondarily a figure.

---

## 13. Profile architecture

### 13.1 The question

> **"Who am I, and what am I allowed to do?"**

### 13.2 Contents

Who you are · your role **in plain words** · what that lets you do and what it does not · **your recent activity, including the feasibility questions you asked** — the audit trail exists (`feasibility_answers`) and has no surface today.

### 13.3 What does not belong here

**Anything about the factory.** Working calendars, lead-time policy, minimum stock — those are Settings. **Personal identity and factory configuration are separate surfaces**, and merging them is how ERP settings trees begin.

### 13.4 The constraint

⚠ **Authentication does not exist** (`A-19`, `A-20`). Profile is **blocked** and must not be faked with a hardcoded user. Designing it now is fine; building it is not.

### 13.5 One rule

Roles are described by **what they let you do**, never by their enum name. `ADJUDICATOR` is *"can approve savings."*

---

## 14. Settings architecture

### 14.1 What Settings is

> **Settings is where the factory states the values the system refuses to invent.**
> **It is a trust surface, not a preferences page.**

This follows from the domain's deepest constraint. D-017, D-023, D-040, `N-11` and D-057 all forbid the system choosing thresholds, rates, service levels or calendars. **Every refusal creates a value the factory must supply — and today they have nowhere to live.**

### 14.2 What belongs here

| Setting | Consequence of leaving it unset |
|---|---|
| Working calendar and week (`F-50`) | Order-by dates are counted in calendar days and can land on your weekend |
| Which lead time is authoritative (`F-09`) | Dates derive from master data alone |
| Which arrival date to trust (`F-51`) | Both are shown; neither wins |
| Minimum stock per material (`N-11`, D-037) | **No 🔴 low-stock state exists** |
| Expected weight per pack (`F-52`, D-048) | Order quantities stay in weight, not packs |
| Does the recipe include scrap? (`F-49`) | Requirements are the recorded figure |
| Cost reference freshness (`N-09`) | Age is stated; staleness is not classified |

### 14.3 The presentation rule — what makes it a trust surface

> **Every unset value states what the system cannot do until it is supplied.**

```
Working calendar                              Not set
  Order-by dates are counted in calendar days, so they can land on your
  weekend. Set this and I'll skip your non-working days.        [ Set up ]
```

**This turns configuration from a chore into an obvious gain**, and it is the exact opposite of an ERP settings tree. **It is also the same mechanism as §9.4's ⚪ design** — one pattern, two surfaces.

### 14.4 Preventing overwhelm

**Settings is ordered by what is blocking something**, not alphabetically or by module. Unset values that block a capability come first. **A setting nobody's answer depends on does not belong here at all.**

### 14.5 Read-only versus configurable

Ordinary users **read** these values and see their consequences — this is how the limits of an answer become understandable. Only an administrator changes them. **Every change is a decision with a consequence, so every change is recorded and attributed.**

### 14.6 Never in Settings

Feature toggles for incomplete work · database or performance tuning · anything an engineer would set · **anything with no stated consequence**.

### 14.7 Utilities inside Settings

**Import data** and **Data health** live here. Both are administrator tasks. Data health is rewritten for a manager: *what is missing, what it costs you, what to do* — not ledger reconciliation vocabulary.

---

## 15. Global object model — from the user's point of view

**Not database tables.** What the user calls each thing, what question it answers, and what they can do with it.

| User's word | Means | Answers | Connects to | Can do |
|---|---|---|---|---|
| **Product** | Something we make | *"Can I make this?"* | Recipe, materials | Check feasibility |
| **Material** | Something we buy and use | *"Do I have enough?"* | Stock, orders, products, savings | Check, order, inspect |
| **Recipe** ⚠ | What a product is made of | *"What does this need?"* | Product, materials | View, import |
| **Stock** | What is on the shelf now | *"How much, and how long will it last?"* | Material, movements | Inspect history |
| **Order** | Something we're waiting for | *"When does it arrive, is it late?"* | Supplier, material, shipment | Chase, inspect |
| **Supplier** | Who we buy from | *"Are they reliable?"* | Orders, materials | View performance |
| **Production request** | A question you asked | *"Can I make X?"* | Product, materials, orders | Ask, re-ask |
| **Risk** | Something that could hurt you | *"What could go wrong?"* | Any of the above | Understand, act |
| **Saving** | Money you could stop losing | *"What's it worth, how solid?"* | Material, orders, evidence | Approve, reject, investigate |
| **Evidence** | Why we're saying this | *"How do you know?"* | Saving, risk, answer | Inspect |
| **Setting** | A fact about your factory | *"What does this change?"* | Everything it unlocks | Supply, change |
| **You** | The person using it | *"What can I do?"* | Your activity | View |

### 15.1 Words that exist in the engine and not in this table

**Finding · Opportunity · Exposure · Observed cost · Mechanism · Movement · Ledger · Provenance · Basis · Gate · Envelope · Contradiction.**

Each is real, correct and load-bearing. **None is a user object.** They appear only at Layer 4, and several never appear at all.

⚠ **`Finding` collapses into `Saving` at the interface.** The engine's three finding classes are a rigorous distinction the user does not need: what they need to know is *"this is money you could save"* versus *"this is money you already spent"* versus *"this is a risk we can't price."* **Three plain phrasings replace three class names.**

---

## 16. Core journeys

Each is measured in **interactions to the decision** — the metric that matters.

### Journey 1 — Manager discovers a stock risk

```
START    Today
GOAL     Understand a stock risk and act on it

1  Today shows: "Polymer resin runs out before your next delivery."
   with the action and the consequence.                    ← DECISION POSSIBLE HERE
2  "Why?" expands: 10,370 kg on hand, ~284 kg/month usage, next
   delivery 15 Feb, cover runs to 3 Feb.
3  Click the material → Stock detail, that material, that risk.
4  "Show the numbers" → movements and conversions.

INTERACTIONS TO DECISION   0
FAILURE STATES             No usage history → ⚪ with the missing input named
                           No lead time → ⚪, and Settings offers the fix
PROGRESSIVE DISCLOSURE     Steps 2 and 4
```

### Journey 2 — Buyer sees an order at risk

```
START    Today or Orders
GOAL     Understand an order risk and chase it

1  "Curing agent may stop production. Chase PO-1008 with Adriatic
   Polymers."                                              ← DECISION POSSIBLE HERE
2  "Why?" expands: 5,000 kg held at Alexandria customs since 28 Dec;
   the carrier has already moved the date once.
3  "What does it affect?" → the material, its cover, what it blocks.
4  "Show the numbers" → shipment, milestones, ETA history, the PO.

INTERACTIONS TO DECISION   0
FAILURE STATES             No milestones → state late, say the cause is unknown.
                           NEVER invent a reason.
KEY POINT                  All four facts exist today across three tables.
                           This journey is assembly, not new capability.
```

### Journey 3 — Production manager asks "Can I make 10,000?"

```
START    Make
GOAL     Get an answer and resolve what's missing

1  Choose product → quantity → (optional date) → Check
2  🟡 At risk. "You can make this only if 3 deliveries arrive."  ← DECISION HERE
3  Per material: what's short, what to do, warnings that change the action.
4  "Why?" → requirement vs stock vs incoming.
5  From a short material → Stock (carrying the shortfall) or
   Orders (carrying the need-by date).

INTERACTIONS TO DECISION   1 (the Check)
FAILURE STATES             No recipe → ⚪ naming the product
                           Component made in-house → ⚪ naming it, others still shown
                           Unconvertible unit → ⚪ for that material only
⚠ GAP                      No path from "order 4,500 kg" to a draft order.
                           §11.5. Belongs to the UI phase.
```

### Journey 4 — Manager investigates a saving

```
START    Today or Savings
GOAL     Decide whether a saving is real

1  "Rush shipping on polymer resin is costing about 1.38M EGP a year."
2  "What would fix it?" → "Change its expected delivery time from 18
   to 38 days."                                            ← DECISION POSSIBLE HERE
3  "Why do you think so?" → 4 rush shipments, each slower than the 18
   days on file; had it been 38, none would have been needed.
4  "Show the evidence" → gates, the orders, the rates, provenance.
5  Approve · Reject · ask someone else.

INTERACTIONS TO DECISION   1
FAILURE STATES             Adjudicator not independent → STATE which parties
                           could not be checked (Q-13). Never silently allow.
KEY POINT                  Every word of steps 1–3 exists today, beneath a raw
                           mechanism enum and a 21-decimal number.
```

### Journey 5 — Alert → detail → action → return

```
1  Today: an attention item.
2  Click → the relevant area, filtered to that subject, with the
   originating question shown as the return path.
3  Act.
4  Return → Today, with that item resolved or acknowledged.

⚠ CRITICAL   The return states the QUESTION, not the page name:
             "← back to what needs my attention"
             A user who loses their place stops trusting the flow.
```

### Journey 6 — Administrator supplies a factory fact

```
START    Anywhere a ⚪ or a blocked capability appears
GOAL     Supply a value and understand what it changed

1  ⚪ names the missing input and offers the fix.
2  → Settings, at that setting, stating what it unlocks.
3  Supply it.
4  Confirmation states WHAT CHANGED:
   "Saved. I can now warn you before mineral filler runs out."
5  Return to where they came from.

INTERACTIONS               2 from the point of discovery
⚠ CRITICAL                 Step 4 is the whole point. A setting saved without
                           a stated consequence is an ERP form field.
```

---

## 17. Cross-module connections

> **The user must never feel they are moving between modules.**

| From → To | Trigger | Carries | Never lost |
|---|---|---|---|
| Today → Stock | Material at risk | Material + risk | Why it was flagged |
| Today → Orders | Order late | Order + risk | The consequence |
| Today → Make | Production may be blocked | Product + quantity, if known | The originating concern |
| Today → Savings | A decision is waiting | The saving | That it came from Today |
| Stock → Orders | *"Is this handled?"* | Material | The shortfall that prompted it |
| Stock → Make | *"Can I still produce?"* | Material | Which material asked |
| Make → Stock | Material short | Material + **the quantity short** | The production request |
| Make → Orders | Supply late | Material + **need-by date** | Lateness is measured against *that* date |
| Make → Savings | Opportunity conflicts | Material | That an order was being considered |
| Orders → Stock | *"What will this give me?"* | Material + arrival | The order |
| Savings → Orders | *"Where does this come from?"* | The expedited orders | The saving being examined |
| Savings → Stock | *"Which material?"* | Material | The saving |
| Any ⚪ → Settings | Missing input | Which setting, and what it unlocks | Where the user came from |

### 17.1 The three binding rules

1. **Context carries.** Arriving at Stock from a shortfall shows *that* material with *that* shortfall — never an unfiltered list.
2. **The originating question is visible and returnable**, phrased as the question.
3. **A filtered view says so and clears in one interaction.**

### 17.2 The connection that matters most

```
Savings  ←→  Orders
```

Five orders carry `expedited AIR`; that flag **is** the 1.38M figure. **Connecting them is what makes the number believable** — it converts a statistic into five orders the buyer personally placed.

---

## 18. Information density strategy

**Density is a function of task, not a house style.**

| Area | Density | Why |
|---|---|---|
| **Today** | **Low** | It is read under time pressure, often before anything else. Its job is triage. At most 3 decisions (§8.4) |
| **Stock** | **Medium–high** | A genuine comparison task across many subjects on the same dimensions. A manager scanning 200 materials needs rows, not cards |
| **Item detail** | **High, disclosed** | The user is deliberately deep in one subject. Everything may be here — **behind two expansions, never all at once** |
| **Orders** | **Medium** | Fewer subjects than Stock, more state per subject. Each order carries risk, reason and action |
| **Order detail** | **High, disclosed** | As item detail |
| **Make** | **Very low, then medium** | The answer is one line. The materials list is medium. The calculation is high and hidden |
| **Savings** | **Low now, medium later** | One finding. Density must not be manufactured — it grows with the data |
| **Settings** | **Low** | Each setting is a decision with a consequence. A dense settings page is how consequences get skipped |
| **Profile** | **Low** | Little to say; saying it clearly matters more than saying much |

### 18.1 The density test

> **Count the things on screen that could change what the user does next.**
> **More than three at Layer 1, and the screen has failed to prioritise.**

Density at Layers 3 and 4 is unbounded — **that is what the layers are for.**

---

## 19. The "user never has to…" list

Derived from the actual product, not generic.

**Never has to calculate:**
1. Whether stock is enough for a production run
2. How much to order
3. How long stock will last
4. Whether an order arrives in time to be useful
5. The difference between a promised date and an actual one
6. How much of a requirement incoming supply covers
7. Unit conversions between recipe, stock and purchase units
8. Whether a catch-weight quantity is nominal or actual

**Never has to join or assemble:**
9. A PO, a shipment, a customs milestone and an ETA to see one order's risk
10. Stock and open orders to know if a shortage is handled
11. A material and its products to know what a shortage blocks
12. A saving and the orders that generated it
13. Two screens to understand one problem

**Never has to interpret:**
14. A decision ID, factory-question ref, or mechanism name
15. Basis or provenance vocabulary
16. A lifecycle or evidence-ladder enum
17. A chart, when the system could state the conclusion
18. A raw quantity's precision to judge whether it is meaningful
19. Whether a blank cell means zero, unknown, or not applicable

**Never has to search for:**
20. What needs attention today
21. Which of their materials the system cannot judge, and why
22. What the system still needs from them

**Never has to tolerate:**
23. A blank screen while something loads
24. An unstyled crash
25. A confident number over data the system knows is stale
26. Advice that contradicts other advice in the same product

---

## 20. The "system must always…" list

**Answer and act:**
1. Answer before explaining
2. Show the next action when one exists — and say so when none does
3. State the consequence of not acting, or state that it is unknown
4. Rank by urgency derived from observed values, never an assigned score
5. Recommend, and let the human commit

**Be honest:**
6. Distinguish 🔴 *no* from ⚪ *can't say*, visually and verbally
7. Name the specific missing input, never "insufficient data"
8. Never render a missing value as zero
9. Never invent a quantity, date, threshold or urgency
10. State when a figure rests on something the user supplied rather than something measured — **when it changes the decision**
11. Mark demo data structurally, unmissably, undismissibly
12. Say when two of its own recommendations conflict

**Stay clear:**
13. Keep internal vocabulary out of the primary interface
14. Round at one enforced boundary
15. State the unit on every quantity
16. Keep technical detail exactly one interaction away
17. Carry context across every navigation
18. Use the same four states, with the same meanings, in every area

**Stay correct:**
19. Preserve every financial figure unchanged by interface work
20. Never let a presentation change alter a calculation
21. Keep the evidence reachable for every number it asserts

---

## 21. Competitive differentiation

**Not "our UI looks nicer."** Five structural mechanisms, each traceable to something already built.

### 21.1 The system finds the problem; the user does not search

Traditional ERP is a **retrieval** system: you must know what to look for. *Today* inverts this — the product opens by saying what is wrong. **Mechanism:** urgency is computed from observed relationships (cover versus lead time, arrival versus need date) and drives default order everywhere (§7.4).

### 21.2 The join happens in the engine, not in the user's head

Oracle-class systems put a PO on one screen, a shipment on another, customs on a third. **Mechanism:** one incoming order is one object carrying its own risk, reason and action (§10.2). **All four facts already exist; only the assembly is new.**

### 21.3 "I don't know" is a first-class, productive answer

Every ERP renders a physical count, a stale master-data field and a forecast as the same black text. **Mechanism:** provenance in the value model — *a property of construction, not a feature, and not retrofittable*. **And ⚪ carries its own remedy (§9.4), which turns honesty into onboarding.** No competitor does either half; nobody does both.

### 21.4 The system knows its own master data is wrong

> *"Your file says 30 days. The last 4 deliveries took 38."*

Every ERP holds both numbers and shows only the master one. **Mechanism:** observed lead time is displayed as a count and never substituted into the calculation (D-056). **One sentence, no competitor says it, and it costs us nothing — the number is already computed.**

### 21.5 Configuration is a gain, not a gate

ERP implementations front-load hundreds of settings before value appears. **Mechanism:** the product works with what it has, states per item what it cannot do, and offers each fix with its payoff (§14.3). **Seven questions, not seventy** — and each one arrives at the moment its absence is felt.

### 21.6 The honest limit

We do **not** compete on breadth. Odoo and Oracle have modules this product will not have. **Any claim of general superiority loses the first serious evaluation.** The defensible claim is narrow and true:

> **Traditional ERP tells you what it computed.
> This tells you what to do, why, and how much of it we actually know.**

---

## 22. Anti-complexity audit

I attacked each proposal in this blueprint against the ten questions in §24 of the brief. Six things failed and were changed or cut.

| # | Proposal | Failure | Resolution |
|---|---|---|---|
| **1** | "What I still need" as a dashboard section | Adding a fourth primary block, breaking the three-decision limit | **Cut as a block.** Appears only when it blocks something the user asked for, as one line (§8.3) |
| **2** | Grouping in Stock (by supplier, by type) | An ERP feature added because ERPs have it. Grouping serves reporting; this is a worklist | **Cut** (§9.6) |
| **3** | A notification system | A second inbox competing with *Today* for the same job | **Cut** (§7.7) |
| **4** | Charts in Savings | A chart gallery over **one row**. Decorative by definition | **Cut** until a written question needs one (§12.3) |
| **5** | "Money" as a nav label | Over-promises: implies costing and margin, which D-008 gave to finance | **Renamed** *Savings* (§5.4) |
| **6** | "Incoming" as a nav label | Elegant and hard to find. A buyer looks for "orders" | **Renamed** *Orders* (§5.4) |

### 22.1 What survived and why

**The four states everywhere.** Tested for over-engineering — could it be three? No: ⚪ versus 🔴 is the product's sharpest honesty and its clearest differentiator.

**Two disclosure levels, not three.** Tested — a third would let engineers defer decisions about what matters.

**A table for Stock.** Tested against cards. Comparison across many subjects on identical dimensions is the one case a table wins.

### 22.2 The five-second test, applied to each proposed screen

| Screen | Understood in 5 seconds? |
|---|---|
| Today | ✅ *"Two things need me, and here's the first."* |
| Stock | ✅ *"These need attention, these are fine, these I can't judge."* |
| Orders | ✅ *"Three coming, one is late."* |
| Make | ✅ Already passes today |
| Savings | ✅ *"One saving worth 1.38M, needs my decision."* |
| Settings | ✅ *"Three things missing, each says what it unlocks."* |
| Profile | ✅ Trivially |

### 22.3 The remaining honest risk

⚠ **Stock will be mostly ⚪ at go-live.** §9.4 makes that productive rather than empty, but it is a real first-impression risk and the mitigation is a design obligation, not a guarantee. **This must be tested with the pilot factory rather than assumed.**

---

## 23. Screen-by-screen text wireframes

**No visual design. Structure and content only.**

---
```
TODAY

Primary user:      Inventory manager
Primary question:  What do I need to know or do today?

LAYER 1 — ANSWER
  One line: the state of the factory.
  "Two things need your attention." / "Nothing needs you today."
  When coverage is thin: what the system can and cannot watch (§8.7).

LAYER 2 — ACTION
  At most THREE attention items. Each carries:
    what it is · what to do · what happens if you don't
  Plus a count of anything else: "3 more, none urgent."

LAYER 3 — EXPLANATION
  "Why?" expands in place on each item.

LAYER 4 — EVIDENCE
  Not on this page. Reached by entering the item's own area.

Primary actions:    Act on an attention item · enter its detail
Secondary actions:  See all attention items · ask a production question
Navigation:         Into Stock, Orders, Make, Savings — carrying subject and reason
What must NOT appear:
  methodology · decision or question IDs · basis labels · zero counters ·
  database statistics · charts · a card grid that is really navigation ·
  any number that would not change today's behaviour
```
---
```
STOCK

Primary user:      Inventory manager (buyer secondary)
Primary question:  What do I have, and what should I worry about?

LAYER 1 — ANSWER
  One line per material, ordered by urgency:
    state · name · how much · how long it lasts · what's coming
  ⚪ names its specific missing input (§9.4).

LAYER 2 — ACTION
  On rows needing it: "Order 4,500 kg" · "Chase PO-1008" ·
  "Add a delivery time" — never a generic "review".

LAYER 3 — EXPLANATION
  "Why?" expands: usage rate, cover, incoming, need dates.

LAYER 4 — EVIDENCE
  In item detail, not the list.

Primary actions:    Order · chase · supply a missing fact · open a material
Secondary actions:  Search · filter to what needs attention · change sort
Navigation:         → item detail · → Orders (that material) · → Make
What must NOT appear:
  Reserved as a column while structurally zero · basis · ledger vocabulary ·
  a code-first layout · "excess" as a label (A-18 unresolved)
```
---
```
STOCK — ITEM DETAIL

Primary user:      Inventory manager
Primary question:  Everything about this one material.

LAYER 1 — ANSWER
  State, current quantity, and the single most important thing about it.

LAYER 2 — ACTION
  What to do about this material, if anything.

LAYER 3 — EXPLANATION
  Usage over time · cover · incoming with dates · what it's used in ·
  what its delivery time is and where that number came from.

LAYER 4 — EVIDENCE
  Movement history · lots and serials · unit conversions ·
  quality-hold breakdown · source documents · what we know and don't.

Primary actions:    Order · chase an order · supply a missing fact
Secondary actions:  Check feasibility of a product using it
Navigation:         ← the list, or wherever the user came from, by question
What must NOT appear:
  everything at once. Layers 3 and 4 are disclosed, not stacked.
```
---
```
ORDERS

Primary user:      Buyer
Primary question:  What am I waiting for, and what could hurt me?

LAYER 1 — ANSWER
  One line per OPEN order, ordered by risk:
    state · material · quantity · supplier · expected arrival
  History is a separate, deliberate view.

LAYER 2 — ACTION
  "Chase Adriatic Polymers" · "Nothing to do, it's moving" ·
  the consequence where computable.

LAYER 3 — EXPLANATION
  Where it is · what moved and when · what it affects.

LAYER 4 — EVIDENCE
  Shipment, milestones, full ETA history, the PO, receipts.

Primary actions:    Chase · open an order
Secondary actions:  Order history · supplier performance · search
Navigation:         → the material · → what it blocks
What must NOT appear:
  three parallel tables the user must join · completed orders mixed into
  open ones · an ETA shown as an arrival · anything implying live tracking
```
---
```
ORDERS — ORDER DETAIL

Primary user:      Buyer
Primary question:  What is happening with this order, and what do I do?

LAYER 1 — ANSWER   Its state, in one line, with why.
LAYER 2 — ACTION   Chase, re-plan, or nothing — with the consequence.
LAYER 3 — EXPLANATION
  Timeline: ordered → promised → revised → milestones → expected.
  Which date is authoritative and what it's based on.
  What this order is holding up.
LAYER 4 — EVIDENCE
  Every ETA revision preserved · receipts including partials ·
  supplier's record on this material · the source document.

Primary actions:    Chase · mark chased
Secondary actions:  See the material · see what it blocks
What must NOT appear:
  a fabricated reason for lateness · a promised and an ETA date silently merged
```
---
```
MAKE

Primary user:      Inventory manager / buyer   (⚠ C-02: no production role exists)
Primary question:  Can I make what I need?

LAYER 1 — ANSWER
  🟢🟡🔴⚪ + one sentence. No numbers, no codes, no dates.

LAYER 2 — ACTION
  What's missing, one line each, with what to do.
  Warnings that CHANGE the action: lead-time doubt · conflicting saving · demo data.

LAYER 3 — EXPLANATION
  Why, in one line. Plus stated assumptions (calendar convention).

LAYER 4 — EVIDENCE
  Per material: requirement · on the shelf · on hold · on the way · to order.
  Recipe quantities, conversions, lead-time source, supply detail.

Primary actions:    Check · (⚠ MISSING: create a draft order from the answer)
Secondary actions:  Re-ask with a different quantity or date
Navigation:         → Stock (carrying the shortfall) · → Orders (carrying need-by)
What must NOT appear:
  recipe/BoM terminology · conversion mechanics · provenance · gates ·
  a fabricated deadline · ⚪ styled as 🔴
```
---
```
SAVINGS

Primary user:      Inventory manager · adjudicator
Primary question:  Where can we save, and what needs my decision?

LAYER 1 — ANSWER
  One figure, rounded, with one line on how solid it is.
  Then: what needs a decision from you.

LAYER 2 — ACTION
  Approve · reject · investigate. Per saving.

LAYER 3 — EXPLANATION
  What to change, and why we think it would work — the intervention
  and the counterfactual, in plain words.

LAYER 4 — EVIDENCE
  Gates · the specific orders · rates · provenance · what's excluded and why.

Primary actions:    Approve · reject
Secondary actions:  See the material · see the orders behind it
Navigation:         → Orders (the expedited ones) · → Stock (the material)
What must NOT appear:
  ⚠ NO CHARTS — one finding (§12.3) · lifecycle or ladder enums ·
  mechanism identifiers · unrounded figures · a range starting at 0.00
```
---
```
SETTINGS

Primary user:      Administrator (all users read)
Primary question:  How does my factory work, and what does the system still need?

LAYER 1 — ANSWER
  What is missing and what it blocks — ordered by what it blocks.
  "3 things would let me help you more."

LAYER 2 — ACTION
  Supply each value. Each states what it unlocks.

LAYER 3 — EXPLANATION
  What this setting affects and where it is used.

LAYER 4 — EVIDENCE
  Change history: who set it, when, what it was before.

Primary actions:    Supply or change a value
Secondary actions:  Import data · data health
Navigation:         ← back to wherever the ⚪ was, by question
What must NOT appear:
  an alphabetical settings tree · feature flags · engineering knobs ·
  any setting with no stated consequence
```
---
```
PROFILE                                    ⚠ BLOCKED on authentication

Primary user:      Any
Primary question:  Who am I, and what can I do?

LAYER 1 — ANSWER   Your name, your role in plain words.
LAYER 2 — ACTION   None. Profile is not a task surface.
LAYER 3 — EXPLANATION   What your role lets you do, and what it does not.
LAYER 4 — EVIDENCE      Your recent activity, including questions you asked.

What must NOT appear:
  factory configuration (that is Settings) · role enum names · permission matrices
```
---

## 24. Acceptance criteria

### 24.1 Automatable with mechanisms that already exist

| # | Criterion | Method |
|---|---|---|
| 1 | Zero vocabulary violations on every page | The Block 9 guard, extended. **29 today** |
| 2 | No component performs arithmetic or renders a raw stored value | Source-tree assertion, as the D-055 firewall test already does |
| 3 | Every route has a loading and an error state | File existence |
| 4 | The saving headline is unchanged by all interface work | Snapshot — **passing today** at `0.00 – 1,383,868.67` |
| 5 | No feasibility path writes to any finding or ledger table | Already asserted; must keep passing |

### 24.2 Reviewable per screen

| # | Criterion |
|---|---|
| 6 | The first sentence is actionable or conclusive |
| 7 | A correct decision is reachable with everything below the first block covered |
| 8 | The first row of every list is the one to look at first |
| 9 | Every ⚪ names its specific missing input and, where fixable, offers the fix |
| 10 | Every action states what · how much · when · why — or which is unknown |
| 11 | No problem requires two pages to understand |
| 12 | Every counter would change behaviour if it doubled |
| 13 | Context carries across every navigation, and the return states the question |

### 24.3 The test that matters

> **Show any screen to someone who has never seen the product.
> Within five seconds they say what the situation is and what they would do.**

**One of seven passes today. This blueprint is honoured when all of them do.**

---

## 25. Blocked, unknown, and in conflict

### 25.1 Conflicts with locked decisions — recorded, not resolved

| ID | Conflict | Status |
|---|---|---|
| **C-01** | The brief asks for a **management/executive user**. `02-first-release-scope.md:162` explicitly defers the executive experience; the build plan lists *executive dashboard* as out of scope | ⚠ **Not designed for.** Needs a product-owner decision |
| **C-02** | The brief lists a **production manager**. D-051 locks five roles; D-058 declined to create `PRODUCTION_PLANNER` because production execution is out of scope | ⚠ **Make is designed for the inventory manager and buyer.** Extending D-051 is a decision, not a design |

### 25.2 Open questions this blueprint raises

| ID | Question | Why it cannot be defaulted |
|---|---|---|
| **O-01** | Should a 🔴 feasibility answer become an attention item on *Today*? | ⚠ **D-055 forbids persisting an answer as anything a calculation reads.** A dashboard that surfaces past answers is reading them. Either the dashboard re-asks a stored *question* (permitted — the question is not the answer), or it does not show them. **Needs a decision** |
| **O-02** | Can *Today* rank a stock risk against an order risk against a saving? | Ranking across kinds needs a comparability rule. Ranking **within** a kind is derivable today. **Recommended: group by kind, rank within, do not interleave** |
| **O-03** | What does "cover in days" use as its usage rate? | `Q-14` chose a 12-month window for the offset **because two figures were subtracted**. That reasoning does not transfer. **Needs a decision before Stock is built** |
| **O-04** | Does a 🔴 in Stock require a stated requirement to exist? | §9.3 says 🔴 comes from a real question in Make. Without one, the strongest available state is 🟡. **Confirm this is acceptable** |

### 25.3 Blocked by missing data or capability

| Blocked | By | Consequence |
|---|---|---|
| Stock states for 7 of 8 materials | Missing lead times and usage history | ⚪ with the fix offered (§9.4) |
| 🔴 low-stock state | `N-11`, D-037 — minimum stock is a factory policy | No 🔴 from a stock level alone |
| "Excess" as a label | `A-18` unresolved | State the observation, never classify |
| Savings comparisons and trends | 1 finding, 0 outcomes | Queue and translation only |
| "Did our decisions work?" | 0 outcomes; D-022's 12-month window | Not designed |
| Profile | Authentication (`A-19`, `A-20`) | Designed, not buildable |
| Enforcing who may change a setting | Same | Settings readable; write-control blocked |
| Draft order from a feasibility answer | Not built | Journey 3 stops one step short |

---

## 26. What should happen in Block 13

**Recommendation: Block 13 is the visual design system — and nothing else.**

The information architecture is now defined; what is undefined is how it looks. Building screens before the visual system exists means designing it seven times.

**Block 13 should produce:** the four state treatments (colour, mark, word — with ⚪ neutral and never red) · type scale and hierarchy for the four layers · the disclosure pattern · list, card and table treatments at each density · the empty, loading, error and demo treatments · responsive behaviour at the two breakpoints that matter · **and the formatting module that Law 9 requires**, since it is presentation infrastructure rather than a screen.

**Then Block 14 builds screens**, in this order, and the order is derived:

```
1  Make        Already passes. Rebuild first to prove the design system
               against a known-good screen rather than a broken one.
2  Today       Highest impact, smallest surface.
3  Stock       Largest gap between what exists and what is needed.
4  Orders      The sharpest single failure (the customs join).
5  Savings     Translation of an excellent detail page.
6  Settings    Unblocks the ⚪ story that Stock depends on.
7  Profile     Blocked on authentication.
```

⚠ **Before Block 13 begins**, four decisions should be taken: **C-01, C-02, O-01 and O-03**. C-01 and C-02 change who screens are for; O-01 changes what *Today* contains; O-03 changes what Stock can compute. **The rest can be settled during design.**

---

*Blueprint proposed 2026-08-10. Information architecture only — no visual design, no implementation. Governed by `23-INTERFACE-CONTRACT.md`. Changes no domain decision and no calculation.*
