/**
 * STOCK — "What do I have, and what should I worry about?"
 *
 * Before Block 14 this was a correct, disciplined quantity ledger that was
 * SILENT on risk: eight rows sorted alphabetically by item code, with a
 * `Reserved` column reading 0.000 eight times.
 *
 * Now it leads with what needs attention and orders by urgency. Every state is
 * derived from two OBSERVED numbers — how fast the material is used, and how
 * long it takes to arrive. No minimum-stock level is invented, because `A-18`
 * is an open factory policy the system may not choose.
 *
 * ⚪ carries its own remedy. With one of eight materials currently judgeable,
 * a grey row that only shrugs would make the product look broken; a grey row
 * that names its missing input and what supplying it unlocks is onboarding.
 */
import { firstSiteId } from "../../lib/engine/run";
import { byUrgency, cantSayCopy, stockLines, type StockLine } from "../../lib/views/stock";
import { qty as fmtQty, approx as fmtApprox, date as fmtDate, cover as fmtCover } from "../../lib/ui/format";
import { DemoBanner } from "../demo-banner";
import { sql } from "../../lib/db/client";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

const MARK = { no: "🔴", "at-risk": "🟡", yes: "🟢", "cant-say": "⚪" } as const;

export default async function Stock() {
  const siteId = await firstSiteId();
  const [demo] = await sql<{ any_demo: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS any_demo FROM import_batches`;

  if (!siteId) {
    return (
      <>
        <h1>Stock</h1>
        <div className="state">
          <p className="state-title">No materials yet</p>
          <p className="state-body">Import your item list and stock movements and they will appear here.</p>
          <a className="btn btn-secondary" href="/import">Import your data</a>
        </div>
      </>
    );
  }

  const lines = (await stockLines(siteId, AS_OF)).sort(byUrgency);
  const needsAttention = lines.filter((l) => l.state === "no" || l.state === "at-risk");
  const unknown = lines.filter((l) => l.state === "cant-say");
  const healthy = lines.filter((l) => l.state === "yes");

  return (
    <>
      <DemoBanner isDemo={demo?.any_demo ?? false} />
      <h1>Stock</h1>
      <p className="sub">
        {/* ⚠ "Nothing is running short" would be a lie by omission while most of
            the shelf is unjudgeable. The claim is scoped to what we can watch. */}
        {needsAttention.length > 0
          ? `${needsAttention.length} ${needsAttention.length === 1 ? "material needs" : "materials need"} attention.`
          : unknown.length > 0
            ? "Nothing we can watch is running short."
            : "Nothing is running short."}
        {" "}Balances as at {fmtDate(AS_OF)}.
      </p>

      {needsAttention.length > 0 && (
        <section className="section">
          <h2>Needs attention</h2>
          <div className="rows">{needsAttention.map((l) => <Row key={l.itemId} l={l} />)}</div>
        </section>
      )}

      {unknown.length > 0 && (
        <section className="section">
          <h2>We can&apos;t judge these yet</h2>
          <p className="section-note">
            We can watch {lines.length - unknown.length} of your {lines.length} materials properly.
            For the rest we can show what you have, but we can&apos;t warn you before you run out
            until we know both how fast you use it and how long it takes to arrive.
          </p>
          <div className="rows">{unknown.map((l) => <Row key={l.itemId} l={l} />)}</div>
        </section>
      )}

      {healthy.length > 0 && (
        <section className="section">
          <h2>Healthy</h2>
          <div className="rows tight">{healthy.map((l) => <Row key={l.itemId} l={l} />)}</div>
        </section>
      )}
    </>
  );
}

function Row({ l }: { l: StockLine }) {
  const w = { whole: l.integerOnly };
  const c = l.state === "cant-say" ? cantSayCopy(l) : null;

  return (
    <div className="row" id={l.code}>
      <span className="rmark" aria-hidden="true">{MARK[l.state]}</span>
      <div className="rmain">
        <div className="rtitle">{l.name}<span className="rcode">{l.code}</span></div>
        <div className="rsub">
          {c ? c.why : (
            <>
              {l.coverDays !== null && <>{fmtCover(l.coverDays)} of cover</>}
              {l.leadTimeDays !== null && <>, and it takes {l.leadTimeDays} days to arrive</>}
              {l.qualityHold.greaterThan(0) && <> · {fmtQty(l.qualityHold, l.stockUom, w)} waiting on inspection</>}
            </>
          )}
        </div>
      </div>
      <div className="rtrail strong">
        {fmtQty(l.available, l.stockUom, w)}
        {l.onOrder.greaterThan(0) && (
          <span className="rtrail-sub">
            {fmtQty(l.onOrder, l.stockUom, w)} on the way
            {l.nextArrival && ` · ${fmtDate(l.nextArrival)}`}
          </span>
        )}
      </div>

      {/* What to do — only where an action is genuinely known. */}
      {l.state === "no" && (
        <div className="rdo">
          <a href="/orders">Order more now</a> — you will run out before a replacement could arrive.
        </div>
      )}
      {l.state === "at-risk" && (
        <div className="rdo">
          <a href="/orders">Order before you run out</a> — cover is shorter than the usual delivery time.
        </div>
      )}
      {c?.fix && (
        <div className="rdo"><a href={c.fix}>Add a delivery time</a> — {c.then.toLowerCase()}</div>
      )}
      {c && !c.fix && <div className="rnote">{c.then}</div>}

      {/* Layer 3/4 — the observation the state rests on, and its window. */}
      {l.dailyUse !== null && (
        <div className="rnote">
          Used about {fmtApprox(l.dailyUse.times(30), l.stockUom)} a month, based on{" "}
          {l.historyDays} days of recorded use.
        </div>
      )}
    </div>
  );
}
