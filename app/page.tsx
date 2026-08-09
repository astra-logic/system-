/**
 * TODAY — "what needs my attention?"
 *
 * Core mission §10's hierarchy: DECISION → EXPLANATION → EVIDENCE → DETAIL.
 * The headline figure appears with its caveats attached, never as a bare number,
 * because D-012 and D-041 both require the number to carry what is wrong with it.
 */
import { sql } from "../lib/db/client";
import { firstSiteId, runDetection } from "../lib/engine/run";
import { DemoBanner } from "./demo-banner";

export const dynamic = "force-dynamic";

/** The as-of instant is explicit so a run is reproducible (U-16's rule). */
const AS_OF = new Date("2027-01-01T00:00:00Z");

export default async function Today() {
  const siteId = await firstSiteId();
  if (!siteId) {
    return (
      <>
        <h1>No data yet</h1>
        <p className="sub">Run <code>npm run db:seed</code> to load the demo fixtures, or import factory data.</p>
      </>
    );
  }

  const r = await runDetection(siteId, AS_OF);
  const h = r.headline;

  const [counts] = await sql<{ items: number; movements: number; open_orders: number; gaps: number }[]>`
    SELECT (SELECT COUNT(*)::int FROM items WHERE site_id = ${siteId}::uuid) AS items,
           (SELECT COUNT(*)::int FROM movements WHERE site_id = ${siteId}::uuid) AS movements,
           (SELECT COUNT(*)::int FROM purchase_orders WHERE site_id = ${siteId}::uuid AND status = 'SENT') AS open_orders,
           0 AS gaps`;

  const range =
    h.basis === "INSUFFICIENT_DATA"
      ? "Not yet calculable"
      : h.lower.equals(h.upper)
        ? h.lower.toFixed(2)
        : `${h.lower.toFixed(2)} – ${h.upper.toFixed(2)}`;

  return (
    <>
      <DemoBanner isDemo={r.isDemo} />
      <h1>Today</h1>
      <p className="sub">
        As of {AS_OF.toISOString().slice(0, 10)}. Every figure below traces to recorded movements and
        documents, and every refusal names what was missing.
      </p>

      <div className="card">
        <div className="badge">Potential Annual Saving · recurring only</div>
        <div className="figure">
          {range}
          {h.basis !== "INSUFFICIENT_DATA" && <span className="cur">{h.currency}</span>}
          {h.isLowerBound && <span className="cur">lower bound</span>}
        </div>
        <div className="note">
          basis <strong>{h.basis}</strong> · realised {h.realisedVersusIdentified.realised} of{" "}
          {h.realisedVersusIdentified.identified} identified
        </div>
        <ul className="reasons">
          {h.statements.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      {h.excluded.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Identified but excluded from the figure</h3>
          <p className="note">
            These are real findings whose money cannot yet be defensibly claimed. They are shown
            rather than dropped — the total above omits them, and the omission is favourable.
          </p>
          <table>
            <thead>
              <tr>
                <th>Finding</th>
                <th>Why it is excluded</th>
                <th className="num">Observed magnitude</th>
              </tr>
            </thead>
            <tbody>
              {h.excluded.map((e) => (
                <tr key={e.opportunityId}>
                  <td>
                    <a href={`/opportunities#${encodeURIComponent(e.opportunityId)}`}>{e.title}</a>
                  </td>
                  <td className="note" style={{ margin: 0 }}>{e.reason}</td>
                  <td className="num">
                    {e.observedMagnitude ? `${e.observedMagnitude.toFixed(2)} ${h.currency}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>What needs attention</h2>
      <div className="card">
        <dl className="kv">
          <dt>Opportunities detected</dt>
          <dd>
            {r.opportunities.length} · <a href="/opportunities">review</a>
          </dd>
          <dt>Evidence gaps</dt>
          <dd>
            {r.evidenceGaps.length} — data the factory does not record, blocking claims we could
            otherwise make
          </dd>
          <dt>Contradictions</dt>
          <dd>
            {r.contradictions.length}
            {r.contradictions.length === 0 && (
              <span className="note"> — no two recommendations oppose each other</span>
            )}
          </dd>
          <dt>Open orders in flight</dt>
          <dd>
            {counts?.open_orders ?? 0} · <a href="/orders">track</a>
          </dd>
          <dt>Items · movements recorded</dt>
          <dd>
            {counts?.items ?? 0} · {counts?.movements ?? 0}
          </dd>
        </dl>
      </div>

      {r.evidenceGaps.length > 0 && (
        <>
          <h2>Evidence gaps</h2>
          <p className="sub">
            Prioritised by <strong>observed spend</strong> — a fact we can see — never by suspected
            opportunity, which we cannot.
          </p>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>What is missing</th>
                  <th className="num">Observed spend</th>
                </tr>
              </thead>
              <tbody>
                {r.evidenceGaps.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <span className="badge">{g.factoryDataRef}</span>
                    </td>
                    <td>
                      {g.missingEvidence}
                      <div className="note">{g.blocks}</div>
                    </td>
                    <td className="num">
                      {g.observedSpend?.value ? `${g.observedSpend.value.toFixed(2)} ${g.observedSpend.unit}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
