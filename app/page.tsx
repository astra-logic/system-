/**
 * TODAY — "What needs my attention?"
 *
 * A warehouse command centre, not an analytics dashboard. Per the first-release
 * scope the executive experience is deliberately deferred, so this page answers
 * one question for the person running the floor.
 *
 * What it shows, in order:
 *   1  the state of the factory, in one line
 *   2  what needs doing — grouped by kind, ranked within kind
 *   3  the money, as ONE figure with its evidence one interaction away
 *   4  the last question asked, in the past tense
 *
 * ⚠ AT MOST THREE ATTENTION GROUPS ARE SHOWN AS PRIMARY. Three is the count of
 * distinct questions a manager arrives with — will anything stop production,
 * what must I order, where am I losing money. A fourth card competes with three
 * that matter and answers no question anyone asked.
 *
 * ⚠ Kinds are grouped and NOT interleaved (O-02). Ranking a stock risk against
 * an order risk would need a comparability rule nobody has established.
 */
import { sql } from "../lib/db/client";
import { firstSiteId } from "../lib/engine/run";
import { potentialAnnualSaving } from "../lib/engine/aggregate";
import { rehydrate } from "../lib/engine/rehydrate";
import { stockLines, byUrgency as stockByUrgency, cantSayCopy } from "../lib/views/stock";
import { orderLines, byUrgency as ordersByUrgency, whyLate } from "../lib/views/orders";
import { money, qty as fmtQty, date as fmtDate, days as fmtDays, cover as fmtCover } from "../lib/ui/format";
import { answerById, recentAnswers } from "../lib/feasibility/audit";
import { DemoBanner } from "./demo-banner";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

export default async function Today() {
  const siteId = await firstSiteId();
  if (!siteId) {
    return (
      <>
        <h1>Today</h1>
        <div className="state">
          <p className="state-title">Nothing is set up yet</p>
          <p className="state-body">Add your materials, stock and orders and this page will tell you what needs attention.</p>
          <a className="btn btn-secondary" href="/import">Import your data</a>
        </div>
      </>
    );
  }

  const [stock, orders, findings, demo] = await Promise.all([
    stockLines(siteId, AS_OF),
    orderLines(siteId, AS_OF),
    sql<{ id: string; title: string; net_impact: Record<string, unknown> | null; item_code: string | null; lifecycle: string; is_demo: boolean; ladder: string; evidence_strength: string | null; net_excludes_unvalued_risk: boolean; recurring_impact: unknown; one_time_impact: unknown; incremental_cost: unknown }[]>`
      SELECT o.id, o.title, o.net_impact, o.lifecycle, o.is_demo, o.ladder,
             o.evidence_strength, o.net_excludes_unvalued_risk,
             o.recurring_impact, o.one_time_impact, o.incremental_cost,
             i.code AS item_code
      FROM opportunities o LEFT JOIN items i ON i.id = o.subject_item_id
      WHERE o.site_id = ${siteId}::uuid AND o.superseded_at IS NULL`,
    sql<{ any_demo: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS any_demo FROM import_batches`,
  ]);
  const anyDemo = demo[0]?.any_demo ?? false;

  /* The last question asked — D-059: past tense, attributed, verbatim, never a
     plan the system is tracking.

     ⚠ Read through `audit.ts`, NOT with a query of our own. D-055 makes that
     module the single door to the answers table, and the structural test that
     enforces it caught this page reaching around it. The rule is what keeps a
     stored answer from quietly becoming an input to a calculation. */
  const [recent] = await recentAnswers(1);
  const stored = recent ? await answerById(recent.id) : null;
  const [askedItem] = recent
    ? await sql<{ code: string; name: string }[]>`
        SELECT code, name FROM items WHERE id = ${recent.productItemId}::uuid`
    : [];
  const lastAsk = recent && stored && askedItem
    ? { askedAt: recent.askedAt, requestedQty: recent.requestedQty, headline: stored.answer.headline, name: askedItem.name }
    : null;

  const blocking = stock.filter((s) => s.state === "no").sort(stockByUrgency);
  const lateOrders = orders.filter((o) => o.isOpen && (o.state === "no" || o.state === "at-risk")).sort(ordersByUrgency);
  const atRisk = stock.filter((s) => s.state === "at-risk").sort(stockByUrgency);
  const unknowable = stock.filter((s) => s.state === "cant-say");

  const head = potentialAnnualSaving({
    findings: findings.map((f) => rehydrate(f as never)),
    currency: "EGP",
    asOf: AS_OF,
  });

  const attentionCount = blocking.length + lateOrders.length + atRisk.length;
  const openFindings = findings.filter((f) => f.lifecycle === "POTENTIAL").length;

  return (
    <>
      <DemoBanner isDemo={anyDemo} />
      <h1>Today</h1>

      {/* ---------------------------------------------------------- LAYER 1 */}
      <p className="sub" style={{ fontSize: "var(--text-headline)", color: "var(--text-primary)", maxWidth: "58ch" }}>
        {attentionCount === 0
          ? "Nothing needs your attention today."
          : `${attentionCount} ${attentionCount === 1 ? "thing needs" : "things need"} your attention.`}
      </p>

      {attentionCount === 0 && (
        <p className="note" style={{ marginTop: "calc(var(--s5) * -1)" }}>
          Checked {stock.length} materials and {orders.filter((o) => o.isOpen).length} incoming orders,
          using stock recorded up to {fmtDate(AS_OF)}.
        </p>
      )}

      {/* ---------------------------------------------------------- LAYER 2 */}
      {blocking.length > 0 && (
        <section className="section">
          <h2>Production may stop</h2>
          <div className="rows">
            {blocking.map((s) => (
              <div className="row" key={s.itemId}>
                <span className="rmark" aria-hidden="true">🔴</span>
                <div className="rmain">
                  <div className="rtitle">{s.name}<span className="rcode">{s.code}</span></div>
                  <div className="rsub">
                    {fmtQty(s.available, s.stockUom, { whole: s.integerOnly })} left
                    {s.coverDays !== null && ` — ${fmtCover(s.coverDays)} of cover`}
                    {s.leadTimeDays !== null && `, and it takes ${s.leadTimeDays} days to arrive`}
                  </div>
                </div>
                <div className="rtrail">
                  {s.nextArrival ? <>due {fmtDate(s.nextArrival)}</> : <span className="note" style={{ margin: 0 }}>nothing on order</span>}
                </div>
                <div className="rdo">
                  <a href={`/inventory#${s.code}`}>Order more {s.name.toLowerCase()}</a>
                  {" — "}you will run out before a replacement could arrive.
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {lateOrders.length > 0 && (
        <section className="section">
          <h2>Deliveries that need chasing</h2>
          <div className="rows">
            {lateOrders.map((o) => {
              const why = whyLate(o);
              return (
                <div className="row" key={o.poLineId}>
                  <span className="rmark" aria-hidden="true">{o.state === "no" ? "🔴" : "🟡"}</span>
                  <div className="rmain">
                    <div className="rtitle">{o.itemName}<span className="rcode">{o.number} · {o.supplier}</span></div>
                    <div className="rsub">
                      {fmtQty(o.openQty, o.uom)} still to come
                      {o.daysLate !== null ? `, ${fmtDays(o.daysLate)}` : o.expectedDate ? `, expected ${fmtDate(o.expectedDate)}` : ""}
                    </div>
                    {why && <div className="rnote">{why}</div>}
                  </div>
                  <div className="rtrail">
                    {o.expectedDate ? fmtDate(o.expectedDate) : <span className="note" style={{ margin: 0 }}>no date</span>}
                  </div>
                  <div className="rdo"><a href={`/orders#${o.number}`}>Chase {o.supplier}</a></div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {atRisk.length > 0 && (
        <section className="section">
          <h2>Running low</h2>
          <div className="rows">
            {atRisk.map((s) => (
              <div className="row" key={s.itemId}>
                <span className="rmark" aria-hidden="true">🟡</span>
                <div className="rmain">
                  <div className="rtitle">{s.name}<span className="rcode">{s.code}</span></div>
                  <div className="rsub">
                    {s.coverDays !== null && `${fmtCover(s.coverDays)} of cover`}
                    {s.leadTimeDays !== null && `, and it takes ${s.leadTimeDays} days to arrive`}
                  </div>
                </div>
                <div className="rtrail">{fmtQty(s.available, s.stockUom, { whole: s.integerOnly })}</div>
                <div className="rdo"><a href={`/inventory#${s.code}`}>Order before you run out</a></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- LAYER 3 */}
      <section className="section">
        <h2>Money</h2>
        <div className="metric-strip">
          <div className="metric">
            <span className="mvalue">
              {head.basis === "INSUFFICIENT_DATA" ? "Not yet" : money(head.upper, "EGP")}
            </span>
            <span className="mlabel">
              You could save this each year
              {openFindings > 0 && ` · ${openFindings} ${openFindings === 1 ? "saving needs" : "savings need"} your decision`}
            </span>
          </div>
        </div>
        {head.basis !== "INSUFFICIENT_DATA" && (
          <p className="note" style={{ maxWidth: "62ch" }}>
            {head.lower.isZero()
              ? "None of this is proven yet — it rests on figures entered by hand rather than measured. "
              : `${money(head.lower, "EGP")} of it rests on measured records. `}
            <a href="/opportunities">See what it rests on</a>
          </p>
        )}
      </section>

      {/* What we cannot yet judge — stated, and made useful. */}
      {unknowable.length > 0 && (
        <section className="section">
          <h2>What we can&apos;t judge yet</h2>
          <p className="section-note">
            We can watch {stock.length - unknowable.length} of your {stock.length} materials properly.
            For the rest we can show what you have, but we can&apos;t warn you before you run out.
          </p>
          <div className="rows tight">
            {unknowable.slice(0, 4).map((s) => {
              const c = cantSayCopy(s);
              return (
                <div className="row" key={s.itemId}>
                  <span className="rmark" aria-hidden="true">⚪</span>
                  <div className="rmain">
                    <div className="rtitle">{s.name}<span className="rcode">{s.code}</span></div>
                    <div className="rsub">{c.why}</div>
                  </div>
                  <div className="rtrail">{fmtQty(s.available, s.stockUom, { whole: s.integerOnly })}</div>
                  {c.fix && <div className="rdo"><a href={c.fix}>Add a delivery time</a> — {c.then.toLowerCase()}</div>}
                </div>
              );
            })}
          </div>
          {unknowable.length > 4 && (
            <p className="note"><a href="/inventory">See all {unknowable.length} in Stock</a></p>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------ D-059 */}
      {lastAsk && (
        <section className="section">
          <h2>The last thing you checked</h2>
          <p style={{ margin: 0, maxWidth: "64ch" }}>
            On {fmtDate(lastAsk.askedAt)} you asked whether you could make{" "}
            {fmtQty(lastAsk.requestedQty, "", { whole: true }).trim()} of {lastAsk.name}.{" "}
            {lastAsk.headline}
          </p>
          <p className="note">
            This is what we told you then, not a plan we are tracking.{" "}
            <a href="/produce">Ask again</a> to check against today&apos;s stock.
          </p>
        </section>
      )}
    </>
  );
}
