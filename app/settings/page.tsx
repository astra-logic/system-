/**
 * SETTINGS — the trust surface.
 *
 * ⚠ THIS IS NOT A PREFERENCES PAGE. It is where the user finds out what the
 * system does not know about their factory, and fixes it.
 *
 * Every other screen sends its unknowns here. Stock says "no delivery time is
 * on record" and links here; the promise it makes on that link is that this
 * page will let the user supply the missing value in seconds. So this page is
 * built around that promise:
 *
 *   WHAT IS MISSING   named, per material, never a count
 *   WHY IT MATTERS    what the system currently cannot tell them
 *   WHAT IT UNLOCKS   what starts working the moment they fill it in
 *
 * ⚠ A DELIVERY TIME IS A STATED FACT, NEVER A FITTED ONE.
 *
 *   The system has the history to compute an average delivery time and it
 *   deliberately does not offer one here. A supplier's commitment is a term of
 *   business the factory states; a statistic fitted to past deliveries is a
 *   different thing wearing the same label, and quietly substituting one for
 *   the other would corrupt every downstream answer. The observed times ARE
 *   shown beside the field, so the user can decide — but the system never
 *   decides for them.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, sql } from "../../lib/db/client";
import { items } from "../../lib/db/schema";
import { firstSiteId } from "../../lib/engine/run";
import { currentEvidenceGaps } from "../../lib/engine/persist";
import { stockLines } from "../../lib/views/stock";
import { date as fmtDate } from "../../lib/ui/format";
import { plain, sentence } from "../../lib/ui/plain";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";

/**
 * Record a delivery time the user has stated.
 *
 * Clearing the field removes the value rather than storing a zero — "unknown"
 * and "arrives the same day" are different claims, and the schema keeps them
 * different.
 */
async function saveLeadTime(formData: FormData): Promise<void> {
  "use server";
  const itemId = String(formData.get("itemId"));
  const code = String(formData.get("code") ?? "");
  const raw = String(formData.get("leadTimeDays") ?? "").trim();
  const parsed = raw === "" ? null : Number.parseInt(raw, 10);
  if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) {
    redirect(`/settings?bad=${encodeURIComponent(code)}#${code}`);
  }

  await db.update(items).set({ leadTimeDays: parsed }).where(eq(items.id, itemId));
  revalidatePath("/settings");
  revalidatePath("/inventory");
  revalidatePath("/");

  /* ⚠ A saved row LEAVES the "missing" list and lands inside a collapsed
     group, so without this the user sees their row vanish and gets no word
     that anything happened. The redirect carries what was saved so the page
     can confirm it and keep the row in view. */
  redirect(`/settings?saved=${encodeURIComponent(code)}#${code}`);
}

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string; bad?: string }> }) {
  const { saved, bad } = await searchParams;
  const siteId = await firstSiteId();
  if (!siteId) {
    return (
      <>
        <h1>Settings</h1>
        <div className="state">
          <p className="state-title">Nothing is set up yet</p>
          <p className="state-body">Start by bringing your data in.</p>
          <a className="btn btn-secondary" href="/import">Import your data</a>
        </div>
      </>
    );
  }

  /* Per material: what we hold, and what we have actually seen. The observed
     figures are shown for the user's judgement — never written for them. */
  const materials = await sql<{
    id: string; code: string; name: string; lead_time_days: number | null;
    supplier_lead: number | null; supplier_name: string | null;
    observed_min: number | null; observed_max: number | null; observed_count: number;
  }[]>`
    SELECT i.id, i.code, i.name, i.lead_time_days,
           (SELECT sit.lead_time_days FROM supplier_item_terms sit
             WHERE sit.item_id = i.id AND sit.lead_time_days IS NOT NULL
             ORDER BY sit.effective_from DESC LIMIT 1) AS supplier_lead,
           (SELECT sup.name FROM supplier_item_terms sit
              JOIN suppliers sup ON sup.id = sit.supplier_id
             WHERE sit.item_id = i.id AND sit.lead_time_days IS NOT NULL
             ORDER BY sit.effective_from DESC LIMIT 1) AS supplier_name,
           obs.lo AS observed_min, obs.hi AS observed_max, COALESCE(obs.n, 0) AS observed_count
    FROM items i
    LEFT JOIN LATERAL (
      SELECT MIN(d)::int AS lo, MAX(d)::int AS hi, COUNT(*)::int AS n
      FROM (
        SELECT EXTRACT(DAY FROM (MIN(r.received_at) - po.ordered_at))::int AS d
        FROM po_lines pl
        JOIN purchase_orders po ON po.id = pl.po_id
        JOIN receipts r ON r.po_line_id = pl.id
        WHERE pl.item_id = i.id AND po.ordered_at IS NOT NULL
        GROUP BY pl.id, po.ordered_at
      ) x
    ) obs ON true
    WHERE i.site_id = ${siteId}::uuid AND i.active
    ORDER BY (i.lead_time_days IS NOT NULL), i.code`;

  const [gaps, costs, batches] = await Promise.all([
    currentEvidenceGaps(siteId),
    sql<{ n: number; oldest_days: number | null; oldest_at: string | null }[]>`
      SELECT COUNT(*)::int AS n,
             EXTRACT(DAY FROM (now() - MIN(as_of)))::int AS oldest_days,
             MIN(as_of)::text AS oldest_at
      FROM cost_references`,
    sql<{ n: number; last_at: string | null; any_demo: boolean }[]>`
      SELECT COUNT(*)::int AS n, MAX(uploaded_at)::text AS last_at,
             COALESCE(bool_or(is_demo), false) AS any_demo
      FROM import_batches`,
  ]);

  const missing = materials.filter((m) => m.lead_time_days === null && m.supplier_lead === null);
  const known = materials.filter((m) => m.lead_time_days !== null || m.supplier_lead !== null);
  const savedItem = saved ? materials.find((m) => m.code === saved) : undefined;

  /* ⚠ WHAT THE CONFIRMATION MAY PROMISE.
     Supplying a delivery time only unlocks a warning if we ALSO know how fast
     the material goes. "We can now warn you before this runs out" was a lie for
     a material that has never been issued — the first thing this page said to a
     user was something the product could not do. So the promise is checked
     against the same rule Stock uses, and downgraded when it doesn't hold. */
  const savedState = savedItem
    ? (await stockLines(siteId, new Date())).find((l) => l.code === savedItem.code)
    : undefined;
  const cost = costs[0];
  const batch = batches[0];

  return (
    <>
      <DemoBanner isDemo={batch?.any_demo ?? false} />
      <h1>Settings</h1>
      <p className="sub">
        What the system knows about your factory, and what it is still missing. Everything here
        changes what the other screens are able to tell you.
      </p>

      {/* ------------------------------------------------------- DELIVERY TIMES */}
      <section className="section">
        <h2>How long things take to arrive</h2>
        <p className="section-note">
          Without this we can show what you have, but we can never warn you <em>before</em> you run
          out — we&apos;d have no idea how early is early enough. This is the single most useful
          thing you can tell us.
        </p>

        {savedItem && (
          <p className="saved" role="status">
            Saved.{" "}
            {savedState && savedState.state !== "cant-say" ? (
              <>We can now warn you before {savedItem.name} runs out.</>
            ) : (
              <>
                We still can&apos;t warn you about {savedItem.name} — we haven&apos;t seen it leave
                stock yet, so we don&apos;t know how fast you use it. That comes with time, not
                with anything you can enter.
              </>
            )}{" "}
            <a href={`/inventory#${savedItem.code}`}>See it in Stock</a>
          </p>
        )}
        {bad && (
          <p className="rwarn" role="alert" style={{ marginBottom: "var(--s4)" }}>
            ⚠ That wasn&apos;t a number of days we could use. Enter a whole number, or clear the box
            to say you don&apos;t know yet.
          </p>
        )}

        {missing.length === 0 ? (
          <p className="note">Every material has a delivery time on record.</p>
        ) : (
          <div className="rows">
            {missing.map((m) => <LeadTimeRow key={m.id} m={m} />)}
          </div>
        )}

        {known.length > 0 && (
          /* Opened when it holds the row the user just saved — otherwise their
             row would be one click further away than where they left it. */
          <details className="disclose" open={savedItem !== undefined}>
            <summary>The {known.length} we already have</summary>
            <div className="disclose-body">
              <div className="rows tight">
                {known.map((m) => (
                  <LeadTimeRow key={m.id} m={m} justSaved={m.code === saved} />
                ))}
              </div>
            </div>
          </details>
        )}
      </section>

      {/* ------------------------------------------------------------- GAPS */}
      {gaps.length > 0 && (
        <section className="section">
          <h2>What else we&apos;re missing</h2>
          <p className="section-note">
            Each of these stops us working something out. None of them is a fault in your data —
            they are things nobody has recorded yet.
          </p>
          <div className="rows">
            {gaps.map((g) => (
              <div className="row" key={g.id}>
                <span className="rmark" aria-hidden="true">⚪</span>
                <div className="rmain">
                  <div className="rtitle">{sentence(g.missing_evidence)}</div>
                  <div className="rsub">Because of this we can&apos;t work out: {plain(g.blocks)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- THE FIGURES */}
      <section className="section">
        <h2>The costs we hold</h2>
        {cost && cost.n > 0 ? (
          <p style={{ margin: 0, maxWidth: "64ch" }}>
            We have {cost.n} recorded {cost.n === 1 ? "cost" : "costs"} to work from. The oldest was
            entered {cost.oldest_days} days ago
            {cost.oldest_at && <>, on {fmtDate(cost.oldest_at)}</>}.{" "}
            <span className="note" style={{ display: "inline", margin: 0 }}>
              We state the age rather than calling it out of date — how old is too old depends on
              your business, and we won&apos;t decide that for you.
            </span>
          </p>
        ) : (
          <p style={{ margin: 0, maxWidth: "64ch" }}>
            No costs are recorded, so we can&apos;t put a money figure on anything. Add them and the
            savings screen starts working.
          </p>
        )}
      </section>

      {/* --------------------------------------------------------- YOUR DATA */}
      <section className="section">
        <h2>Your data</h2>
        <div className="rows">
          <div className="row nomark">
            <div className="rmain">
              <div className="rtitle">Bring in a spreadsheet</div>
              <div className="rsub">
                Items, stock movements or recipes. Rows that don&apos;t pass are shown to you and
                rejected — never quietly fixed.
              </div>
            </div>
            <div className="rtrail">
              {batch && batch.n > 0
                ? <>{batch.n} {batch.n === 1 ? "file" : "files"} so far</>
                : <span className="rtrail-sub">nothing imported yet</span>}
              {batch?.last_at && <span className="rtrail-sub">last on {fmtDate(batch.last_at)}</span>}
            </div>
            <div className="rdo"><a href="/import">Import a file</a></div>
          </div>

          <div className="row nomark">
            <div className="rmain">
              <div className="rtitle">Check the data can be trusted</div>
              <div className="rsub">
                Whether your stock balances agree with the movements behind them, what each import
                accepted and rejected, and how old the figures are.
              </div>
            </div>
            <div className="rdo"><a href="/data-health">Check my data</a></div>
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */

type Material = {
  id: string; code: string; name: string; lead_time_days: number | null;
  supplier_lead: number | null; supplier_name: string | null;
  observed_min: number | null; observed_max: number | null; observed_count: number;
};

function LeadTimeRow({ m, justSaved = false }: { m: Material; justSaved?: boolean }) {
  const held = m.supplier_lead ?? m.lead_time_days;

  return (
    <div className={`row nomark${justSaved ? " flash" : ""}`} id={m.code}>
      <div className="rmain">
        <div className="rtitle">{m.name}<span className="rcode">{m.code}</span></div>
        <div className="rsub">
          {m.supplier_lead !== null ? (
            <>
              {m.supplier_lead} days, agreed with {m.supplier_name ?? "the supplier"}. We use that
              in preference to the general figure you set here.
            </>
          ) : held !== null ? (
            <>{held} days on record.</>
          ) : (
            <>
              Nothing on record. Until you tell us, we can&apos;t warn you before this runs out.
            </>
          )}
        </div>

        {/* ⚠ Shown, never written. The user decides; the system does not fit a
            number to history and call it a commitment. */}
        {m.observed_count > 0 && (
          <div className="rnote">
            {m.observed_count === 1
              ? `The one delivery we've seen took ${m.observed_max} days.`
              : `The ${m.observed_count} deliveries we've seen took between ${m.observed_min} and ${m.observed_max} days.`}
            {" "}That is what happened, not what your supplier promised — enter the figure you
            actually rely on.
          </div>
        )}
      </div>

      <form action={saveLeadTime} className="rtrail">
        <input type="hidden" name="itemId" value={m.id} />
        <input type="hidden" name="code" value={m.code} />
        <label className="inline-field">
          <span>Days</span>
          <input name="leadTimeDays" type="number" min="0" step="1" inputMode="numeric"
                 defaultValue={m.lead_time_days ?? ""} placeholder="—" />
        </label>
        <button className="btn btn-secondary" type="submit">Save</button>
      </form>
    </div>
  );
}
