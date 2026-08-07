# 01 — Core Mission, Potential Annual Saving & Expansion Map

> **Status:** Product-definition document. This does NOT authorize coding or implementation.

## 1. North Star

The system exists primarily to help a factory discover:

> **How much money could the factory potentially save per year, and where is that saving coming from?**

**Primary business KPI:** Potential Annual Saving.

Operational management is the supporting system that makes this possible and sustainable.

### Important distinction

Potential Annual Saving is the **North-Star outcome**, not the literal root problem.

The underlying problem is:

> Money is being lost or unnecessarily tied up because the factory lacks sufficient visibility, control, optimization, and decision support across materials, inventory, purchasing, and operations.

Therefore:

**Factory problem → Root cause → Operational improvement → Financial effect → Potential Annual Saving**

---

## 2. Product Mind Map

```text
MANUFACTURING OPERATING SYSTEM
│
└── NORTH STAR: POTENTIAL ANNUAL SAVING
    │
    ├── Inventory Savings
    │   ├── Excess stock
    │   ├── Slow-moving / dead stock
    │   ├── Carrying cost
    │   └── Working capital
    │
    ├── Procurement Savings
    │   ├── Purchase price
    │   ├── Supplier comparison
    │   ├── MOQ optimization
    │   ├── Order consolidation
    │   └── Supplier performance
    │
    ├── Replenishment / Planning Savings
    │   ├── Reorder point
    │   ├── Safety stock
    │   ├── EOQ where appropriate
    │   ├── Consumption history
    │   └── Lead-time variability
    │
    ├── Stockout / Interruption Avoidance
    │   ├── Stockout risk
    │   ├── Production interruption
    │   ├── Emergency purchasing
    │   └── Expedited freight
    │
    ├── Production Savings
    │   ├── Material consumption
    │   ├── Scrap
    │   ├── Rework
    │   ├── Yield
    │   ├── Downtime
    │   └── Capacity
    │
    ├── Quality Savings
    │   ├── Defects
    │   ├── Scrap cost
    │   ├── Rework cost
    │   └── Supplier quality
    │
    ├── Maintenance / Capacity
    │   ├── Downtime
    │   ├── Maintenance cost
    │   ├── Availability
    │   ├── MTBF
    │   └── MTTR
    │
    └── Future Optimization
        ├── Scheduling
        ├── Advanced MRP
        ├── Capacity optimization
        ├── Scenario planning
        └── AI optimization
```

---

## 3. Concentric-Circle Strategy

We do NOT try to solve the entire factory on day one.

### Circle 0 — Core

**Saving Intelligence**

> Where can this factory save money, based on the data we actually have?

The system identifies, quantifies, prioritizes, and explains saving opportunities.

### Circle 1 — Immediate Drivers

- Inventory
- Procurement
- Replenishment
- Consumption
- Supplier data
- Cost data
- Working capital

### Circle 2 — Planning

- Demand
- Forecasting
- Safety stock
- Reorder policies
- Material planning
- MRP
- Purchase planning

### Circle 3 — Manufacturing

- Products
- BoMs
- Routings
- Work centers
- Manufacturing orders
- Production execution
- WIP
- Capacity
- Scrap
- Yield

### Circle 4 — Quality & Maintenance

- Quality
- Defects
- Rework
- Scrap
- Equipment
- Downtime
- Maintenance
- Availability

### Circle 5 — Full Factory Intelligence

```text
Factory Digital Operating Model
        ↓
Real-Time Operational State
        ↓
Decision Intelligence
        ↓
Scenario Simulation
        ↓
Optimization
```

Outer circles must never distract from the North Star.

---

## 4. First-Release Promise

The first release should make one promise extremely well:

> **Given reliable factory data, identify and explain realistic annual saving opportunities around inventory, purchasing, replenishment, and working capital.**

Core flow:

**Factory Data → Inventory Reality → Consumption → Supply → Cost → Opportunity Detection → Potential Saving → Recommended Action**

---

## 5. Saving Opportunity Model

Every important opportunity should eventually contain:

- Opportunity
- Category
- Factory area
- Root cause
- Evidence
- Source data
- Data freshness
- Calculation
- Assumptions
- Confidence
- Potential Annual Saving
- One-time impact
- Recurring impact
- Required action
- Owner
- Status
- Outcome

---

## 6. Potential ≠ Realized

The system must distinguish:

- **Potential:** estimated opportunity supported by evidence.
- **Approved:** accepted by a responsible user.
- **In Progress:** action is being implemented.
- **Realized:** saving was actually achieved and validated.
- **Rejected:** reviewed and rejected.
- **Expired:** opportunity is no longer valid.

Never present potential savings as realized savings.

---

## 7. Data Trust

Financial numbers must be traceable.

Possible data states:

- ACTUAL
- CALCULATED
- FORECAST
- ESTIMATED
- ASSUMED
- USER-DEFINED
- INSUFFICIENT_DATA
- STALE_DATA

If cost data is stale or unavailable, the system must not present a precise financial impact as current fact.

---

## 8. Management Is the Operating Layer

Management is not a competing goal to saving.

It enables saving to be:

**discovered → understood → approved → executed → monitored → measured → sustained**

Therefore:

```text
Management
    ↓
Visibility
    ↓
Control
    ↓
Action
    ↓
Optimization
    ↓
Saving
```

---

## 9. Core Product Loop

```text
OBSERVE
   ↓
UNDERSTAND
   ↓
IDENTIFY OPPORTUNITY
   ↓
QUANTIFY
   ↓
RECOMMEND
   ↓
ACT
   ↓
MEASURE
   ↓
VERIFY
   ↓
LEARN
   ↓
OBSERVE AGAIN
```

This loop is more important than the number of screens.

---

## 10. Apple-Level Product Experience

The Apple requirement applies to the entire product experience.

The system should feel:

- Calm
- Clear
- Premium
- Responsive
- Precise
- Human
- Confident
- Predictable

Complexity should be hidden, not removed.

Preferred hierarchy:

```text
DECISION
   ↓
EXPLANATION
   ↓
EVIDENCE
   ↓
DETAIL
   ↓
EXPERT CONTROLS
```

The existing project design direction already includes Apple-inspired typography, spacing, layered surfaces, restrained semantic color, navigation, search, and tables. These principles should remain part of the product definition. 

---

## 11. AI Agent North Star

Any AI working on this project must remember:

> **This is not an ERP whose goal is to have many modules.**
>
> **This is a manufacturing intelligence system whose North Star is Potential Annual Saving, supported by operational management.**

Before adding a feature, ask:

1. Does it help identify a saving opportunity?
2. Does it help quantify one?
3. Does it help execute an action that can create savings?
4. Does it help prevent future losses?
5. Does it improve the operational foundation required for the above?

If not, it requires explicit justification.

---

## 12. Feature Classification

Every feature should be classified as:

### CORE
Directly contributes to Potential Annual Saving.

### ENABLER
Provides data, control, or execution needed for the saving engine.

### ADJACENT
Solves a closely related factory problem and may be added after the core is stable.

### OUTER-CIRCLE
Useful long-term capability that should not distract from the current product.

---

## 13. Product Test

At every stage ask:

> **If we removed this feature, would the system become less capable of discovering, explaining, executing, or sustaining Potential Annual Saving?**

If yes: Core or Enabler.

If no: consider a later circle.

---

## 14. Final Product Statement

> **A premium manufacturing intelligence and operations platform that helps factories discover, quantify, prioritize, execute, and verify potential annual savings, beginning with inventory, procurement, replenishment, consumption, cost, and working-capital opportunities and expanding outward into planning, manufacturing, quality, maintenance, and full factory optimization.**

The UX should make this complex system feel as clear and approachable as a premium modern product.

---

## 15. Current Phase

We are still in **PRODUCT DISCOVERY + ARCHITECTURE**.

Before coding begins, establish:

1. Exact core saving problem
2. First-circle scope
3. Required factory data
4. Saving-opportunity taxonomy
5. Financial calculation rules
6. Inventory / procurement workflows
7. User roles
8. Apple-level UX architecture
9. Technical architecture
10. Data architecture
11. AI-agent operating rules
12. Build sequence
13. Verification strategy

**Only after these are sufficiently defined should implementation begin.**
