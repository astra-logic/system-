/**
 * STOCK VIEW MODEL — the four states, derived from observation only.
 *
 * ⚠ THIS FILE INVENTS NOTHING. Read that literally.
 *
 *   `A-18` — the thresholds defining low, excess and dead stock — is an OPEN
 *   FACTORY POLICY the system may not choose (D-035, D-053). There is no
 *   minimum-stock field anywhere in the schema, and `N-11` states that a
 *   service level is "a policy the factory states, never a parameter we fit".
 *
 *   So every state below comes from two OBSERVED numbers — how fast the
 *   material is used, and how long it takes to arrive — and from arithmetic on
 *   them. No threshold, no buffer, no service level, no forecast.
 *
 * Block 12b (D-060) fixed the rules this implements:
 *
 *   COVER      available ÷ observed daily use, over ALL recorded history,
 *              with the window always stated.
 *   SUFFICIENCY state cover only when the usage history spans at least one
 *              lead time — you cannot judge whether stock survives a reorder
 *              cycle from less history than one reorder cycle. The bar is the
 *              material's own lead time, not a number we chose.
 *   🔴         you will run out before a replacement could arrive, counting
 *              everything already on order. A certainty, not a policy.
 *   🟡         cover is shorter than the usual delivery time.
 *   🟢         neither, and both inputs are known.
 *   ⚪         an input is missing, and it is NAMED.
 */
import { addQty, cmpQty, qty, subQty, ZERO_QTY, type Decimal, type Qty } from "../core/decimal";
import { sql } from "../db/client";

export type StockState = "no" | "at-risk" | "yes" | "cant-say";

/** Why we cannot judge a material — and whether the user can do anything. */
export type MissingInput =
  | { kind: "no-lead-time"; fixable: true }
  | { kind: "no-usage"; fixable: false }
  | null;

export interface StockLine {
  readonly itemId: string;
  readonly code: string;
  readonly name: string;
  readonly stockUom: string;
  readonly integerOnly: boolean;
  readonly available: Qty;
  readonly qualityHold: Qty;
  readonly onOrder: Qty;
  /** Earliest arrival among open orders, if any is expected. */
  readonly nextArrival: Date | null;
  readonly leadTimeDays: number | null;
  /** Observed use per day, over the whole recorded window. Null when never used. */
  readonly dailyUse: Decimal | null;
  /** Days the usage history spans — always stated beside any cover figure. */
  readonly historyDays: number;
  /** Days of cover. Null when it may not honestly be stated. */
  readonly coverDays: number | null;
  readonly state: StockState;
  readonly missing: MissingInput;
}

const DAY_MS = 86_400_000;

export async function stockLines(siteId: string, at: Date): Promise<StockLine[]> {
  const rows = await sql<{
    id: string; code: string; name: string; stock_uom: string; integer_only: boolean;
    lead_time_days: number | null; supplier_lead: number | null;
    on_hand: string; hold: string; used: string | null;
    first_use: string | null; last_use: string | null;
    on_order: string | null; next_arrival: string | null;
  }[]>`
    WITH pos AS (
      SELECT i.id,
             COALESCE(SUM(CASE WHEN d.counts_as_on_hand THEN m.nominal_qty ELSE 0 END)
                    - SUM(CASE WHEN s.counts_as_on_hand THEN m.nominal_qty ELSE 0 END), 0) AS on_hand,
             COALESCE(SUM(CASE WHEN d.kind = 'QUALITY_HOLD' THEN m.nominal_qty ELSE 0 END)
                    - SUM(CASE WHEN s.kind = 'QUALITY_HOLD' THEN m.nominal_qty ELSE 0 END), 0) AS hold
      FROM items i
      LEFT JOIN movements m ON m.item_id = i.id AND m.effective_at <= ${at.toISOString()}::timestamptz
      LEFT JOIN locations s ON s.id = m.from_location_id
      LEFT JOIN locations d ON d.id = m.to_location_id
      GROUP BY i.id
    ),
    use AS (
      SELECT m.item_id,
             SUM(m.nominal_qty) AS used,
             MIN(m.effective_at)::text AS first_use,
             MAX(m.effective_at)::text AS last_use
      FROM movements m
      JOIN locations s ON s.id = m.from_location_id
      JOIN locations d ON d.id = m.to_location_id
      WHERE s.counts_as_on_hand AND NOT d.counts_as_on_hand AND d.kind <> 'QUALITY_HOLD'
        AND m.effective_at <= ${at.toISOString()}::timestamptz
      GROUP BY m.item_id
    ),
    inbound AS (
      SELECT pl.item_id,
             SUM(pl.ordered_qty - COALESCE((SELECT SUM(r.nominal_qty) FROM receipts r WHERE r.po_line_id = pl.id), 0)) AS on_order,
             MIN(pl.promised_date)::text AS next_arrival
      FROM po_lines pl
      JOIN purchase_orders po ON po.id = pl.po_id
      WHERE po.status IN ('SENT', 'PARTIALLY_RECEIVED')
      GROUP BY pl.item_id
    )
    SELECT i.id, i.code, i.name, i.stock_uom, i.integer_only, i.lead_time_days,
           (SELECT sit.lead_time_days FROM supplier_item_terms sit
             WHERE sit.item_id = i.id AND sit.lead_time_days IS NOT NULL
             ORDER BY sit.effective_from DESC LIMIT 1) AS supplier_lead,
           pos.on_hand, pos.hold, use.used, use.first_use, use.last_use,
           inbound.on_order, inbound.next_arrival
    FROM items i
    JOIN pos ON pos.id = i.id
    LEFT JOIN use ON use.item_id = i.id
    LEFT JOIN inbound ON inbound.item_id = i.id
    WHERE i.site_id = ${siteId}::uuid AND i.active
    ORDER BY i.code`;

  return rows.map((r) => {
    const onHand = qty(r.on_hand);
    const hold = qty(r.hold);
    const available = subQty(onHand, hold);
    const onOrder = r.on_order ? qty(r.on_order) : ZERO_QTY;
    const nextArrival = r.next_arrival ? new Date(r.next_arrival) : null;

    // Supplier-specific terms beat item master — a more specific STATED value,
    // never a statistic (D-056).
    const leadTimeDays = r.supplier_lead ?? r.lead_time_days;

    // Usage, observed over its own window. The window is reported, never hidden.
    let dailyUse: Decimal | null = null;
    let historyDays = 0;
    if (r.used && r.first_use && r.last_use) {
      const span = Math.max(1, Math.round((new Date(r.last_use).getTime() - new Date(r.first_use).getTime()) / DAY_MS));
      historyDays = span;
      const total = qty(r.used);
      if (!total.isZero()) dailyUse = (total as Decimal).dividedBy(span);
    }

    /* ---- The state. Every branch is observation or arithmetic. ------------ */
    let state: StockState;
    let missing: MissingInput = null;
    let coverDays: number | null = null;

    if (dailyUse === null) {
      // Never issued: we do not know how fast it goes. Time fixes this, not the user.
      state = "cant-say";
      missing = { kind: "no-usage", fixable: false };
    } else if (leadTimeDays === null) {
      // No delivery time on record: a five-second fix in Settings.
      state = "cant-say";
      missing = { kind: "no-lead-time", fixable: true };
    } else if (historyDays < leadTimeDays) {
      /* ⚠ The sufficiency bar, and it is DERIVED: you cannot judge whether stock
         survives a reorder cycle from less history than one reorder cycle. */
      state = "cant-say";
      missing = { kind: "no-usage", fixable: false };
    } else {
      coverDays = Number((available as Decimal).dividedBy(dailyUse).toFixed(1));

      // Will a replacement land before the shelf runs out, counting what is
      // already on order? If not, running out is a certainty, not a risk.
      const coverWithIncoming = cmpQty(onOrder, ZERO_QTY) > 0 && nextArrival
        ? Number((addQty(available, onOrder) as Decimal).dividedBy(dailyUse).toFixed(1))
        : coverDays;
      const daysUntilArrival = nextArrival
        ? Math.round((nextArrival.getTime() - at.getTime()) / DAY_MS)
        : leadTimeDays;

      if (coverDays < daysUntilArrival && coverWithIncoming < daysUntilArrival) state = "no";
      else if (coverDays < leadTimeDays) state = "at-risk";
      else state = "yes";
    }

    return {
      itemId: r.id, code: r.code, name: r.name, stockUom: r.stock_uom,
      integerOnly: r.integer_only, available, qualityHold: hold, onOrder, nextArrival,
      leadTimeDays, dailyUse, historyDays, coverDays, state, missing,
    };
  });
}

/** 🔴 first, then 🟡, then ⚪, then 🟢. Urgency, never the item code. */
const ORDER: Record<StockState, number> = { no: 0, "at-risk": 1, "cant-say": 2, yes: 3 };
export const byUrgency = (a: StockLine, b: StockLine): number =>
  ORDER[a.state] - ORDER[b.state] || (a.coverDays ?? 1e9) - (b.coverDays ?? 1e9) || a.code.localeCompare(b.code);

/** The plain sentence for a material we cannot judge, and what closing it unlocks. */
export function cantSayCopy(l: StockLine): { why: string; then: string; fix?: string } {
  if (l.missing?.kind === "no-lead-time") {
    return {
      why: "No delivery time is on record, so we can't tell when you'd need to reorder.",
      then: "We'll warn you before this runs out.",
      // Deep-linked to the material's own row, so the fix is one tap, not a hunt.
      fix: `/settings#${l.code}`,
    };
  }
  if (l.historyDays > 0 && l.leadTimeDays !== null && l.historyDays < l.leadTimeDays) {
    return {
      why: `We've only seen ${l.historyDays} days of use, and this takes ${l.leadTimeDays} days to arrive.`,
      then: "We'll be able to judge it once we've watched it for a full delivery cycle.",
    };
  }
  return {
    why: "This has never been issued from stock, so we don't know how fast you use it.",
    then: "Nothing to fix — we'll learn this as stock moves.",
  };
}
