/**
 * ORDERS & SUPPLY MOVEMENT — the operational journey.
 *
 * Classified ENABLER: it produces no saving. It supplies the evidence without
 * which the mechanisms cannot compute — receipts are the spine, and partial
 * receipts are separate events.
 *
 * ⚠ ETA is a FORECAST and never silently becomes an actual. It is rendered with
 * its basis attached and its revision history visible, because a forecast that
 * looks like a date is a provenance breach.
 */
import { sql } from "../../lib/db/client";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";

interface LineRow {
  po_number: string; status: string; supplier: string; country: string | null;
  item_code: string; ordered_qty: string; uom: string; unit_price: string; currency: string;
  ordered_at: string | null; promised_date: string | null; expedited: boolean;
  freight_mode: string | null; line_id: string;
}

const days = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

export default async function Orders() {
  const [demo] = await sql<{ any_demo: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS any_demo FROM import_batches`;

  const lines = await sql<LineRow[]>`
    SELECT p.number AS po_number, p.status, s.name AS supplier, s.country,
           i.code AS item_code, l.ordered_qty, l.uom, l.unit_price, l.currency,
           p.ordered_at::text, l.promised_date::text, l.expedited, l.freight_mode, l.id AS line_id
    FROM po_lines l
    JOIN purchase_orders p ON p.id = l.po_id
    JOIN suppliers s ON s.id = p.supplier_id
    JOIN items i ON i.id = l.item_id
    ORDER BY p.ordered_at DESC NULLS LAST, p.number`;

  const receipts = await sql<{ po_line_id: string; sequence: number; received_at: string; nominal_qty: string; nominal_uom: string }[]>`
    SELECT po_line_id, sequence, received_at::text, nominal_qty, nominal_uom FROM receipts ORDER BY po_line_id, sequence`;

  const etas = await sql<{ eta_date: string; basis: string; source: string; observed_at: string; reference: string }[]>`
    SELECT e.eta_date::text, e.basis, e.source, e.observed_at::text, sh.reference
    FROM eta_forecasts e JOIN shipments sh ON sh.id = e.shipment_id ORDER BY e.observed_at`;

  const milestones = await sql<{ reference: string; milestone: string; occurred_at: string; location: string | null }[]>`
    SELECT sh.reference, m.milestone, m.occurred_at::text, m.location
    FROM port_milestones m JOIN shipments sh ON sh.id = m.shipment_id ORDER BY m.occurred_at`;

  type Receipt = (typeof receipts)[number];
  const byLine = new Map<string, Receipt[]>();
  for (const r of receipts) byLine.set(r.po_line_id, [...(byLine.get(r.po_line_id) ?? []), r]);

  return (
    <>
      <DemoBanner isDemo={demo?.any_demo ?? false} />
      <h1>Orders &amp; supply movement</h1>
      <p className="sub">
        What was ordered, from whom, when it was promised, when it actually arrived — and, where a
        delivery came in instalments, each instalment separately. This capability produces no saving;
        it supplies the evidence every mechanism reads.
      </p>

      <div className="card scroll">
        <table>
          <thead>
            <tr>
              <th>Order</th><th>Supplier</th><th>Item</th>
              <th className="num">Quantity</th><th className="num">Unit price</th>
              <th>Ordered</th><th>Promised</th><th>Received</th>
              <th className="num">Lead time</th><th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const rs = byLine.get(l.line_id) ?? [];
              const first = rs[0];
              const lt = l.ordered_at && first ? days(l.ordered_at, first.received_at) : null;
              const late = l.promised_date && first ? days(l.promised_date, first.received_at) : null;
              return (
                <tr key={l.line_id}>
                  <td>
                    <strong>{l.po_number}</strong>
                    <div className="note" style={{ margin: 0 }}>{l.status}</div>
                  </td>
                  <td>
                    {l.supplier}
                    {/* Product scope, read by no mechanism — shown, never relied on. */}
                    <div className="note" style={{ margin: 0 }}>{l.country ?? "—"}</div>
                  </td>
                  <td>{l.item_code}</td>
                  <td className="num">{Number(l.ordered_qty).toLocaleString()} {l.uom}</td>
                  <td className="num">{l.unit_price} {l.currency}</td>
                  <td>{l.ordered_at?.slice(0, 10) ?? "—"}</td>
                  <td>{l.promised_date ?? <span className="note">not recorded</span>}</td>
                  <td>
                    {rs.length === 0 ? (
                      <span className="badge warn">in flight</span>
                    ) : rs.length === 1 ? (
                      rs[0]!.received_at.slice(0, 10)
                    ) : (
                      <>
                        <span className="badge warn">{rs.length} instalments</span>
                        {rs.map((r) => (
                          <div className="note" key={r.sequence} style={{ margin: 0 }}>
                            #{r.sequence} {r.received_at.slice(0, 10)} · {Number(r.nominal_qty).toLocaleString()} {r.nominal_uom}
                          </div>
                        ))}
                      </>
                    )}
                  </td>
                  <td className="num">
                    {lt !== null ? `${lt} d` : "—"}
                    {rs.length > 1 && <div className="note" style={{ margin: 0, fontSize: 11 }}>to first receipt</div>}
                  </td>
                  <td>
                    {l.expedited && <span className="badge bad">expedited</span>}{" "}
                    {l.freight_mode && <span className="badge">{l.freight_mode}</span>}{" "}
                    {late !== null && late > 0 && <span className="badge warn">{late} d late</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="note">
          Lead time is measured to the <strong>first</strong> receipt. Where a delivery arrived in
          instalments the choice is declared rather than assumed — measuring to the final receipt
          would give a different answer, and an undeclared choice is a knob nobody can audit.
        </p>
      </div>

      <h2>ETA — a forecast, and always labelled as one</h2>
      <div className="card">
        {etas.length === 0 ? (
          <p className="note" style={{ margin: 0 }}>No shipments in flight.</p>
        ) : (
          <>
            <table>
              <thead><tr><th>Shipment</th><th>ETA</th><th>Basis</th><th>Source</th><th>Observed</th></tr></thead>
              <tbody>
                {etas.map((e, i) => (
                  <tr key={i}>
                    <td>{e.reference}</td>
                    <td>{e.eta_date}</td>
                    <td><span className="badge warn">{e.basis}</span></td>
                    <td className="note" style={{ margin: 0 }}>{e.source}</td>
                    <td>{e.observed_at.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">
              Every revision is kept. An ETA never becomes an arrival — anything computed from it is
              at best a forecast, and the earlier estimate is not overwritten by the later one.
            </p>
          </>
        )}
      </div>

      {milestones.length > 0 && (
        <>
          <h2>Port and customs milestones</h2>
          <div className="card">
            <table>
              <thead><tr><th>Shipment</th><th>Milestone</th><th>When</th><th>Where</th></tr></thead>
              <tbody>
                {milestones.map((m, i) => (
                  <tr key={i}>
                    <td>{m.reference}</td>
                    <td>{m.milestone.replace(/_/g, " ")}</td>
                    <td>{m.occurred_at.slice(0, 10)}</td>
                    <td className="note" style={{ margin: 0 }}>{m.location ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">
              Milestones are recorded because customs delay is a premium category in its own right.
              Current location and a map are product scope: no locked mechanism reads them, so they
              are not built ahead of things that do.
            </p>
          </div>
        </>
      )}
    </>
  );
}
