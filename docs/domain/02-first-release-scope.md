# 02 — First Release Scope

> **Status:** Draft 1, following the scoping decisions of 2026-08-06.
> **Depends on:** `01-factory-operating-model.md`
> **Still planning.** No code.

---

## The four decisions

| Question | Answer |
|---|---|
| Manufacturing type | **Mixed** — process/batch *and* discrete |
| Primary user | **Inventory / warehouse manager** |
| Wedge | **Inventory + procurement + cost** |
| Deployment | **Single site** |
| Valuation ownership | **An external finance system owns it. This system does not.** |

Each has consequences that are not obvious, and each closes some questions while opening others. Those consequences are the substance of this document.

---

## 1. What the product is, now that scope is fixed

> **A system that makes stock true, and turns that truth into better buying decisions with visible financial consequence.**

The primary user is the person responsible for stock being correct. The product's first job is to make their job possible; its second is to convert the resulting trustworthy data into procurement decisions. That ordering is deliberate — procurement intelligence built on unreliable stock is exactly the "unvalidated business logic" §47 forbids.

---

## 2. In scope

| Domain | Included | Notes |
|---|---|---|
| C1 Site | Yes | Single site, but site-scoped records retained (D-004) |
| C2 Locations | Yes | Full topology, typed locations, quality hold |
| C3 Products | Yes | Mixed: process *and* discrete item behaviour |
| C4 Suppliers | Yes | Master data and commercial terms |
| C7 Procurement | Yes | Requisition → PO → approval → send → receive |
| C8 Receiving | Yes | Including discrepancies and quality hold |
| C9 Inventory | Yes | The ledger. The core of the release. |
| C13 Cost | **Reference only** | See §4 — we consume cost, we do not own it |
| C5 Demand | **Proxy only** | See §5 |
| C6 Planning | **Partial** | Reorder point / min-max only. No MRP. See §5. |
| C11 Quality | **Hold only** | Receipt inspection producing a hold. No CAPA, no inspection plans. |

## 3. Out of scope

C10 Production · C12 Maintenance · full C11 Quality · MRP · capacity planning · routings · work centres · multi-site · **multi-currency *transacting*** (see the correction below) · AI features.

> ### ⚠ Corrected 2026-08-10 — D-054 (Block 8). **BoMs** were removed from this line.
>
> **Product structure (recipe)** — parent, component, quantity per, UoM, effective-from — is **in scope, for one purpose only:** answering a stated Production Feasibility question. See §3a.
>
> Everything else on this line is unchanged. **MRP as a planning method, capacity, routings and work centres remain out**, and planning remains reorder-point based.

> ### ⚠ Corrected 2026-08-08 — D-042. This line previously read *"multi-currency"* without qualification, and it contradicted a locked decision.
>
> ```
> OUT   MULTI-CURRENCY TRANSACTING — multi-currency ledgers, revaluation,
>       currency translation, reporting in more than one currency
>
> IN, and TIER 1
>       MULTI-CURRENCY CAPTURE and FX NORMALISATION — original amount +
>       currency + FX rate + rate date on every financial event (D-028),
>       normalised to a finance-owned policy rate for any cross-period
>       comparison (D-024)
> ```
>
> **Why the unqualified line was dangerous.** The factory is Egyptian and import-dependent; freight and imported material are commonly USD- or EUR-denominated while reporting is EGP. An engineer building single-currency from this line would record a USD freight invoice as an EGP number at that day's rate. Compared across an EGP devaluation, **a premium that is entirely currency movement presents as an operational deterioration** — the exact failure D-016 and D-024 exist to prevent.
>
> **And the rule that would otherwise be got wrong:** each historical amount is normalised at **the rate effective on its own effective date**, never at a single current rate. Applying today's rate to history erases the effect normalisation exists to isolate.

> ### ⚠ Superseded 2026-08-10 by D-054 (Block 8). Original text preserved below.
>
> **"BoMs are out, and this is load-bearing.** Without them there is no material requirements calculation, which is why planning is reorder-point based rather than MRP. That is a genuine capability limit and must be stated to users plainly rather than disguised."

## 3a. Product structure — admitted for feasibility only

**What changed, and what did not.** The clause above was load-bearing for a *consequence*: **planning is reorder-point rather than MRP.** That consequence is **unchanged.** Reorder point remains the only planning method, and historical consumption remains the only signal planning reads (D-010 as amended).

What is admitted is a **question-answering** structure, not a planning structure:

| In scope | Out, and staying out |
|---|---|
| Parent item · component item · quantity per · UoM · effective-from | Routings · work centres · capacity · scheduling |
| **One level** of structure per answer | Multi-level explosion |
| Read-only feasibility answers | Work orders · WIP · backflush · shop-floor reporting |
| A transient, user-stated production quantity | MRP regeneration · master production scheduling · persistent plans |
| — | **BoM cost roll-up** (D-008 gives valuation to finance) |
| — | Automatic purchase orders · supplier selection · substitution |

**The capability limit that remains, stated plainly:** the system answers *"can I make this with what I have and what is coming?"* It does **not** plan production, schedule it, or track it. Where a component has its own recipe, the answer is **⚪ CAN'T SAY**, naming the component — never a partial calculation presented as complete.

---

## 4. Consequence: finance owns valuation

This is the decision with the widest reach, and it changes the shape of the system rather than merely reducing it.

**What this system owns:** quantity truth. Every movement, every balance, every lot. It is authoritative for *what is where*.

**What this system does not own:** the valuation of that stock, journal entries, and the general ledger.

**What it therefore must do instead:**

1. **Hold a cost reference, not a cost calculation.** Item costs are imported from finance. They carry basis `USER_DEFINED` (imported) with an `as_of` date — never `CALCULATED`, because we did not calculate them.
2. **Propagate that basis honestly.** Every financial figure this system produces — capital tied up, carrying cost, excess stock value, potential savings — is derived from imported cost. Per D-002's contagion rule, none of it may present as more certain than the cost reference it rests on. **If the cost import is stale, every financial number in the product is stale, and the product must say so.**
3. **Emit a movement feed to finance** rather than posting entries itself. The valuation consequence of each movement is finance's to compute.
4. **Signal variances without booking them.** A receipt at a price different from the cost reference is a purchase price variance *signal* — useful for procurement decisions, visible in this system, booked in finance.

**What this decision buys:** D-005 shrinks dramatically. No three-method costing engine, no layer maintenance, no period-close accounting. This is a large, genuine reduction in the hardest part of the original scope.

**What it costs:** the financial-impact engine (§37) now depends on an integration. Its credibility is bounded by the freshness and granularity of imported cost. That bound must be visible in the product, not buried.

`NEW-01` **What is the integration contract with the finance system?** Which system, what cost granularity (standard cost per item? per site? actual?), what refresh cadence, push or pull, and does anything flow back? This now blocks all financial-impact work.

`NEW-02` **Is the movement feed to finance required in the first release, or is this system read-only against finance initially?** Read-only is far simpler and probably right for a first release.

---

## 5. Consequence: procurement without production

Procurement decisions need demand. Demand normally comes from production consuming materials against manufacturing orders — and production is out of scope. This gap must be closed deliberately rather than ignored.

**Material still leaves stock.** It is consumed by a factory that this release does not model. So the ledger needs an **issue-to-consumption** movement: material leaving a stock location for a consuming destination (cost centre, department, line) with a reason code, without a manufacturing order behind it.

**Demand is therefore historical, not planned.** The demand signal available in this release is *observed consumption over time*. This has hard consequences that must be stated in the product:

- Planning is **reactive, not predictive**. Reorder point and min/max on consumption history — reasonable, well-understood, and honest.
- **New items have no history and therefore no reliable reorder point.** `INSUFFICIENT_DATA` per D-002, not a fabricated default.
- **A demand step-change is invisible until it has happened.** If the factory wins a large order, history-based planning under-orders. The product must not imply foresight it does not have.
- **MRP is genuinely absent**, not deferred UI. ⚠ **Refined 2026-08-10 by D-054:** *requirements explosion for a stated quantity* is now available through Production Feasibility (§3a). What remains absent is **MRP as a planning method** — no time-phased plan is maintained, nothing regenerates when a supply date moves, and no forward demand is synthesised. **Asking a question is not planning**, and the product must not imply otherwise.

`NEW-03` Is consumption captured at item level only, or against a cost centre / department / line? The latter is more useful and only slightly more work at capture time — and it is nearly impossible to backfill later.

---

## 6. Consequence: mixed manufacturing

Even with production out of scope, "mixed" shapes the inventory foundations, because the item master and the ledger must serve both worlds from day one.

| Foundation | Consequence |
|---|---|
| F3 Item types | Both process materials (weight/volume, continuous quantity) and discrete goods (countable units) are first-class. Item type carries behaviour. |
| F6 UoM | Per-item density and weight conversions are **required**, not optional. A-05 catch-weight is now **likely yes** — see `NEW-04`. |
| F7 Tracking | `LOT` and `SERIAL` are **both needed**, per item. This confirms the per-item policy was correct rather than merely flexible. |
| F2 Ledger | Must handle fractional quantities (kg to three decimals) and integer units with equal precision. Quantity is decimal throughout; integer-only items are a validation rule, not a separate type. |

`NEW-04` **Are catch-weight items required?** (ordered in units, stocked/invoiced by actual weight) Common in mixed process operations. If yes, it must be in the ledger design from the start — it is not a later feature.

---

## 7. Consequence: the warehouse manager is the primary user

This settles questions the Bible left open in §25 and §40.

**Navigation is warehouse-first**, not the ten-domain module list of §25. The first release needs roughly: Today · Receiving · Stock · Movements · Counting · Purchasing · Items · Suppliers. The §25 list remains a long-term hypothesis and should not be built toward now.

**The Command Center (§40) is a warehouse command centre**, not an executive dashboard. Its top-level question is *"what needs my attention in the warehouse today?"* — receipts expected, discrepancies unresolved, counts due, negative or blocked stock, items below reorder point, POs overdue.

**The executive experience (§41) is explicitly deferred.** Building it now over data that has not yet earned trust would produce precisely the "dashboard-first fake ERP" §47 prohibits.

**The three-second rule applies hardest to the receiving and counting screens** — these are used repeatedly, often standing up, often with gloves on, sometimes on a mobile device.

`NEW-05` **Will warehouse users operate this on a handheld or tablet on the floor, or at a desk?** This changes the interaction model fundamentally, and it bears directly on the dark-only question in challenge D4 — shop-floor lighting is where dark UI most often fails.

---

## 8. What "done" means for this release

Adapting §55 to the wedge. The release succeeds when the pilot factory can:

1. See what stock exists, where, and in what state — and trust it.
2. Receive goods, including when the delivery is wrong.
3. Move, issue and adjust stock with every change traceable to a reason.
4. Count stock and see accuracy improve over time.
5. Know what to buy and when, with the reasoning visible.
6. Raise, approve and track purchase orders.
7. See capital tied up in stock, and where it is excessive — with the cost basis and its age clearly shown.
8. Trace any number back to the movements that produced it.

Point 8 is the one that determines whether the rest is believed.

---

## 9. New open questions raised by this scope

| ID | Question | Blocks |
|---|---|---|
| N-01 | Finance integration contract — system, granularity, cadence, direction | All financial-impact work |
| N-02 | Is the outbound movement feed in the first release? | Integration scope |
| N-03 | Is consumption captured against cost centre / line, or item only? | Ledger capture design — hard to backfill |
| N-04 | Are catch-weight items required? | Ledger and UoM design |
| N-05 | Handheld/tablet on the floor, or desk? | Interaction model, and the D4 dark-UI question |
| N-06 | Does the pilot factory have usable consumption history? | Whether reorder-point planning can function at go-live |

`N-06` is the sharpest of these. **Reorder-point planning without history produces nothing**, and a release whose planning layer returns `INSUFFICIENT_DATA` for every item is a release that appears broken on day one. If history is thin, initial reorder points must be user-entered and labelled `USER_DEFINED` — which is honest, and needs designing for deliberately.
