CREATE TYPE "public"."trip_status" AS ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled');--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_number" varchar(30) NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"source" varchar(255) NOT NULL,
	"destination" varchar(255) NOT NULL,
	"cargo_weight" numeric(10, 2) NOT NULL,
	"planned_distance" numeric(10, 2),
	"actual_distance" numeric(10, 2),
	"dispatch_date" timestamp,
	"completion_date" timestamp,
	"start_odometer" numeric(10, 2),
	"end_odometer" numeric(10, 2),
	"fuel_consumed" numeric(10, 2),
	"revenue" numeric(12, 2),
	"status" "trip_status" DEFAULT 'Draft' NOT NULL,
	"remarks" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "trips_trip_number_unique" UNIQUE("trip_number")
);
--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;