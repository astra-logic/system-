/**
 * CAN I TRUST THIS? — the honesty screen.
 *
 * Reached from Settings, and the reason it exists before Stock in the journey:
 * a saving engine running over untrustworthy stock data produces confident
 * nonsense, and confident nonsense is worse than silence.
 *
 * ⚠ EVERY CHECK HERE IS STATED, NEVER SCORED.
 *
 *   There is no "data quality: 82%". A score would average a broken balance
 *   together with a missing phone number and produce a number that means
 *   nothing. Each check says what it looked at, what it found, and what that
 *   costs the user — and a check that cannot conclude says so.
 *
 * ⚠ THE COST-AGE CHECK REPORTS AN AGE AND REFUSES TO GRADE IT.
 *
 *   Where "too old" begins is a policy the factory sets, not one the system
 *   invents. Inventing that line would put an undeclared constant underneath
 *   every money figure in the product.
 */
import { sql } from "../../lib/db/client";
import { firstSiteId } from "../../lib/engine/run";
import { currentEvidenceGaps } from "../../lib/engine/persist";
import { verifyProjection } from "../../lib/ledger/verify";
import { date as fmtDate, moneyExact } from "../../lib/ui/format";
import { plain, sentence } from "../../lib/ui/plain";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";

/** What an import ended up doing, said plainly. */
const outcomeWord = (status: string, rejected: number): string =>
  status === "ACCEPTED"
    ? "Everything went in"
    : rejected > 0
      ? `${rejected} ${rejected === 1 ? "row was" : "rows were"} turned away`
      : "Nothing went in";

export default async function CanITrustThis() {
  const siteId = await firstSiteId();
  if (!siteId) {
    return (
      <>
        <h1>Can I trust this?</h1>
        <div className="state">
          <p className="state-title">Nothing to check yet</p>
          <p className="state-body">Bring some data in and we&apos;ll tell you whether it holds up.</p>
          <a className="btn btn-secondary" href="/import">Import a file</a>
        </div>
      </>
    );
  }

  const batches = await sql<{ id: string; filename: string; kind: string; status: string; rows_total: number; rows_accepted: number; rows_rejected: number; is_demo: boolean; uploaded_at: string }[]>`
    SELECT id, filename, kind, status, rows_total, rows_accepted, rows_rejected, is_demo, uploaded_at::text
    FROM import_batches ORDER BY uploaded_at DESC`;

  const verification = await verifyProjection();

  const [oldest] = await sql<{ age_days: number | null; as_of: string | null }[]>`
    SELECT EXTRACT(DAY FROM (now() - MIN(as_of)))::int AS age_days, MIN(as_of)::text AS as_of
    FROM cost_references`;

  const gaps = await currentEvidenceGaps(siteId);
  const rejectedTotal = batches.reduce((n, b) => n + b.rows_rejected, 0);

  return (
    <>
      <DemoBanner isDemo={batches.some((b) => b.is_demo)} />
      <p className="note" style={{ marginTop: 0 }}><a href="/settings">← Settings</a></p>
      <h1>Can I trust this?</h1>
      <p className="sub">
        Whether the numbers on the other screens add up, where they came from, and what we know we
        are missing.
      </p>

      {/* ---------------------------------------------------------- LAYER 1 */}
      <section className="section">
        <h2>Do your stock figures add up?</h2>
        <div className="rows">
          <div className="row">
            <span className="rmark" aria-hidden="true">{verification.agreed ? "🟢" : "🔴"}</span>
            <div className="rmain">
              <div className="rtitle">
                {verification.agreed
                  ? "Yes — every balance matches its history"
                  : `No — ${verification.discrepancies.length} ${verification.discrepancies.length === 1 ? "balance disagrees" : "balances disagree"} with the movements behind them`}
              </div>
              <div className="rsub">
                We checked {verification.locationsChecked}{" "}
                {verification.locationsChecked === 1 ? "material and place" : "material-and-place combinations"}.
                Each running balance was re-added from scratch out of every movement ever recorded,
                and the two were compared. A difference is a fault, not a rounding gap.
              </div>
            </div>
          </div>

          <div className="row">
            <span className="rmark" aria-hidden="true">{verification.conservationHolds ? "🟢" : "🔴"}</span>
            <div className="rmain">
              <div className="rtitle">
                {verification.conservationHolds
                  ? "Every movement has somewhere it came from and somewhere it went"
                  : "Some movements are missing an endpoint"}
              </div>
              <div className="rsub">
                A separate question from the one above, and reported separately on purpose: stock
                can move correctly between two real places and the running total can still be wrong.
                One answer never stands in for the other.
              </div>
            </div>
          </div>
        </div>

        {!verification.agreed && (
          <details className="disclose">
            <summary>Show which ones disagree</summary>
            <div className="disclose-body">
              <div className="rows tight">
                {verification.discrepancies.map((x, i) => (
                  <div className="row nomark" key={i}>
                    <div className="rmain">
                      <div className="rtitle">{x.itemCode}<span className="rcode">{x.locationCode}</span></div>
                      <div className="rsub">
                        The running total says {x.projected.toFixed(3)}; adding up the movements gives{" "}
                        {x.recomputed.toFixed(3)}.
                      </div>
                    </div>
                    <div className="rtrail strong">{x.difference.toFixed(3)} out</div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        )}
      </section>

      {/* ------------------------------------------------------- COST AGE  */}
      <section className="section">
        <h2>How old are the costs we work from?</h2>
        {oldest?.age_days === null || oldest?.age_days === undefined ? (
          <p style={{ margin: 0, maxWidth: "64ch" }}>
            No costs have been brought in, so nothing on the savings screen can be given a money
            figure.
          </p>
        ) : (
          <>
            <p style={{ margin: 0, maxWidth: "64ch" }}>
              The oldest one we hold is {oldest.age_days} days old
              {oldest.as_of && <>, entered on {fmtDate(oldest.as_of)}</>}.
            </p>
            <p className="note" style={{ maxWidth: "64ch" }}>
              We tell you the age and stop there. Where &ldquo;too old&rdquo; begins depends on your
              business — if we picked that line ourselves, every money figure in the product would
              be resting on a number you never agreed to.
            </p>
          </>
        )}
      </section>

      {/* --------------------------------------------------------- IMPORTS */}
      <section className="section">
        <h2>What you&apos;ve brought in</h2>
        {batches.length === 0 ? (
          <div className="state">
            <p className="state-title">Nothing imported yet</p>
            <a className="btn btn-secondary" href="/import">Import a file</a>
          </div>
        ) : (
          <>
            <div className="rows tight">
              {batches.map((b) => (
                <div className="row" key={b.id}>
                  <span className="rmark" aria-hidden="true">
                    {b.rows_rejected === 0 && b.rows_accepted > 0 ? "🟢" : b.rows_accepted > 0 ? "🟡" : "🔴"}
                  </span>
                  <div className="rmain">
                    <div className="rtitle">
                      {b.filename}
                      <span className="rcode">{b.is_demo ? "made-up data" : "your data"}</span>
                    </div>
                    <div className="rsub">
                      {outcomeWord(b.status, b.rows_rejected)} — {b.rows_accepted} of {b.rows_total}{" "}
                      {b.rows_total === 1 ? "row" : "rows"}, on {fmtDate(b.uploaded_at)}.
                    </div>
                  </div>
                  <div className="rtrail">{b.rows_accepted}</div>
                </div>
              ))}
            </div>
            <p className="note">
              {rejectedTotal > 0
                ? `${rejectedTotal} ${rejectedTotal === 1 ? "row was" : "rows were"} turned away and kept exactly as you sent them. `
                : "Turned-away rows are kept exactly as you sent them. "}
              Nothing is repaired or guessed — a value we can&apos;t understand is never quietly
              treated as zero.
            </p>
          </>
        )}
      </section>

      {/* ------------------------------------------------------------ GAPS */}
      <section className="section">
        <h2>What we know we&apos;re missing</h2>
        {gaps.length === 0 ? (
          <p className="note" style={{ margin: 0 }}>
            Nothing recorded. This fills in as we try to work things out and find we can&apos;t.
          </p>
        ) : (
          <div className="rows">
            {gaps.map((g) => {
              const spend = g.observed_spend as Record<string, unknown> | null;
              const value = spend?.["value"] as string | null;
              return (
                <div className="row" key={g.id}>
                  <span className="rmark" aria-hidden="true">⚪</span>
                  <div className="rmain">
                    <div className="rtitle">{sentence(g.missing_evidence)}</div>
                    <div className="rsub">Without it we can&apos;t work out: {plain(g.blocks)}</div>
                  </div>
                  {value && (
                    <div className="rtrail strong">
                      {moneyExact(value, String(spend?.["unit"] ?? ""))}
                      <span className="rtrail-sub">already spent here</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
