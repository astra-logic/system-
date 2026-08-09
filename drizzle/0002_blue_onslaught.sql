CREATE TABLE IF NOT EXISTS "factory_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"ref" text NOT NULL,
	"key" text NOT NULL,
	"value" boolean NOT NULL,
	"source" text NOT NULL,
	"answered_by" text NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "factory_facts" ADD CONSTRAINT "factory_facts_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "factory_facts_uq" ON "factory_facts" USING btree ("site_id","key");