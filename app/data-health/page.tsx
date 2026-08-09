/**
 * DATA HEALTH — can this data be trusted, and what is it missing?
 *
 * This page exists before Inventory in the journey for a reason: a saving engine
 * over untrustworthy stock data produces confident nonsense.
 */
import { sql } from "../../lib/db/client";
import { firstSiteId, runDetection } from "../../lib/engine/run";
import { verifyProjection } from "../../lib/ledger/post";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

export default async function DataHealth() {
  const siteId = await firstSiteId();
  if (!siteId) return <h1>No data</h1>;

  const batches = await sql<{ id: string; filename: string; kind: string; status: string; rows_total: number; rows_accepted: number; rows_rejected: number; is_demo: boolean; uploaded_at: string }[]>`
    SELECT id, filename, kind, status, rows_total, rows_accepted, rows_rejected, is_demo, uploaded_at::text
    FROM import_batches ORDER BY uploaded_at DESC`;

  const items = await sql<{ id: string; code: string }[]>`SELECT id, code FROM items ORDER BY code`;
  const checks = await Promise.all(items.map(async (i) => ({ code: i.code, v: await verifyProjection(i.id, AS_OF) })));
  const disagreements = checks.filter((c) => !c.v.agreed);

  const [stale] = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM cost_references WHERE as_of < now() - interval '180 days'`;

  const r = await runDetection(siteId, AS_OF);

  return (
    <>
      <DemoBanner isDemo={r.isDemo} />
      <h1>Data health</h1>
      <p className="sub">
        What the system knows, what it does not, and whether its own arithmetic reconciles.
      </p>

      <h2>Ledger integrity</h2>
      <div className="card">
        <dl className="kv">
          <dt>Balance reconciliation</dt>
          <dd>
            {disagreements.length === 0 ? (
              <span className="badge ok">all {checks.length} items reconcile</span>
            ) : (
              <span className="badge bad">{disagreements.length} disagree</span>
            )}
            <div className="note">
              Stored projections recomputed independently from full history. A disagreement is a
              defect, not a rounding difference.
            </div>
          </dd>
          <dt>Cost reference freshness</dt>
          <dd>
            {(stale?.n ?? 0) > 0
              ? <span className="badge warn">{stale!.n} reference(s) over 180 days old</span>
              : <span className="badge ok">current</span>}
            <div className="note">
              A stale cost import makes every figure resting on it stale, and the system must say so
              rather than presenting confident numbers over aged inputs.
            </div>
          </dd>
        </dl>
      </div>

      <h2>Imports</h2>
      <div className="card scroll">
        <table>
          <thead><tr><th>File</th><th>Kind</th><th>Status</th><th className="num">Rows</th><th className="num">Accepted</th><th className="num">Rejected</th><th>Origin</th></tr></thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td>{b.filename}</td>
                <td>{b.kind}</td>
                <td><span className={`badge ${b.status === "ACCEPTED" ? "ok" : b.status === "PARTIAL" ? "warn" : "bad"}`}>{b.status}</span></td>
                <td className="num">{b.rows_total}</td>
                <td className="num">{b.rows_accepted}</td>
                <td className="num">{b.rows_rejected}</td>
                <td>{b.is_demo ? <span className="badge warn">DEMO</span> : <span className="badge ok">factory</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="note">
          Rejected rows are preserved exactly as submitted. Nothing is repaired or guessed — a value
          the system cannot understand is never treated as zero or defaulted.
        </p>
      </div>

      <h2>Evidence gaps</h2>
      <p className="sub">Data the factory does not record, and what each one blocks.</p>
      <div className="card">
        {r.evidenceGaps.length === 0 && <p className="note" style={{ margin: 0 }}>None raised.</p>}
        <table>
          <tbody>
            {r.evidenceGaps.map((g) => (
              <tr key={g.id}>
                <td style={{ width: 90 }}><span className="badge">{g.factoryDataRef}</span></td>
                <td>
                  {g.missingEvidence}
                  <div className="note">{g.blocks}</div>
                </td>
                <td className="num">{g.observedSpend?.value ? `${g.observedSpend.value.toFixed(2)} ${g.observedSpend.unit}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
