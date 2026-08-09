/**
 * The detection run — reads recorded events and produces findings.
 *
 * A run is a REPRODUCIBLE snapshot: same inputs, same result, forever. Nothing
 * here consults the clock except through `asOf`, which the caller supplies, so a
 * historical run can be replayed exactly (U-16's rule, generalised).
 */
import { sql } from "../db/client";
import { money, type Money, ZERO_MONEY } from "../core/decimal";
import { captured, type FxPolicy, fxObservation } from "../core/fx";
import type { Envelope } from "../core/provenance";
import { detectLeadTimeCorrection, observedPremiumSpend, type ExpediteEventInput, type ObservedOrder } from "./mechanisms/m01-leadtime";
import type { EvidenceGap, Opportunity } from "./findings";
import { detectContradictions, type Contradiction } from "./signature";
import { potentialAnnualSaving, type HeadlineFigure } from "./aggregate";

export interface RunResult {
  readonly asOf: Date;
  readonly opportunities: readonly Opportunity[];
  readonly evidenceGaps: readonly EvidenceGap[];
  readonly contradictions: readonly Contradiction[];
  readonly headline: HeadlineFigure;
  readonly notes: readonly string[];
  readonly isDemo: boolean;
}

export async function loadFxPolicy(reportingCurrency: string): Promise<FxPolicy> {
  const rows = await sql<{ from_currency: string; to_currency: string; rate: string; effective_on: string; source: string; owner: string }[]>`
    SELECT from_currency, to_currency, rate, effective_on::text, source, owner FROM fx_rates`;
  return {
    reportingCurrency,
    owner: rows[0]?.owner ?? "unknown",
    observations: rows.map((r) => fxObservation(r.from_currency, r.to_currency, r.rate, new Date(`${r.effective_on}T00:00:00Z`), r.source, r.owner)),
  };
}

interface ItemRow {
  id: string; code: string; lead_time_days: number | null;
}

export async function runDetection(siteId: string, asOf: Date): Promise<RunResult> {
  const [siteRow] = await sql<{ reporting_currency: string }[]>`SELECT reporting_currency FROM sites WHERE id = ${siteId}::uuid`;
  const currency = siteRow?.reporting_currency ?? "EGP";
  const fx = await loadFxPolicy(currency);

  const [demoRow] = await sql<{ any_demo: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS any_demo FROM import_batches WHERE site_id = ${siteId}::uuid`;
  const isDemo = demoRow?.any_demo ?? false;

  const items = await sql<ItemRow[]>`SELECT id, code, lead_time_days FROM items WHERE site_id = ${siteId}::uuid AND active`;

  const opportunities: Opportunity[] = [];
  const gaps: EvidenceGap[] = [];
  const notes: string[] = [];

  // The earliest recorded event bounds usable history. It is NOT assumed to be
  // twelve months — an item whose history starts last month annualises to nothing.
  const [historyRow] = await sql<{ from: string | null }[]>`
    SELECT MIN(effective_at)::text AS from FROM movements WHERE site_id = ${siteId}::uuid`;
  const historyFrom = historyRow?.from ? new Date(historyRow.from) : asOf;

  for (const item of items) {
    const orderRows = await sql<{
      po_line_id: string; ordered_at: string; first_receipt: string | null; final_receipt: string | null;
      receipt_count: number; expedited: boolean;
    }[]>`
      SELECT l.id AS po_line_id, p.ordered_at::text AS ordered_at,
             MIN(r.received_at)::text AS first_receipt,
             MAX(r.received_at)::text AS final_receipt,
             COUNT(r.id)::int AS receipt_count, l.expedited
      FROM po_lines l
      JOIN purchase_orders p ON p.id = l.po_id
      LEFT JOIN receipts r ON r.po_line_id = l.id
      WHERE l.item_id = ${item.id}::uuid AND p.ordered_at IS NOT NULL
      GROUP BY l.id, p.ordered_at, l.expedited`;

    const orders: ObservedOrder[] = orderRows.map((o) => ({
      poLineId: o.po_line_id,
      orderedAt: new Date(o.ordered_at),
      firstReceiptAt: o.first_receipt ? new Date(o.first_receipt) : null,
      finalReceiptAt: o.final_receipt ? new Date(o.final_receipt) : null,
      receiptCount: o.receipt_count,
      expedited: o.expedited,
    }));

    const expRows = await sql<{
      id: string; po_line_id: string; occurred_at: string; root_cause: string | null;
      premium_amount: string | null; premium_currency: string | null; premium_effective_on: string | null;
    }[]>`
      SELECT e.id, e.po_line_id, e.occurred_at::text, e.root_cause,
             e.premium_amount, e.premium_currency, e.premium_effective_on::text
      FROM expedite_events e
      JOIN po_lines l ON l.id = e.po_line_id
      WHERE l.item_id = ${item.id}::uuid`;

    const expedites: ExpediteEventInput[] = expRows.map((e) => ({
      id: e.id,
      poLineId: e.po_line_id,
      occurredAt: new Date(e.occurred_at),
      rootCause: e.root_cause,
      premium:
        e.premium_amount && e.premium_currency && e.premium_effective_on
          ? captured(e.premium_amount, e.premium_currency, new Date(`${e.premium_effective_on}T00:00:00Z`))
          : null,
    }));

    if (expedites.length === 0) continue;

    const result = detectLeadTimeCorrection({
      itemId: item.id,
      itemCode: item.code,
      masterLeadTimeDays: item.lead_time_days,
      orders,
      expedites,
      fx,
      historyFrom,
      asOf,
      /**
       * ⚠ Not yet determinable from recorded data.
       *
       * Whether correcting a lead time requires holding more inventory depends on
       * the factory's coverage policy, which is A-18 / N-11 and unanswered. The
       * honest value is null — the gate then blocks the NET and says why, rather
       * than assuming zero. Assuming zero would be the single most profitable
       * assumption available here, which is exactly why it is refused.
       */
      requiresAdditionalInventory: null,
      incrementalCarryingCost: null,
      owners: { finding: "inv", action: "buyer", data: "admin" },
    });

    if (result.opportunity) opportunities.push(result.opportunity);
    notes.push(...result.notes.map((n) => `${item.code}: ${n}`));

    const spend = observedPremiumSpend(expedites, fx);
    for (const g of result.evidenceGaps) {
      gaps.push({
        class: "EVIDENCE_GAP",
        id: `gap:${item.id}:${g.factoryDataRef}`,
        missingEvidence: g.missingEvidence,
        factoryDataRef: g.factoryDataRef,
        blocks: `${g.blocks} — item ${item.code}`,
        /**
         * "Capture requests are prioritised by OBSERVED SPEND — a fact we can
         *  see — never by suspected opportunity, which we cannot." This spend is
         *  an ACTUAL fact and is NOT an Evidence Gap value.
         */
        observedSpend: spend.isZero() ? null : ({ value: spend, unit: currency, basis: "ACTUAL", asOf, inputs: [], assumptions: [], coverage: [], limitations: [] } as Envelope<Money>),
        dataOwner: "admin",
      });
    }
  }

  const contradictions = detectContradictions(opportunities.map((o) => ({ id: o.id, signature: o.signature })));
  const headline = potentialAnnualSaving({ findings: opportunities, currency, asOf });

  return { asOf, opportunities, evidenceGaps: gaps, contradictions, headline, notes, isDemo };
}

/** Convenience for the CLI and the UI. */
export async function firstSiteId(): Promise<string | null> {
  const [row] = await sql<{ id: string }[]>`SELECT id FROM sites LIMIT 1`;
  return row?.id ?? null;
}

export const ZERO = ZERO_MONEY;
export { money };
