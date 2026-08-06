# 00 — Product Bible: Manufacturing & Inventory Operating System

> **Status:** Planning only — DO NOT CODE, BUILD, IMPLEMENT, OR GENERATE UI YET.
>
> **Purpose:** Define the product vision, manufacturing model, UX philosophy, architecture direction, scope, and build principles before implementation begins.

---

# 1. Executive Directive

We are rebuilding the manufacturing and inventory system from zero.

The previous implementation is considered disposable. We will use the rebuild as an opportunity to create a substantially better product rather than reproduce the previous system.

The objective is **not** to create another ERP clone.

The objective is to create a modern manufacturing operating system that can compete with the breadth of products such as Oracle Manufacturing / Inventory and Odoo Manufacturing / Inventory while being dramatically easier to understand, faster to operate, more intelligent, and substantially more refined in UI and UX.

The system must combine:

- Manufacturing
- Inventory
- Procurement
- Planning
- Warehousing
- Production execution
- Quality
- Maintenance
- Cost intelligence
- Analytics
- Decision support
- AI-assisted operational intelligence

The product must be designed as a coherent system rather than a collection of unrelated modules.

---

# 2. Critical Instruction: Planning Only

At this stage:

- DO NOT write application code.
- DO NOT create React components.
- DO NOT create database schemas in code.
- DO NOT implement APIs.
- DO NOT build pages.
- DO NOT start the dashboard.
- DO NOT invent functionality simply because it is common in ERP software.
- DO NOT begin visual implementation.

First understand the product.

We are currently designing the system that will later be implemented.

Any ambiguous requirement must be identified as an open question rather than silently invented.

---

# 3. Product Vision

## One-Sentence Vision

Build a manufacturing operating system that turns factory data into clear operational decisions, measurable financial outcomes, and controlled execution.

## Product Philosophy

The system should answer:

> **What is happening?**
>
> **Why is it happening?**
>
> **What matters?**
>
> **What should I do?**
>
> **What will happen if I do it?**
>
> **What is the financial impact?**

The system must not merely display factory information.

It must help factory teams understand and act on that information.

---

# 4. Product Positioning

The benchmark is not simply feature count.

We want to outperform traditional ERP experiences in:

### 4.1 Usability

A complex manufacturing system should feel simple.

### 4.2 Decision speed

Users should reach the correct information and action quickly.

### 4.3 Data clarity

The system should distinguish:

- Actual data
- Calculated values
- Forecasts
- Assumptions
- Recommendations
- Unknown / insufficient data

### 4.4 Financial intelligence

Operational problems should be connected to financial consequences whenever the available data supports the calculation.

### 4.5 Manufacturing depth

The product must eventually understand real manufacturing operations rather than presenting a superficial inventory interface.

### 4.6 User experience

The system should feel like a premium modern product rather than a traditional enterprise application.

---

# 5. Competitive Benchmark

The system should study the capabilities and mental models of established enterprise platforms, especially:

- Oracle Supply Chain / Manufacturing / Inventory
- Odoo Manufacturing / Inventory

These are benchmarks for breadth and domain coverage.

They are NOT instructions to copy their interfaces.

We should ask of every capability:

1. Does it improve operational control?
2. Does it improve decision quality?
3. Does it improve financial performance?
4. Does it improve manufacturing performance?
5. Does it improve inventory efficiency?
6. Does it improve user speed?
7. Does it improve data trust?

If a capability does not provide meaningful value, it should not automatically be included.

---

# 6. The Apple Standard

## Core Requirement

The product must **look and feel like an Apple-designed system**.

This does NOT mean copying Apple's branding, logos, exact screens, proprietary assets, or blindly copying Apple interfaces.

It means adopting the qualities that make Apple's products feel:

- Clear
- Calm
- Premium
- Human
- Predictable
- Responsive
- Focused
- Cohesive
- Easy to learn
- Powerful without feeling complicated

Apple should be treated as a **design philosophy benchmark**, not a visual cloning target.

---

# 7. Apple UI Philosophy

## 7.1 Clarity Over Decoration

Every visual element must have a reason to exist.

Avoid:

- Decorative complexity
- Excessive gradients
- Unnecessary borders
- Excessive shadows
- Excessive badges
- Visual noise
- Unnecessary charts
- Excessive KPI cards

Use:

- Typography
- Spacing
- Grouping
- Contrast
- Hierarchy
- Subtle depth

to communicate importance.

---

# 8. Apple UX Philosophy

The interface should feel intuitive before the user understands the underlying ERP model.

A user should not need to understand the database structure to operate the system.

The product should favor:

- Recognition over recall
- Progressive disclosure
- Direct manipulation
- Clear hierarchy
- Predictable navigation
- Immediate feedback
- Forgiving interactions
- Meaningful defaults
- Contextual actions
- Minimal cognitive load

---

# 9. The Three-Second Rule

Every important screen should be understandable extremely quickly.

When a user opens a page, they should quickly understand:

1. Where am I?
2. What am I looking at?
3. Is something wrong?
4. What requires my attention?
5. What should I do next?

If a screen requires excessive interpretation, redesign it.

---

# 10. Decision-First UX

The system should not organize the experience around database entities alone.

Instead of asking:

> "What data can we display?"

ask:

> "What decision is this user trying to make?"

Example:

### Weak

```text
Material: Resin A

Stock: 14,200 kg
Reserved: 3,100 kg
Incoming: 5,000 kg
Monthly Usage: 4,800 kg
Lead Time: 18 days
```

### Better

```text
RESIN A

Inventory Status
Healthy

No immediate purchase required.

Projected excess:
6,900 kg

Capital tied up:
$XX,XXX

Recommended action:
Delay next purchase by 23 days.

Estimated annual impact:
$XX,XXX
```

The detailed data remains available through progressive disclosure.

---

# 11. Progressive Disclosure

Complex manufacturing data must not be presented all at once.

Use layers:

```text
Level 1 — Decision
What matters?

Level 2 — Explanation
Why does it matter?

Level 3 — Evidence
What data supports it?

Level 4 — Detail
Show transactions, calculations, history, and configuration.

Level 5 — Expert controls
Expose advanced planning, engineering, costing, and administrative controls.
```

The default experience should be simple.

The system must still support expert users.

---

# 12. One Primary Action

Every important screen should have a dominant primary action.

Do not make five buttons visually compete for attention.

Examples:

- Inventory exception → Resolve
- Low stock → Review purchase
- Production delay → Investigate
- Quality issue → Open investigation
- Maintenance alert → Schedule maintenance
- Purchase recommendation → Review recommendation

Secondary actions should remain available but visually subordinate.

---

# 13. Calm Enterprise UX

The system may contain enormous amounts of information.

The interface must not feel enormous.

Complexity belongs in the underlying system.

The user experience should remain:

- Calm
- Focused
- Structured
- Predictable
- Spacious

---

# 14. Information Density

We are NOT building an unnecessarily sparse consumer application.

Manufacturing users need high information density.

The target is:

> **High information density without high cognitive density.**

Dense data is acceptable.

Dense visual clutter is not.

Tables should be:

- Scannable
- Grouped
- Filterable
- Sortable
- Searchable
- Contextual
- Responsive
- Clear

---

# 15. Typography as a System

Typography should communicate hierarchy before decoration does.

Use a restrained type scale.

Prioritize:

- Strong page titles
- Clear section headings
- Readable body text
- Distinct metadata
- Strong numerical hierarchy
- Highly legible tables

Numbers must be easy to scan.

Financial values, quantities, dates, percentages, and status information should have consistent formatting.

---

# 16. Spacing

Whitespace is a functional tool.

Use spacing to:

- Separate concepts
- Group related information
- Create hierarchy
- Reduce cognitive load
- Direct attention

Avoid arbitrary spacing.

Spacing should follow a coherent system.

---

# 17. Color Philosophy

Color should communicate meaning.

Use semantic colors for:

- Success
- Warning
- Critical
- Error
- Information
- Neutral
- Selection
- Focus

Do not make every KPI a different color.

Color should be used sparingly.

A critical alert should feel important because the system has reserved strong visual emphasis for genuinely critical conditions.

---

# 18. Dark Technical Workspace

The current design direction favors a premium dark technical workspace.

The final visual system should use:

- Near-black / deep neutral foundation
- Layered surfaces
- Subtle borders
- Controlled contrast
- Restrained accent colors
- Strong typography
- Subtle depth
- Premium spacing

All colors must eventually become semantic design tokens.

Never hardcode random colors throughout the application.

---

# 19. Motion Design

Animation must communicate state or spatial relationships.

Motion should be:

- Fast
- Smooth
- Purposeful
- Consistent
- Subtle

Use motion for:

- Opening / closing panels
- Navigation transitions
- State changes
- Loading
- Confirmation
- Dragging
- Reordering
- Expanding detail
- Showing relationships

Never use animation merely because it looks impressive.

The goal is:

> **The interface should feel alive, not animated.**

---

# 20. Feedback

Every meaningful action should provide clear feedback.

Examples:

- Save
- Submit
- Receive
- Issue material
- Approve
- Reject
- Schedule
- Complete
- Cancel
- Import
- Export

The user should never wonder:

> "Did that work?"

---

# 21. Direct Manipulation

Where appropriate, users should feel like they are interacting with operational objects rather than forms.

Examples may include:

- Dragging schedule items
- Moving inventory between locations
- Adjusting planning parameters
- Expanding production operations
- Reviewing purchase recommendations
- Inspecting stock movement
- Navigating from an exception to its source

Direct manipulation should only be used when it makes the task faster or clearer.

---

# 22. Error Experience

Errors must be understandable.

Never show:

> Error 500.

Instead explain:

1. What happened?
2. Why?
3. What was affected?
4. What can the user do?
5. Can the system safely recover?

Errors should help users recover instead of making them investigate the software.

---

# 23. Empty States

Empty states must never feel broken.

They should explain:

- What this area is for
- Why there is currently no data
- What the user can do next

Example:

```text
No purchase orders yet.

Purchase orders will appear here after
your first approved procurement request.

[Create purchase order]
```

---

# 24. Loading States

Loading states should preserve context.

Avoid arbitrary spinners everywhere.

Where useful, use:

- Skeletons
- Progressive loading
- Local loading indicators
- Optimistic feedback when safe

The interface should remain stable while data loads.

---

# 25. Navigation Philosophy

Navigation must reflect how factory users think.

The product should not become a giant list of modules.

Navigation should be organized around operational domains and user intent.

Potential top-level domains:

```text
Command Center
Planning
Inventory
Procurement
Manufacturing
Quality
Maintenance
Analytics
Intelligence
Administration
```

The final navigation must be validated against real user workflows before implementation.

---

# 26. Factory Operating Model

The system should eventually represent the factory as a connected operational model.

Conceptually:

```text
Company
    ↓
Factory / Site
    ↓
Warehouses
    ↓
Zones
    ↓
Locations
    ↓
Products / Materials
    ↓
Suppliers
    ↓
Demand
    ↓
Planning
    ↓
Procurement
    ↓
Receiving
    ↓
Inventory
    ↓
Production
    ↓
Quality
    ↓
Finished Goods
    ↓
Orders
    ↓
Costs
```

This is a conceptual model only at this stage.

The actual domain model must be designed and validated before implementation.

---

# 27. Core Manufacturing Domains

The eventual system should investigate and define:

## Products

- Raw materials
- Components
- WIP
- Finished goods
- Packaging
- Consumables
- Spare parts

## Product structure

- Bill of Materials
- Multi-level BoMs
- Versions
- Alternatives
- Yield
- Scrap
- By-products

## Production

- Manufacturing orders
- Work orders
- Operations
- Routings
- Work centers
- Machines
- Labor
- Material consumption
- Output
- Scrap
- Rework
- Downtime

## Capacity

- Available capacity
- Planned capacity
- Utilization
- Bottlenecks
- Machine availability
- Labor availability

---

# 28. Inventory Domain

Inventory must be treated as a transactional system.

Potential capabilities:

- Warehouses
- Locations
- Stock states
- On-hand inventory
- Reserved inventory
- Available inventory
- Incoming supply
- Outgoing demand
- Transfers
- Receipts
- Issues
- Adjustments
- Cycle counts
- Lots
- Batches
- Serial numbers where required
- Inventory valuation
- Aging
- Slow-moving stock
- Excess stock
- Dead stock
- Stockout risk

The system must maintain a reliable chain of inventory events.

---

# 29. Procurement Domain

Procurement should eventually cover:

```text
Need
 ↓
Planning recommendation
 ↓
Supplier
 ↓
Quotation / RFQ
 ↓
Purchase Order
 ↓
Shipment
 ↓
Receipt
 ↓
Inspection
 ↓
Inventory
```

Supplier intelligence should potentially include:

- Price history
- Lead time
- Lead-time variability
- MOQ
- Delivery reliability
- Quality performance
- Payment terms
- Purchase history
- Supplier risk

---

# 30. Planning Domain

Planning should connect demand and supply.

Potential capabilities:

- Demand
- Forecast
- Safety stock
- Reorder point
- Replenishment
- Lead time
- MRP
- Material requirements
- Planned orders
- Exceptions
- Capacity planning
- Scenario analysis

Every planning calculation must clearly identify:

- Inputs
- Formula / logic
- Assumptions
- Output
- Confidence
- Limitations

---

# 31. Cost Intelligence

The system should eventually connect operational activity to cost.

Potential cost dimensions:

- Material
- Labor
- Machine time
- Overhead
- Scrap
- Rework
- Downtime
- Inventory carrying cost
- Purchasing cost
- Production variance

Potential outputs:

- Product cost
- Actual vs standard cost
- Production variance
- Purchase price variance
- Scrap cost
- WIP value
- Finished goods cost
- Cost per unit
- Margin impact

---

# 32. Quality

Quality should connect:

```text
Specification
 ↓
Inspection
 ↓
Result
 ↓
Defect
 ↓
Root Cause
 ↓
Corrective Action
 ↓
Financial / Operational Impact
```

Potential areas:

- Quality checkpoints
- Inspection plans
- Sampling
- Defects
- Nonconformance
- Holds
- Rework
- Scrap
- Supplier quality
- CAPA
- Quality cost

---

# 33. Maintenance

Manufacturing capacity depends on equipment availability.

Potential areas:

- Equipment
- Machines
- Preventive maintenance
- Corrective maintenance
- Maintenance work orders
- Downtime
- MTBF
- MTTR
- Availability
- Maintenance cost

Maintenance information should connect to production impact where possible.

---

# 34. Analytics Philosophy

Analytics should not be a gallery of charts.

Analytics must help answer questions.

Examples:

### Inventory

- How much capital is tied up?
- Where is excess stock?
- Which materials are at stockout risk?
- What is aging?
- What should we buy?
- What should we stop buying?

### Manufacturing

- What is our throughput?
- Where are bottlenecks?
- Why are orders late?
- Where are we losing yield?
- Where is downtime occurring?
- What is our capacity utilization?

### Procurement

- Where are purchase prices increasing?
- Which suppliers are unreliable?
- Where are lead times changing?
- What purchasing decisions create savings?

### Financial

- Where is money trapped?
- Where are costs increasing?
- What waste is avoidable?
- What savings opportunities exist?

---

# 35. Intelligence Layer

AI must not simply be a chatbot.

AI should exist inside the operational system.

Potential capabilities:

- Explain anomalies
- Explain recommendations
- Identify patterns
- Summarize operational situations
- Detect risks
- Suggest actions
- Compare scenarios
- Explain financial impact
- Assist with planning
- Answer questions using verified system data

AI output must never be presented as fact when the underlying data does not support it.

---

# 36. Recommendation Object

Any important recommendation should eventually have a structured explanation.

Conceptually:

```text
Recommendation

What:
Delay purchase of Material A

Why:
Projected inventory exceeds expected consumption.

Evidence:
14 months historical consumption
18-day supplier lead time
Current on-hand stock
Open purchase orders

Calculation:
[transparent calculation]

Assumptions:
[explicit assumptions]

Expected impact:
$XX,XXX annualized

Confidence:
High

Action:
Review purchase order PO-XXXX
```

This structure is essential for trust.

---

# 37. Financial Impact Engine

A major differentiator should be the ability to translate operational decisions into financial impact.

Examples:

```text
Excess inventory
→ Capital tied up
→ Carrying cost
→ Potential savings

Stockout
→ Production interruption
→ Lost capacity
→ Potential cost

Supplier price increase
→ Material cost increase
→ Product cost impact
→ Margin impact

Scrap
→ Material loss
→ Production cost
→ Quality cost

Downtime
→ Lost production hours
→ Capacity impact
→ Financial impact
```

The system must clearly distinguish:

- Actual savings
- Forecast savings
- Potential savings
- Avoided cost
- Estimated impact

Never present potential savings as realized savings.

---

# 38. Data Trust

The system must never fabricate operational reality.

Every important value should have a clear provenance.

Possible data states:

```text
ACTUAL
CALCULATED
FORECAST
ESTIMATED
ASSUMED
USER-DEFINED
INSUFFICIENT DATA
```

If there is insufficient information to calculate something reliably, the system should say so.

Example:

```text
Savings opportunity unavailable.

Reason:
Supplier lead-time history contains only
two completed deliveries.

More reliable analysis will become available
after additional purchasing history is recorded.
```

Trust is more important than impressive numbers.

---

# 39. Core User Experience Pattern

For major operational objects, aim toward:

```text
Overview
 ↓
Status
 ↓
Risk / Exception
 ↓
Recommendation
 ↓
Evidence
 ↓
Action
 ↓
Outcome
```

The system should help users move naturally through this chain.

---

# 40. Dashboard / Command Center Philosophy

The dashboard should NOT become a wall of cards.

It should be a command center.

Potential hierarchy:

```text
Factory Health
        ↓
Today's Decisions
        ↓
Critical Exceptions
        ↓
Financial Opportunities
        ↓
Operational Trends
        ↓
Deep Analysis
```

The final information hierarchy must be validated against user roles.

---

# 41. Executive Experience

An executive should be able to understand:

- Overall factory health
- Inventory capital
- Major operational risks
- Production performance
- Procurement issues
- Major savings opportunities
- Financial impact
- Critical decisions

without entering detailed operational screens.

---

# 42. Operational Manager Experience

A manager should be able to quickly answer:

- What needs action today?
- What is late?
- What is at risk?
- What is causing the problem?
- Who owns the action?
- What happens if we do nothing?

---

# 43. Expert Experience

Expert users must still have access to:

- Detailed tables
- Transactions
- Calculations
- Parameters
- Configuration
- History
- Engineering information
- Advanced filters
- Advanced analytics

The expert layer should be available without overwhelming normal users.

---

# 44. Role-Based Complexity

Different users should see different levels of complexity.

Potential roles:

- Executive
- Factory manager
- Inventory manager
- Warehouse manager
- Procurement manager
- Production planner
- Production manager
- Quality manager
- Maintenance manager
- Finance / cost analyst
- System administrator

The exact permission model is an open architectural decision to resolve before implementation.

---

# 45. System-Wide UX Rules

Every future feature must follow these rules:

1. Do not add UI elements without a user purpose.
2. Do not expose complexity unnecessarily.
3. Do not create dashboards just because data exists.
4. Do not make users interpret raw data when the system can explain it.
5. Do not hide important actions.
6. Do not overload users with simultaneous alerts.
7. Do not use color without semantic meaning.
8. Do not use animation without a functional reason.
9. Do not create inconsistent interaction patterns.
10. Do not force users to memorize system behavior.
11. Prefer recognition over recall.
12. Preserve context during navigation.
13. Always provide feedback after meaningful actions.
14. Always distinguish facts from predictions.
15. Always show uncertainty where it exists.

---

# 46. Product Quality Bar

Before a feature is considered good, evaluate it across:

### Functional quality

Does it work correctly?

### Domain quality

Does it represent the real factory process?

### UX quality

Can a user understand it quickly?

### Visual quality

Does it meet the premium design system?

### Data quality

Are values traceable and trustworthy?

### Performance

Does it feel responsive?

### Accessibility

Can users operate it reliably?

### Financial relevance

Does it help control cost, capital, or performance?

---

# 47. What We Must NOT Build

Do not create:

- A dashboard-first fake ERP
- Random KPI cards
- Fake AI recommendations
- Fake savings calculations
- Fake factory data
- Unexplained financial metrics
- Massive navigation trees
- Unnecessary CRUD screens
- Complex forms without guidance
- Screens that exist only because a database entity exists
- Feature bloat
- Unvalidated business logic
- UI-first architecture
- A clone of Oracle
- A clone of Odoo
- A clone of Apple's interface

---

# 48. Build Philosophy

The product must be designed before implementation.

The development approach should follow:

```text
Product thinking
 ↓
Domain modeling
 ↓
Architecture
 ↓
UX architecture
 ↓
Design system
 ↓
Build plan
 ↓
Feature specification
 ↓
Implementation
 ↓
Verification
 ↓
Documentation update
```

Not:

```text
Idea
 ↓
Prompt AI
 ↓
Generate UI
 ↓
Patch bugs
 ↓
Add more features
 ↓
System becomes inconsistent
```

---

# 49. Feature Development Rule

Every future implementation unit must:

- Have one clear objective
- Have a defined boundary
- Have known dependencies
- Have explicit acceptance criteria
- Be independently verifiable
- Avoid unrelated changes
- Update project documentation when decisions change

---

# 50. Build Order Philosophy

Dependencies come first.

Security comes before protected functionality.

Data foundations come before analytics.

Core transaction logic comes before intelligence.

UI shells may be designed before real data wiring, but the final UX must be validated against real workflows.

AI recommendations must come after the system has reliable underlying data.

---

# 51. Proposed High-Level Build Sequence

This is a planning hypothesis, not a final build plan.

```text
PHASE 0
Product architecture

PHASE 1
Context + specifications

PHASE 2
Organization / factory model

PHASE 3
Product and material master

PHASE 4
Warehouse + location model

PHASE 5
Inventory transaction engine

PHASE 6
Inventory visibility

PHASE 7
Supplier + procurement foundations

PHASE 8
Receiving

PHASE 9
Planning foundations

PHASE 10
Bill of Materials

PHASE 11
Routing + operations

PHASE 12
Work centers + capacity

PHASE 13
Manufacturing orders

PHASE 14
Production execution

PHASE 15
Quality

PHASE 16
Maintenance

PHASE 17
Cost intelligence

PHASE 18
Analytics

PHASE 19
Decision intelligence

PHASE 20
AI assistant / intelligence layer

PHASE 21
Advanced optimization
```

This sequence must be challenged and refined before implementation.

---

# 52. Documentation System

The project should eventually use the six-file context system:

```text
context/
├── project-overview.md
├── architecture.md
├── code-standards.md
├── ai-workflow-rules.md
├── ui-context.md
├── progress-tracker.md
└── specs/
    └── 00-build-plan.md
```

These files should remain synchronized with the actual product.

---

# 53. Current Context Files

The currently supplied context files are templates and methodology scaffolding.

They must NOT be treated as a finished product specification.

They currently contain placeholders for major decisions including:

- Product overview
- Goals
- Features
- Scope
- Architecture
- Stack
- Storage
- Auth
- UI system
- Progress

These must be filled intentionally during planning.

---

# 54. Open Questions

Before implementation, we must resolve at minimum:

1. Who is the primary user for the first release?
2. What exact factory types are supported first?
3. What is the first production scenario we optimize for?
4. What is the exact MVP boundary?
5. Which modules are required for the first real factory deployment?
6. What data must be imported from Excel?
7. What data must be entered manually?
8. What data must come from integrations?
9. What is the authoritative source of inventory truth?
10. How will inventory transactions work?
11. How will product costing work?
12. How will manufacturing costing work?
13. What planning methodologies are supported?
14. How will EOQ be calculated and when is it appropriate?
15. How will safety stock be calculated?
16. How will demand uncertainty be represented?
17. How will supplier reliability be calculated?
18. What financial metrics are authoritative?
19. What AI capabilities are safe to introduce?
20. What permissions are required?
21. What technology stack will be used?
22. What deployment architecture is required?
23. What is the exact visual design system?
24. What user research / factory validation will be conducted?
25. What must be true before the first pilot factory can use the system?

---

# 55. Definition of Success

The product is successful when a real factory can use it to:

1. Understand its operational state quickly.
2. See inventory accurately.
3. Understand what materials are needed and why.
4. Make better purchasing decisions.
5. Understand production status.
6. Identify operational risks.
7. Understand the financial impact of important problems.
8. Execute actions without unnecessary complexity.
9. Trace important recommendations back to evidence.
10. Trust the numbers.
11. Learn the system without extensive training.
12. Use the product comfortably every day.

The ultimate success metric is not:

> "The system has many features."

It is:

> **"The factory operates better because this system exists."**

---

# 56. Non-Negotiable Product Principles

These principles should survive the entire project.

### 01 — Reality before UI

Model the factory correctly before decorating it.

### 02 — Decisions before dashboards

The system exists to improve decisions.

### 03 — Trust before intelligence

AI cannot compensate for unreliable data.

### 04 — Simplicity over superficial minimalism

Hide complexity; do not remove necessary capability.

### 05 — Apple-level UX discipline

The interface must feel deliberate, calm, responsive, coherent, and premium.

### 06 — Enterprise depth without enterprise ugliness

Complex business logic should not require a complicated interface.

### 07 — Financial consequences matter

Operational decisions should connect to financial impact where data supports it.

### 08 — Evidence over claims

Every important recommendation must be explainable.

### 09 — Build incrementally

Never allow the AI coding agent to implement an undefined system.

### 10 — Never fake certainty

If the system does not know, it must say that it does not know.

---

# 57. Immediate Next Step

DO NOT CODE.

DO NOT BUILD.

DO NOT DESIGN THE FINAL UI YET.

The next planning task is:

## Define the Factory Operating Model.

We need to map the real-world factory from:

```text
Company
→ Factory
→ Warehouses
→ Locations
→ Products
→ Materials
→ Suppliers
→ Demand
→ Planning
→ Procurement
→ Receiving
→ Inventory
→ Production
→ Quality
→ Maintenance
→ Finished Goods
→ Orders
→ Costs
→ Financial Outcomes
```

For each domain we will determine:

- What exists
- Who owns it
- What data it contains
- What states it can have
- What events change it
- What it connects to
- What decisions depend on it
- What financial impact it can create

Only after this model is understood should we create the final project context files and build plan.

---

# FINAL DIRECTIVE TO THE AI AGENT

You are NOT being asked to build this system yet.

Your job at this stage is to **understand, challenge, structure, and document the product**.

Do not write code.

Do not create components.

Do not implement UI.

Do not make assumptions silently.

When information is missing, identify it as an open question.

When a proposed feature conflicts with the product philosophy, challenge it.

When a requirement is too broad, break it down.

When a decision affects architecture, record it.

The goal of this phase is to produce a sufficiently precise product and domain model that implementation becomes execution rather than improvisation.

**We are building the product definition first.**

**The code comes later.**
