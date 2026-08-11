/**
 * MAKE — "Can I produce it?"
 *
 * The reference screen. Its logic was right before Block 14; what changed is
 * the presentation:
 *
 *   BEFORE  six bordered cards stacked down the page, each competing for the eye
 *   AFTER   one calm ask, then THE ANSWER at display scale, then a list of what
 *           is missing, then the reason, then evidence behind one disclosure
 *
 * The answer is the only element allowed a status colour, because there the
 * colour IS the information. Everything else does its hierarchy with type and
 * space.
 *
 *   Layer 1  the verdict — one mark, one word, one sentence
 *   Layer 2  what's missing and what to do, one row per material
 *   Layer 3  why, in the user's terms
 *   Layer 4  the numbers, behind a disclosure
 *
 * NO engine rule changes here. Every sentence still comes from
 * lib/feasibility/language.ts, which is the only place feasibility prose lives.
 */
import { sql } from "../../lib/db/client";
import { qty } from "../../lib/core/decimal";
import { checkFeasibility, MalformedRequestError, type FeasibilityAnswer } from "../../lib/feasibility/engine";
import { recordAnswer } from "../../lib/feasibility/audit";
import {
  VERDICT_MARK, VERDICT_WORD, answerNotices, fmtDate, headline,
  missingLines, reason, reasonFor, warningsFor,
} from "../../lib/feasibility/language";
import { qty as fmtQty } from "../../lib/ui/format";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";

/** The position the answer is computed against — the demo corpus's horizon. */
const AS_OF = new Date("2027-01-01T00:00:00Z");

type Search = { product?: string; qty?: string; needBy?: string };

export default async function Make({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;

  const products = await sql<{ id: string; code: string; name: string }[]>`
    SELECT DISTINCT i.id, i.code, i.name
    FROM items i
    JOIN product_structures ps ON ps.parent_item_id = i.id
    GROUP BY i.id, i.code, i.name
    ORDER BY i.code`;

  let answer: FeasibilityAnswer | null = null;
  let rejected: string | null = null;

  if (params.product && params.qty) {
    try {
      answer = await checkFeasibility({
        productItemId: params.product,
        quantity: qty(params.qty.trim().replace(/,/g, "")),
        needBy: params.needBy ? new Date(`${params.needBy}T00:00:00Z`) : null,
        asOf: AS_OF,
      });
      const [site] = await sql<{ id: string }[]>`SELECT id FROM sites LIMIT 1`;
      // D-055: audit only. Nothing reads this back into a calculation.
      if (site) await recordAnswer(answer, { siteId: site.id, askedBy: "inventory_manager" });
    } catch (e) {
      rejected =
        e instanceof MalformedRequestError
          ? e.message
          : "Something went wrong working that out. Nothing was changed.";
    }
  }

  return (
    <>
      <DemoBanner isDemo={answer?.isDemo ?? false} />

      <h1>Can I make it?</h1>
      <p className="sub">
        Tell us what you want to make and how many. We check what is on the shelf and what is
        already on order.
      </p>

      {/* ---------------------------------------------------------------- ASK */}
      <form method="GET">
        <div className="ask">
          <label>
            <span>What do you want to make?</span>
            <select name="product" defaultValue={params.product ?? ""} required>
              <option value="" disabled>Choose a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.code}</option>
              ))}
            </select>
          </label>
          <label>
            <span>How many?</span>
            <input name="qty" type="text" inputMode="decimal" placeholder="10,000"
                   defaultValue={params.qty ?? ""} required />
          </label>
          <label>
            <span>When do you need it? <em style={{ fontStyle: "normal", color: "var(--text-muted)" }}>Optional</em></span>
            <input name="needBy" type="date" defaultValue={params.needBy ?? ""} />
          </label>
          <button className="btn btn-primary" type="submit">Check</button>
        </div>
      </form>

      {products.length === 0 && (
        <div className="state" style={{ marginTop: "var(--s6)" }}>
          <p className="state-title">No recipes are set up yet</p>
          <p className="state-body">
            A recipe lists what one unit of a product is made of. Without one we can&apos;t work
            out what a production run needs.
          </p>
          <a className="btn btn-secondary" href="/import">Add recipes</a>
        </div>
      )}

      {rejected && (
        <div className="state error" role="alert" style={{ marginTop: "var(--s6)" }}>
          <p className="state-title">{rejected}</p>
          <p className="state-body">Adjust what you entered and check again.</p>
        </div>
      )}

      {answer && <Answer a={answer} />}
    </>
  );
}

function Answer({ a }: { a: FeasibilityAnswer }) {
  const lines = missingLines(a);
  const state = a.verdict.toLowerCase().replace("_", "-");

  // Materials that are NOT short but still carry something that changes what
  // the user does — the green cap, a lead-time doubt, a conflicting saving.
  const alsoWorthKnowing = a.components
    .filter((c) => !lines.some((l) => l.code === c.code))
    .flatMap((c) => warningsFor(c));

  return (
    <>
      {/* ---------------------------------------------------------- LAYER 1 */}
      <div className={`answer ${state}`}>
        <div className="ahead">
          <span className="amark" aria-hidden="true">{VERDICT_MARK[a.verdict]}</span>
          <span className="aword">{VERDICT_WORD[a.verdict]}</span>
        </div>
        <p className="aline">{headline(a)}</p>
        {answerNotices(a).map((n, i) => (
          <p key={i} className="warn-line" style={{ marginTop: "var(--s3)" }}>⚠ {n}</p>
        ))}
      </div>

      {/* ---------------------------------------------------------- LAYER 2 */}
      {lines.length > 0 && (
        <section className="section">
          <h2>What&apos;s missing</h2>
          <div className="rows">
            {lines.map((l) => (
              <div className="row nomark" key={l.code}>
                <div className="rmain">
                  <div className="rtitle">{l.name}<span className="rcode">{l.code}</span></div>
                </div>
                <div className="rtrail strong">{l.missing}</div>
                {l.action && <div className="rdo">{l.action}</div>}
                {l.warnings.map((w, i) => <div key={i} className="rwarn">⚠ {w}</div>)}
              </div>
            ))}
          </div>
        </section>
      )}

      {alsoWorthKnowing.length > 0 && (
        <section className="section">
          <h2>Worth knowing</h2>
          <div className="rows tight">
            {alsoWorthKnowing.map((w, i) => (
              <div key={i} className="rwarn" style={{ margin: 0, gridColumn: "auto" }}>⚠ {w}</div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- LAYER 3 */}
      <section className="section">
        <h2>Why</h2>
        <p style={{ maxWidth: "66ch", margin: 0 }}>{reason(a)}</p>
        {a.assumptions.map((s, i) => <p key={i} className="note">{s}</p>)}

        {/* ------------------------------------------------------- LAYER 4 */}
        <details className="disclose">
          <summary>Show the numbers</summary>
          <div className="disclose-body">
            <p className="note" style={{ marginTop: 0 }}>
              Worked out from your stock movements and open orders at{" "}
              {AS_OF.toISOString().slice(0, 10)}.
            </p>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th className="num">Needed</th>
                    <th className="num">On the shelf</th>
                    <th className="num">On hold</th>
                    <th className="num">On the way</th>
                    <th className="num">Still to order</th>
                  </tr>
                </thead>
                <tbody>
                  {a.components.map((c) => {
                    const w = { whole: c.integerOnly };
                    return (
                      <tr key={c.itemId}>
                        <td>
                          <strong>{c.name}</strong>
                          <div className="note" style={{ margin: 0 }}>
                            {c.code} · {c.quantityPer} {c.recipeUom} per unit
                          </div>
                        </td>
                        <td className="num">{fmtQty(c.requirement.value, c.stockUom, w)}</td>
                        <td className="num">{fmtQty(c.available, c.stockUom, w)}</td>
                        <td className="num">{fmtQty(c.qualityHold, c.stockUom, w)}</td>
                        <td className="num">{fmtQty(c.incoming, c.stockUom, w)}</td>
                        <td className="num">{fmtQty(c.shortfall, c.stockUom, w)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {a.components.map((c) => (
              <div key={c.itemId} className="detail-block">
                <h3>{c.name}</h3>
                <p style={{ margin: 0 }}>{reasonFor(c)}</p>
                {c.supply.length > 0 && (
                  <ul className="reasons">
                    {c.supply.map((s) => (
                      <li key={s.poLineId}>
                        {s.poNumber}: {fmtQty(s.openQty, s.uom)} still to come, expected{" "}
                        {fmtDate(s.expectedDate)}
                        {s.dateSource === "ETA" ? " (latest shipping update)"
                          : s.dateSource === "PROMISED" ? " (supplier's promise)" : ""}
                        {s.overdue ? " — overdue" : ""}
                      </li>
                    ))}
                  </ul>
                )}
                {c.leadTimeDays != null && (
                  <p className="note">
                    Ordering takes {c.leadTimeDays} days
                    {c.leadTimeSource === "SUPPLIER_TERMS" ? ", per this supplier's terms" : ", per the item record"}.
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      </section>
    </>
  );
}
