CREATE TYPE "public"."evidence_ladder" AS ENUM('OPPORTUNITY_DETECTED', 'ANNUALIZATION_ELIGIBLE', 'VERIFIED_REALIZATION');--> statement-breakpoint
CREATE TYPE "public"."evidence_strength" AS ENUM('EARLY', 'STRONG');--> statement-breakpoint
CREATE TYPE "public"."gate_outcome" AS ENUM('PASS', 'FAIL', 'UNESTABLISHED');--> statement-breakpoint
CREATE TYPE "public"."item_kind" AS ENUM('PROCESS_MATERIAL', 'DISCRETE_GOOD');--> statement-breakpoint
CREATE TYPE "public"."link_type" AS ENUM('CREATES', 'DEEPENS', 'MITIGATES');--> statement-breakpoint
CREATE TYPE "public"."location_kind" AS ENUM('STOCK', 'QUALITY_HOLD', 'SUPPLIER', 'CUSTOMER', 'PRODUCTION', 'SCRAP', 'ADJUSTMENT', 'IN_TRANSIT', 'OPENING_BALANCE');--> statement-breakpoint
CREATE TYPE "public"."opportunity_lifecycle" AS ENUM('POTENTIAL', 'APPROVED', 'IN_PROGRESS', 'REALIZED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."po_status" AS ENUM('DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('WAREHOUSE_OPERATOR', 'INVENTORY_MANAGER', 'BUYER', 'ADJUDICATOR', 'ADMINISTRATOR');--> statement-breakpoint
CREATE TYPE "public"."root_cause" AS ENUM('SUPPLIER_DELAY', 'INCORRECT_LEAD_TIME', 'LATE_PO_RELEASE', 'UNEXPECTED_DEMAND', 'PRODUCTION_CHANGE', 'STOCK_POLICY_ISSUE', 'MATERIAL_MASTER_ISSUE', 'LOGISTICS_CUSTOMS_ISSUE', 'QUALITY_REJECTION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."tracking_policy" AS ENUM('NONE', 'LOT', 'SERIAL');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"detail" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "balances" (
	"item_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"qty" numeric NOT NULL,
	"uom" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "baselines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"method" text NOT NULL,
	"inputs" jsonb NOT NULL,
	"output" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contradictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"left_opportunity_id" uuid NOT NULL,
	"right_opportunity_id" uuid NOT NULL,
	"dimension" text NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolution" text,
	"resolved_by" text,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cost_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"unit_cost" numeric NOT NULL,
	"currency" text NOT NULL,
	"as_of" timestamp with time zone NOT NULL,
	"source" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"rationale" text,
	"decided_by" text NOT NULL,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	"adjudicator_independent" boolean,
	"independence_note" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eta_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"eta_date" date NOT NULL,
	"basis" text DEFAULT 'FORECAST' NOT NULL,
	"source" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"missing_evidence" text NOT NULL,
	"factory_data_ref" text,
	"blocks" text NOT NULL,
	"observed_spend" jsonb,
	"data_owner" text,
	"raised_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expedite_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_line_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"root_cause" "root_cause",
	"root_cause_note" text,
	"classified_by" text,
	"premium_amount" numeric,
	"premium_currency" text,
	"premium_effective_on" date,
	"baseline_amount" numeric,
	"baseline_source" text,
	"shipment_id" uuid,
	"source_natural_key" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exposures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"subject_item_id" uuid,
	"subject_supplier_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"supersedes_exposure_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"rate" numeric NOT NULL,
	"unit" text NOT NULL,
	"source" text NOT NULL,
	"owner" text NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"status" text NOT NULL,
	"purpose" text NOT NULL,
	"basis" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "finding_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"exposure_id" uuid NOT NULL,
	"type" "link_type" NOT NULL,
	"note" text NOT NULL,
	"actioned_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fx_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_currency" text NOT NULL,
	"to_currency" text NOT NULL,
	"rate" numeric NOT NULL,
	"effective_on" date NOT NULL,
	"source" text NOT NULL,
	"owner" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gate_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"gate" text NOT NULL,
	"outcome" "gate_outcome" NOT NULL,
	"detail" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"kind" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"rows_total" integer DEFAULT 0 NOT NULL,
	"rows_accepted" integer DEFAULT 0 NOT NULL,
	"rows_rejected" integer DEFAULT 0 NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"raw" jsonb NOT NULL,
	"outcome" text NOT NULL,
	"errors" jsonb,
	"produced_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"kind" "item_kind" NOT NULL,
	"stock_uom" text NOT NULL,
	"integer_only" boolean DEFAULT false NOT NULL,
	"tracking_policy" "tracking_policy" DEFAULT 'NONE' NOT NULL,
	"catch_weight" boolean DEFAULT false NOT NULL,
	"nominal_uom" text,
	"lead_time_days" integer,
	"shelf_life_days" integer,
	"active" boolean DEFAULT true NOT NULL,
	"site_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"kind" "location_kind" NOT NULL,
	"parent_id" uuid,
	"counts_as_on_hand" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"from_location_id" uuid NOT NULL,
	"to_location_id" uuid NOT NULL,
	"nominal_qty" numeric NOT NULL,
	"nominal_uom" text NOT NULL,
	"actual_qty" numeric,
	"actual_uom" text,
	"lot_code" text,
	"serial_code" text,
	"effective_at" timestamp with time zone NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_document_type" text NOT NULL,
	"source_document_id" text NOT NULL,
	"reason_code" text NOT NULL,
	"actor" text NOT NULL,
	"source_natural_key" text,
	"cost_centre" text,
	"financial_dimensions" jsonb,
	"reverses_movement_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "observed_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"mechanism" text NOT NULL,
	"subject_item_id" uuid,
	"title" text NOT NULL,
	"amount" jsonb NOT NULL,
	"why_not_avoidable" text NOT NULL,
	"effective_as_of" timestamp with time zone NOT NULL,
	"materialised_from_exposure_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"mechanism" text NOT NULL,
	"subject_item_id" uuid,
	"subject_supplier_id" uuid,
	"title" text NOT NULL,
	"stated_intervention" text NOT NULL,
	"counterfactual" text NOT NULL,
	"root_cause" "root_cause",
	"lifecycle" "opportunity_lifecycle" DEFAULT 'POTENTIAL' NOT NULL,
	"evidence_strength" "evidence_strength",
	"ladder" "evidence_ladder" DEFAULT 'OPPORTUNITY_DETECTED' NOT NULL,
	"recurring_impact" jsonb,
	"one_time_impact" jsonb,
	"incremental_cost" jsonb,
	"net_impact" jsonb,
	"net_excludes_unvalued_risk" boolean DEFAULT false NOT NULL,
	"finding_owner" text,
	"action_owner" text,
	"data_owner" text,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_as_of" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"window_from" timestamp with time zone NOT NULL,
	"window_to" timestamp with time zone NOT NULL,
	"measured" jsonb,
	"confounders_considered" text[],
	"verified_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "po_line_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_line_id" uuid NOT NULL,
	"field" text NOT NULL,
	"from_value" text,
	"to_value" text,
	"changed_at" timestamp with time zone NOT NULL,
	"actor" text NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "po_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_id" uuid NOT NULL,
	"line_no" integer NOT NULL,
	"item_id" uuid NOT NULL,
	"ordered_qty" numeric NOT NULL,
	"uom" text NOT NULL,
	"unit_price" numeric NOT NULL,
	"currency" text NOT NULL,
	"promised_date" date,
	"expedited" boolean DEFAULT false NOT NULL,
	"freight_mode" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "port_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"milestone" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"location" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"number" text NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" "po_status" DEFAULT 'DRAFT' NOT NULL,
	"ordered_at" timestamp with time zone,
	"currency" text NOT NULL,
	"incoterm" text,
	"payment_terms_days" integer,
	"source_natural_key" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_line_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"nominal_qty" numeric NOT NULL,
	"nominal_uom" text NOT NULL,
	"actual_qty" numeric,
	"actual_uom" text,
	"movement_id" uuid,
	"shipment_id" uuid,
	"source_natural_key" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"supplier_id" uuid,
	"mode" text,
	"departed_at" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"freight_amount" numeric,
	"freight_currency" text,
	"freight_effective_on" date,
	"current_location" text,
	"status" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "signature_dimensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"dimension" text NOT NULL,
	"direction" text NOT NULL,
	"window_from" timestamp with time zone NOT NULL,
	"window_to" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"reporting_currency" text NOT NULL,
	CONSTRAINT "sites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier_item_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"lead_time_days" integer,
	"moq" numeric,
	"order_multiple" numeric,
	"incoterm" text,
	"payment_terms_days" integer,
	"currency" text,
	"effective_from" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"country" text,
	"city" text,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "suppliers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "uom_conversions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"from_uom" text NOT NULL,
	"to_uom" text NOT NULL,
	"factor" numeric NOT NULL,
	"effective_from" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"roles" "role"[] NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "balances" ADD CONSTRAINT "balances_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "balances" ADD CONSTRAINT "balances_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "baselines" ADD CONSTRAINT "baselines_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contradictions" ADD CONSTRAINT "contradictions_left_opportunity_id_opportunities_id_fk" FOREIGN KEY ("left_opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contradictions" ADD CONSTRAINT "contradictions_right_opportunity_id_opportunities_id_fk" FOREIGN KEY ("right_opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cost_references" ADD CONSTRAINT "cost_references_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "decisions" ADD CONSTRAINT "decisions_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eta_forecasts" ADD CONSTRAINT "eta_forecasts_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence_gaps" ADD CONSTRAINT "evidence_gaps_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expedite_events" ADD CONSTRAINT "expedite_events_po_line_id_po_lines_id_fk" FOREIGN KEY ("po_line_id") REFERENCES "public"."po_lines"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expedite_events" ADD CONSTRAINT "expedite_events_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exposures" ADD CONSTRAINT "exposures_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exposures" ADD CONSTRAINT "exposures_subject_item_id_items_id_fk" FOREIGN KEY ("subject_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exposures" ADD CONSTRAINT "exposures_subject_supplier_id_suppliers_id_fk" FOREIGN KEY ("subject_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_rates" ADD CONSTRAINT "financial_rates_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "finding_links" ADD CONSTRAINT "finding_links_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "finding_links" ADD CONSTRAINT "finding_links_exposure_id_exposures_id_fk" FOREIGN KEY ("exposure_id") REFERENCES "public"."exposures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gate_results" ADD CONSTRAINT "gate_results_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_batch_id_import_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locations" ADD CONSTRAINT "locations_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movements" ADD CONSTRAINT "movements_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movements" ADD CONSTRAINT "movements_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movements" ADD CONSTRAINT "movements_from_location_id_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movements" ADD CONSTRAINT "movements_to_location_id_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "observed_costs" ADD CONSTRAINT "observed_costs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "observed_costs" ADD CONSTRAINT "observed_costs_subject_item_id_items_id_fk" FOREIGN KEY ("subject_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_subject_item_id_items_id_fk" FOREIGN KEY ("subject_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_subject_supplier_id_suppliers_id_fk" FOREIGN KEY ("subject_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "po_line_changes" ADD CONSTRAINT "po_line_changes_po_line_id_po_lines_id_fk" FOREIGN KEY ("po_line_id") REFERENCES "public"."po_lines"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "po_lines" ADD CONSTRAINT "po_lines_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "po_lines" ADD CONSTRAINT "po_lines_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "port_milestones" ADD CONSTRAINT "port_milestones_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipts" ADD CONSTRAINT "receipts_po_line_id_po_lines_id_fk" FOREIGN KEY ("po_line_id") REFERENCES "public"."po_lines"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipts" ADD CONSTRAINT "receipts_movement_id_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."movements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signature_dimensions" ADD CONSTRAINT "signature_dimensions_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "supplier_item_terms" ADD CONSTRAINT "supplier_item_terms_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "supplier_item_terms" ADD CONSTRAINT "supplier_item_terms_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "uom_conversions" ADD CONSTRAINT "uom_conversions_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "balances_pk" ON "balances" USING btree ("item_id","location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cost_ref_item_idx" ON "cost_references" USING btree ("item_id","as_of");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fx_uq" ON "fx_rates" USING btree ("from_currency","to_currency","effective_on");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_rows_batch_idx" ON "import_rows" USING btree ("batch_id","row_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "items_site_code_uq" ON "items" USING btree ("site_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "locations_site_code_uq" ON "locations" USING btree ("site_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "movements_natural_key_uq" ON "movements" USING btree ("site_id","source_natural_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movements_item_effective_idx" ON "movements" USING btree ("item_id","effective_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movements_source_doc_idx" ON "movements" USING btree ("source_document_type","source_document_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "po_lines_uq" ON "po_lines" USING btree ("po_id","line_no");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "receipts_uq" ON "receipts" USING btree ("po_line_id","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sit_supplier_item_idx" ON "supplier_item_terms" USING btree ("supplier_id","item_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uom_conv_uq" ON "uom_conversions" USING btree ("item_id","from_uom","to_uom","effective_from");