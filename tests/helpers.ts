import { sql, db } from "../lib/db/client";
import { items, locations, sites, suppliers, users } from "../lib/db/schema";

export async function resetDb() {
  await sql`
    TRUNCATE TABLE
      audit_events, opportunity_evidence, detection_runs, import_rows, import_batches, cost_references, fx_rates, financial_rates,
      outcomes, baselines, decisions, gate_results, contradictions, signature_dimensions,
      finding_links, evidence_gaps, exposures, observed_costs, opportunities,
      expedite_events, port_milestones, eta_forecasts, receipts, shipments,
      po_line_changes, po_lines, purchase_orders, supplier_item_terms,
      balances, movements, uom_conversions, items, locations, suppliers, users, sites
    RESTART IDENTITY CASCADE`;
}

export interface Ctx {
  siteId: string;
  loc: Record<string, string>;
}

/** A minimal single-site world. Nothing here is a factory fact — it is a fixture. */
export async function seedWorld(): Promise<Ctx> {
  const [site] = await db.insert(sites).values({ code: "MAIN", name: "Main Plant", reportingCurrency: "EGP" }).returning();
  const siteId = site!.id;

  const defs: [string, string, (typeof locations.$inferInsert)["kind"], boolean][] = [
    ["WH1", "Main Warehouse", "STOCK", true],
    ["QH", "Quality Hold", "QUALITY_HOLD", true],
    ["SUP", "Supplier", "SUPPLIER", false],
    ["PROD", "Production", "PRODUCTION", false],
    ["SCRAP", "Scrap", "SCRAP", false],
    ["ADJ", "Adjustment", "ADJUSTMENT", false],
    ["TRANSIT", "In Transit", "IN_TRANSIT", false],
    ["OPEN", "Opening Balance", "OPENING_BALANCE", false],
  ];
  const loc: Record<string, string> = {};
  for (const [code, name, kind, counts] of defs) {
    const [row] = await db.insert(locations).values({ siteId, code, name, kind, countsAsOnHand: counts }).returning();
    loc[code] = row!.id;
  }
  return { siteId, loc };
}

export async function makeItem(
  siteId: string,
  over: Partial<typeof items.$inferInsert> = {},
): Promise<string> {
  const [row] = await db
    .insert(items)
    .values({
      siteId,
      code: over.code ?? `ITM-${Math.random().toString(36).slice(2, 8)}`,
      name: over.name ?? "Test material",
      kind: over.kind ?? "PROCESS_MATERIAL",
      stockUom: over.stockUom ?? "kg",
      ...over,
    })
    .returning();
  return row!.id;
}

export async function makeSupplier(name = "Supplier A"): Promise<string> {
  const [row] = await db
    .insert(suppliers)
    .values({ code: `SUP-${Math.random().toString(36).slice(2, 8)}`, name, country: "CN" })
    .returning();
  return row!.id;
}

export async function makeUser(username: string, roles: (typeof users.$inferInsert)["roles"]): Promise<string> {
  const [row] = await db.insert(users).values({ username, displayName: username, roles }).returning();
  return row!.id;
}

export const d = (iso: string) => new Date(iso);
