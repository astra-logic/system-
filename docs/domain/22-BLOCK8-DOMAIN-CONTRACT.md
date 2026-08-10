# Block 8 — Production Feasibility: domain contract for implementation

**Date:** 2026-08-10 · **Status:** `LOCKED` · **Governs:** Block 9
**Decisions:** D-054 · D-055 · D-056 · D-057 · D-058 · **Analysis:** `21-BLOCK8-PRODUCTION-FEASIBILITY-DOMAIN-LOCK.md`

> **This document is the complete specification.** An engineer implementing Block 9 needs nothing else and **may invent no business rule.** Every rule carries the decision that authorises it. Where a rule is absent here, the answer is **⚪ CAN'T SAY** — never a default.

---

## 1. The capability in one paragraph

A user states a production quantity for a product, optionally with a date they need it by. The system explodes one level of the product's recipe, nets each component against stock on hand and supply already ordered, and answers four questions in plain language: **can you?** · **what's missing?** · **what should you do?** · **why?** It writes nothing, commits nothing, reserves nothing, and claims no money. It is a question answered, not a plan made.

---

## 2. Conceptual data — what must exist

**Described conceptually. Block 9 designs the schema; this document does not.**

### 2.1 Product structure (recipe) — new

| Field | Meaning | Rule |
|---|---|---|
| parent item | The product being made | Must be an existing item |
| component item | A material it consumes | Must be an existing item |
| quantity per | Quantity of component per **one** unit of parent | Positive. Basis `USER_DEFINED` |
| UoM | Unit the quantity per is expressed in | Convertible to the component's stock UoM, or the component is ⚪ |
| effective from | When this line becomes current | Effective-dated, per F5 |
| `is_demo` | **Marks a structure as demonstration data** | See §8 |

**Nothing else.** No scrap field, no yield, no operation, no work centre, no cost, no phantom flag, no alternate.

The structure is **self-referential-capable** — a component may appear as a parent elsewhere — **but Block 9 traverses one level only.** The shape costs nothing now and avoids a migration; no code walks the second level.

### 2.2 Feasibility answer — audit only

| Field | Rule |
|---|---|
| who asked · what they asked · when | Immutable |
| the answer produced, with `as_of` and each input's basis | Immutable snapshot |
| the product-structure version used | Code standard 13 as corrected |

> **Binding structural test (D-055): no calculation may join to this record.** Written by the answer path; read only by a human reading an audit trail. **A single query outside the audit view that references it is a defect.**

**No other new structure exists.** Everything else is read from `items`, `balances`, `movements`, `po_lines`, `receipts`, `uom_conversions`, `supplier_item_terms`, `eta_forecasts`, `opportunities`.

---

## 3. The algorithm

```
INPUT   product item · quantity Q · need-by date (OPTIONAL)

VALIDATE
    Q ≤ 0                                     → REJECT as malformed input
    Q fractional AND product integer-only     → REJECT as malformed input
    no recipe for the product                 → ⚪ (whole request)
    ─ Rejection is NOT ⚪. ⚪ means WE lack information.

EXPLODE (one level)
    FOR EACH component line effective at today:
        gross      = Q × quantity_per
        component has its own recipe          → ⚪ (this component)
        UoM not convertible to stock UoM      → ⚪ (this component)
        requirement = convert(gross, line UoM → stock UoM)
                      per item, versioned. NO GLOBAL DEFAULT.

POSITION  (F3, as constrained by D-050)
    available = on hand − quality hold        Reserved is structurally 0
                counts_as_on_hand locations only
                IN TRANSIT EXCLUDED — Q-10 is open

SUPPLY
    incoming  = Σ (ordered − Σ receipts) on POs in SENT | PARTIALLY_RECEIVED
                need-by given ⇒ only supply expected on or before it
                expected date = most recent observation; both shown if they disagree
                no expected date ⇒ counts toward quantity, contributes 🟡
                overdue ⇒ counts, flagged overdue
                DRAFT | APPROVED | CANCELLED contribute NOTHING

NET
    shortfall = requirement − available − incoming
    integer-only ⇒ round UP, ONCE, here and nowhere earlier

VERDICT PER COMPONENT
    requirement ≤ available
        AND no unrelated consumption observed → 🟢
        AND unrelated consumption observed    → 🟡   (D-057 cap)
    requirement ≤ available + incoming        → 🟡
    otherwise                                  → 🔴

OVERALL = highest precedence present:   🔴 ▸ ⚪ ▸ 🟡 ▸ 🟢
          Per-component detail is shown REGARDLESS of the overall verdict.

RECOMMENDATION  (per short component)
    quantity  = shortfall, in the component's stock UoM
                catch-weight: nominal pack count ONLY if F-52 is answered
    date      = need-by − lead time      (supplier-specific → master)
                no lead time             → no date, and say so
                no need-by date          → no deadline; state earliest arrival
                date already past        → 🔴, stating the gap in days

CONTEXT
    any open OPPORTUNITY on a recommended item is DISPLAYED beside it
    (a read at answer time — no signature stored, no finding created)
```

### 3.1 Provenance

Every figure carries the D-002 envelope and the **weakest basis** of its inputs. Because the user's quantity is `USER_DEFINED`, **no feasibility figure is ever `ACTUAL`.** It must never be presented as though it were.

### 3.2 The 🟢 cap, stated exactly

If the component shows consumption in the observed movement history that is unrelated to this request, the verdict is **🟡, not 🟢**, and the answer says so in plain language. Uses existing `movements` data only. Invents nothing. Conservative by construction (D-041: our exclusions run optimistic).

---

## 4. The user experience contract

**This is a domain contract, not a design.** No screen, no component, no layout, no colour beyond the four state markers.

### 4.1 Four layers

| Layer | Contains | Never contains |
|---|---|---|
| **1 — ANSWER** | The verdict and one sentence | Numbers, component codes, dates, sources |
| **2 — ACTION** | What to do, one sentence per material | Derivations, bases, alternative dates |
| **3 — REASON** | Why, in the user's terms | Formulas, basis labels, table names |
| **4 — DETAIL** | Requirement · available · incoming with sources · recipe lines · conversions applied · timing basis · lead-time comparison · assumptions · missing data · source records | — |

> **A correct decision must be reachable at Layer 2.** Layer 4 is available in one interaction and required for none.
> **Every number at Layer 3 or 4 resolves to its source record.**

### 4.2 Placement rule for disclosures

> **If a disclosure would change what the user does, it belongs at Layer 2. Otherwise Layer 3 or 4.**

| Disclosure | Layer |
|---|---|
| Verdict; 🟡's one-line dependency | 1 |
| Quantity, material, deadline | 2 |
| **Observed lead time exceeds the stated one** | **2** — a plain sentence |
| **An open Opportunity conflicts with the recommendation** | **2** — the user must not act without it |
| **The recipe is `DEMO` data** | **2** — see §8 |
| Calendar-days convention | 3 |
| Excluded stock (quality hold, in transit) | 3 when it changes the verdict, else 4 |
| Basis, `as_of`, weakest-basis chain | 4 |

### 4.3 Required copy

**Layer 1 — one of exactly four:**

```
🟢  Yes — you have enough material.
🟡  At risk — you can make this only if the deliveries on the way arrive on time.
🔴  No — 3 materials are short.
⚪  Can't say — we don't have the recipe for this product yet.
```

**Layer 2 — one line per material:**

```
RM-001   4,500 kg short   →  Order 4,500 kg by Tue 18 Aug
RM-004     120 kg short   →  Order 120 kg — no lead time on file, so we can't give you a date
RM-007   2,000 kg short   →  Order now. Earliest arrival is 9 Sept
```

**Layer 2 warnings, where they apply:**

```
⚠  The last 6 deliveries of RM-001 took longer than the 30 days on file (38–44 days).
⚠  There's an open saving opportunity on RM-001 that recommends holding less of it.
⚠  This uses a DEMO recipe, not your factory's data.
```

**Layer 3:**

```
You need 7,700 kg of RM-001. You have 3,200 kg, and an order for
4,000 kg is expected 9 Sept — after you need it.
```

### 4.4 Vocabulary

| Say | Never say |
|---|---|
| "You need 4,500 kg more." | "Net material deficit = 4,500 kg" |
| "This delivery is expected Friday." | "Expected supply event has ETA = Friday" |
| "We don't have the recipe for this product yet." | "⚪ INSUFFICIENT_DATA — BoM null" |
| "You have enough today, but this material gets used regularly." | "🟢 suppressed by unrelated-consumption cap" |
| "Component B is made in-house, so we can't see what it needs." | "Multi-level explosion not supported" |
| "Based on the 30-day lead time on file." | "Master lead time `USER_DEFINED`" |

**Banned from every user-facing string:** MRP · BoM · BoM explosion · net requirement · provenance · basis · envelope · contagion · mechanism · gate · counterfactual · annualisation · intervention signature · evidence partition · PAS · `INSUFFICIENT_DATA` · `USER_DEFINED` · finding · opportunity class · any D-number.

> **"BoM" is banned.** The user's word is **recipe**, or whatever `F-48` reports the factory calls it.

**One permitted exception:** *"We don't have enough information to answer this."* That is not terminology leaking — it is the most trust-building sentence the product can say.

---

## 5. Forbidden — a violation is a defect, not a preference

| # | Forbidden | Authority |
|---|---|---|
| 1 | Any percentage, threshold, score or confidence in the verdict | D-014 r15 · D-017 · D-045 · D-057 |
| 2 | Any invented calendar, holiday, yield factor, safety stock, service level or nominal→actual conversion | D-056 · D-057 · `N-11` |
| 3 | Any statistic derived from observed lead time and used **in** a calculation | D-056 |
| 4 | Any write path from feasibility into `opportunities`, or any join from a calculation to a feasibility record | D-055 |
| 5 | Any reservation, allocation or `Outgoing` row | D-050 · D-055 |
| 6 | Any silent update of a previously shown answer | D-055 |
| 7 | Any partial calculation presented as a complete verdict | D-054 · D-057 |
| 8 | Turning ⚪ into 🔴 | D-057 |
| 9 | Rounding the user's own stated quantity | D-057 |
| 10 | Any BoM cost roll-up | D-008 · D-054 |
| 11 | Automatic PO creation, supplier selection, order splitting, substitution | D-054 |
| 12 | Presenting demo structure as factory data | §8 |
| 13 | Routings · work centres · capacity · scheduling · work orders · WIP · backflush · MRP regeneration · MPS · persistent plans | D-054 |

---

## 6. Acceptance criteria

Block 9 is complete when each of these is a passing test. **They are the 36 adversarial cases of `21-…§20`, reduced to the assertions that distinguish a correct implementation from a plausible one.**

| # | Assertion |
|---|---|
| 1 | No recipe ⇒ **⚪**, never 🔴 |
| 2 | A component with its own recipe ⇒ **overall ⚪, naming it, with every other component still shown** |
| 3 | Missing UoM conversion ⇒ **⚪ for that component**; no global default is ever applied |
| 4 | One component ⚪ and another 🔴 ⇒ **🔴** |
| 5 | Enough on hand, no other consumption ⇒ **🟢** |
| 6 | Enough on hand, unrelated consumption observed ⇒ **🟡**, reason stated |
| 7 | Short with covering supply on the way ⇒ **🟡**; never 🟢 |
| 8 | Short, supply arrives **after** need-by ⇒ **🔴**, stating the gap in days |
| 9 | `DRAFT`, `APPROVED` and `CANCELLED` POs contribute **zero** |
| 10 | Open quantity is `ordered − Σ receipts`, never the PO quantity |
| 11 | Overdue PO counts, is flagged, and cannot produce 🟢 |
| 12 | Promised date and ETA disagree ⇒ **both shown**, neither overrides |
| 13 | Observed lead time exceeds the stated one ⇒ **displayed as a count**, and the calculation is unchanged |
| 14 | No lead time ⇒ **no date**, and the answer says why |
| 15 | No need-by date ⇒ **no deadline**; earliest arrival stated instead |
| 16 | Order-by date already past ⇒ **🔴** with the gap in days |
| 17 | Integer-only ⇒ rounds **up**, and **exactly once** — asserted against a multi-step conversion |
| 18 | Fractional quantity of an integer-only product ⇒ **input rejected**, not rounded, not ⚪ |
| 19 | Quantity ≤ 0 ⇒ **input rejected**, not ⚪ |
| 20 | Catch-weight ⇒ nets on `actual`; **no nominal pack count** produced without `F-52` |
| 21 | Quality-hold and in-transit stock are **excluded** |
| 22 | An open Opportunity on a recommended item is **displayed** |
| 23 | Repeating a request **recomputes**; it is not cached or deduplicated |
| 24 | A prior answer is **never mutated**; it carries `as_of` |
| 25 | **No row is written** to `opportunities`, `exposures`, `observed_costs`, `evidence_gaps`, `balances`, `movements` or any reservation structure by any feasibility path |
| 26 | **The headline Potential Annual Saving figure is byte-identical** before and after a feasibility run |
| 27 | Demo structure is **visibly marked** at Layer 2 |
| 28 | **No banned term appears** in any user-facing string — asserted as a test over the rendered strings, not a review convention |

**Assertions 25, 26 and 28 are the structural guards.** They are what make D-055's firewall and the product principle enforceable rather than aspirational.

---

## 7. Non-goals

Finite capacity scheduling · routings and work centres · Gantt or sequencing boards · work orders · WIP tracking · backflush · shop-floor terminals · MRP regeneration · master production scheduling · rough-cut capacity · pegging · where-used explosion · firm planned orders · time fences · planning bills · lot-sizing engines · forecast consumption · available-to-promise for customer quoting · multi-plant netting · alternate and phantom BoMs · co-products and by-products · BoM cost roll-up · **automatic purchase orders** · **saved production plans**.

**The two that will be requested and must still be refused.** *Automatic PO creation* — the moment the system creates orders it owns the consequence of every wrong lead time and stale recipe, and it converts the product from advisory to operational against D-011. *A saved production plan* — it looks like a small convenience; it is the MRP seed, and it breaks D-050 by becoming a commitment source.

---

## 8. Demo structure — the `F-48` fallback

No factory recipes exist yet, and `B-07` records that the pilot factory has no data. **The absence is represented, never filled.**

```
An item with no recorded structure returns ⚪ CAN'T SAY.
NOTHING is inferred. NO structure is generated for a real item.

The MVP seeds ONE recipe against the existing demo product, flagged
is_demo = true, and the product SAYS SO at Layer 2:

    ⚠ This uses a DEMO recipe, not your factory's data.

A demo structure NEVER attaches to an imported item.
A real item NEVER silently inherits one.
Removing demo data leaves every real item at ⚪ — the honest state.
```

**Why this is safe.** The demo structure exercises every path in §3 and every assertion in §6, so the contract is validated before factory data arrives. It cannot be mistaken for factory data, because the flag is on the record and the disclosure is at the layer the user reads to act. **This follows the existing demo-banner pattern already in the product.**

---

## 9. What Block 9 builds

1. Product-structure model, one level, effective-dated, with `is_demo`.
2. The §3 engine, pure and deterministic, returning the four states with per-component detail.
3. Provenance envelopes throughout; **weakest basis** propagated; ⚪ wherever an input is absent.
4. The audit-only answer record, with **no read path from any calculation**.
5. One ask-and-answer surface honouring §4's four layers and vocabulary.
6. The Opportunity-context lookup of D-055 rule 5.
7. Recipe import through the existing import path, with the existing validation discipline.
8. The §6 acceptance tests, **including assertions 25, 26 and 28**.

**Nothing else.** No dashboard change, no navigation redesign, no settings surface, no new role.

---

*Contract locked 2026-08-10. Governs Block 9. Amendable only by a recorded decision.*
