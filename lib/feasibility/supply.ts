/**
 * Open supply — what counts as incoming, and when it is expected. D-056.
 *
 * F3 defines Incoming as "confirmed inbound supply not yet received (open PO
 * lines, inbound transfers, planned MO output)". For the MVP that is open PO
 * lines ONLY: there are no inbound transfers at one site (D-004), and planned
 * manufacturing output does not exist and must not be created (D-054).
 *
 * ⚠ The confirmation gap, disclosed rather than papered over (F-51): the PO
 * lifecycle has no supplier-acknowledgement state, so SENT means "we sent it",
 * not "the supplier accepted it". This is one reason nothing un-received may
 * ever produce 🟢.
 */
import { addQty, qty, subQty, ZERO_QTY, type Qty } from "../core/decimal";
import { sql } from "../db/client";

/** D-056: which statement of the expected date this is, and how strong it is. */
export type DateSource = "PROMISED" | "ETA" | "NONE";

export interface OpenSupply {
  readonly poNumber: string;
  readonly poLineId: string;
  readonly orderedQty: Qty;
  readonly receivedQty: Qty;
  /** ordered − Σ receipts. NEVER the PO quantity — F-41. */
  readonly openQty: Qty;
  readonly uom: string;
  /** The most recently observed statement of arrival. Null when none exists. */
  readonly expectedDate: Date | null;
  readonly dateSource: DateSource;
  /** Both are carried when they disagree; neither overrides the other (D-056). */
  readonly promisedDate: Date | null;
  readonly etaDate: Date | null;
  readonly datesDisagree: boolean;
  /** Expected date has passed and nothing arrived. Counted, flagged, never 🟢. */
  readonly overdue: boolean;
}

/**
 * Open supply for one item.
 *
 * Statuses are a deliberate, closed list:
 *   SENT, PARTIALLY_RECEIVED   count
 *   DRAFT, APPROVED            do NOT — the supplier does not know about them
 *   RECEIVED                   already in Available
 *   CANCELLED                  contribute nothing
 */
export async function openSupplyFor(itemId: string, at: Date): Promise<OpenSupply[]> {
  const rows = await sql<{
    po_line_id: string; number: string; ordered_qty: string; uom: string;
    /* date/timestamptz arrive as STRINGS from raw SQL; converted at this
       boundary, once. See the note in structure.ts. */
    received: string | null; promised_date: string | null; eta_date: string | null;
  }[]>`
    SELECT pl.id AS po_line_id, po.number, pl.ordered_qty, pl.uom,
           (SELECT SUM(r.nominal_qty) FROM receipts r WHERE r.po_line_id = pl.id) AS received,
           pl.promised_date,
           (SELECT ef.eta_date
              FROM receipts r2
              JOIN eta_forecasts ef ON ef.shipment_id = r2.shipment_id
             WHERE r2.po_line_id = pl.id
             ORDER BY ef.observed_at DESC
             LIMIT 1) AS eta_date
    FROM po_lines pl
    JOIN purchase_orders po ON po.id = pl.po_id
    WHERE pl.item_id = ${itemId}::uuid
      AND po.status IN ('SENT', 'PARTIALLY_RECEIVED')
    ORDER BY po.number`;

  const out: OpenSupply[] = [];
  for (const r of rows) {
    const ordered = qty(r.ordered_qty);
    const received = r.received === null ? ZERO_QTY : qty(r.received);
    const open = subQty(ordered, received);
    if (open.lessThanOrEqualTo(0)) continue; // fully received: already in Available

    const promised = r.promised_date ? new Date(r.promised_date) : null;
    const eta = r.eta_date ? new Date(r.eta_date) : null;

    /* D-056: "the most recently observed statement of it". An ETA is observed
       after the promise was made, so where both exist the ETA is the later
       observation. Both are carried so the answer can show the disagreement
       rather than resolving it silently. */
    const expected = eta ?? promised;
    const source: DateSource = eta ? "ETA" : promised ? "PROMISED" : "NONE";

    out.push({
      poNumber: r.number,
      poLineId: r.po_line_id,
      orderedQty: ordered,
      receivedQty: received,
      openQty: open,
      uom: r.uom,
      expectedDate: expected,
      dateSource: source,
      promisedDate: promised,
      etaDate: eta,
      datesDisagree: promised !== null && eta !== null && promised.getTime() !== eta.getTime(),
      overdue: expected !== null && expected < at,
    });
  }
  return out;
}

/**
 * The part of open supply usable for a requirement.
 *
 * With a need-by date, supply expected after it does not help. WITHOUT one there
 * is no deadline to miss, so everything open counts — which is what makes the
 * no-date answer weaker but still true.
 *
 * ⚠ Supply with NO expected date counts toward quantity. It cannot be shown to
 * arrive in time, so it contributes 🟡 and is disclosed; refusing it outright
 * would understate supply the factory has genuinely ordered.
 */
export function usableBy(supply: readonly OpenSupply[], needBy: Date | null): { usable: OpenSupply[]; excluded: OpenSupply[] } {
  if (!needBy) return { usable: [...supply], excluded: [] };
  const usable: OpenSupply[] = [];
  const excluded: OpenSupply[] = [];
  for (const s of supply) {
    if (s.expectedDate === null) usable.push(s);
    else if (s.expectedDate <= needBy) usable.push(s);
    else excluded.push(s);
  }
  return { usable, excluded };
}

export const totalOpen = (supply: readonly OpenSupply[]): Qty =>
  supply.reduce<Qty>((a, s) => addQty(a, s.openQty), ZERO_QTY);

/**
 * Observed consumption of an item over the year before `at`, used ONLY by the
 * 🟢 cap (D-057). It is read as an observed fact about the past, never as a
 * forward demand signal — that distinction is what keeps D-010 intact.
 *
 * "Unrelated" means: material issued out of stock for any reason. The feasibility
 * request itself consumes nothing, so every issue in the window is by definition
 * unrelated to it.
 */
export async function observedConsumption(itemId: string, at: Date): Promise<{ total: Qty; monthly: Qty | null }> {
  const from = new Date(at.getTime() - 365 * 24 * 3600 * 1000);
  const rows = await sql<{ nominal_qty: string; actual_qty: string | null; catch_weight: boolean }[]>`
    SELECT m.nominal_qty, m.actual_qty, i.catch_weight
    FROM movements m
    JOIN items i        ON i.id = m.item_id
    JOIN locations src  ON src.id = m.from_location_id
    JOIN locations dest ON dest.id = m.to_location_id
    WHERE m.item_id = ${itemId}::uuid
      AND m.effective_at > ${from.toISOString()}::timestamptz
      AND m.effective_at <= ${at.toISOString()}::timestamptz
      AND src.counts_as_on_hand = true
      AND dest.counts_as_on_hand = false
      AND dest.kind <> 'QUALITY_HOLD'`;

  let total = ZERO_QTY;
  for (const r of rows) total = addQty(total, r.catch_weight && r.actual_qty ? qty(r.actual_qty) : qty(r.nominal_qty));
  return { total, monthly: total.isZero() ? null : qty(total.dividedBy(12)) };
}
