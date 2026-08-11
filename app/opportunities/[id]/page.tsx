/**
 * ONE SAVING — what it is, why we say so, what it's worth, and what to do.
 *
 * ⚠ THE SHAPE OF THIS PAGE IS AN ARGUMENT, NOT A LAYOUT
 *
 *   A manager will not act on a number they cannot source. So the page answers,
 *   in this order and no other:
 *
 *     WHAT        the change to make, in one sentence
 *     WHY         what would have happened instead, in the factory's own facts
 *     WHAT IT'S   the money — one figure, then how it was arrived at
 *       WORTH
 *     EVIDENCE    the records it rests on, and where each one came from
 *     WHAT TO DO  the decision, with the conflict-of-interest check attached
 *     UNCERTAINTY what this figure does NOT account for
 *
 *   Uncertainty is LAST and it is not optional. A saving presented without its
 *   limitations is a sales pitch.
 *
 * ⚠ Approving is not saving. This screen can record a decision and nothing
 * else. A saving is confirmed only by measurement against the captured baseline
 * over the following twelve months.
 *
 * The audit machinery — every gate, every reference, the version history — is
 * real and stays reachable, but it sits behind disclosure. It answers an
 * auditor's question, not the question the manager arrived with.
 */
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { evidenceFor, gatesFor, getOpportunity, signatureFor, versionHistory } from "../../../lib/engine/persist";
import { baselineFor, checkIndependence, decisionFor, reviewOpportunity } from "../../../lib/engine/review";
import { evaluateContradictions } from "../../../lib/engine/contradiction-service";
import { firstSiteId } from "../../../lib/engine/run";
import { money, moneyExact, date as fmtDate } from "../../../lib/ui/format";
import { basisWord, evidenceKind, gateWord, ladderWord, plain, plainAll, stateWord } from "../../../lib/ui/plain";
import { DemoBanner } from "../../demo-banner";

export const dynamic = "force-dynamic";

function envelope(e: Record<string, unknown> | null) {
  if (!e) return null;
  return {
    value: (e["value"] as string | null) ?? null,
    unit: String(e["unit"] ?? ""),
    basis: String(e["basis"] ?? ""),
    limitations: (e["limitations"] as string[]) ?? [],
    coverage: (e["coverage"] as string[]) ?? [],
    assumptions: (e["assumptions"] as string[]) ?? [],
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

export default async function OneSaving({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOpportunity(id);
  if (!o) notFound();

  const siteId = await firstSiteId();
  const [gates, evidence, signature, decision, baseline, history, clashes] = await Promise.all([
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
  const oneTime = envelope(o.oneTimeImpact);
  const blocked = clashes?.blockedOpportunityIds.includes(o.id) ?? false;
  const independence = await checkIndependence(o.id, "fin");

  /* Everything the figure does not account for, gathered from wherever the
     engine recorded it. Collected in one place because a caveat a reader has to
     hunt for is a caveat they will not find. */
  const caveats = plainAll([
    ...(net?.limitations ?? []),
    ...(gross?.limitations ?? []),
    ...(offset?.limitations ?? []),
    ...(net?.assumptions ?? []),
  ]);

  return (
    <>
      <DemoBanner isDemo={o.isDemo} />
      <p className="note" style={{ marginTop: 0 }}><a href="/opportunities">← All savings</a></p>

      <h1>{plain(o.title)}</h1>
      <p className="sub">
        {stateWord(o.lifecycle)} · {ladderWord(o.ladder)}
        {o.supersededAt && " · replaced by a newer calculation"}
      </p>

      {blocked && (
        <div className="state error" role="alert">
          <p className="state-title">This clashes with another recommendation</p>
          <p className="state-body">
            Acting on both is impossible — one pushes a number up and the other pushes the same
            number down. Settle that before acting on either, because presenting one alone would
            hide that they cannot both be done.
          </p>
        </div>
      )}

      {o.supersededAt && (
        <div className="state">
          <p className="state-title">You are looking at an older version</p>
          <p className="state-body">
            A newer calculation has replaced this one. The old figure is kept rather than
            overwritten so you can see what changed — but decide on the current version, not this.
          </p>
          <a className="btn btn-secondary" href="/opportunities">Go to the current list</a>
        </div>
      )}

      {/* ------------------------------------------------------------- WHAT */}
      <section className="section">
        <h2>What to change</h2>
        <p style={{ margin: 0, maxWidth: "66ch", fontSize: "var(--text-headline)" }}>
          {plain(o.statedIntervention)}
        </p>
      </section>

      {/* -------------------------------------------------------------- WHY */}
      <section className="section">
        <h2>Why we say so</h2>
        <p style={{ margin: 0, maxWidth: "68ch" }}>{plain(o.counterfactual)}</p>
      </section>

      {/* ------------------------------------------------------------ VALUE */}
      <section className="section">
        <h2>What it&apos;s worth</h2>
        <div className="metric-strip">
          <div className="metric">
            <span className="mvalue">
              {net?.value ? money(net.value, net.unit) : "Can't say"}
            </span>
            <span className="mlabel">
              {net?.value ? "a year, once this is fixed" : "we can't put a figure on it yet"}
            </span>
          </div>
        </div>

        {net?.value ? (
          <p className="note" style={{ maxWidth: "64ch" }}>
            This figure is {basisWord(net.basis)}.
          </p>
        ) : (
          <div className="rows tight">
            {plainAll(net?.limitations).map((l, i) => (
              <div className="row nomark" key={i}><div className="rmain"><div className="rsub">{l}</div></div></div>
            ))}
          </div>
        )}

        <div className="rows tight">
          <div className="row nomark">
            <div className="rmain">
              <div className="rtitle">What you actually spent</div>
              <div className="rsub">Money that already left the business, over the last twelve months.</div>
            </div>
            <div className="rtrail strong">{gross?.value ? moneyExact(gross.value, gross.unit) : "—"}</div>
          </div>
          <div className="row nomark">
            <div className="rmain">
              <div className="rtitle">What the fix costs you</div>
              <div className="rsub">
                {offset?.value
                  ? "Subtracted from the figure above — holding more stock is not free."
                  : "Not established yet, so we refuse to state a saving rather than guess at one."}
              </div>
            </div>
            <div className="rtrail strong">{offset?.value ? moneyExact(offset.value, offset.unit) : "not known"}</div>
          </div>
          {oneTime?.value && oneTime.value !== "0" && (
            <div className="row nomark">
              <div className="rmain">
                <div className="rtitle">One-off effect</div>
                <div className="rsub">
                  Reported on its own and never added to the yearly figure — it happens once.
                </div>
              </div>
              <div className="rtrail strong">{moneyExact(oneTime.value, oneTime.unit)}</div>
            </div>
          )}
        </div>

        {offset && offset.coverage.length > 0 && (
          <details className="disclose">
            <summary>How the cost of the fix was worked out</summary>
            <div className="disclose-body">
              <ul className="reasons">
                {plainAll(offset.coverage).map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </details>
        )}
      </section>

      {/* --------------------------------------------------------- EVIDENCE */}
      <section className="section">
        <h2>What it rests on</h2>
        {gross && gross.coverage.length > 0 && (
          <ul className="reasons">
            {plainAll(gross.coverage).map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        )}

        {evidence.length > 0 && (
          <div className="rows tight">
            {evidence.map((e, i) => (
              <div className="row nomark" key={i}>
                <div className="rmain">
                  <div className="rtitle">{evidenceKind(e.kind)}</div>
                  <div className="rsub">{basisWord(e.basis)} · as at {fmtDate(e.as_of)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ----------------------------------------------------------- L4 */}
        <details className="disclose">
          <summary>Show every check we ran</summary>
          <div className="disclose-body">
            <p className="note" style={{ marginTop: 0 }}>
              Each check passes, fails, or is not established. They are never averaged into a score,
              and &ldquo;not established&rdquo; never counts as a pass.
            </p>
            <div className="rows tight">
              {gates.map((g) => (
                <div className="row nomark" key={g.gate}>
                  <span className="rmark" aria-hidden="true">
                    {g.outcome === "PASS" ? "🟢" : g.outcome === "FAIL" ? "🔴" : "⚪"}
                  </span>
                  <div className="rmain">
                    <div className="rtitle">{gateWord(g.gate)}</div>
                    <div className="rsub">{plain(g.detail ?? "")}</div>
                  </div>
                </div>
              ))}
            </div>

            {signature.length > 0 && (
              <>
                <p className="note">
                  What this change pushes on, and in which direction — recorded so we can tell you
                  when two recommendations would undo each other.
                </p>
                <ul className="reasons">
                  {signature.map((s, i) => (
                    <li key={i}>
                      {plain(s.dimension.replace(/_/g, " ").toLowerCase())} —{" "}
                      {s.direction.toLowerCase()}, between {fmtDate(s.window_from)} and {fmtDate(s.window_to)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </details>
      </section>

      {/* ------------------------------------------------------- WHAT TO DO */}
      <section className="section">
        <h2>What to do</h2>
        {decision ? (
          <>
            <p style={{ margin: 0, maxWidth: "64ch" }}>
              <strong>{decision.action === "APPROVE" ? "You said yes to this" : "You said no to this"}</strong>
              {" "}on {fmtDate(decision.decided_at)}, and gave the reason: &ldquo;{decision.rationale}&rdquo;
            </p>
            {!decision.adjudicator_independent && (
              <div className="rwarn" style={{ marginTop: "var(--s4)" }}>
                ⚠ The person who decided this was involved in what caused it. That is recorded here
                rather than hidden. {plain(decision.independence_note ?? "")}
              </div>
            )}
            <p className="note" style={{ maxWidth: "64ch" }}>
              Saying yes is not the same as saving the money. We&apos;ll only call this saved once
              we can measure it against what the business looked like today, a year from now.
            </p>
          </>
        ) : o.supersededAt ? (
          <p className="note" style={{ margin: 0 }}>
            You can&apos;t decide on an older version — the decision would attach to a figure that is
            no longer shown.
          </p>
        ) : (
          <>
            {/* ⚠ The engine's own note is not rendered here. It names roles and
                internal classes an auditor reads and a manager cannot. What
                the manager needs is the CONSEQUENCE, which is stated. */}
            <p className="note" style={{ marginTop: 0, maxWidth: "64ch" }}>
              {independence.independent
                ? "Whoever decides this was not involved in what caused it, so far as we can tell."
                : "Careful: the person deciding this was involved in what caused it."}
              {independence.uncheckable.length > 0 && (
                <> We couldn&apos;t check that fully — the system doesn&apos;t record who raised or
                  approved the original orders.</>
              )}
            </p>
            <form action={decide}>
              <input type="hidden" name="id" value={o.id} />
              <div className="form">
                <label>
                  <span>Who is deciding?</span>
                  <input name="adjudicator" type="text" defaultValue="fin" required />
                </label>
                <label>
                  <span>Why? Required, so a &ldquo;no&rdquo; can be learned from later.</span>
                  <textarea name="rationale" rows={3} required />
                </label>
                {!independence.independent && (
                  <label className="check">
                    <input type="checkbox" name="acceptConflict" />
                    <span className="note" style={{ margin: 0 }}>
                      I accept that I am deciding on something I was involved in. This will be
                      recorded on the decision and shown wherever this saving appears.
                    </span>
                  </label>
                )}
                <div className="actions">
                  <button className="btn btn-primary" type="submit" name="action" value="APPROVE">Yes, do this</button>
                  <button className="btn btn-secondary" type="submit" name="action" value="REJECT">No, skip it</button>
                </div>
              </div>
            </form>
          </>
        )}
      </section>

      {/* ------------------------------------------------------ UNCERTAINTY */}
      {(caveats.length > 0 || o.netExcludesUnvaluedRisk) && (
        <section className="section">
          <h2>What this figure doesn&apos;t account for</h2>
          {o.netExcludesUnvaluedRisk && (
            <p style={{ margin: 0, maxWidth: "66ch" }}>
              Fixing this also reduces the chance of running out of stock. We have deliberately not
              put a price on that, because doing so would need production data we don&apos;t have —
              so the figure above is <strong>lower</strong> than the real benefit, by an amount we
              can&apos;t state.
            </p>
          )}
          {caveats.length > 0 && (
            <ul className="reasons">{caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
          )}
        </section>
      )}

      {/* ---------------------------------------------------------- HISTORY */}
      {(baseline || history.length > 1) && (
        <section className="section">
          <details className="disclose">
            <summary>How this figure has changed</summary>
            <div className="disclose-body">
              {baseline && (
                <p className="note" style={{ marginTop: 0 }}>
                  When you said yes, we saved a snapshot of the inputs and the method — not just the
                  answer — on {fmtDate(baseline.captured_at)}. A stored number can&apos;t be
                  re-checked later; the inputs can.
                </p>
              )}
              {history.length > 1 && (
                <div className="rows tight">
                  {history.map((h) => {
                    const e = envelope(h.netImpact);
                    return (
                      <div className="row nomark" key={h.id}>
                        <div className="rmain">
                          <div className="rtitle">
                            {h.id === o.id ? "What you're looking at" : <a href={`/opportunities/${h.id}`}>An earlier version</a>}
                          </div>
                          <div className="rsub">{h.supersededAt ? "replaced since" : "current"}</div>
                        </div>
                        <div className="rtrail strong">{e?.value ? money(e.value, e.unit) : "—"}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </details>
        </section>
      )}

      {/* -------------------------------------------------------- WHO OWNS  */}
      <section className="section">
        <h2>Who this belongs to</h2>
        <div className="rows tight">
          <div className="row nomark">
            <div className="rmain"><div className="rtitle">Spotted it</div></div>
            <div className="rtrail">{o.findingOwner ?? "nobody assigned"}</div>
          </div>
          <div className="row nomark">
            <div className="rmain"><div className="rtitle">Has to act on it</div></div>
            <div className="rtrail">{o.actionOwner ?? "nobody assigned"}</div>
          </div>
          <div className="row nomark">
            <div className="rmain"><div className="rtitle">Owns the data behind it</div></div>
            <div className="rtrail">{o.dataOwner ?? "nobody assigned"}</div>
          </div>
        </div>
      </section>
    </>
  );
}
