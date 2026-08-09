/**
 * INVENTORY — quantity truth.
 *
 * F3: every stock number states WHICH quantity it is. An unlabelled figure is a
 * defect. `Reserved` is shown as zero rather than hidden (D-050) — removing it
 * would make the vocabulary incomplete and invite a later redefinition.
 */
import { sql } from "../../lib/db/client";
import { positionAt } from "../../lib/ledger/post";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

export default async function Inventory() {
  const items = await sql<{ id: string; code: string; name: string; stock_uom: string; catch_weight: boolean; nominal_uom: string | null; lead_time_days: number | null }[]>`
    SELECT id, code, name, stock_uom, catch_weight, nominal_uom, lead_time_days FROM items ORDER BY code`;
  const [demo] = await sql<{ any_demo: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS any_demo FROM import_batches`;

  const rows = await Promise.all(items.map(async (i) => ({ item: i, pos: await positionAt(i.id, AS_OF) })));

  return (
    <>
      <DemoBanner isDemo={demo?.any_demo ?? false} />
      <h1>Inventory</h1>
      <p className="sub">
        Balances at {AS_OF.toISOString().slice(0, 10)}, reconstructed from the movement ledger rather
        than read from a stored total. Every column says which quantity it is.
      </p>

      <div className="card scroll">
        <table>
          <thead>
            <tr>
              <th>Item</th><th>Type</th>
              <th className="num">On hand</th><th className="num">Reserved</th>
              <th className="num">Quality hold</th><th className="num">Available</th>
              <th className="num">Master lead time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, pos }) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.code}</strong>
                  <div className="note" style={{ margin: 0 }}>{item.name}</div>
                </td>
                <td>
                  {item.catch_weight ? (
                    <span className="badge warn">catch-weight · {item.nominal_uom} → {item.stock_uom}</span>
                  ) : (
                    <span className="badge">{item.stock_uom}</span>
                  )}
                </td>
                <td className="num">{pos.onHand.toFixed(3)}</td>
                <td className="num">
                  {pos.reserved.toFixed(3)}
                  <div className="note" style={{ margin: 0, fontSize: 11 }}>no source of commitment</div>
                </td>
                <td className="num">{pos.qualityHold.toFixed(3)}</td>
                <td className="num"><strong>{pos.available.toFixed(3)}</strong></td>
                <td className="num">{item.lead_time_days ?? <span className="badge warn">not maintained</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="note">
        Catch-weight items balance on <strong>actual weight</strong>, not on the units ordered. A
        movement awaiting weighing does not post — it is never posted with an estimated weight.
      </p>
    </>
  );
}
