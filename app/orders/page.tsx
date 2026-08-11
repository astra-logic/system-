/**
 * ORDERS — "What is coming, and what do I have to chase?"
 *
 * ⚠ THE FAILURE THIS PAGE EXISTS TO FIX
 *
 *   PO-1008 — 5,000 kg of curing agent, promised 25 Dec, held at Alexandria
 *   customs since 28 Dec, arrival already revised once. On the previous page
 *   that row's entire flags column read "SEA". The customs hold lived in a
 *   milestones table at the bottom of the page; the revised date lived in a
 *   forecasts table between them. The user did the join.
 *
 *   Every one of those facts was already in the database. Only the assembly was
 *   missing. So this page has ONE list of orders, and each order carries its own
 *   risk on its own row.
 *
 * Open work and finished work are separated because they answer different
 * questions — "what must I chase" and "how does this supplier actually behave".
 * Mixing them makes the first question harder to answer, which is the one a
 * manager arrives with.
 *
 * ⚠ An ETA is a FORECAST and never silently becomes a promise. Where the two
 * disagree the row SHOWS the disagreement rather than resolving it.
 */
import { firstSiteId } from "../../lib/engine/run";
import { byUrgency, orderLines, whyLate, type OrderLine } from "../../lib/views/orders";
import { qty as fmtQty, moneyExact, date as fmtDate, days as fmtDays } from "../../lib/ui/format";
import { DemoBanner } from "../demo-banner";
import { sql } from "../../lib/db/client";

export const dynamic = "force-dynamic";
const AS_OF = new Date("2027-01-01T00:00:00Z");

const MARK = { no: "🔴", "at-risk": "🟡", yes: "🟢", "cant-say": "⚪" } as const;

export default async function Orders() {
  const siteId = await firstSiteId();
  const [demo] = await sql<{ any_demo: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS any_demo FROM import_batches`;

  if (!siteId) {
    return (
      <>
        <h1>Orders</h1>
        <div className="state">
          <p className="state-title">No orders yet</p>
          <p className="state-body">
            Import your purchase orders and receipts and we&apos;ll tell you which deliveries need
            chasing.
          </p>
          <a className="btn btn-secondary" href="/import">Import your data</a>
        </div>
      </>
    );
  }

  const all = await orderLines(siteId, AS_OF);
  const open = all.filter((o) => o.isOpen).sort(byUrgency);
  // Sorted by ARRIVAL, because arrival is the date the row shows. Sorting by
  // order date while displaying receipt date makes the list look shuffled.
  const history = all
    .filter((o) => !o.isOpen)
    .sort((a, b) => (b.instalments[0]?.receivedAt.getTime() ?? 0) - (a.instalments[0]?.receivedAt.getTime() ?? 0));
  const needChasing = open.filter((o) => o.state === "no" || o.state === "at-risk");

  return (
    <>
      <DemoBanner isDemo={demo?.any_demo ?? false} />
      <h1>Orders</h1>
      <p className="sub">
        {open.length === 0
          ? "Nothing is on order."
          : needChasing.length === 0
            ? `${open.length} ${open.length === 1 ? "delivery is" : "deliveries are"} on the way, and none needs chasing.`
            : `${needChasing.length} of ${open.length} ${open.length === 1 ? "delivery" : "deliveries"} ${needChasing.length === 1 ? "needs" : "need"} chasing.`}
        {" "}As at {fmtDate(AS_OF)}.
      </p>

      {open.length > 0 && (
        <section className="section">
          <h2>On the way</h2>
          <div className="rows">{open.map((o) => <OpenRow key={o.poLineId} o={o} />)}</div>
        </section>
      )}

      {history.length > 0 && (
        <section className="section">
          <h2>Already arrived</h2>
          <p className="section-note">
            What each supplier actually did, as opposed to what they promised.
          </p>
          <div className="rows tight">{history.map((o) => <HistoryRow key={o.poLineId} o={o} />)}</div>
          <p className="note">
            Delivery time is measured to the <strong>first</strong> instalment. Where a delivery
            arrived in parts, measuring to the last would give a different answer — so the choice is
            stated rather than assumed.
          </p>
        </section>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* An order still in flight — everything needed to act, on one row.           */
/* -------------------------------------------------------------------------- */

function OpenRow({ o }: { o: OrderLine }) {
  const why = whyLate(o);

  return (
    <div className="row" id={o.number}>
      <span className="rmark" aria-hidden="true">{MARK[o.state]}</span>

      <div className="rmain">
        <div className="rtitle">
          {o.itemName}
          <span className="rcode">{o.number} · {o.supplier}</span>
        </div>
        <div className="rsub">
          {fmtQty(o.openQty, o.uom)} still to come
          {o.receivedQty.greaterThan(0) && <> of {fmtQty(o.orderedQty, o.uom)} ordered</>}
          {o.expedited && <> · paid to rush</>}
        </div>
        {why && <div className="rnote">{why}</div>}
      </div>

      <div className="rtrail strong">
        {o.expectedDate ? fmtDate(o.expectedDate) : <span className="rtrail-sub">no date on record</span>}
        {o.daysLate !== null && <span className="rtrail-sub">{fmtDays(o.daysLate)}</span>}
      </div>

      {/* ⚠ The forecast and the promise are shown SEPARATELY where they differ.
          Collapsing them into one date hides that the supplier moved. */}
      {o.datesDisagree && (
        <div className="rwarn">
          ⚠ Promised {fmtDate(o.promisedDate)}, now expected {fmtDate(o.etaDate)} — the shipping
          update is the later word, but it is an estimate, not a commitment.
        </div>
      )}

      {o.lastMilestone && !o.heldInCustoms && (
        <div className="rnote">
          Last seen: {o.lastMilestone.toLowerCase()}
          {o.lastMilestoneWhere && ` at ${o.lastMilestoneWhere}`}
          {o.lastMilestoneAt && ` on ${fmtDate(o.lastMilestoneAt)}`}. This is the last update we were
          given, not live tracking.
        </div>
      )}

      {(o.state === "no" || o.state === "at-risk") && (
        <div className="rdo">
          <a href={`/inventory#${o.itemCode}`}>Check what this is holding up</a>
          {o.heldInCustoms
            ? " — and chase your clearing agent, not the supplier."
            : " — then chase the supplier."}
        </div>
      )}
      {o.state === "cant-say" && (
        <div className="rdo">
          No arrival date was ever recorded for this order, so we can&apos;t tell you if it is late.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* A finished order — kept for what it says about the supplier.               */
/* -------------------------------------------------------------------------- */

function HistoryRow({ o }: { o: OrderLine }) {
  const parts = o.instalments;

  return (
    <div className="row nomark" id={o.number}>
      <div className="rmain">
        <div className="rtitle">
          {o.itemName}
          <span className="rcode">{o.number} · {o.supplier}</span>
        </div>
        <div className="rsub">
          {fmtQty(o.receivedQty, o.uom)} arrived
          {o.actualLeadTimeDays !== null && <> in {o.actualLeadTimeDays} days</>}
          {o.arrivedLateBy !== null
            ? <>, {fmtDays(o.arrivedLateBy)}</>
            : o.promisedDate && <>, on time</>}
          {parts.length > 1 && <> · in {parts.length} instalments</>}
          {o.unitPrice && o.currency && <> · {moneyExact(o.unitPrice, o.currency)} per {o.uom}</>}
        </div>
        {parts.length > 1 && (
          <div className="rnote">
            {parts.map((p) => `${fmtQty(p.quantity, p.uom)} on ${fmtDate(p.receivedAt)}`).join(" · ")}
          </div>
        )}
      </div>
      <div className="rtrail">{parts[0] ? fmtDate(parts[0].receivedAt) : "—"}</div>
    </div>
  );
}
