CREATE TYPE "public"."driver_status" AS ENUM('Available', 'On Trip', 'Off Duty', 'Suspended');--> statement-breakpoint
CREATE TYPE "public"."license_category" AS ENUM('LMV', 'HMV', 'MCWG', 'Transport', 'Heavy Transport');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"license_number" varchar(50) NOT NULL,
	"license_category" "license_category" NOT NULL,
	"license_expiry_date" date NOT NULL,
	"contact_number" varchar(20) NOT NULL,
	"email" varchar(100),
	"address" text,
	"emergency_contact" varchar(20),
	"safety_score" integer DEFAULT 100 NOT NULL,
	"status" "driver_status" DEFAULT 'Available' NOT NULL,
	"joining_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "drivers_license_number_unique" UNIQUE("license_number")
);
