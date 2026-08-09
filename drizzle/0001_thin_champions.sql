CREATE TABLE IF NOT EXISTS "detection_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"as_of" timestamp with time zone NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"mechanism" text NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opportunity_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"ref" text NOT NULL,
	"basis" text NOT NULL,
	"as_of" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "decisions" ADD COLUMN "checked_against" text[];--> statement-breakpoint
ALTER TABLE "decisions" ADD COLUMN "evidence_refs" text[];--> statement-breakpoint
ALTER TABLE "evidence_gaps" ADD COLUMN "run_id" uuid;--> statement-breakpoint
ALTER TABLE "evidence_gaps" ADD COLUMN "natural_key" text;--> statement-breakpoint
ALTER TABLE "evidence_gaps" ADD COLUMN "superseded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "evidence_gaps" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "run_id" uuid;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "natural_key" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "supersedes_id" uuid;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "superseded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "detection_runs" ADD CONSTRAINT "detection_runs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opportunity_evidence" ADD CONSTRAINT "opportunity_evidence_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opp_evidence_idx" ON "opportunity_evidence" USING btree ("opportunity_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence_gaps" ADD CONSTRAINT "evidence_gaps_run_id_detection_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."detection_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_run_id_detection_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."detection_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
