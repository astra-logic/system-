/**
 * FINDING DETAIL AND REVIEW.
 *
 * The reasoning is inspectable: every gate, every piece of evidence, the
 * intervention signature, and — where currency is refused — exactly what was
 * missing. A reader who disagrees with the number can see the step they
 * disagree with.
 *
 * ⚠ Approval is not realization. This screen can move a finding to APPROVED or
 * REJECTED and nothing further. REALIZED requires measurement against the
 * captured baseline over D-022's twelve-month window.
 */
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { evidenceFor, gatesFor, getOpportunity, signatureFor, versionHistory } from "../../../lib/engine/persist";
import { baselineFor, checkIndependence, decisionFor, reviewOpportunity } from "../../../lib/engine/review";
import { evaluateContradictions } from "../../../lib/engine/contradiction-service";
import { firstSiteId } from "../../../lib/engine/run";
import { money, moneyExact } from "../../../lib/ui/format";
import { DemoBanner } from "../../demo-banner";

export const dynamic = "force-dynamic";

const gateClass = (o: string) => (o === "PASS" ? "ok" : o === "FAIL" ? "bad" : "warn");

function envelope(e: Record<string, unknown> | null) {
  if (!e) return null;
  return {
    value: (e["value"] as string | null) ?? null,
    unit: String(e["unit"] ?? ""),
    basis: String(e["basis"] ?? ""),
    limitations: (e["limitations"] as string[]) ?? [],
    coverage: (e["coverage"] as string[]) ?? [],
  };
}

async function decide(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("id"));
  const action = String(formData.get("action")) as "APPROVE" | "REJECT";
  const rationale = String(formData.get("rationale") ?? "");
  const adjudicator = String(formData.get("adjudicator") ?? "");
  const acceptSelfAdjudication = formData.get("acceptConflict") === "on";
  try {
    await reviewOpportunity({ opportunityId: id, action, adjudicator, rationale, acceptSelfAdjudication });
  } catch (e) {
    // Surfaced on reload via the independence panel; never silently swallowed.
    console.error("[review refused]", (e as Error).message);
  }
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/opportunities");
  revalidatePath("/");
}

export default async function FindingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOpportunity(id);
  if (!o) notFound();

  const siteId = await firstSiteId();
  const [gates, evidence, signature, decision, baseline, history, contradictions] = await Promise.all([
    gatesFor(o.id),
    evidenceFor(o.id),
    signatureFor(o.id),
    decisionFor(o.id),
    baselineFor(o.id),
    o.naturalKey ? versionHistory(o.naturalKey) : Promise.resolve([]),
    siteId ? evaluateContradictions(siteId) : Promise.resolve(null),
  ]);

  const net = envelope(o.netImpact);
  const gross = envelope(o.recurringImpact);
  const offset = envelope(o.incrementalCost);
  const blocked = contradictions?.blockedOpportunityIds.includes(o.id) ?? false;
  const independence = await checkIndependence(o.id, "fin");

  return (
    <>
      <DemoBanner isDemo={o.isDemo} />
      <p className="note" style={{ marginTop: 24 }}><a href="/opportunities">← All findings</a></p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className={`badge ${o.lifecycle === "APPROVED" ? "ok" : o.lifecycle === "REJECTED" ? "bad" : ""}`}>{o.lifecycle}</span>
        <span className={`badge ${o.ladder === "OPPORTUNITY_DETECTED" ? "warn" : "ok"}`}>{o.ladder.replace(/_/g, " ")}</span>
        <span className="badge">{o.mechanism}</span>
        {o.supersededAt && <span className="badge bad">SUPERSEDED</span>}
      </div>

      <h1 style={{ marginTop: 12 }}>{o.title}</h1>

      {blocked && (
        <div className="card" style={{ borderColor: "var(--bad)" }}>
          <span className="badge bad">RELEASE BLOCKED</span>
          <p style={{ margin: "10px 0 0" }}>
            This finding contradicts another live recommendation. Opposed actions must resolve —
            net, suspend, supersede or adjudicate — <strong>before presentation</strong>, because
            presenting either alone would hide that they cannot both be executed.
          </p>
        </div>
      )}

      {/* ── Money ─────────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="badge">Net, recurring, per year</div>
        <div className="figure">
          {/* Law 9: the ONE formatting boundary. This rendered the raw stored
              string before Block 13 — 21 decimal places, to a factory manager. */}
          {net?.value ? money(net.value, "") : "Not calculable"}
          {net?.value && <span className="cur">{net.unit}</span>}
        </div>
        <div className="note">basis {net?.basis}</div>
        {!net?.value && (
          <ul className="reasons">{net?.limitations.map((l, i) => <li key={i}>{l}</li>)}</ul>
        )}
        {o.netExcludesUnvaluedRisk && (
          <p className="note" style={{ color: "var(--warn)" }}>
            ⚠ This figure excludes an exposure that cannot be valued, so it is optimistic by an
            unquantified amount. The correction also <strong>reduces</strong> stockout exposure —
            disclosed, never netted, because valuing it needs production data that is out of scope.
          </p>
        )}

        <table style={{ marginTop: 14 }}>
          <tbody>
            <tr>
              <td>Gross premium observed</td>
              <td className="num">
                {gross?.value ? moneyExact(gross.value, gross.unit) : "—"}
                <div className="note" style={{ margin: 0 }}>an ACTUAL fact: this money was spent</div>
              </td>
            </tr>
            <tr>
              <td>Incremental cost (offset)</td>
              <td className="num">
                {offset?.value ? moneyExact(offset.value, offset.unit) : <span className="badge warn">not established</span>}
                <div className="note" style={{ margin: 0 }}>
                  {offset?.value ? "netted per rule 6" : "the net is refused until this is known"}
                </div>
              </td>
            </tr>
            <tr>
              <td>One-time impact</td>
              <td className="num">
                {moneyExact(envelope(o.oneTimeImpact)?.value ?? "0", "")}
                <div className="note" style={{ margin: 0 }}>reported separately, never summed into the annual figure</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Reasoning ─────────────────────────────────────────────────────── */}
      <h2>The intervention</h2>
      <div className="card"><p style={{ margin: 0 }}>{o.statedIntervention}</p></div>

      <h2>The counterfactual</h2>
      <div className="card"><p className="note" style={{ margin: 0 }}>{o.counterfactual}</p></div>

      <h2>Evidence gates</h2>
      <div className="card">
        <p className="note" style={{ margin: "0 0 8px" }}>
          Pass, fail or unestablished. Never averaged, never a score — and unestablished is never a pass.
        </p>
        {gates.map((g) => (
          <div className="gate" key={g.gate}>
            <span className={`badge ${gateClass(g.outcome)}`}>{g.outcome}</span>
            <span className="n">{g.gate}</span>
            <span className="note" style={{ margin: 0 }}>{g.detail}</span>
          </div>
        ))}
      </div>

      <h2>Evidence this figure rests on</h2>
      <div className="card scroll">
        {evidence.length === 0 ? (
          <p className="note" style={{ margin: 0 }}>No evidence references recorded for this version.</p>
        ) : (
          <table>
            <thead><tr><th>Kind</th><th>Reference</th><th>Basis</th><th>Effective</th></tr></thead>
            <tbody>
              {evidence.map((e, i) => (
                <tr key={i}>
                  <td>{e.kind}</td>
                  <td style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{e.ref}</td>
                  <td><span className="badge">{e.basis}</span></td>
                  <td>{e.as_of.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2>Intervention signature</h2>
      <div className="card">
        <table>
          <thead><tr><th>Dimension</th><th>Direction</th><th>Window</th></tr></thead>
          <tbody>
            {signature.map((s, i) => (
              <tr key={i}>
                <td>{s.dimension}</td>
                <td>{s.direction}</td>
                <td>{s.window_from.slice(0, 10)} → {s.window_to.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="note">
          Declared so conflicts with other recommendations can be detected. A conflict requires
          subject, dimension, opposed direction and overlapping window to <strong>all</strong> intersect —
          which is why acting on a different component of the same parameter composes rather than conflicts.
        </p>
      </div>

      {/* ── Review ────────────────────────────────────────────────────────── */}
      <h2>Review</h2>
      {decision ? (
        <div className="card">
          <span className={`badge ${decision.action === "APPROVE" ? "ok" : "bad"}`}>{decision.action}D</span>
          <dl className="kv" style={{ marginTop: 12 }}>
            <dt>Decided by</dt><dd>{decision.decided_by}</dd>
            <dt>When</dt><dd>{decision.decided_at.slice(0, 16).replace("T", " ")}</dd>
            <dt>Rationale</dt><dd>{decision.rationale}</dd>
            <dt>Adjudicator independent</dt>
            <dd>
              {decision.adjudicator_independent
                ? <span className="badge ok">yes</span>
                : <span className="badge warn">no — conflict recorded, not hidden</span>}
              <div className="note">{decision.independence_note}</div>
            </dd>
            <dt>Checked against</dt>
            <dd className="note">{(decision.checked_against ?? []).join(", ") || "no classifier recorded"}</dd>
          </dl>
          <p className="note" style={{ color: "var(--warn)" }}>
            ⚠ Approved is not realized. A saving is realized only when measured against the baseline
            below, over a twelve-month window, with confounders considered.
          </p>
        </div>
      ) : o.supersededAt ? (
        <div className="card">
          <p className="note" style={{ margin: 0 }}>
            This version has been superseded by a later calculation and cannot be decided. Review the
            current version instead — deciding here would attach a decision to a figure no longer shown.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="note" style={{ marginBottom: 12 }}>
            <strong>Independence check.</strong> {independence.note}
            {independence.uncheckable.length > 0 && (
              <div style={{ marginTop: 6 }}>
                ⚠ Could not be checked: {independence.uncheckable.join(", ")} — the system does not
                record who raised or approved the order.
              </div>
            )}
          </div>
          <form action={decide}>
            <input type="hidden" name="id" value={o.id} />
            <div style={{ display: "grid", gap: 12, maxWidth: 620 }}>
              <label>
                <div className="note" style={{ margin: "0 0 4px" }}>Adjudicator</div>
                <input name="adjudicator" defaultValue="fin" required style={inputStyle} />
              </label>
              <label>
                <div className="note" style={{ margin: "0 0 4px" }}>Rationale (required — rejections must be analysable)</div>
                <textarea name="rationale" rows={3} required style={{ ...inputStyle, fontFamily: "inherit" }} />
              </label>
              {!independence.independent && (
                <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <input type="checkbox" name="acceptConflict" style={{ marginTop: 3 }} />
                  <span className="note" style={{ margin: 0 }}>
                    I accept that this is self-adjudication. The conflict will be <strong>recorded on
                    the decision</strong> and shown wherever this finding appears.
                  </span>
                </label>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" name="action" value="APPROVE" style={btn("var(--ok)")}>Approve</button>
                <button type="submit" name="action" value="REJECT" style={btn("var(--bad)")}>Reject</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {baseline && (
        <>
          <h2>Baseline captured at approval</h2>
          <div className="card">
            <dl className="kv">
              <dt>Method</dt><dd><code>{baseline.method}</code></dd>
              <dt>Captured</dt><dd>{baseline.captured_at.slice(0, 16).replace("T", " ")}</dd>
            </dl>
            <p className="note">
              A snapshot of <strong>inputs and method</strong>, not only an output — so the figure can
              be recomputed later and compared against what actually happened. A stored number cannot
              be re-verified.
            </p>
            <details>
              <summary className="note" style={{ cursor: "pointer" }}>Inputs recorded</summary>
              <pre style={preStyle}>{JSON.stringify(baseline.inputs, null, 2)}</pre>
            </details>
          </div>
        </>
      )}

      {history.length > 1 && (
        <>
          <h2>Version history</h2>
          <div className="card">
            <p className="note" style={{ marginTop: 0 }}>
              A recalculation writes a new version beside the old one. History is superseded, never
              overwritten — the same discipline the stock ledger applies.
            </p>
            <table>
              <thead><tr><th>Version</th><th>Net</th><th>Ladder</th><th>State</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>
                      {h.id === o.id ? <strong>this version</strong> : <a href={`/opportunities/${h.id}`}>{h.id.slice(0, 8)}</a>}
                    </td>
                    <td className="num">{money(envelope(h.netImpact)?.value, "")}</td>
                    <td className="note" style={{ margin: 0 }}>{h.ladder.replace(/_/g, " ")}</td>
                    <td>{h.supersededAt ? <span className="badge">superseded</span> : <span className="badge ok">current</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2>Accountability</h2>
      <div className="card">
        <dl className="kv">
          <dt>Finding owner</dt><dd>{o.findingOwner ?? <em>unowned — visibly so</em>}</dd>
          <dt>Action owner</dt><dd>{o.actionOwner ?? <em>unowned — visibly so</em>}</dd>
          <dt>Data owner</dt><dd>{o.dataOwner ?? <em>unowned — visibly so</em>}</dd>
        </dl>
      </div>
    </>
  );
}

const inputStyle = {
  padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)",
  background: "var(--surface)", color: "var(--ink)", fontSize: 14, width: "100%",
} as const;

const preStyle = {
  fontSize: 12, background: "var(--bg)", padding: 12, borderRadius: 8,
  overflowX: "auto" as const, border: "1px solid var(--line)", marginTop: 8,
};

const btn = (colour: string) => ({
  padding: "9px 18px", borderRadius: 8, border: `1px solid ${colour}`,
  background: colour, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
});
