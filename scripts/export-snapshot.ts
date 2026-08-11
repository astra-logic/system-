/**
 * EXPORT A SNAPSHOT OF WHAT THE REAL SYSTEM SAYS.
 *
 *   npx tsx scripts/export-snapshot.ts > snapshot.json
 *
 * ⚠ WHY THIS EXISTS, AND WHAT IT IS NOT
 *
 *   The product is a server application over PostgreSQL. A Claude Artifact is a
 *   single page inside a browser tab, and there is no PostgreSQL in a browser
 *   tab — so the real system cannot run there.
 *
 *   This bridges that gap WITHOUT inventing anything. It runs the real engine,
 *   the real view models and the real language module, then writes down exactly
 *   what they returned. A preview built on this file is replaying genuine
 *   output, not imitating it.
 *
 * ⚠ THE LINE THIS FILE MUST NOT CROSS
 *
 *   Nothing here computes, rounds, rephrases or fills in. Every string is
 *   produced by the same code path that renders it in the application. If a
 *   figure is absent in the system it must be absent here — a preview that is
 *   more complete than the product is a lie about the product.
 *
 *   The feasibility answers are precomputed over a GRID of quantities, so a
 *   preview can respond to a question the user asks. Each one is a real answer
 *   from `checkFeasibility`, never an interpolation between two others.
 */
import { sql } from "../lib/db/client";
import { firstSiteId } from "../lib/engine/run";
import { currentOpportunities, currentEvidenceGaps } from "../lib/engine/persist";
import { potentialAnnualSaving } from "../lib/engine/aggregate";
import { rehydrate } from "../lib/engine/rehydrate";
import { stockLines, byUrgency as stockByUrgency, cantSayCopy } from "../lib/views/stock";
import { orderLines, byUrgency as ordersByUrgency, whyLate } from "../lib/views/orders";
import { checkFeasibility } from "../lib/feasibility/engine";
import {
  VERDICT_MARK, VERDICT_WORD, answerNotices, headline, missingLines, reason, warningsFor,
} from "../lib/feasibility/language";
import { qty } from "../lib/core/decimal";
import { money, qty as fmtQty, approx, date as fmtDate, days as fmtDays, cover as fmtCover } from "../lib/ui/format";
import { basisWord, sentence, stateWord } from "../lib/ui/plain";

const AS_OF = new Date("2027-01-01T00:00:00Z");

/** The quantities a preview may be asked about. Every one is really computed. */
const GRID = [500, 1000, 2000, 3000, 5000, 6000, 8000, 10000, 15000, 20000, 30000, 50000];

async function main() {
  const siteId = await firstSiteId();
  if (!siteId) throw new Error("No site. Run npm run db:seed first.");

  /* ---- Stock, exactly as the Stock screen renders it -------------------- */
  const stock = (await stockLines(siteId, AS_OF)).sort(stockByUrgency).map((l) => {
    const w = { whole: l.integerOnly };
    const c = l.state === "cant-say" ? cantSayCopy(l) : null;
    return {
      code: l.code, name: l.name, state: l.state,
      available: fmtQty(l.available, l.stockUom, w),
      onOrder: l.onOrder.greaterThan(0) ? fmtQty(l.onOrder, l.stockUom, w) : null,
      nextArrival: l.nextArrival ? fmtDate(l.nextArrival) : null,
      qualityHold: l.qualityHold.greaterThan(0) ? fmtQty(l.qualityHold, l.stockUom, w) : null,
      cover: l.coverDays !== null ? fmtCover(l.coverDays) : null,
      leadTimeDays: l.leadTimeDays,
      monthlyUse: l.dailyUse ? approx(l.dailyUse.times(30), l.stockUom) : null,
      historyDays: l.historyDays,
      why: c?.why ?? null, then: c?.then ?? null, fixable: Boolean(c?.fix),
    };
  });

  /* ---- Orders, exactly as the Orders screen renders them ---------------- */
  const orders = (await orderLines(siteId, AS_OF)).map((o) => ({
    number: o.number, supplier: o.supplier, itemName: o.itemName, itemCode: o.itemCode,
    state: o.state, isOpen: o.isOpen,
    openQty: fmtQty(o.openQty, o.uom),
    orderedQty: fmtQty(o.orderedQty, o.uom),
    receivedQty: fmtQty(o.receivedQty, o.uom),
    expected: o.expectedDate ? fmtDate(o.expectedDate) : null,
    promised: o.promisedDate ? fmtDate(o.promisedDate) : null,
    eta: o.etaDate ? fmtDate(o.etaDate) : null,
    datesDisagree: o.datesDisagree,
    lateness: o.daysLate !== null ? fmtDays(o.daysLate) : null,
    why: whyLate(o),
    milestone: o.lastMilestone, milestoneWhere: o.lastMilestoneWhere,
    milestoneAt: o.lastMilestoneAt ? fmtDate(o.lastMilestoneAt) : null,
    heldInCustoms: o.heldInCustoms, expedited: o.expedited,
    actualLeadTimeDays: o.actualLeadTimeDays,
    arrivedLateBy: o.arrivedLateBy !== null ? fmtDays(o.arrivedLateBy) : null,
    unitPrice: o.unitPrice && o.currency ? `${o.unitPrice} ${o.currency}` : null,
    instalments: o.instalments.map((p) => `${fmtQty(p.quantity, p.uom)} on ${fmtDate(p.receivedAt)}`),
    firstArrival: o.instalments[0] ? fmtDate(o.instalments[0].receivedAt) : null,
  })).sort(ordersByUrgency as never);

  /* ---- Savings ---------------------------------------------------------- */
  const findings = await currentOpportunities(siteId);
  const head = potentialAnnualSaving({
    findings: findings.map((f) => rehydrate(f as never)), currency: "EGP", asOf: AS_OF,
  });
  const savings = findings.map((f) => {
    const net = f.netImpact as Record<string, unknown> | null;
    const v = (net?.["value"] as string | null) ?? null;
    return {
      id: f.id, title: sentence(f.title), itemCode: f.itemCode,
      state: stateWord(f.lifecycle),
      value: v ? money(v, String(net?.["unit"] ?? "EGP")) : null,
      basis: basisWord(String(net?.["basis"] ?? "")),
      excludesUnvaluedRisk: f.netExcludesUnvaluedRisk,
    };
  });

  /* ---- Feasibility, really computed at every point on the grid ---------- */
  const products = await sql<{ id: string; code: string; name: string }[]>`
    SELECT DISTINCT i.id, i.code, i.name FROM items i
    JOIN product_structures ps ON ps.parent_item_id = i.id
    GROUP BY i.id, i.code, i.name ORDER BY i.code`;

  const answers: Record<string, unknown> = {};
  for (const p of products) {
    for (const n of GRID) {
      const a = await checkFeasibility({
        productItemId: p.id, quantity: qty(String(n)), needBy: null, asOf: AS_OF,
      });
      const lines = missingLines(a);
      answers[`${p.code}:${n}`] = {
        mark: VERDICT_MARK[a.verdict], word: VERDICT_WORD[a.verdict],
        state: a.verdict.toLowerCase().replace("_", "-"),
        headline: headline(a), reason: reason(a),
        notices: answerNotices(a), assumptions: [...a.assumptions],
        missing: lines.map((l) => ({ code: l.code, name: l.name, missing: l.missing, action: l.action, warnings: [...l.warnings] })),
        alsoWorthKnowing: a.components
          .filter((c) => !lines.some((l) => l.code === c.code))
          .flatMap((c) => warningsFor(c)),
        components: a.components.map((c) => {
          const w = { whole: c.integerOnly };
          return {
            code: c.code, name: c.name,
            needed: fmtQty(c.requirement.value, c.stockUom, w),
            onShelf: fmtQty(c.available, c.stockUom, w),
            onHold: fmtQty(c.qualityHold, c.stockUom, w),
            onTheWay: fmtQty(c.incoming, c.stockUom, w),
            stillToOrder: fmtQty(c.shortfall, c.stockUom, w),
          };
        }),
      };
    }
  }

  /* ---- Today, and the trust surface ------------------------------------- */
  const gaps = (await currentEvidenceGaps(siteId)).map((g) => ({
    missing: sentence(g.missing_evidence), blocks: sentence(g.blocks),
  }));
  const [demo] = await sql<{ d: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS d FROM import_batches`;

  process.stdout.write(JSON.stringify({
    generatedAt: new Date().toISOString(),
    asOf: fmtDate(AS_OF),
    isDemo: demo?.d ?? false,
    products: products.map((p) => ({ code: p.code, name: p.name })),
    grid: GRID,
    stock, orders, savings, gaps, answers,
    headline: {
      upper: head.basis === "INSUFFICIENT_DATA" ? null : money(head.upper, "EGP"),
      lower: head.lower.isZero() ? null : money(head.lower, "EGP"),
    },
  }, null, 0));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
