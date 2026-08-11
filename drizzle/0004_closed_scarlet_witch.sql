ALTER TABLE "po_lines" ADD COLUMN "shipment_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "po_lines" ADD CONSTRAINT "po_lines_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
