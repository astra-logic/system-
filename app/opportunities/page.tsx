/**
 * SAVINGS — "Where am I losing money, and what should I do about it?"
 *
 * ⚠ THIS PAGE SHOWS ONE SAVING, AND THAT IS THE POINT.
 *
 *   The engine found exactly one thing it could evidence. A page that dressed
 *   that up with charts, trend lines and a scorecard would be lying about how
 *   much the system knows. One real saving, stated plainly, with the money and
 *   the reasoning attached, is worth more than a gallery.
 *
 * The yearly figure is a RANGE, and the range is not a confidence interval — it
 * is a split by where the numbers came from. The lower bound is what rests on
 * measured records; the upper adds what rests on figures entered by hand. That
 * distinction is stated in words on the page, because a number a manager cannot
 * source is a number they will not act on.
 */
import { revalidatePath } from "next/cache";
import { currentOpportunities } from "../../lib/engine/persist";
import { potentialAnnualSaving } from "../../lib/engine/aggregate";
import { rehydrate } from "../../lib/engine/rehydrate";
import { evaluateContradictions, recordContradictions } from "../../lib/engine/contradiction-service";
import { firstSiteId, runAndPersist } from "../../lib/engine/run";
import { sql } from "../../lib/db/client";
import { money, date as fmtDate } from "../../lib/ui/format";
import { stateWord, countsTowardYear } from "../../lib/ui/plain";
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

export default async function Savings() {
  const siteId = await firstSiteId();
  if (!siteId) {
    return (
      <>
        <h1>Savings</h1>
        <div className="state">
          <p className="state-title">Nothing to look at yet</p>
          <p className="state-body">
            Once your orders, deliveries and stock movements are in, we&apos;ll look for money you
            could stop losing.
          </p>
          <a className="btn btn-secondary" href="/import">Import your data</a>
        </div>
      </>
    );
  }

  const [savings, clashes] = await Promise.all([
    currentOpportunities(siteId),
    evaluateContradictions(siteId),
  ]);
  const [demo] = await sql<{ d: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS d FROM opportunities WHERE site_id = ${siteId}::uuid`;
  const blocked = new Set(clashes.blockedOpportunityIds);

  const head = potentialAnnualSaving({
    findings: savings.map((f) => rehydrate(f as never)),
    currency: "EGP",
    asOf: AS_OF,
  });

  const waiting = savings.filter((s) => s.lifecycle === "POTENTIAL");
  const decided = savings.filter((s) => s.lifecycle !== "POTENTIAL");

  return (
    <>
      <DemoBanner isDemo={demo?.d ?? false} />
      <h1>Savings</h1>
      <p className="sub">
        Money you are losing that we can point at a record for. Nothing here is a forecast —
        every figure is something that already happened.
      </p>

      {savings.length === 0 ? (
        <div className="state">
          <p className="state-title">We haven&apos;t found anything yet</p>
          <p className="state-body">
            That is a result, not a failure — we only report what we can show you the records for.
            Check again once more orders and deliveries have gone through.
          </p>
          <form action={detect}><button className="btn btn-secondary" type="submit">Check again</button></form>
        </div>
      ) : (
        <>
          {/* ------------------------------------------------------- LAYER 1 */}
          <section className="section">
            <div className="metric-strip">
              <div className="metric">
                <span className="mvalue">
                  {head.basis === "INSUFFICIENT_DATA" ? "Not yet" : money(head.upper, "EGP")}
                </span>
                <span className="mlabel">You could save this each year</span>
              </div>
            </div>
            {head.basis !== "INSUFFICIENT_DATA" && (
              <p className="note" style={{ maxWidth: "64ch" }}>
                {head.lower.isZero()
                  ? "None of this rests on measured records yet — it rests on figures entered by hand. That does not make it wrong, but you should check those figures before acting."
                  : `${money(head.lower, "EGP")} of it rests on measured records; the rest rests on figures entered by hand.`}
              </p>
            )}
          </section>

          {/* ------------------------------------------------------- LAYER 2 */}
          {waiting.length > 0 && (
            <section className="section">
              <h2>Waiting for your decision</h2>
              <div className="rows">
                {waiting.map((s) => <SavingRow key={s.id} s={s} blocked={blocked.has(s.id)} />)}
              </div>
            </section>
          )}

          {decided.length > 0 && (
            <section className="section">
              <h2>Already decided</h2>
              <div className="rows tight">
                {decided.map((s) => <SavingRow key={s.id} s={s} blocked={blocked.has(s.id)} />)}
              </div>
            </section>
          )}

          {/* Only shown when it happens. A permanently empty panel explaining a
              control nobody triggered is furniture, not information. */}
          {clashes.contradictions.length > 0 && (
            <section className="section">
              <h2>These cancel each other out</h2>
              <p className="section-note">
                You cannot act on both of these — one pushes a number up and the other pushes the
                same number down. Showing either on its own would hide that.
              </p>
              <div className="rows">
                {clashes.contradictions.map((c, i) => (
                  <div className="row nomark" key={i}>
                    <div className="rmain">
                      <div className="rtitle">
                        <a href={`/opportunities/${c.leftId}`}>{c.leftTitle}</a>
                        {" vs "}
                        <a href={`/opportunities/${c.rightId}`}>{c.rightTitle}</a>
                      </div>
                      <div className="rsub">{c.why}</div>
                    </div>
                    <div className="rtrail">{c.resolved ? "settled" : "needs a decision"}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section">
            <form action={detect}>
              <button className="btn btn-secondary" type="submit">Check again</button>
            </form>
            <p className="note">
              Looks at everything recorded up to {fmtDate(AS_OF)}. If nothing has changed, nothing is
              rewritten; if a figure has moved, the old one is kept beside the new one so you can see
              what changed.
            </p>
          </section>
        </>
      )}
    </>
  );
}

type Saving = Awaited<ReturnType<typeof currentOpportunities>>[number];

function SavingRow({ s, blocked }: { s: Saving; blocked: boolean }) {
  const net = s.netImpact as Record<string, unknown> | null;
  const value = (net?.["value"] as string | null) ?? null;
  const counts = countsTowardYear(s.ladder);

  return (
    <div className="row nomark" id={s.id}>
      <div className="rmain">
        <div className="rtitle">
          <a href={`/opportunities/${s.id}`}>{s.title}</a>
          {s.itemCode && <span className="rcode">{s.itemCode}</span>}
        </div>
        <div className="rsub">
          {stateWord(s.lifecycle)}
          {!counts && <> · not solid enough to count towards the yearly figure yet</>}
        </div>
        {blocked && (
          <div className="rwarn">
            ⚠ This clashes with another recommendation. Settle that before acting on either.
          </div>
        )}
        {s.netExcludesUnvaluedRisk && (
          <div className="rnote">
            The figure leaves out a risk we cannot put a price on, so the real benefit is larger than
            the number shown — by how much, we can&apos;t say.
          </div>
        )}
      </div>

      <div className="rtrail strong">
        {value ? money(value, String(net?.["unit"] ?? "EGP")) : <span className="rtrail-sub">no figure yet</span>}
        {value && <span className="rtrail-sub">a year</span>}
      </div>

      <div className="rdo"><a href={`/opportunities/${s.id}`}>See what this rests on</a></div>
    </div>
  );
}
