# Open Questions Register

> Per the Product Bible: *"Any ambiguous requirement must be identified as an open question rather than silently invented."*
>
> Nothing in this register has been assumed anywhere else in the project. Where a question blocks work, it says so.

**Status key:** `OPEN` unanswered · `PROPOSED` recommendation on the table, awaiting a decision · `ANSWERED` decided and recorded in `docs/decisions/decision-register.md`

---

## Tier 1 — Blocking. Product cannot be specified without these.

| ID | Question | Answer | Status |
|---|---|---|---|
| B-01 | Who is the primary user of the first release? | **Inventory / warehouse manager** | `ANSWERED` → D-007 |
| B-02 | What is the MVP boundary? | **Inventory + procurement + cost.** No production, maintenance, full quality, BoMs or MRP | `ANSWERED` → D-007 |
| B-03 | Discrete, process/batch, or mixed manufacturing? | **Mixed.** Item behaviour is per item, not per system | `ANSWERED` → D-009 |
| B-04 | Single site, multi-site, or multi-tenant? | **Single site**, records still site-scoped | `ANSWERED` → D-004 |
| B-05 | Is inventory truth an append-only movement ledger? | F2 — the foundation of traceability and §38 data trust | `PROPOSED` — yes → D-001 |
| B-06 | Does this system own valuation, or feed an existing finance system? | **Finance owns valuation.** This system owns quantity truth | `ANSWERED` → D-008 |
| B-07 | Is there a real pilot factory, and does it have usable historical data? | Determines whether reorder-point planning can function at go-live — see N-06 | `OPEN` |

---

## Tier 2 — Architectural. Needed before the relevant domain is built.

| ID | Question | Area | Status |
|---|---|---|---|
| A-01 | Balances projected synchronously or asynchronously? | F2 | `OPEN` |
| A-02 | Hard or soft reservation? | F3 | `OPEN` |
| A-03 | How is confidence defined and computed? | F4 | `OPEN` |
| A-04 | Who may close/reopen an accounting period? | F5 | `OPEN` |
| A-05 | Are catch-weight items required? | F6 | `OPEN` — **likely yes** under mixed manufacturing (see N-04) |
| A-06 | Is full lot genealogy required at first release? | F7 | `OPEN` — narrowed: no production means no input→output genealogy in release 1. Lot-level stock visibility only |
| A-07 | Costing method(s) to support: standard, moving average, FIFO? | F8 | `CLOSED` — finance owns valuation (D-008). No costing engine here |
| A-08 | Is standard cost per site or global? | F1/F8 | `CLOSED` — single site; cost is imported (D-008) |
| A-09 | Multi-currency at first release? | C1 | `OPEN` |
| A-10 | Location hierarchy fixed-depth or arbitrary? | C2 | `OPEN` |
| A-11 | Who owns item master data? | C3 | `OPEN` |
| A-12 | Minimum sample size before a supplier metric is shown? | C4 | `OPEN` |
| A-13 | Is there real sales-order demand, or forecast only? | C5 | `CLOSED` — demand is observed consumption (D-010) |
| A-14 | Which planning methodologies at first release? | C6 | `CLOSED` — reorder point / min–max only. No MRP (D-010) |
| A-15 | Is incoming inspection mandatory, per-item, or per-supplier? | C8 | `OPEN` |
| A-16 | Backflush or explicit material issue? | C10 | `DEFERRED` — production out of scope. Release 1 uses issue-to-consumption (D-010) |
| A-17 | Are labour/machine/overhead rates available, or is material cost the only real component? | C13 | `DEFERRED` to finance (D-008); relevant to N-01 granularity |
| A-18 | Thresholds defining aging, slow-moving, excess, dead stock, stockout risk | C9 | `OPEN` |
| A-19 | Technology stack and deployment architecture | Bible §54.21–22 | `OPEN` |
| A-20 | Permission and role model | Bible §54.20, §44 | `OPEN` |

---

## Tier 3 — Product and data questions from Bible §54 not yet covered above

| ID | Question | Status |
|---|---|---|
| P-01 | What is the first production scenario we optimise for? | `OPEN` |
| P-02 | Which modules are required for the first real factory deployment? | `OPEN` |
| P-03 | What data must be imported from Excel? | `OPEN` |
| P-04 | What data must be entered manually? | `OPEN` |
| P-05 | What data must come from integrations? | `OPEN` |
| P-06 | How is safety stock calculated? | `OPEN` |
| P-07 | How is demand uncertainty represented? | `OPEN` |
| P-08 | When is EOQ appropriate — and when is it misleading? | `OPEN` — see C6; treat with suspicion |
| P-09 | How is supplier reliability calculated? | `OPEN` — depends on A-12 |
| P-10 | Which financial metrics are authoritative? | `OPEN` |
| P-11 | Which AI capabilities are safe to introduce? | `OPEN` — depends on F4 |
| P-12 | What is the exact visual design system? | `OPEN` — see challenge D4 |
| P-13 | What user research / factory validation will be conducted? | `OPEN` |
| P-14 | What must be true before the first pilot factory can use the system? | `OPEN` |

---

## Tier 4 — New questions raised by the first-release scope

Full context in `docs/domain/02-first-release-scope.md`.

| ID | Question | Blocks | Status |
|---|---|---|---|
| N-01 | Finance integration contract — which system, cost granularity, refresh cadence, direction | All financial-impact work | `OPEN` |
| N-02 | Is the outbound movement feed to finance in release 1, or are we read-only initially? | Integration scope | `OPEN` |
| N-03 | Is consumption captured against a cost centre / line, or item only? | Ledger capture design — **very hard to backfill** | `OPEN` |
| N-04 | Are catch-weight items required? | Ledger and UoM design — must be decided before the ledger is built | `OPEN` |
| N-05 | Handheld/tablet on the floor, or desk? | Interaction model, and the D4 dark-UI question | `OPEN` |
| N-06 | Does the pilot factory have usable consumption history? | Whether reorder-point planning functions at go-live | `OPEN` |

**N-03, N-04 and N-06 are the urgent ones.** The first two are ledger-shaping and expensive to retrofit; N-06 determines whether the planning layer returns real numbers or `INSUFFICIENT_DATA` for every item on day one.

---

## Answered

| ID | Question | Answer | Recorded in |
|---|---|---|---|
| B-01 | Primary user | Inventory / warehouse manager | D-007 |
| B-02 | MVP boundary | Inventory + procurement + cost | D-007 |
| B-03 | Manufacturing type | Mixed | D-009 |
| B-04 | Deployment scope | Single site, site-scoped records | D-004 |
| B-06 | Valuation ownership | Finance owns it; we own quantity truth | D-008 |
