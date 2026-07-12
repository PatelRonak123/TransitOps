CREATE TYPE "public"."maintenance_priority" AS ENUM('Low', 'Medium', 'High', 'Critical');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('Open', 'In Progress', 'Completed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."maintenance_type" AS ENUM('Oil Change', 'Engine Repair', 'Tyre Replacement', 'Battery', 'General Service', 'Brake Service', 'Accident Repair', 'Other');--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"maintenance_number" varchar(30) NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"maintenance_type" "maintenance_type" NOT NULL,
	"issue_title" varchar(255) NOT NULL,
	"description" text,
	"workshop_name" varchar(150),
	"technician_name" varchar(150),
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"priority" "maintenance_priority" NOT NULL,
	"status" "maintenance_status" DEFAULT 'Open' NOT NULL,
	"remarks" text,
	"start_date" date,
	"expected_completion_date" date,
	"completion_date" date,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "maintenance_logs_maintenance_number_unique" UNIQUE("maintenance_number")
);
--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;