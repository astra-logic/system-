/**
 * ORDERS VIEW MODEL — one order is ONE object that carries its own risk.
 *
 * ⚠ THE FAILURE THIS FILE EXISTS TO FIX
 *
 *   PO-1008 — 5,000 kg of curing agent — was promised 25 Dec, has not arrived,
 *   has been held at Alexandria customs since 28 Dec, and its arrival date has
 *   already been revised once. On the old Orders page that row's entire flags
 *   column read "SEA", and the customs hold and the revised date lived in two
 *   OTHER tables further down the page.
 *
 *   The user performed the join. All four facts already existed in the
 *   database; only the assembly was missing. This is that assembly.
 *
 * Nothing here is a new capability, a logistics integration, or a tracking
 * feed. It reads what the factory recorded and puts it on the row it belongs to.
 */
import { qty, subQty, ZERO_QTY, type Qty } from "../core/decimal";
import { sql } from "../db/client";
import { date as fmtDate } from "../ui/format";

export type OrderState = "no" | "at-risk" | "yes" | "cant-say";

/** One instalment of a delivery. Kept separate — a part receipt is its own event. */
export interface Instalment {
  readonly sequence: number;
  readonly receivedAt: Date;
  readonly quantity: Qty;
  readonly uom: string;
}

export interface OrderLine {
  readonly poLineId: string;
  readonly number: string;
  readonly supplier: string;
  readonly supplierCountry: string | null;
  readonly itemCode: string;
  readonly itemName: string;
  readonly orderedQty: Qty;
  readonly receivedQty: Qty;
  readonly openQty: Qty;
  readonly uom: string;
  readonly unitPrice: string | null;
  readonly currency: string | null;
  readonly expedited: boolean;
  readonly freightMode: string | null;
  readonly instalments: readonly Instalment[];
  /**
   * Days from order to the FIRST receipt. Measured to the first, never the
   * last: with instalments the two differ, and an undeclared choice is a knob
   * nobody can audit.
   */
  readonly actualLeadTimeDays: number | null;
  /** How late the first instalment was against the promise. Null when on time. */
  readonly arrivedLateBy: number | null;
  readonly orderedAt: Date | null;
  /** What the supplier committed to. */
  readonly promisedDate: Date | null;
  /** The latest shipping update, when one exists. Never merged with the promise. */
  readonly etaDate: Date | null;
  /** The date we act on: the most recent statement of arrival. */
  readonly expectedDate: Date | null;
  readonly datesDisagree: boolean;
  /** Where it physically is, as last recorded. Not live tracking. */
  readonly lastMilestone: string | null;
  readonly lastMilestoneAt: Date | null;
  readonly lastMilestoneWhere: string | null;
  readonly heldInCustoms: boolean;
  readonly daysLate: number | null;
  readonly state: OrderState;
  readonly isOpen: boolean;
}

const DAY_MS = 86_400_000;
const pretty = (m: string): string =>
  ({ DEPARTED_ORIGIN: "Left the supplier", ARRIVED_PORT: "Arrived at port", CUSTOMS_HELD: "Held at customs",
     CUSTOMS_CLEARED: "Cleared customs", DELIVERED: "Delivered" } as Record<string, string>)[m]
  ?? m.toLowerCase().replace(/_/g, " ");

export async function orderLines(siteId: string, at: Date): Promise<OrderLine[]> {
  const rows = await sql<{
    po_line_id: string; number: string; status: string; supplier: string; country: string | null;
    item_code: string; item_name: string; ordered_qty: string; uom: string;
    unit_price: string | null; currency: string | null; expedited: boolean; freight_mode: string | null;
    ordered_at: string | null; promised_date: string | null; received: string | null;
    first_receipt: string | null;
    eta_date: string | null; milestone: string | null; milestone_at: string | null; milestone_where: string | null;
  }[]>`
    SELECT pl.id AS po_line_id, po.number, po.status, sup.name AS supplier, sup.country,
           i.code AS item_code, i.name AS item_name, pl.ordered_qty, pl.uom,
           pl.unit_price::text, pl.currency, pl.expedited, pl.freight_mode,
           po.ordered_at::text, pl.promised_date::text,
           (SELECT SUM(r.nominal_qty) FROM receipts r WHERE r.po_line_id = pl.id)::text AS received,
           (SELECT MIN(r.received_at) FROM receipts r WHERE r.po_line_id = pl.id)::text AS first_receipt,
           /* The shipment is reached DIRECTLY from the line where that link
              exists, and through a receipt otherwise. Before Block 14 only the
              receipt path existed, which made the customs hold invisible on any
              order that had not yet arrived — the exact case that matters. */
           (SELECT ef.eta_date::text FROM eta_forecasts ef
             WHERE ef.shipment_id = COALESCE(pl.shipment_id,
                     (SELECT r.shipment_id FROM receipts r WHERE r.po_line_id = pl.id AND r.shipment_id IS NOT NULL LIMIT 1))
             ORDER BY ef.observed_at DESC LIMIT 1) AS eta_date,
           (SELECT pm.milestone FROM port_milestones pm
             WHERE pm.shipment_id = COALESCE(pl.shipment_id,
                     (SELECT r.shipment_id FROM receipts r WHERE r.po_line_id = pl.id AND r.shipment_id IS NOT NULL LIMIT 1))
             ORDER BY pm.occurred_at DESC LIMIT 1) AS milestone,
           (SELECT pm.occurred_at::text FROM port_milestones pm
             WHERE pm.shipment_id = COALESCE(pl.shipment_id,
                     (SELECT r.shipment_id FROM receipts r WHERE r.po_line_id = pl.id AND r.shipment_id IS NOT NULL LIMIT 1))
             ORDER BY pm.occurred_at DESC LIMIT 1) AS milestone_at,
           (SELECT pm.location FROM port_milestones pm
             WHERE pm.shipment_id = COALESCE(pl.shipment_id,
                     (SELECT r.shipment_id FROM receipts r WHERE r.po_line_id = pl.id AND r.shipment_id IS NOT NULL LIMIT 1))
             ORDER BY pm.occurred_at DESC LIMIT 1) AS milestone_where
    FROM po_lines pl
    JOIN purchase_orders po ON po.id = pl.po_id
    JOIN suppliers sup ON sup.id = po.supplier_id
    JOIN items i ON i.id = pl.item_id
    WHERE po.site_id = ${siteId}::uuid AND po.status <> 'CANCELLED'
    ORDER BY po.ordered_at DESC NULLS LAST, po.number DESC`;

  /* Instalments, attached to their line. A delivery that came in three parts is
     three facts about that order, not three rows in a table somewhere else. */
  const parts = await sql<{ po_line_id: string; sequence: number; received_at: string; nominal_qty: string; nominal_uom: string }[]>`
    SELECT r.po_line_id, r.sequence, r.received_at::text, r.nominal_qty, r.nominal_uom
    FROM receipts r ORDER BY r.po_line_id, r.sequence`;
  const byLine = new Map<string, Instalment[]>();
  for (const p of parts) {
    const list = byLine.get(p.po_line_id) ?? [];
    list.push({ sequence: p.sequence, receivedAt: new Date(p.received_at), quantity: qty(p.nominal_qty), uom: p.nominal_uom });
    byLine.set(p.po_line_id, list);
  }

  return rows.map((r) => {
    const ordered = qty(r.ordered_qty);
    const received = r.received ? qty(r.received) : ZERO_QTY;
    const openQty = subQty(ordered, received);
    const promised = r.promised_date ? new Date(r.promised_date) : null;
    const eta = r.eta_date ? new Date(r.eta_date) : null;

    /* D-056: the most recently observed statement. An ETA is observed after the
       promise was made, so where both exist the ETA is the later observation.
       Both are carried so the answer can SHOW the disagreement rather than
       resolving it silently. */
    const expected = eta ?? promised;
    const milestone = r.milestone;
    const heldInCustoms = milestone === "CUSTOMS_HELD";

    // Open means: still something to come. Not the status enum, which can lie.
    const isOpen = openQty.greaterThan(0);
    const daysLate = isOpen && expected && expected < at
      ? Math.round((at.getTime() - expected.getTime()) / DAY_MS)
      : null;

    let state: OrderState;
    if (!isOpen) state = "yes";                                  // it arrived
    else if (daysLate !== null && daysLate > 0) state = "no";     // past due, nothing here
    else if (heldInCustoms || (promised && eta && +promised !== +eta)) state = "at-risk";
    else if (expected === null) state = "cant-say";               // no date on record
    else state = "yes";

    const orderedAt = r.ordered_at ? new Date(r.ordered_at) : null;
    const firstReceipt = r.first_receipt ? new Date(r.first_receipt) : null;

    return {
      poLineId: r.po_line_id, number: r.number, supplier: r.supplier, supplierCountry: r.country,
      itemCode: r.item_code, itemName: r.item_name,
      orderedQty: ordered, receivedQty: received, openQty, uom: r.uom,
      unitPrice: r.unit_price, currency: r.currency,
      expedited: r.expedited, freightMode: r.freight_mode,
      instalments: byLine.get(r.po_line_id) ?? [],
      actualLeadTimeDays: orderedAt && firstReceipt
        ? Math.round((firstReceipt.getTime() - orderedAt.getTime()) / DAY_MS) : null,
      arrivedLateBy: promised && firstReceipt && firstReceipt > promised
        ? Math.round((firstReceipt.getTime() - promised.getTime()) / DAY_MS) : null,
      orderedAt,
      promisedDate: promised, etaDate: eta, expectedDate: expected,
      datesDisagree: promised !== null && eta !== null && +promised !== +eta,
      lastMilestone: milestone ? pretty(milestone) : null,
      lastMilestoneAt: r.milestone_at ? new Date(r.milestone_at) : null,
      lastMilestoneWhere: r.milestone_where,
      heldInCustoms, daysLate, state, isOpen,
    };
  });
}

/**
 * Why this order is a problem, in one sentence — assembled from the facts that
 * used to be spread across three tables.
 *
 * ⚠ Returns null when nothing is wrong. It NEVER invents a cause: an order
 * that is late for reasons the factory did not record says only that it is
 * late.
 */
export function whyLate(o: OrderLine): string | null {
  if (o.heldInCustoms && o.lastMilestoneAt) {
    const where = o.lastMilestoneWhere ? ` at ${o.lastMilestoneWhere}` : "";
    return `Held at customs${where} since ${fmtDate(o.lastMilestoneAt)}.`;
  }
  if (o.daysLate !== null && o.daysLate > 0) {
    return o.lastMilestone
      ? `Last seen: ${o.lastMilestone.toLowerCase()}${o.lastMilestoneWhere ? ` at ${o.lastMilestoneWhere}` : ""}.`
      : "We don't have a reason on record for the delay.";
  }
  if (o.datesDisagree) return "The shipping date has moved since the supplier's promise.";
  return null;
}

const ORDER: Record<OrderState, number> = { no: 0, "at-risk": 1, "cant-say": 2, yes: 3 };
export const byUrgency = (a: OrderLine, b: OrderLine): number =>
  ORDER[a.state] - ORDER[b.state] ||
  (b.daysLate ?? -1) - (a.daysLate ?? -1) ||
  (a.expectedDate?.getTime() ?? 9e15) - (b.expectedDate?.getTime() ?? 9e15);
