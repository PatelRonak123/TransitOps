CREATE TYPE "public"."expense_type" AS ENUM('Fuel', 'Maintenance', 'Repair', 'Insurance', 'Registration', 'Parking', 'Toll', 'Driver Allowance', 'Cleaning', 'Tyre Replacement', 'Battery', 'Miscellaneous');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Paid', 'Pending');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expense_number" varchar(30) NOT NULL,
	"vehicle_id" uuid,
	"trip_id" uuid,
	"maintenance_id" uuid,
	"expense_type" "expense_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"amount" numeric(12, 2) NOT NULL,
	"expense_date" date NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" NOT NULL,
	"receipt_url" varchar(500),
	"vendor_name" varchar(150),
	"invoice_number" varchar(100),
	"remarks" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "expenses_expense_number_unique" UNIQUE("expense_number")
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_maintenance_id_maintenance_logs_id_fk" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;