/**
 * BRING IN YOUR DATA — the front door.
 *
 * UPLOAD → PARSE → VALIDATE → SHOW ERRORS → ACCEPT VALID → WRITE TO LEDGER → RESULT
 *
 * The upload does not write to the database. It calls the same `postMovement`
 * every other path uses, so a spreadsheet gets exactly the ledger's rules —
 * duplicate refusal, catch-weight enforcement, opening-balance segregation — and
 * cannot bypass any of them.
 */
import { revalidatePath } from "next/cache";
import { sql } from "../../lib/db/client";
import { firstSiteId } from "../../lib/engine/run";
import { parseFile, readSheet, recordBatch } from "../../lib/import/ingest";
import { ITEM_SPEC, MOVEMENT_SPEC, STRUCTURE_SPEC } from "../../lib/import/specs";
import { applyItems, applyMovements, applyStructures, recordOutcomes, type ApplyReport } from "../../lib/import/apply";
import { date as fmtDate } from "../../lib/ui/format";
import { DemoBanner } from "../demo-banner";

export const dynamic = "force-dynamic";

interface Outcome {
  batchId: string;
  filename: string;
  kind: string;
  isDemo: boolean;
  missingColumns: { column: string; consequence: string }[];
  totalRows: number;
  report: ApplyReport | null;
}

async function handleUpload(formData: FormData): Promise<void> {
  "use server";
  const siteId = await firstSiteId();
  if (!siteId) return;

  const file = formData.get("file") as File | null;
  const kind = String(formData.get("kind") ?? "MOVEMENTS");
  // Bible §47: origin is declared at the door and carried structurally from there.
  const isDemo = formData.get("isDemo") === "on";
  if (!file || file.size === 0) return;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { header, rows } = readSheet(buffer);

  if (kind === "ITEMS") {
    const parsed = parseFile(header, rows, ITEM_SPEC);
    const { batchId } = await recordBatch(parsed, {
      siteId, filename: file.name, kind, uploadedBy: "admin", isDemo,
    });
    if (parsed.missingColumns.length === 0) {
      const report = await applyItems(parsed, { siteId });
      await recordOutcomes(batchId, report);
    }
  } else if (kind === "STRUCTURES") {
    const parsed = parseFile(header, rows, STRUCTURE_SPEC);
    const { batchId } = await recordBatch(parsed, {
      siteId, filename: file.name, kind, uploadedBy: "admin", isDemo,
    });
    if (parsed.missingColumns.length === 0) {
      /* ⚠ `isDemo` is deliberately NOT passed through. An imported recipe is
         always real (D-054, contract §8) — demo structure exists only in the
         seed, so a demo recipe cannot reach a factory item by this route. */
      const report = await applyStructures(parsed, { siteId });
      await recordOutcomes(batchId, report);
    }
  } else {
    const parsed = parseFile(header, rows, MOVEMENT_SPEC);
    const { batchId } = await recordBatch(parsed, {
      siteId, filename: file.name, kind, uploadedBy: "admin", isDemo,
    });
    if (parsed.missingColumns.length === 0) {
      const report = await applyMovements(parsed, { siteId, actor: "admin" });
      await recordOutcomes(batchId, report);
    }
  }
  revalidatePath("/import");
  revalidatePath("/inventory");
  revalidatePath("/data-health");
}


/** What a file was said to contain, in the words the user chose it by. */
const KIND: Record<string, string> = {
  MOVEMENTS: "Stock movements",
  ITEMS: "Item list",
  STRUCTURES: "Product recipes",
  /* The demo corpus is written directly rather than uploaded, so it carries no
     rows. It is still a batch, and hiding it would break the promise that
     everything the system holds can be traced to where it came from. */
  SEED: "Made-up starter data",
};

/**
 * ⚠ A batch with no rows is not a failed batch. The starter data went in
 * without passing through a spreadsheet, so counting its rows and painting it
 * red would report a fault that did not happen.
 */
const batchMark = (accepted: number, rejected: number, total: number): string =>
  total === 0 ? "⚪" : rejected === 0 && accepted > 0 ? "🟢" : accepted > 0 ? "🟡" : "🔴";

/** Why a row didn't go in. Never a code — the user has to act on this. */
const OUTCOME: Record<string, string> = {
  DUPLICATE: "Already recorded",
  REJECTED: "Couldn't be read",
  FAILED: "Couldn't be read",
};

export default async function ImportPage() {
  const siteId = await firstSiteId();
  const batches = siteId
    ? await sql<{ id: string; filename: string; kind: string; status: string; rows_total: number; rows_accepted: number; rows_rejected: number; is_demo: boolean; uploaded_at: string }[]>`
        SELECT id, filename, kind, status, rows_total, rows_accepted, rows_rejected, is_demo, uploaded_at::text
        FROM import_batches WHERE site_id = ${siteId}::uuid ORDER BY uploaded_at DESC LIMIT 12`
    : [];
  const latest = batches[0];
  const failedRows = latest
    ? await sql<{ row_number: number; raw: Record<string, unknown>; outcome: string; errors: unknown }[]>`
        SELECT row_number, raw, outcome, errors FROM import_rows
        WHERE batch_id = ${latest.id}::uuid AND outcome <> 'ACCEPTED'
        ORDER BY row_number LIMIT 50`
    : [];

  const [anyDemo] = siteId
    ? await sql<{ d: boolean }[]>`SELECT COALESCE(bool_or(is_demo), false) AS d FROM import_batches WHERE site_id = ${siteId}::uuid`
    : [{ d: false }];

  return (
    <>
      <DemoBanner isDemo={anyDemo?.d ?? false} />
      <p className="note" style={{ marginTop: 0 }}><a href="/settings">← Settings</a></p>
      <h1>Bring in your data</h1>
      <p className="sub">
        A spreadsheet goes through exactly the same rules as anything else you enter. Nothing is
        repaired, filled in or guessed — a row we can&apos;t understand is turned away with the
        reason, and kept exactly as you sent it.
      </p>

      {/* ------------------------------------------------------------ UPLOAD */}
      <section className="section">
        <form action={handleUpload}>
          <div className="form">
            <label>
              <span>What is in this file?</span>
              <select name="kind" defaultValue="MOVEMENTS">
                <option value="MOVEMENTS">Stock movements</option>
                <option value="ITEMS">Item list</option>
                <option value="STRUCTURES">Product recipes</option>
              </select>
            </label>

            <label>
              <span>Your spreadsheet — .xlsx or .csv</span>
              <input type="file" name="file" accept=".xlsx,.xls,.csv" required />
            </label>

            <label className="check">
              <input type="checkbox" name="isDemo" defaultChecked />
              <span className="note" style={{ margin: 0 }}>
                <strong>This is made-up or test data.</strong> Leave this ticked unless the file
                holds real transactions from your factory. Anything worked out from made-up data
                stays marked as such, so a generated number can never be shown to you as a real
                saving.
              </span>
            </label>

            <div className="actions">
              <button className="btn btn-primary" type="submit">Upload and check</button>
            </div>
          </div>
        </form>

        <details className="disclose">
          <summary>What each file needs to contain</summary>
          <div className="disclose-body">
            <h3>Stock movements</h3>
            <p>
              One row per movement, with columns for a reference of your own, the item code, where
              it came from, where it went, how much, the unit, the date, and why it moved.
            </p>
            <h3>Item list</h3>
            <p>
              A code, a name, what kind of thing it is, and the unit you keep it in. You can also
              give a delivery time here, which is what lets us warn you before something runs out.
            </p>
            <h3>Product recipes</h3>
            <p>
              One row per material in a product: the product code, the material code, how much goes
              into <strong>one</strong> finished unit, the unit, and the date it started applying.
              Import your item list first — a recipe pointing at an item we don&apos;t have is
              turned away rather than skipped, because a silently missing material would make every
              answer about that product wrong.
            </p>
            <p className="note">
              To change a quantity later, add a row with a later start date. The old one stays as
              history, so an answer we gave you last month can still be explained.
            </p>
            <h3>Dates</h3>
            <p>
              Write dates as year-month-day, for example 2026-04-03. We turn away something like
              03/04/2026 rather than guessing: it could be the third of April or the fourth of
              March, and a month&apos;s error moves the transaction into a different period with a
              different exchange rate.
            </p>
          </div>
        </details>
      </section>

      {/* ------------------------------------------------------- LAST RESULT */}
      {latest && (
        <section className="section">
          <h2>What happened last time</h2>
          <div className="rows">
            <div className="row">
              <span className="rmark" aria-hidden="true">
                {batchMark(latest.rows_accepted, latest.rows_rejected, latest.rows_total)}
              </span>
              <div className="rmain">
                <div className="rtitle">
                  {latest.filename}
                  <span className="rcode">{KIND[latest.kind] ?? latest.kind}</span>
                </div>
                <div className="rsub">
                  {latest.rows_total === 0 ? (
                    <>Not brought in from a spreadsheet, so there are no rows to report on.</>
                  ) : (
                    <>
                      {latest.rows_accepted} of {latest.rows_total} {latest.rows_total === 1 ? "row" : "rows"} went in
                      {latest.rows_rejected > 0 && <>, and {latest.rows_rejected} {latest.rows_rejected === 1 ? "was" : "were"} turned away</>}
                    </>
                  )}
                  {" "}· {latest.is_demo ? "made-up data" : "your data"} · {fmtDate(latest.uploaded_at)}
                </div>
              </div>
              <div className="rtrail strong">{latest.rows_total === 0 ? "—" : latest.rows_accepted}</div>
            </div>
          </div>

          {failedRows.length > 0 && (
            <>
              <h3>The rows we couldn&apos;t take</h3>
              <p className="section-note">
                Each is kept exactly as you sent it. Fix the source and upload again — sending an
                unchanged row a second time is safe, because a movement already recorded is turned
                away rather than counted twice.
              </p>
              <div className="rows tight">
                {failedRows.map((r) => (
                  <div className="row nomark" key={r.row_number}>
                    <div className="rmain">
                      <div className="rtitle">
                        Row {r.row_number}
                        <span className="rcode">{OUTCOME[r.outcome] ?? "Couldn't be read"}</span>
                      </div>
                      <div className="rsub">{describeErrors(r.errors)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ----------------------------------------------------------- HISTORY */}
      {batches.length > 1 && (
        <section className="section">
          <h2>Everything you&apos;ve brought in</h2>
          <div className="rows tight">
            {batches.map((b) => (
              <div className="row nomark" key={b.id}>
                <div className="rmain">
                  <div className="rtitle">
                    {b.filename}
                    <span className="rcode">{KIND[b.kind] ?? b.kind}</span>
                  </div>
                  <div className="rsub">
                    {b.rows_total === 0
                      ? "Not brought in from a spreadsheet"
                      : <>{b.rows_accepted} of {b.rows_total} went in{b.rows_rejected > 0 && <>, {b.rows_rejected} turned away</>}</>}
                    {" "}· {b.is_demo ? "made-up data" : "your data"}
                  </div>
                </div>
                <div className="rtrail">{fmtDate(b.uploaded_at)}</div>
              </div>
            ))}
          </div>
          <p className="note">
            <a href="/data-health">Check whether it all adds up</a>
          </p>
        </section>
      )}
    </>
  );
}

/**
 * Why a row was turned away, in a sentence the user can act on.
 *
 * The engine records the column, what it found, what was required and what the
 * consequence would have been. All four are useful; the punctuation between
 * them is what makes it a sentence rather than a dump.
 */
function describeErrors(errors: unknown): string {
  if (!errors) return "No reason was recorded.";
  const arr = Array.isArray(errors) ? errors : [errors];
  return arr
    .map((e: Record<string, unknown>) =>
      e["detail"]
        ? String(e["detail"])
        : `${e["column"] ?? "A column"}: found "${e["found"] ?? ""}", but it needs ${e["required"] ?? "a valid value"}. ${e["consequence"] ?? ""}`.trim(),
    )
    .join(" ");
}
