/**
 * DATA HEALTH — can this data be trusted, and what is it missing?
 *
 * This page exists before Inventory in the journey for a reason: a saving engine
 * over untrustworthy stock data produces confident nonsense.
 */
import { sql } from "../../lib/db/client";
import { firstSiteId } from "../../lib/engine/run";
import { currentEvidenceGaps } from "../../lib/engine/persist";
import { verifyProjection } from "../../lib/ledger/verify";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

export default async function DataHealth() {
  const siteId = await firstSiteId();
  if (!siteId) return <h1>No data</h1>;

  const batches = await sql<{ id: string; filename: string; kind: string; status: string; rows_total: number; rows_accepted: number; rows_rejected: number; is_demo: boolean; uploaded_at: string }[]>`
    SELECT id, filename, kind, status, rows_total, rows_accepted, rows_rejected, is_demo, uploaded_at::text
    FROM import_batches ORDER BY uploaded_at DESC`;

  const verification = await verifyProjection();

  /**
   * ⚠ CORRECTED (Block 7). This previously counted references older than an
   * INVENTED 180-day threshold. `N-09` — the staleness threshold — is unanswered,
   * so the system may not decide where "current" ends. It states the AGE of the
   * oldest reference and lets the reader judge, exactly as the offset does.
   */
  const [oldest] = await sql<{ age_days: number | null; as_of: string | null }[]>`
    SELECT EXTRACT(DAY FROM (now() - MIN(as_of)))::int AS age_days, MIN(as_of)::text AS as_of
    FROM cost_references`;

  const gaps = await currentEvidenceGaps(siteId);

  return (
    <>
      <DemoBanner isDemo={batches.some((b) => b.is_demo)} />
      <h1>Data health</h1>
      <p className="sub">
        What the system knows, what it does not, and whether its own arithmetic reconciles.
      </p>

      <h2>Ledger integrity</h2>
      <div className="card">
        <dl className="kv">
          <dt>Balance reconciliation</dt>
          <dd>
            {verification.agreed ? (
              <span className="badge ok">all {verification.locationsChecked} (item, location) pairs reconcile</span>
            ) : (
              <span className="badge bad">{verification.discrepancies.length} discrepancies</span>
            )}
            <div className="note">
              The projection is maintained by incremental upserts; this recomputes every
              (item, location) balance by full aggregation over the movement history and compares
              them. Different mechanism, different traversal — so a drifted, missing, duplicated or
              misplaced row changes one side and not the other. A disagreement is a defect, not a
              rounding difference.
            </div>
            {!verification.agreed && (
              <table style={{ marginTop: 10 }}>
                <thead><tr><th>Item</th><th>Location</th><th>Kind</th><th className="num">Projected</th><th className="num">From history</th><th className="num">Difference</th></tr></thead>
                <tbody>
                  {verification.discrepancies.map((x, i) => (
                    <tr key={i}>
                      <td>{x.itemCode}</td><td>{x.locationCode}</td>
                      <td><span className="badge bad">{x.kind}</span></td>
                      <td className="num">{x.projected.toFixed(3)}</td>
                      <td className="num">{x.recomputed.toFixed(3)}</td>
                      <td className="num">{x.difference.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </dd>
          <dt>Ledger well-formedness</dt>
          <dd>
            {verification.conservationHolds
              ? <span className="badge ok">every movement has two distinct endpoints</span>
              : <span className="badge bad">malformed movements found</span>}
            <div className="note">
              Reported separately, and deliberately: conservation says the ledger is well-formed. It
              says nothing about whether the projection is right, and presenting it as though it did
              was the defect the Block 6 audit found.
            </div>
          </dd>
          <dt>Cost reference freshness</dt>
          <dd>
            {oldest?.age_days === null || oldest?.age_days === undefined
              ? <span className="badge">no cost references imported</span>
              : <span className="badge">oldest reference is {oldest.age_days} days old</span>}
            <div className="note">
              ⚠ Stated, not classified. <code>N-09</code> — the point at which a cost reference
              becomes stale — has not been answered, so the system reports the age and declines to
              decide where &ldquo;current&rdquo; ends. Inventing that threshold would put an
              undeclared constant underneath every financial figure that rests on imported cost.
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
        {gaps.length === 0 && <p className="note" style={{ margin: 0 }}>None recorded. Run detection to raise them.</p>}
        <table>
          <tbody>
            {gaps.map((g) => {
              const spend = g.observed_spend as Record<string, unknown> | null;
              return (
                <tr key={g.id}>
                  <td style={{ width: 90 }}><span className="badge">{g.factory_data_ref}</span></td>
                  <td>
                    {g.missing_evidence}
                    <div className="note">{g.blocks}</div>
                  </td>
                  <td className="num">{spend?.["value"] ? `${spend["value"]} ${spend["unit"]}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
