# Open Questions Register

> Per the Product Bible: *"Any ambiguous requirement must be identified as an open question rather than silently invented."*
>
> Nothing in this register has been assumed anywhere else in the project. Where a question blocks work, it says so.

**Status key:** `OPEN` unanswered · `PROPOSED` recommendation on the table, awaiting a decision · `ANSWERED` decided and recorded in `docs/decisions/decision-register.md`

---

## Tier 1 — Blocking. Product cannot be specified without these.

| ID | Question | Why it blocks | Status |
|---|---|---|---|
| B-01 | Who is the primary user of the first release? | Determines the entire information hierarchy (§40, §44). An executive-first and a warehouse-first product are different products. | `OPEN` |
| B-02 | What is the MVP boundary? | Everything downstream. See challenge D1 — breadth is the main risk to this project. | `OPEN` |
| B-03 | Discrete, process/batch, or mixed manufacturing? | Forks the domain model: recipes/yield/catch-weight vs assemblies/serials. The Bible's own example (Resin A, kg) implies process. | `OPEN` |
| B-04 | Single site, multi-site, or multi-tenant? | F1. Cheap now, a migration later. | `OPEN` |
| B-05 | Is inventory truth an append-only movement ledger? | F2. The foundation of traceability, valuation and §38 data trust. | `PROPOSED` — yes |
| B-06 | Does this system own valuation, or feed an existing finance system? | F8. Changes whether costing is authoritative or derived. | `OPEN` |
| B-07 | Is there a real pilot factory, and does it have usable historical data? | §55 defines success as a real factory operating better. Determines whether planning and supplier intelligence have anything to compute from. | `OPEN` |

---

## Tier 2 — Architectural. Needed before the relevant domain is built.

| ID | Question | Area | Status |
|---|---|---|---|
| A-01 | Balances projected synchronously or asynchronously? | F2 | `OPEN` |
| A-02 | Hard or soft reservation? | F3 | `OPEN` |
| A-03 | How is confidence defined and computed? | F4 | `OPEN` |
| A-04 | Who may close/reopen an accounting period? | F5 | `OPEN` |
| A-05 | Are catch-weight items required? | F6 | `OPEN` |
| A-06 | Is full lot genealogy required at first release? | F7 | `OPEN` |
| A-07 | Costing method(s) to support: standard, moving average, FIFO? | F8 | `PROPOSED` — per-item, standard first |
| A-08 | Is standard cost per site or global? | F1/F8 | `OPEN` |
| A-09 | Multi-currency at first release? | C1 | `OPEN` |
| A-10 | Location hierarchy fixed-depth or arbitrary? | C2 | `OPEN` |
| A-11 | Who owns item master data? | C3 | `OPEN` |
| A-12 | Minimum sample size before a supplier metric is shown? | C4 | `OPEN` |
| A-13 | Is there real sales-order demand, or forecast only? | C5 | `OPEN` |
| A-14 | Which planning methodologies at first release? | C6 | `OPEN` |
| A-15 | Is incoming inspection mandatory, per-item, or per-supplier? | C8 | `OPEN` |
| A-16 | Backflush or explicit material issue? | C10 | `OPEN` |
| A-17 | Are labour/machine/overhead rates available, or is material cost the only real component? | C13 | `OPEN` |
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

## Answered

*(none yet)*
