/**
 * Data model — Phase 2. Every structure maps back to a locked domain requirement,
 * and the mapping is stated on each table. Nothing exists because it seemed useful.
 *
 * Numeric discipline (D-047): every money and quantity column is `numeric`, never
 * `double precision`. The driver returns numeric as a string and it is never
 * parsed to a JS number.
 */
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ========================================================================== */
/* F1 — tenancy and scope. D-004: site-scoped even at one site.               */
/* ========================================================================== */

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  /** D-042: the single reporting currency. Multi-currency reporting is out. */
  reportingCurrency: text("reporting_currency").notNull(),
});

/* ========================================================================== */
/* F5 — time. Every event carries effective AND recorded time.               */
/* Represented as two columns on each event table rather than a shared type,  */
/* so that neither can be omitted by forgetting to extend something.          */
/* ========================================================================== */

/* ========================================================================== */
/* C3 / F3 / F6 / F7 / D-009 / D-048 — items.                                */
/* ========================================================================== */

export const itemKind = pgEnum("item_kind", ["PROCESS_MATERIAL", "DISCRETE_GOOD"]);
export const trackingPolicy = pgEnum("tracking_policy", ["NONE", "LOT", "SERIAL"]);

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    /** D-009: item type carries behaviour; it is not a label. */
    kind: itemKind("kind").notNull(),
    /** F6: the stock UoM. All balances are expressed in it. */
    stockUom: text("stock_uom").notNull(),
    /** D-009: integer-only is a validation rule, not a separate code path. */
    integerOnly: boolean("integer_only").notNull().default(false),
    trackingPolicy: trackingPolicy("tracking_policy").notNull().default("NONE"),
    /**
     * D-048 — catch-weight. When true, movements carry BOTH a nominal quantity
     * (units transacted) and an actual quantity (weight). When false, actual_* is
     * NULL, and NULL means "not a catch-weight item" — never "not yet weighed".
     */
    catchWeight: boolean("catch_weight").notNull().default(false),
    /** The UoM the supplier ships and invoices in, where catch-weight. */
    nominalUom: text("nominal_uom"),
    /** F-09: master-data lead time. The MVP mechanism compares this to reality. */
    leadTimeDays: integer("lead_time_days"),
    /** F-34 — only where the factory records it. NULL is not "no shelf life". */
    shelfLifeDays: integer("shelf_life_days"),
    active: boolean("active").notNull().default(true),
    siteId: uuid("site_id").notNull().references(() => sites.id),
  },
  (t) => ({ uq: uniqueIndex("items_site_code_uq").on(t.siteId, t.code) }),
);

/** F6: conversions are PER ITEM and versioned, never global constants. */
export const uomConversions = pgTable(
  "uom_conversions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    itemId: uuid("item_id").notNull().references(() => items.id),
    fromUom: text("from_uom").notNull(),
    toUom: text("to_uom").notNull(),
    factor: numeric("factor").notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  },
  (t) => ({ uq: uniqueIndex("uom_conv_uq").on(t.itemId, t.fromUom, t.toUom, t.effectiveFrom) }),
);

/* ========================================================================== */
/* C2 / F2 — locations, including the virtual counterparties.                */
/* ========================================================================== */

export const locationKind = pgEnum("location_kind", [
  "STOCK",
  "QUALITY_HOLD",
  "SUPPLIER",
  "CUSTOMER",
  "PRODUCTION",
  "SCRAP",
  "ADJUSTMENT",
  "IN_TRANSIT",
  /**
   * D-001 as amended. Counterparty for stock existing at go-live or migration.
   * NEVER used by an operational event — seeding through ADJUSTMENT would poison
   * count accuracy, which is the trust metric for the whole system, on day one.
   */
  "OPENING_BALANCE",
]);

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id").notNull().references(() => sites.id),
    code: text("code").notNull(),
    name: text("name").notNull(),
    kind: locationKind("kind").notNull(),
    parentId: uuid("parent_id"),
    /** F3: quality-hold stock is excluded from Available BY THE MODEL, not a UI filter. */
    countsAsOnHand: boolean("counts_as_on_hand").notNull(),
  },
  (t) => ({ uq: uniqueIndex("locations_site_code_uq").on(t.siteId, t.code) }),
);

/* ========================================================================== */
/* F2 / D-001 — THE LEDGER. The core of the entire product.                  */
/* ========================================================================== */

export const movements = pgTable(
  "movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id").notNull().references(() => sites.id),
    itemId: uuid("item_id").notNull().references(() => items.id),

    /**
     * Double-entry in one row: quantity leaves `fromLocation` and enters
     * `toLocation`. Stock is conserved BY CONSTRUCTION — there is no way to
     * express a movement that debits without crediting.
     */
    fromLocationId: uuid("from_location_id").notNull().references(() => locations.id),
    toLocationId: uuid("to_location_id").notNull().references(() => locations.id),

    /** D-048: nominal — what was ordered, counted, transacted. */
    nominalQty: numeric("nominal_qty").notNull(),
    nominalUom: text("nominal_uom").notNull(),
    /**
     * D-048: actual — what was physically weighed. NULL means the item is not
     * catch-weight. A catch-weight movement awaiting weighing DOES NOT POST —
     * it is never posted with an estimated weight.
     */
    actualQty: numeric("actual_qty"),
    actualUom: text("actual_uom"),

    lotCode: text("lot_code"),
    serialCode: text("serial_code"),

    /** F5: when it happened in the factory. All reporting defaults to this. */
    effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),
    /** F5: when the system learned about it. */
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),

    /** D-001: no orphan movements. */
    sourceDocumentType: text("source_document_type").notNull(),
    sourceDocumentId: text("source_document_id").notNull(),
    reasonCode: text("reason_code").notNull(),
    actor: text("actor").notNull(),

    /**
     * D-001 as amended. Identity of the originating record. A second movement
     * bearing a key already recorded is REFUSED — not accepted and corrected.
     * Enforced by the unique index below, i.e. by the database, not by discipline.
     */
    sourceNaturalKey: text("source_natural_key"),

    /** D-052: NULL means "not captured", never "unassigned" or "general". */
    costCentre: text("cost_centre"),

    /**
     * D-028 / F10 capture contract. Preserved as applicable to the event and
     * NEVER invented where absent — a domestic single-currency transaction has
     * no FX dimension, and an empty FX field records nothing while implying
     * something. Shape: { amount, currency, fxRate, fxRateDate, unitBasis, periodBoundary }
     */
    financialDimensions: jsonb("financial_dimensions"),

    /** D-001 as amended: a reversal asserts the record was wrong. */
    reversesMovementId: uuid("reverses_movement_id"),
  },
  (t) => ({
    /** The duplicate-ingestion guard. Partial: NULL keys do not collide. */
    naturalKeyUq: uniqueIndex("movements_natural_key_uq").on(t.siteId, t.sourceNaturalKey),
    /** D-039's replay and D-001's point-in-time reconstruction both scan this. */
    replayIdx: index("movements_item_effective_idx").on(t.itemId, t.effectiveAt),
    docIdx: index("movements_source_doc_idx").on(t.sourceDocumentType, t.sourceDocumentId),
  }),
);

/**
 * D-049: projected synchronously, in the same transaction as the movement.
 * NEVER authored. Always reconcilable to the ledger by independent recomputation
 * — at any historical instant, not only at the present.
 */
export const balances = pgTable(
  "balances",
  {
    itemId: uuid("item_id").notNull().references(() => items.id),
    locationId: uuid("location_id").notNull().references(() => locations.id),
    /** Catch-weight items balance on ACTUAL; others on nominal (D-048). */
    qty: numeric("qty").notNull(),
    uom: text("uom").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: uniqueIndex("balances_pk").on(t.itemId, t.locationId) }),
);

/* ========================================================================== */
/* C4 — suppliers and terms.                                                 */
/* ========================================================================== */

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    /**
     * Part D of the Block 4 freeze: supplier location is PRODUCT SCOPE, read by
     * no locked mechanism. Present because the order-journey workflow displays
     * it; nothing in the saving engine reads it.
     */
    country: text("country"),
    city: text("city"),
    active: boolean("active").notNull().default(true),
  },
);

export const supplierItemTerms = pgTable(
  "supplier_item_terms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
    itemId: uuid("item_id").notNull().references(() => items.id),
    /** F-09: the supplier's quoted lead time, distinct from item master. */
    leadTimeDays: integer("lead_time_days"),
    /** F-44: order multiple is distinct from MOQ. Read by Mechanism 03 only. */
    moq: numeric("moq"),
    orderMultiple: numeric("order_multiple"),
    /** F-15 / F-16: comparability gates for Mechanism 02. Not read by the MVP. */
    incoterm: text("incoterm"),
    paymentTermsDays: integer("payment_terms_days"),
    currency: text("currency"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  },
  (t) => ({ idx: index("sit_supplier_item_idx").on(t.supplierId, t.itemId) }),
);

/* ========================================================================== */
/* C7 — purchase orders. U-12: post-send changes are HISTORY, not mutations, */
/* because supplier reliability metrics are meaningless otherwise.            */
/* ========================================================================== */

export const poStatus = pgEnum("po_status", ["DRAFT", "APPROVED", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"]);

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  number: text("number").notNull(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  status: poStatus("status").notNull().default("DRAFT"),
  orderedAt: timestamp("ordered_at", { withTimezone: true }),
  currency: text("currency").notNull(),
  incoterm: text("incoterm"),
  paymentTermsDays: integer("payment_terms_days"),
  sourceNaturalKey: text("source_natural_key"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const poLines = pgTable(
  "po_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    poId: uuid("po_id").notNull().references(() => purchaseOrders.id),
    lineNo: integer("line_no").notNull(),
    itemId: uuid("item_id").notNull().references(() => items.id),
    orderedQty: numeric("ordered_qty").notNull(),
    uom: text("uom").notNull(),
    unitPrice: numeric("unit_price").notNull(),
    currency: text("currency").notNull(),
    /** The date the supplier committed to. Distinct from any later ETA forecast. */
    promisedDate: date("promised_date"),
    /**
     * F-06 — how an expedite is recognised. The MVP accepts any of the three
     * shapes the factory may use (flag, mode field, reason code) as configuration.
     * NULL means not expedited; it never means unknown — see expediteEvents.
     */
    expedited: boolean("expedited").notNull().default(false),
    freightMode: text("freight_mode"),
  },
  (t) => ({ uq: uniqueIndex("po_lines_uq").on(t.poId, t.lineNo) }),
);

/** U-12: change history. Never a mutation of the line above. */
export const poLineChanges = pgTable("po_line_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  poLineId: uuid("po_line_id").notNull().references(() => poLines.id),
  field: text("field").notNull(),
  fromValue: text("from_value"),
  toValue: text("to_value"),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull(),
  actor: text("actor").notNull(),
  reason: text("reason"),
});

/* ========================================================================== */
/* Receipts — F-41. Partial receipts are SEPARATE EVENTS.                    */
/* Without this the position path is computed from PO quantity and the        */
/* detector produces fictional findings.                                     */
/* ========================================================================== */

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    poLineId: uuid("po_line_id").notNull().references(() => poLines.id),
    /** Which instalment this is. 1..n against one line. */
    sequence: integer("sequence").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    /** D-048: a receipt can be complete on nominal and short on actual. */
    nominalQty: numeric("nominal_qty").notNull(),
    nominalUom: text("nominal_uom").notNull(),
    actualQty: numeric("actual_qty"),
    actualUom: text("actual_uom"),
    /** The ledger movement this receipt produced. */
    movementId: uuid("movement_id").references(() => movements.id),
    shipmentId: uuid("shipment_id"),
    sourceNaturalKey: text("source_natural_key"),
  },
  (t) => ({ uq: uniqueIndex("receipts_uq").on(t.poLineId, t.sequence) }),
);

/**
 * Shipment — a DOMAIN requirement narrowly: the unit freight attaches to (F-01).
 * Current location and port milestones are carried for the order-journey
 * workflow; the saving engine reads only the freight attribution.
 */
export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  mode: text("mode"),
  departedAt: timestamp("departed_at", { withTimezone: true }),
  arrivedAt: timestamp("arrived_at", { withTimezone: true }),
  /**
   * F-01: separable freight, attributable to PO lines. Without it the mechanism
   * yields event counts and no currency — and that is a passing MVP.
   */
  freightAmount: numeric("freight_amount"),
  freightCurrency: text("freight_currency"),
  freightEffectiveOn: date("freight_effective_on"),
  /** PRODUCT SCOPE, read by no mechanism. Displayed in the journey view only. */
  currentLocation: text("current_location"),
  status: text("status"),
});

/** ETA is a FORECAST and must never silently become an actual (D-002, Phase 5). */
export const etaForecasts = pgTable("eta_forecasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id").notNull().references(() => shipments.id),
  etaDate: date("eta_date").notNull(),
  /** Always FORECAST. Enforced in code; recorded here so the claim is auditable. */
  basis: text("basis").notNull().default("FORECAST"),
  source: text("source").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
});

export const portMilestones = pgTable("port_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id").notNull().references(() => shipments.id),
  milestone: text("milestone").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  location: text("location"),
});

/* ========================================================================== */
/* Mechanism 01 — expedite events. D-018: root cause captured IN THE WORKFLOW */
/* at the moment of the event, not reconstructed later.                       */
/* ========================================================================== */

export const rootCause = pgEnum("root_cause", [
  "SUPPLIER_DELAY",
  "INCORRECT_LEAD_TIME",
  "LATE_PO_RELEASE",
  "UNEXPECTED_DEMAND",
  "PRODUCTION_CHANGE",
  "STOCK_POLICY_ISSUE",
  "MATERIAL_MASTER_ISSUE",
  "LOGISTICS_CUSTOMS_ISSUE",
  /** Q-01 recommended adding this — different owner, different action. */
  "QUALITY_REJECTION",
  "OTHER",
]);

export const expediteEvents = pgTable("expedite_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  poLineId: uuid("po_line_id").notNull().references(() => poLines.id),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  /** NULL = not classified. Classification coverage is a measured input to evidence (rule 15). */
  rootCause: rootCause("root_cause"),
  rootCauseNote: text("root_cause_note"),
  classifiedBy: text("classified_by"),
  /** The premium actually paid, captured raw per D-028. */
  premiumAmount: numeric("premium_amount"),
  premiumCurrency: text("premium_currency"),
  premiumEffectiveOn: date("premium_effective_on"),
  /** F-03: the baseline this premium is measured against, and its tier. */
  baselineAmount: numeric("baseline_amount"),
  baselineSource: text("baseline_source"),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  sourceNaturalKey: text("source_natural_key"),
});

/* ========================================================================== */
/* F9 — THE FINDING MODEL. D-025 as amended.                                 */
/*                                                                            */
/* Separate TABLES, not a status column. As a status, one forgotten filter or  */
/* one widened join turns an exposure into a saving. As distinct classes it is */
/* STRUCTURALLY IMPOSSIBLE. The guarantee lives in the model.                  */
/* ========================================================================== */

export const opportunityLifecycle = pgEnum("opportunity_lifecycle", [
  "POTENTIAL",
  "APPROVED",
  "IN_PROGRESS",
  "REALIZED",
  "REJECTED",
  "EXPIRED",
]);

/** D-026: evidence strength is an ATTRIBUTE, never a lifecycle state. */
export const evidenceStrength = pgEnum("evidence_strength", ["EARLY", "STRONG"]);

/** D-019's ladder. Currency is permitted only at ANNUALIZATION_ELIGIBLE or beyond. */
export const evidenceLadder = pgEnum("evidence_ladder", [
  "OPPORTUNITY_DETECTED",
  "ANNUALIZATION_ELIGIBLE",
  "VERIFIED_REALIZATION",
]);

/**
 * A detection run. Recorded so a finding can be traced to the exact execution
 * that produced it, and so "same inputs, same result, forever" is checkable
 * rather than asserted. Nothing here is a new domain concept — it is the
 * reproducible stored snapshot U-16 already requires, generalised.
 */
export const detectionRuns = pgTable("detection_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  /** The effective instant the run reasoned about. NOT the wall clock. */
  asOf: timestamp("as_of", { withTimezone: true }).notNull(),
  executedAt: timestamp("executed_at", { withTimezone: true }).notNull().defaultNow(),
  mechanism: text("mechanism").notNull(),
  /** Bible §47 / rule 16 — carried down to every finding the run produces. */
  isDemo: boolean("is_demo").notNull().default(false),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  mechanism: text("mechanism").notNull(),

  /* --- Added by Block 6, to make findings durable rather than transient. ----
     None of these is a new domain concept:
       runId          — U-16's reproducible stored snapshot
       naturalKey     — the finding's identity across runs (mechanism + subject)
       supersedesId   — D-025 principle 4: history is superseded, never mutated
       supersededAt   — the current view is "where superseded_at is null", exactly
                        as balances are a projection of the ledger (D-001)
       isDemo         — Bible §47, carried from the run
     A re-run NEVER updates a finding. It writes a new row and supersedes the
     old one, so a figure once shown can always be reconstructed. */
  runId: uuid("run_id").references(() => detectionRuns.id),
  naturalKey: text("natural_key"),
  supersedesId: uuid("supersedes_id"),
  supersededAt: timestamp("superseded_at", { withTimezone: true }),
  isDemo: boolean("is_demo").notNull().default(false),
  subjectItemId: uuid("subject_item_id").references(() => items.id),
  subjectSupplierId: uuid("subject_supplier_id").references(() => suppliers.id),
  title: text("title").notNull(),
  /** D-027: specific enough to be TESTED, not "improve planning". */
  statedIntervention: text("stated_intervention").notNull(),
  counterfactual: text("counterfactual").notNull(),
  rootCause: rootCause("root_cause"),

  lifecycle: opportunityLifecycle("lifecycle").notNull().default("POTENTIAL"),
  evidenceStrength: evidenceStrength("evidence_strength"),
  ladder: evidenceLadder("ladder").notNull().default("OPPORTUNITY_DETECTED"),

  /** D-011: separate one-time and recurring. NEVER summed together. */
  recurringImpact: jsonb("recurring_impact"),
  oneTimeImpact: jsonb("one_time_impact"),
  /** D-014 rule 6: certain incremental cost, netted. */
  incrementalCost: jsonb("incremental_cost"),
  /** The net, carrying its own incompleteness per D-041. */
  netImpact: jsonb("net_impact"),
  /**
   * D-041: where an exposure exists and cannot be valued, the NUMBER ITSELF says
   * it excludes an unvalued risk — and that the exclusion is optimistic.
   */
  netExcludesUnvaluedRisk: boolean("net_excludes_unvalued_risk").notNull().default(false),

  /** D-011 as amended: three owner fields, not one. NULL = unowned and VISIBLY so. */
  findingOwner: text("finding_owner"),
  actionOwner: text("action_owner"),
  dataOwner: text("data_owner"),

  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
  effectiveAsOf: timestamp("effective_as_of", { withTimezone: true }).notNull(),
});

/** D-025: historical ACTUAL financial fact. No lifecycle. No mitigation. */
export const observedCosts = pgTable("observed_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  mechanism: text("mechanism").notNull(),
  subjectItemId: uuid("subject_item_id").references(() => items.id),
  title: text("title").notNull(),
  amount: jsonb("amount").notNull(),
  whyNotAvoidable: text("why_not_avoidable").notNull(),
  effectiveAsOf: timestamp("effective_as_of", { withTimezone: true }).notNull(),
  /** D-025 principle 5: a materialised exposure is PRESERVED and creates a link. */
  materialisedFromExposureId: uuid("materialised_from_exposure_id"),
});

/**
 * D-025: forward-looking FORECAST / ESTIMATED condition. No lifecycle.
 * NEVER approved, NEVER realized. Carries NO intervention signature (D-031 rule 3).
 * NEVER valued — no probability, severity or monetary figure anywhere.
 */
export const exposures = pgTable("exposures", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  kind: text("kind").notNull(),
  subjectItemId: uuid("subject_item_id").references(() => items.id),
  subjectSupplierId: uuid("subject_supplier_id").references(() => suppliers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  /** D-025 principle 4: a direction change SUPERSEDES. History is never mutated. */
  supersedesExposureId: uuid("supersedes_exposure_id"),
});

/**
 * D-025 W-46: OUTSIDE the Finding hierarchy entirely. A statement about the
 * completeness of OUR data, never about the factory's money.
 * May carry observed spend as an ACTUAL fact — and that spend is not itself an
 * Evidence Gap value.
 */
export const evidenceGaps = pgTable("evidence_gaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  runId: uuid("run_id").references(() => detectionRuns.id),
  naturalKey: text("natural_key"),
  supersededAt: timestamp("superseded_at", { withTimezone: true }),
  isDemo: boolean("is_demo").notNull().default(false),
  missingEvidence: text("missing_evidence").notNull(),
  factoryDataRef: text("factory_data_ref"),
  blocks: text("blocks").notNull(),
  /** Capture requests are prioritised by OBSERVED SPEND — a fact we can see. */
  observedSpend: jsonb("observed_spend"),
  dataOwner: text("data_owner"),
  raisedAt: timestamp("raised_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Which recorded ledger movements and documents a finding rests on.
 *
 * Capability 11: every figure traces to the movements and documents that
 * produced it. Without this the trace exists only in the envelope's `inputs`
 * array, which is not queryable — you could not ask "what did we claim about
 * this receipt?"
 */
export const opportunityEvidence = pgTable(
  "opportunity_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
    /** 'movement' | 'expedite_event' | 'receipt' | 'po_line' | 'fx_rate' | 'financial_rate' */
    kind: text("kind").notNull(),
    ref: text("ref").notNull(),
    basis: text("basis").notNull(),
    asOf: timestamp("as_of", { withTimezone: true }).notNull(),
  },
  (t) => ({ idx: index("opp_evidence_idx").on(t.opportunityId) }),
);

/** D-031 as amended twice. Three DISTINCT types. None valued, none netted. */
export const linkType = pgEnum("link_type", ["CREATES", "DEEPENS", "MITIGATES"]);

export const findingLinks = pgTable("finding_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
  exposureId: uuid("exposure_id").notNull().references(() => exposures.id),
  type: linkType("type").notNull(),
  /** Qualitative only. Quantifying "partial" needs a severity measure — forbidden. */
  note: text("note").notNull(),
  /** D-031 W-47: the exposure record is not created until the intervention is actioned. */
  actionedAt: timestamp("actioned_at", { withTimezone: true }),
});

/* ========================================================================== */
/* D-029 — intervention signature. An Opportunity without one CANNOT be       */
/* presented. Exposure carries none.                                          */
/* ========================================================================== */

/**
 * W-31 asked whether this vocabulary is locked or extensible. Part 2.3 answered
 * it by demonstration — Mechanism 03 added seven dimensions — so it is extensible.
 */
export const signatureDimensions = pgTable("signature_dimensions", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
  dimension: text("dimension").notNull(),
  direction: text("direction").notNull(),
  windowFrom: timestamp("window_from", { withTimezone: true }).notNull(),
  windowTo: timestamp("window_to", { withTimezone: true }).notNull(),
});

/** D-029: conflict requires ALL FOUR to intersect — subject, dimension, direction, window. */
export const contradictions = pgTable("contradictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  leftOpportunityId: uuid("left_opportunity_id").notNull().references(() => opportunities.id),
  rightOpportunityId: uuid("right_opportunity_id").notNull().references(() => opportunities.id),
  dimension: text("dimension").notNull(),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
  resolution: text("resolution"),
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

/* ========================================================================== */
/* Evidence gates. Pass / fail / UNESTABLISHED — never averaged, never scores. */
/* "Unestablished is never a pass." Treating unknown as equivalent is the      */
/* likeliest route to a manufactured saving.                                  */
/* ========================================================================== */

export const gateOutcome = pgEnum("gate_outcome", ["PASS", "FAIL", "UNESTABLISHED"]);

export const gateResults = pgTable("gate_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
  gate: text("gate").notNull(),
  outcome: gateOutcome("outcome").notNull(),
  detail: text("detail").notNull(),
});

/* ========================================================================== */
/* Decisions, approvals, outcomes. D-011 lifecycle, D-022 window, DP-07.     */
/* ========================================================================== */

export const decisions = pgTable("decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
  action: text("action").notNull(),
  rationale: text("rationale"),
  decidedBy: text("decided_by").notNull(),
  decidedAt: timestamp("decided_at", { withTimezone: true }).notNull().defaultNow(),
  /**
   * DP-07 / D-051: a currency claim needs an adjudicator INDEPENDENT of the
   * underlying decision. Where none exists, self-adjudication is permitted with
   * the conflict RECORDED as a factual condition affecting evidence strength —
   * represented, never hidden.
   */
  adjudicatorIndependent: boolean("adjudicator_independent"),
  independenceNote: text("independence_note"),
  /**
   * Who the adjudicator was checked AGAINST. Recorded so the independence claim
   * is auditable rather than asserted — a reviewer can see which parties were
   * considered, and (per Q-13) which could not be checked because the factory
   * does not record them.
   */
  checkedAgainst: text("checked_against").array(),
  evidenceRefs: text("evidence_refs").array(),
});

/**
 * D-011: the baseline is captured at APPROVED, never reconstructed at REALIZED —
 * and it is a SNAPSHOT OF INPUTS AND METHOD, not only an output, so it can be
 * recomputed to the same result. A stored number cannot be re-verified.
 */
export const baselines = pgTable("baselines", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  method: text("method").notNull(),
  inputs: jsonb("inputs").notNull(),
  output: jsonb("output").notNull(),
});

export const outcomes = pgTable("outcomes", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
  /** D-022: 12-month default verification window. A DIFFERENT twelve from rule 11's. */
  windowFrom: timestamp("window_from", { withTimezone: true }).notNull(),
  windowTo: timestamp("window_to", { withTimezone: true }).notNull(),
  measured: jsonb("measured"),
  /** D-022: a reduction is evidence of improvement, not automatically proof of causation. */
  confoundersConsidered: text("confounders_considered").array(),
  verifiedBy: text("verified_by"),
});

/* ========================================================================== */
/* Financial inputs. D-014 rule 10 as amended: source · owner · effective date */
/* · freshness · status · PURPOSE.                                            */
/* ========================================================================== */

export const financialRates = pgTable("financial_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  kind: text("kind").notNull(),
  rate: numeric("rate").notNull(),
  unit: text("unit").notNull(),
  source: text("source").notNull(),
  owner: text("owner").notNull(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  status: text("status").notNull(),
  /** STRUCTURED, not free text — a mechanism must be able to MATCH against it. */
  purpose: text("purpose").notNull(),
  basis: text("basis").notNull(),
});

/** F-07: rate HISTORY, effective-dated. Not a scalar. */
export const fxRates = pgTable(
  "fx_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromCurrency: text("from_currency").notNull(),
    toCurrency: text("to_currency").notNull(),
    rate: numeric("rate").notNull(),
    effectiveOn: date("effective_on").notNull(),
    source: text("source").notNull(),
    owner: text("owner").notNull(),
  },
  (t) => ({ uq: uniqueIndex("fx_uq").on(t.fromCurrency, t.toCurrency, t.effectiveOn) }),
);

/** D-008: imported cost reference. USER_DEFINED with an as_of. Never CALCULATED. */
export const costReferences = pgTable(
  "cost_references",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    itemId: uuid("item_id").notNull().references(() => items.id),
    unitCost: numeric("unit_cost").notNull(),
    currency: text("currency").notNull(),
    asOf: timestamp("as_of", { withTimezone: true }).notNull(),
    source: text("source").notNull(),
  },
  (t) => ({ idx: index("cost_ref_item_idx").on(t.itemId, t.asOf) }),
);

/* ========================================================================== */
/* Import — Phase 3. The original source is PRESERVED, never only parsed.     */
/* ========================================================================== */

export const importBatches = pgTable("import_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  filename: text("filename").notNull(),
  kind: text("kind").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull(),
  /** Rows the file contained, accepted, rejected. Reconciles to the row table. */
  rowsTotal: integer("rows_total").notNull().default(0),
  rowsAccepted: integer("rows_accepted").notNull().default(0),
  rowsRejected: integer("rows_rejected").notNull().default(0),
  /** Bible §47 / rule 16: demo data is STRUCTURALLY marked, never presented as real. */
  isDemo: boolean("is_demo").notNull().default(false),
});

export const importRows = pgTable(
  "import_rows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    batchId: uuid("batch_id").notNull().references(() => importBatches.id),
    rowNumber: integer("row_number").notNull(),
    /** The original cells, verbatim. Preserving the source is not optional. */
    raw: jsonb("raw").notNull(),
    outcome: text("outcome").notNull(),
    /** Actionable: field, what was wrong, what is required, and why it matters. */
    errors: jsonb("errors"),
    producedId: uuid("produced_id"),
  },
  (t) => ({ idx: index("import_rows_batch_idx").on(t.batchId, t.rowNumber) }),
);

/* ========================================================================== */
/* Audit — capability 11. Every number traces to what produced it.           */
/* ========================================================================== */

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id").references(() => sites.id),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    detail: jsonb("detail"),
  },
  (t) => ({ idx: index("audit_entity_idx").on(t.entityType, t.entityId) }),
);

/* ========================================================================== */
/* D-051 — MVP role model.                                                   */
/* ========================================================================== */

export const role = pgEnum("role", ["WAREHOUSE_OPERATOR", "INVENTORY_MANAGER", "BUYER", "ADJUDICATOR", "ADMINISTRATOR"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  roles: role("roles").array().notNull(),
  active: boolean("active").notNull().default(true),
});
