/**
 * CAN I PRODUCE IT? — the whole capability, one page.
 *
 * "COMPLEXITY BELONGS IN THE ENGINE. CLARITY BELONGS IN THE INTERFACE."
 *
 * Three fields and a button. No configuration, no planning run, no module
 * navigation, no inventory vocabulary the user must learn first. The engine
 * behind this is large; none of it appears here.
 *
 * Progressive disclosure is structural, not stylistic:
 *   Layer 1  the verdict and one sentence          — always visible
 *   Layer 2  what's missing, what to do, warnings  — always visible
 *   Layer 3  why                                   — always visible, one line
 *   Layer 4  the calculation and its sources       — behind <details>
 *
 * A correct decision is reachable at layer 2. Layer 4 is one click and required
 * for none.
 */
import { sql } from "../../lib/db/client";
import { qty } from "../../lib/core/decimal";
import { checkFeasibility, MalformedRequestError, type FeasibilityAnswer } from "../../lib/feasibility/engine";
import { recordAnswer } from "../../lib/feasibility/audit";
import {
  VERDICT_MARK, VERDICT_WORD, answerNotices, dpFor, fmtDate, headline, missingLines, reason, reasonFor, warningsFor,
} from "../../lib/feasibility/language";
import { qty as fmtQty } from "../../lib/ui/format";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";

/** The position the answer is computed against — the demo corpus's horizon. */
const AS_OF = new Date("2027-01-01T00:00:00Z");

type Search = { product?: string; qty?: string; needBy?: string };

export default async function Produce({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;

  const products = await sql<{ id: string; code: string; name: string; is_demo: boolean }[]>`
    SELECT DISTINCT i.id, i.code, i.name, bool_or(ps.is_demo) AS is_demo
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
        quantity: qty(params.qty.trim()),
        needBy: params.needBy ? new Date(`${params.needBy}T00:00:00Z`) : null,
        asOf: AS_OF,
      });
      const [site] = await sql<{ id: string }[]>`SELECT id FROM sites LIMIT 1`;
      if (site) {
        // D-055: audit only. Nothing reads this back into a calculation.
        await recordAnswer(answer, { siteId: site.id, askedBy: "inventory_manager" });
      }
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
      <h1>Can I produce it?</h1>
      <p className="sub">
        Tell us what you want to make and how many. We check what is on the shelf and what is
        already on order, and tell you whether you can — and what to do if you can&apos;t.
      </p>

      {/* ---------------------------------------------------------------- ASK */}
      <form className="card" method="GET">
        <div className="ask">
          <label>
            <span>What do you want to produce?</span>
            <select name="product" defaultValue={params.product ?? ""} required>
              <option value="" disabled>Choose a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>How many?</span>
            <input name="qty" type="text" inputMode="decimal" placeholder="10,000" defaultValue={params.qty ?? ""} required />
          </label>
          <label>
            <span>When do you need it? <em>Optional</em></span>
            <input name="needBy" type="date" defaultValue={params.needBy ?? ""} />
          </label>
          <button type="submit">Check</button>
        </div>
        {products.length === 0 && (
          <p className="note">
            No recipes are set up yet, so there is nothing to check. Add them on the{" "}
            <a href="/import">Import</a> page — a recipe lists what one unit of a product is
            made of.
          </p>
        )}
      </form>

      {rejected && (
        <div className="card verdict-card rejected">
          <p className="verdict-line">{rejected}</p>
        </div>
      )}

      {answer && <Answer a={answer} />}
    </>
  );
}

function Answer({ a }: { a: FeasibilityAnswer }) {
  const lines = missingLines(a);
  const cls = a.verdict.toLowerCase().replace("_", "-");

  return (
    <>
      {/* ------------------------------------------------------- LAYER 1 */}
      <div className={`card verdict-card ${cls}`}>
        <div className="verdict-head">
          <span className="verdict-mark">{VERDICT_MARK[a.verdict]}</span>
          <span className="verdict-word">{VERDICT_WORD[a.verdict]}</span>
        </div>
        <p className="verdict-line">{headline(a)}</p>
        {/* Answer-level notices sit HERE, at the layer the user reads to act —
            said once, not repeated against every material. */}
        {answerNotices(a).map((n, i) => (
          <div key={i} className="warn-line">⚠ {n}</div>
        ))}
      </div>

      {/* ------------------------------------------------------- LAYER 2 */}
      {lines.length > 0 && (
        <div className="card">
          <h2>What&apos;s missing</h2>
          <ul className="missing">
            {lines.map((l) => (
              <li key={l.code}>
                <div className="missing-row">
                  <strong>{l.code}</strong>
                  <span className="missing-name">{l.name}</span>
                  <span className="missing-qty">{l.missing}</span>
                </div>
                {l.action && <div className="action">{l.action}</div>}
                {l.warnings.map((w, i) => (
                  <div key={i} className="warn-line">⚠ {w}</div>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings on materials that are NOT short still change what the user
          does — the 🟢 cap lives here, and so does a lead-time discrepancy on a
          material that is otherwise fine. Demo marking is answer-level, above. */}
      {a.components.filter((c) => !lines.some((l) => l.code === c.code) && warningsFor(c).length > 0).length > 0 && (
        <div className="card">
          <h2>Worth knowing</h2>
          {a.components
            .filter((c) => !lines.some((l) => l.code === c.code))
            .flatMap((c) => warningsFor(c).map((w, i) => <div key={`${c.code}-${i}`} className="warn-line">⚠ {w}</div>))}
        </div>
      )}

      {/* ------------------------------------------------------- LAYER 3 */}
      <div className="card">
        <h2>Why</h2>
        <p>{reason(a)}</p>
        {a.assumptions.map((s, i) => (
          <p key={i} className="note">{s}</p>
        ))}
      </div>

      {/* ------------------------------------------------------- LAYER 4 */}
      <details className="card">
        <summary>Show me the numbers</summary>
        <p className="note">
          Everything below is worked out from your stock movements and open orders at{" "}
          {AS_OF.toISOString().slice(0, 10)}. These are not observed facts about the future —
          they follow from the quantity you asked for.
        </p>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Material</th><th></th>
                <th className="num">Needed</th>
                <th className="num">On the shelf</th>
                <th className="num">On hold</th>
                <th className="num">On the way</th>
                <th className="num">Still to order</th>
              </tr>
            </thead>
            <tbody>
              {a.components.map((c) => (
                <tr key={c.itemId}>
                  <td>
                    <strong>{c.code}</strong>
                    <div className="note" style={{ margin: 0 }}>{c.name}</div>
                    <div className="note" style={{ margin: 0 }}>
                      {c.quantityPer} {c.recipeUom} per unit
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.verdict === "NO" ? "bad" : c.verdict === "YES" ? "ok" : "warn"}`}>
                      {VERDICT_MARK[c.verdict]} {VERDICT_WORD[c.verdict]}
                    </span>
                  </td>
                  <td className="num">{c.requirement.value ? fmtQty(c.requirement.value, c.stockUom, { whole: c.integerOnly }) : "—"}</td>
                  <td className="num">{c.available ? fmtQty(c.available, c.stockUom, { whole: c.integerOnly }) : "—"}</td>
                  <td className="num">{c.qualityHold ? fmtQty(c.qualityHold, c.stockUom, { whole: c.integerOnly }) : "—"}</td>
                  <td className="num">{c.incoming ? fmtQty(c.incoming, c.stockUom, { whole: c.integerOnly }) : "—"}</td>
                  <td className="num">{c.shortfall ? fmtQty(c.shortfall, c.stockUom, { whole: c.integerOnly }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {a.components.map((c) => (
          <div key={c.itemId} className="detail-block">
            <h3>{c.code}</h3>
            <p>{reasonFor(c)}</p>
            {c.supply.length > 0 && (
              <ul className="note">
                {c.supply.map((s) => (
                  <li key={s.poLineId}>
                    Order {s.poNumber}: {fmtQty(s.openQty, s.uom)} still to come, expected{" "}
                    {fmtDate(s.expectedDate)}
                    {s.dateSource === "ETA" ? " (latest shipping update)" : s.dateSource === "PROMISED" ? " (supplier's promise)" : ""}
                    {s.overdue ? " — overdue" : ""}
                  </li>
                ))}
              </ul>
            )}
            {c.recommendation?.leadTimeDays != null && (
              <p className="note">
                Ordering takes {c.recommendation.leadTimeDays} days
                {c.recommendation.leadTimeSource === "SUPPLIER_TERMS" ? ", per this supplier's terms" : ", per the item record"}.
              </p>
            )}
          </div>
        ))}
      </details>
    </>
  );
}
