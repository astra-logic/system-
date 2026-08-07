# Claude Handoff — Part 1 Locked / Part 2 Planning

You are continuing the manufacturing intelligence system rebuild.

## Read this first

Read and absorb these documents before doing anything else:

1. `00-product-bible.md`
2. `01-core-mission-locked.md`
3. `02-potential-annual-saving-engine-plan.md`
4. Existing decision register / open questions
5. Existing product audit / critique documents

Do not code.

Do not build UI.

Do not implement formulas.

Do not create database schemas.

We are still in product discovery and architecture.

---

# What has now been decided

The North Star is:

> **Potential Annual Saving**

But Potential Annual Saving is an outcome, not the root problem.

The product is:

> **Saving intelligence supported by operational management.**

The first circle is:

```text
Saving Intelligence
        ↓
Inventory
Procurement
Replenishment
Consumption
Supplier Data
Cost Data
Working Capital
```

---

# Critical financial-trust rules

These are locked:

1. Do not treat Potential Annual Saving as an unquestionable single precise number.
2. Prefer a defensible range with the weakest basis clearly stated.
3. The annual headline includes recurring annual economic benefit only.
4. One-time working-capital release is separate.
5. Dead stock value is not automatically saving.
6. Order consolidation must account for carrying-cost / other offsets.
7. Stockout risk cannot receive a currency value until production-impact data supports it.
8. Finance owns authoritative financial inputs where the factory has them.
9. Assumptions are allowed but must be visibly marked `ASSUMED`.
10. Financial inputs must carry source, owner, effective date, freshness, and status.
11. Demand-based annualization should use 12 months of usable history as the preferred minimum.
12. Less than 12 months must not silently become a confident annual number.
13. Missing data must produce `INSUFFICIENT_DATA` / `CANNOT_CALCULATE`, not zero.
14. Double-counting must be explicitly prevented.
15. Confidence must be based on evidence/data coverage, not arbitrary category constants.
16. Generated/demo data must never be presented as real factory transactions.

---

# Your task now

Execute **Part 2 as a product-design workshop**, not as implementation.

Start with the first saving mechanism:

## Expedited Freight / Emergency Purchase Premium

Explain:

- What economic mechanism we are measuring
- What data is required
- What counts as evidence
- What baseline is needed
- What is actually avoidable
- How one-time vs recurring works
- How annualization works
- What Finance must own
- How uncertainty is represented
- How duplicate counting is prevented
- How the action is defined
- How the saving is later realized and verified

Then stop at the decision points that require product/business judgment.

Do not invent missing factory facts.

If something is unknown, label it:

`UNKNOWN`

If something requires actual factory data:

`REQUIRES FACTORY DATA`

If you recommend a rule but it has not been accepted:

`PROPOSED`

---

# Important behavior

Do not assume that a conventional ERP feature belongs in this product.

The North Star is the saving engine.

Inventory, procurement, planning, and management are enablers of that engine.

Every design decision must be evaluated against:

> Does this help us discover, quantify, execute, measure, or sustain defensible economic benefit?

The system should be enterprise-grade in manufacturing depth but Apple-level in clarity, hierarchy, interaction quality, and cognitive simplicity.

**No coding until the product definition is complete and explicitly released for implementation.**
