CREATE TYPE "public"."fuel_type" AS ENUM('Diesel', 'Petrol', 'CNG', 'Electric', 'Other');--> statement-breakpoint
CREATE TABLE "fuel_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fuel_log_number" varchar(30) NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"fuel_station" varchar(150),
	"fuel_type" "fuel_type" NOT NULL,
	"liters" numeric(10, 2) NOT NULL,
	"price_per_liter" numeric(10, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"odometer_reading" numeric(10, 2) NOT NULL,
	"fuel_efficiency" numeric(10, 2),
	"fuel_date" date NOT NULL,
	"remarks" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "fuel_logs_fuel_log_number_unique" UNIQUE("fuel_log_number")
);
--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;