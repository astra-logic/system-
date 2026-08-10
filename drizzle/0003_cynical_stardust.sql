CREATE TABLE IF NOT EXISTS "feasibility_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"asked_by" text NOT NULL,
	"asked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"product_item_id" uuid NOT NULL,
	"requested_qty" numeric NOT NULL,
	"need_by_date" date,
	"verdict" text NOT NULL,
	"answer" jsonb NOT NULL,
	"as_of" timestamp with time zone NOT NULL,
	"structure_as_of" timestamp with time zone NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"parent_item_id" uuid NOT NULL,
	"component_item_id" uuid NOT NULL,
	"quantity_per" numeric NOT NULL,
	"uom" text NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"source_natural_key" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feasibility_answers" ADD CONSTRAINT "feasibility_answers_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feasibility_answers" ADD CONSTRAINT "feasibility_answers_product_item_id_items_id_fk" FOREIGN KEY ("product_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_structures" ADD CONSTRAINT "product_structures_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_structures" ADD CONSTRAINT "product_structures_parent_item_id_items_id_fk" FOREIGN KEY ("parent_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_structures" ADD CONSTRAINT "product_structures_component_item_id_items_id_fk" FOREIGN KEY ("component_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feasibility_answers_asked_idx" ON "feasibility_answers" USING btree ("asked_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_structures_uq" ON "product_structures" USING btree ("parent_item_id","component_item_id","effective_from");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_structures_parent_idx" ON "product_structures" USING btree ("parent_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_structures_component_idx" ON "product_structures" USING btree ("component_item_id");