/**
 * Column contracts for the MVP's four import kinds.
 *
 * Each `consequence` says what the factory loses if the column is absent — in
 * the language of the factory, not of the schema. That is the difference between
 * an importer a manager can fix and one they escalate.
 */
import type { Decimal } from "../core/decimal";
import type { ParseSpec } from "./ingest";
import { requireDate, requireDecimal, requireOneOf, requireText, type RowError } from "./validate";

export interface ItemRow {
  code: string; name: string; kind: "PROCESS_MATERIAL" | "DISCRETE_GOOD";
  stockUom: string; catchWeight: boolean; nominalUom: string | null; leadTimeDays: Decimal | null;
}

export const ITEM_SPEC: ParseSpec<ItemRow> = {
  kind: "ITEMS",
  requiredColumns: [
    { column: "code", consequence: "Without an item code nothing can be matched to stock, orders or receipts." },
    { column: "name", consequence: "The item cannot be identified by a person." },
    { column: "kind", consequence: "Process materials and discrete goods behave differently in the ledger (D-009); we do not guess which this is." },
    { column: "stock_uom", consequence: "Every balance is expressed in the stock unit. Without it a quantity has no meaning." },
  ],
  parseRow(raw, errors: RowError[]) {
    const code = requireText(raw, "code", "The row cannot be matched to anything.", errors);
    const name = requireText(raw, "name", "The item cannot be identified by a person.", errors);
    const kind = requireOneOf(raw, "kind", ["PROCESS_MATERIAL", "DISCRETE_GOOD"] as const, "Item behaviour in the ledger depends on this.", errors);
    const stockUom = requireText(raw, "stock_uom", "A quantity without a unit is not a quantity.", errors);

    const cwRaw = String(raw["catch_weight"] ?? "").trim().toUpperCase();
    const catchWeight = cwRaw === "Y" || cwRaw === "YES" || cwRaw === "TRUE" || cwRaw === "1";
    let nominalUom: string | null = null;
    if (catchWeight) {
      nominalUom = requireText(
        raw,
        "nominal_uom",
        "A catch-weight item is ordered in one unit and weighed in another. Without the ordering unit, " +
          "order quantities and weights cannot be told apart (D-048).",
        errors,
      );
    }
    // F-09: absent lead time is an EVIDENCE GAP, never a default.
    const ltRaw = String(raw["lead_time_days"] ?? "").trim();
    const leadTimeDays = ltRaw === ""
      ? null
      : requireDecimal(raw, "lead_time_days", "Mechanism 01 compares master lead time to reality; a wrong value is the opportunity it looks for.", errors, { positive: true, integer: true });

    if (!code || !name || !kind || !stockUom) return null;
    return { code, name, kind, stockUom, catchWeight, nominalUom, leadTimeDays };
  },
};

export interface MovementRow {
  naturalKey: string; itemCode: string; fromLocation: string; toLocation: string;
  nominalQty: Decimal; nominalUom: string; actualQty: Decimal | null; actualUom: string | null;
  effectiveAt: Date; sourceDocumentType: string; sourceDocumentId: string; reasonCode: string;
  costCentre: string | null;
}

export const MOVEMENT_SPEC: ParseSpec<MovementRow> = {
  kind: "MOVEMENTS",
  requiredColumns: [
    { column: "natural_key", consequence: "Without a stable identity from the source system, re-uploading a corrected file would post every movement twice — and an append-only ledger preserves the duplication rather than protecting you from it (D-001)." },
    { column: "item_code", consequence: "The movement cannot be attached to an item." },
    { column: "from_location", consequence: "A movement has a source and a destination; without both, stock is not conserved and balances cannot be trusted." },
    { column: "to_location", consequence: "As above." },
    { column: "quantity", consequence: "There is no movement without a quantity." },
    { column: "uom", consequence: "A quantity without a unit is not a quantity." },
    { column: "effective_date", consequence: "Balances are reconstructed at effective time. A missing date puts stock in the wrong period." },
    { column: "reason_code", consequence: "No orphan movements: every change to stock must be explainable (D-001)." },
  ],
  parseRow(raw, errors) {
    const naturalKey = requireText(raw, "natural_key", "Duplicate protection depends on it.", errors);
    const itemCode = requireText(raw, "item_code", "The movement cannot be attached to an item.", errors);
    const fromLocation = requireText(raw, "from_location", "Stock conservation requires both ends.", errors);
    const toLocation = requireText(raw, "to_location", "Stock conservation requires both ends.", errors);
    const nominalQty = requireDecimal(raw, "quantity", "There is no movement without a quantity.", errors, { positive: true });
    const nominalUom = requireText(raw, "uom", "A quantity without a unit is not a quantity.", errors);
    const effectiveAt = requireDate(raw, "effective_date", "Balances are reconstructed at effective time.", errors);
    const reasonCode = requireText(raw, "reason_code", "Every change to stock must be explainable.", errors);

    const aqRaw = String(raw["actual_quantity"] ?? "").trim();
    const actualQty = aqRaw === "" ? null : requireDecimal(raw, "actual_quantity", "Catch-weight items balance on actual weight (D-048).", errors, { positive: true });
    const actualUom = actualQty ? requireText(raw, "actual_uom", "The weighed quantity needs its unit.", errors) : null;

    if (!naturalKey || !itemCode || !fromLocation || !toLocation || !nominalQty || !nominalUom || !effectiveAt || !reasonCode) return null;
    return {
      naturalKey, itemCode, fromLocation, toLocation, nominalQty, nominalUom,
      actualQty, actualUom,
      effectiveAt,
      sourceDocumentType: String(raw["document_type"] ?? "IMPORT"),
      sourceDocumentId: String(raw["document_id"] ?? naturalKey),
      reasonCode,
      // D-052: NULL means "not captured", never "unassigned" or "general".
      costCentre: String(raw["cost_centre"] ?? "").trim() || null,
    };
  },
};

export interface PoLineRow {
  poNumber: string; lineNo: Decimal; supplierCode: string; itemCode: string;
  orderedQty: Decimal; uom: string; unitPrice: Decimal; currency: string;
  orderedAt: Date; promisedDate: Date | null; expedited: boolean; freightMode: string | null;
}

export const PO_SPEC: ParseSpec<PoLineRow> = {
  kind: "PURCHASE_ORDERS",
  requiredColumns: [
    { column: "po_number", consequence: "Orders cannot be grouped or traced." },
    { column: "line_no", consequence: "Two lines for the same item on one order would be indistinguishable." },
    { column: "supplier_code", consequence: "Supplier performance and lead time cannot be measured." },
    { column: "item_code", consequence: "The line cannot be attached to an item." },
    { column: "quantity", consequence: "There is no order line without a quantity." },
    { column: "unit_price", consequence: "No price means no premium and no comparison." },
    { column: "currency", consequence: "An amount without a currency cannot be FX-normalised, and in an import-dependent factory that makes every cross-period comparison wrong (D-042)." },
    { column: "ordered_date", consequence: "Lead time is measured from the order date. Without it, Mechanism 01 cannot run at all." },
  ],
  parseRow(raw, errors) {
    const poNumber = requireText(raw, "po_number", "Orders cannot be traced.", errors);
    const lineNo = requireDecimal(raw, "line_no", "Lines cannot be told apart.", errors, { positive: true, integer: true });
    const supplierCode = requireText(raw, "supplier_code", "Supplier performance cannot be measured.", errors);
    const itemCode = requireText(raw, "item_code", "The line cannot be attached to an item.", errors);
    const orderedQty = requireDecimal(raw, "quantity", "There is no order line without a quantity.", errors, { positive: true });
    const uom = requireText(raw, "uom", "A quantity without a unit is not a quantity.", errors);
    const unitPrice = requireDecimal(raw, "unit_price", "No price means no premium and no comparison.", errors);
    const currency = requireText(raw, "currency", "Without it, FX normalisation is impossible (D-042).", errors);
    const orderedAt = requireDate(raw, "ordered_date", "Lead time is measured from this date.", errors);
    const pdRaw = String(raw["promised_date"] ?? "").trim();
    const promisedDate = pdRaw === "" ? null : requireDate(raw, "promised_date", "Delay is promised versus actual.", errors);

    const exp = String(raw["expedited"] ?? "").trim().toUpperCase();
    const expedited = exp === "Y" || exp === "YES" || exp === "TRUE" || exp === "1";

    if (!poNumber || !lineNo || !supplierCode || !itemCode || !orderedQty || !uom || !unitPrice || !currency || !orderedAt) return null;
    return {
      poNumber, lineNo, supplierCode, itemCode, orderedQty, uom, unitPrice, currency,
      orderedAt, promisedDate, expedited,
      freightMode: String(raw["freight_mode"] ?? "").trim() || null,
    };
  },
};

export interface ReceiptRow {
  naturalKey: string; poNumber: string; lineNo: Decimal; sequence: Decimal;
  receivedAt: Date; nominalQty: Decimal; nominalUom: string; actualQty: Decimal | null; actualUom: string | null;
}

export const RECEIPT_SPEC: ParseSpec<ReceiptRow> = {
  kind: "RECEIPTS",
  requiredColumns: [
    { column: "natural_key", consequence: "Re-uploading would post every receipt twice." },
    { column: "po_number", consequence: "The receipt cannot be matched to an order, so lead time cannot be measured." },
    { column: "line_no", consequence: "As above." },
    { column: "sequence", consequence: "Partial receipts are separate events. Without a sequence, a three-instalment delivery collapses into one and the position path — and therefore every backtest — is wrong (F-41)." },
    { column: "received_date", consequence: "Lead time is order date to receipt date. This is the other end of it." },
    { column: "quantity", consequence: "There is no receipt without a quantity." },
  ],
  parseRow(raw, errors) {
    const naturalKey = requireText(raw, "natural_key", "Duplicate protection depends on it.", errors);
    const poNumber = requireText(raw, "po_number", "The receipt cannot be matched to an order.", errors);
    const lineNo = requireDecimal(raw, "line_no", "The receipt cannot be matched to a line.", errors, { positive: true, integer: true });
    const sequence = requireDecimal(raw, "sequence", "Partial receipts must remain separate events (F-41).", errors, { positive: true, integer: true });
    const receivedAt = requireDate(raw, "received_date", "This is the far end of the lead-time measurement.", errors);
    const nominalQty = requireDecimal(raw, "quantity", "There is no receipt without a quantity.", errors, { positive: true });
    const nominalUom = String(raw["uom"] ?? "").trim();

    const aqRaw = String(raw["actual_quantity"] ?? "").trim();
    const actualQty = aqRaw === "" ? null : requireDecimal(raw, "actual_quantity", "Catch-weight receipts are reconciled on weight (D-048).", errors, { positive: true });

    if (!naturalKey || !poNumber || !lineNo || !sequence || !receivedAt || !nominalQty) return null;
    return {
      naturalKey, poNumber, lineNo, sequence, receivedAt, nominalQty,
      nominalUom: nominalUom || "EA",
      actualQty,
      actualUom: actualQty ? String(raw["actual_uom"] ?? "kg") : null,
    };
  },
};

/* ========================================================================== */
/* BLOCK 9 — product structure (recipe). D-054.                              */
/* ========================================================================== */

export interface StructureRow {
  parentCode: string;
  componentCode: string;
  quantityPer: Decimal;
  uom: string;
  effectiveFrom: Date;
}

/**
 * The recipe import.
 *
 * ⚠ The column list IS the scope boundary (D-054). There is deliberately no
 * scrap, yield, operation, routing, work-centre or cost column, and adding one
 * is a scope change requiring a decision rather than a spreadsheet column.
 *
 * `quantity_per` is per ONE unit of the parent, because per-batch quantities
 * require a batch size, and a batch size the factory has not stated is a factory
 * fact we would be inventing (F-49 records the related scrap question).
 */
export const STRUCTURE_SPEC: ParseSpec<StructureRow> = {
  kind: "STRUCTURES",
  requiredColumns: [
    { column: "parent_code", consequence: "Without the product being made, the line belongs to no recipe." },
    { column: "component_code", consequence: "Without the material consumed, there is nothing to check stock for." },
    { column: "quantity_per", consequence: "Without a quantity per unit, we cannot work out how much a production run needs — the whole answer depends on it." },
    { column: "uom", consequence: "A quantity without a unit is not a quantity. We convert per item and never assume a unit." },
    { column: "effective_from", consequence: "A recipe that changed is history, not a correction. Without the date, an old answer cannot be explained." },
  ],
  parseRow(raw, errors) {
    const parentCode = requireText(raw, "parent_code", "The line belongs to no recipe.", errors);
    const componentCode = requireText(raw, "component_code", "There is nothing to check stock for.", errors);
    const quantityPer = requireDecimal(raw, "quantity_per", "How much a production run needs depends entirely on this.", errors, { positive: true });
    const uom = requireText(raw, "uom", "A quantity without a unit is not a quantity.", errors);
    const effectiveFrom = requireDate(raw, "effective_from", "An old answer cannot be explained without knowing which recipe version produced it.", errors);

    if (!parentCode || !componentCode || !quantityPer || !uom || !effectiveFrom) return null;

    /* A component that is its own parent is a recipe that consumes itself. It
       would explode forever, and no factory means it — so it is rejected at the
       door with a reason a person can act on, rather than producing a confusing
       answer later. */
    if (parentCode.trim().toUpperCase() === componentCode.trim().toUpperCase()) {
      errors.push({
        column: "component_code",
        severity: "REJECT",
        found: componentCode,
        required: "a different item from the parent",
        consequence: `"${parentCode}" is listed as a material inside its own recipe. A product cannot be made from itself.`,
      });
      return null;
    }

    return { parentCode, componentCode, quantityPer, uom, effectiveFrom };
  },
};
