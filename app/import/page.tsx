/**
 * IMPORT — the front door.
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
      <h1>Import factory data</h1>
      <p className="sub">
        A spreadsheet enters through the same ledger rules as everything else. Nothing is repaired,
        defaulted or guessed — a row the system cannot understand is refused with the reason, and the
        original is kept exactly as you sent it.
      </p>

      <div className="card">
        <form action={handleUpload}>
          <div style={{ display: "grid", gap: 14, maxWidth: 560 }}>
            <label>
              <div className="note" style={{ margin: "0 0 4px" }}>What is in this file?</div>
              <select name="kind" defaultValue="MOVEMENTS" style={selectStyle}>
                <option value="MOVEMENTS">Stock movements</option>
                <option value="ITEMS">Item master</option>
                <option value="STRUCTURES">Product recipes</option>
              </select>
            </label>

            <label>
              <div className="note" style={{ margin: "0 0 4px" }}>Spreadsheet (.xlsx or .csv)</div>
              <input type="file" name="file" accept=".xlsx,.xls,.csv" required style={{ fontSize: 14 }} />
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input type="checkbox" name="isDemo" defaultChecked style={{ marginTop: 3 }} />
              <span className="note" style={{ margin: 0 }}>
                <strong>This is demo or test data.</strong> Leave ticked unless the file contains real
                factory transactions. Everything derived from a demo batch stays marked as demo, so a
                generated number can never be presented as a real factory saving.
              </span>
            </label>

            <div>
              <button type="submit" style={buttonStyle}>Upload and validate</button>
            </div>
          </div>
        </form>

        <details style={{ marginTop: 18 }}>
          <summary className="note" style={{ cursor: "pointer" }}>Required columns</summary>
          <div className="note" style={{ marginTop: 8 }}>
            <p style={{ margin: "6px 0" }}>
              <strong>Stock movements:</strong> <code>natural_key · item_code · from_location ·
              to_location · quantity · uom · effective_date · reason_code</code>. Optional:{" "}
              <code>actual_quantity · actual_uom · document_type · document_id · cost_centre</code>.
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Item master:</strong> <code>code · name · kind · stock_uom</code>. Optional:{" "}
              <code>catch_weight · nominal_uom · lead_time_days</code>.
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Product recipes:</strong> <code>parent_code · component_code · quantity_per ·
              uom · effective_from</code>. One row per material in a product, and{" "}
              <code>quantity_per</code> is for <strong>one</strong> finished unit. Import your items
              first — a recipe line pointing at an item that does not exist is refused rather than
              skipped, because a silently missing material would make every answer wrong.
            </p>
            <p style={{ margin: "6px 0" }}>
              To change a quantity, add a row with a later <code>effective_from</code>. The old one
              stays as history, so an answer given last month can still be explained.
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Dates must be ISO — <code>YYYY-MM-DD</code>.</strong> A date like{" "}
              <code>03/04/2026</code> is refused rather than guessed: it could be either day/month or
              month/day, and a month's error changes which period the transaction falls in and the FX
              rate applied to it.
            </p>
          </div>
        </details>
      </div>

      {latest && (
        <>
          <h2>Last import</h2>
          <div className="card">
            <dl className="kv">
              <dt>Batch</dt>
              <dd><code>{latest.id}</code></dd>
              <dt>File</dt>
              <dd>{latest.filename} · {latest.kind}</dd>
              <dt>Origin</dt>
              <dd>{latest.is_demo ? <span className="badge warn">DEMO</span> : <span className="badge ok">factory</span>}</dd>
              <dt>Result</dt>
              <dd>
                <span className={`badge ${latest.status === "ACCEPTED" ? "ok" : latest.status === "PARTIAL" ? "warn" : "bad"}`}>
                  {latest.status}
                </span>
              </dd>
              <dt>Rows accepted</dt>
              <dd><strong>{latest.rows_accepted}</strong> of {latest.rows_total}</dd>
              <dt>Rows rejected</dt>
              <dd>{latest.rows_rejected}</dd>
            </dl>
          </div>

          {failedRows.length > 0 && (
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Rows that did not enter the ledger</h3>
              <p className="note">
                Each is preserved exactly as submitted. Fix the source and upload again — re-uploading
                an unchanged row is safe, because a movement already recorded is refused rather than
                posted twice.
              </p>
              <div className="scroll">
                <table>
                  <thead>
                    <tr><th>Row</th><th>Outcome</th><th>Why</th><th>As submitted</th></tr>
                  </thead>
                  <tbody>
                    {failedRows.map((r) => (
                      <tr key={r.row_number}>
                        <td>{r.row_number}</td>
                        <td>
                          <span className={`badge ${r.outcome === "DUPLICATE" ? "warn" : "bad"}`}>{r.outcome}</span>
                        </td>
                        <td className="note" style={{ margin: 0 }}>{describeErrors(r.errors)}</td>
                        <td className="note" style={{ margin: 0, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
                          {JSON.stringify(r.raw).slice(0, 220)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <h2>Import history</h2>
      <div className="card scroll">
        <table>
          <thead>
            <tr><th>When</th><th>File</th><th>Kind</th><th>Status</th><th className="num">Accepted</th><th className="num">Rejected</th><th>Origin</th></tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td>{b.uploaded_at.slice(0, 16).replace("T", " ")}</td>
                <td>{b.filename}</td>
                <td>{b.kind}</td>
                <td><span className={`badge ${b.status === "ACCEPTED" ? "ok" : b.status === "PARTIAL" ? "warn" : "bad"}`}>{b.status}</span></td>
                <td className="num">{b.rows_accepted}</td>
                <td className="num">{b.rows_rejected}</td>
                <td>{b.is_demo ? <span className="badge warn">DEMO</span> : <span className="badge ok">factory</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function describeErrors(errors: unknown): string {
  if (!errors) return "—";
  const arr = Array.isArray(errors) ? errors : [errors];
  return arr
    .map((e: Record<string, unknown>) =>
      e["detail"] ? String(e["detail"]) : `${e["column"] ?? ""}: found "${e["found"] ?? ""}", required ${e["required"] ?? ""}. ${e["consequence"] ?? ""}`,
    )
    .join(" ");
}

const selectStyle = {
  padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)",
  background: "var(--surface)", color: "var(--ink)", fontSize: 14, width: "100%",
} as const;

const buttonStyle = {
  padding: "9px 18px", borderRadius: 8, border: "1px solid var(--accent)",
  background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
} as const;
