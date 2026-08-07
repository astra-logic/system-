# AI Workflow Rules

> Rules governing how AI agents work **on** this project, and separately, how AI behaves **inside** the product.

---

## Part 1 — Rules for agents building this project

### Currently in force

**We are in planning. Do not write application code, components, schemas, APIs, pages, or UI.** This holds until the Tier 1 questions in `docs/open-questions.md` are answered and a build plan is approved. (Bible §2, §57)

### Always in force

1. **Never invent a requirement.** Ambiguity goes to `docs/open-questions.md`. Silent assumption is the single most damaging failure mode on this project.
2. **Never implement an undefined system.** (Bible §56-09) If a spec is missing, the answer is a spec, not a guess.
3. **Record decisions that affect architecture** in `docs/decisions/decision-register.md`, including what was rejected and what it costs.
4. **Challenge conflicts with the philosophy** rather than complying quietly. (Bible, final directive)
5. **Break down requirements that are too broad.** Breadth is this project's principal risk.
6. **Do not add a feature because ERP software usually has it.** Apply the Bible §5 test *and* the North Star test of `docs/01-core-mission.md` §11: does it help identify a saving opportunity, quantify one, execute an action that creates savings, prevent future losses, or improve the operational foundation required for those? If not, it needs explicit justification.
6a. **Classify every feature** as `CORE` · `ENABLER` · `ADJACENT` · `OUTER` (core-mission §12), and apply the product test of §13: *if we removed this, would the system become less capable of discovering, explaining, executing or sustaining Potential Annual Saving?*
7. **Update documentation in the same change as the decision it reflects.** Stale context files are worse than none.
8. **One implementation unit, one objective, explicit acceptance criteria.** (Bible §49)
9. **Do not generate fake factory data** and present it as real, in any artefact, at any stage. (Bible §47)
9-0. **Prefer evidence-based, event-level counterfactual reasoning over category percentages.** (D-027) Never *"60% of this cost is avoidable"*; instead *"these specific events trace to this root cause, and this intervention would have prevented them under this stated counterfactual."* Quantification requires stated intervention · testable counterfactual · reliable incremental-cost inputs · FX normalisation · sufficient evidence.
9a. **Never invent a constant to make a calculation complete.** Avoidability weights, carrying-cost defaults, minimum event counts — all were explicitly rejected (D-017, D-019, D-023). A missing input produces `INSUFFICIENT_DATA`, not a plausible-looking number.
9b. **Never silently resolve a conflict between locked decisions.** Flag it and say which needs revisiting.
10. **Never present a potential saving as realised**, and never produce the headline Potential Annual Saving figure as a single confident point. D-012's rules — range, weakest basis, deduplication, one-time separated from recurring — are binding. This is the number the whole product is judged on.

---

## Part 2 — Rules for AI inside the product

Bible §35 is unambiguous: AI is not a chatbot bolted on. It exists inside the operational system. These rules constrain it:

1. **AI may only assert what system data supports.** (§35) An answer that outruns its evidence is a defect, not a limitation.
2. **AI output carries the provenance envelope** like any other derived value. (D-002)
3. **AI may not manufacture confidence.** If the data is insufficient, it says so, in the same designed `INSUFFICIENT_DATA` state everything else uses.
4. **AI-produced recommendations follow the D-003 lifecycle** and are subject to the same realisation discipline as any other. No exemption for being AI-generated.
5. **AI explanations must be traceable to evidence** the user can open and inspect. (§36)
6. **AI arrives after the data is trustworthy, not before.** (§56-03, §50) Provenance infrastructure is built from day one; AI *features* come last.
7. `UNRESOLVED` (P-11) — which AI capabilities are safe to introduce, and whether AI may ever take an action rather than propose one. **The default until decided: propose only, never act.**
