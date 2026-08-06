# 00 — Build Plan

> **Status: NOT WRITTEN. Deliberately.**

A build plan cannot be written yet, and writing one now would be the exact failure the Product Bible warns against in §48 — improvising a system before defining it.

## What must happen before this file has content

**1. Tier 1 questions answered** (`docs/open-questions.md`)
Primary user, MVP boundary, manufacturing type, deployment scope, valuation ownership, pilot factory.

**2. Foundations settled**
F1 tenancy, F2 stock ledger, F8 costing. Per the domain model, nothing meaningful can be sequenced before these three, and all three are business decisions rather than engineering preferences.

**3. Decision register reviewed**
The six proposals in `docs/decisions/decision-register.md` accepted or rejected.

**4. Domain model challenged and revised**
Draft 1 (`docs/domain/01-factory-operating-model.md`) reviewed by someone who knows the actual factory. A domain model validated only by its author is a hypothesis.

**5. Bible §51 sequence refined**
The 21-phase sequence is explicitly a planning hypothesis, and §51 requires it be challenged. Challenge D-006 proposes keeping its dependency logic while proving the foundations early with a thin vertical slice — one material, supplier through to cost.

---

## Constraints any eventual plan must respect

Per Bible §50:

- Dependencies first
- Security before protected functionality
- Data foundations before analytics
- Core transaction logic before intelligence
- AI after the data is reliable

Per Bible §49, every unit within the plan needs one objective, a defined boundary, known dependencies, explicit acceptance criteria, independent verifiability, and no unrelated changes.

---

*Do not populate this file with a speculative plan. An unvalidated plan is worse than an empty one, because it will be followed.*
