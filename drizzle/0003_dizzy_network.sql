ALTER TABLE "pg-drizzle_project" ADD COLUMN "working_days" text[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri"}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "pg-drizzle_project" ADD COLUMN "working_hours" json;--> statement-breakpoint
CREATE INDEX "project_working_days_idx" ON "pg-drizzle_project" USING btree ("working_days");