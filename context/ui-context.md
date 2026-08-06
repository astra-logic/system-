# UI Context

> **Phase:** Planning. **No UI is to be designed or built yet.** (Bible §2, §57)
>
> This file records the UI *principles already committed to* by the Bible, and marks what remains undecided. It is not a design system, and must not be treated as one.

---

## Committed principles (Bible §6–§24, §45)

**Standard.** Apple as a *design philosophy* benchmark — clear, calm, premium, human, predictable, focused, cohesive. Explicitly **not** a visual cloning target. (§6, §47)

**The three-second rule.** Every important screen answers, quickly: Where am I? What am I looking at? Is something wrong? What needs attention? What next? (§9)

**Decision-first.** Organise around the decision the user is making, not around database entities. (§10)

**Progressive disclosure.** Decision → Explanation → Evidence → Detail → Expert controls. Simple by default; expert users fully served. (§11, §43)

**One primary action** per important screen; secondary actions visually subordinate. (§12)

**Information density.** High information density without high cognitive density. Dense data is fine; dense clutter is not. This is a manufacturing tool, not a consumer app. (§14)

**Colour is semantic only.** Never decorative. Strong emphasis is reserved so that critical genuinely reads as critical. (§17, §45-7)

**Motion is functional only.** The interface should feel alive, not animated. (§19)

**Feedback always.** The user never wonders "did that work?" (§20)

**Errors explain**: what happened, why, what was affected, what to do, whether the system can recover. Never "Error 500". (§22)

**Empty states teach** — what this area is for, why it is empty, what to do next. Never look broken. (§23)

**Loading preserves context** — skeletons and local indicators over global spinners. (§24)

**Facts are distinguished from predictions, always**, and uncertainty is shown wherever it exists. (§45-14, §45-15) This is a UI obligation of D-002, and it is the one that most directly determines whether users trust the product.

---

## Binding UI rule from the domain model

**Every stock number must state which quantity it is** — on hand, reserved, available, incoming, projected. An unlabelled "Stock: 14,200" is a defect, not a simplification. (F3)

---

## Not yet decided

`UNRESOLVED` (P-12) — the exact visual design system: type scale, spacing scale, colour tokens, component inventory, layout grid.

`UNRESOLVED` — **dark-only vs themed.** Bible §18 favours a dark technical workspace. Challenge D4 argues this should be validated against real shop-floor conditions and the accessibility bar in §46 before being locked in. Semantic tokens (already required by §18) keep the option open at no cost.

`UNRESOLVED` — role-based complexity model, pending A-20.

`UNRESOLVED` (N-05) — **handheld/tablet on the floor, or desk?** This changes the interaction model fundamentally and bears directly on the dark-only question: shop-floor lighting is where dark UI most often fails.

---

## Settled by the first-release scope

**Primary user is the inventory / warehouse manager** (D-007). The interface is designed for the person accountable for stock being correct.

**Navigation is warehouse-first, not the §25 module list.** Approximately: Today · Receiving · Stock · Movements · Counting · Purchasing · Items · Suppliers. Bible §25's ten domains remain a long-term hypothesis and **must not be built toward now**.

**The Command Center (§40) is a warehouse command centre**, not an executive dashboard. Its question is *"what needs my attention in the warehouse today?"* — expected receipts, unresolved discrepancies, counts due, negative or blocked stock, items below reorder point, overdue POs.

**The executive experience (§41) is deferred.** Building it over data that has not yet earned trust would produce exactly the "dashboard-first fake ERP" §47 prohibits.

**Receiving and counting are the highest-stakes screens** for the three-second rule — used repeatedly, often standing, often with gloves.

**Absent capability is stated, not disguised.** No MRP, no production visibility, no BoMs in this release. Where a user might reasonably expect them, the interface says they do not exist rather than implying they might.

---

## Standing prohibition

No component, page, token or mockup is produced until the domain model is settled and a build plan is approved. Bible §56-01: **reality before UI.**
