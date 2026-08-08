# 06 — Orders & Supply Movement — **TRACKED REQUIREMENT**

> ## ⚠ NOT DESIGNED. NOT A MECHANISM. NOT TO BE BUILT.
> **Status:** `TRACKED REQUIREMENT` — recorded 2026-08-07 so it cannot disappear from the product plan.
> **Explicitly NOT a saving mechanism.** It is a **management / visibility capability**.
> **Do not design it. Do not build UI. Do not create schemas. No workshop has been held.**

---

## Why this file exists

Recorded at the product owner's instruction during the Part 2.2 workshop. The requirement is real and must survive; the design is not started and must not be started.

## The requirement, as stated

The future system must be able to track the operational journey of an order, including where relevant:

- Purchase Order
- Supplier
- Item / material
- Quantity
- Agreed price
- Payment terms
- Expected delivery / ETA
- Shipment / movement status
- Current location where available
- Supplier location
- Port / logistics milestones where relevant
- Actual receipt
- Delay / exception
- Inventory impact

## The connection it should eventually make

```
ORDER → SUPPLIER → PRICE / TERMS → MOVEMENT → ETA → INVENTORY IMPACT → RISK → FINANCIAL IMPACT
```

## Classification

Per core-mission §12: **`ENABLER`**. It does not itself produce Potential Annual Saving. It supplies the operational visibility that saving mechanisms and the factory both depend on.

Under Bible §50 and §56-03, enablers precede intelligence — so this being an enabler is not a demotion. It sits alongside the ledger and the item master rather than alongside the saving engine.

## Observations recorded now, so they are not lost

**1. This overlaps substantially with capture the saving mechanisms already require.** Purchase order, supplier, item, quantity, agreed price, payment terms and actual receipt are already required by mechanism 01 (`F-01` … `F-10`) and mechanism 02 (`F-11` … `F-24`), and by the F10 capture contract (D-028). **This requirement is therefore not wholly additive** — a substantial part of it is the same capture viewed as a journey rather than as evidence. Estimating it as new work would overstate it; treating it as free would understate the genuinely new parts.

**2. The genuinely new parts** appear to be: shipment / movement status, current location, port and logistics milestones, and ETA as a maintained forecast rather than a static date.

**3. ETA is a forecast, not a fact.** Under D-002 it carries basis `FORECAST` and degrades anything computed from it. An ETA presented as a date, without basis, would breach the provenance rule.

**4. Port and customs milestones connect to mechanism 01.** `F-02` (customs demurrage capture) and `F-06` (how an expedite is recognised) both live in this territory. Whatever is decided here constrains what mechanism 01 can evidence.

**5. Nothing here is designed.** No entities, no states, no workflow, no screens. The bullet list above is the requirement as stated, not a model.

## 2026-08-08 — classification re-tested against Mechanism 03, and unchanged

**Still `ENABLER`. It produces no saving.** But Part 2.3 changed what depends on it, and the dependency is now sharper than "overlaps with existing capture."

| Element | Consumed by Mechanism 03 | If absent |
|---|---|---|
| **Receipt · actual arrival** | **The inventory position path itself** | The mechanism cannot compute at all |
| **Partial receipt** (`F-41`) | Subtype A's effective order quantity | ⚠ **The detector reads PO quantity instead, and recommends a change the factory has effectively already made. Fictional findings** |
| Ordered date → receipt date | The trough, via lead time | The trough cannot be located |
| Shipment | The freight-per-shipment offset (`F-43`) | Subtype A's net is `INSUFFICIENT_DATA` for imports |
| Open orders and ETAs | The deferral counterfactual | ⚠ **No pending order means no Opportunity at all** (D-033) |
| Expedite | Gates D-037's level-B claim | Safety-stock evidence stops one level lower |

> ⚠ **Point 1 above was previously understated.** This requirement was recorded as *"not wholly additive."* That remains true of the *fields*, but **evidentially it is now load-bearing**: a partial-receipt gap does not degrade Mechanism 03's output, it **falsifies** it. That is a different class of dependency from the ones recorded in 2026-08-07.

**The chain is still broken at *Actual Outcome*.** Procurement-side outcomes — price paid, freight paid, delivery timing, order counts, position path — are verifiable. Production-side outcomes are not (D-007). Subtype A's realization is entirely procurement-side, which is a further reason it is the defensible first slice.

**Nothing here is designed.** No entities, no states, no workflow, no screens. This section records dependency, not model.

## Status of open items

| | |
|---|---|
| Workshop held | **No** |
| Domain model | **None** |
| Decisions recorded | **None** |
| Build plan unit | **None** |
| Blocking anything | **No** |
