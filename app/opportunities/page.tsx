/**
 * OPPORTUNITIES — the persisted list.
 *
 * Reads findings from the database rather than recomputing them, so what is
 * shown is what was recorded, and it survives the request that produced it.
 * Detection is triggered explicitly and writes a new run.
 */
import { revalidatePath } from "next/cache";
import { currentOpportunities } from "../../lib/engine/persist";
import { evaluateContradictions, recordContradictions } from "../../lib/engine/contradiction-service";
import { firstSiteId, runAndPersist } from "../../lib/engine/run";
import { sql } from "../../lib/db/client";
import { money } from "../../lib/ui/format";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

async function detect(): Promise<void> {
  "use server";
  const siteId = await firstSiteId();
  if (!siteId) return;
  await runAndPersist(siteId, AS_OF);
  const report = await evaluateContradictions(siteId);
  await recordContradictions(report);
  revalidatePath("/opportunities");
  revalidatePath("/");
}

export default async function Opportunities() {
  const siteId = await firstSiteId();
  if (!siteId) return <h1>No data</h1>;

  const [findings, contradictions] = await Promise.all([
    currentOpportunities(siteId),
    evaluateContradictions(siteId),
  ]);
  const [demo] = await sql<{ d: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS d FROM opportunities WHERE site_id = ${siteId}::uuid`;
  const blocked = new Set(contradictions.blockedOpportunityIds);

  return (
    <>
      <DemoBanner isDemo={demo?.d ?? false} />
      <h1>Opportunities</h1>
      <p className="sub">
        Only findings of class <strong>Opportunity</strong> can contribute to Potential Annual Saving.
        Observed costs and exposures are separate classes and are structurally incapable of entering it.
      </p>

      <div className="card">
        <form action={detect}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="submit" style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--accent)", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Run detection
            </button>
            <span className="note" style={{ margin: 0 }}>
              Writes a new run as of {AS_OF.toISOString().slice(0, 10)}. An unchanged finding is not
              rewritten; a changed one supersedes its predecessor rather than overwriting it.
            </span>
          </div>
        </form>
      </div>

      {findings.length === 0 && (
        <div className="card">
          <p className="note" style={{ margin: 0 }}>
            No finding has been recorded yet. Run detection above. A run that produces nothing is a
            result, not a failure — the mechanism refuses to report what it cannot evidence.
          </p>
        </div>
      )}

      <div className="card scroll">
        {findings.length > 0 && (
          <table>
            <thead>
              <tr><th>Finding</th><th>Item</th><th>State</th><th>Ladder</th><th className="num">Net / yr</th><th>Flags</th></tr>
            </thead>
            <tbody>
              {findings.map((f) => {
                const net = f.netImpact as Record<string, unknown> | null;
                const val = net?.["value"] as string | null;
                return (
                  <tr key={f.id}>
                    <td><a href={`/opportunities/${f.id}`}>{f.title}</a></td>
                    <td>{f.itemCode ?? "—"}</td>
                    <td><span className={`badge ${f.lifecycle === "APPROVED" ? "ok" : f.lifecycle === "REJECTED" ? "bad" : ""}`}>{f.lifecycle}</span></td>
                    <td className="note" style={{ margin: 0 }}>{f.ladder.replace(/_/g, " ")}</td>
                    {/* Law 9: rendered the raw stored string before Block 13. */}
                    <td className="num">{val ? money(val, String(net?.["unit"] ?? "")) : <span className="badge warn">not calculable</span>}</td>
                    <td>
                      {blocked.has(f.id) && <span className="badge bad">blocked</span>}{" "}
                      {f.netExcludesUnvaluedRisk && <span className="badge warn">excludes unvalued risk</span>}{" "}
                      {f.isDemo && <span className="badge warn">DEMO</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <h2>Contradiction control</h2>
      <div className="card">
        <p className="note" style={{ marginTop: 0 }}>{contradictions.note}</p>
        {contradictions.contradictions.length === 0 ? (
          <p className="note" style={{ margin: 0 }}>
            No contradiction among the {contradictions.evaluated} finding(s) currently live.
          </p>
        ) : (
          contradictions.contradictions.map((c, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <span className={`badge ${c.resolved ? "warn" : "bad"}`}>{c.resolved ? `RESOLVED — ${c.resolution}` : "UNRESOLVED"}</span>
              <p style={{ margin: "8px 0 0" }}>
                <a href={`/opportunities/${c.leftId}`}>{c.leftTitle}</a> vs{" "}
                <a href={`/opportunities/${c.rightId}`}>{c.rightTitle}</a>
              </p>
              <p className="note" style={{ margin: "4px 0 0" }}>{c.why}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
