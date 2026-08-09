/**
 * OPPORTUNITIES — the reasoning made inspectable.
 *
 * Every claim shows its intervention, its counterfactual, every gate with its
 * outcome, and — where currency is refused — exactly what was missing. A reader
 * who disagrees with the number can see the step they disagree with.
 */
import { firstSiteId, runDetection } from "../../lib/engine/run";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

const gateClass = (o: string) => (o === "PASS" ? "ok" : o === "FAIL" ? "bad" : "warn");

export default async function Opportunities() {
  const siteId = await firstSiteId();
  if (!siteId) return <h1>No data</h1>;
  const r = await runDetection(siteId, AS_OF);

  return (
    <>
      <DemoBanner isDemo={r.isDemo} />
      <h1>Opportunities</h1>
      <p className="sub">
        Only findings of class <strong>Opportunity</strong> can contribute to Potential Annual Saving.
        Observed costs and exposures appear elsewhere and are structurally incapable of entering it.
      </p>

      {r.opportunities.length === 0 && (
        <div className="card">
          <p className="note" style={{ margin: 0 }}>
            No opportunity has been detected. That is a result, not a failure — the mechanism refuses
            to produce a finding it cannot evidence.
          </p>
        </div>
      )}

      {r.opportunities.map((o) => {
        const netKnown = o.netImpact.value !== null;
        const grossKnown = o.recurringImpact.value !== null;
        return (
          <div className="card" key={o.id} id={o.id}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`badge ${o.ladder === "OPPORTUNITY_DETECTED" ? "warn" : "ok"}`}>{o.ladder.replace(/_/g, " ")}</span>
              <span className="badge">{o.lifecycle}</span>
              <span className="badge">{o.mechanism}</span>
            </div>
            <h2 style={{ marginTop: 12 }}>{o.title}</h2>

            <div className="figure">
              {netKnown ? `${o.netImpact.value!.toFixed(2)}` : "Not calculable"}
              {netKnown && <span className="cur">{o.netImpact.unit} net / yr</span>}
            </div>
            <div className="note">basis {o.netImpact.basis}</div>

            {!netKnown && (
              <ul className="reasons">
                {o.netImpact.limitations.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            )}
            {grossKnown && (
              <p className="note">
                Gross premium observed: <strong>{o.recurringImpact.value!.toFixed(2)} {o.recurringImpact.unit}</strong>
                {" — an ACTUAL fact. It is not a saving until its offset is established."}
              </p>
            )}
            {o.netExcludesUnvaluedRisk && (
              <p className="note" style={{ color: "var(--warn)" }}>
                ⚠ This figure excludes an exposure that cannot be valued, so it is optimistic by an
                unquantified amount. The correction also <strong>reduces</strong> stockout exposure — disclosed,
                never netted, because valuing it needs production data that is out of scope.
              </p>
            )}

            <h3>The intervention</h3>
            <p style={{ margin: "4px 0" }}>{o.statedIntervention}</p>
            <h3>The counterfactual</h3>
            <p className="note" style={{ margin: "4px 0" }}>{o.counterfactual}</p>

            <h3>Evidence gates</h3>
            <p className="note" style={{ margin: "0 0 6px" }}>
              Pass, fail or unestablished. Never averaged, never a score — and unestablished is never a pass.
            </p>
            <div>
              {o.gates.map((g) => (
                <div className="gate" key={g.gate}>
                  <span className={`badge ${gateClass(g.outcome)}`}>{g.outcome}</span>
                  <span className="n">{g.gate}</span>
                  <span className="note" style={{ margin: 0 }}>{g.detail}</span>
                </div>
              ))}
            </div>

            <h3>Accountability</h3>
            <dl className="kv">
              <dt>Finding owner</dt><dd>{o.findingOwner ?? <em>unowned — visibly so</em>}</dd>
              <dt>Action owner</dt><dd>{o.actionOwner ?? <em>unowned — visibly so</em>}</dd>
              <dt>Data owner</dt><dd>{o.dataOwner ?? <em>unowned — visibly so</em>}</dd>
              <dt>Approval</dt>
              <dd className="note">
                A currency claim requires an adjudicator independent of the decision that produced it.
              </dd>
            </dl>

            <h3>Intervention signature</h3>
            <p className="note" style={{ margin: "0 0 6px" }}>
              Declared so conflicts with other recommendations can be detected. An opportunity without
              one cannot be presented.
            </p>
            <table>
              <thead><tr><th>Dimension</th><th>Direction</th><th>Window</th></tr></thead>
              <tbody>
                {o.signature.effects.map((e, i) => (
                  <tr key={i}>
                    <td>{e.dimension}</td>
                    <td>{e.direction}</td>
                    <td>{e.windowFrom.toISOString().slice(0, 10)} → {e.windowTo.toISOString().slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {r.contradictions.length > 0 && (
        <>
          <h2>Contradictions</h2>
          <p className="sub">These recommendations cannot both be executed and must be resolved before action.</p>
          {r.contradictions.map((c, i) => (
            <div className="card" key={i}>
              <span className="badge bad">CONTRADICTION</span>
              <p style={{ margin: "10px 0 0" }}>{c.why}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}
